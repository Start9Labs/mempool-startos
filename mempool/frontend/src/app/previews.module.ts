import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { GraphsModule } from './graphs/graphs.module';
import { PreviewsRoutingModule } from './previews.routing.module';
import { TransactionPreviewComponent } from './components/transaction/transaction-preview.component';
import { BlockPreviewComponent } from './components/block/block-preview.component';
import { AddressPreviewComponent } from './components/address/address-preview.component';
import { PoolPreviewComponent } from './components/pool/pool-preview.component';
import { MasterPagePreviewComponent } from './components/master-page-preview/master-page-preview.component';
@NgModule({
  declarations: [
    TransactionPreviewComponent,
    BlockPreviewComponent,
    AddressPreviewComponent,
    PoolPreviewComponent,
    MasterPagePreviewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    PreviewsRoutingModule,
    GraphsModule,
  ],
})
export class PreviewsModule { }
