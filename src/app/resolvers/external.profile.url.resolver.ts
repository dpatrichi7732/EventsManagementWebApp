import { EMPTY } from 'rxjs';
import { environment } from './../../environments/environment';
import { ExternalUrlResolver } from './external.url.resolver';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class ExternalProfileUrlResolver extends ExternalUrlResolver implements Resolve<void> {

    resolve(route: ActivatedRouteSnapshot) {
        if (!environment.useAadB2C) {
            this.redirectToExternalUrl('profile', route);
        }

        return EMPTY;
    }
}
