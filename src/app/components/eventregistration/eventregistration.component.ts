import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    EVENT_SERVICE,
    USER_SERVICE
} from './../../providers/service.providers';
import { CaptchaService } from './../../services/captcha.service';
import { Attendee } from '../../models/Attendee';
import { AttendeeSessions } from 'src/app/models/AttendeeSessions';
import { Event } from '../../models/Event';
import { Pass } from '../../models/Pass';
import { RegistrationData } from '../../models/RegistrationData';
import { HipObject } from '../../models/HipObject';
import * as CustomRegistrationFieldModel from '../../models/CustomRegistrationField';
import { EventService } from '../../services/event.service';
import { LabelsService } from '../../services/labels.service';
import { BrowserSessionService } from '../../services/browser-session.service';
import { AttendeeComponent } from './attendee/attendee.component';
import { UserService } from 'src/app/services/user.service';
import { ExternalLoginUrlResolver } from 'src/app/resolvers/external.login.url.resolver';
import { ActiveEventService } from 'src/app/services/active-event.service';
import { TranslationKeys } from 'src/app/constants/TranslationKeys';
import { LocalizableError } from 'src/app/models/LocalizableError';
import { CaptchaComponent } from 'src/app/components/eventregistration/captcha/captcha.component';
import { Session } from 'src/app/models/Session';
import { RegistrationService } from './registration.service';
import { RegistrationServiceFactory } from './registration-service.factory';
import { Observable } from 'rxjs';


export interface IFormHandler{
    onSubmitSuccessfull(event: any): void;
    onFormRegistrationLoad(event: any) : void;
    afterFormRegistrationLoaded(event: any): void;
    onSubmitEvent(event: any): void;
}

@Component({
    selector: 'app-eventregistration',
    templateUrl: './eventregistration.component.html',
    styleUrls: ['./eventregistration.component.scss']
})
export class EventRegistrationComponent implements OnInit, IFormHandler {
    @ViewChild(AttendeeComponent, { static: false}) attendeeComponent: AttendeeComponent;
    @ViewChild(CaptchaComponent, { static: false}) captchaComponent: CaptchaComponent;

    public cntActiveDataRetrievals : number = 0;
    public error: LocalizableError;
    public get canUserChooseAutoRegisterFunctionality$(): Observable<boolean> {
        return this.registrationService.canUserChooseAutoRegisterFunctionality$;
    }

    waitlisted: boolean;
    autoRegister: boolean;
    isSessionSelectionRequired: boolean;
    attendees: Attendee[];
    attendeeEditingCount: number;
    waitlistedAttendees: Attendee[];
    event: Event;
    sessions: Session[];
    sessionsInCart: Session[];
    passes: Pass[];
    registrationCount: number;
    readableEventId: string;
    registrationInProgress: boolean;
    customRegistrationFields: CustomRegistrationFieldModel.CustomRegistrationField[];
    isJapanese: boolean;

    private registrationService: RegistrationService;
    private readonly formValidStateString = 'VALID';
    private total = 0.0;
    private currencySymbol = '$';
    private formValidationStatus: string;
    private isUserLoggedIn: boolean;
    private formRegistrationLoaded: boolean;

    constructor(
        private activeEventService: ActiveEventService,
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private captchaService: CaptchaService,
        private route: ActivatedRoute,
        public router: Router,
        private labelsService: LabelsService,
        private browserSessionService: BrowserSessionService,
        @Inject(USER_SERVICE) private userService: UserService,
        private registrationServiceFactory: RegistrationServiceFactory,
        private changeDetectionRef: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        this.attendees = [];
        this.waitlistedAttendees = [];
        this.attendeeEditingCount = 0;
        this.formRegistrationLoaded = false;
    }

    async ngOnInit() {
        this.readableEventId = this.route.snapshot.queryParams['id'];
        
        this.registrationService = await this.registrationServiceFactory.create(this.readableEventId);

        this.loadData();

        this.labelsService.getLabelsModel().subscribe(labelsModel => {
            this.isJapanese = labelsModel.isJapanese;
        });

        this.userService.isLoggedIn().subscribe(isUserLoggedIn => {
            this.isUserLoggedIn = isUserLoggedIn;
        });

        this.subscribeToAttendees();
        this.waitlisted = this.showWaitlist();
        this.isSessionSelectionRequired = this.isSessionCartEnabled();
        this.sessionsInCart = this.getSessionsInCart();
    }

    public isSessionCartEnabled() {
        return this.event.allowCustomAgenda && !this.registrationService.isPaidEvent();
    }

