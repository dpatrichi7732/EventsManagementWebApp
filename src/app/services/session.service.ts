import { Observable } from 'rxjs';

export interface SessionService {
    getSessionRegistrationCount(sessionId: string): Observable<number>;
}
