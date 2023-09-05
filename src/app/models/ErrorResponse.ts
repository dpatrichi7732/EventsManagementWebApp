export interface ErrorResponse {
    correlationId?: string;
    type: string;
    errorMessage: string;
    statusCode: number;
}

export enum ErrorResponseType {
    EndpointNotFound = 'EndpointNotFound',
    InternalServerError = 'InternalServerError',
    OnlyHttpPostAllowed = 'OnlyHttpPostAllowed',
    AnonymousAccessNotAllowed = 'AnonymousAccessNotAllowed',
    OnlyHttpsAllowed = 'OnlyHttpsAllowed'
}
