import { EVENT_SERVICE } from './../../../providers/service.providers';
import { CaptchaService } from './../../../services/captcha.service';
import { EventService } from 'src/app/services/event.service';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { Captcha } from '../../../models/Captcha';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent implements OnInit {
    captcha: Captcha;
    @Input() readableEventId: string;

    constructor(@Inject(EVENT_SERVICE) private eventService: EventService) { }

    ngOnInit() {
        (<any>window.top).WLSPHIP0 = {
            error: 0,
            left: '0',

            showInstruction: false,
            getInstruction: function () { },
            showMenu: true,
            getMenu: function () { },
            showError: true,
            errorMessage: '',
            instructionsInside: true,
            getError: function () { },
            inputWidth: 245,
            done: false,
            holder: 'ms_captcha_holder',
            scriptHolder: 'ms_captcha_scriptholder',
            count: 0,
            type: 'visual',
            market: 'en-us',
            getSolution: function () { },
            reloadHIP: function () { },
            switchHIP: function () { },
            clientValidation: function () { },
            setError: function () { },
            setFocus: function () { },
            postLoad: function () { },
            verify: function (theCallback: any, param: any) { },
            verifyCallback: function (solution: any, token: any, param: any) {
                (<any>window.top).WLSPHIP0.clientValidation();
                if ((<any>window.top).WLSPHIP0.error !== 0) {
                    return;
                } else {
                    (<any>window.top).HipObject['Solution'] = solution;
                    (<any>window.top).HipObject['Token'] = token;
                    (<any>window.top).HipObject['Type'] = (<any>window.top).WLSPHIP0.type;
                    (<any>window.top).HipObject['FlowId'] = (<any>window.top).flowid;
                    return;
                }
            }
        };

        (<any>window.top).HipObject = { };

        this.loadCaptcha();
    }

    private loadCaptcha(): void {
        this.eventService.getCaptcha(this.readableEventId).subscribe(captcha => {
            this.captcha = captcha;

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = this.captcha.HipUrl;

            const element = document.getElementById('ms_captcha_scriptholder');
            if (element) {
                element.appendChild(script);
            }

            (<any>window.top).flowid = this.captcha.FlowId;
        }, error => console.error(error));
    }

    public reloadCaptcha(): void {
        this.loadCaptcha();
    }

}
