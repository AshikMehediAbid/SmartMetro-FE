import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class WalletService {
     private http = inject(HttpClient);
     
     private baseUrl = 'https://localhost:7246/api';

  getBalance() {
    return this.http.get<number>(
      `${this.baseUrl}/wallet/balance`
    );
  }

   purchaseTicket(request: PurchaseTicketRequest) {
    return this.http.post(
      `${this.baseUrl}/payment`,
      request
    );
  }
}
export interface PurchaseTicketRequest {
  fromStationId?: number | null;
  toStationId?: number | null;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentFor?: PaymentFor;
}

export enum PaymentMethod {
  Online = 1,
  AccountBalance = 2,
}

export enum PaymentFor {
  SingleJourney = 1,
  RapidPass = 2,
  WalletRecharge = 3,
}