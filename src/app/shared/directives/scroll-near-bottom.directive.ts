import {
  Directive,
  NgZone,
  OnInit,
  inject,
  input,
  output,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { filter, throttleTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive({
  selector: '[appScrollNearBottom]',
  standalone: true,
})
export class ScrollNearBottomDirective implements OnInit {
  threshold = input<number>(0.9);
  debounceTime = input<number>(100);

  nearBottom = output<void>();

  private viewport = inject(CdkVirtualScrollViewport, { optional: true });
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (!this.viewport) new Subject<Event>();

    this.viewport
      ?.elementScrolled()
      .pipe(
        throttleTime(this.debounceTime(), undefined, {
          trailing: true,
          leading: false,
        }),
        filter(() => this.isNearBottom()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.nearBottom.emit();
        });
      });
  }

  private isNearBottom(): boolean {
    if (!this.viewport) return false;
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    return total > 0 && end >= total * this.threshold();
  }
}
