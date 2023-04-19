import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ElectrsApiService } from '../../services/electrs-api.service';
import { switchMap, filter, catchError, map, tap } from 'rxjs/operators';
import { Address, Transaction } from '../../interfaces/electrs.interface';
import { StateService } from '../../services/state.service';
import { OpenGraphService } from '../../services/opengraph.service';
import { AudioService } from '../../services/audio.service';
import { ApiService } from '../../services/api.service';
import { of, merge, Subscription, Observable } from 'rxjs';
import { SeoService } from '../../services/seo.service';
import { AddressInformation } from '../../interfaces/node-api.interface';

@Component({
  selector: 'app-address-preview',
  templateUrl: './address-preview.component.html',
  styleUrls: ['./address-preview.component.scss']
})
export class AddressPreviewComponent implements OnInit, OnDestroy {
  network = '';

  rawAddress: string;
  address: Address;
  addressString: string;
  isLoadingAddress = true;
  error: any;
  mainSubscription: Subscription;
  addressLoadingStatus$: Observable<number>;
  addressInfo: null | AddressInformation = null;

  totalConfirmedTxCount = 0;
  loadedConfirmedTxCount = 0;
  txCount = 0;
  received = 0;
  sent = 0;
  totalUnspent = 0;

  constructor(
    private route: ActivatedRoute,
    private electrsApiService: ElectrsApiService,
    private stateService: StateService,
    private apiService: ApiService,
    private seoService: SeoService,
    private openGraphService: OpenGraphService,
  ) { }

  ngOnInit() {
    this.stateService.networkChanged$.subscribe((network) => this.network = network);

    this.addressLoadingStatus$ = this.route.paramMap
      .pipe(
        switchMap(() => this.stateService.loadingIndicators$),
        map((indicators) => indicators['address-' + this.addressString] !== undefined ? indicators['address-' + this.addressString] : 0)
      );

    this.mainSubscription = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.rawAddress = params.get('id') || '';
          this.openGraphService.waitFor('address-data-' + this.rawAddress);
          this.error = undefined;
          this.isLoadingAddress = true;
          this.loadedConfirmedTxCount = 0;
          this.address = null;
          this.addressInfo = null;
          this.addressString = params.get('id') || '';
          if (/^[A-Z]{2,5}1[AC-HJ-NP-Z02-9]{8,100}$/.test(this.addressString)) {
            this.addressString = this.addressString.toLowerCase();
          }
          this.seoService.setTitle($localize`:@@address.component.browser-title:Address: ${this.addressString}:INTERPOLATION:`);

          return this.electrsApiService.getAddress$(this.addressString)
            .pipe(
              catchError((err) => {
                this.isLoadingAddress = false;
                this.error = err;
                console.log(err);
                this.openGraphService.fail('address-data-' + this.rawAddress);
                return of(null);
              })
            );
        })
      )
      .pipe(
        filter((address) => !!address),
        tap((address: Address) => {
          if ((this.stateService.network === 'liquid' || this.stateService.network === 'liquidtestnet') && /^([m-zA-HJ-NP-Z1-9]{26,35}|[a-z]{2,5}1[ac-hj-np-z02-9]{8,100}|[a-km-zA-HJ-NP-Z1-9]{80})$/.test(address.address)) {
            this.apiService.validateAddress$(address.address)
              .subscribe((addressInfo) => {
                this.addressInfo = addressInfo;
              });
          }
          this.address = address;
          this.updateChainStats();
          this.isLoadingAddress = false;
          this.openGraphService.waitOver('address-data-' + this.rawAddress);
        })
      )
      .subscribe(() => {},
        (error) => {
          console.log(error);
          this.error = error;
          this.isLoadingAddress = false;
          this.openGraphService.fail('address-data-' + this.rawAddress);
        }
      );
  }

  updateChainStats() {
    this.received = this.address.chain_stats.funded_txo_sum + this.address.mempool_stats.funded_txo_sum;
    this.sent = this.address.chain_stats.spent_txo_sum + this.address.mempool_stats.spent_txo_sum;
    this.txCount = this.address.chain_stats.tx_count + this.address.mempool_stats.tx_count;
    this.totalConfirmedTxCount = this.address.chain_stats.tx_count;
    this.totalUnspent = this.address.chain_stats.funded_txo_count - this.address.chain_stats.spent_txo_count;
  }

  ngOnDestroy() {
    this.mainSubscription.unsubscribe();
  }
}
