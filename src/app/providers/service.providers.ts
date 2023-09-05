import { TracksRestService } from './../services/rest/tracks.rest.service';
import { TracksD365Service } from './../services/d365/tracks.d365.service';
import { UserRestService } from './../services/rest/user.rest.service';
import { EventRestService } from './../services/rest/event.rest.service';
import { EventD365Service } from './../services/d365/event.d365.service';
import { SessionRestService } from './../services/rest/session.rest.service';
import { SessionD365Service } from './../services/d365/session.d365.service';
import { InjectionToken } from '@angular/core';
import { HttpHelper } from './../helpers/HttpHelper';
import { UserD365Service } from './../services/d365/user.d365.service';
import { environment } from './../../environments/environment';
import { UserService } from './../services/user.service';
import { HTTP_HELPER } from 'src/app/providers/http.helper.provider';
import { SponsorshipsService } from '../services/sponsorships.service';
import { SponsorshipsRestService } from '../services/rest/sponsorships.rest.service';
import { SponsorsD365Service } from '../services/d365/sponsors.d366.service';

export const EVENT_SERVICE = new InjectionToken<UserService>('event.service');
export const SESSION_SERVICE = new InjectionToken<UserService>('session.service');
export const TRACKS_SERVICE = new InjectionToken<UserService>('tracks.service');
export const USER_SERVICE = new InjectionToken<UserService>('user.service');
export const SPONSORSHIPS_SERVICE = new InjectionToken<SponsorshipsService>('sponsors.service');

const eventServiceFactory = (httpHelper: HttpHelper) => {
    if (environment.useMockData) {
        environment.apiEndpoint = './assets/mocks/api/responses/';
    }

    if (environment.useRestStack) {
        return new EventRestService(httpHelper);
    } else {
        return new EventD365Service(httpHelper);
    }
};

const sessionServiceFactory = (httpHelper: HttpHelper) => {
    if (environment.useRestStack) {
        return new SessionRestService(httpHelper);
    } else {
        return new SessionD365Service(httpHelper);
    }
};

const tracksServiceFactory = (httpHelper: HttpHelper) => {
    if (environment.useRestStack) {
        return new TracksRestService(httpHelper);
    } else {
        return new TracksD365Service(httpHelper);
    }
};

const userServiceFactory = (httpHelper: HttpHelper) => {
    if (environment.useRestStack) {
        return new UserRestService(httpHelper);
    } else {
        return new UserD365Service(httpHelper);
    }
};

const sponsorshipsServiceFactory = () => {
    if (environment.useRestStack) {
        return new SponsorshipsRestService();
    } else {
        return new SponsorsD365Service();
    }
};

export let EventServiceProvider = {
    provide: EVENT_SERVICE,
    useFactory: eventServiceFactory,
    deps: [HTTP_HELPER]
};

export let SessionServiceProvider = {
    provide: SESSION_SERVICE,
    useFactory: sessionServiceFactory,
    deps: [HTTP_HELPER]
};

export let TracksServiceProvider = {
    provide: TRACKS_SERVICE,
    useFactory: tracksServiceFactory,
    deps: [HTTP_HELPER]
};

export let UserServiceProvider = {
    provide: USER_SERVICE,
    useFactory: userServiceFactory,
    deps: [HTTP_HELPER]
};

export let SponsorshipsServiceProvider = {
    provide: SPONSORSHIPS_SERVICE,
    useFactory: sponsorshipsServiceFactory,
};
