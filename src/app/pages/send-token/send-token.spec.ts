import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendToken } from './send-token';

describe('SendToken', () => {
  let component: SendToken;
  let fixture: ComponentFixture<SendToken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendToken],
    }).compileComponents();

    fixture = TestBed.createComponent(SendToken);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
