import { Component, inject, signal } from '@angular/core';
import { StationService } from '../../../core/services/station/station-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-station-list',
  imports: [],
  templateUrl: './station-list.html',
  styleUrl: './station-list.css',
})
export class StationList {
  stationService = inject(StationService);
  router = inject(Router);

  stations = signal<StationModel[]>([]);
  isLoading = signal<boolean>(false);

  // 1 = ascending
  // 0 = descending
  orderByHint = signal<number>(1);

  ngOnInit(): void {
    this.loadStations(this.orderByHint());
  }

  loadStations(hint: number): void {
    this.isLoading.set(true);
    this.orderByHint.set(hint);

    this.stationService.getAllStations(this.orderByHint()).subscribe({
      next: (response) => {
        this.stations.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load stations', error);
        this.isLoading.set(false);
      },
    });
  }

  onEdit(stationId: number): void {
    this.router.navigate(['/stations/edit', stationId]);
  }

  onAddStationClick()
  {
    this.router.navigate(['/create-station']);
  }
  onDelete(stationId: number): void {
    const confirmed = confirm('Are you sure you want to delete this station?');

    if (!confirmed) {
      return;
    }

    this.stationService.deleteStation(stationId).subscribe({
      next: () => {
        this.stations.update((stations) =>
          stations.filter((station) => station.stationId !== stationId),
        );
      },
      error: (error) => {
        console.error('Failed to delete station', error);
      },
    });
  }
}

export interface StationModel {
  stationId: number;
  stationName: string;
  stationLocation: string;
  lat: number;
  long: number;
  isActive: boolean;
  stationOrder : number;
}
