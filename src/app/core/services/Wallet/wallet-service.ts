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
  fromStationId: number;
  toStationId: number;
  userEmail: string;
  paymentMethod : PaymentMethod
}

export enum PaymentMethod
{
  Online = 'Online',
  Account = 'AccountBalance'
}