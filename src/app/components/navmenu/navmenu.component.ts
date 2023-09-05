import { LabelsService } from 'src/app/services/labels.service';
import { UserBaseService } from './../../../app/services/base/user.base.service';
import { USER_SERVICE } from './../../providers/service.providers';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Event } from '../../models/Event';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { Subscription, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AadB2CHelper } from 'src/app/helpers/AadB2CHelper';
import { SessionCartService } from '../event/session-cart/session-cart.service';
import { Session } from 'src/app/models/Session';
import { Pass } from 'src/app/models/Pass';
import { ActiveEventService } from 'src/app/services/active-event.service';
import { EventCheckoutRoutePaths } from "../eventregistration/eventregistration.component";
import { filter } from 'rxjs/operators';
import { SupportedLanguage } from 'src/app/models/SupportedLanguage';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.scss']
})
export class NavMenuComponent implements OnInit, OnDestroy {
    public activeEvent: Event | null;
    public activeEventSessions: Array<Session>;
    public activeEventPasses: Array<Pass>;
    public showCartItem = false;
    public sessionCartCount = 0;
    public showLanguageDropdown = true;

    user: User;
    navbarOpen: boolean;
    showUserMenu = environment.isAuthenticationEnabled;
    showProfile = !environment.useAadB2C;
    supportedLanguages$: Observable<SupportedLanguage[]>;

    private subscriptions = new Array<Subscription>();
    private readableEventId: string;

    constructor(
        private activeEventService: ActiveEventService,
        private sessionCartService: SessionCartService,
        private router: Router,
        private route: ActivatedRoute,
        @Inject(USER_SERVICE) private userService: UserService,
        private authHelper: AadB2CHelper,
        private labelsService: LabelsService) {
    }

    ngOnInit(): void {
        this.subscribeToSessionCartCount();
        this.subscribeToEventChange();
        this.subscribeToRouteChange();
        this.getUser();
        this.loadChangeLanguageDropdown();
        this.shouldShowLanguageDropdown();
        this.navbarOpen = false;
    }

    shouldShowLanguageDropdown() {
        if(!environment.languageSettings){
            return;
        }

        this.showLanguageDropdown = environment.languageSettings.showLanguageDropdown;
    }

    getUser() {
        this.user = UserBaseService.AnonymousUser;

        const userSubscription = this.userService.getLoggedInUser().subscribe(
            user => {
                this.user = user;
            },
            error => console.error(error)
        );

        this.subscriptions.push(userSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    public supportedLanguageChanged(languageLcid: number) {
        this.labelsService.selectLanguage(languageLcid);
    }

    /**
     * Toggles the state (open or collapsed) of the navbar.
     */
    public toggleNavbar() {
        this.navbarOpen = !this.navbarOpen;
    }

    public toggleSessionCart() {
        this.sessionCartService.isOpen = !this.sessionCartService.isOpen;
    }

    public translateLabel(translationKey: string, defaultValue: string): Observable<string> {
        return this.labelsService.translateLabel(translationKey, defaultValue);
    }

    private subscribeToEventChange() {
        const routeSubscription = this.route.queryParams.subscribe(route => {
            this.readableEventId = route["id"];

            if (this.readableEventId) {
                this.sessionCartCount = this.sessionCartService.getSessionCartForEvent(this.readableEventId).length;
                this.activeEventService.getEvent(this.readableEventId).toPromise()
                    .then(event => {
                        this.activeEvent = event;
                        this.setShowCartItem();
                    });
            } else {
                this.activeEvent = null;
            }
        });

        this.subscriptions.push(routeSubscription);
    }

    private subscribeToSessionCartCount() {
        this.sessionCartService.sessionCartChange.subscribe(
            sessionCart => (this.sessionCartCount = sessionCart.length)
        );
    }

    private subscribeToRouteChange() {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.setShowCartItem();
        });
    }

    private loadChangeLanguageDropdown(): void {
        this.supportedLanguages$ = this.labelsService.getSupportedLanguages();
    }

    private async setShowCartItem() {
        if (this.isCheckoutInProgress() || this.readableEventId == null || this.readableEventId === "") {
            this.showCartItem = false;
            return;
        }

        const isFreeEvent = await this.activeEventService.isFreeEvent(this.readableEventId);
        const hasSessions = await this.activeEventService.hasEventSessions(this.readableEventId);

        this.showCartItem = this.sessionCartService.isSessionCartEnabledForEvent(
            this.activeEvent,
            isFreeEvent,
            hasSessions
        );
    }

    private isCheckoutInProgress() {
        const url = this.router.url;
        return (url.includes(EventCheckoutRoutePaths.REGISTRATION) ||
            url.includes(EventCheckoutRoutePaths.PAYMENT) ||
            url.includes(EventCheckoutRoutePaths.SUCCESS_PAYMENT) ||
            url.includes(EventCheckoutRoutePaths.CONFIRMATION));
    }
}
