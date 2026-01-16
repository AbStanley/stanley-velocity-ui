
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserGroup, GroupingCriteria, RandomUserResponse } from '../models/user.model';
import { catchError, map, of, tap } from 'rxjs';

export type UserListItem =
    | { type: 'header'; id: string; label: string; count: number }
    | { type: 'user'; id: string; data: User };

// Type Guards for UserListItem
export function isHeaderItem(item: UserListItem): item is { type: 'header'; id: string; label: string; count: number } {
    return item.type === 'header';
}

export function isUserItem(item: UserListItem): item is { type: 'user'; id: string; data: User } {
    return item.type === 'user';
}

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private readonly apiUrl = 'https://randomuser.me/api/';
    private readonly PAGE_SIZE = 20;

    // State Signals
    private usersSignal = signal<User[]>([]);
    private groupingCriteriaSignal = signal<GroupingCriteria>('all');
    private groupedUsersSignal = signal<UserGroup[]>([]);
    private isLoadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);
    private currentPageSignal = signal<number>(1);
    private searchQuerySignal = signal<string>('');

    // Read-only Exposed Signals
    readonly users = this.usersSignal.asReadonly();
    readonly groupedUsers = this.groupedUsersSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly currentCriteria = this.groupingCriteriaSignal.asReadonly();
    readonly searchQuery = this.searchQuerySignal.asReadonly();

    // Computed Signal for Filtering
    // Note: For very large datasets (10000+), consider adding debounce via toObservable/debounceTime/toSignal
    // This was attempted but adds test complexity. See FEATURE_DOCUMENTATION.md for details.
    readonly filteredUsers = computed<User[]>(() => {
        const query = this.searchQuerySignal().toLowerCase().trim();
        const users = this.usersSignal();

        if (!query) {
            return users;
        }

        return users.filter(user => {
            const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
            return fullName.includes(query) || user.email.toLowerCase().includes(query);
        });
    });

    // Computed Signal for Flattened List (Virtual Scroll)
    readonly flattenedUsers = computed<UserListItem[]>(() => {
        const criteria = this.groupingCriteriaSignal();

        // If no grouping, just return filtered users wrapped in items
        if (criteria === 'all') {
            return this.filteredUsers().map(user => ({
                type: 'user',
                id: user.login.uuid,
                data: user
            }));
        }

        // If grouped, flatten: [Header, User, User, Header, User...]
        const groups = this.groupedUsersSignal();
        const flatList: UserListItem[] = [];

        for (const group of groups) {
            flatList.push({
                type: 'header',
                id: `header-${group.name}`,
                label: group.name,
                count: group.users.length
            });

            for (const user of group.users) {
                flatList.push({
                    type: 'user',
                    id: user.login.uuid,
                    data: user
                });
            }
        }

        return flatList;
    });

    // Worker
    private worker: Worker | undefined;

    constructor(private http: HttpClient) {
        this.initWorker();
    }

    private initWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                this.worker = new Worker(new URL('../../../workers/grouping.worker', import.meta.url));
                this.worker.onmessage = ({ data }) => {
                    this.groupedUsersSignal.set(data);
                    this.isLoadingSignal.set(false); // Stop loading after grouping is done
                };
            } catch (e) {
                console.warn('Failed to initialize worker:', e);
            }
        } else {
            console.warn('Web Workers are not supported in this environment.');
        }
    }

    private runWorker(users: User[], criteria: GroupingCriteria) {
        if (users.length === 0) {
            this.groupedUsersSignal.set([]);
            return;
        }

        this.isLoadingSignal.set(true);
        if (this.worker) {
            this.worker.postMessage({ users, criteria });
        } else {
            console.error('Worker not initialized');
            this.isLoadingSignal.set(false);
        }
    }

    fetchUsers(page = this.currentPageSignal(), results = this.PAGE_SIZE): void {
        this.isLoadingSignal.set(true);
        this.errorSignal.set(null);

        const url = `${this.apiUrl}?page=${page}&results=${results}&seed=awork`;

        this.http.get<RandomUserResponse>(url).pipe(
            map(response => response.results),
            tap(users => {
                this.updateUsersState(users, page);
            }),
            catchError(err => {
                this.errorSignal.set('Failed to load users. Please try again.');
                this.isLoadingSignal.set(false);
                console.error(err);
                return of([]);
            })
        ).subscribe();
    }

    private updateUsersState(newUsers: User[], page: number) {
        if (page === 1) {
            this.usersSignal.set(newUsers);
        } else {
            this.usersSignal.update(current => [...current, ...newUsers]);
        }

        this.setGroupingCriteria(this.groupingCriteriaSignal());
    }

    loadMore(): void {
        if (this.isLoadingSignal()) return;
        const nextPage = this.currentPageSignal() + 1;
        this.currentPageSignal.set(nextPage);
        this.fetchUsers(nextPage);
    }

    refresh(): void {
        this.currentPageSignal.set(1);
        this.usersSignal.set([]); // Optional: clear immediately or wait for load
        this.fetchUsers(1);
    }

    setGroupingCriteria(criteria: GroupingCriteria): void {
        this.groupingCriteriaSignal.set(criteria);

        const currentUsers = this.filteredUsers(); // Use filtered users!
        if (currentUsers.length === 0) {
            this.isLoadingSignal.set(false);
            return;
        }

        if (criteria === 'all') {
            this.groupedUsersSignal.set([]);
            this.isLoadingSignal.set(false);
            return;
        }

        this.runWorker(currentUsers, criteria);
    }

    setSearchQuery(query: string): void {
        this.searchQuerySignal.set(query);
        this.setGroupingCriteria(this.groupingCriteriaSignal());
    }

}
