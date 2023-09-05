import { WaitlistItem } from './../../models/WaitlistItem';
import { UserService } from './../user.service';
import { MyRegistration } from './../../models/MyRegistration';
import { User } from '../../models/User';
import { Observable } from 'rxjs';

export abstract class UserBaseService implements UserService {

    public static readonly AnonymousUser: User =  {
        id: '',
        firstName: '',
        lastName: '',
        isAnonymous: true
    };

    constructor() {
    }

    public abstract  refreshUser(): void;

    public abstract getLoggedInUser(): Observable<User>;

    public abstract isLoggedIn(): Observable<boolean>;

    public abstract getRegistrationsForUser(): Observable<MyRegistration[]>;

    public abstract getWaitlistItemsForUser(): Observable<WaitlistItem[]>;

    public abstract cancelRegistration(registrationId: string): Observable<boolean>;
}
