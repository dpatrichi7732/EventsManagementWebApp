import {
    EVENT_SERVICE,
} from "./../../../providers/service.providers";
import { EventService } from "../../../services/event.service";
import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { Session } from "../../../models/Session";
import { LabelsService } from "../../../services/labels.service";
import { Observable, Subscription } from "../../../../../node_modules/rxjs";
import { map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { EventQueryParameterNames } from "../event.component";
import { SessionCartService } from "../session-cart/session-cart.service";
import { ActiveEventService } from "src/app/services/active-event.service";
import { Event } from "src/app/models/Event";
import { LocalizableError } from 'src/app/models/LocalizableError';
import { EventRouterService } from 'src/app/services/event-router.service';

@Component({
    selector: 'app-sessions',
    templateUrl: './sessions.component.html',
    styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit, OnDestroy {
    public error: LocalizableError;
    public allowSessionRegistrations: boolean;
    public sessionIdsInCart: Array<string>;

    readableEventId: string;
    sessions: Session[];
    sessionsByDay: any;
    dateKeys: string[];
    selectedDateKey: string;

    daysOfWeek: string[] = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    private subscriptions = new Array<Subscription>();
    private event: Event;

    constructor(
        private route: ActivatedRoute,
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private activeEventService: ActiveEventService,
        private sessionCartService: SessionCartService,
        private labelsService: LabelsService,
        private eventRouterService: EventRouterService
    ) { }

    ngOnInit() {
        this.subscribeToEventChange();
        this.subscribeToParentChange();
    }

    private subscribeToParentChange() {
        this.subscriptions.push(this.eventRouterService.session$.subscribe(
            sessions => {
                if (this.sessions === null) {
                    this.sessions = sessions;
                }
            }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    public addToCart(session: Session) {
        this.sessionCartService.addSession(this.readableEventId, session.id);
    }

    public removeFromCart(session: Session) {
        this.sessionCartService.removeSession(this.readableEventId, session.id);
    }

    /**
     * Registers the user to a session with the old session registration flow.
     * The old session registration flow is only available for paid events for logged-in users.
     */
    public registerToSession(session: Session): void {
        this.eventService
            .registerToSession(this.readableEventId, session.id)
            .subscribe(
                registrationCompleted => {
                    if (registrationCompleted) {
                        this.getSessions(false);
                    }
                },
                error => (this.error.message = error.message)
            );
    }

    private subscribeToEventChange() {
        const queryParamSubscription = this.route.queryParamMap.subscribe(
            paramMap => {
                this.readableEventId = paramMap.get(EventQueryParameterNames.ReadableEventId);
                this.getEventData();
            }
        );

        this.subscriptions.push(queryParamSubscription);
    }

    private async getEventData(): Promise<void> {
        this.event = await this.activeEventService.getEvent(this.readableEventId).toPromise();
        await this.getSessions(true);
        await this.setIsSessionCartAllowed().then(() => this.subscribeToSessionCartChange());
    }

    public canUserRegister() {
        if (this.event.setRegistrationEndDate) {
            return new Date(Date.now()) < new Date(this.event.stopRegistrationDate);
        }
        return true;
    }

    private async getSessions(isCachingAllowed: boolean = true): Promise<void> {
        try {
            this.sessions = await this.activeEventService.getSessions(this.readableEventId, isCachingAllowed).toPromise();

            if (this.sessions && this.sessions.length === 0) {
                this.eventRouterService.evaluateRoute();
            }

            this.sessionsByDay = {};
            this.dateKeys = [];

            this.generateSessionByDay();

            if (this.dateKeys.length > 0) {
                this.selectedDateKey = this.dateKeys[0];
            }
        } catch (error) {
            return console.error(error);
        }
    }

    private async setIsSessionCartAllowed(): Promise<void> {
        const isFreeEvent = await this.activeEventService.isFreeEvent(this.readableEventId);
        const hasSessions = await this.activeEventService.hasEventSessions(this.readableEventId);

        this.allowSessionRegistrations = this.sessionCartService.isSessionCartEnabledForEvent(
            this.event,
            isFreeEvent,
            hasSessions
        );
    }

    private subscribeToSessionCartChange() {
        this.sessionIdsInCart = this.sessionCartService.getSessionCartForEvent(this.readableEventId);
        this.sessionCartService.sessionCartChange.subscribe(sessionCart => this.sessionIdsInCart = sessionCart);
    }

    private handleErrorResponse(error: LocalizableError) {
        this.error = error;
    }

    private generateSessionByDay(): void {
        for (const session of this.sessions) {
            let startTime = new Date(session.startTime);
            const key = `${startTime.getMonth() +
                1}/${startTime.getDate()}/${startTime.getFullYear()}`;

            if (!this.sessionsByDay[key]) {
                this.sessionsByDay[key] = [];
                this.dateKeys.push(key);
            }

            this.sessionsByDay[key].push(session);
        }
    }

    private dateText(dateKey: string): Observable<string> {
        const date = new Date(dateKey);
        const day = this.daysOfWeek[date.getDay()];

        return this.labelsService.translateLabel(day).pipe(
            map(value => {
                return `${date.getMonth() + 1}/${date.getDate()}-${value}`;
            })
        );
    }
}
