import { AadB2CHelper } from 'src/app/helpers/AadB2CHelper';
import { environment } from './../../../environments/environment';
import { HttpHelper } from './../HttpHelper';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHelper } from '../ErrorHelper';

@Injectable({
    providedIn: 'root'
})
export class HttpRestHelper implements HttpHelper {
    constructor(
        private httpClient: HttpClient,
        private aadB2CHelper: AadB2CHelper) {
    }

    public get<T>(url: string, authenticationRequired = false): Observable<T> {
        const observable = Observable.create(observer => {
            this.buildHttpOptions(authenticationRequired).then(httpOptions => {
                this.httpClient.get<T>(this.addApplicationToken(url), httpOptions)
                    .pipe(catchError(this.handleError))
                    .subscribe(observer);
            });
        });

        return observable;
    }

    public post<T>(url: string, body: any, authenticationRequired = false): Observable<T> {
        const observable = Observable.create(observer => {
            this.buildHttpOptions(authenticationRequired).then(httpOptions => {
                this.httpClient.post<T>(this.addApplicationToken(url), body, httpOptions)
                    .pipe(catchError(this.handleError))
                    .subscribe(observer);
            });
        });
        return observable;
    }

    private addApplicationToken(url: string) {
        const separator = url.indexOf('?') !== -1 ? '&' : '?';
        return `${url}${separator}emApplicationtoken=${environment.emApplicationtoken}`;
    }

    private buildHttpOptions(authenticationRequired: boolean): Promise<{}> {

        const notAuthenticatedHttpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        const promise = new Promise((resolve, reject) => {
            const tokenHandler = accessToken => {
                if (accessToken && accessToken !== '') {
                    resolve({
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        })
                    });
                } else {
                    resolve(notAuthenticatedHttpOptions);
                }
            };

            if (!environment.useAadB2C) {
                resolve(notAuthenticatedHttpOptions);
            } else if (!authenticationRequired) {
                this.aadB2CHelper.aquireTokenSilent().then(tokenHandler, () => tokenHandler(''));
            } else {
                this.aadB2CHelper.aquireToken().then(tokenHandler, () => tokenHandler(''));
            }
        });
        return promise;
    }

    private handleError(errorResponse: HttpErrorResponse) {
        let errorMessage = '';
        if (errorResponse.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = errorResponse.error.message;
            console.error('An error occurred:', errorMessage);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${errorResponse.status}, ` +
              `body was: `);
            console.log(errorResponse.error);

            if (errorResponse.error) {
                errorMessage = errorResponse.error.Message;
            }
          }
          // return an observable with a user-facing error message
          if (errorMessage) {
            return throwError(new Error(errorMessage));
          } else {
            return throwError(ErrorHelper.getGenericCommunicationFailureError());
          }
    }
}
