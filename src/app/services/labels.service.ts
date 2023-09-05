import { BrowserSessionService } from './browser-session.service';
import { LabelsModel } from './../models/LabelsModel';
import { SupportedLanguage } from './../models/SupportedLanguage';
import { environment } from './../../environments/environment';
import { HttpHelper } from '../helpers/HttpHelper';
import { Injectable, Inject } from '@angular/core';
import { Observable, of, OperatorFunction } from 'rxjs';
import { tap, share, map, catchError, flatMap } from 'rxjs/operators';
import { HTTP_HELPER } from './../../app/providers/http.helper.provider';
import { from } from 'rxjs/internal/observable/from';
import { reduce } from 'rxjs/internal/operators/reduce';
import { CookieService } from './cookie.service';

@Injectable()
export class LabelsService {

    private languageToLcidMap = {
        ArabicSaudiArabia: 1025,
        Bulgarian: 1026,
        Catalan: 1027,
        ChineseTaiwan: 1028,
        Czech: 1029,
        Danish: 1030,
        GermanGermany: 1031,
        Greek: 1032,
        EnglishUS: 1033,
        Finnish: 1035,
        FrenchFrance: 1036,
        Hebrew: 1037,
        Hungarian: 1038,
        ItalianItaly: 1040,
        Japanese: 1041,
        Korean: 1042,
        DutchNetherlands: 1043,
        NorwegianBokml: 1044,
        Polish: 1045,
        PortugueseBrazil: 1046,
        RomanianRomania: 1048,
        Russian: 1049,
        Croatian: 1050,
        Slovak: 1051,
        SwedishSweden: 1053,
        Thai: 1054,
        Turkish: 1055,
        Indonesian: 1057,
        Ukrainian: 1058,
        Slovenian: 1060,
        Estonian: 1061,
        Latvian: 1062,
        Lithuanian: 1063,
        Vietnamese: 1066,
        Basque: 1069,
        Galician: 1110,
        Chinese: 2052,
        EnglishGB: 2057,
        PortuguesePortugal: 2070,
        SerbianLatin: 2074,
        ChineseHongKong: 3076,
        EnglishAustralia: 3081,
        SpanishSpain: 3082,
        FrenchCanada: 3084,
        SerbianCyrillic: 3098,
        EnglishCanada: 4105,
    };

    /**
     * LCIDs and associated codes
     */
    private languageCodeToLcidMap = {
        'ar-sa': 1025,
        'bg': 1026,
        'ca': 1027,
        'zh-tw': 1028,
        'cs': 1029,
        'da': 1030,
        'de': 1031,
        'el': 1032,
        'en-us': 1033,
        'fi': 1035,
        'fr': 1036,
        'he': 1037,
        'hu': 1038,
        'it': 1040,
        'ja': 1041,
        'ko': 1042,
        'nl': 1043,
        'no': 1044,
        'pl': 1045,
        'pt-br': 1046,
        'ro': 1048,
        'ru': 1049,
        'hr': 1050,
        'sk': 1051,
        'sv': 1053,
        'th': 1054,
        'tr': 1055,
        'id': 1057,
        'uk': 1058,
        'sl': 1060,
        'et': 1061,
        'lv': 1062,
        'lt': 1063,
        'vi': 1066,
        'eu': 1069,
        'gl': 1110,
        'zh-cn': 2052,
        'en-gb': 2057,
        'pt-pt': 2070,
        'sr': 2074,
        'zh-hk': 3076,
        'en-au': 3081,
        'es': 3082,
        'fr-ca': 3084,
        'sr-cy': 3098,
        'en-ca': 4105,
    };

    private DefaultLcidCode = 1033;
    private DefaultLcid = 'en-us';
    private ForceSingleLanguage = false;
    private UseBrowserLanguage = false;
    private selectedLanguageLcidCookieKey: string = 'selected-language-lcid';

    private labelsModel$: Observable<LabelsModel>;
    private loadedLabelsModel: LabelsModel;

    constructor(
        @Inject(HTTP_HELPER) private http: HttpHelper,
        private browserSessionService: BrowserSessionService,
        private cookieService: CookieService
    ) {
        this.initLanguageSettings();

        const savedLcid = this.getSelectedlcid();
        const localizationFileName = this.getLocalizationFileName(savedLcid);
        const apiCall$ = this.http.get<LabelsModel>(this.buildApiCallUrl(localizationFileName));

        this.labelsModel$ = apiCall$
            .pipe(this.saveLabelsModel())
            .pipe(this.handleLabelLoadingError())
            .pipe(share());
    }

    public getLanguageCodeByLcid(lcid: number) : string {
        const languageCode = Object.getOwnPropertyNames(this.languageCodeToLcidMap)
                              .filter(prop => this.languageCodeToLcidMap[prop] === lcid)
                              .map(prop => prop);
                
        if(languageCode.length === 0){
            return this.DefaultLcid;
        }

        return languageCode[0];
    }

    public getCurrentLanguageCode() : string {
        if (this.isSelectedLanguageLcidSaved()) {
            const currentSelectedLcid = this.getSelectedLanguageLcid();

            return this.getLanguageCodeByLcid(currentSelectedLcid);
        }

        return this.DefaultLcid;
    }

    public getLabelsModel(): Observable<LabelsModel> {
        if (this.labelsLoaded()) {
            return of(this.loadedLabelsModel);
        } else {
            return this.labelsModel$;
        }
    }

