import { AadB2CHelper } from 'src/app/helpers/AadB2CHelper';
import { EMPTY } from 'rxjs';
import { environment } from './../../environments/environment';
import { ExternalUrlResolver } from './external.url.resolver';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class ExternalLogoutUrlResolver extends ExternalUrlResolver implements Resolve<void> {

    constructor(private aadB2CHElper: AadB2CHelper) {
        super();
    }

    resolve(route: ActivatedRouteSnapshot) {
      if (environment.useAadB2C) {
        this.aadB2CHElper.logout();
      } else {
        this.redirectToExternalUrl('Account/Login/Logoff', route);
      }

      return EMPTY;
    }
}
