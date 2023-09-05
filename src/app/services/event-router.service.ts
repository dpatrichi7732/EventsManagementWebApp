import { Injectable } from '@angular/core';
import { Session } from '../models/Session';
import { Speaker } from '../models/Speaker';
import { Subject } from 'rxjs';
import { Pass } from '../models/Pass';
import { SessionTrack } from '../models/SessionTrack';

@Injectable()
export class EventRouterService {

  // Observable string sources
  private choosePathSource = new Subject<any>();
  private sessionTracksSource = new Subject<SessionTrack[]>();
  private speakersSource = new Subject<Speaker[]>();
  private passesSource = new Subject<Pass[]>();
  private sessionSource = new Subject<Session[]>();

  // Observable string streams
  choosePath$ = this.choosePathSource.asObservable();
  sessionTracks$ = this.sessionTracksSource.asObservable();
  speakers$ = this.speakersSource.asObservable();
  passes$ = this.passesSource.asObservable();
  session$ = this.sessionSource.asObservable();

  // Service message commands
  evaluateRoute() {
    this.choosePathSource.next();
  }

  emitSessionTracks(tracks: SessionTrack[]) {
    this.sessionTracksSource.next(tracks);
  }

  emitSpeakers(speakers: Speaker[]) {
    this.speakersSource.next(speakers);
  }

  emitPasses(passes: Pass[]) {
    this.passesSource.next(passes);
  }

  emitSessions(sessions: Session[]) {
    this.sessionSource.next(sessions);
  }
}
