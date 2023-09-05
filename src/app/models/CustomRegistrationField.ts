import { CustomRegistrationFieldResponse } from "./CustomRegistrationFieldResponse";

export class CustomRegistrationField {
    customRegistrationFieldId: string;
    text: string;
    /**
     * Note: the value field is not included in the data that is retrieved from the backend but is used to
     * create a two-way binding with ngModel when displaying the custom fields.
     */
    value: any;
    type: number;
    isRequired: boolean;
    /**
     * String representation of the possible choices. Each choice is separated by a '\u000a'.
     * Can be null (fields that does not have a choice).
     */
    choices: string;

    private readonly arrayItemSeparator = "\u000a";
    private readonly responseItemSeparator = ", ";
    private readonly booleanOptionYes = "Yes";
    private readonly booleanOptionNo = "No";
    private readonly booleanOptionNoChoice = "NoChoice";

    constructor(id?: string, text?: string, type?: number, isRequired?: boolean, choices?: string) {
        this.customRegistrationFieldId = id;
        this.text = text;
        this.type = type;
        this.isRequired = isRequired;
        this.choices = choices;
    }

    /**
     * Array representation of the possible choices.
     */
    get choicesArray(): string[] {
        if (!this.choices) {
            return null;
        }

        return this.choices.split(this.arrayItemSeparator);
    }

    set choicesArray(newChoices: string[]) {
        this.choices = newChoices.join(this.arrayItemSeparator);
    }

    /**
     * Returns the value (response of the user) of this custom field represented as string.
     * If the response contains multiple values (e.g. multiple choice), it is separated by ",".
     * If the response is for a boolean field, true is represented by the string 'Yes',
     * false by the string 'No' and undefined by the string'NoChoice'.
     * @returns The response of the user represented as string. Or null if there is no response.
     */
    get valueAsString(): string {
        let response = "";
        if (this.value === null) {
            return null;
        }

        switch (this.type) {
            case Types.Boolean:
                if (this.value === undefined) {
                    response = this.booleanOptionNoChoice;
                } else {
                    response = this.value;
                }
                break;

            case Types.SimpleText:
            case Types.SingleChoice:
                response = this.value;
                break;

            case Types.MultipleChoice:
                response = this.value == undefined ? this.value : this.value.join(this.responseItemSeparator);
                break;

            default:
                response = "";
        }
        return response;
    }

    get valueAsArray(): Array<string> {
        let response = new Array<string>();
        if (this.value === null) {
            return null;
        }

        switch (this.type) {
            case Types.MultipleChoice:
                response = this.value as Array<string>;
                break;
            case Types.Boolean:
            case Types.SimpleText:
            case Types.SingleChoice:
            default:
                return null;
        }
        return response;
    }

    set valueAsString(value: string) {
        if (value == null) {
            return;
        }

        switch (this.type) {
            case Types.Boolean:
                this.value = value;
                break;

            case Types.SimpleText:
            case Types.SingleChoice:
                this.value = value;
                break;

            case Types.MultipleChoice:
                this.value = value.split(this.responseItemSeparator);
                break;

            default:
                this.value = "";
        }
    }

    /**
     * Creates a response object of this custom field where the values are represented as string.
     * @returns The response of the user represented as string. Or null if there is no response.
     */
    public createResponse(): CustomRegistrationFieldResponse {
        if (this.valueAsString == null || this.valueAsString === this.booleanOptionNoChoice) {
            return null;
        }
        let response: CustomRegistrationFieldResponse = {
            id: this.customRegistrationFieldId,
            value: this.valueAsString ? this.valueAsString : '',
            values: this.valueAsArray ? this.valueAsArray : null
        };

        return response;
    }

    public createDeepCopy() {
        return new CustomRegistrationField(
            this.customRegistrationFieldId,
            this.text,
            this.type,
            this.isRequired,
            this.choices
        );
    }
}

export enum Types {
    SimpleText = 100000000,
    Boolean = 100000001,
    MultipleChoice = 100000002,
    SingleChoice = 100000003
}
