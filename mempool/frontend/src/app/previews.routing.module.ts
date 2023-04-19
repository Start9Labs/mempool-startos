import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionPreviewComponent } from './components/transaction/transaction-preview.component';
import { BlockPreviewComponent } from './components/block/block-preview.component';
import { AddressPreviewComponent } from './components/address/address-preview.component';
import { PoolPreviewComponent } from './components/pool/pool-preview.component';
import { MasterPagePreviewComponent } from './components/master-page-preview/master-page-preview.component';

const routes: Routes = [
  {
    path: '',
    component: MasterPagePreviewComponent,
    children: [
      {
        path: 'block/:id',
        component: BlockPreviewComponent
      },
      {
        path: 'address/:id',
        children: [],
        component: AddressPreviewComponent
      },
      {
        path: 'tx/:id',
        children: [],
        component: TransactionPreviewComponent
      },
      {
        path: 'mining/pool/:slug',
        component: PoolPreviewComponent
      },
      {
        path: 'lightning',
        loadChildren: () => import('./lightning/lightning-previews.module').then(m => m.LightningPreviewsModule)
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreviewsRoutingModule { }
