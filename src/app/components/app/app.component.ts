import { Component, OnInit } from '@angular/core';
import { LabelsService } from '../../services/labels.service';
import { environment } from 'src/environments/environment';
import { MetaDefinition, Meta } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(public labelsService: LabelsService, private metaService: Meta) {}

    ngOnInit() {
        this.labelsService.getLabelsModel().subscribe(labelsModel => {
            // force get the labels
        });

        this.addBuildVersionToMetaTags();
    }

    private addBuildVersionToMetaTags() {
        let metaBuildVersion = '0.0.0';
        if (environment && environment.buildVersion) {
            metaBuildVersion = environment.buildVersion;
        }

        const metaDefinition: MetaDefinition = {
            name: 'build-version',
            content: metaBuildVersion
        };

        this.metaService.addTag(metaDefinition);
    }
}
