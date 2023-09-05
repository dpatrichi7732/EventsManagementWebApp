import { Component, Input } from '@angular/core';
import { WaitlistItem } from 'src/app/models/WaitlistItem';
import { DatePipe } from '@angular/common';
import { DateFormatter } from 'src/app/helpers/DateFormatter';

@Component({
    selector: 'app-waitlist-item-card',
    templateUrl: './waitlist-item-card.component.html',
    styleUrls: ['./waitlist-item-card.component.scss']
})
export class WaitlistItemCardComponent {
    @Input()
    public waitlistItem: WaitlistItem;

    constructor(
        private datePipe: DatePipe
        ){}

    public formatDate(date) {
        return DateFormatter.formatDate(this.datePipe, date);
    }
}
