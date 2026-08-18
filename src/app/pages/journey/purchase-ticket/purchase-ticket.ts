import { Component, inject, signal } from '@angular/core';
import { StationModel } from '../../station/station-list/station-list';
import { StationService } from '../../../core/services/station/station-service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-ticket',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './purchase-ticket.html',
  styleUrl: './purchase-ticket.css',
})
export class PurchaseTicket {stationService = inject(StationService);

  stations = signal<StationModel[]>([]);
  fareResults = signal<StationFareResponse[]>([]);

  selectedFromStationId: number | null = null;
  selectedToStationId: number | null = null;

  isLoading = signal(false);
  searched = signal(false);

  router = inject(Router);

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.stationService.getAllStations(1).subscribe({
      next: (response) => {
        this.stations.set(response.data ?? []);
      },
      error: (error) => {
        console.error('Failed to load stations', error);
      },
    });
  }

  get toStations(): StationModel[] {
    if (this.selectedFromStationId === null) {
      return this.stations();
    }

    return this.stations().filter(
      (station) => station.stationId !== this.selectedFromStationId
    );
  }

  onFromStationChange(): void {
    // If the currently selected To station is the newly selected From station,
    // clear it.
    if (this.selectedToStationId === this.selectedFromStationId) {
      this.selectedToStationId = null;
    }

    this.fareResults.set([]);
    this.searched.set(false);
  }

  searchFare(): void {
    if (this.selectedFromStationId === null) {
      return;
    }

    this.isLoading.set(true);
    this.searched.set(true);

    this.stationService
      .getFare(
        this.selectedFromStationId,
        this.selectedToStationId ?? undefined
      )
      .subscribe({
        next: (response) => {
          this.fareResults.set(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load station fare', error);
          this.fareResults.set([]);
          this.isLoading.set(false);
        },
      });
  }

  clear(): void {
    this.selectedFromStationId = null;
    this.selectedToStationId = null;
    this.fareResults.set([]);
    this.searched.set(false);
  }


  onBuyTicketButtonClick(){
    this.router.navigate(['/payment-option'])
  }
}
interface StationFareResponse {
  fromStation: string;
  toStation: string;
  distance: number;
  fare: number;
}