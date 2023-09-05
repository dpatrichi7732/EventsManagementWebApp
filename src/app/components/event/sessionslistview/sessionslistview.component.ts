import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Session } from "../../../models/Session";
import { ImageHelper } from "src/app/helpers/ImageHelper";
import { EventDetailSections } from '../event.component';
import { LabelsService } from 'src/app/services/labels.service';
import { Observable } from 'rxjs';
import { TimeDisplayConfig } from '../../../../assets/config/config';
import { DatePipe } from '@angular/common';
import { MsTimeZoneIndexValues } from "../../../constants/MSTimeZoneIndexValues";
import { environment } from "../../../../environments/environment";
import { DefaultDateFormats } from 'src/app/constants/DefaultDateFormats';
import { DateFormatter } from 'src/app/helpers/DateFormatter';

@Component({
    selector: "app-sessions-list-view",
    templateUrl: "./sessionslistview.component.html",
    styleUrls: ["./sessionslistview.component.scss"]
})
export class SessionsListViewComponent implements OnInit {
    @Input()
    readableEventId: string;

    @Input()
    sessions: Session[];

    /**
     * The IDs of the sessions that are in the cart.
     */
    @Input()
    sessionIdsInCart: string[];

    @Input()
    isEventWaitlisted = false;

    @Input()
    canUserRegister = true;

    @Input()
    eventTimezone = null;

    @Input()
    cntActiveAttendeeRegistrations = 0;

    /**
     * This event is fired when the user clicks register.
     * If no observers are available, the register button won't be displayed.
     */
    @Output()
    registerClicked = new EventEmitter<Session>();

    /**
     * This event is fired when the user clicks add to cart.
     * If no observers are available, the add to cart button won't be displayed.
     */
    @Output()
    addToCartClicked = new EventEmitter<Session>();


    /**
     * This event is fired when the user clicks remove from cart.
     * If no observers are available, the remove from cart button won't be displayed.
     */
    @Output()
    removeFromCartClicked = new EventEmitter<Session>();

    EventDetailSections = EventDetailSections;
    expandedSessions: String[];
    defaultImageUrl = "default_contact_image.png";
    private timeDisplayConfig: any;

    constructor(
        private imageHelper: ImageHelper,
        private labelsService: LabelsService,
        private datePipe: DatePipe) {
        this.expandedSessions = [];
    }

    ngOnInit() {
        this.timeDisplayConfig = TimeDisplayConfig;
    }

    public expandSession(session: Session) {
        const index = this.expandedSessions.findIndex(sessionId => sessionId === session.id);
        if (index !== -1) {
            this.expandedSessions.splice(index, 1);
        } else {
            this.expandedSessions.push(session.id);
        }
    }

    public isSessionExpanded(session: Session) {
        return (
            this.expandedSessions.find(sessionId => sessionId === session.id) !=
            null
        );
    }

    public isRegisterAllowed(session: Session): boolean {
        return session.userEligibleToRegister && this.registerClicked.observers.length > 0;
    }

    public register(session: Session) {
        this.registerClicked.emit(session);
    }

    public isAddToCartAllowed(): boolean {
        return this.addToCartClicked.observers.length > 0;
    }

    public addToCart(session: Session) {
        this.addToCartClicked.emit(session);
    }

    public isRemoveFromCartAllowed(session: Session): boolean {
        return this.removeFromCartClicked.observers.length > 0;
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }

    public removeFromCart(session: Session) {
        this.removeFromCartClicked.emit(session);
    }

    public isSessionRegistered(session: Session) {
        return this.sessionIdsInCart.find(id => id === session.id);
    }

    public showWaitlistBadge(session: Session): boolean {
        if (!this.isEventWaitlisted) {
            return false;
        }

        if (!session.isCapacityRestricted) {
            return false;
        }

        return session.registrationCount + this.cntActiveAttendeeRegistrations >= session.maxCapacity;
    }

    public showFullBadge(session: Session): boolean {
        if (this.isEventWaitlisted) {
            return false;
        }

        if (!session.isCapacityRestricted) {
            return false;
        }

        return session.registrationCount >= session.maxCapacity;
    }

    public getDateString(session: Session): string {
        let dateSettings = DateFormatter.getDateSettings();

        if(dateSettings.convertToLocalDate){
            return DateFormatter.formatRangedDate(this.datePipe, session.startTimeUTC, session.endTimeUTC);
        }
        else {
            return DateFormatter.formatRangedDate(this.datePipe, session.startTime, session.endTime, session.timeZone);
        }
    }
}
