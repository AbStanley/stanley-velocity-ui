
import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserGroup, GroupingCriteria, RandomUserResponse } from '../models/user.model';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private readonly apiUrl = 'https://randomuser.me/api/?results=5000&seed=awork';

    // State Signals
    private usersSignal = signal<User[]>([]);
    private groupingCriteriaSignal = signal<GroupingCriteria>('none');
    private groupedUsersSignal = signal<UserGroup[]>([]);
    private isLoadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    // Read-only Exposed Signals
    readonly users = this.usersSignal.asReadonly();
    readonly groupedUsers = this.groupedUsersSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly currentCriteria = this.groupingCriteriaSignal.asReadonly();

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

        this.isLoadingSignal.set(true); // Show loading while grouping

        if (this.worker) {
            this.worker.postMessage({ users: currentUsers, criteria });
        } else {
            // Fallback for non-worker environment (shouldn't happen in modern browsers)
            console.error('Worker not initialized');
            this.isLoadingSignal.set(false);
        }
    }
}
