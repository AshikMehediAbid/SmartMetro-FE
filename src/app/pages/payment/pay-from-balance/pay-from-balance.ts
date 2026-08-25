import { Component, inject, OnInit, signal } from '@angular/core';
import { PaymentMethod, WalletService } from '../../../core/services/Wallet/wallet-service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth-service';

interface StationFareResponse {
  fromStation: string;
  toStation: string;
  distance: number;
  fare: number;
}

@Component({
  selector: 'app-pay-from-balance',
  imports: [DecimalPipe],
  templateUrl: './pay-from-balance.html',
  styleUrl: './pay-from-balance.css',
})
export class PayFromBalance implements OnInit {
  private walletService = inject(WalletService);
  private authService = inject(AuthService);
  private router = inject(Router);

  fare = signal<StationFareResponse | null>(null);

  fromStationId = signal<number | null>(null);
  toStationId = signal<number | null>(null);

  balance = signal<number>(0);

  isLoading = signal(true);
  paymentProcessing = signal(false);
  paymentCompleted = signal(false);
  insufficientBalance = signal(false);

  ngOnInit(): void {
    this.loadPaymentData();
  }

  private loadPaymentData(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state ?? history.state;

    if (!state?.fare) {
      this.router.navigate(['/ticket-purchase']);
      return;
    }

    this.fare.set(state.fare);
    this.fromStationId.set(state.fromStationId ?? null);
    this.toStationId.set(state.toStationId ?? null);

    this.checkBalance();
  }

  private checkBalance(): void {
    this.walletService.getBalance().subscribe({
      next: (balance) => {
        this.balance.set(balance);

        const ticketFare = this.fare()?.fare ?? 0;

        if (balance < ticketFare) {
          this.insufficientBalance.set(true);
          this.isLoading.set(false);

          return;
        }

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Failed to get balance', error);

        this.isLoading.set(false);
      },
    });
  }

  completePayment(): void {
    const fromStationId = this.fromStationId();
    const toStationId = this.toStationId();
    const email = this.authService.getUserEmail();

    if (fromStationId === null || toStationId === null) {
      return;
    }

    this.paymentProcessing.set(true);

    this.walletService
      .purchaseTicket({
        fromStationId: fromStationId,
        toStationId: toStationId,
        userEmail: email,
        paymentMethod : PaymentMethod.Account
      })
      .subscribe({
        next: (response) => {
          console.log('Payment successful', response);

          this.paymentProcessing.set(false);
          this.paymentCompleted.set(true);

          debugger;
          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          this.paymentProcessing.set(false);

          console.error('Payment failed', error);

          if (error.status === 400) {
            // Backend says insufficient balance
            this.insufficientBalance.set(true);
          }
        },
      });
  }

  goBackToPurchase(): void {
    this.router.navigate(['/ticket-purchase'], {
      state: {
        fromStationId: this.fromStationId(),
        toStationId: this.toStationId(),
        fare: this.fare(),
      },
    });
  }

  get remainingBalance(): number {
    const ticketFare = this.fare()?.fare ?? 0;
    return this.balance() - ticketFare;
  }
}
