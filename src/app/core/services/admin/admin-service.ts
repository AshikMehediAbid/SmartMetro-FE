import { inject, Service } from '@angular/core';
import { SettingsModel } from '../../../pages/admin/settings/settings';
import { HttpClient } from '@angular/common/http';

@Service()
export class AdminService {
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://localhost:7246/api/admin';

  getSettings() {
    return this.http.get<SettingsResponse>(`${this.baseUrl}/settings`);
  }

  updateSettings(settings: SettingsModel) {
    return this.http.put<SettingsResponse>(`${this.baseUrl}/settings`, settings);
  }
}

export interface SettingsResponse extends SettingsModel {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