    public translateLabel(key: string, defaultValue?: string): Observable<string> {
        return this.getLabelsModel().pipe(map(labelsModel => {
            if (labelsModel.labels[key] !== undefined) {
                return labelsModel.labels[key];
            } else {
                return defaultValue !== undefined ? defaultValue : key;
            }
        }));
    }

    public translateLabelWithParams(key: string, defaultValue?: string, params?: string[]): Observable<string> {
        return this.getLabelsModel().pipe(map(labelsModel => {
            if (labelsModel.labels[key] !== undefined) {
                let label: string = labelsModel.labels[key];
                return this.format(label, params);
            } else {
                return defaultValue !== undefined ? this.format(defaultValue, params) : key;
            }
        }));
    }

    public format(format: string, args: string[]) {
        var returnValue = format;
        for (var i = 0; i < args.length; i++) {
            var actualValue = typeof (args[i]) === "undefined" || args[i] == null ? "": args[i].toString();
            returnValue = returnValue.replace(new RegExp("\\{" + i + "\\}", 'g'), actualValue)
        }
        return returnValue;
    }

    public labelsLoaded(): boolean {
        return this.loadedLabelsModel !== undefined;
    }

    public getSupportedLanguages(): Observable<SupportedLanguage[]> {
        return from(this.extractSupportedLanguages())
            .pipe(this.flatMapToModel())
            .pipe(this.collectToArray());
    }

    public getSelectedlcid(): number {
        if(this.ForceSingleLanguage){
            return this.DefaultLcidCode;
        }

        if (this.isSelectedLanguageLcidSaved()) {
            return this.getSelectedLanguageLcid();
        }

        if(this.UseBrowserLanguage){
            const browserLcid = this.getLcidFromBrowser();
            this.saveLcidToCookie(browserLcid);
            return browserLcid;
        }

        return this.DefaultLcidCode;
    }

    private getLcidFromBrowser(): number {
        const userLanguage = this.getUserLanguage();
        return this.getUserLcid(userLanguage);
    }

    private getUserLanguage(): string {
        const userLanguage = navigator.languages ? navigator.languages[0] : (navigator.language || navigator['userLanguage']);
        if (userLanguage) {
            return userLanguage.toLowerCase();
        } else {
            return this.DefaultLcid;
        }
    }

    private initLanguageSettings(){
        if(!environment.languageSettings){
            return;
        }

        this.DefaultLcidCode = this.languageCodeToLcidMap[environment.languageSettings.websiteLanguageLcid];
        this.DefaultLcid = environment.languageSettings.websiteLanguageLcid;
        this.UseBrowserLanguage = environment.languageSettings.useBrowserLanguage;
        this.ForceSingleLanguage = environment.languageSettings.forceSingleLanguage;
    }

    private getUserLcid(userLanguage: string) {
        const userLcid = this.languageCodeToLcidMap[userLanguage] || this.languageCodeToLcidMap[userLanguage.substr(0,2)];
        if (userLcid) {
            return userLcid;
        } else {
            return this.DefaultLcidCode;
        }
    }

    private saveLcidToCookie(lcid: number) {
        this.setSelectedLanguageLcid(lcid);
    }

    private getLocalizationFileName(lcid: number): string {
        return `${lcid}.json`;
    }

    private buildApiCallUrl(localizationFileName: string): string {
        return `${environment.localizationEndpoint}${localizationFileName}`;
    }

    private saveLabelsModel(): OperatorFunction<LabelsModel, LabelsModel> {
        return tap((labelsModel: LabelsModel) => {
            this.loadedLabelsModel = labelsModel;
        });
    }

    private handleLabelLoadingError(): OperatorFunction<LabelsModel, LabelsModel> {
        return catchError((error, caught) => {
            this.loadedLabelsModel = {
                labels: {},
                isJapanese: false
            };
            return of(this.loadedLabelsModel);
        });
    }

    private extractSupportedLanguages(): string[] {
        const currentLcid = this.getSelectedlcid();
        return Object.getOwnPropertyNames(this.languageToLcidMap)
            .filter(prop => this.languageToLcidMap[prop] !== currentLcid)
            .map(prop => prop);
    }

    private flatMapToModel() {
        return flatMap((supportedLanguageKey: string) => {
            const supportedLanguageLabel$ = this.translateLabel(supportedLanguageKey);
            const supportedLanguageLcid = this.languageToLcidMap[supportedLanguageKey];
            return supportedLanguageLabel$.pipe(map(supportedLanguageLabel => {
                const supp: SupportedLanguage = {
                    label: supportedLanguageLabel,
                    lcid: supportedLanguageLcid
                };
                return supp;
            }));
        });
    }

    private collectToArray() {
        return reduce((acc: SupportedLanguage[], value: SupportedLanguage, index: number) => {
            acc.push(value);
            return acc;
        }, []);
    }

    public selectLanguage(selectedLanguageLcid: number) {
        this.saveLcidToCookie(selectedLanguageLcid);
        window.location.reload();
    }

    private setSelectedLanguageLcid(lcid: number) {
      this.cookieService.setItem(this.selectedLanguageLcidCookieKey, String(lcid));
    }

    private isSelectedLanguageLcidSaved(): boolean {
      return this.cookieService.getItem(this.selectedLanguageLcidCookieKey) !== null;
    }

    private getSelectedLanguageLcid(): number {
      return Number(this.cookieService.getItem(this.selectedLanguageLcidCookieKey));
    }
}
