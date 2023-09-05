import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Image } from '../models/Image';

@Injectable()
export class ImageHelper {

    constructor() {
    }

    public getImage(image: Image, imageUrl: string): string {
        if (image) {
            return `data:image/gif;base64,${image}`;
        } else {
            if (imageUrl != null) {
                return `${environment.apiEndpoint}${imageUrl}`;
            }
        }
    }

    public getImageUrl(imageRelativeUrl: string): string {
        if (environment.useRestStack === true) {
            return `${environment.imagesEndpoint}${imageRelativeUrl}`;
        } else {
            return `${environment.apiEndpoint}${imageRelativeUrl}`;
        }
    }
}
