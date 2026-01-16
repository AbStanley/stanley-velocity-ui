import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../services/users.service';
import { UsersServiceStub } from '../../services/users.service.stub';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;
    let usersService: UsersServiceStub;

    beforeEach(async () => {
        // Mock IntersectionObserver
        (window as any).IntersectionObserver = class {
            observe() { }
            disconnect() { }
            unobserve() { }
        };

        await TestBed.configureTestingModule({
            imports: [UsersListComponent],
            providers: [
                { provide: UsersService, useClass: UsersServiceStub },
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UsersListComponent);
        component = fixture.componentInstance;
        usersService = TestBed.inject(UsersService) as unknown as UsersServiceStub;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render items correctly', () => {
        usersService.flattenedUsers.set([
            { type: 'header', id: 'h1', label: 'H1', count: 1 },
            {
                type: 'user',
                id: 'u1',
                data: {
                    login: { uuid: 'u1' },
                    name: { first: 'Test', last: 'User' },
                    picture: { thumbnail: 'assets/avatar.jpg', large: 'assets/avatar.jpg' },
                    email: 'test@example.com',
                    location: { city: 'Berlin', country: 'Germany' },
                    phone: '123456',
                    dob: { date: '1990-01-01', age: 30 },
                    registered: { date: '2020-01-01', age: 1 }
                } as any
            }
        ]);
        fixture.detectChanges();
        const headers = fixture.nativeElement.querySelectorAll('.group-header-item');
        expect(headers.length).toBe(1);
        const users = fixture.nativeElement.querySelectorAll('app-user-card');
        expect(users.length).toBe(1);
    });
});
