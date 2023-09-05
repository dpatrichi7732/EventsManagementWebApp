import { Component } from '@angular/core';
import { LabelsService } from 'src/app/services/labels.service';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

    constructor(
        private labelsService: LabelsService) {
    }

    public currentYear = new Date().getFullYear().toString();

    public translateLabelWithParams(): Observable<string> {
        var defaultValueForCopyRight = "Copyright © {0}. All rights reserved.";
        return this.labelsService.translateLabelWithParams('CopyrightWithParam', defaultValueForCopyRight, [this.currentYear]);
    }
}

