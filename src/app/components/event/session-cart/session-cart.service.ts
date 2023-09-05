import { Injectable, Output, EventEmitter } from "@angular/core";
import { Event } from "src/app/models/Event";

@Injectable()
export class SessionCartService {
    @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter();
    @Output() sessionCartChange: EventEmitter<Array<string>> = new EventEmitter();
    @Output() cntActiveAttendeeRegistrationsChange: EventEmitter<number> = new EventEmitter();

    private _isOpen = false;
    private sessionCarts: Map<string, Array<string>> = new Map();

    private readonly SESSION_CART_KEY_PREFIX = "session-cart-";

    public get isOpen(): boolean {
        return this._isOpen;
    }

    public set isOpen(isOpen: boolean) {
        this._isOpen = isOpen;
        this.isOpenChange.emit(isOpen);
    }

    public isSessionCartEnabledForEvent(event: Event, isFreeEvent: boolean, hasSessions: boolean): boolean {
        if (event == null) {
            return false;
        }
        return event.allowCustomAgenda && isFreeEvent && hasSessions;
    }

    public getSessionCartForEvent(readableEventId: string): Array<string> {
        this.loadCartFromLocalStorage(readableEventId);

        if (!this.sessionCarts.has(readableEventId)) {
            this.sessionCarts.set(readableEventId, new Array<string>());
        }

        return this.sessionCarts.get(readableEventId);
    }

    public addSession(readableEventId: string, sessionId: string) {
        if (!this.sessionCarts.has(readableEventId)) {
            this.sessionCarts.set(readableEventId, new Array<string>());
        }

        if (!this.isSessionInCart(readableEventId, sessionId)) {
            this.sessionCarts.get(readableEventId).push(sessionId);
            this.sessionCartChange.emit(Array.from(this.sessionCarts.get(readableEventId).values()));
        }

        this.saveCartToLocalStorage(readableEventId);
    }

    public removeSession(readableEventId: string, sessionId: string) {
        if (!this.sessionCarts.has(readableEventId)) {
            this.sessionCarts.set(readableEventId, new Array<string>());
        }

        if (this.isSessionInCart(readableEventId, sessionId)) {
            const index = this.sessionCarts.get(readableEventId).findIndex(id => id === sessionId);
            this.sessionCarts.get(readableEventId).splice(index, 1);

            this.sessionCartChange.emit(Array.from(this.sessionCarts.get(readableEventId).values()));
            }

        this.saveCartToLocalStorage(readableEventId);
    }

    private isSessionInCart(readableEventId, sessionId: string) {
        if (this.sessionCarts.has(readableEventId)) {
            return this.sessionCarts.get(readableEventId).findIndex(id => id === sessionId) >= 0;
        }

        return false;
    }

    public flushCart(readableEventId: string) {
        this.sessionCarts.get(readableEventId).splice(0);
        this.sessionCartChange.emit(Array.from(this.sessionCarts.get(readableEventId).values()));
        localStorage.removeItem(this.getLocalStorageKeyForEvent(readableEventId));
    }

    private saveCartToLocalStorage(readableEventId: string) {
        if (this.sessionCarts.has(readableEventId)) {
            localStorage.setItem(
                this.getLocalStorageKeyForEvent(readableEventId),
                JSON.stringify(this.sessionCarts.get(readableEventId))
            );
        }
    }

    private loadCartFromLocalStorage(readableEventId: string) {
        const isCartForEventInStorage = localStorage.hasOwnProperty(this.getLocalStorageKeyForEvent(readableEventId));

        if (isCartForEventInStorage) {
            const storageCart = localStorage.getItem(this.getLocalStorageKeyForEvent(readableEventId));
            this.sessionCarts.set(readableEventId, JSON.parse(storageCart));

            this.sessionCartChange.emit(this.sessionCarts.get(readableEventId));
        }
    }

    private getLocalStorageKeyForEvent(readableEventId: string) {
        return this.SESSION_CART_KEY_PREFIX + readableEventId;
    }
}
