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

    describe('API Integration', () => {
        const mockResponse: any = {
            results: Array(15).fill({
                name: { first: 'John', last: 'Doe' },
                email: 'john.doe@example.com',
                login: { uuid: 'test-uuid' },
                picture: { thumbnail: 'thumb.jpg' },
                location: { city: 'Test City', country: 'Test Country' }
            }),
            info: { seed: 'awork', results: 15, page: 1, version: '1.0' }
        };

        it('should load initial users (page 1)', () => {
            service.fetchUsers();

            const req = httpMock.expectOne(req => req.url.includes('page=1'));
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);

            expect(service.users().length).toBe(15);
        });

        it('should append users when loading more (page 2)', () => {
            service.fetchUsers();
            const req1 = httpMock.expectOne(req => req.url.includes('page=1'));
            req1.flush(mockResponse);

            service.loadMore();

            const req2 = httpMock.expectOne(req => req.url.includes('page=2'));
            req2.flush(mockResponse);

            expect(service.users().length).toBe(30);
        });

        it('should increment page on loadMore', () => {
            // Separate test to ensure page logic specifically works
            service.fetchUsers();
            httpMock.expectOne(req => req.url.includes('page=1')).flush(mockResponse);

            service.loadMore();
            const req = httpMock.expectOne(req => req.url.includes('page=2'));
            req.flush(mockResponse);

            // This test is redundant with the one above but confirms specific intent
            expect(service.users().length).toBe(30);
        });

        it('should reset on refresh', () => {
            service.fetchUsers();
            httpMock.expectOne(req => req.url.includes('page=1')).flush(mockResponse);

            service.refresh();

            const req = httpMock.expectOne(req => req.url.includes('page=1'));
            req.flush(mockResponse);

            expect(service.users().length).toBe(15);
        });
    });
});
