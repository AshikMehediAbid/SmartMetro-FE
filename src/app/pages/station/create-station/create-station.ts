import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StationService } from '../../../core/services/station/station-service';
import { Router } from '@angular/router';
import { StationModel } from '../station-list/station-list';

@Component({
  selector: 'app-create-station',
  imports: [FormsModule],
  templateUrl: './create-station.html',
  styleUrl: './create-station.css',
})
export class CreateStation implements OnDestroy {
  stationService = inject(StationService);
  router = inject(Router);

  stationObj = signal<CreateStationModel>({
    stationName: '',
    stationLocation: '',
    lat: 0,
    long: 0,
    isActive: true,
    insertAfter: 0,
    distanceFromPreviousStation: 0,
    distanceFromNextStation: 0,
  });

  stations = signal<StationModel[]>([]);
  selectedInsertAfter = 0;

  ngOnInit(): void {
    this.loadStations();
  }

  ngOnDestroy(): void {
    this.clearForm();
  }

  loadStations(): void {
    this.stationService.getAllStations(1).subscribe({
      next: (response) => {
        this.stations.set(response.data ?? []);
      },
      error: (error) => {
        console.error('Failed to load stations for insert order', error);
      },
    });
  }

  onCreateStationClick() {
    const payload: CreateStationModel = {
      ...this.stationObj(),
      insertAfter: this.selectedInsertAfter,
    };

    this.stationService.createStation(payload).subscribe({
      next: (response) => {
        this.clearForm();
        this.router.navigate(['/stations']);
      },
      error: (error) => {
        console.error('Station creation failed', error);
      },
    });
  }

  getSelectedStation(): StationModel | null {
    return this.stations().find((station) => station.stationOrder === this.selectedInsertAfter) ?? null;
  }

  getNextStation(): StationModel | null {
    if (this.selectedInsertAfter === 0) {
      return this.stations()[0] ?? null;
    }

    return this.stations().find((station) => station.stationOrder > this.selectedInsertAfter) ?? null;
  }

  showPreviousDistance(): boolean {
    return this.selectedInsertAfter > 0;
  }

  showNextDistance(): boolean {
    return !!this.getNextStation();
  }

  getPreviousStationName(): string {
    return this.getSelectedStation()?.stationName ?? '';
  }

  getNextStationName(): string {
    return this.getNextStation()?.stationName ?? 'next station';
  }

  clearForm(): void {
    this.stationObj.set({
      stationName: '',
      stationLocation: '',
      lat: 0,
      long: 0,
      isActive: true,
      insertAfter: 0,
      distanceFromPreviousStation: 0,
      distanceFromNextStation: 0,
    });
    this.selectedInsertAfter = 0;
  }
}

export interface CreateStationModel {
  stationName: string;
  stationLocation: string;
  lat: number;
  long: number;
  isActive: boolean;
  insertAfter: number;
  distanceFromPreviousStation: number;
  distanceFromNextStation: number;
}
