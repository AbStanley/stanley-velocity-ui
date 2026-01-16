import { Injectable, signal } from '@angular/core';
import { User, UserGroup, GroupingCriteria, RandomUserResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UsersServiceStub {
    users = signal<User[]>([]);
    groupedUsers = signal<UserGroup[]>([]);

    // Mock flattenedUsers as it's used directly by component now
    flattenedUsers = signal<any[]>([]);

    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    currentCriteria = signal<GroupingCriteria>('all');
    searchQuery = signal<string>('');

    // Mock filteredUsers
    filteredUsers = signal<User[]>([]);

    async fetchUsers(force = false) {
        if (!force && this.users().length > 0) return;

        this.isLoading.set(true);
        try {
            const response = await fetch('/mock-data.json');
            if (!response.ok) {
                throw new Error('Failed to load mock data');
            }
            const data: RandomUserResponse = await response.json();
            this.users.set(data.results);
            this.filteredUsers.set(data.results); // Initialize filteredUsers
            this.setGroupingCriteria('all');
        } catch (err) {
            console.error(err);
            this.error.set('Failed to load users');
        } finally {
            this.isLoading.set(false);
        }
    }

    setGroupingCriteria(criteria: GroupingCriteria) {
        this.currentCriteria.set(criteria);
        // Basic grouping for test purposes
        if (criteria === 'all') {
            this.groupedUsers.set([{ name: 'All Users', users: this.filteredUsers() }]);
        } else {
            // Simplified grouping for tests
            this.groupedUsers.set([{ name: 'Test Group', users: this.filteredUsers() }]);
        }
    }

    setSearchQuery(query: string) {
        this.searchQuery.set(query);
    }
}
