import { Component, ChangeDetectionStrategy, inject, OnInit, ViewChild, AfterViewInit, effect, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService, UserListItem, isHeaderItem, isUserItem } from '../../services/users.service';
import { UsersListStateService } from '../../services/users-list-state.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { UsersToolbarComponent } from '../users-toolbar/users-toolbar.component';
import { GroupingCriteria } from '../../models/user.model';
import { FlexibleVirtualScrollStrategy } from '../../../../shared/strategies/flexible-virtual-scroll.strategy';
import { UI_CONSTANTS } from '../../../../core/constants/ui.constants';
import { ScrollNearBottomDirective } from '../../../../shared/directives/scroll-near-bottom.directive';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent, UsersToolbarComponent, ScrollingModule, ScrollNearBottomDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [
    { provide: VIRTUAL_SCROLL_STRATEGY, useClass: FlexibleVirtualScrollStrategy }
  ],
})
export class UsersListComponent implements OnInit, AfterViewInit {
  usersService = inject(UsersService);
  stateService = inject(UsersListStateService);

  // Public for template access
  protected readonly UI = UI_CONSTANTS;
  protected readonly skeletonItems = Array.from({ length: UI_CONSTANTS.SKELETON_COUNT }, (_, i) => i);

  // Type guards for template
  protected readonly isHeader = isHeaderItem;
  protected readonly isUser = isUserItem;

  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);
  private strategy = inject(VIRTUAL_SCROLL_STRATEGY) as FlexibleVirtualScrollStrategy;

  isMobile = signal(false);

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  flattenedUsers = this.usersService.flattenedUsers;
  expandedUserIds = this.stateService.expandedUserIds;

  constructor() {
    // Sync data with Strategy
    effect(() => {
      const items = this.flattenedUsers();
      this.strategy.setData(items);
    });
  }

  ngOnInit() {
    this.usersService.fetchUsers();
    this.setupResponsiveObserver();
  }

  ngAfterViewInit() {
  }

  private setupResponsiveObserver() {
    this.breakpointObserver
      .observe(UI_CONSTANTS.MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        const isMobile = result.matches;
        this.isMobile.set(isMobile);
        this.strategy.setMobileMode(isMobile);
      });
  }

  onScrollNearBottom() {
    if (!this.usersService.isLoading()) {
      this.usersService.loadMore();
    }
  }

  trackByFn(index: number, item: UserListItem): string {
    return item.id;
  }

  toggleUser(userId: string) {
    this.stateService.toggleUserExpanded(userId);
  }

  setCriteria(criteria: GroupingCriteria) {
    this.usersService.setGroupingCriteria(criteria);
    this.scrollToTop();
  }

  onSearch(query: string) {
    this.usersService.setSearchQuery(query);
    this.scrollToTop();
  }

  private scrollToTop() {
    setTimeout(() => {
      this.viewport?.scrollToIndex(0);
    });
  }
}

