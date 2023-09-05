import { Component, OnInit, Input, Output, ViewChild, ElementRef } from "@angular/core";
import { SessionCartService } from "./session-cart.service";
import { Session } from "src/app/models/Session";
import { Event } from "src/app/models/Event";
import { ActiveEventService } from 'src/app/services/active-event.service';
import { LabelsService } from 'src/app/services/labels.service';
import { Observable } from 'rxjs';

@Component({
    selector: "app-session-cart",
    templateUrl: "./session-cart.component.html",
    styleUrls: ["./session-cart.component.scss"]
})
export class SessionCartComponent implements OnInit {

    @Input()
    public readableEventId: string;

    public event: Event;

    public isSessionCartVisible: boolean;

    /**
     * All session IDs that are inside the session cart.
     */
    public sessionIdsInCart: Array<string>;

    public sessionsCart: Array<Session>;

    @ViewChild('sessionCartButton', { static: false}) sessionCartButton: ElementRef;
    @ViewChild('closeButton', { static: false}) closeButton: ElementRef;

    constructor(
        private sessionCartService: SessionCartService,
        private activeEventService: ActiveEventService,
        private labelsService: LabelsService) {}

    ngOnInit() {
        this.getSessionCart();

        this.subscribeToIsSessionCartOpen();
        
        this.activeEventService.getEvent(this.readableEventId).subscribe(event => {
            this.event = event;
        });
    }

    public collapse() {
        this.sessionCartService.isOpen = false;
    }

    public removeSessionFromCart(session: Session) {
        this.sessionCartService.removeSession(this.readableEventId, session.id);
    }

    public sessionCartCount(): number {
        return this.sessionIdsInCart.length;
    }

    private getSessionCart(): void {
        this.sessionIdsInCart = this.sessionCartService.getSessionCartForEvent(this.readableEventId);
        this.getSessionsWithId(this.sessionIdsInCart);

        this.sessionCartService.sessionCartChange.subscribe(sessionCart => {
            this.sessionIdsInCart = sessionCart;
            this.getSessionsWithId(this.sessionIdsInCart);
        });
    }

    private async getSessionsWithId(sessionIds: string[]) {
        this.sessionsCart = await this.activeEventService.getAndFilterSessions(this.readableEventId, true, sessionIds).toPromise();
    }

    private subscribeToIsSessionCartOpen(): void {
        this.sessionCartService.isOpenChange.subscribe(isOpen => {
            this.isSessionCartVisible = isOpen;
            if (this.isSessionCartVisible) {
                if (this.sessionCartCount() === 0) {
                    setTimeout(() => {
                        this.closeButton.nativeElement.focus();
                    });
                } else {
                    setTimeout(() => {
                        this.sessionCartButton.nativeElement.focus();
                    });
                }
            }
        });
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }
}
