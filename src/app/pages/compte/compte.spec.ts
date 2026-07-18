import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compte } from './compte';

describe('Compte', () => {
  let component: Compte;
  let fixture: ComponentFixture<Compte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compte],
    }).compileComponents();

    fixture = TestBed.createComponent(Compte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
