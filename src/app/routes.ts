import { ConfirmationComponent } from "./components/eventregistration/confirmation/confirmation.component";
import { EventRegistrationComponent, EventCheckoutRoutePaths } from "./components/eventregistration/eventregistration.component";
import { EventComponent, EventDetailSections } from "./components/event/event.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { HomeComponent } from "./components/home/home.component";
import { Routes } from "@angular/router";
import { ExternalLoginUrlResolver } from "./resolvers/external.login.url.resolver";
import { ExternalLogoutUrlResolver } from "./resolvers/external.logout.url.resolver";
import { ExternalProfileUrlResolver } from "./resolvers/external.profile.url.resolver";
import { MyRegistrationsComponent } from "./components/myregistrations/myregistrations.component";
import { IsAuthenticatedGuard } from "src/app/guards/is.authenticated.guard";
import { PaymentDemoComponent } from "src/app/components/eventregistration/paymentdemo/payment.demo";
import { SessionsComponent } from "./components/event/sessions/sessions.component";
import { SessiontracksComponent } from "./components/event/sessiontracks/sessiontracks.component";
import { SpeakersComponent } from "./components/event/speakers/speakers.component";
import { PassesComponent } from "./components/event/passes/passes.component";
import { SessionSelectionComponent } from './components/eventregistration/session-selection/session-selection.component';



// WARNING: Adding routes can break compatibility with hosted portal!
// Make sure to add a web page in Portals if you want to add an additional route.
export const AppRoutes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "spinner", component: SpinnerComponent },
    {
        path: "event",
        component: EventComponent,
        children: [
            {
                path: "",
                redirectTo: EventDetailSections.Sessions,
                pathMatch: "prefix"
            },
            {
                path: EventDetailSections.Sessions,
                component: SessionsComponent
            },
            {
                path: EventDetailSections.SessionTracks,
                component: SessiontracksComponent
            },
            {
                path: EventDetailSections.Speakers,
                component: SpeakersComponent
            },
            {
                path: EventDetailSections.PassInformation,
                component: PassesComponent
            }
        ]
    },
    { 
        path: EventCheckoutRoutePaths.REGISTRATION, 
        component: EventRegistrationComponent,
        children: [
            {
                path: "",
                component: SessionSelectionComponent
            }
        ]
    },
    { path: EventCheckoutRoutePaths.CONFIRMATION, component: ConfirmationComponent },
    { path: EventCheckoutRoutePaths.PAYMENT, component: PaymentDemoComponent },
    {
        path: "externalLogin",
        resolve: { url: ExternalLoginUrlResolver },
        component: HomeComponent
    },
    {
        path: "externalLogout",
        resolve: { url: ExternalLogoutUrlResolver },
        component: HomeComponent
    },
    {
        path: "externalProfile",
        resolve: { url: ExternalProfileUrlResolver },
        component: HomeComponent
    },
    {
        path: "myregistrations",
        canActivate: [IsAuthenticatedGuard],
        component: MyRegistrationsComponent
    },
    { path: "**", redirectTo: "home" }
];
