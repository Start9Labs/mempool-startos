import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { INodesRanking, ITopNodesPerChannels } from '../../../interfaces/node-api.interface';
import { StateService } from '../../../services/state.service';
import { GeolocationData } from '../../../shared/components/geolocation/geolocation.component';
import { LightningApiService } from '../../lightning-api.service';

@Component({
  selector: 'app-top-nodes-per-channels',
  templateUrl: './top-nodes-per-channels.component.html',
  styleUrls: ['./top-nodes-per-channels.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNodesPerChannels implements OnInit {
  @Input() nodes$: Observable<INodesRanking>;
  @Input() widget: boolean = false;
  
  topNodesPerChannels$: Observable<ITopNodesPerChannels[]>;
  skeletonRows: number[] = [];
  currency$: Observable<string>;

  constructor(
    private apiService: LightningApiService,
    private stateService: StateService,
  ) {}

  ngOnInit(): void {
    this.currency$ = this.stateService.fiatCurrency$;
    
    for (let i = 1; i <= (this.widget ? 6 : 100); ++i) {
      this.skeletonRows.push(i);
    }

    if (this.widget === false) {
      this.topNodesPerChannels$ = this.apiService.getTopNodesByChannels$().pipe(
        map((ranking) => {
          for (const i in ranking) {
            ranking[i].geolocation = <GeolocationData>{
              country: ranking[i].country?.en,
              city: ranking[i].city?.en,
              subdivision: ranking[i].subdivision?.en,
              iso: ranking[i].iso_code,
            };
          }
          return ranking;
        })
      );
    } else {
      this.topNodesPerChannels$ = this.nodes$.pipe(
        map((ranking) => {
          for (const i in ranking.topByChannels) {
            ranking.topByChannels[i].geolocation = <GeolocationData>{
              country: ranking.topByChannels[i].country?.en,
              city: ranking.topByChannels[i].city?.en,
              subdivision: ranking.topByChannels[i].subdivision?.en,
              iso: ranking.topByChannels[i].iso_code,
            };
          }
          return ranking.topByChannels.slice(0, 6);
        })
      );
    }
  }

}
