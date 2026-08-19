import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTypeSelection } from './account-type-selection';

describe('AccountTypeSelection', () => {
  let component: AccountTypeSelection;
  let fixture: ComponentFixture<AccountTypeSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypeSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTypeSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
