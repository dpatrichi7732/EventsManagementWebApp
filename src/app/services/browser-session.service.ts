import { Injectable } from '@angular/core';
import { HipObject } from '../models/HipObject';

@Injectable()
export class BrowserSessionService {
    private readonly captchaKey: string = 'captcha';
    private readonly purchaseIdKey: string = 'purchase-id';
    private readonly totalKey: string = 'total';
    private readonly currencyKey: string = 'currency';

    private readonly guidRegex: RegExp = new RegExp('^\{?[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}\}?$', 'i');

    constructor() {
    }

    public setCaptcha(captcha: HipObject) {
      sessionStorage.setItem(this.captchaKey, JSON.stringify(captcha));
    }

    public getCaptcha(): HipObject {
        return JSON.parse(sessionStorage.getItem(this.captchaKey));
    }

    public setPurchaseId(purchaseId: string) {
        if (this.guidRegex.test(purchaseId)) {
          sessionStorage.setItem(this.purchaseIdKey, purchaseId);
        }
    }

    public getPurchaseId(): string {
        const purchaseId = sessionStorage.getItem(this.purchaseIdKey);
        if (this.guidRegex.test(purchaseId)) {
            return purchaseId;
        }

        return null;
    }

    public setRegistrationTotal(total: number) {
        if (!isNaN(parseInt(<any>total, 10))) {
          sessionStorage.setItem(this.totalKey, total.toString());
        }
    }

    public getRegistrationTotal(): number {
        return parseInt(sessionStorage.getItem(this.totalKey), 10);
    }

    public setCurrency(symbol: string) {
        if (encodeURIComponent(symbol)) {
          sessionStorage.setItem(this.currencyKey, symbol.toString());
        }
    }

    public getCurrency(): string {
        return decodeURIComponent(sessionStorage.getItem(this.currencyKey));
    }
}
