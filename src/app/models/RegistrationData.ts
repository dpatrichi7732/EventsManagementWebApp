import { Attendee } from './Attendee';
import { HipObject } from './HipObject';

export interface RegistrationData {
    attendees: Attendee[];
    hipObject: HipObject;
}
