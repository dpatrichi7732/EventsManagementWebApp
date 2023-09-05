export class LocalizableError extends Error {
    public localizationKey?: string;

    constructor(message: string, localizationKey: string) {
        super(message);
        this.localizationKey = localizationKey;
    }
}
