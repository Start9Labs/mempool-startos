import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private router: Router, private route: ActivatedRoute) {
    this.setDefaultValueIfNeeded('graphWindowPreference', '2h');
    this.setDefaultValueIfNeeded('miningWindowPreference', '1w');
  }

  setDefaultValueIfNeeded(key: string, defaultValue: string) {
    const graphWindowPreference: string = this.getValue(key);
    if (graphWindowPreference === null) { // First visit to mempool.space
      if (this.router.url.includes('graphs') && key === 'graphWindowPreference' ||
        this.router.url.includes('pools') && key === 'miningWindowPreference'
      ) {
        this.setValue(key, this.route.snapshot.fragment ? this.route.snapshot.fragment : defaultValue);
      } else {
        this.setValue(key, defaultValue);
      }
    } else if (this.router.url.includes('graphs') && key === 'graphWindowPreference' ||
      this.router.url.includes('pools') && key === 'miningWindowPreference'
    ) {
      // Visit a different graphs#fragment from last visit
      if (this.route.snapshot.fragment !== null && graphWindowPreference !== this.route.snapshot.fragment) {
        this.setValue(key, this.route.snapshot.fragment);
      }
    }
  }

  getValue(key: string): string {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.log(e);
      return '';
    }
  }

  setValue(key: string, value: any): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.log(e);
    }
  }
}
