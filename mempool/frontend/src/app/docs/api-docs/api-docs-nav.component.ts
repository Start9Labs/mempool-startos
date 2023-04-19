import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Env, StateService } from '../../services/state.service';
import { restApiDocsData } from './api-docs-data';
import { faqData } from './api-docs-data';

@Component({
  selector: 'app-api-docs-nav',
  templateUrl: './api-docs-nav.component.html',
  styleUrls: ['./api-docs-nav.component.scss']
})
export class ApiDocsNavComponent implements OnInit {

  @Input() network: any;
  @Input() whichTab: string;
  @Output() navLinkClickEvent: EventEmitter<any> = new EventEmitter();
  env: Env;
  tabData: any[];
  auditEnabled: boolean;
  officialMempoolInstance: boolean;

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit(): void {
    this.env = this.stateService.env;
    this.officialMempoolInstance = this.env.OFFICIAL_MEMPOOL_SPACE;
    this.auditEnabled = this.env.AUDIT;
    if (this.whichTab === 'rest') {
      this.tabData = restApiDocsData;
    } else if (this.whichTab === 'faq') {
      this.tabData = faqData;
    }
  }

  navLinkClick(event) {
    this.navLinkClickEvent.emit(event);
  }

}
