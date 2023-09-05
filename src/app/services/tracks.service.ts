import { Session } from '../models/Session';
import { Observable } from 'rxjs';

export interface TracksService {

    getSessions(trackId: String): Observable<Session[]>;
}
