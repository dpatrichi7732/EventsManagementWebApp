import { Session } from 'src/app/models/Session';
import { ActiveEventService } from 'src/app/services/active-event.service';
import { SessionCartService } from '../event/session-cart/session-cart.service';
import { Attendee } from 'src/app/models/Attendee';
import { AttendeeSessions } from 'src/app/models/AttendeeSessions';
import { Event } from 'src/app/models/Event';
import { Pass } from 'src/app/models/Pass';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
/**
 * This service is supposed contain all business logic required for making a registration (event and session).
 * For now, it only contains the logic for session registration.
 * For the future we will extract all the business logic that is within the view components into
 * this service (or, if required multiple services).
 */
export class RegistrationService {
    /**
     * The event observable
     */
    public readonly event$ : Observable<Event>;
    
    /**
     * The event registration count observable
     */
    public readonly eventRegistrationCount$ : Observable<number>;

    /**
     * The event passes observable
     */
    public readonly passes$ : Observable<Pass[]>;

    /**
     * An observable of all attendee(s) that should be registered for the specified session(s).
     */
    public readonly attendees$: Observable<Attendee[]>;

    /**
     * An observable of all sessions that the attendee(s) should be registered to.
     */
    public readonly sessionsInCart$: Observable<Session[]>;

    /**
     * An observable that specifies whether the user should be able to choose enabling
     * the auto registration functionality or not.
     */
    public readonly canUserChooseAutoRegisterFunctionality$: Observable<boolean>;

    /**
     * The readable event ID for the event that the attendees should be registered for.
     */
    private readableEventId;

    private _attendees: BehaviorSubject<Attendee[]> = new BehaviorSubject([]);

    private _sessionsInCart: BehaviorSubject<Session[]> = new BehaviorSubject([]);

    private _canUserChooseAutoRegisterFunctionality: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * The event that the attendee(s) should be registered to.
     */
    private event: Event;

    /**
     * The number of registered attendees for the event.
     */
    private eventRegistrationCount: number;

    /**
     * The passes of the event. If passes are available, it means that the event is paid.
     */
    private passes: Array<Pass>;

    private subscriptions: Array<Subscription> = [];

    public sessions: Session[];
    public showSessions: Boolean;

    constructor(
        private eventService: EventService,
        private activeEventService: ActiveEventService,
        private sessionCartService: SessionCartService,
        readableEventId: string
    ) {
        this.readableEventId = readableEventId;
        this.event$ = this.activeEventService.getEvent(this.readableEventId);
        this.eventRegistrationCount$ = this.eventService.getEventRegistrationCount(this.readableEventId);
        this.passes$ = this.eventService.getPasses(this.readableEventId);
        this.attendees$ = this._attendees.asObservable();
        this.sessionsInCart$ = this._sessionsInCart.asObservable();
        this.canUserChooseAutoRegisterFunctionality$ = this._canUserChooseAutoRegisterFunctionality.asObservable();
    }

    /**
     * Retrieves and subscribes to all data that is required for a registration.
     */
    public async initializeRegistration() {
        await this.retrieveAndSubscribeToEvent();
        await this.retrieveAndSubscribeToEventRegistrationCount();
        await this.retrieveAndSubscribeToPasses();
        await this.retrieveAndSubscribeToSessionCart();
        try {
            this.sessions = await this.activeEventService.getSessions(this.readableEventId).toPromise();
            this.showSessions = this.sessions && this.sessions.length > 0;
        } catch {
            
        }
    }

    public addAttendee(attendeeToAdd: Attendee): void {
        this._attendees.getValue().push(attendeeToAdd);
        this.updateAllAttendeesSessionRegistrationData();
    }

    public removeAttendee(indexOfAttendeeToRemove: number): void {
        this._attendees.getValue().splice(indexOfAttendeeToRemove, 1);
        this.updateAllAttendeesSessionRegistrationData();
    }

    // NOTE: This logic does not really belong here. It should be within the event model.
    // However, as we currently have no separation between models and DTOs, all models are implemented as
    // interfaces. Therefore, it's currently not possible to move this logic to the model.
    public isPaidEvent(): boolean {
        if (this.event == null || this.passes == null) {
            return false;
        }

        return this.passes.length > 0;
    }

    /**
     * Specified whether the registration contains event or session waitlist items.
     */
    public isEventOrAnySessionFull(): boolean {
        if (this.isEventFull()) {
            return true;
        }

        if (this.isAnySessionFull()) {
            return true;
        }

        return false;
    }

    public isEventFull(): boolean {
        if (this.getAvailableEventCapacity() <= 0) {
            return true;
        }

        return false;
    }

    public isAnySessionFull(): boolean {
        const isAnySessionFull = this._sessionsInCart.getValue().filter(session => this.isSessionFull(session));

        return isAnySessionFull.length > 0;
    }

