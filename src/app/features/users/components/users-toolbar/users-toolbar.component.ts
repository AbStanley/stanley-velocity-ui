import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GROUPING_CRITERIA, GroupingCriteria } from '../../models/user.model';

@Component({
  selector: 'app-users-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-toolbar.component.html',
  styleUrl: './users-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersToolbarComponent {
  protected readonly criteriaOptions = GROUPING_CRITERIA;

  searchQuery = input.required();
  currentCriteria = input.required<GroupingCriteria>();
  totalUsers = input.required();

  protected readonly search = output<string>();
  protected readonly groupingChange = output<GroupingCriteria>();
  protected readonly clearSearch = output<void>();

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
  }

  setCriteria(criteria: GroupingCriteria) {
    this.groupingChange.emit(criteria);
  }
}
