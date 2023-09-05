/**
  * This is the configuration when using the self-hosted approach.
  * For the self-hosted approach it is required to change the parameters to match your environment.
  * You can find more information on how to configure your self-hosted environment in
  * our Developer Guide (https://docs.microsoft.com/en-us/dynamics365/customer-engagement/marketing/developer/self-hosted).
  */
export const environment = {
    /**
     * Enables/Disabled the production mode of Angular.
     * You can find more information about the production mode here: https://angular.io/api/core/enableProdMode
     */
    production: true,

    /**
     * This field links to the version specified in the `package.json` file by default. There is no need to change this property.
     * However, if you prefer not to expose the version of the application, you can set it to `null`.
     **/
    buildVersion: require('../../package.json').version,

    /**
     * The URL that points to the Event Management API endpoint (which is used to retrieve information of events and to make registrations).
     * If you're using the deprecated Event Management Portal API then you need to enter the URL of your Portals.
     * If you're using the new Event Management Public API then you need to replace HOST with the value from the `Endpoint` field that you
     * get after registering your web application. Additionally you need to append 'EvtMgmt/api/v2.0/'.
     * Note: The URL **must** have a trailing slash.
     **/
    apiEndpoint: 'https://HOST/EvtMgmt/api/v2.0/',

    /**
     * Points to the URL where the localization files are stored (by default they are stored in the root directory).
     */
    localizationEndpoint: '/',

    /**
     * Specifies the base URL from where images are served.
     * This configuration enables you to serve images from a different location which might be
     * required if you want to use a CDN or image processing service.
     */
    imagesEndpoint: 'assets/images/',

    /**
     * This setting specifies which API is used.
     * If set to true then the new Event Management Public API is used.
     * If set to false then the deprecated Event Management Portal API is used. This API can only be used if you host on Portals.
     * Note: In order to use the new Event Management Public API you need to register your web application in CRM.
     */
    useRestStack: true,

    /**
     * This authenticates your web application against our Event Management Public API.
     * You can retrieve the application token by registering a new web application in CRM.
     * Note: This token is not required if you're using the deprecated Event Management Portal API.
     */
    emApplicationtoken: '',

    /**
     * This flag specifies whether user authentication is supported (meaning user can to register/sign-in).
     * If set to false then the application will not display a possibility sign-in or register.
     */
    isAuthenticationEnabled: false,

    /**
     * Specifies whether you want to use **Azure Active Directory B2C identity management** for authentication.
     * If you want to use **Dynamics 365 Portals identity management** then this flag needs to be set to false.
     * Note: If AAD B2C is enabled then you need to configure the `aadB2CConfig` variable.
     */
    useAadB2C: false,

    /**
     * The configuration for **Azure Active Directory B2C identity management**.
     */
    aadB2CConfig: {
        authorityHost: '',
        tenant: '',
        clientID: '',
        signUpSignInPolicy: '',
        b2cScopes: [],
        redirectUri: ''
    },

    /**
     * This setting can be used to return mock objects instead of making real API calls.
     */
    useMockData: false,

    /**
     * For more details on how to format dates please visit following link
     * https://angular.io/api/common/DatePipe#usage-notes
     */
    dateSettings: {
        singleDateFormat: "MM/dd/yyyy", // used for diplaying single date. Example: 08/20/2020.
        rangeDateFormat: "MMM d, y", // used for displaying date in a range such as [startDate] - [endDate].
        timeFormat: "H:mm", // used for displaying time. Example : 9:20 AM
        timezoneFormat: "zzz",
        convertToLocalDate: false, // if set to true will convert all dates to end users local date
        
        /**
         * Formatting template for a single date.
         * The structure will use the configurations from : 
         *  - [date] -> singleDateFormat, 
         *  - [time] -> timeFormat 
         *  - [z] -> timezoneFormat
         * Example 08/20/2020, 9:20 AM GMT+1
         */
        singleDateStructure: "[date], [time] [z]",
    
        /**
         * Formatting template for a date range
         * The structure will use the configurations from : 
         *  - [date] -> rangeDateFormat, 
         *  - [startTime], [endTime] -> timeFormat 
         *  - [z] -> timezoneFormat
         * Example :
         * Jun 15, 2015 21:00 - Jun 16, 2015 21:00 if startDate and endDate are on diffrent days
         * Jun 15, 2015 21:00 - 22:00 if startDate and endDate are on the same days
         */
        rangeTimeStructure: "[date] [startTime] - [endTime] [z]", // template for time range across multiple hours for a single day
        rangeDateStructure: "[startDate] [startTime]  - [endDate] [endTime] [z]",  // template for date range across multiple days
    },

    /**
     * Configuration for the website language
     * A list of available LCIDs can be found in file **labels.service.ts** 
     * 
     * showLanguageDropdown - if set to false, language selection dropdown will be hidden from the header
     * 
     * Priority of settings: 
     *  - forceSingleLanguage : will always force load the language defined in websiteLanguageLcid.
     *  - useBrowserLanguage : will load the browser language instead of the default language defined in websiteLanguageLcid
     *  - websiteLanguageLcid : the default language of the website that will be used only if forceSingleLanguage and useBrowserLanguage are set to false
     */
    languageSettings : {
        useBrowserLanguage: true,
        websiteLanguageLcid : "en-us", // Provide a language LCID string. Example usage : "en-us"
        showLanguageDropdown:  true, 
        forceSingleLanguage: false
    }
};
