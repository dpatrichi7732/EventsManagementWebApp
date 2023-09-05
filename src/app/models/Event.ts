import { Building } from "./Building";
import { Room } from "./Room";
import { Image } from "./Image";

export interface Event {
    allowAnonymousRegistrations: boolean;
    /**
     * Specifies if the event is allowed to have a custom agenda.
     * If the custom agenda is enabled, the user can register for certain sessions of an event.
     */
    allowCustomAgenda: boolean;
    autoregisterWaitlistItems: boolean;
    building: Building;
    description: string;
    enableCaptcha: boolean;
    endDate: Date;
    endDateUTC: Date;
    eventFormat: number;
    eventId: string;
    enableMultiAttendeeRegistration: boolean;
    eventLanguage: number;
    eventName: string;
    eventType: number;
    image: Image;
    maxCapacity: number;
    isCapacityRestricted: boolean;
    publicEventUrl: string;
    readableEventId: string;
    room: Room;
    showAutomaticRegistrationCheckbox: boolean;
    showWaitlist: boolean;
    startDate: Date;
    startDateUTC: Date;
    timeZone: number;
    timeZoneName: string;
    registrationForm: string;
    setRegistrationEndDate: boolean;
    stopRegistrationDate: Date;
    websiteMessage: string;
}
