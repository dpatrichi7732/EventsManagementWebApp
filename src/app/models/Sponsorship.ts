import { Image } from './Image';

export interface Sponsorship {
    description: string;
    id: string;
    image?: Image;       // this field is only exposed by the Portal API
    logoSrc?: String;   // this field is not exposed by the API
    sponsorId: string;
    sponsorName: string;
    sponsorshipTopic: string;
}
