import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit, HostBinding } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { merge, Observable } from 'rxjs';
import { map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { SeoService } from '../../services/seo.service';
import { StorageService } from '../..//services/storage.service';
import { MiningService, MiningStats } from '../../services/mining.service';
import { StateService } from '../../services/state.service';
import { chartColors, poolsColor } from '../../app.constants';
import { RelativeUrlPipe } from '../../shared/pipes/relative-url/relative-url.pipe';
import { download } from '../../shared/graphs.utils';
import { isMobile } from '../../shared/common.utils';

@Component({
  selector: 'app-pool-ranking',
  templateUrl: './pool-ranking.component.html',
  styleUrls: ['./pool-ranking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolRankingComponent implements OnInit {
  @Input() widget = false;

  miningWindowPreference: string;
  radioGroupForm: UntypedFormGroup;

  auditAvailable = false;
  indexingAvailable = false;
  isLoading = true;
  chartOptions: EChartsOption = {};
  chartInitOptions = {
    renderer: 'svg',
  };
  timespan = '';
  chartInstance: any = undefined;

  @HostBinding('attr.dir') dir = 'ltr';

  miningStatsObservable$: Observable<MiningStats>;

  constructor(
    private stateService: StateService,
    private storageService: StorageService,
    private formBuilder: UntypedFormBuilder,
    private miningService: MiningService,
    private seoService: SeoService,
    private router: Router,
    private zone: NgZone,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    if (this.widget) {
      this.miningWindowPreference = '1w';
    } else {
      this.seoService.setTitle($localize`:@@mining.mining-pools:Mining Pools`);
      this.miningWindowPreference = this.miningService.getDefaultTimespan('24h');
    }
    this.radioGroupForm = this.formBuilder.group({ dateSpan: this.miningWindowPreference });
    this.radioGroupForm.controls.dateSpan.setValue(this.miningWindowPreference);

    this.indexingAvailable = (this.stateService.env.BASE_MODULE === 'mempool' &&
      this.stateService.env.MINING_DASHBOARD === true);
    this.auditAvailable = this.indexingAvailable && this.stateService.env.AUDIT;

    this.route
      .fragment
      .subscribe((fragment) => {
        if (['24h', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'].indexOf(fragment) > -1) {
          this.radioGroupForm.controls.dateSpan.setValue(fragment, { emitEvent: false });
        }
      });

    this.miningStatsObservable$ = merge(
      this.radioGroupForm.get('dateSpan').valueChanges
        .pipe(
          startWith(this.radioGroupForm.controls.dateSpan.value), // (trigger when the page loads)
          tap((value) => {
            this.isLoading = true;
            this.timespan = value;
            if (!this.widget) {
              this.storageService.setValue('miningWindowPreference', value);
            }
            this.miningWindowPreference = value;
          }),
          switchMap(() => {
            return this.miningService.getMiningStats(this.miningWindowPreference);
          })
        ),
        this.stateService.chainTip$
          .pipe(
            switchMap(() => {
              return this.miningService.getMiningStats(this.miningWindowPreference);
            })
          )
      )
      .pipe(
        map(data => {
          data['minersLuck'] = (100 * (data.blockCount / 1008)).toFixed(2); // luck 1w
          return data;
        }),
        tap(data => {
          this.isLoading = false;
          this.prepareChartOptions(data);
        }),
        share()
      );
  }

  generatePoolsChartSerieData(miningStats) {
    let poolShareThreshold = 0.5;
    if (isMobile()) {
      poolShareThreshold = 2;
    } else if (this.widget) {
      poolShareThreshold = 1;
    }
    
    const data: object[] = [];
    let totalShareOther = 0;
    let totalBlockOther = 0;
    let totalEstimatedHashrateOther = 0;

    let edgeDistance: any = '20%';
    if (isMobile() && this.widget) {
      edgeDistance = 0;
    } else if (isMobile() && !this.widget || this.widget) {
      edgeDistance = 10;
    }

    miningStats.pools.forEach((pool) => {
      if (parseFloat(pool.share) < poolShareThreshold) {
        totalShareOther += parseFloat(pool.share);
        totalBlockOther += pool.blockCount;
        totalEstimatedHashrateOther += pool.lastEstimatedHashrate;
        return;
      }
      data.push({
        itemStyle: {
          color: poolsColor[pool.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()],
        },
        value: pool.share,
        name: pool.name + ((isMobile() || this.widget) ? `` : ` (${pool.share}%)`),
        label: {
          overflow: 'none',
          color: '#b1b1b1',
          alignTo: 'edge',
          edgeDistance: edgeDistance,
        },
        tooltip: {
          show: !isMobile() || !this.widget,
          backgroundColor: 'rgba(17, 19, 31, 1)',
          borderRadius: 4,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          textStyle: {
            color: '#b1b1b1',
          },
          borderColor: '#000',
          formatter: () => {
            const i = pool.blockCount.toString();
            if (this.miningWindowPreference === '24h') {
              return `<b style="color: white">${pool.name} (${pool.share}%)</b><br>` +
                pool.lastEstimatedHashrate.toString() + ' PH/s' +
                `<br>` + $localize`${ i }:INTERPOLATION: blocks`;
            } else {
              return `<b style="color: white">${pool.name} (${pool.share}%)</b><br>` +
                $localize`${ i }:INTERPOLATION: blocks`;
            }
          }
        },
        data: pool.slug,
      } as PieSeriesOption);
    });

    // 'Other'
    data.push({
      itemStyle: {
        color: '#6b6b6b',
      },
      value: totalShareOther,
      name: 'Other' + (isMobile() ? `` : ` (${totalShareOther.toFixed(2)}%)`),
      label: {
        overflow: 'none',
        color: '#b1b1b1',
        alignTo: 'edge',
        edgeDistance: edgeDistance
      },
      tooltip: {
        backgroundColor: 'rgba(17, 19, 31, 1)',
        borderRadius: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#b1b1b1',
        },
        borderColor: '#000',
        formatter: () => {
          const percentage = totalShareOther.toFixed(2) + '%';
          const i = totalBlockOther.toString();
          if (this.miningWindowPreference === '24h') {
            return `<b style="color: white">` + $localize`Other (${percentage})` + `</b><br>` +
              totalEstimatedHashrateOther.toString() + ' PH/s' +
              `<br>` + $localize`${ i }:INTERPOLATION: blocks`;
          } else {
            return `<b style="color: white">` + $localize`Other (${percentage})` + `</b><br>` +
              $localize`${ i }:INTERPOLATION: blocks`;
          }
        }
      },
      data: 9999 as any,
    } as PieSeriesOption);

    return data;
  }

  prepareChartOptions(miningStats) {
    let pieSize = ['20%', '80%']; // Desktop
    if (isMobile() && !this.widget) {
      pieSize = ['15%', '60%'];
    }

    this.chartOptions = {
      animation: false,
      color: chartColors.filter(color => color !== '#FDD835'),
      tooltip: {
        trigger: 'item',
        textStyle: {
          align: 'left',
        }
      },
      series: [
        {
          zlevel: 0,
          minShowLabelAngle: 1.8,
          name: 'Mining pool',
          type: 'pie',
          radius: pieSize,
          data: this.generatePoolsChartSerieData(miningStats),
          labelLine: {
            lineStyle: {
              width: 2,
            },
          },
          label: {
            fontSize: 14,
            formatter: (serie) => `${serie.name === 'Binance Pool' ? 'Binance\nPool' : serie.name}`,
          },
          itemStyle: {
            borderRadius: 1,
            borderWidth: 1,
            borderColor: '#000',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 40,
              shadowColor: 'rgba(0, 0, 0, 0.75)',
            },
            labelLine: {
              lineStyle: {
                width: 3,
              }
            }
          }
        }
      ],
    };
  }

  onChartInit(ec) {
    if (this.chartInstance !== undefined) {
      return;
    }

    this.chartInstance = ec;
    this.chartInstance.on('click', (e) => {
      if (e.data.data === 9999) { // "Other"
        return;
      }
      this.zone.run(() => {
        const url = new RelativeUrlPipe(this.stateService).transform(`/mining/pool/${e.data.data}`);
        this.router.navigate([url]);
      });
    });
  }

  /**
   * Default mining stats if something goes wrong
   */
  getEmptyMiningStat(): MiningStats {
    return {
      lastEstimatedHashrate: 'Error',
      blockCount: 0,
      totalEmptyBlock: 0,
      totalEmptyBlockRatio: '',
      pools: [],
      totalBlockCount: 0,
      miningUnits: {
        hashrateDivider: 1,
        hashrateUnit: '',
      },
    };
  }

  onSaveChart() {
    const now = new Date();
    this.chartOptions.backgroundColor = '#11131f';
    this.chartInstance.setOption(this.chartOptions);
    download(this.chartInstance.getDataURL({
      pixelRatio: 2,
      excludeComponents: ['dataZoom'],
    }), `pools-ranking-${this.timespan}-${Math.round(now.getTime() / 1000)}.svg`);
    this.chartOptions.backgroundColor = 'none';
    this.chartInstance.setOption(this.chartOptions);
  }

  isEllipsisActive(e) {
    return (e.offsetWidth < e.scrollWidth);
  }
}

