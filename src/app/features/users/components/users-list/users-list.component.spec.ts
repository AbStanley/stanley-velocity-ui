
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../services/users.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

class MockUsersService {
    users = signal([]);
    groupedUsers = signal([]);
    isLoading = signal(false);
    error = signal(null);
    currentCriteria = signal('none');

    fetchUsers() { }
    setGroupingCriteria() { }
}

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UsersListComponent],
            providers: [
                { provide: UsersService, useClass: MockUsersService }
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
