import { Sponsorship } from '../models/Sponsorship';

export interface SponsorshipsService {
    getLogoSrc(sponsorship: Sponsorship): String;
}
