import { CustomRegistrationFieldResponse } from "./CustomRegistrationFieldResponse";
import { AttendeeSessions } from './AttendeeSessions';

export interface Attendee {
    firstName: string;
    lastName: string;
    email: string;
    passId: string;
    waitlisted: boolean;
    autoRegister: boolean;
    responses: CustomRegistrationFieldResponse[];
    attendeeSessions: Array<AttendeeSessions>;
}
