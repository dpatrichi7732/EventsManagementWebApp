import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef, Inject, NgModuleRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Attendee } from 'src/app/models/Attendee';
import { Pass } from '../../../models/Pass';
import { LabelsService } from '../../../services/labels.service';
import * as CustomRegistrationFieldModel from '../../../models/CustomRegistrationField';
import { CustomRegistrationFieldsComponent } from './custom-registration-fields/custom-registration-fields.component';
import { Observable } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from '../modal/modal.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[event-attendee]',
    templateUrl: './attendee.component.html',
    styleUrls: ['./attendee.component.scss']
})
export class AttendeeComponent implements OnInit, AfterViewInit {
    @Input() public readableEventId: string;
    @Input() attendee: Attendee; /* the attendee */
    @Input() passes: Pass[]; /* the event passes */

    /**
     * whether the component is in editing mode or read only mode
     */
    @Input()
    set editing(isEditing: boolean) {
        this._isEditing = isEditing;
        this.editingChange.emit(this._isEditing);
    }

    get editing(): boolean {
        return this._isEditing;
    }

    @Input() deleting: boolean; /* whether the component is in deleting mode or read only mode */
    /* whether the component is a placeholder, meaning it is in editing mode and it does not already represent an entry in the table */
    @Input() placeholder: boolean;
    @Input() waitlisted: boolean; /* whether this is an attendee in the waitlist */
    @Input() isJapanese: boolean; /* whether the language is japanese */
    @Input() autoregisterWaitlistItems: boolean; /* whether automatic registration for waitlisted items is enabled by default */
    @Input() enableAutoRegistrationSelection: boolean; /* whether the checkbox for automatic registration is enabled */
    @Input() customRegistrationFields: CustomRegistrationFieldModel.CustomRegistrationField[];
    @Input() canceledEditing: Function;
    @Input() showAddAnotherAttendee: boolean;
    @Input() hasWaitlistedSessions: boolean;

    @Output() editingChange = new EventEmitter<boolean>(); /* event emitted when the attendee data is updated */
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onSaved = new EventEmitter<Attendee[]>(); /* event emitted when the attendee data is updated */
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onDeleted = new EventEmitter<Attendee>(); /* event fired when the attendee is deleted */
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onAdded = new EventEmitter<Attendee>(); /* event fired when the attendee is added */
    /**
     * This event is triggered whenever the new attendee form is validated.
     */
    @Output() onValidationStatusChanged = new EventEmitter<string>();

    @ViewChild('firstName', { static: false}) firstName: ElementRef;
    @ViewChild('lastName', { static: false}) lastName: ElementRef;
    @ViewChild('attendeeForm', { static: false}) attendeeForm: NgForm;
    @ViewChild('removeAttendeeButton', { static: false}) removeAttendeeButton: ElementRef;
    @ViewChild('customRegistrationFieldsComponent', { static: false}) customRegistrationFieldsComponent: CustomRegistrationFieldsComponent;

    private _isEditing: boolean;
    private modalRef: NgbModalRef;

    public customRegistrationFieldsCopy: CustomRegistrationFieldModel.CustomRegistrationField[];
    private dummyAttendee: Attendee = {
        firstName: '',
        lastName: '',
        email: '',
        passId: '',
        waitlisted: this.waitlisted,
        autoRegister: false,
        responses: [],
        attendeeSessions: []
    };

    constructor(private labelsService: LabelsService, private modalService: NgbModal) {
    }

    open() {   
        this.modalRef = this.modalService.open(NgbdModalContent);   
        this.sendInputFieldsToModal();
        this.modalRef.result.then(result => {
            if (result === 'Close click' || result === 'Cross click') {
                this.removeAttendeeButton.nativeElement.focus();
            } else if (result === 'Action executed') {
                this.removeAttendee();
                return (this.isJapanese) ? document.getElementById('attendeesLastName').focus() : document.getElementById('attendeesFirstName').focus();            
            }
        });
      }

    sendInputFieldsToModal() {
        const modalsInput = this.modalRef.componentInstance;
        modalsInput.message = 'Are you sure you want to remove {0} {1}?';
        modalsInput.extraParams = this.formatName();
        modalsInput.messageTranslate = 'RemoveMessage';
        modalsInput.primaryButton = 'Remove';
        modalsInput.primaryButtonTranslate = 'Remove';
        modalsInput.secondaryButton = 'Cancel';
        modalsInput.secondaryButtonTranslate = 'Cancel';
        modalsInput.title = 'Remove attendee';
        modalsInput.titleTranslate = 'RemoveAttendee';    
    }

    formatName() {
        let completeName: string[] = [];
        completeName.push(this.attendee.firstName);
        (this.isJapanese) ? completeName.unshift(this.attendee.lastName) : completeName.push(this.attendee.lastName);
        return completeName;
    }

