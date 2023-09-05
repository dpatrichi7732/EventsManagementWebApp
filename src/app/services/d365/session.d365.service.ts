import { SessionService } from 'src/app/services/session.service';
import { environment } from './../../../environments/environment';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTP_HELPER } from 'src/app/providers/http.helper.provider';

@Injectable()
export class SessionD365Service implements SessionService {

    private static readonly sessionsEndpoint: string = 'api/sessions';

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
    }

    public getSessionRegistrationCount(sessionId: string): Observable<number> {
        return this.http.get<number>(
            `${environment.apiEndpoint}${SessionD365Service.sessionsEndpoint}/registrationcount/?sessionId=${sessionId}`
        );
    }

}
