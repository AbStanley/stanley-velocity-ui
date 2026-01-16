
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../services/users.service';
import { UsersListStateService } from '../../services/users-list-state.service';
import { signal } from '@angular/core';

class MockUsersService {
    users = signal([]);
    groupedUsers = signal([]);
    // Add flattenedUsers to mock
    flattenedUsers = signal([]);
    isLoading = signal(false);
    error = signal(null);
    currentCriteria = signal('none');

    fetchUsers() { }
    setGroupingCriteria() { }
}

class MockUsersListStateService {
    expandedUserIds = signal(new Set<string>());
    toggleUserExpanded(id: string) { }
}

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UsersListComponent],
            providers: [
                { provide: UsersService, useClass: MockUsersService },
                { provide: UsersListStateService, useClass: MockUsersListStateService }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(UsersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
