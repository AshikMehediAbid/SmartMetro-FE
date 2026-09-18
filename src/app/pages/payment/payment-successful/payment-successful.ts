import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, PaymentStatus } from '../../../core/services/payment/payment-service';

@Component({
  selector: 'app-payment-successful',
  imports: [DatePipe],
  templateUrl: './payment-successful.html',
  styleUrl: './payment-successful.css',
})
export class PaymentSuccessful {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  payment = signal<PaymentStatus | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const transactionId = this.route.snapshot.queryParamMap.get('transactionId');
    const status = this.route.snapshot.queryParamMap.get('status')?.toLowerCase();

    if (!transactionId) {
      this.loading.set(false);
      this.error.set('Transaction ID not found.');
      return;
    }

    if (status === 'failed' || status === 'cancelled' || status === 'error') {
      this.payment.set({
        success: false,
        transactionId,
        status: status === 'cancelled' ? 'Cancelled' : 'Failed',
        amount: 0,
        currency: '',
        paymentMethod: '',
        pgTransactionId: '',
        bankTransactionId: '',
        paidAt: new Date().toISOString(),
      });
      this.loading.set(false);
      return;
    }

    this.paymentService.getPaymentStatus(transactionId).subscribe({
      next: (response) => {
        this.payment.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to retrieve payment information.');
        this.loading.set(false);
      },
    });
  }

  retryPayment(): void {
    this.router.navigate(['/ticket-purchase']);
  }
}
