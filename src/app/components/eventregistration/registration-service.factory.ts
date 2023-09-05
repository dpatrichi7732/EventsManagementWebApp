import { Inject, Injectable} from '@angular/core';
import { RegistrationService } from './registration.service';
import { ActiveEventService } from 'src/app/services/active-event.service';
import { SessionCartService } from '../event/session-cart/session-cart.service';
import { EventService } from 'src/app/services/event.service';
import { EVENT_SERVICE } from 'src/app/providers/service.providers';

@Injectable({
    providedIn: 'root'
})
export class RegistrationServiceFactory {
    private registrationServices: Map<string, RegistrationService>;

    constructor(
        @Inject(EVENT_SERVICE) private eventService: EventService,
        private activeEventService: ActiveEventService,
        private sessionCartService: SessionCartService
    ) {
        this.registrationServices = new Map();
    }

    public async create(readableEventId: string): Promise<RegistrationService> {
        if (this.registrationServices.has(readableEventId)) {
            return this.registrationServices.get(readableEventId);
        }

        const registrationService = new RegistrationService(
            this.eventService,
            this.activeEventService,
            this.sessionCartService,
            readableEventId
        );

        await registrationService.initializeRegistration();

        this.registrationServices.set(readableEventId, registrationService);

        return registrationService;
    }

    /**
     * This method should be called as soon as the registration service for the specified
     * readable event id is not needed anymore.
     */
    public dispose(readableEventId: string): void {
        if (this.registrationServices.has(readableEventId)) {
            const registrationServiceToDispose = this.registrationServices.get(readableEventId);
            registrationServiceToDispose.dispose();

            this.registrationServices.delete(readableEventId);
        }
    }
}
