import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class PaymentService {
  private http = inject(HttpClient);
  private BASE_URL = 'https://localhost:7246/api/payment';

  getPaymentStatus(transactionId: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${this.BASE_URL}/status/${transactionId}`);
  }
}

export interface PaymentStatus {
  success?: boolean;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  pgTransactionId?: string;
  bankTransactionId?: string;
  paidAt?: string | Date | null;
}
