import { Component, OnInit } from '@angular/core';
import { SessionCartService } from '../../event/session-cart/session-cart.service';
import { ActivatedRoute } from '@angular/router';
import { RegistrationServiceFactory } from '../registration-service.factory';
import { LabelsService } from '../../../services/labels.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
    private readableEventId: string;

    constructor(
        private route: ActivatedRoute,
        private cartService: SessionCartService,
        private labelsService: LabelsService,
        private registrationServiceFactory: RegistrationServiceFactory
    ) {}

    ngOnInit() {
        this.readableEventId = this.route.snapshot.queryParams['id'];

        this.cartService.flushCart(this.readableEventId);
        this.registrationServiceFactory.dispose(this.readableEventId);
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }
}
