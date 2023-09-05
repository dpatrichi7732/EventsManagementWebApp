import { Component, OnInit, Input } from "@angular/core";
import { SessionCartService } from "../../event/session-cart/session-cart.service";
import { Session } from "src/app/models/Session";
import { Event } from "src/app/models/Event";
import { ActiveEventService } from "src/app/services/active-event.service";
import { RegistrationService } from '../registration.service';
import { Attendee } from 'src/app/models/Attendee';
import { RegistrationServiceFactory } from '../registration-service.factory';
import { Observable } from 'rxjs';

@Component({
    selector: "app-session-selection",
    templateUrl: "./session-selection.component.html",
    styleUrls: ["./session-selection.component.scss"]
})
export class SessionSelectionComponent implements OnInit {
    @Input()
    public readableEventId: string;

    public isSessionCartEnabled: boolean;
    public sessionsInCart$: Observable<Session[]>;
    public attendees$: Observable<Attendee[]>;
    public event: Event;

    private registrationService: RegistrationService;

    constructor(
        private activeEventService: ActiveEventService,
        private sessionCartService: SessionCartService,
        private registrationServiceFactory: RegistrationServiceFactory
        ) {}

    async ngOnInit() {
        this.registrationService = await this.registrationServiceFactory.create(this.readableEventId);

        this.sessionsInCart$ = this.registrationService.sessionsInCart$;
        this.attendees$ = this.registrationService.attendees$;

        this.activeEventService.getEvent(this.readableEventId).subscribe(event => {
            this.event = event;
            this.setIsSessionCartAllowed();
        });
    }

    private async setIsSessionCartAllowed(): Promise<void> {
        const hasEventSessions = await this.activeEventService.hasEventSessions(this.readableEventId);
        const isFreeEvent = await this.activeEventService.isFreeEvent(this.readableEventId);

        this.isSessionCartEnabled = this.sessionCartService.isSessionCartEnabledForEvent(
            this.event,
            isFreeEvent,
            hasEventSessions
        );
    }
}
