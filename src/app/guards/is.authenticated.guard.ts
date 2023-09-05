import { USER_SERVICE } from './../providers/service.providers';
import { UserService } from './../services/user.service';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {

    constructor(@Inject(USER_SERVICE) private userService: UserService) {
    }

    canActivate(): Observable<boolean> {
        return this.userService.isLoggedIn();
    }
}
