import { environment } from './../../../environments/environment';
import { MyRegistration } from './../../models/MyRegistration';
import { WaitlistItem } from './../../models/WaitlistItem';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { User } from '../../models/User';
import { Observable, of, timer } from 'rxjs';
import { map, flatMap, shareReplay, catchError } from 'rxjs/operators';
import { UserBaseService } from './../../../app/services/base/user.base.service';
import { HTTP_HELPER } from 'src/app/providers/http.helper.provider';

@Injectable()
export class UserD365Service extends UserBaseService {

    private static readonly usersEndpoint: string = 'api/users';
    private static readonly timerPeriodInMillis: number = 15 * 60 * 1000; // 15 minutes

    private getLoggedInUserApiCall$: Observable<User>;

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
        super();
        this.getLoggedInUserApiCall$ = timer(0, UserD365Service.timerPeriodInMillis)
        .pipe(
            flatMap(i => this.http.get<User>(`${environment.apiEndpoint}${UserD365Service.usersEndpoint}/authenticated/`)),
            catchError(error => of(UserBaseService.AnonymousUser)),
            shareReplay(1)
        );
    }

    public refreshUser(): void {
    }

    public getLoggedInUser(): Observable<User> {
      return this.getLoggedInUserApiCall$;
    }

    public isLoggedIn(): Observable<boolean> {
        return this.getLoggedInUser().pipe(map(user => user != null && !user.isAnonymous));
    }

    public getRegistrationsForUser(): Observable<MyRegistration[]> {
        return this.http.get<MyRegistration[]>(`${environment.apiEndpoint}${UserD365Service.usersEndpoint}/myregistrations/`);
    }

    public getWaitlistItemsForUser(): Observable<WaitlistItem[]> {
        return this.http.get<WaitlistItem[]>(`${environment.apiEndpoint}${UserD365Service.usersEndpoint}/mywaitlistitems/`);
    }

    public cancelRegistration(registrationId: string): Observable<boolean> {
        return this.http.post<boolean>(
            `${environment.apiEndpoint}${UserD365Service.usersEndpoint}/cancelregistration/`,
            { 'registrationId': registrationId }
        );
    }
}
