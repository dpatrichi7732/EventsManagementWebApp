import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
    selector: 'app-errormessage',
    templateUrl: './errormessage.component.html',
    styleUrls: ['./errormessage.component.scss']
})
export class ErrorMessageComponent {
    @Input()
    public serverErrorMessage: string;
    @Input()
    public errorMessageTranslationKey: string;
}
