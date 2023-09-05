import { HttpHelper } from './../HttpHelper';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpErrorResponse
} from '@angular/common/http';
import { ErrorResponse } from 'src/app/models/ErrorResponse';
import { ErrorHelper } from '../ErrorHelper';

@Injectable({
    providedIn: 'root'
})
export class HttpD365Helper implements HttpHelper {
    constructor(private httpClient: HttpClient) {}

    public get<T>(url: string, authenticationRequired = false): Observable<T> {
        return this.httpClient
            .get<T>(this.addTimestamp(url))
            .pipe(map(this.checkForError));
    }

    public post<T>(
        url: string,
        body: any,
        authenticationRequired = false
    ): Observable<T> {
        const httpOptions = this.buildHttpOptions();
        return this.httpClient
            .post<T>(this.addTimestamp(url), this.encodeBody(body), httpOptions)
            .pipe(map(value => this.checkForError(value)));
    }

    private extractValidationToken(): string {
        let validationToken = '';
        const metaTags = document.getElementsByTagName('meta');
        if (metaTags) {
            for (let i = 0; i < metaTags.length; i++) {
                const metaTag = metaTags[i];
                const nameAttribute = metaTag.getAttribute('name');
                const contentAttribute = metaTag.getAttribute('content');
                if (nameAttribute === 'token' && contentAttribute) {
                    validationToken = contentAttribute;
                }
            }
        }

        return validationToken;
    }

    private addTimestamp(url: string): string {
        const separator = url.indexOf('?') === -1 ? '?' : '&';
        return `${url}${separator}ts=${Date.now()}`;
    }

    private buildHttpOptions(): {} {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            validation: this.extractValidationToken()
        });

        return {
            headers: headers
        };
    }

    private encodeBody(body: any): string {
        return `json=${encodeURIComponent(JSON.stringify(body))}`;
    }

    private checkForError<T>(result: T): T {
        if ( result && typeof result === 'object' && 'error' in result && result['error']) {
            const errorResponse = result['error'] as ErrorResponse;

            console.error('API call resulted with an error.');
            console.error(errorResponse);

            const localizableError = ErrorHelper.getLocalizableErrorForErrorResponse(
                errorResponse
            );

            throw localizableError;
        } else {
            return result;
        }
    }
}
