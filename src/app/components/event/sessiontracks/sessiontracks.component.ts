import { EventService } from "./../../../services/event.service";
import {
    EVENT_SERVICE,
    TRACKS_SERVICE
} from "./../../../providers/service.providers";
import { Component, OnInit, Input, Inject, OnDestroy } from "@angular/core";
import { SessionTrack } from "../../../models/SessionTrack";
import { Session } from "../../../models/Session";
import { TracksService } from "src/app/services/tracks.service";
import { ActivatedRoute } from '@angular/router';
import { EventQueryParameterNames } from '../event.component';
import { LocalizableError } from 'src/app/models/LocalizableError';
import { EventRouterService } from 'src/app/services/event-router.service';
import { Subscription } from 'rxjs';

@Component({
    selector: "app-sessiontracks",
    templateUrl: "./sessiontracks.component.html",
    styleUrls: ["./sessiontracks.component.scss"]
})
export class SessiontracksComponent implements OnInit, OnDestroy {
    public cntActiveDataRetrievals = 0;
    public error: LocalizableError;

    private eventRouterSubscription: Subscription;

    readableEventId: string;
    sessionTracks: SessionTrack[];
    selectedSessionTrackId: string;
    sessionsInSelectedTrack: Session[];

    constructor(
        private route: ActivatedRoute,
        @Inject(EVENT_SERVICE) private eventService: EventService,
        @Inject(TRACKS_SERVICE) private tracksService: TracksService,
        private eventRouterService: EventRouterService
    ) { }
    ngOnDestroy(): void {
        this.eventRouterSubscription.unsubscribe();
    }

    ngOnInit() {
        this.eventRouterSubscription = this.eventRouterService.sessionTracks$.subscribe(tracks => this.handleLoadSessionTracks(tracks));
        this.route.queryParamMap.subscribe(paramMap => {
            this.readableEventId = paramMap.get(EventQueryParameterNames.ReadableEventId);
            this.loadSessionTracks();
        });
    }

    handleLoadSessionTracks(tracks: SessionTrack[]): void {
        this.sessionTracks = tracks;

        if (this.sessionTracks.length === 0) {
            this.eventRouterService.evaluateRoute();
        }

        if (tracks.length > 0) {
            this.selectedSessionTrackId = tracks[0].id;
            this.loadSessionsInTrack(this.selectedSessionTrackId);
        }
    }

    private loadSessionTracks(): void {
        if (this.sessionTracks == null) {
            this.cntActiveDataRetrievals += 1;
            this.eventService.getSessionTracks(this.readableEventId).subscribe
                (tracks => {
                    this.handleLoadSessionTracks(tracks);
                    this.cntActiveDataRetrievals -= 1;
                },
                    (error: LocalizableError) => this.handleErrorResponse(error));
        }
    }

    private compareByStartTime(a: Session, b: Session): number {
        return a.startTime > b.startTime ? 1 : -1;
    }

    private compareByName(a: Session, b: Session): number {
        return b.name > a.name ? 1 : -1;
    }

    private loadSessionsInTrack(trackId: string): void {
        this.cntActiveDataRetrievals += 1;
        this.tracksService.getSessions(trackId).subscribe(
            sessions => {
                this.sessionsInSelectedTrack = sessions.sort(this.compareByName).sort(this.compareByStartTime);
                this.cntActiveDataRetrievals -= 1;
            },
            (error: LocalizableError) => this.handleErrorResponse(error)
        );
    }

    private handleErrorResponse(error: LocalizableError) {
        this.cntActiveDataRetrievals -= 1;
        this.error = error;
    }
}
