import { USER_SERVICE } from './../../providers/service.providers';
import { Component, OnInit, Inject, ɵConsole } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MyRegistration } from '../../models/MyRegistration';
import { WaitlistItem } from '../../models/WaitlistItem';
import { TranslationKeys } from 'src/app/constants/TranslationKeys';
import { LocalizableError } from 'src/app/models/LocalizableError';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from '../eventregistration/modal/modal.component';
import { DatePipe } from '@angular/common';
import { DateFormatter } from 'src/app/helpers/DateFormatter';

@Component({
  selector: 'app-myregistrations',
  templateUrl: './myregistrations.component.html',
  styleUrls: ['./myregistrations.component.scss']
})
export class MyRegistrationsComponent implements OnInit {
  public cntActiveDataRetrievals = 0;
  public error: Error;
  private modalRef: NgbModalRef;

  registrations: MyRegistration[];
  waitlistItems: WaitlistItem[];

  constructor(@Inject(USER_SERVICE) private userService: UserService, 
  private modalService: NgbModal,
  private datePipe: DatePipe) { }

  ngOnInit() {
    this.loadRegistrationsForUser();
    this.loadWaitlistItemsForUser();
  }

  private loadRegistrationsForUser(): void {
    this.cntActiveDataRetrievals += 1;

    this.userService.getRegistrationsForUser().subscribe(registrations => {
      this.registrations = registrations;
      this.cntActiveDataRetrievals -= 1;
    }, (error: LocalizableError) => this.handleErrorResponse(error));
  }

  private loadWaitlistItemsForUser(): void {
    this.cntActiveDataRetrievals += 1;
    this.userService.getWaitlistItemsForUser().subscribe(waitlistItems => {
        this.waitlistItems = waitlistItems;
        this.cntActiveDataRetrievals -= 1;
    }, (error: LocalizableError) => this.handleErrorResponse(error)
    );
  }

  public cancelRegistration(registrationId: string): void {
    this.cntActiveDataRetrievals += 1;
    this.userService.cancelRegistration(registrationId).subscribe(isRegistrationCanceled => {
      if (isRegistrationCanceled) {
        this.loadRegistrationsForUser();
        this.loadWaitlistItemsForUser();
        this.error = null;
      } else {
        this.error = new LocalizableError('An error occurred while cancelling the registration.', TranslationKeys.CancelRegistrationError);
      }
      this.cntActiveDataRetrievals -= 1;
    }, (error: LocalizableError) => this.handleErrorResponse(error)
    );
  }

  open(registration: MyRegistration, index: number) {   
    this.modalRef = this.modalService.open(NgbdModalContent);   
    this.sendInputFieldsToModal(registration.event);
    this.modalRef.result.then(result => {
        if (result === 'Close click' || result === 'Cross click') {
          const cancelButtonId = "cancelButton-" + index.toString();
          document.getElementById(cancelButtonId).focus();
        } else if (result === 'Action executed') {
            this.cancelRegistration(registration.id);    
        }
    });
  }

  sendInputFieldsToModal(event) {
    const modalsInput = this.modalRef.componentInstance;
    modalsInput.message = 'Are you sure you want to cancel registration for {0}?';
    modalsInput.extraParams = [event];
    modalsInput.messageTranslate = 'CancelRegistrationEventMessage';
    modalsInput.primaryButton = 'Submit';
    modalsInput.primaryButtonTranslate = 'Submit';
    modalsInput.secondaryButton = 'Cancel';
    modalsInput.secondaryButtonTranslate = 'Cancel';
    modalsInput.title = 'Cancel registration';
    modalsInput.titleTranslate = 'CancelRegistration';    
  }

  private handleErrorResponse(error: LocalizableError) {
    this.cntActiveDataRetrievals -= 1;
    this.error = error;
  }

  public formatDate(date) {
    return DateFormatter.formatDate(this.datePipe, date);
  }
}
