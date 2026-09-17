import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { TicketStatus } from '../../enums/TicketStatus';
import { Observable } from 'rxjs';
import { TicketResponse } from '../../models/classes/TicketResponse';
import { map } from 'rxjs/operators';

@Service()
export class TicketService {
    private http = inject(HttpClient);

  private baseUrl = 'https://localhost:7246/api/tickets';
  
  getUserTickets(ticketStatus: TicketStatus = TicketStatus.Fresh){
    const params = new HttpParams().set(
      'ticketStatus',
      ticketStatus.toString()
    );

    return this.http.get<TicketResponse[]>(
        this.baseUrl, 
        { params }
    );
  }

  downloadTicket(ticketId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-ticket/${ticketId}`, {
      responseType: 'blob',
    });
  }

  getRapidPassQr(): Observable<RapidPassQrResponse> {
    return this.http.get<RapidPassQrResponse>(`${this.baseUrl}/rapidpass`);
  }

  
  updateRapidPassQr(): Observable<RapidPassQrResponse> {
    return this.http.put<RapidPassQrResponse>(`${this.baseUrl}/rapidpass`, null);
  }


  sendScannedQrData(qrCode: string, stationId: number, gate: 'Entry' | 'Exit') {
    return this.http.post<ScannerResponse | string>(
      `https://localhost:7246/api/scanner/qr-data`, 
      { qrCode, stationId, gate }
    );
  }
}

export interface ScannerResponse {
  message?: string;
}

export interface RapidPassQrResponse {
  qrCode?: string;
  data?: string | { qrCode?: string };
}

interface TicketResponseEnvelope {
  data: TicketResponse[];
}