    public isLoginProcessActive() {
        return ExternalLoginUrlResolver.isResolverActive();
    }

    public mustUserSignIn() {
        return !(this.event.allowAnonymousRegistrations || this.isUserLoggedIn);
    }

    public clearForms(): void {
        let selectorResults = document.querySelectorAll('.event-customregistrationsfields-container input');
        let selectorResult: any;
        let i: number;
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.value = '';
            selectorResult.dispatchEvent(new Event('input'));
        }

        selectorResults = document.querySelectorAll('.event-customregistrationsfields-container input:checked');
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.checked = false;
        }

        selectorResults = document.querySelectorAll('.event-customregistrationsfields-container select');
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.selectedIndex = 0;
        }
    }

    /**
     * Checks if the validation status of the attendee form (child view) is valid.
     */
    public isAttendeeFormValid(): boolean {
        return this.formValidationStatus === this.formValidStateString && this.attendeeComponent.areFormsValid();
    }

    public isFormRegistrationLoaded(): boolean {
        return true;
    }

    /**
     * Checks if the checkout button should be disabled.
     */
    public isCheckoutButtonDisabled(): boolean {
        // NOTE: order of if statements is very important for logic.
        if (this.registrationInProgress) {
            return true;
        }

        if (this.isAttendeeCountExceedingEventCapacity()) {
            return true;
        }

        if (this.isSessionSelectionRequired && this.sessionsInCart === undefined) {
            return true;
        }

        if (this.isAttendeeFormValid() && this.event.showWaitlist && this.hasAttendeeCountReachedEventCapacity()) {
            // Case: Event Full, 0 Event Attendees, 1 Waitlist attendee (did not press 'add another attendee')
            return false;
        }

        if (this.isAttendeeFormValid() && !this.hasAttendeeCountReachedEventCapacity()) {
            return false;
        }

        if (this.attendees.length === 0 && this.waitlistedAttendees.length === 0) {
            return true;
        }

        return false;
    }

    private async loadData() {
        await this.loadEvent();

        if (this.event) {
            if (this.event.allowCustomAgenda) {
                this.loadSessions();
            }
            
            this.loadEventRegistrationCount();

            if (this.event.registrationForm) {
                if (this.showRegistrationForm()) {
                    this.cntActiveDataRetrievals += 1;
                }
                return;
            }

            this.loadEventPasses();
        }

        this.loadCustomRegistrationFields();
    }

    private async loadEvent() {
        this.cntActiveDataRetrievals += 1;
        this.registrationService.event$.subscribe(
            event => {
                this.event = event;

                this.cntActiveDataRetrievals -= 1;
            },
            (error: LocalizableError) => this.handleDataRetrievalError(error)
        );
    }

    private loadSessions(): void {
        this.cntActiveDataRetrievals += 1;

        this.activeEventService.getSessions(this.readableEventId, false).subscribe(
                sessions => {
                    this.sessions = sessions;
                    this.cntActiveDataRetrievals -= 1;
                },
                (error: LocalizableError) => this.handleDataRetrievalError(error)
            );
    }

    private loadCustomRegistrationFields() {
        this.cntActiveDataRetrievals += 1;

        this.eventService.getCustomRegistrationFields(this.readableEventId).subscribe(
                customRegistrationFields => {
                    this.customRegistrationFields = [];
                    for (const customRegistrationField of customRegistrationFields) {
                        this.customRegistrationFields.push(
                            Object.assign(
                                new CustomRegistrationFieldModel.CustomRegistrationField(),
                                customRegistrationField
                            )
                        );
                    }
                    this.cntActiveDataRetrievals -= 1;
                },
                (error: LocalizableError) => this.handleDataRetrievalError(error)
            );
    }

    private loadEventPasses(): void {
        this.registrationService.passes$.subscribe(
            passes => {
                this.passes = passes;
                for (const pass of this.passes) {
                    pass.passesUsed = 0;
                }
            },
            (error: LocalizableError) => this.handleDataRetrievalError(error));
    }

    private loadEventRegistrationCount(): void {
        this.cntActiveDataRetrievals += 1;

        this.registrationService.eventRegistrationCount$.subscribe(
                registrationCount => {
                    this.registrationCount = registrationCount;

                    if (this.hasAttendeeCountReachedEventCapacity() && !this.event.showWaitlist) {
                        this.showEventCapacityReachedErrorMessage();
                    }

                    if (this.isAttendeeCountExceedingEventCapacity()) {
                        this.showEventCapacityExceedingErrorMessage();
                    }

                    this.cntActiveDataRetrievals -= 1;
                },
                (error: LocalizableError) => this.handleDataRetrievalError(error)
            );
    }

    public showRegistrationForm = () => {
        return !((this.hasAttendeeCountReachedEventCapacity() && !this.event.showWaitlist) || this.isAttendeeCountExceedingEventCapacity());
    }

    private handleDataRetrievalError(error: LocalizableError) {
        if (this.cntActiveDataRetrievals > 0) {
            this.cntActiveDataRetrievals -= 1;
        }

        this.handleErrorResponse(error);
    }

    private handleErrorResponse(error: LocalizableError) {
        this.error = error;
    }

    public showWaitlist(): boolean {
        if (!this.registrationService.isPaidEvent()) {
            return (
                this.event.showWaitlist &&
                this.event.isCapacityRestricted &&
                (this.hasAttendeeCountReachedEventCapacity() ||
                    this.waitlistedAttendees.length > 0)
            );
        }

        return this.event.showWaitlist && (this.allPassesSoldOut() || this.hasAttendeeCountReachedEventCapacity());
    }

    public isAllowedToCreateNewAttendee(): boolean {
        return !this.event.enableMultiAttendeeRegistration && this.attendees.length === 1;
    }

    public isAttendeeCountExceedingEventCapacity(): boolean {
        return this.registrationService.getAvailableEventCapacity() < 0;
    }

    public hasAttendeeCountReachedEventCapacity(): boolean {
        return this.registrationService.getAvailableEventCapacity() === 0;
    }

    private allPassesSoldOut(): boolean {
        for (const pass of this.passes) {
            if (pass.numberOfPassesLeft > pass.passesUsed) {
                return false;
            }
        }

        return true;
    }


    /**
     * Catch form notifications and localized errors
     */
    public catchNotificationFormError = (notification: any) => {
        if(notification !== null && notification.IsError === true){
            this.error = new LocalizableError(notification.Message, null);
            this.hideLoader();
        }
    }
    
    /**
     * Hides page loader and manually triggers angular change detection
     */
    public hideLoader(){
        this.cntActiveDataRetrievals = 0;
        this.changeDetectionRef.detectChanges();
    }

    /**
     * Method triggered on "formSubmit" event of marketing forms
     * Sets extra values for marketing forms such as candidate waitlisting, autoregister
     * and attendee session 
     */
    public onSubmitEvent(event: any) {
        event.setExtraValue("d365mktEvent_waitlisted", this.waitlisted);
        event.setExtraValue("d365mktEvent_autoRegister", this.autoRegister);
        
        event.setExtraValue("d365mktEvent_attendeeSessions", JSON.stringify(this.sessionsInCart));

        // if we have any active errors, clear them on submit and trigger change detection
        if(this.error) {
            this.error = null;
        }
        
        // NOTE : Uncommenting this line will result in creating a better user experience by starting
        // the loader whenever the submit button is executed. Keep commented until browser isssue is resolved
        this.cntActiveDataRetrievals += 1;
        this.changeDetectionRef.detectChanges();
    }

    /**
     * Method triggered on "onFormLoad" event of marketing forms
     * Registers form notification on error and prevents form loader to execute
     */
    public onFormRegistrationLoad(event: any) {
        event.setFormNotification(this.catchNotificationFormError);
        event.preventFormLoadingProgressBar();
    }

    /**
     * Method triggered on "afterFormLoad" event of marketing forms
     * After form has loaded, the loader becomes hidden 
     */
    public afterFormRegistrationLoaded(event: any) {
        this.hideLoader();
    }

    /**
     * Method triggered on "afterFormSubmit" event of marketing forms
     * This is triggered only on a successfull submission  
     */
    public onSubmitSuccessfull(event: any) {
        const _this = this;
        this.ngZone.run(() => {
            let redirectUrl = event.getRedirectUrl();
            if(redirectUrl && redirectUrl !== ""){
                window.location.href = redirectUrl;
                return;
            }
            this.hideLoader();
            this.router.navigate(['../confirmation'], {
                relativeTo: _this.route,
                queryParams: {
                    id: _this.event.readableEventId
                }
            });
        })
    }

    public addAttendee(attendee: Attendee, waitlisted: boolean): void {
        if (this.isAttendeeCountExceedingEventCapacity()) {
            this.showEventCapacityExceedingErrorMessage();
            return;
        }

        if (waitlisted) {
            this.waitlistedAttendees.push(attendee);
        } else {
            this.registrationService.addAttendee(attendee);
            this.clearForms();
        }

        if (this.isAttendeeCountExceedingEventCapacity()) {
            this.showEventCapacityExceedingErrorMessage();
        }

        if (this.hasAttendeeCountReachedEventCapacity()) {
            this.showEventCapacityReachedErrorMessage();
        }

        this.updateTotal(null, attendee.passId);
    }

    private getSessionsInCart(): Session[] {
        var attendeeSessions = undefined;
        if(this.registrationService.isSessionCartEnabled()) {
            this.registrationService.sessionsInCart$.subscribe(sessions => {
                attendeeSessions = sessions.map(session => {
                    let isSessionFull = false;
                    if (
                        session.registrationCount >= session.maxCapacity &&
                        session.isCapacityRestricted &&
                        this.event.showWaitlist
                    ) {
                        isSessionFull = true;
                    }

                    const attendeeSession: AttendeeSessions = {
                        sessionId: session.id,
                        waitlisted: isSessionFull
                    };

                    return attendeeSession;
                })
            });
        }
        return attendeeSessions;
    }

    private removeAttendee(attendee: Attendee, waitlisted: boolean): void {
        const index = this.findAttendeeIndex(attendee, waitlisted);
        if (index !== -1) {
            if (waitlisted) {
                this.waitlistedAttendees.splice(index, 1);
            } else {
                const removedPassId = this.attendees[index].passId;
                this.registrationService.removeAttendee(index);

                // Move the first waitlisted attendee to the registrants
                if (this.waitlistedAttendees.length > 0) {
                    if (this.registrationService.isPaidEvent()) {
                        /* for paid events we cannot just move the first waitlisted attendee to attendees
                      as there may be a conflict with passes try to find a waitlisted attendee that wants
                      to buy the same pass that the removed attendee had and move that one */
                        const idx = this.indexOfFirstWaitlistedAttendeeWithPassId(removedPassId);
                        if (idx !== -1) {
                            this.attendees.push(this.waitlistedAttendees[idx]);
                            this.waitlistedAttendees.splice(idx, 1);
                        }
                    } else {
                        // for unpaid events we can just move any of the waitlisted attendees
                        this.attendees.push(this.waitlistedAttendees[0]);
                        this.waitlistedAttendees.splice(0, 1);
                    }
                }
            }

            this.updateTotal(attendee.passId, null);
        }

        this.clearForms();
    }

    /**
     * Finds the index of the first waitlisted attendee with a specified pass
     * @param passId The pass id
     */
    private indexOfFirstWaitlistedAttendeeWithPassId(passId: string) {
        return this.waitlistedAttendees.findIndex(a => a.passId === passId);
    }

    /**
     * Event handler for the update attendee event of the attendee component
     * @param attendees An array of length 2, the first item being the attendee before the update operation,
     * the second is the attendee after the update
     * @param waitlisted Whether the attendee updated is in the waitlist or not
     */
    private updateAttendee(attendees: Attendee[], waitlisted: boolean): void {
        const index = this.findAttendeeIndex(attendees[0], waitlisted);
        if (index !== -1) {
            if (waitlisted) {
                this.waitlistedAttendees[index] = attendees[1];
            } else {
                const attendee = attendees[1];
                this.attendees[index] = attendee;
                this.clearForms();
            }

            this.updateTotal(attendees[0].passId, attendees[1].passId);
        }
    }

    private attendeeEditingStateChanged(newEditingState: boolean) {
        if (newEditingState) {
            this.attendeeEditingCount++;
        } else {
            if (this.attendeeEditingCount > 0) {
                this.attendeeEditingCount--;
            }
        }
    }

    /**
     * Finds the index of the attendee
     * @param attendee The attendee
     * @param waitlisted If true the waitlisted attendee list will be searched, otherwise the attendee list
     */
    private findAttendeeIndex(attendee: Attendee, waitlisted: boolean): number {
        return waitlisted
            ? this.waitlistedAttendees.findIndex(
                  a =>
                      a.firstName === attendee.firstName &&
                      a.lastName === attendee.lastName &&
                      a.email === attendee.email
              )
            : this.attendees.findIndex(
                  a =>
                      a.firstName === attendee.firstName &&
                      a.lastName === attendee.lastName &&
                      a.email === attendee.email
              );
    }

    private updateTotal(passIdToRemove: string, passIdToAdd: string): void {
        if (passIdToRemove != null) {
            this.total -= this.findPassValue(passIdToRemove);
        }

        if (passIdToAdd != null) {
            this.total += this.findPassValue(passIdToAdd);
        }
    }

    private findPassValue(passId: string): number {
        if (this.passes == null) {
            return 0.0;
        }
        const pass: Pass = this.passes.find(p => p.passId === passId);
        if (pass) {
            this.currencySymbol = pass.currencySymbol;
            return pass.price;
        } else {
            return 0.0;
        }
    }

    public async checkout(): Promise<void> {
        this.registrationInProgress = true;

        if (this.isAttendeeFormValid()) {
            this.attendeeComponent.confirmEdit();
        }

        if (this.isAttendeeCountExceedingEventCapacity()) {
            this.showEventCapacityExceedingErrorMessage();
            this.registrationInProgress = false;
            return;
        }

        const registrationResult = await this.createRegistrationData();
        this.registerToEvent(registrationResult);
    }

    private async createRegistrationData(): Promise<RegistrationData> {
        let hipObjectResult: HipObject = CaptchaService.EmptyHipObject;

        if (this.event.enableCaptcha) {
            hipObjectResult = this.captchaService.getHipObject();
        }

        if (this.registrationService.isPaidEvent()) {
            this.browserSessionService.setCaptcha(hipObjectResult);
        }

        if (this.isAttendeeFormValid()) {
            this.attendeeComponent.confirmEdit();
        }

        let attendeesToSend: Attendee[] = [];
        attendeesToSend = attendeesToSend.concat(this.attendees);
        attendeesToSend = attendeesToSend.concat(this.waitlistedAttendees);

        const registrationData: RegistrationData = {
            attendees: attendeesToSend,
            hipObject: hipObjectResult
        };

        if (!this.event.enableCaptcha) {
            registrationData.hipObject = undefined;
        }

        return registrationData;
    }

    private registerToEvent(registrationData: RegistrationData) {
        this.eventService
            .registerToEvent(this.readableEventId, registrationData)
            .subscribe(
                registrationResult => {
                    if (registrationResult.status === 'Success') {
                        this.router.navigate(['../confirmation'], {
                            relativeTo: this.route,
                            queryParams: {
                                id: this.event.readableEventId
                            }
                        });
                    } else if (registrationResult.status === 'Initiated') {
                        this.browserSessionService.setPurchaseId(registrationResult.purchaseId);
                        this.browserSessionService.setRegistrationTotal(this.total);
                        this.browserSessionService.setCurrency(this.currencySymbol);
                        this.router.navigate(['../payment'], {
                            relativeTo: this.route,
                            queryParams: {
                                id: this.event.readableEventId,
                                currencySymbol: this.currencySymbol,
                                purchaseId: registrationResult.purchaseId
                            }
                        });
                    } else if (registrationResult.status === 'Redirect') {
                        this.browserSessionService.setPurchaseId(registrationResult.purchaseId);
                        this.browserSessionService.setRegistrationTotal(this.total);
                        this.browserSessionService.setCurrency(this.currencySymbol);
                        window.location.href = registrationResult.redirectUrl;
                    } else {
                        let errorMessage = 'Event registration failed.';
                        let errorCode = TranslationKeys.RegistrationFailed;

                        if (registrationResult.errorMessage != null && registrationResult.errorMessage !== '') {
                            errorMessage = registrationResult.errorMessage;
                        }

                        if (registrationResult.errorCode != null && registrationResult.errorCode !== '') {
                            errorCode = registrationResult.errorCode;
                        }

                        this.error = new LocalizableError(errorMessage, errorCode);
                        this.registrationInProgress = false;
                        this.captchaComponent.reloadCaptcha();
                    }
                },
                (error: LocalizableError) => this.handleErrorResponse(error)
            )
            .add(() => {
                this.registrationInProgress = false;
            });
    }

    private showEventCapacityExceedingErrorMessage() {
        this.error = new LocalizableError(
            'You cannot register that many attendees because the maximum event capacity is already reached.',
            TranslationKeys.EventCapacityExceeding
        );
    }

    private showEventCapacityReachedErrorMessage() {
        this.error = new LocalizableError(
            'The events maximum capacity has been reached.',
            TranslationKeys.EventCapacityReached
        );
    }

    private autoregisterWaitlistItems(): boolean {
        return this.event.autoregisterWaitlistItems;
    }

    private changeFormValidationStatus(validationStatus) {
        this.formValidationStatus = validationStatus;
    }

    private async subscribeToAttendees() {
        this.registrationService.attendees$.subscribe(attendees => {
            this.attendees = attendees;
        });
    }
}

export enum EventCheckoutRoutePaths {
    REGISTRATION = "event/registration",
    CONFIRMATION = "event/confirmation",
    PAYMENT = "event/payment",
    SUCCESS_PAYMENT = "event/successpayment"
}
