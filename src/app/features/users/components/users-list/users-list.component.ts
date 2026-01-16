import { Component, ChangeDetectionStrategy, inject, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, UserListItem } from '../../services/users.service';
import { UsersListStateService } from '../../services/users-list-state.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { GroupingCriteria } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit, AfterViewInit, OnDestroy {
  usersService = inject(UsersService);
  stateService = inject(UsersListStateService);

  @ViewChild('sentinel') sentinel!: ElementRef;
  private observer: IntersectionObserver | undefined;

  // Use the flattened signal for the list
  flattenedUsers = this.usersService.flattenedUsers;
  expandedUserIds = this.stateService.expandedUserIds;

  toggleUser(userId: string) {
    this.stateService.toggleUserExpanded(userId);
  }

  ngOnInit() {
    this.usersService.fetchUsers();
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  setupInfiniteScroll() {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.usersService.isLoading()) {
          this.usersService.loadMore();
        }
      });
    }, options);

    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  setCriteria(criteria: GroupingCriteria) {
    this.usersService.setGroupingCriteria(criteria);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.usersService.setSearchQuery(input.value);
  }

  trackByFn(index: number, item: UserListItem): string {
    return item.id;
  }
}
