import { BrowserSessionService } from '../services/browser-session.service';
import { HttpD365Helper } from './../helpers/d365/HttpD365Helper';
import { HttpRestHelper } from './../helpers/rest/HttpRestHelper';
import { InjectionToken } from '@angular/core';
import { HttpHelper } from './../helpers/HttpHelper';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AadB2CHelper } from 'src/app/helpers/AadB2CHelper';
import { HttpMockHelper } from '../helpers/mock/HttpMockHelper';

export const HTTP_HELPER = new InjectionToken<HttpHelper>('http.helper');

const httpHelperFactory = (httpClient: HttpClient, aadB2CHelper: AadB2CHelper) => {
    if (environment.useMockData) {
        return new HttpMockHelper(httpClient);
    }
    if (environment.useRestStack) {
        return new HttpRestHelper(httpClient, aadB2CHelper);
    } else {
        return new HttpD365Helper(httpClient);
    }
};

export let HttpHelperProvider = {
    provide: HTTP_HELPER,
    useFactory: httpHelperFactory,
    deps: [HttpClient, AadB2CHelper]
};
