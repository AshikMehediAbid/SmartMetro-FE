import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TicketResponse } from '../../core/models/classes/TicketResponse';
import { TicketStatus } from '../../core/enums/TicketStatus';
import { AuthService } from '../../core/services/auth/auth-service';
import { TicketService } from '../../core/services/ticket/ticket-service';
import { PaymentFor, WalletService } from '../../core/services/Wallet/wallet-service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly walletService = inject(WalletService);

  readonly TicketStatus = TicketStatus;
  readonly userName = signal('there');
  readonly balance = signal<number | null>(null);
  readonly balanceError = signal(false);
  readonly freshTickets = signal<TicketResponse[]>([]);
  readonly usedTickets = signal<TicketResponse[]>([]);
  readonly expiredTickets = signal<TicketResponse[]>([]);
  readonly inUseTickets = signal<TicketResponse[]>([]);
  readonly loadingTickets = signal(true);
  readonly ticketError = signal(false);

  ngOnInit(): void {
    const profile = this.authService.getDisplayProfile();
    this.userName.set(profile?.name || profile?.email?.split('@')[0] || 'there');
    this.loadBalance();
    this.loadTickets();
  }

  private loadBalance(): void {
    this.walletService.getBalance().subscribe({
      next: (balance) => this.balance.set(Number(balance)),
      error: (error) => {
        console.error('Failed to load wallet balance', error);
        this.balanceError.set(true);
      },
    });
  }

  private loadTickets(): void {
    this.loadTicketGroup(TicketStatus.Fresh, this.freshTickets);
    this.loadTicketGroup(TicketStatus.Used, this.usedTickets);
    this.loadTicketGroup(TicketStatus.Expired, this.expiredTickets);
    this.loadTicketGroup(TicketStatus.InUse, this.inUseTickets);
  }

  private loadTicketGroup(status: TicketStatus, target: ReturnType<typeof signal<TicketResponse[]>>): void {
    this.ticketService.getUserTickets(status).subscribe({
      next: (tickets) => {
        target.set(this.sortByNewest(tickets ?? []));
        this.loadingTickets.set(false);
      },
      error: (error) => {
        console.error(`Failed to load ${status} tickets`, error);
        this.ticketError.set(true);
        this.loadingTickets.set(false);
      },
    });
  }

  private sortByNewest(tickets: TicketResponse[]): TicketResponse[] {
    return [...tickets].sort((first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }

  get recentTicket(): TicketResponse | null {
    return this.freshTickets()[0] ?? this.inUseTickets()[0] ?? null;
  }

  get recentJourney(): TicketResponse | null {
    return this.usedTickets()[0] ?? this.inUseTickets()[0] ?? null;
  }

  get totalTrips(): number {
    return this.usedTickets().length + this.inUseTickets().length;
  }

  viewTicket(ticket: TicketResponse): void {
    this.router.navigate(['/tickets'], { queryParams: { ticketId: ticket.id } });
  }

  buyTicket(): void {
    this.router.navigate(['/ticket-purchase']);
  }

  addMoney(): void {
    this.router.navigate(['/payment-option'], {
      state: {
        paymentFor: PaymentFor.WalletRecharge,
      },
    });
  }

  viewTickets(): void {
    this.router.navigate(['/tickets']);
  }

  openAccount(): void {
    this.router.navigate(['/user-profile']);
  }

  viewJourneyHistory(): void {
    this.router.navigate(['/tickets'], { queryParams: { status: TicketStatus.Used } });
  }
}
