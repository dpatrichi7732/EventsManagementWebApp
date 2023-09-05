import { Component, OnInit, Input, Directive, ElementRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { LabelsService } from '../../../services/labels.service';
import { IFormHandler } from '../eventregistration.component';
declare var MsCrmMkt:any;

/**
 * This directive responsible for :
 *  - Moving the marketing forms script outside of the Angular Framework scope
 *  - Capturing and initializing the Marketing forms loader
 */
@Directive({ selector: '[registration-form-initializer]' })
export class RegistrationFormInitializerDirective implements OnInit {
    @Input() public formHandler: IFormHandler;

    constructor(private elementRef: ElementRef,
                private labelsService: LabelsService) { }

    ngOnInit(): void {
      setTimeout(() => {
        this.reinsertScripts();
      })
    }

    reinsertScripts(): void {
        const externalScriptId = "external-scripts";
        const scripts = <HTMLScriptElement[]>this.elementRef.nativeElement.getElementsByTagName('script');
        const scriptsInitialLength = scripts.length;

        var externalScripts = document.getElementById(externalScriptId);
        if(!externalScripts){
          externalScripts = document.createElement("div");
          externalScripts.id = externalScriptId;
          document.body.appendChild(externalScripts);
        }
        
        externalScripts.innerHTML = "";
        this.resetMsCrmMkt();
        window["d365mktConfigure"] = this.d365mktConfigure.bind(this);
        
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy = <HTMLScriptElement>document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            scriptCopy.async = false;

            if (script.innerHTML) {
              scriptCopy.innerHTML = script.innerHTML;
            } else if (script.src) {
              scriptCopy.src = script.src;
            }

            document.getElementById(externalScriptId).appendChild(scriptCopy);
            scripts[i].remove();
        }
    }

    resetMsCrmMkt(){
      try {
        MsCrmMkt = null;
      } catch {
        /* Disolve exception */
      }
    }

    public d365mktConfigure = function(){
      if(MsCrmMkt) {
        const currentLanguageCode = this.labelsService.getCurrentLanguageCode();
        const _this = this;
        MsCrmMkt.MsCrmFormLoader.uiLanguage = currentLanguageCode;

        MsCrmMkt.MsCrmFormLoader.off("afterFormSubmit");
        MsCrmMkt.MsCrmFormLoader.on("afterFormSubmit", function(event: any) {
          _this.formHandler.onSubmitSuccessfull(event)
        });

        MsCrmMkt.MsCrmFormLoader.off("formLoad");
        MsCrmMkt.MsCrmFormLoader.on("formLoad", function(event: any) {
          _this.formHandler.onFormRegistrationLoad(event);
        });

        MsCrmMkt.MsCrmFormLoader.off("afterFormLoad");
        MsCrmMkt.MsCrmFormLoader.on("afterFormLoad", function(event: any) {
          _this.formHandler.afterFormRegistrationLoaded(event);
        });
        
        MsCrmMkt.MsCrmFormLoader.off("formSubmit");
        MsCrmMkt.MsCrmFormLoader.on("formSubmit", (event: any) => {
          _this.formHandler.onSubmitEvent(event);
        });
      }

      return false;
    };
}

@Component({
    selector: '[event-registration-form]',
    templateUrl: './eventregistrationform.component.html'
})
export class EventRegistrationFormComponent implements OnInit{
    @Input() public eventmarketingformhtml: SafeHtml;
    @Input() public formHandler: IFormHandler;

    ngOnInit(): void {
    }
}

