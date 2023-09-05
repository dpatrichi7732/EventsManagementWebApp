import { HTTP_HELPER } from './../../providers/http.helper.provider';
import { SessionService } from 'src/app/services/session.service';
import { environment } from './../../../environments/environment';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SessionRestService implements SessionService {
    private static readonly sessionsEndpoint: string = 'sessions';

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
    }

    public getSessionRegistrationCount(sessionId: string): Observable<number> {
        return this.http.get<number>(
            `${environment.apiEndpoint}${SessionRestService.sessionsEndpoint}/${sessionId}/registrations/count`
        );
    }
}
