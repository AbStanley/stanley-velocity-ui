
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UsersService, UserListItem } from '../../services/users.service';
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

  // Use the flattened signal for the single virtual list
  flattenedUsers = this.usersService.flattenedUsers;

  ngOnInit() {
    this.usersService.fetchUsers();
  }

  setCriteria(criteria: GroupingCriteria) {
    this.usersService.setGroupingCriteria(criteria);
  }

  trackByFn(index: number, item: UserListItem): string {
    return item.id;
  }
}
