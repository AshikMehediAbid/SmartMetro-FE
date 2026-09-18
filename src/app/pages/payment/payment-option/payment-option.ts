import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';
import { PaymentFor, PaymentMethod, WalletService } from '../../../core/services/Wallet/wallet-service';

interface StationFareResponse {
  fromStation: string;
  toStation: string;
  distance: number;
  fare: number;
}

@Component({
  selector: 'app-payment-option',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './payment-option.html',
  styleUrl: './payment-option.css',
})
export class PaymentOption {
  private walletService = inject(WalletService);
  private authService = inject(AuthService);
  private router = inject(Router);

  fare = signal<StationFareResponse | null>(null);
  fromStationId = signal<number | null>(null);
  toStationId = signal<number | null>(null);
  isLoading = signal(true);
  paymentMessage = signal('Preparing payment...');
  paymentCompleted = signal(false);
  paymentFor = signal<PaymentFor>(PaymentFor.SingleJourney);
  rechargeAmount = signal<number>(500);

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state ?? history.state;

    const selectedPaymentFor = state?.paymentFor ?? PaymentFor.SingleJourney;
    this.paymentFor.set(selectedPaymentFor);

    if (selectedPaymentFor === PaymentFor.WalletRecharge) {
      const amount = Number(state?.amount ?? this.rechargeAmount());
      this.rechargeAmount.set(Number.isFinite(amount) && amount > 0 ? amount : 500);
      this.isLoading.set(false);
      this.paymentMessage.set('Enter an amount and click Pay Now.');
      return;
    }

    if (!state?.fare) {
      this.router.navigate(['/ticket-purchase']);
      return;
    }

    this.fare.set(state.fare);
    this.fromStationId.set(state.fromStationId ?? null);
    this.toStationId.set(state.toStationId ?? null);

    this.callOnlinePaymentApi();
  }

  submitRecharge(): void {
    const amount = Number(this.rechargeAmount());

    if (!Number.isFinite(amount) || amount <= 0) {
      this.paymentMessage.set('Please enter a valid amount greater than 0.');
      return;
    }

    this.paymentFor.set(PaymentFor.WalletRecharge);
    this.callOnlinePaymentApi();
  }

  private callOnlinePaymentApi(): void {
    const email = this.authService.getUserEmail();
    const selectedPaymentFor = this.paymentFor();

    if (selectedPaymentFor === PaymentFor.WalletRecharge) {
      const amount = Number(this.rechargeAmount());

      if (!Number.isFinite(amount) || amount <= 0) {
        this.isLoading.set(false);
        this.paymentMessage.set('Please enter a valid recharge amount.');
        return;
      }

      this.walletService
        .purchaseTicket({
          userEmail: email,
          amount,
          paymentMethod: PaymentMethod.Online,
          paymentFor: PaymentFor.WalletRecharge,
          fromStationId: null,
          toStationId: null,
        })
        .subscribe({
          next: (response) => this.handlePaymentResponse(response),
          error: (error) => this.handlePaymentError(error),
        });

      return;
    }

    const fromStationId = this.fromStationId();
    const toStationId = this.toStationId();

    if (fromStationId === null || toStationId === null) {
      this.isLoading.set(false);
      this.paymentMessage.set('Missing trip details. Please select your route again.');
      return;
    }

    this.walletService
      .purchaseTicket({
        fromStationId,
        toStationId,
        userEmail: email,
        amount: this.fare()?.fare ?? 0,
        paymentMethod: PaymentMethod.Online,
        paymentFor: PaymentFor.SingleJourney,
      })
      .subscribe({
        next: (response) => this.handlePaymentResponse(response),
        error: (error) => this.handlePaymentError(error),
      });
  }

  private handlePaymentResponse(response: any): void {
    const sandboxUrl = this.extractSandboxUrl(response);

    if (sandboxUrl) {
      this.isLoading.set(false);
      this.paymentMessage.set('Redirecting to payment gateway...');
      window.location.href = sandboxUrl;
      return;
    }

    console.log('Online payment successful', response);
    this.isLoading.set(false);
    this.paymentCompleted.set(true);
    this.paymentMessage.set('Payment successful. Redirecting to dashboard...');

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  private handlePaymentError(error: any): void {
    console.error('Online payment failed', error);
    this.isLoading.set(false);
    this.paymentMessage.set('Payment failed. Please try again.');
  }

  private extractSandboxUrl(response: any): string | null {
    const value = response?.sandboxUrl ??
      response?.sandbox_url ??
      response?.paymentUrl ??
      response?.payment_url ??
      response?.checkoutUrl ??
      response?.checkout_url ??
      response?.redirectUrl ??
      response?.redirect_url ??
      response?.url ??
      response?.data?.sandboxUrl ??
      response?.data?.sandbox_url ??
      response?.data?.paymentUrl ??
      response?.data?.payment_url ??
      response?.data?.checkoutUrl ??
      response?.data?.checkout_url ??
      response?.data?.redirectUrl ??
      response?.data?.redirect_url ??
      response?.data?.url ??
      (typeof response === 'string' ? response : null);

    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}
