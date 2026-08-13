import { inject, Service } from '@angular/core';
import { CreateStationModel } from '../../../pages/station/create-station/create-station';
import { HttpClient } from '@angular/common/http';
import { StationModel } from '../../../pages/station/station-list/station-list';

@Service()
export class StationService {
  http = inject(HttpClient);

  private baseUrl = 'https://localhost:7246/api/station';

  createStation(station: CreateStationModel) {
    return this.http.post(`${this.baseUrl}/create`, station);
  }

  getAllStations(orderHint: number) {
    return this.http.get<StationResponse<StationModel[]>>(`${this.baseUrl}/${orderHint}`);
  }

  deleteStation(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

export interface StationResponse<T> {
  data: T;
  message: string | null;
}
