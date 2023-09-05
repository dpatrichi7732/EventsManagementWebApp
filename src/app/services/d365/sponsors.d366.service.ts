import { Injectable } from '@angular/core';
import { SponsorshipsService } from '../sponsorships.service';
import { Sponsorship } from 'src/app/models/Sponsorship';
import { environment } from 'src/environments/environment';

@Injectable()
export class SponsorsD365Service implements SponsorshipsService {
    /**
     * The default sponsor logo that is provided by portal.
     */
    public defaultLogoSrc = `${environment.apiEndpoint}default_sponsor_image.png`;

    getLogoSrc(sponsor: Sponsorship): String {
        if (sponsor == null || sponsor.image == null) {
            return this.defaultLogoSrc;
        }

        return `data:image/gif;base64,${sponsor.image}`;
    }
}
