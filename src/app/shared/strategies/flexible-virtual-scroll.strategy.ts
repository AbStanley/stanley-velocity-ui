import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { Injectable, OnDestroy, NgZone, inject } from '@angular/core';
import { debounce, debounceTime, Subject } from 'rxjs';
import { UI_CONSTANTS } from '../../core/constants/ui.constants';

/**
 * A reusable Virtual Scroll Strategy for mixed item types (headers + items).
 * Uses overlay-based expansion, so item heights are fixed.
 */

interface VirtualScrollItem {
  type: 'header' | 'item';
}

@Injectable()
export class FlexibleVirtualScrollStrategy
  implements VirtualScrollStrategy, OnDestroy {
  scrolledIndexChange = new Subject<number>();
  private scrollSubject = new Subject<void>();

  private viewport: CdkVirtualScrollViewport | null = null;
  private items: VirtualScrollItem[] = [];
  private accumulatedOffsets: number[] = [0];
  private isMobile = false;

  private resizeObserver: ResizeObserver | null = null;
  private readonly ngZone = inject(NgZone);
  private lastViewportSize = 0;

  constructor() {
    this.scrollSubject
      .pipe(debounceTime(16))
      .subscribe(() => this.updateRenderedRange());
  }

  attach(viewport: CdkVirtualScrollViewport) {
    this.viewport = viewport;
    this.updateTotalSize();
    this.updateRenderedRange();

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        this.ngZone.run(() => {
          this.lastViewportSize = entry.contentRect.height;
          this.updateRenderedRange();
        });
      }
    });

    this.resizeObserver.observe(viewport.elementRef.nativeElement);
  }

  detach() {
    this.scrolledIndexChange.complete();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.viewport = null;
    this.items = [];
    this.accumulatedOffsets = [0];
  }

  onContentScrolled() {
    this.scrollSubject.next();
  }

  onDataLengthChanged() {
    this.recalculateOffsets();
  }

  onContentRendered() { }
  onRenderedOffsetChanged() { }

  scrollToIndex(index: number, behavior: ScrollBehavior) {
    if (!this.viewport) return;

    const maxIndex = this.accumulatedOffsets.length - 1;
    const safeIndex = Math.max(0, Math.min(index, maxIndex));

    if (safeIndex >= 0 && safeIndex < this.accumulatedOffsets.length - 1) {
      this.viewport.scrollToOffset(this.accumulatedOffsets[index], behavior);
    }
  }

  setMobileMode(isMobile: boolean) {
    if (this.isMobile !== isMobile) {
      this.isMobile = isMobile;
      this.recalculateOffsets();
    }
  }

  setData(items: any[]) {
    this.items = items || [];
    this.recalculateOffsets();
  }

  /**
   * Recalculates accumulated heights offsets for ALL items.
   * should be called whenever items change or mobile mode toggles
   * @private
   */

  private recalculateOffsets() {
    this.accumulatedOffsets = [0];
    let current = 0;

    const headerSize = UI_CONSTANTS.HEADER_HEIGHT;
    const itemSize = this.isMobile
      ? UI_CONSTANTS.ITEM_HEIGHT_MOBILE
      : UI_CONSTANTS.ITEM_HEIGHT_DESKTOP;

    for (const item of this.items) {
      const height = item.type === 'header' ? headerSize : itemSize;
      current += height + UI_CONSTANTS.LIST_GAP;
      this.accumulatedOffsets.push(current);
    }

    this.updateTotalSize();
    this.updateRenderedRange();
  }

  private updateTotalSize() {
    if (this.viewport) {
      const total =
        this.accumulatedOffsets[this.accumulatedOffsets.length - 1] || 0;
      this.viewport.setTotalContentSize(total);
    }
  }

  private updateRenderedRange() {
    if (!this.viewport || this.items.length === 0) {
      this.viewport?.setRenderedRange({ start: 0, end: 0 });
      return;
    }

    const scrollOffset = Math.max(0, this.viewport.measureScrollOffset());
    const currentViewportSize = this.viewport.getViewportSize();

    if (currentViewportSize > 0) {
      this.lastViewportSize = currentViewportSize;
    }

    const effectiveViewportSize = this.lastViewportSize || currentViewportSize || window.innerHeight || 1000;

    const startPixel = Math.max(0, scrollOffset - UI_CONSTANTS.SCROLL_BUFFER);
    const endPixel = scrollOffset + effectiveViewportSize + UI_CONSTANTS.SCROLL_BUFFER;

    const start = this.findOffsetIndex(startPixel);
    const end = Math.min(this.items.length, this.findOffsetIndex(endPixel) + 4);

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(this.accumulatedOffsets[start] || 0);
    this.scrolledIndexChange.next(start);
  }

  private findOffsetIndex(offset: number): number {
    if (this.items.length === 0) return 0;

    const totalHeight =
      this.accumulatedOffsets[this.accumulatedOffsets.length - 1];
    if (offset >= totalHeight) {
      return Math.max(0, this.items.length - 1);
    }

    let low = 0;
    let high = this.items.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (offset < this.accumulatedOffsets[mid]) {
        high = mid;
      } else if (offset >= this.accumulatedOffsets[mid + 1]) {
        low = mid + 1;
      } else {
        return mid;
      }
    }
    return Math.max(0, low - 1);
  }

  ngOnDestroy(): void {
    this.scrolledIndexChange.complete();
    this.resizeObserver?.disconnect();
  }
}