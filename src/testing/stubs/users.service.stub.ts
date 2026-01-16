import { Injectable, signal } from '@angular/core';
import { User, UserGroup, GroupingCriteria } from '../../app/features/users/models/user.model';
import { UserListItem } from '../../app/features/users/services/users.service';

/**
 * Test stub for UsersService.
 * This file is excluded from production builds as it resides in src/testing/.
 */
@Injectable()
export class UsersServiceStub {
    users = signal<User[]>([]);
    groupedUsers = signal<UserGroup[]>([]);
    flattenedUsers = signal<UserListItem[]>([]);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    currentCriteria = signal<GroupingCriteria>('all');
    searchQuery = signal<string>('');
    filteredUsers = signal<User[]>([]);

    private mockData: User[] = [];

    setMockData(users: User[]) {
        this.mockData = users;
        this.users.set(users);
        this.filteredUsers.set(users);
        this.flattenedUsers.set(users.map(u => ({ type: 'user', id: u.login.uuid, data: u })));
    }

    fetchUsers(force = false) {
        this.isLoading.set(true);
        setTimeout(() => {
            if (this.mockData.length > 0) {
                this.users.set(this.mockData);
                this.filteredUsers.set(this.mockData);
            }
            this.setGroupingCriteria(this.currentCriteria());
            this.isLoading.set(false);
        }, 10);
    }

    setGroupingCriteria(criteria: GroupingCriteria) {
        this.currentCriteria.set(criteria);
        const currentUsers = this.filteredUsers();
        if (criteria === 'all') {
            this.groupedUsers.set([{ name: 'All Users', users: currentUsers }]);
        } else {
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
            this.flattenedUsers.update(u => [...u]);
        }, 10);
    }

    refresh() {
        this.fetchUsers(true);
    }
}
