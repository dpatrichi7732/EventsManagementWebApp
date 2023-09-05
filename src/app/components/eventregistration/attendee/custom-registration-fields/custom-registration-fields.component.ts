import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as CustomRegistrationFieldModel from '../../../../models/CustomRegistrationField';
import { CustomRegistrationFieldResponse } from "../../../../models/CustomRegistrationFieldResponse";

@Component({
    selector: 'app-custom-registration-fields',
    templateUrl: './custom-registration-fields.component.html',
    styleUrls: ['./custom-registration-fields.component.scss']
})
export class CustomRegistrationFieldsComponent implements OnInit {

    @Input()
    customRegistrationFields: CustomRegistrationFieldModel.CustomRegistrationField[];

    @Input()
    existingResponses: CustomRegistrationFieldResponse[];

    @ViewChild('customRegistrationFieldsForm', { static: false})

    customRegistrationFieldsForm: NgForm;

    private CustomRegistrationFieldTypes = CustomRegistrationFieldModel.Types;

    ngOnInit() {
        this.processExistingResponses();
    }

    /**
     * Checks if the custom registration fields are valid (and all required fields are filled).
     */
    public areRegistrationFieldsValid(): boolean {
        return this.customRegistrationFieldsForm == null || (this.customRegistrationFieldsForm != null && this.customRegistrationFieldsForm.valid);
    }

    /**
     * Resets the custom registration fields.
     */
    public resetForm() {
        this.customRegistrationFieldsForm.reset();
    }

    /**
     * Returns the valid, non-empty responses of the custom registration fields.
     * The value of the responses is represented as string.
     */
    public getCustomRegistrationFieldsResponses(): CustomRegistrationFieldResponse[] {
        let responses: CustomRegistrationFieldResponse[] = [];

        for (let customField of this.customRegistrationFields) {
            let response = customField.createResponse();

            if (response) {
                responses.push(response);
            }
        }

        return responses;
    }

    private processExistingResponses() {
        for (let response of this.existingResponses) {
            let relatedCustomField = this.customRegistrationFields.find(
                customRegistrationField => customRegistrationField.customRegistrationFieldId === response.id
            );

            relatedCustomField.valueAsString = response.value;
        }
    }

    private splitResponses(str: string): string[] {
        return str.split(', ');
    }
}
