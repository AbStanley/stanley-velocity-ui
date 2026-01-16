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

    private mockData: User[] = [];

    // Helper to set mock data for tests
    setMockData(users: User[]) {
        this.mockData = users;
        this.users.set(users);
        this.filteredUsers.set(users);
        this.flattenedUsers.set(users.map(u => ({ type: 'user', id: u.login.uuid, data: u }))); // Basic flattening
    }

    fetchUsers(force = false) {
        this.isLoading.set(true);
        // Simulate async delay if needed, or just set immediately
        setTimeout(() => {
            if (this.mockData.length === 0) {
                // Fallback if no mock data set, maybe set empty?
            } else {
                this.users.set(this.mockData);
                this.filteredUsers.set(this.mockData);
            }
            this.setGroupingCriteria(this.currentCriteria());
            this.isLoading.set(false);
        }, 10);
    }

    setGroupingCriteria(criteria: GroupingCriteria) {
        this.currentCriteria.set(criteria);
        // Basic grouping for test purposes
        const currentUsers = this.filteredUsers();
        if (criteria === 'all') {
            this.groupedUsers.set([{ name: 'All Users', users: currentUsers }]);
        } else {
            // Simplified grouping for tests
            this.groupedUsers.set([{ name: 'Test Group', users: currentUsers }]);
        }
    }

    setSearchQuery(query: string) {
        this.searchQuery.set(query);
    }

    loadMore() {
        this.isLoading.set(true);
        setTimeout(() => {
            this.isLoading.set(false);
            // Simulate adding more users or just trigger update
            this.flattenedUsers.update(u => [...u]);
        }, 10);
    }

    refresh() {
        this.fetchUsers(true);
    }
}
