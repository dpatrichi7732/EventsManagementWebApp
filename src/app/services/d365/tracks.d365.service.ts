import { environment } from './../../../environments/environment';
import { TracksService } from './../tracks.service';
import { Session } from '../../models/Session';
import { HttpHelper } from '../../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTP_HELPER } from 'src/app/providers/http.helper.provider';

@Injectable()
export class TracksD365Service implements TracksService {

    private static readonly tracksEndpoint: string = 'api/tracks';

    constructor(@Inject(HTTP_HELPER) private http: HttpHelper) {
    }

    public getSessions(trackId: String): Observable<Session[]> {
        return this.http.get<Session[]>(`${environment.apiEndpoint}${TracksD365Service.tracksEndpoint}/sessions/?trackId=${trackId}`);
    }
}
