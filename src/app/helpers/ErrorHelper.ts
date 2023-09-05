import { ErrorResponse, ErrorResponseType } from 'src/app/models/ErrorResponse';
import { TranslationKeys } from '../constants/TranslationKeys';
import { LocalizableError } from '../models/LocalizableError';

export class ErrorHelper {
    public static getLocalizableErrorForErrorResponse(error: ErrorResponse): LocalizableError {
        if (error == null) {
            return this.getGenericCommunicationFailureError();
        }

        if (error.correlationId === '0') {
            return this.getRefreshPageError();
        }

        if (error.type == null || error.type === '') {
            return this.getGenericCommunicationFailureError();
        } else {
            return this.getErrorForErrorResponseType(error.type);
        }
    }

    public static getGenericCommunicationFailureError(): LocalizableError {
        return new LocalizableError(
            'There was an issue when communicating with the server.',
            TranslationKeys.CommunicationError
        );
    }

    public static getRefreshPageError(): LocalizableError {
        return new LocalizableError(
            'The session has expired. Please refresh the page to continue.',
            TranslationKeys.RefreshPage
        );
    }

    public static getAnonymousAccessNotAllowedError(): LocalizableError {
        return new LocalizableError(
            'You must sign-in in order to continue.',
            TranslationKeys.AnonymousAccessNotAllowedError
        );
    }

    private static getErrorForErrorResponseType(errorType: string): LocalizableError {
        switch (errorType) {
            case ErrorResponseType.EndpointNotFound:
            case ErrorResponseType.InternalServerError:
            case ErrorResponseType.OnlyHttpPostAllowed:
            case ErrorResponseType.OnlyHttpsAllowed:
                return this.getGenericCommunicationFailureError();
            case ErrorResponseType.AnonymousAccessNotAllowed:
                return this.getAnonymousAccessNotAllowedError();
        }
    }
}
