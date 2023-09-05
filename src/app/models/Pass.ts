import { Session } from './Session';

export interface Pass {
    passId: string;
    passName: string;
    numberOfPassesLeft: number;
    numberOfPassesSold: number;
    price: number;
    currencySymbol: string;
    passesUsed: number;
    sessions: Array<Session>;
}
