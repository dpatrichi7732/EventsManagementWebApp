import { environment } from './../../environments/environment';
import { ActivatedRouteSnapshot } from '@angular/router';

export class ExternalUrlResolver {

    constructor() {
    }

    redirectToExternalUrl(externalSubroute: string, route: ActivatedRouteSnapshot) {
        const externalLoginBaseUrl = `/${externalSubroute}`;
        let returnUrl = '/';
        const eventId = route.queryParams['id'];
        if (eventId) {
            returnUrl = `${returnUrl}event?id=${eventId}`;
        }
        const externalLoginUrl = `${externalLoginBaseUrl}?returnUrl=${returnUrl}`;
        window.open(externalLoginUrl, '_self');
    }
}
