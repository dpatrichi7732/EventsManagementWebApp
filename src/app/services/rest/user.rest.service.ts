import { HTTP_HELPER } from './../../providers/http.helper.provider';
import { environment } from './../../../environments/environment';
import { MyRegistration } from './../../models/MyRegistration';
import { WaitlistItem } from './../../models/WaitlistItem';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { User } from '../../models/User';
import { Observable, of, timer, merge, Subject } from 'rxjs';
import { map, flatMap, shareReplay, catchError } from 'rxjs/operators';
import { UserBaseService } from './../../../app/services/base/user.base.service';


@Injectable({
    providedIn: 'root'
})
export class UserRestService extends UserBaseService {

    private static readonly usersEndpoint: string = 'users';
    private static readonly timerPeriodInMillis: number = 15 * 60 * 1000; // 15 minutes

    private getLoggedInUserApiCall$: Observable<User>;

    private manualUpdateObserver: Subject<any> = new Subject();

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
        super();
        this.getLoggedInUserApiCall$ = merge(timer(0, UserRestService.timerPeriodInMillis), this.manualUpdateObserver)
        .pipe(
            flatMap(i => this.http.get<User>(`${environment.apiEndpoint}${UserRestService.usersEndpoint}/authenticated`, true)),
            catchError(error => of(UserBaseService.AnonymousUser)),
            shareReplay(1));
    }

    public refreshUser(): void {
        this.manualUpdateObserver.next();
    }

    public getLoggedInUser(): Observable<User> {
      return this.getLoggedInUserApiCall$;
    }

    public isLoggedIn(): Observable<boolean> {
        return this.getLoggedInUser().pipe(map(user => user != null && !user.isAnonymous));
    }

    public getRegistrationsForUser(): Observable<MyRegistration[]> {
        return this.http.get<MyRegistration[]>(
            `${environment.apiEndpoint}${UserRestService.usersEndpoint}/authenticated/registrations`, true
        );
    }

    public getWaitlistItemsForUser(): Observable<WaitlistItem[]> {
        return this.http.get<WaitlistItem[]>(`${environment.apiEndpoint}${UserRestService.usersEndpoint}/authenticated/waitlist-items`);
    }

    public cancelRegistration(registrationId: string): Observable<boolean> {
        return this.http.post<boolean>(
            `${environment.apiEndpoint}${UserRestService.usersEndpoint}/authenticated/registrations/${registrationId}/cancel`, {}, true
        );
    }
}
