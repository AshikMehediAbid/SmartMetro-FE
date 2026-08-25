import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { finalize } from 'rxjs';
import { TicketService } from '../../../core/services/ticket/ticket-service';

@Component({
  selector: 'app-qr-scanner',
  imports: [ZXingScannerModule],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.css',
})
export class QrScanner {
  private readonly ticketService = inject(TicketService);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly BarcodeFormat = BarcodeFormat;

  scannerEnabled = true;
  scannerMessage = '';
  scannerMessageType: 'success' | 'error' | 'info' = 'info';
  selectedStationId: number | null = null;
  selectedStationName = 'Not selected';
  selectedGate: 'Entry' | 'Exit' | null = null;
  
  readonly videoConstraints: MediaTrackConstraints = {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const stationId = Number(params['stationId']);
      const gate = params['gate'];

      this.selectedStationId = Number.isInteger(stationId) && stationId > 0 ? stationId : null;
      this.selectedStationName = params['stationName'] || 'Not selected';
      this.selectedGate = gate === 'Entry' || gate === 'Exit' ? gate : null;
    });

  }

  onScanSuccess(result: string): void {
    if (!this.scannerEnabled) {
      return;
    }

    if (this.selectedStationId === null || this.selectedGate === null) {
      this.setScannerMessage('Scanner configuration is missing. Return to select a station and gate.', 'error');
      return;
    }

    console.log('QR Data:', result);
    this.scannerEnabled = false;
    this.setScannerMessage('Sending scanned ticket...', 'info');

    this.ticketService.sendScannedQrData(result, this.selectedStationId, this.selectedGate).pipe(
      finalize(() => {
        setTimeout(() => {
          this.scannerEnabled = true;
          this.changeDetector.markForCheck();
        });
      })
    ).subscribe({
      next: (response: unknown) => {
        this.setScannerMessage(this.getResponseMessage(response, 'Ticket QR code sent successfully.'), 'success');
      },
      error: (error: unknown) => {
        console.error('Failed to send scanned QR data', error);
        this.setScannerMessage(this.getResponseMessage(error, 'Failed to send ticket QR code.'), 'error');
      },
    });
  }

  onScanError(error: Error): void {
    console.error('Scanner error:', error);
  }

  onPermissionResponse(hasPermission: boolean): void {
    if (!hasPermission) {
      this.setScannerMessage('Camera permission is required to scan a ticket.', 'error');
    }
  }

  private setScannerMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.scannerMessage = message;
    this.scannerMessageType = type;
    this.changeDetector.markForCheck();
  }

  private getResponseMessage(response: unknown, fallback: string): string {
    if (!response || typeof response !== 'object') {
      return fallback;
    }

    const body = response as { message?: unknown; error?: { message?: unknown } | string };
    const message = typeof body.error === 'object'
      ? body.error?.message
      : typeof body.error === 'string'
        ? body.error
        : body.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

}
