
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { User } from '../../models/user.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

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

@Component({
    standalone: true,
    imports: [UserCardComponent],
    template: `
    <app-user-card 
        [user]="user" 
        [expanded]="expanded" 
        (toggle)="onToggle()">
    </app-user-card>`
})
class TestHostComponent {
    user = mockUser;
    expanded = false;
    toggleEmitted = false;

    onToggle() {
        this.toggleEmitted = true;
    }
}

describe('UserCardComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, NoopAnimationsModule],
        })
            .compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit toggle event when clicked', () => {
        const cardElement = fixture.nativeElement.querySelector('.user-card');
        cardElement.click();
        expect(component.toggleEmitted).toBeTrue();
    });

    it('should reflect expanded input', () => {
        const cardElement = fixture.nativeElement.querySelector('.user-card');
        expect(cardElement.classList).not.toContain('expanded');

        component.expanded = true;
        fixture.detectChanges();
        expect(cardElement.classList).toContain('expanded');

        component.expanded = false;
        fixture.detectChanges();
        expect(cardElement.classList).not.toContain('expanded');
    });
});
