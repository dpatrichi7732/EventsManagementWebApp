import { environment } from 'src/environments/environment';
import { Captcha } from './../models/Captcha';
import { Observable } from 'rxjs';
import { HipObject } from './../models/HipObject';

export class CaptchaService {

    public static readonly EmptyHipObject: HipObject = {
        Solution: '',
        Token: '',
        Type: '',
        FlowId: ''
    };

    constructor() {
    }

    public getHipObject(): HipObject {
        let hipObjectResult = CaptchaService.EmptyHipObject;

        if ((<any>window.top).WLSPHIP0) {
            (<any>window.top).WLSPHIP0.verify(
                (<any>window.top).WLSPHIP0.verifyCallback,
                ''
            );
            if ((<any>window.top).WLSPHIP0.error !== 0) {
                (<any>window.top).WLSPHIP0.reloadHIP();
                return;
            }

            hipObjectResult = {
                Solution: (<any>window.top).HipObject['Solution'],
                Token: (<any>window.top).HipObject['Token'],
                Type: (<any>window.top).HipObject['Type'],
                FlowId: (<any>window.top).HipObject['FlowId']
            };
        }

        return hipObjectResult;
    }
}
