import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Observable, merge, of } from 'rxjs';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-master-page-preview',
  templateUrl: './master-page-preview.component.html',
  styleUrls: ['./master-page-preview.component.scss'],
})
export class MasterPagePreviewComponent implements OnInit {
  network$: Observable<string>;
  lightning$: Observable<boolean>;
  officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
  urlLanguage: string;

  constructor(
    public stateService: StateService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    this.network$ = merge(of(''), this.stateService.networkChanged$);
    this.lightning$ = this.stateService.lightningChanged$;
    this.urlLanguage = this.languageService.getLanguageForUrl();
  }
}