    /**
     * Returns the available capacity of the event. Attendees in checkout process are included.
     * If max capacity is not restricted, MAX_INT is returned.
     */
    public getAvailableEventCapacity(): number {
        if (!this.event.isCapacityRestricted) {
            return Number.MAX_SAFE_INTEGER;
        }

        return (
            this.event.maxCapacity -
            this.eventRegistrationCount -
            this._attendees.getValue().length
        );
    }

    public dispose(): void {
        this._sessionsInCart.complete();
        this._attendees.complete();

        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    /**
     * Updates the session information (e.g. is session waitlisted for certain attendee or not) for all attendees.
     * This function should always be triggered when there is a change in the number of attendees or sessions.
     */
    private updateAllAttendeesSessionRegistrationData(): void {
        if (!this.isSessionCartEnabled()) {
            // no need to update attendee registration data if session registration is not allowed.
            return;
        }

        const attendees = this._attendees.getValue();

        for (let i = 0; i < attendees.length; i++) {
            const attendee = attendees[i];

            attendee.attendeeSessions = this._sessionsInCart
                .getValue()
                .map(session => {
                    let isSessionFull = false;
                    if (
                        session.registrationCount + i >= session.maxCapacity &&
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
                });
        }

        this._attendees.next(attendees);
    }

    /**
     * Specifies whether the user is allowed to enable auto event registration functionality for waitlist or not.
     */
    private updateCanUserChooseAutoRegisterFunctionality(): void {
        if (!this.event.showAutomaticRegistrationCheckbox) {
            this._canUserChooseAutoRegisterFunctionality.next(false);
            return;
        }

        if (this.event.autoregisterWaitlistItems) {
            this._canUserChooseAutoRegisterFunctionality.next(false);
            return;
        }

        if (this.passes != null && this.passes.length > 0) {
            this._canUserChooseAutoRegisterFunctionality.next(false);
            return;
        }

        if (!this.isEventOrAnySessionFull()) {
            this._canUserChooseAutoRegisterFunctionality.next(false);
            return;
        }

        this._canUserChooseAutoRegisterFunctionality.next(true);
    }

    // Note: This function should be refactored to session model (as soon as there are models and not only DTOs).
    private isSessionFull(session: Session): boolean {
        if (!session.isCapacityRestricted) {
            return false;
        }

        if (session.registrationCount + this._attendees.getValue().length < session.maxCapacity ) {
            return false;
        }

        return true;
    }

    public isSessionCartEnabled(): boolean {
        return this.sessionCartService.isSessionCartEnabledForEvent(
            this.event,
            !this.isPaidEvent(),
            this._sessionsInCart.getValue().length > 0
        );
    }

    private async refreshSessionsInCart(sessionIds: string[]): Promise<void> {
        const sessionsInCart = await this.activeEventService.getAndFilterSessions(this.readableEventId, true, sessionIds).toPromise();
        this._sessionsInCart.next(sessionsInCart);

        this.updateAllAttendeesSessionRegistrationData();
    }

    private async retrieveAndSubscribeToEventRegistrationCount(): Promise<void> {
        const updateEventRegistrationCount = (eventRegistrationCount: number) => {
            this.eventRegistrationCount = eventRegistrationCount;
            this.updateCanUserChooseAutoRegisterFunctionality();
        };

        const subscription = this.eventRegistrationCount$.subscribe(updateEventRegistrationCount);

        this.subscriptions.push(subscription);
    }

    private async retrieveAndSubscribeToEvent(): Promise<void> {
        const updateEvent = (event: Event) => {
            this.event = event;
            this.updateCanUserChooseAutoRegisterFunctionality();
        };
        await this.event$.toPromise().then(updateEvent);
            
        const subscription = this.event$.subscribe(updateEvent);

        this.subscriptions.push(subscription);
    }

    private async retrieveAndSubscribeToPasses(): Promise<void> {
        const updatePasses = (passes: Pass[]) => {
            this.passes = passes;
            this.updateCanUserChooseAutoRegisterFunctionality();
        };

        await this.passes$.toPromise().then(updatePasses);
        
        const subscription = this.passes$.subscribe(updatePasses);

        this.subscriptions.push(subscription);
    }

    private async retrieveAndSubscribeToSessionCart(): Promise<void> {
        const updateSessionCart = async (sessionCart: string[]) => {
            await this.refreshSessionsInCart(sessionCart);
            this.updateCanUserChooseAutoRegisterFunctionality();
        };

        const sessionIdsInCart = this.sessionCartService.getSessionCartForEvent(this.readableEventId);
        await updateSessionCart(sessionIdsInCart);

        const subscription = this.sessionCartService
            .sessionCartChange
            .subscribe(updateSessionCart);

        this.subscriptions.push(subscription);
    }
}
