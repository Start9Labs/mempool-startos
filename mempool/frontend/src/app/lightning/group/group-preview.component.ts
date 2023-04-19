import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap, Observable, catchError, of } from 'rxjs';
import { SeoService } from '../../services/seo.service';
import { OpenGraphService } from '../../services/opengraph.service';
import { GeolocationData } from '../../shared/components/geolocation/geolocation.component';
import { LightningApiService } from '../lightning-api.service';

interface NodeGroup {
  name: string;
  description: string;
}

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: ['./group-preview.component.scss']
})
export class GroupPreviewComponent implements OnInit {
  nodes$: Observable<any>;
  group: NodeGroup = { name: '', description: '' };
  slug: string;
  groupId: string;

  constructor(
    private lightningApiService: LightningApiService,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private openGraphService: OpenGraphService,
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle(`Mempool.Space Lightning Nodes`);

    this.nodes$ = this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.slug = params.get('slug');
          this.openGraphService.waitFor('ln-group-map-' + this.slug);
          this.openGraphService.waitFor('ln-group-data-' + this.slug);

          if (this.slug === 'the-mempool-open-source-project') {
            this.groupId = 'mempool.space';
            this.group = {
              name: 'The Mempool Open Source Project',
              description: 'These are the Lightning nodes operated by The Mempool Open Source Project that provide data for the mempool.space website. Connect to us!',
            };
          } else {
            this.group = {
              name: this.slug.replace(/-/gi, ' '),
              description: '',
            };
            this.openGraphService.fail('ln-group-map-' + this.slug);
            this.openGraphService.fail('ln-group-data-' + this.slug);
            return of(null);
          }

          return this.lightningApiService.getNodGroupNodes$(this.groupId);
        }),
        map((nodes) => {
          for (const node of nodes) {
            const socketsObject = [];
            for (const socket of node.sockets.split(',')) {
              if (socket === '') {
                continue;
              }
              let label = '';
              if (socket.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)) {
                label = 'IPv4';
              } else if (socket.indexOf('[') > -1) {
                label = 'IPv6';
              } else if (socket.indexOf('onion') > -1) {
                label = 'Tor';
              }
              socketsObject.push({
                label: label,
                socket: node.public_key + '@' + socket,
              });
            }
            // @ts-ignore
            node.socketsObject = socketsObject;

            if (!node?.country && !node?.city &&
              !node?.subdivision) {
                // @ts-ignore
                node.geolocation = null;
            } else {
              // @ts-ignore
              node.geolocation = <GeolocationData>{
                country: node.country?.en,
                city: node.city?.en,
                subdivision: node.subdivision?.en,
                iso: node.iso_code,
              };
            }
          }
          const sumLiquidity = nodes.reduce((partialSum, a) => partialSum + parseInt(a.capacity, 10), 0);
          const sumChannels = nodes.reduce((partialSum, a) => partialSum + a.opened_channel_count, 0);

          this.openGraphService.waitOver('ln-group-data-' + this.slug);

          return {
            nodes: nodes,
            sumLiquidity: sumLiquidity,
            sumChannels: sumChannels,
          };
        }),
        catchError(() => {
          this.openGraphService.fail('ln-group-map-' + this.slug);
          this.openGraphService.fail('ln-group-data-' + this.slug);
          return of({
            nodes: [],
            sumLiquidity: 0,
            sumChannels: 0,
          });
        })
      );
  }

  onMapReady(): void {
    this.openGraphService.waitOver('ln-group-map-' + this.slug);
  }

}
