import { Observable } from 'rxjs';

export interface HttpHelper {
  get<T>(url: string, authenticationRequired?: boolean): Observable<T>;

  post<T>(url: string, body: any, authenticationRequired?: boolean): Observable<T>;
}
