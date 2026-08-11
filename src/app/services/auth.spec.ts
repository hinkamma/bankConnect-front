import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a backend-compatible register payload', () => {
    service.register({
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean@example.com',
      phone: '   ',
      password: 'Password123',
      password_confirmation: 'Password123',
      role: 'client',
    }).subscribe();

    const req = httpMock.expectOne('http://127.0.0.1:8000/register');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expect.objectContaining({
      name: 'Jean Dupont',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean@example.com',
      phone: '',
      role: 'client',
      password: 'Password123',
      password_confirmation: 'Password123',
    }));

    req.flush({ token: 'abc123', email: 'jean@example.com', id: 1 });
  });
});
