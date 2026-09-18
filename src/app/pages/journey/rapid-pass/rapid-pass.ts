import { Component, inject, signal } from '@angular/core';
import {
  RapidPassQrResponse,
  TicketService,
} from '../../../core/services/ticket/ticket-service';

@Component({
  selector: 'app-rapid-pass',
  imports: [],
  templateUrl: './rapid-pass.html',
  styleUrl: './rapid-pass.css',
})
export class RapidPass {
  private ticketService = inject(TicketService);

  qrCode = signal<string | null>(null);
  loading = signal(true);
  refreshing = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadRapidPassQr();
  }

  loadRapidPassQr(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.ticketService.getRapidPassQr().subscribe({
      next: (response) => {
        this.qrCode.set(this.extractQrCode(response));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load RapidPass QR', error);
        this.loading.set(false);
        this.errorMessage.set('Failed to load your RapidPass QR.');
      },
    });
  }

  refreshRapidPassQr(): void {
    if (this.refreshing()) {
      return;
    }

    this.refreshing.set(true);
    this.errorMessage.set('');

    this.ticketService.updateRapidPassQr().subscribe({
      next: (response) => {
        this.qrCode.set(this.extractQrCode(response));
        this.refreshing.set(false);
      },
      error: (error) => {
        console.error('Failed to refresh RapidPass QR', error);
        this.refreshing.set(false);
        this.errorMessage.set('Failed to refresh your RapidPass QR.');
      },
    });
  }

  private extractQrCode(response: RapidPassQrResponse | string): string | null {
    if (typeof response === 'string') {
      return response;
    }

    if (response.qrCode) {
      return response.qrCode;
    }

    if (typeof response.data === 'string') {
      return response.data;
    }

    return response.data?.qrCode ?? null;
  }
}
