import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupingCriteria } from '../../models/user.model';

@Component({
    selector: 'app-users-toolbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './users-toolbar.component.html',
    styleUrl: './users-toolbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersToolbarComponent {
    @Input({ required: true }) searchQuery = '';
    @Input({ required: true }) currentCriteria: GroupingCriteria = 'all';
    @Input({ required: true }) totalUsers = 0;

    @Output() search = new EventEmitter<string>();
    @Output() groupingChange = new EventEmitter<GroupingCriteria>();
    @Output() clearSearch = new EventEmitter<void>();

    onSearch(event: Event) {
        const input = event.target as HTMLInputElement;
        this.search.emit(input.value);
    }

    setCriteria(criteria: GroupingCriteria) {
        this.groupingChange.emit(criteria);
    }
}
