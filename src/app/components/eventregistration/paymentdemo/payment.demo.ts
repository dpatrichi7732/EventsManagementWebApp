import { EVENT_SERVICE } from './../../../providers/service.providers';
import { FinalizeRegistrationRequest } from './../../../models/FinalizeRegistrationRequest';
import { HipObject } from './../../../models/HipObject';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Inject } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { BrowserSessionService } from '../../../services/browser-session.service';
import { TranslationKeys } from 'src/app/constants/TranslationKeys';
import { LocalizableError } from 'src/app/models/LocalizableError';

@Component({
  selector: 'app-payment-demo',
  templateUrl: './payment.demo.html',
  styleUrls: ['./payment.demo.scss']
})
export class PaymentDemoComponent implements OnInit {
  public error: LocalizableError;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      @Inject(EVENT_SERVICE) private eventService: EventService,
      private browserSessionService: BrowserSessionService,
    ) { }

  total: number;
  currencySymbol: string;

  registrationInProgress: boolean;

  private readableEventId: string;
  private purchaseId: string;

  ngOnInit() {
    this.total = this.browserSessionService.getRegistrationTotal();
    this.currencySymbol = this.route.snapshot.queryParams['currencySymbol'];
    this.purchaseId = this.route.snapshot.queryParams['purchaseId'];
    this.readableEventId = this.route.snapshot.queryParams['id'];
  }

  cancel(): void {
    this.router.navigate(['/event', this.readableEventId]);
  }

  finalizePurchase(): void {
    this.registrationInProgress = true;

    const requestData: FinalizeRegistrationRequest = {
        purchaseId: this.purchaseId,
        hipObject: this.browserSessionService.getCaptcha()
    };

    this.eventService.finalizeRegistration(this.readableEventId, requestData).subscribe(registrationResult => {
        if (registrationResult.status === 'Success') {
            this.router.navigate(['../confirmation'], {
                relativeTo: this.route,
                queryParams: {
                    id: this.readableEventId
                }
            });
        } else {
            this.error = new LocalizableError(registrationResult.errorMessage, TranslationKeys.RegistrationFailed);
        }
    }, (error: LocalizableError) => this.handleErrorResponse(error))
    .add(() => {
        this.registrationInProgress = false;
    });
  }

  private handleErrorResponse(error: LocalizableError) {
      this.error = error;
  }
}
