import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseTicket } from './purchase-ticket';

describe('PurchaseTicket', () => {
  let component: PurchaseTicket;
  let fixture: ComponentFixture<PurchaseTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
