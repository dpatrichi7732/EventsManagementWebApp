import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { ErrorCodes } from 'msal/lib-commonjs/Constants';

@Injectable({
    providedIn: 'root'
})
export class AadB2CHelper {
    private tenantConfig = environment.aadB2CConfig;

    // Configure the authority for Azure AD B2C
    // tslint:disable-next-line:max-line-length
    private authority = `https://${this.tenantConfig.authorityHost}/tfp/${this.tenantConfig.tenant}/${this.tenantConfig.signUpSignInPolicy}`;

    /*
    * B2C SignIn SignUp Policy Configuration
    */
    clientApplication = environment.useAadB2C
        ? new Msal.UserAgentApplication(
              this.tenantConfig.clientID,
              this.authority,
              function(errorDesc: any, token: any, error: any, tokenType: any) {
                  // Called after loginRedirect or acquireTokenPopup
              },
              {
                  validateAuthority: false,
                  redirectUri: this.tenantConfig.redirectUri
              }
          )
        : null;

    public login(): Promise<string> {
        return this.clientApplication
            .loginPopup(this.tenantConfig.b2cScopes)
            .then(() => this.clientApplication.acquireTokenSilent(this.tenantConfig.b2cScopes))
            .catch(error => {
                const errorMessage = error as string;
                if (!this.didUserCancel(errorMessage)) {
                    console.error('Error occurred during acquiring token silently: ' + errorMessage);

                    // try to send interactive request since AcquireTokenSilent failed
                    return this.clientApplication.acquireTokenPopup(this.tenantConfig.b2cScopes);
                }
            });
    }

    private didUserCancel(errorMessage: string) {
        const errorMessageSplitCharacter = '|';
        if (errorMessage && errorMessage.includes(errorMessageSplitCharacter)) {
            const errorCode = errorMessage.split(errorMessageSplitCharacter);
            return errorCode[0] === ErrorCodes.userCancelledError;
        }

        return false;
    }

    public logout(): void {
        this.clientApplication.logout();
    }

    public aquireToken(): Promise<string> {
        return this.clientApplication
            .acquireTokenSilent(this.tenantConfig.b2cScopes)
            .catch(() => this.clientApplication.acquireTokenPopup(this.tenantConfig.b2cScopes));
    }

    public aquireTokenSilent(): Promise<string> {
        return this.clientApplication.acquireTokenSilent(this.tenantConfig.b2cScopes);
    }
}
