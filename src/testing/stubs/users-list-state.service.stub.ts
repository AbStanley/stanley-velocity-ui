import { Injectable, signal } from '@angular/core';

/**
 * Test stub for UsersListStateService.
 * Decided to exclud it from production builds since it resides in src/testing/.
 */
@Injectable()
export class UsersListStateServiceStub {
    expandedUserIds = signal<Set<string>>(new Set());

    toggleUserExpanded(userId: string) {
        this.expandedUserIds.update(s => {
            const newSet = new Set(s);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    }
}
