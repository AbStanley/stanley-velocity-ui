import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UsersListStateService {
    private expandedUserIdsSignal = signal<Set<string>>(new Set());
    readonly expandedUserIds = this.expandedUserIdsSignal.asReadonly();

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
