import { Injectable, Inject } from "@angular/core";
import { Event } from "src/app/models/Event";
import { Session } from "src/app/models/Session";
import { Pass } from "src/app/models/Pass";
import { EVENT_SERVICE, SESSION_SERVICE } from "src/app/providers/service.providers";
import { EventService } from "src/app/services/event.service";
import { Observable, of } from "rxjs";
import { SessionService } from './session.service';

@Injectable({
    providedIn: "root"
})
export class ActiveEventService {
    private events: Map<string, Event>;
    private sessions: Map<string, Array<Session>>;
    private passes: Map<string, Array<Pass>>;

    constructor(
        @Inject(EVENT_SERVICE) private eventService: EventService,
        @Inject(SESSION_SERVICE) private sessionService: SessionService
    ) {
        this.events = new Map<string, Event>();
        this.sessions = new Map<string, Array<Session>>();
        this.passes = new Map<string, Array<Pass>>();
    }

    public getEvent(readableEventId: string): Observable<Event> {
        return Observable.create(observer => {
            // try to load from cache
            if (this.events.has(readableEventId)) {
                of(this.events.get(readableEventId)).subscribe(observer);
                return;
            }

            // fetch from server
            this.eventService
                .getEvent(readableEventId)
                .toPromise()
                .then(event => {
                    this.events.set(event.readableEventId, event);
                    of(event).subscribe(observer);
                }, error => observer.error(error));
        });
    }

    public getSessions(readableEventId: string, isCachingAllowed: boolean = true): Observable<Array<Session>> {
        return Observable.create(observer => {
            // try to load from cache
            if (isCachingAllowed && this.sessions.has(readableEventId)) {
                of(this.sessions.get(readableEventId)).subscribe(observer);
                return;
            }

            // fetch from server
            this.eventService
                .getSessions(readableEventId)
                .toPromise()
                .then(sessions => {
                    this.sessions.set(readableEventId, sessions);
                    of(sessions).subscribe(observer);
                }, error => observer.error(error));
        });
    }

    public getAndFilterSessions(readableEventId: string, isCachingAllowed: boolean = true, sessionIdsToInclude: Array<string> = null): Observable<Array<Session>> {
        const sessionsObservable = this.getSessions(readableEventId, isCachingAllowed);

        if (sessionIdsToInclude == null || sessionIdsToInclude.length === 0) {
            return Observable.create(observer => {
                of([]).subscribe(observer);
            });
        }

        return Observable.create(observer => {
            sessionsObservable.toPromise().then(sessions => {
                const filteredSessions = sessions.filter(session => sessionIdsToInclude.some(id => session.id === id));
                of(filteredSessions).subscribe(observer);
            }, error => observer.error(error));
        });
    }

    public getPasses(readableEventId: string): Observable<Array<Pass>> {
        return Observable.create(observer => {
            // try to load from cache
            if (this.passes.has(readableEventId)) {
                of(this.passes.get(readableEventId)).subscribe(observer);
                return;
            }

            // fetch from server
            this.eventService
                .getPasses(readableEventId)
                .toPromise()
                .then(passes => {
                    this.passes.set(readableEventId, passes);
                    of(passes).subscribe(observer);
                }, error => observer.error(error));
        });
    }

    public async isFreeEvent(readableEventId: string): Promise<boolean> {
        const passes = await this.getPasses(readableEventId).toPromise();
        if (passes == null) {
            return true;
        }

        return passes.length === 0;
    }

    public async hasEventSessions(readableEventId: string): Promise<boolean> {
        const sessions = await this.getSessions(readableEventId).toPromise();
        if (sessions == null) {
            return false;
        }

        return sessions.length > 0;
    }
}
