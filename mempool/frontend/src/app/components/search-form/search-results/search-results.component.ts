import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnChanges {
  @Input() results: any = {};
  @Output() selectedResult = new EventEmitter();

  isMobile = (window.innerWidth <= 767.98);
  resultsFlattened = [];
  activeIdx = 0;
  focusFirst = true;

  constructor(
    public stateService: StateService,
    ) { }

  ngOnChanges() {
    this.activeIdx = 0;
    if (this.results) {
      this.resultsFlattened = [...(this.results.hashQuickMatch ? [this.results.searchText] : []), ...this.results.addresses, ...this.results.nodes, ...this.results.channels];
    }
  }

  searchButtonClick() {
    if (this.resultsFlattened[this.activeIdx]) {
      this.selectedResult.emit(this.resultsFlattened[this.activeIdx]);
      this.results = null;
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.prev();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.resultsFlattened[this.activeIdx]) {
          this.selectedResult.emit(this.resultsFlattened[this.activeIdx]);
        } else {
          this.selectedResult.emit(this.results.searchText);
        }
        this.results = null;
        break;
    }
  }

  clickItem(id: number) {
    this.selectedResult.emit(this.resultsFlattened[id]);
    this.results = null;
  }

  next() {
    if (this.activeIdx === this.resultsFlattened.length - 1) {
      this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.resultsFlattened.length : -1;
    } else {
      this.activeIdx++;
    }
  }

  prev() {
    if (this.activeIdx < 0) {
      this.activeIdx = this.resultsFlattened.length - 1;
    } else if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.resultsFlattened.length - 1 : -1;
    } else {
      this.activeIdx--;
    }
  }

}
