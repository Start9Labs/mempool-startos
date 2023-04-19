import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, ViewChild, HostListener, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetsService } from '../../services/assets.service';
import { StateService } from '../../services/state.service';
import { Observable, of, Subject, zip, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, startWith,  tap } from 'rxjs/operators';
import { ElectrsApiService } from '../../services/electrs-api.service';
import { RelativeUrlPipe } from '../../shared/pipes/relative-url/relative-url.pipe';
import { ApiService } from '../../services/api.service';
import { SearchResultsComponent } from './search-results/search-results.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFormComponent implements OnInit {
  network = '';
  assets: object = {};
  isSearching = false;
  isTypeaheading$ = new BehaviorSubject<boolean>(false);
  typeAhead$: Observable<any>;
  searchForm: UntypedFormGroup;
  dropdownHidden = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownHidden = false;
    } else {
      this.dropdownHidden = true;
    }
  }

  regexAddress = /^([a-km-zA-HJ-NP-Z1-9]{26,35}|[a-km-zA-HJ-NP-Z1-9]{80}|[A-z]{2,5}1[a-zA-HJ-NP-Z0-9]{39,59})$/;
  regexBlockhash = /^[0]{8}[a-fA-F0-9]{56}$/;
  regexTransaction = /^([a-fA-F0-9]{64})(:\d+)?$/;
  regexBlockheight = /^[0-9]{1,9}$/;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  @Output() searchTriggered = new EventEmitter();
  @ViewChild('searchResults') searchResults: SearchResultsComponent;
  @HostListener('keydown', ['$event']) keydown($event): void {
    this.handleKeyDown($event);
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private assetsService: AssetsService,
    private stateService: StateService,
    private electrsApiService: ElectrsApiService,
    private apiService: ApiService,
    private relativeUrlPipe: RelativeUrlPipe,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.stateService.networkChanged$.subscribe((network) => this.network = network);

    this.searchForm = this.formBuilder.group({
      searchText: ['', Validators.required],
    });

    if (this.network === 'liquid' || this.network === 'liquidtestnet') {
      this.assetsService.getAssetsMinimalJson$
        .subscribe((assets) => {
          this.assets = assets;
        });
    }

    const searchText$ = this.searchForm.get('searchText').valueChanges
    .pipe(
      map((text) => {
        if (this.network === 'bisq' && text.match(/^(b)[^c]/i)) {
          return text.substr(1);
        }
        return text.trim();
      }),
      distinctUntilChanged(),
    );

    const searchResults$ = searchText$.pipe(
      debounceTime(200),
      switchMap((text) => {
        if (!text.length) {
          return of([
            [],
            { nodes: [], channels: [] }
          ]);
        }
        this.isTypeaheading$.next(true);
        if (!this.stateService.env.LIGHTNING) {
          return zip(
            this.electrsApiService.getAddressesByPrefix$(text).pipe(catchError(() => of([]))),
            [{ nodes: [], channels: [] }],
          );
        }
        return zip(
          this.electrsApiService.getAddressesByPrefix$(text).pipe(catchError(() => of([]))),
          this.apiService.lightningSearch$(text).pipe(catchError(() => of({
            nodes: [],
            channels: [],
          }))),
        );
      }),
      map((result: any[]) => {
        if (this.network === 'bisq') {
          result[0] = result[0].map((address: string) => 'B' + address);
        }
        return result;
      }),
      tap(() => {
        this.isTypeaheading$.next(false);
      })
    );

    this.typeAhead$ = combineLatest(
      [
        searchText$,
        searchResults$.pipe(
        startWith([
          [],
          {
            nodes: [],
            channels: [],
          }
        ]))
      ]
      ).pipe(
        map((latestData) => {
          let searchText = latestData[0];
          if (!searchText.length) {
            return {
              searchText: '',
              hashQuickMatch: false,
              blockHeight: false,
              txId: false,
              address: false,
              addresses: [],
              nodes: [],
              channels: [],
            };
          }

          const result = latestData[1];
          const addressPrefixSearchResults = result[0];
          const lightningResults = result[1];

          const matchesBlockHeight = this.regexBlockheight.test(searchText);
          const matchesTxId = this.regexTransaction.test(searchText) && !this.regexBlockhash.test(searchText);
          const matchesBlockHash = this.regexBlockhash.test(searchText);
          const matchesAddress = this.regexAddress.test(searchText);

          if (matchesAddress && this.network === 'bisq') {
            searchText = 'B' + searchText;
          }

          return {
            searchText: searchText,
            hashQuickMatch: +(matchesBlockHeight || matchesBlockHash || matchesTxId || matchesAddress),
            blockHeight: matchesBlockHeight,
            txId: matchesTxId,
            blockHash: matchesBlockHash,
            address: matchesAddress,
            addresses: addressPrefixSearchResults,
            nodes: lightningResults.nodes,
            channels: lightningResults.channels,
          };
        })
      );
  }

  handleKeyDown($event): void {
    this.searchResults.handleKeyDown($event);
  }

  itemSelected(): void {
    setTimeout(() => this.search());
  }

  selectedResult(result: any): void {
    if (typeof result === 'string') {
      this.search(result);
    } else if (typeof result === 'number') {
      this.navigate('/block/', result.toString());
    } else if (result.alias) {
      this.navigate('/lightning/node/', result.public_key);
    } else if (result.short_id) {
      this.navigate('/lightning/channel/', result.id);
    }
  }

  search(result?: string): void {
    const searchText = result || this.searchForm.value.searchText.trim();
    if (searchText) {
      this.isSearching = true;
      if (this.regexAddress.test(searchText)) {
        this.navigate('/address/', searchText);
      } else if (this.regexBlockhash.test(searchText) || this.regexBlockheight.test(searchText)) {
        this.navigate('/block/', searchText);
      } else if (this.regexTransaction.test(searchText)) {
        const matches = this.regexTransaction.exec(searchText);
        if (this.network === 'liquid' || this.network === 'liquidtestnet') {
          if (this.assets[matches[1]]) {
            this.navigate('/assets/asset/', matches[1]);
          }
          this.electrsApiService.getAsset$(matches[1])
            .subscribe(
              () => { this.navigate('/assets/asset/', matches[1]); },
              () => {
                this.electrsApiService.getBlock$(matches[1])
                  .subscribe(
                    (block) => { this.navigate('/block/', matches[1], { state: { data: { block } } }); },
                    () => { this.navigate('/tx/', matches[0]); });
              }
            );
        } else {
          this.navigate('/tx/', matches[0]);
        }
      } else {
        this.searchResults.searchButtonClick();
        this.isSearching = false;
      }
    }
  }

  navigate(url: string, searchText: string, extras?: any): void {
    this.router.navigate([this.relativeUrlPipe.transform(url), searchText], extras);
    this.searchTriggered.emit();
    this.searchForm.setValue({
      searchText: '',
    });
    this.isSearching = false;
  }
}
