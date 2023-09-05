import { Injectable } from '@angular/core';
import { SponsorshipsService } from '../sponsorships.service';
import { environment } from 'src/environments/environment';
import { Sponsorship } from 'src/app/models/Sponsorship';

@Injectable()
export class SponsorshipsRestService implements SponsorshipsService {
    private static readonly sponsorshipsEndpoint: string = 'sponsorships';

    getLogoSrc(sponsor: Sponsorship): String {
        if (sponsor == null || sponsor.id == null || sponsor.id === '') {
            return '';
        }

        return `${environment.apiEndpoint}${SponsorshipsRestService.sponsorshipsEndpoint}/${sponsor.id}/logo`;
    }
}
