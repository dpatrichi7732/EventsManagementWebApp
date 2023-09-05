import { Building } from './Building';
import { Room } from './Room';
import { Speaker } from './Speaker';

export interface Session {
    alreadyRegistered: boolean;
    building: Building;
    camerasPermitted: number;
    detailedDescription: string;
    endTime: Date;
    endTimeUTC: Date;
    id: string;
    language: number;
    name: string;
    recordingsPermitted: number;
    room: Room;
    sessionFormat: number;
    sessionObjectives: string;
    sessionPreRequisites: string;
    sessionSummary: string;
    sessionType: number;
    startTime: Date;
    startTimeUTC: Date;
    timeZone: number;
    userEligibleToRegister: boolean;
    speakers: Speaker[];
    maxCapacity: number;
    isCapacityRestricted: boolean;
    registrationCount: number;
}
