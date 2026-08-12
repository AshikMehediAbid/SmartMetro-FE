import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StationService } from '../../../core/services/station/station-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-station',
  imports: [FormsModule],
  templateUrl: './create-station.html',
  styleUrl: './create-station.css',
})
export class CreateStation {

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

    onCreateStationClick() {
    this.stationService.createStation(this.stationObj()).subscribe({
      next: (response) => {
        this.router.navigate(['/stations']);
      },
      error: (error) => {
        console.error('Station creation failed', error);
      },
    });
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
