import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input,
  output,
  model,
} from '@angular/core';
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
  criteriaOptions = GROUPING_CRITERIA;

  searchQuery = input.required();
  currentCriteria = input.required<GroupingCriteria>();
  totalUsers = input.required();

  search = output<string>();
  groupingChange = output<GroupingCriteria>();
  clearSearch = output<void>();
  // In your class
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
  }

  setCriteria(criteria: GroupingCriteria) {
    this.groupingChange.emit(criteria);
  }
}
