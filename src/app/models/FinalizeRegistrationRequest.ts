import { HipObject } from './HipObject';

export interface FinalizeRegistrationRequest {
    purchaseId: string;
    hipObject: HipObject;
}