    ngOnInit() {
        if (!this.attendee) {
            this.setDummyAttendee();
        }
        
        this.customRegistrationFieldsCopy = this.createDeepCopyOfCustomRegistrationFields();
     }

    ngAfterViewInit() {
        this.subscribeToAttendeeFormChanges();
    }

    public confirmEdit(): void {
        const attendeeBefore = this.deepCloneAttendee(this.attendee);

        this.attendee = {
            firstName: this.attendeeForm.value.firstName,
            lastName: this.attendeeForm.value.lastName,
            email: this.attendeeForm.value.email,
            passId: this.attendeeForm.value.passId || '',
            waitlisted: this.waitlisted,
            autoRegister: this.attendeeForm.value.isAutoRegisterEnabled || false,
            responses: this.customRegistrationFieldsComponent.getCustomRegistrationFieldsResponses(),
            attendeeSessions: []
        };

        if (!this.placeholder && this.editing) {
            // existing attendee was updated
            this.editing = false;
            if (attendeeBefore.passId !== this.attendee.passId) {
                this.incrementPassesUsed(this.attendee.passId);
                this.decrementPassesUsed(attendeeBefore.passId);
            }
            this.onSaved.emit([attendeeBefore, this.attendee]);


        } else if (!this.placeholder && this.deleting) {
            // existing attendee was deleted
            this.deleting = false;
        } else {
            // attendee added
            if (this.attendee.passId) {
                this.incrementPassesUsed(this.attendee.passId);
            }

            this.onAdded.emit(this.attendee);

            this.resetNewAttendeeForms();
        }
    }

    /**
     * Checks if all forms (attendee form + custom registrations form) are valid.
     */
    public areFormsValid() {
        const attendeeFormValid = this.attendeeForm && this.attendeeForm.valid;
        const customRegistrationFieldsFormValid = this.customRegistrationFieldsComponent &&
            this.customRegistrationFieldsComponent.areRegistrationFieldsValid();

        if (this.customRegistrationFields == null || this.customRegistrationFields.length === 0) {
            return attendeeFormValid;
        } else {
            return attendeeFormValid && customRegistrationFieldsFormValid;
        }
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }

    public getCntOfWaitlistedSessionsForAttendee(): number {
        if (this.attendee == null || this.attendee.attendeeSessions == null || this.attendee.attendeeSessions.length === 0) {
            return 0;
        }

        return this.attendee.attendeeSessions.filter(as => as.waitlisted === true).length;
    }

    private resetNewAttendeeForms() {
        this.setDummyAttendee();

        this.attendeeForm.reset();
        this.customRegistrationFieldsComponent.resetForm();

        // angular sets the values to null on reset. we  we need to manually select the placeholder value for the pass dropdown
        if (this.attendeeForm.controls.passId) {
            this.attendeeForm.controls.passId.setValue('');
        }
    }

    private subscribeToAttendeeFormChanges() {
        if (this.attendeeForm) {
            this.attendeeForm.statusChanges.subscribe(result => {
                this.onValidationStatusChanged.emit(result);
            });
        }
    }

    private cancelEdit(): void {
        this.editing = false;
        this.canceledEditing();
    }

    public switchToEdit(attendee: Attendee): void {
        this.editing = true;
    }

    private removeAttendee(): void {
        this.deleting = true;
        if (this.attendee.passId) {
            this.decrementPassesUsed(this.attendee.passId);
        }
        this.onDeleted.emit(this.attendee);
    }

    private setDummyAttendee() {
        this.attendee = this.deepCloneAttendee(this.dummyAttendee);
    }

    private passDisplayString(passId: string): string {
        const pass = this.pass(passId);
        return `${pass.passName} (${pass.currencySymbol}${pass.price})`;
    }

    private pass(passId: string): Pass {
        const idx = this.passes.findIndex(p => p.passId === passId);
        return this.passes[idx];
    }

    private incrementPassesUsed(passId: string): void {
        this.pass(passId).passesUsed++;
    }

    private decrementPassesUsed(passId: string): void {
        this.pass(passId).passesUsed--;
    }

    private deepCloneAttendee(obj: Attendee): Attendee {
        return JSON.parse(JSON.stringify(obj)) as Attendee;
    }

    private createDeepCopyOfCustomRegistrationFields(): CustomRegistrationFieldModel.CustomRegistrationField[] {
        const customFieldsCopy: CustomRegistrationFieldModel.CustomRegistrationField[] = [];

        if (this.customRegistrationFields == null) {
            return [];
        }

        for (const customRegistrationField of this.customRegistrationFields) {
            customFieldsCopy.push(
                customRegistrationField.createDeepCopy()
            );
        }

        return customFieldsCopy;
    }

    private changeFocus() {
        if (this.isJapanese) {
            this.lastName.nativeElement.focus();
        } else {
            this.firstName.nativeElement.focus();
        }
    }
}
