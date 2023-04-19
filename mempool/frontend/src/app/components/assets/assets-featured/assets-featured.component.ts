import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-assets-featured',
  templateUrl: './assets-featured.component.html',
  styleUrls: ['./assets-featured.component.scss']
})
export class AssetsFeaturedComponent implements OnInit {
  featuredAssets$: Observable<any>;

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.featuredAssets$ = this.apiService.listFeaturedAssets$();
  }

}
