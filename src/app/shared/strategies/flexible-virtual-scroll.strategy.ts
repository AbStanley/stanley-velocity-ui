import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { UI_CONSTANTS } from '../../core/constants/ui.constants';

/**
 * A reusable Virtual Scroll Strategy for mixed item types (headers + items).
 * Uses overlay-based expansion, so item heights are fixed.
 */
@Injectable()
export class FlexibleVirtualScrollStrategy implements VirtualScrollStrategy, OnDestroy {
    scrolledIndexChange = new Subject<number>();

    private viewport: CdkVirtualScrollViewport | null = null;
    private items: any[] = [];
    private accumulatedOffsets: number[] = [0];
    private isMobile = false;

    attach(viewport: CdkVirtualScrollViewport) {
        this.viewport = viewport;
        this.updateTotalSize();
        this.updateRenderedRange();
    }

    detach() {
        this.scrolledIndexChange.complete();
        this.viewport = null;
    }

    onContentScrolled() {
        this.updateRenderedRange();
    }

    onDataLengthChanged() {
        this.recalculateOffsets();
    }

    onContentRendered() { }
    onRenderedOffsetChanged() { }

    scrollToIndex(index: number, behavior: ScrollBehavior) {
        if (this.viewport && index >= 0 && index < this.accumulatedOffsets.length - 1) {
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
        this.items = items;
        this.recalculateOffsets();
    }

    private recalculateOffsets() {
        this.accumulatedOffsets = [0];
        let current = 0;

        const headerSize = UI_CONSTANTS.HEADER_HEIGHT;
        const itemSize = this.isMobile
            ? UI_CONSTANTS.ITEM_HEIGHT_MOBILE
            : UI_CONSTANTS.ITEM_HEIGHT_DESKTOP;

        for (const item of this.items) {
            const height = item.type === 'header' ? headerSize : itemSize;
            current += height;
            this.accumulatedOffsets.push(current);
        }

        this.updateTotalSize();
        this.updateRenderedRange();
    }

    private updateTotalSize() {
        if (this.viewport) {
            const total = this.accumulatedOffsets[this.accumulatedOffsets.length - 1] || 0;
            this.viewport.setTotalContentSize(total);
        }
    }

    private updateRenderedRange() {
        if (!this.viewport) return;

        const scrollOffset = this.viewport.measureScrollOffset();
        const viewportSize = this.viewport.getViewportSize();

        if (this.items.length === 0) {
            this.viewport.setRenderedRange({ start: 0, end: 0 });
            return;
        }

        const startPixel = Math.max(0, scrollOffset - UI_CONSTANTS.SCROLL_BUFFER);
        const endPixel = scrollOffset + viewportSize + UI_CONSTANTS.SCROLL_BUFFER;

        const start = this.findOffsetIndex(startPixel);
        let end = this.findOffsetIndex(endPixel);
        end = Math.min(this.items.length, end + 2);

        this.viewport.setRenderedRange({ start, end });
        this.viewport.setRenderedContentOffset(this.accumulatedOffsets[start]);
        this.scrolledIndexChange.next(start);
    }

    private findOffsetIndex(offset: number): number {
        if (this.items.length === 0) return 0;

        const totalHeight = this.accumulatedOffsets[this.accumulatedOffsets.length - 1];
        if (offset >= totalHeight) {
            return this.items.length - 1;
        }

        // A quick inary search for the item containing this offset
        let low = 0;
        let high = this.items.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const itemStart = this.accumulatedOffsets[mid];
            const itemEnd = this.accumulatedOffsets[mid + 1];

            if (offset >= itemStart && offset < itemEnd) {
                return mid;
            } else if (offset < itemStart) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return 0;
    }

    ngOnDestroy(): void {
        this.scrolledIndexChange.complete();
    }
}
