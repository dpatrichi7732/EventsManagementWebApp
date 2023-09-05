import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {
    public getItem(name: string): string {
        name = name + '=';
        const cookies = decodeURIComponent(document.cookie).split(';');

        const cookie = cookies.find(c => c.includes(name));

        if (cookie != null) {
            return cookie.split('=')[1];
        }

        return null;
    }

    public setItem(name: string, value: string): void {
        document.cookie = `${name}=${value}; path=/;`;
    }
}
