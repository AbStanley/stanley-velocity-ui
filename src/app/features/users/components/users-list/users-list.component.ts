
import { Component, ChangeDetectionStrategy, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { UsersService, UserListItem } from '../../services/users.service';
import { UsersListStateService } from '../../services/users-list-state.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { GroupingCriteria } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, UserCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  usersService = inject(UsersService);
  stateService = inject(UsersListStateService);

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  // Use the flattened signal for the single virtual list
  flattenedUsers = this.usersService.flattenedUsers;
  expandedUserIds = this.stateService.expandedUserIds;

  toggleUser(userId: string) {
    this.stateService.toggleUserExpanded(userId);
  }

  ngOnInit() {
    this.usersService.fetchUsers();
  }

  setCriteria(criteria: GroupingCriteria) {
    this.usersService.setGroupingCriteria(criteria);
  }

  trackByFn(index: number, item: UserListItem): string {
    return item.id;
  }

  onScroll() {
    const end = this.viewport.getRenderedRange().end;
    const total = this.flattenedUsers().length;

    if (end >= total - 5 && total > 0) {
      this.usersService.loadMore();
    }
  }
}
