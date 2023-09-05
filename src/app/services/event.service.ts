import { Captcha } from './../models/Captcha';
import { FinalizeRegistrationRequest } from './../models/FinalizeRegistrationRequest';
import { RegistrationResult } from '../models/RegistrationResult';
import { Sponsorship } from '../models/Sponsorship';
import { Speaker } from '../models/Speaker';
import { SessionTrack } from '../models/SessionTrack';
import { Session } from '../models/Session';
import { Pass } from '../models/Pass';
import { Event } from '../models/Event';
import { Observable } from 'rxjs';
import { RegistrationData } from '../models/RegistrationData';
import * as CustomRegistrationFieldModel from '../models/CustomRegistrationField';

export interface EventService {

    getPublishedEvents(): Observable<Event[]>;

    getEvent(readableEventId: string): Observable<Event>;

    getPasses(readableEventId: string): Observable<Pass[]>;

    getSessions(readableEventId: string): Observable<Session[]>;

    getSessionTracks(readableEventId: string): Observable<SessionTrack[]>;

    getSpeakers(readableEventId: string): Observable<Speaker[]>;

    getSponsors(readableEventId: string): Observable<Sponsorship[]>;

    getCaptcha(readableEventId: string): Observable<Captcha>;

    getCustomRegistrationFields(readableEventId: string): Observable<CustomRegistrationFieldModel.CustomRegistrationField[]>;

    getEventRegistrationCount(readableEventId: string): Observable<number>;

    registerToEvent(readableEventId: string, registrationData: RegistrationData): Observable<RegistrationResult>;

    finalizeRegistration(readableEventId: string, requestData: FinalizeRegistrationRequest): Observable<RegistrationResult>;

    registerToSession(readableEventId: string, sessionId: string): Observable<boolean>;
}
