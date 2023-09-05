import { Component, Input, OnInit, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LabelsService } from '../../../services/labels.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngbd-modal-content',
  styleUrls: ['./modal.component.scss'],
  templateUrl: './modal.component.html'
})
export class NgbdModalContent implements OnInit {

  @Input() titleTranslate: string;
  @Input() title: string;
  @Input() messageTranslate: string;
  @Input() message: string;
  @Input() primaryButton: string;
  @Input() primaryButtonTranslate: string;
  @Input() secondaryButton: string;
  @Input() secondaryButtonTranslate: string;
  @Input() extraParams: string[];
  @ViewChild('actionButton',{ static: false}) actionButton: ElementRef;
  @ViewChild('closeButton', { static: false}) closeButton: ElementRef;

  constructor(public activeModal: NgbActiveModal, private labelsService: LabelsService) {}

  ngOnInit() {
    document.getElementById('actionButton').focus();
  }

  translateLabelWithParams(translationKey: string, defaultValue: string, params): Observable<string> {
    return this.labelsService.translateLabelWithParams(translationKey, defaultValue, params);
  }

  getTranslationForTitle() {
    return this.titleTranslate;
  }

  getTranslationForMessage() {
    return this.messageTranslate;
  }

  getTranslationForPrimaryButton() {
    return this.primaryButtonTranslate;
  }

  getTranslationForSecondaryButton() {
    return this.secondaryButtonTranslate;
  }

  getMessage() {
    return this.message;
  }

  getExtraParams() {
    return this.extraParams;
  }
}