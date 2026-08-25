import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TicketResponse } from '../../../core/models/classes/TicketResponse';
import { TicketService } from '../../../core/services/ticket/ticket-service';
import { TicketStatus } from '../../../core/enums/TicketStatus';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ticket',
  imports: [FormsModule, DatePipe],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class Ticket {
  private ticketService = inject(TicketService);

  tickets = signal<TicketResponse[]>([]);
  selectedStatus = signal<TicketStatus>(TicketStatus.Fresh);
  selectedTicket = signal<TicketResponse | null>(null);
  downloadingTicketId = signal<string | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  readonly TicketStatus = TicketStatus;

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.ticketService.getUserTickets(this.selectedStatus()).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tickets', error);
        this.loading.set(false);
        this.errorMessage.set('Failed to load tickets.');
      },
    });
  }

  changeStatus(status: TicketStatus): void {
    this.selectedStatus.set(status);
    this.loadTickets();
  }

  viewTicket(ticket: TicketResponse): void {
    this.selectedTicket.set(ticket);
  }

  closeTicket(): void {
    this.selectedTicket.set(null);
  }

  downloadTicket(ticket: TicketResponse): void {
    this.downloadingTicketId.set(ticket.id);

    this.ticketService.downloadTicket(ticket.id).subscribe({
      next: (file) => {
        const downloadLink = document.createElement('a');
        const fileUrl = URL.createObjectURL(file);

        downloadLink.href = fileUrl;
        downloadLink.download = `Mrt_Ticket_${ticket.id}.pdf`;
        downloadLink.click();

        URL.revokeObjectURL(fileUrl);
        this.downloadingTicketId.set(null);
      },
      error: (error) => {
        console.error('Failed to download ticket', error);
        this.downloadingTicketId.set(null);
        this.errorMessage.set('Failed to download ticket.');
      },
    });
  }

  getStatusText(status: TicketStatus | string | number): string {
    switch (this.normalizeStatus(status)) {
      case TicketStatus.Fresh:
        return 'Fresh';

      case TicketStatus.Used:
        return 'Used';

      case TicketStatus.Expired:
        return 'Expired';

      case TicketStatus.InUse:
        return 'In Use';

      default:
        return 'Unknown';
    }
  }

  isStatus(status: TicketStatus | string | number, expectedStatus: TicketStatus): boolean {
    return this.normalizeStatus(status) === expectedStatus;
  }

  private normalizeStatus(status: TicketStatus | string | number): TicketStatus | null {
    if (typeof status === 'number') {
      return Object.values(TicketStatus).includes(status)
        ? status
        : null;
    }

    const normalizedStatus = String(status).trim().toLowerCase().replace(/[_-]/g, '');

    switch (normalizedStatus) {
      case '1':
      case 'fresh':
        return TicketStatus.Fresh;
      case '2':
      case 'used':
        return TicketStatus.Used;
      case '3':
      case 'expired':
        return TicketStatus.Expired;
      case '4':
      case 'inuse':
        return TicketStatus.InUse;
      default:
        return null;
    }
  }

  trackByTicketId(index: number, ticket: TicketResponse): string {
    return ticket.id;
  }
}
