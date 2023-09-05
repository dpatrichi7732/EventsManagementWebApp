import { LabelsService } from './services/labels.service';
import { AadB2CHelper } from "./helpers/AadB2CHelper";
import { CaptchaService } from "./services/captcha.service";
import { HttpHelperProvider } from "./providers/http.helper.provider";
import {
    EventServiceProvider,
    SessionServiceProvider,
    UserServiceProvider,
    TracksServiceProvider,
    SponsorshipsServiceProvider
} from "./providers/service.providers";
import { IsAuthenticatedGuard } from "./guards/is.authenticated.guard";
import { AppRoutes } from "./routes";
import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./components/app/app.component";
import { NavMenuComponent } from "./components/navmenu/navmenu.component";
import { HomeComponent } from "./components/home/home.component";
import { FooterComponent } from "./components/footer/footer.component";
import { EventComponent } from "./components/event/event.component";
import { EventRegistrationComponent } from "./components/eventregistration/eventregistration.component";
import { AttendeeComponent } from "./components/eventregistration/attendee/attendee.component";
import { SpeakersComponent } from "./components/event/speakers/speakers.component";
import { SessionsComponent } from "./components/event/sessions/sessions.component";
import { SessiontracksComponent } from "./components/event/sessiontracks/sessiontracks.component";
import { ConfirmationComponent } from "./components/eventregistration/confirmation/confirmation.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { ErrorMessageComponent } from "./components/errormessage/errormessage.component";
import { SponsorsComponent } from "./components/event/sponsors/sponsors.component";
import { PassesComponent } from "./components/event/passes/passes.component";
import { SessionsListViewComponent } from "./components/event/sessionslistview/sessionslistview.component";
import { CaptchaComponent } from "./components/eventregistration/captcha/captcha.component";
import { TranslateDirective } from "./directives/translate.directive";
import { DefaultImage } from "./directives/defaultImage.directive";
import { ExternalLoginUrlResolver } from "./resolvers/external.login.url.resolver";
import { ExternalProfileUrlResolver } from "src/app/resolvers/external.profile.url.resolver";
import { ExternalLogoutUrlResolver } from "./resolvers/external.logout.url.resolver";
import { MyRegistrationsComponent } from "./components/myregistrations/myregistrations.component";
import { ImageHelper } from "./helpers/ImageHelper";
import { PaymentDemoComponent } from "src/app/components/eventregistration/paymentdemo/payment.demo";
import { BrowserSessionService } from "./services/browser-session.service";
import { CustomRegistrationFieldsComponent } from "./components/eventregistration/attendee/custom-registration-fields/custom-registration-fields.component";
import { SessionCartComponent } from "./components/event/session-cart/session-cart.component";
import { SessionCartService } from "./components/event/session-cart/session-cart.service";
import { SessionSelectionComponent } from "./components/eventregistration/session-selection/session-selection.component";
import { CookieService } from "./services/cookie.service";
import { WaitlistItemCardComponent } from './components/myregistrations/waitlist-item-card/waitlist-item-card.component';
import { EventRegistrationFormComponent } from './components/eventregistration/eventregistrationform/eventregistrationform.component';
import { RegistrationFormInitializerDirective } from './components/eventregistration/eventregistrationform/eventregistrationform.component';
import { SafePipe } from './components/pipes/safe.pipe';
import { NgbdModalContent } from './components/eventregistration/modal/modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { A11yModule } from "@angular/cdk/a11y";
import { DatePipe } from '@angular/common';
import { EventRouterService } from './services/event-router.service';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        FooterComponent,
        EventComponent,
        EventRegistrationComponent,
        AttendeeComponent,
        SpeakersComponent,
        SessionsComponent,
        SessiontracksComponent,
        ConfirmationComponent,
        SpinnerComponent,
        ErrorMessageComponent,
        SponsorsComponent,
        PassesComponent,
        SessionsListViewComponent,
        CaptchaComponent,
        TranslateDirective,
        DefaultImage,
        MyRegistrationsComponent,
        PaymentDemoComponent,
        CustomRegistrationFieldsComponent,
        SessionCartComponent,
        SessionSelectionComponent,
        WaitlistItemCardComponent,
        EventRegistrationFormComponent,
        RegistrationFormInitializerDirective,
        SafePipe,
        NgbdModalContent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        NgbModule,
        A11yModule,
        RouterModule.forRoot(
            AppRoutes,
            { scrollPositionRestoration: 'disabled' }
        )
    ],
    providers: [
        IsAuthenticatedGuard,
        ExternalLoginUrlResolver,
        ExternalLogoutUrlResolver,
        ExternalProfileUrlResolver,
        HttpClient,
        HttpHelperProvider,
        ImageHelper,
        CaptchaService,
        EventServiceProvider,
        SessionServiceProvider,
        TracksServiceProvider,
        UserServiceProvider,
        SponsorshipsServiceProvider,
        BrowserSessionService,
        AadB2CHelper,
        SessionCartService,
        LabelsService,
        AadB2CHelper,
        CookieService,
        DatePipe,
        EventRouterService
    ],
    entryComponents: [NgbdModalContent]
})
export class AppModule {}
