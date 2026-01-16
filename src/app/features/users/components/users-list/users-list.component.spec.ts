import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../services/users.service';
import { UsersServiceStub } from '../../services/users.service.stub';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;
    let usersService: UsersServiceStub;
    let mockViewport: CdkVirtualScrollViewport;

    beforeEach(async () => {
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

        mockViewport = component.viewport;
        spyOn(mockViewport, 'measureScrollOffset').and.returnValue(0);
        spyOn(mockViewport, 'scrollToOffset');
        spyOn(mockViewport, 'scrollToIndex');
        spyOn(mockViewport, 'checkViewportSize');
        spyOn(mockViewport, 'getRenderedRange').and.returnValue({ start: 0, end: 10 });
        const elementScrolledSubject = new Subject<Event>();
        spyOn(mockViewport, 'elementScrolled').and.returnValue(elementScrolledSubject.asObservable());
        (mockViewport as any)._scrolled = elementScrolledSubject;
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
                    login: { uuid: 'u1', username: 'testuser' },
                    name: { first: 'Test', last: 'User' },
                    picture: { thumbnail: 'assets/avatar.jpg', large: 'assets/avatar.jpg' },
                    email: 'test@example.com',
                    location: {
                        city: 'Berlin',
                        country: 'Germany',
                        state: 'Berlin',
                        street: { number: 1, name: 'Test St' },
                        postcode: '12345',
                        timezone: { description: 'CET', offset: '+1:00' }
                    },
                    phone: '123456',
                    cell: '0987654321',
                    dob: { date: '1990-01-01', age: 30 },
                    registered: { date: '2020-01-01', age: 1 },
                    id: { name: 'ID', value: '123' },
                    gender: 'male',
                    nat: 'DE'
                } as any
            }
        ]);
        fixture.detectChanges();
        const headers = fixture.nativeElement.querySelectorAll('.group-header-item');
        expect(headers.length).toBe(1);
        const users = fixture.nativeElement.querySelectorAll('app-user-card');
        expect(users.length).toBe(1);
    });


    it('should call setSearchQuery on search input', () => {
        const input = fixture.nativeElement.querySelector('.search-box input');
        input.value = 'test';
        input.dispatchEvent(new Event('input'));

        expect(usersService.searchQuery()).toBe('test');
    });

    it('should clear search on clear button click', () => {
        usersService.setSearchQuery('test');
        fixture.detectChanges();

        const clearBtn = fixture.nativeElement.querySelector('.clear-search');
        clearBtn.click();

        expect(usersService.searchQuery()).toBe('');
    });

    it('should reset scroll to top when changing grouping criteria', fakeAsync(() => {
        component.setCriteria('alphabetical');
        tick(100);
        expect(mockViewport.scrollToIndex).toHaveBeenCalledWith(0);
    }));

    it('should reset scroll to top when searching', fakeAsync(() => {
        const input = fixture.nativeElement.querySelector('.search-box input');
        input.value = 'test';
        input.dispatchEvent(new Event('input')); // This calls onSearch which calls scrollToTop (setTimeout)

        tick(100);
        expect(mockViewport.scrollToIndex).toHaveBeenCalledWith(0);
    }));

    it('should preserve scroll position when loading more', fakeAsync(() => {
        (mockViewport.measureScrollOffset as jasmine.Spy).and.returnValue(500);

        component.loadMoreWithScrollPreservation();
        fixture.detectChanges(); // Propagate initial state

        // Allow service logic (setTimeout 0) to run
        tick(100);
        fixture.detectChanges(); // Propagate service completion

        // Allow requestAnimationFrame to run
        tick(100);
        fixture.detectChanges();

        flush();

        expect(mockViewport.scrollToOffset).toHaveBeenCalledWith(500);
    }));
});

