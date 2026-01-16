import { Component, ChangeDetectionStrategy, inject, OnInit, ViewChild, AfterViewInit, effect, untracked, signal, DestroyRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule, VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService, UserListItem } from '../../services/users.service';
import { UsersListStateService } from '../../services/users-list-state.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { GroupingCriteria } from '../../models/user.model';

const HEADER_SIZE = 50;

@Injectable()
class MixedItemSizeStrategy implements VirtualScrollStrategy {
  scrolledIndexChange = new Subject<number>();
  private viewport: CdkVirtualScrollViewport | null = null;
  private items: UserListItem[] = [];
  private accumulatedOffsets: number[] = [0];
  private userHeight = 120;

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
    this.updateTotalSize();
    this.updateRenderedRange();
  }

  onContentRendered() { }
  onRenderedOffsetChanged() { }

  scrollToIndex(index: number, behavior: ScrollBehavior) {
    if (this.viewport && index >= 0 && index < this.accumulatedOffsets.length - 1) {
      this.viewport.scrollToOffset(this.accumulatedOffsets[index], behavior);
    }
  }

  updateConfig(userHeight: number) {
    this.userHeight = userHeight;
    this.recalculateOffsets();
  }

  setData(items: UserListItem[]) {
    this.items = items;
    this.recalculateOffsets();
  }

  private recalculateOffsets() {
    this.accumulatedOffsets = [0];
    let current = 0;
    for (const item of this.items) {
      const h = item.type === 'header' ? HEADER_SIZE : this.userHeight;
      current += h;
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

    const BUFFER = 400;
    const startPixel = Math.max(0, scrollOffset - BUFFER);
    const endPixel = scrollOffset + viewportSize + BUFFER;

    const start = this.findOffsetIndex(startPixel);
    const end = Math.min(this.items.length, this.findOffsetIndex(endPixel) + 1);

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(this.accumulatedOffsets[start]);
    this.scrolledIndexChange.next(start);
  }

  private findOffsetIndex(offset: number): number {
    let low = 0;
    let high = this.accumulatedOffsets.length - 2;
    if (offset >= this.accumulatedOffsets[this.accumulatedOffsets.length - 1]) {
      return this.accumulatedOffsets.length - 1;
    }
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (offset >= this.accumulatedOffsets[mid] && offset < this.accumulatedOffsets[mid + 1]) {
        return mid;
      } else if (offset < this.accumulatedOffsets[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return 0;
  }
}

// Breakpoint for mobile detection 
const MOBILE_BREAKPOINT = '(max-width: 599px)';
const DESKTOP_ITEM_SIZE = 120;
const MOBILE_ITEM_SIZE = 180;

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [{ provide: VIRTUAL_SCROLL_STRATEGY, useClass: MixedItemSizeStrategy }],
})
export class UsersListComponent implements OnInit, AfterViewInit {
  usersService = inject(UsersService);
  stateService = inject(UsersListStateService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);
  private strategy = inject(VIRTUAL_SCROLL_STRATEGY) as MixedItemSizeStrategy;

  // Public signal for template to bind heights
  isMobile = signal(false);

  constructor() {
    effect(() => {
      const isLoading = this.usersService.isLoading();
      // Update Strategy with new data
      const items = this.flattenedUsers();
      this.strategy.setData(items);

      untracked(() => {
        if (this.isLoadingMore && !isLoading) {
          requestAnimationFrame(() => {
            this.viewport?.checkViewportSize();
            // Restore scroll position handled by strategy usually, but explicit restore is safer here
            this.viewport?.scrollToOffset(this.lastScrollOffset);
            this.isLoadingMore = false;
          });
        }
      });
    });
  }

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  flattenedUsers = this.usersService.flattenedUsers;
  expandedUserIds = this.stateService.expandedUserIds;

  private lastScrollOffset = 0;
  private isLoadingMore = false;

  toggleUser(userId: string) {
    this.stateService.toggleUserExpanded(userId);
  }

  ngOnInit() {
    this.usersService.fetchUsers();
    this.setupResponsiveItemSize();
  }

  private setupResponsiveItemSize() {
    this.breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        const isMobile = result.matches;
        this.isMobile.set(isMobile);
        this.strategy.updateConfig(isMobile ? MOBILE_ITEM_SIZE : DESKTOP_ITEM_SIZE);
      });
  }

  ngAfterViewInit() {
    this.setupVirtualScrollListener();
  }

  setupVirtualScrollListener() {
    this.viewport.elementScrolled().subscribe(() => {
      const end = this.viewport.getRenderedRange().end;
      const total = this.flattenedUsers().length;

      if (end >= total * 0.9 && !this.usersService.isLoading() && !this.isLoadingMore) {
        this.loadMoreWithScrollPreservation();
      }
    });
  }

  loadMoreWithScrollPreservation() {
    this.lastScrollOffset = this.viewport.measureScrollOffset();
    this.isLoadingMore = true;

    this.usersService.loadMore();
  }

  setCriteria(criteria: GroupingCriteria) {
    this.usersService.setGroupingCriteria(criteria);
    this.scrollToTop();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.usersService.setSearchQuery(input.value);
    this.scrollToTop();
  }

  private scrollToTop() {
    setTimeout(() => {
      this.viewport?.scrollToIndex(0);
    }, 0);
  }

  trackByFn(index: number, item: UserListItem): string {
    return item.id;
  }
}

