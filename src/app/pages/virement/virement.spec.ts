import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Virement } from './virement';

describe('Virement', () => {
  let component: Virement;
  let fixture: ComponentFixture<Virement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Virement],
    }).compileComponents();

    fixture = TestBed.createComponent(Virement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
