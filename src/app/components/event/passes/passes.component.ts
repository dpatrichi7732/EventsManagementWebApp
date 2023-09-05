import { EVENT_SERVICE } from './../../../providers/service.providers';
import { EventService } from '../../../services/event.service';
import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
import { Pass } from '../../../models/Pass';
import { ActivatedRoute } from '@angular/router';
import { EventQueryParameterNames } from '../event.component';
import { LocalizableError } from 'src/app/models/LocalizableError';
import { EventRouterService } from 'src/app/services/event-router.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-passes',
    templateUrl: './passes.component.html',
    styleUrls: ['./passes.component.scss']
})
export class PassesComponent implements OnInit, OnDestroy {
    public isLoading: Boolean;
    public error: LocalizableError;
    public passes: Pass[];
    public selectedPass: Pass;

    private readableEventId: string;
    private eventRouterSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private eventRouterService: EventRouterService
    ) { }

    ngOnDestroy(): void {
        this.eventRouterSubscription.unsubscribe();
    }

    ngOnInit() {
        this.eventRouterSubscription = this.eventRouterService.passes$.subscribe(p => this.handleLoadForPasses(p));
        this.route.queryParamMap.subscribe(paramMap => {
            this.readableEventId = paramMap.get(
                EventQueryParameterNames.ReadableEventId
            );
            this.loadPasses();
        });
    }

    private loadPasses(): void {
        this.isLoading = true;
        this.eventService.getPasses(this.readableEventId).subscribe(
            passes => {
                this.handleLoadForPasses(passes);
            },
            (error: LocalizableError) => this.handleErrorResponse(error)
        );
    }

    private handleLoadForPasses(passes: Pass[]) {
        if (this.passes == null) {
            this.passes = passes;

            if (this.passes.length === 0) {
                this.eventRouterService.evaluateRoute();
            }

            if (this.passes.length > 0) {
                this.selectedPass = this.passes[0];
            }
        }
        this.isLoading = false;
    }

    private handleErrorResponse(error: LocalizableError) {
        this.error = error;
        this.isLoading = false;
    }
}
