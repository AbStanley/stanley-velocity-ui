import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output, ElementRef, NgZone } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter, throttleTime } from 'rxjs/operators';

@Directive({
    selector: '[appScrollNearBottom]',
    standalone: true
})
export class ScrollNearBottomDirective implements OnInit, OnDestroy {
    @Input() threshold = 0.9; // 90% scrolled
    @Input() debounceTime = 100;

    @Output() nearBottom = new EventEmitter<void>();

    private destroy$ = new Subject<void>();
    private scrollSubscription: Subscription | null = null;

    constructor(
        private element: ElementRef,
        private ngZone: NgZone,
        // Optional injection in case it's used on a CdkVirtualScrollViewport
        private viewport?: CdkVirtualScrollViewport
    ) { }

    ngOnInit() {
        this.setupScrollListener();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.scrollSubscription?.unsubscribe();
    }

    private setupScrollListener() {
        const scrollStream$ = this.viewport
            ? this.viewport.elementScrolled()
            : new Subject<Event>(); // Fallback if not on viewport, but we primarily target CdkVirtualScroll

        // If not using CdkVirtualScroll, we'd bind to host listener, but for this specific Refactor,
        // we know it's for VirtualScroll.

        this.scrollSubscription = scrollStream$.pipe(
            throttleTime(this.debounceTime, undefined, { trailing: true, leading: false }),
            filter(() => this.isNearBottom())
        ).subscribe(() => {
            this.ngZone.run(() => this.nearBottom.emit());
        });
    }

    private isNearBottom(): boolean {
        if (this.viewport) {
            const end = this.viewport.getRenderedRange().end;
            const total = this.viewport.getDataLength();
            // Safeguard against 0 data
            return total > 0 && end >= total * this.threshold;
        }
        return false;
    }
}
