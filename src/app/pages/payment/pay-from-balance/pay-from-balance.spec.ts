import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayFromBalance } from './pay-from-balance';

describe('PayFromBalance', () => {
  let component: PayFromBalance;
  let fixture: ComponentFixture<PayFromBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayFromBalance],
    }).compileComponents();

    fixture = TestBed.createComponent(PayFromBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
