import { Directive, Input } from '@angular/core';

@Directive({
    selector: 'img[defaultSrc]',
    host: {
        '(error)':'updateUrl()',
        '[src]':'src'
    }
})
export class DefaultImage {
    @Input() src:string;
    @Input() defaultSrc:string;

    updateUrl() {
        if (this.src != this.defaultSrc) {
            this.src = this.defaultSrc;
        }
    }
}
