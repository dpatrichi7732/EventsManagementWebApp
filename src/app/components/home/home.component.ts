import { EVENT_SERVICE } from './../../providers/service.providers';
import { EventService } from '../../services/event.service';
import { Component, Inject, OnInit } from '@angular/core';
import { Event } from '../../models/Event';
import { LocalizableError } from 'src/app/models/LocalizableError';
import { debounceTime } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { LabelsService } from 'src/app/services/labels.service';
import { TimeDisplayConfig } from '../../../assets/config/config';
import { DatePipe } from '@angular/common';
import { DateFormatter } from 'src/app/helpers/DateFormatter';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public allEvents: Event[];
    public filteredEvents: Event[];
    public isLoading: boolean;
    public error?: LocalizableError;
    private subject: Subject<string> = new Subject();
    private timeDisplayConfig: any;

    constructor(
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private labelsService: LabelsService,
        private datePipe: DatePipe) {
    }

    ngOnInit(): void {
        this.timeDisplayConfig = TimeDisplayConfig;
        this.loadPublishedEvents();
        this.subject.pipe(
            debounceTime(300)
        ).subscribe(searchTextValue => {
            this.handleSearch(searchTextValue);
        });
    }

    private loadPublishedEvents() {
        this.isLoading = true;
        this.eventService.getPublishedEvents().subscribe(
            events => {
                this.allEvents = events;
                this.filteredEvents = events;
                this.isLoading = false;
            },
            (error: LocalizableError) => this.handleErrorResponse(error)
        );
    }

    private handleErrorResponse(error: LocalizableError) {
        this.error = error;
        this.isLoading = false;
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }

    private getAreaLabel(event: Event): string {
        let date = this.getDateString(event);
        let building = event.building ? `at ${event.building.name}` : "";
        return `${event.eventName} on ${date} ${building}`;
    }

    public getDateString(event: Event): string {
        let dateSettings = DateFormatter.getDateSettings();

        if(dateSettings.convertToLocalDate){
            return DateFormatter.formatRangedDate(this.datePipe, event.startDateUTC, event.endDateUTC);
        }
        else{
            return DateFormatter.formatRangedDate(this.datePipe, event.startDate, event.endDate, event.timeZone);
        }
    }

    handleSearch(searchText: string) {
        if (searchText) {
            searchText = searchText.toLocaleLowerCase();
        }
        this.filteredEvents = this.allEvents.filter((it: Event) => {
            return it.eventName.toString().toLocaleLowerCase().includes(searchText);
        });
    }

    search(searchText: string) {
        this.subject.next(searchText);
    }

    orderEvents(order: string) {
        if (order === "date-asc") {
            this.filteredEvents.sort((a, b) => { return <any>new Date(a.startDate.toString()) - <any>new Date(b.startDate.toString()) });
        } else if (order === "date-desc") {
            this.filteredEvents.sort((a, b) => { return <any>new Date(b.startDate.toString()) - <any>new Date(a.startDate.toString()) });
        } else if (order === "name-asc") {
            this.filteredEvents.sort((a, b) => a.eventName.localeCompare(b.eventName));
        } else if (order === "name-desc") {
            this.filteredEvents.sort((a, b) => b.eventName.localeCompare(a.eventName));
        }
    }
}
