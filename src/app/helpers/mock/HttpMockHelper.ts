import { HttpHelper } from '../HttpHelper';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpMockHelper implements HttpHelper {
    constructor(private httpClient: HttpClient) {}

    public refreshPage: String;

    public get<T>(url: string, authenticationRequired = false): Observable<T> {
        url = `${url}/get.json`;
        return Observable.create(observer => {
            this.httpClient.get<T>(url).subscribe(observer);
        });
    }

    public post<T>(
        url: string,
        body: any,
        authenticationRequired = false
    ): Observable<T> {
        url = `${url}/post.json`;
        return Observable.create(observer => {
            this.httpClient.get<T>(url, body).subscribe(observer);
        });
    }
}
