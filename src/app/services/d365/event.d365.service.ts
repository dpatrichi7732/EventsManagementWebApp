import { EventService } from 'src/app/services/event.service';
import { environment } from './../../../environments/environment';
import { FinalizeRegistrationRequest } from './../../models/FinalizeRegistrationRequest';
import { RegistrationResult } from '../../models/RegistrationResult';
import { Captcha } from '../../models/Captcha';
import { Sponsorship } from '../../models/Sponsorship';
import { Speaker } from '../../models/Speaker';
import { SessionTrack } from '../../models/SessionTrack';
import { Session } from '../../models/Session';
import { Pass } from '../../models/Pass';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { Event } from '../../models/Event';
import { Observable } from 'rxjs';
import { RegistrationData } from '../../models/RegistrationData';
import * as CustomRegistrationFieldModel from '../../models/CustomRegistrationField';
import { HTTP_HELPER } from 'src/app/providers/http.helper.provider';

@Injectable()
export class EventD365Service implements EventService {

    private static readonly eventsEndpoint: string = 'api/events';
    private static readonly usersEndpoint: string = 'api/users';

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
    }

    public getPublishedEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/published/`);
    }

    public getEvent(readableEventId: string): Observable<Event> {
        return this.http.get<Event>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/event/?readableEventId=${readableEventId}`
        );
    }

    public getPasses(readableEventId: string): Observable<Pass[]> {
        return this.http.get<Pass[]>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/passes/?readableEventId=${readableEventId}`
        );
    }

    public getSessions(readableEventId: string): Observable<Session[]> {
        return this.http.get<Session[]>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/sessions/?readableEventId=${readableEventId}`
        );
    }

    public getSessionTracks(readableEventId: string): Observable<SessionTrack[]> {
        return this.http.get<SessionTrack[]>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/tracks/?readableEventId=${readableEventId}`
        );
    }

    public getSpeakers(readableEventId: string): Observable<Speaker[]> {
        return this.http.get<Speaker[]>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/speakers/?readableEventId=${readableEventId}`
        );
    }

    public getSponsors(readableEventId: string): Observable<Sponsorship[]> {
        return this.http.get<Sponsorship[]>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/sponsors/?readableEventId=${readableEventId}`
        );
    }

    public getCaptcha(readableEventId: string): Observable<Captcha> {
        return this.http.get<Captcha>(`${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/captcha/`);
    }

    public getCustomRegistrationFields(readableEventId: string): Observable<CustomRegistrationFieldModel.CustomRegistrationField[]> {
        // tslint:disable-next-line:max-line-length
        const url = `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/customregistrationsfields/?readableEventId=${readableEventId}`;
        return this.http.get<CustomRegistrationFieldModel.CustomRegistrationField[]>(url);
    }

    public getEventRegistrationCount(readableEventId: string): Observable<number> {
        return this.http.get<number>(
            `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/registrationcount/?readableEventId=${readableEventId}`
        );
    }

    public registerToEvent(readableEventId: string, registrationData: RegistrationData): Observable<RegistrationResult> {
        const url = `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/register/?readableEventId=${readableEventId}`;
        return this.http.post<RegistrationResult>(url, registrationData);
    }

    public finalizeRegistration(readableEventId: string, requestData: FinalizeRegistrationRequest): Observable<RegistrationResult> {
        const url = `${environment.apiEndpoint}${EventD365Service.eventsEndpoint}/finalizeregistration/?readableEventId=${readableEventId}`;
        return this.http.post<RegistrationResult>(url, requestData);
    }

    public registerToSession(readableEventId: string, sessionId: string): Observable<boolean> {
        return this.http.post<boolean>(
            `${environment.apiEndpoint}${EventD365Service.usersEndpoint}/registertosession/`,
            {
                'readableEventId': readableEventId,
                'sessionId': sessionId
             }
        );
    }
}
