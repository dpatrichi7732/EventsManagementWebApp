import { Image } from "./Image";
import { Session } from "./Session";

export interface Speaker {
    about: string;
    accomplishments: string;
    blog: string;
    email: string;
    id: string;
    image: Image;
    imageUrl: string;
    linkedin: string;
    name: string;
    publications: string;
    title: string;
    twitter: string;
    website: string;
    sessions: Session[];
}
