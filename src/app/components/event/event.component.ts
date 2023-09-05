import {
    EVENT_SERVICE,
} from "./../../providers/service.providers";
import { EventService } from "../../services/event.service";
import {
    Component,
    OnInit,
    Inject,
    OnDestroy
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Event } from "../../models/Event";
import { ImageHelper } from "../../helpers/ImageHelper";
import { environment } from "./../../../environments/environment";
import { LabelsService } from "src/app/services/labels.service";
import { SessionCartService } from "./session-cart/session-cart.service";
import { Session } from "src/app/models/Session";
import { ActiveEventService } from "src/app/services/active-event.service";
import { LocalizableError } from 'src/app/models/LocalizableError';
import { EventCheckoutRoutePaths } from "../eventregistration/eventregistration.component";
import { SessionTrack } from "../../models/SessionTrack";
import { Speaker } from "../../models/Speaker";
import { Pass } from '../../models/Pass';
import { time } from 'console';
import { MsTimeZoneIndexValues } from "../../constants/MSTimeZoneIndexValues";
import { TimeDisplayConfig } from '../../../assets/config/config';
import { DatePipe } from '@angular/common';
import { DefaultDateFormats } from "../../constants/DefaultDateFormats"
import { DateFormatter } from 'src/app/helpers/DateFormatter';
import { EventRouterService } from 'src/app/services/event-router.service';
import { Subscription } from 'rxjs';

@Component({
    selector: "app-event",
    templateUrl: "./event.component.html",
    styleUrls: ["./event.component.scss"]
})
export class EventComponent implements OnInit, OnDestroy {
    public EventDetailSections = EventDetailSections;
    public readableEventId: string;
    public event: Event;
    public sessions: Session[];
    public showSessions: Boolean;
    public showSpeakers: Boolean;
    public showSessionTracks: Boolean;
    public showPasses: Boolean;
    public selectedSection: EventDetailSections = EventDetailSections.Sessions;
    public isSessionCartCollapsed: Boolean = false;
    public isSessionCartAllowed: Boolean = false;
    public isLoadingData = false;
    public error: LocalizableError;
    public formattedDate: string;

    private defaultImageUrlSelfHosted = 'default-event-image.jpg';
    private defaultImageUrlCrmHosted = 'homehero.jpg';
    private dataPromise: Promise<any>;

    private eventRouterSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private eventRouterService: EventRouterService,
        private imageHelper: ImageHelper,
        private labelsService: LabelsService,
        private sessionCartService: SessionCartService,
        private activeEventService: ActiveEventService,
        private datePipe: DatePipe
    ) { }

    ngOnDestroy(): void {
        this.eventRouterSubscription.unsubscribe();
    }

    ngOnInit() {
        this.eventRouterSubscription = this.eventRouterService.choosePath$.subscribe(() => {
            this.chooseRoute();
        })
        this.route.queryParamMap.subscribe(paramMap => {
            this.readableEventId = paramMap.get(
                EventQueryParameterNames.ReadableEventId
            );

            this.dataPromise = this.getEventAndSessionData().then(async () => {
                const p4 = this.setIsSessionCartAllowed();

                const p1 = this.eventService.getSessionTracks(this.readableEventId).toPromise().then(
                    tracks => {
                        this.showSessionTracks = tracks && tracks.length > 0;
                        this.eventRouterService.emitSessionTracks(tracks);
                    }
                );
                const p2 = this.eventService.getSpeakers(this.readableEventId).toPromise().then(
                    speakers => {
                        this.showSpeakers = speakers && speakers.length > 0;
                        this.eventRouterService.emitSpeakers(speakers);
                    }
                );
                const p3 = this.eventService.getPasses(this.readableEventId).toPromise().then(
                    passes => {
                        this.showPasses = passes && passes.length > 0;
                        this.eventRouterService.emitPasses(passes);
                    }
                );

                await Promise.all([p1, p2, p3, p4]);
            });
        });

        this.sessionCartService.isOpen = false;
    }

    public chooseRoute() {
        this.dataPromise.then(p => {
            if (this.showSessions) {
                this.router.navigate(["event/sessions"], { queryParams: { id: this.readableEventId } });
            } else if (this.showSessionTracks) {
                this.router.navigate(["event/session-tracks"], { queryParams: { id: this.readableEventId } });
            } else if (this.showSpeakers) {
                this.router.navigate(["event/speakers"], { queryParams: { id: this.readableEventId } });
            } else if (this.showPasses) {
                this.router.navigate(["event/pass-information"], { queryParams: { id: this.readableEventId } });
            }
        })
    }

    public formatStartDate(): string {
        let dateSettings = DateFormatter.getDateSettings();

        if (dateSettings.convertToLocalDate) {
            return DateFormatter.formatDate(this.datePipe, this.event.startDateUTC);
        }
        else {
            return DateFormatter.formatDate(this.datePipe, this.event.startDate, this.event.timeZone);
        }
    }

    public getBannerImage() {
        if (this.event == null) {
            // This early exit avoids showing placeholder image while event isn't loaded.
            return '';
        }

        if (this.event.image != null) {
            return this.event.image;
        } else {
            if (environment.useRestStack === true) {
                return this.imageHelper.getImageUrl(this.defaultImageUrlSelfHosted);
            } else {
                return this.imageHelper.getImageUrl(this.defaultImageUrlCrmHosted);
            }
        }
    }

    public registerForSessions() {
        if (this.sessionCartService.getSessionCartForEvent(this.readableEventId).length !== 0) {
            this.router.navigate([EventCheckoutRoutePaths.REGISTRATION], { queryParams: { id: this.readableEventId } });
        } else {
            this.registerForAllSessions();
        }
    }

    public canUserRegister() {
        if (this.event.setRegistrationEndDate) {
            return new Date(Date.now()) < new Date(this.event.stopRegistrationDate);
        }
        return true;
    }

    private registerForAllSessions() {
        this.sessions.forEach(session => {
            this.sessionCartService.addSession(this.readableEventId, session.id);
        });

        this.sessionCartService.isOpen = true;
    }

    private async getEventAndSessionData(): Promise<void> {
        try {
            this.event = await this.activeEventService.getEvent(this.readableEventId).toPromise();
            this.sessions = await this.activeEventService.getSessions(this.readableEventId).toPromise();
            this.showSessions = this.sessions && this.sessions.length > 0;
            this.eventRouterService.emitSessions(this.sessions);

            this.formattedDate = this.formatStartDate();
        } catch (error) {
            this.error = error;
            console.error(error);
        }
    }

    private async setIsSessionCartAllowed(): Promise<void> {
        const isFreeEvent = await this.activeEventService.isFreeEvent(this.readableEventId);
        const hasSessions = await this.activeEventService.hasEventSessions(this.readableEventId);

        this.isSessionCartAllowed = this.sessionCartService.isSessionCartEnabledForEvent(
            this.event,
            isFreeEvent,
            hasSessions
        );
    }
}

export enum EventQueryParameterNames {
    ReadableEventId = "id",
    SpeakerId = "speakerId"
}

export enum EventDetailSections {
    Sessions = "sessions",
    SessionTracks = "session-tracks",
    Speakers = "speakers",
    PassInformation = "pass-information"
}
