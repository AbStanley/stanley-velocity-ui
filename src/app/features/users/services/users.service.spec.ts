import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { MockResult } from '../../../services/mock-data';

describe('UsersService', () => {
    let service: UsersService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UsersService]
        });
        service = TestBed.inject(UsersService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Mock Data Behavior', () => {
        it('should load initial users (page 1)', () => {
            service.fetchUsers(1, 15);
            expect(service.users().length).toBe(15);
        });

        it('should append users when loading more (page 2)', () => {
            service.fetchUsers(1, 15);
            service.fetchUsers(2, 15);
            expect(service.users().length).toBe(30);
        });

        it('should increment page on loadMore', () => {
            service.fetchUsers();
            service.loadMore();
            expect(service.users().length).toBe(30);
        });

        it('should reset on refresh', () => {
            service.fetchUsers();
            service.loadMore();
            service.refresh();
            expect(service.users().length).toBe(15);
        });
    });
});
