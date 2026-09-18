import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StationModel } from '../station-list/station-list';
import { StationService, StationUpdateModel } from '../../../core/services/station/station-service';
import { ToastService } from '../../../core/services/toast/toast-service';

@Component({
  selector: 'app-edit-station',
  imports: [FormsModule],
  templateUrl: './edit-station.html',
  styleUrl: './edit-station.css',
})
export class EditStation {
  private readonly stationService = inject(StationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly stationId = signal<number | null>(null);
  readonly stations = signal<StationModel[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly station = signal<StationUpdateModel>(this.emptyStation());

  ngOnInit(): void {
    const stationId = Number(this.route.snapshot.paramMap.get('stationId'));
    if (!Number.isInteger(stationId) || stationId <= 0) {
      this.errorMessage.set('The station could not be identified.');
      this.isLoading.set(false);
      return;
    }

    this.stationId.set(stationId);
    this.stationService.getAllStations(1).subscribe({
      next: (response) => {
        const stations = response.data ?? [];
        const selectedStation = stations.find((item) => item.stationId === stationId);
        this.stations.set(stations);

        if (!selectedStation) {
          this.errorMessage.set('Station not found.');
        } else {
          this.station.set({
            ...this.emptyStation(),
            stationId: selectedStation.stationId,
            stationName: selectedStation.stationName,
            stationLocation: selectedStation.stationLocation,
            lat: selectedStation.lat,
            long: selectedStation.long,
            isActive: selectedStation.isActive,
            insertAfter: Math.max(selectedStation.stationOrder - 1, 0),
            distanceFromPreviousStation: selectedStation.distanceFromPreviousStation,
            distanceFromNextStation: selectedStation.distanceFromNextStation,
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load station', error);
        this.errorMessage.set('Failed to load station. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onUpdateStation(): void {
    const station = this.station();
    if (!this.stationId() || !station.stationName.trim() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.stationService.updateStation(this.stationId()!, station).subscribe({
      next: () => {
        this.toastService.success('Station updated successfully.');
        this.router.navigate(['/stations']);
      },
      error: (error) => {
        console.error('Failed to update station', error);
        this.errorMessage.set('Failed to update station. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/stations']);
  }

  getPreviousStationName(): string {
    return this.stations().find(
      (item) => item.stationOrder === this.station().insertAfter,
    )?.stationName ?? 'previous station';
  }

  showPreviousDistance(): boolean {
    return this.station().insertAfter > 0;
  }

  getNextStationName(): string {
    return this.stations().find(
      (item) => item.stationOrder > this.station().insertAfter && item.stationId !== this.station().stationId,
    )?.stationName ?? 'next station';
  }

  showNextDistance(): boolean {
    return this.stations().some(
      (item) => item.stationOrder > this.station().insertAfter && item.stationId !== this.station().stationId,
    );
  }

  private emptyStation(): StationUpdateModel {
    return {
      stationId: 0,
      stationName: '',
      stationLocation: '',
      lat: 0,
      long: 0,
      isActive: true,
      insertAfter: 0,
      distanceFromPreviousStation: 0,
      distanceFromNextStation: 0,
    };
  }
}
