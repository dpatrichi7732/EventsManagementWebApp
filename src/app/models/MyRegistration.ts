import { SessionRegistration } from './SessionRegistration';

export interface MyRegistration {
    id: string;
    contact: string;
    email: string;
    event: string;
    pass: string;
    createdon: Date;
    sessionRegistrations: SessionRegistration[];
}
