import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { PaymentOption } from './payment-option';
import { PaymentMethod, WalletService } from '../../../core/services/Wallet/wallet-service';
import { AuthService } from '../../../core/services/auth/auth-service';

describe('PaymentOption', () => {
  let component: PaymentOption;
  let fixture: ComponentFixture<PaymentOption>;
  let walletService: WalletService;

  beforeEach(async () => {
    const authServiceStub = {
      getUserEmail: () => 'user@example.com',
    };

    const routerStub = {
      getCurrentNavigation: () => ({
        extras: {
          state: {
            fare: { fare: 30 },
            fromStationId: 1,
            toStationId: 2,
          },
        },
      }),
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [PaymentOption, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerStub },
      ],
    }).compileComponents();

    walletService = TestBed.inject(WalletService);
    spyOn(walletService, 'purchaseTicket').and.returnValue(of({ success: true }));

    fixture = TestBed.createComponent(PaymentOption);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call the online payment API when the payment option is selected', () => {
    expect(component).toBeTruthy();
    expect(walletService.purchaseTicket).toHaveBeenCalledWith({
      fromStationId: 1,
      toStationId: 2,
      userEmail: 'user@example.com',
      paymentMethod: PaymentMethod.Online,
    });
  });
});
