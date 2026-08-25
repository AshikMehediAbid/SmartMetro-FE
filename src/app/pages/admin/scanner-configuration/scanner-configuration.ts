import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StationService } from '../../../core/services/station/station-service';
import { StationModel } from '../../station/station-list/station-list';

@Component({
  selector: 'app-scanner-configuration',
  imports: [FormsModule],
  templateUrl: './scanner-configuration.html',
  styleUrl: './scanner-configuration.css',
})
export class ScannerConfiguration {
  private readonly router = inject(Router);
  private readonly stationService = inject(StationService);

  stations = signal<StationModel[]>([]);
  selectedStationId: number | null = null;
  selectedGate: 'Entry' | 'Exit' | null = null;
  configurationMessage = '';

  ngOnInit(): void {
    this.stationService.getAllStations(1).subscribe({
      next: (response) => {
        this.stations.set(response.data ?? []);
      },
      error: (error: unknown) => {
        console.error('Failed to load stations', error);
        this.configurationMessage = 'Failed to load stations.';
      },
    });
  }

  configureScanner(): void {
    if (this.selectedStationId === null || this.selectedGate === null) {
      this.configurationMessage = 'Select a station and gate to continue.';
      return;
    }

    this.router.navigate(['/qr-scanner'], {
      queryParams: {
        stationId: this.selectedStationId,
        stationName: this.stations().find((station) => station.stationId === this.selectedStationId)?.stationName,
        gate: this.selectedGate,
      },
    });
  }
}
