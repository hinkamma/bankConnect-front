import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSelection } from './account-selection';

describe('AccountSelection', () => {
  let component: AccountSelection;
  let fixture: ComponentFixture<AccountSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
