import { MyRegistration } from './../models/MyRegistration';
import { WaitlistItem } from './../models/WaitlistItem';
import { User } from '../models/User';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface UserService {

    refreshUser(): void;
    
    getLoggedInUser(): Observable<User>;

    isLoggedIn(): Observable<boolean>;

    getRegistrationsForUser(): Observable<MyRegistration[]>;

    getWaitlistItemsForUser(): Observable<WaitlistItem[]>;

    cancelRegistration(registrationId: string): Observable<boolean>;
}
