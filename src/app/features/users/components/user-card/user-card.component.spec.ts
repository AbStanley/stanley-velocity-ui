
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { User } from '../../models/user.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UserCardComponent', () => {
    let component: UserCardComponent;
    let fixture: ComponentFixture<UserCardComponent>;

    const mockUser: User = {
        gender: 'male',
        name: { title: 'Mr', first: 'John', last: 'Doe' },
        location: {
            street: { number: 123, name: 'Main St' },
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postcode: 10001,
            coordinates: { latitude: '0', longitude: '0' },
            timezone: { offset: '+0:00', description: 'UTC' }
        },
        email: 'john.doe@example.com',
        login: { uuid: '123', username: 'johndoe' },
        dob: { date: '1990-01-01', age: 30 },
        registered: { date: '2020-01-01', age: 10 },
        phone: '123-456-7890',
        cell: '098-765-4321',
        id: { name: 'ID', value: '123' },
        picture: { large: 'url', medium: 'url', thumbnail: 'url' },
        nat: 'US'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UserCardComponent, NoopAnimationsModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(UserCardComponent);
        component = fixture.componentInstance;
        component.user = mockUser;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle expanded state', () => {
        expect(component.expanded()).toBeFalse();
        component.toggleExpand();
        expect(component.expanded()).toBeTrue();
        component.toggleExpand();
        expect(component.expanded()).toBeFalse();
    });
});
