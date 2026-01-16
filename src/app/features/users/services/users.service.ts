
import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserGroup, GroupingCriteria, RandomUserResponse } from '../models/user.model';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MockResult } from '../../../services/mock-data';

export type UserListItem =
    | { type: 'header'; id: string; label: string; count: number }
    | { type: 'user'; id: string; data: User };

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private readonly apiUrl = 'https://randomuser.me/api/?results=5000&seed=awork';
    private readonly USE_MOCK_DATA = true; // TOGGLE THIS TO FALSE TO USE API

    // State Signals
    private usersSignal = signal<User[]>([]);
    private groupingCriteriaSignal = signal<GroupingCriteria>('none');
    private groupedUsersSignal = signal<UserGroup[]>([]);
    private isLoadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);
    private expandedUserIdsSignal = signal<Set<string>>(new Set());

    // Read-only Exposed Signals
    readonly users = this.usersSignal.asReadonly();
    readonly groupedUsers = this.groupedUsersSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly currentCriteria = this.groupingCriteriaSignal.asReadonly();
    readonly expandedUserIds = this.expandedUserIdsSignal.asReadonly();

    // Computed Signal for Virtual Scroll
    // Flattens the grouped structure into a single list of items (headers + users)
    readonly flattenedUsers = computed<UserListItem[]>(() => {
        const criteria = this.groupingCriteriaSignal();

        // If no grouping, just return users wrapped in items
        if (criteria === 'none') {
            return this.usersSignal().map(user => ({
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
            this.worker = new Worker(new URL('../../../workers/grouping.worker', import.meta.url));
            this.worker.onmessage = ({ data }) => {
                this.groupedUsersSignal.set(data);
                this.isLoadingSignal.set(false); // Stop loading after grouping is done
            };
        } else {
            console.warn('Web Workers are not supported in this environment.');
            // Fallback could be added here if needed, but requirements specify Web Worker.
        }
    }

    fetchUsers(force = false): void {
        if (!force && this.usersSignal().length > 0) return; // Already loaded

        this.isLoadingSignal.set(true);
        this.errorSignal.set(null);

        if (this.USE_MOCK_DATA) {
            // Use mock data immediately
            console.log('Using Mock Data for users');
            // We need to cast as unknown first because the Mock types might not perfectly overlap in strict mode
            // but the runtime data structure is compatible.
            const data = MockResult.results as unknown as User[];

            this.usersSignal.set(data);
            this.setGroupingCriteria(this.groupingCriteriaSignal());
            return;
        }

        this.http.get<RandomUserResponse>(this.apiUrl).pipe(
            map(response => response.results),
            tap(users => {
                this.usersSignal.set(users);
                // Trigger initial grouping
                this.setGroupingCriteria(this.groupingCriteriaSignal());
            }),
            catchError(err => {
                this.errorSignal.set('Failed to load users. Please try again.');
                this.isLoadingSignal.set(false);
                console.error(err);
                return of([]);
            })
        ).subscribe();
    }

    setGroupingCriteria(criteria: GroupingCriteria): void {
        this.groupingCriteriaSignal.set(criteria);

        // If users are not loaded yet, don't group
        const currentUsers = this.usersSignal();
        if (currentUsers.length === 0) return;

        // If we switch to none, we don't need the worker, we just use the computed directly
        if (criteria === 'none') {
            // No worker needed for 'none', flattenedUsers handles it
            this.groupedUsersSignal.set([]);
            this.isLoadingSignal.set(false);
            return;
        }

        this.isLoadingSignal.set(true); // Show loading while grouping

        if (this.worker) {
            this.worker.postMessage({ users: currentUsers, criteria });
        } else {
            // Fallback for non-worker environment (shouldn't happen in modern browsers)
            console.error('Worker not initialized');
            this.isLoadingSignal.set(false);
        }
    }

    toggleUserExpanded(userId: string): void {
        this.expandedUserIdsSignal.update(currentSet => {
            const newSet = new Set(currentSet);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    }
}
