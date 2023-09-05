import { AadB2CHelper } from './../helpers/AadB2CHelper';
import { environment } from './../../environments/environment';
import { ExternalUrlResolver } from './external.url.resolver';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { UserService } from './../services/user.service';
import { USER_SERVICE } from 'src/app/providers/service.providers';
import { EMPTY } from 'rxjs';

@Injectable()
export class ExternalLoginUrlResolver extends ExternalUrlResolver implements Resolve<void> {
    private static isActive = false;

    constructor(private aadB2CHElper: AadB2CHelper, @Inject(USER_SERVICE) private userService: UserService) {
        super();
    }

    public static isResolverActive() {
        return ExternalLoginUrlResolver.isActive;
    }

    resolve(route: ActivatedRouteSnapshot) {
        ExternalLoginUrlResolver.isActive = true;

        if (environment.useAadB2C) {
            this.aadB2CHElper.login().then(() => this.userService.refreshUser()).then(() => ExternalLoginUrlResolver.isActive = false);
        } else {
            this.redirectToExternalUrl('SignIn', route);
            ExternalLoginUrlResolver.isActive = false;
        }

        return EMPTY;
    }
}
