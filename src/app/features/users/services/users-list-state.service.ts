import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UsersListStateService {
    private expandedUserIdsSignal = signal<Set<string>>(new Set());
    readonly expandedUserIds = this.expandedUserIdsSignal.asReadonly();

    toggleUserExpanded(userId: string): void {
        this.expandedUserIdsSignal.update(currentSet => {
            if (currentSet.has(userId)) {
                return new Set<string>();
            }
            return new Set([userId]);
        });
    }
}
