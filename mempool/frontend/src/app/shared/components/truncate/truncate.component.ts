import { Component, Input, Inject, LOCALE_ID, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruncateComponent {
  @Input() text: string;
  @Input() link: any = null;
  @Input() lastChars: number = 4;
  @Input() maxWidth: number = null;
  rtl: boolean;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
  ) {
    if (this.locale.startsWith('ar') || this.locale.startsWith('fa') || this.locale.startsWith('he')) {
      this.rtl = true;
    }
  }
}
