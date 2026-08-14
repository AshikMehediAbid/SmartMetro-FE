import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin/admin-service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  isEditMode = signal<boolean>(false);
  isLoading = signal(false);

  adminService = inject(AdminService);

  settings = signal<SettingsModel>({
    unitFare: 0,
    minimumFare: 0,
  });

  // Used for Cancel
  private originalSettings: SettingsModel = {
    unitFare: 0,
    minimumFare: 0,
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);

    this.adminService.getSettings().subscribe({
      next: (response) => {
        const data: SettingsModel = {
          unitFare: response.unitFare,
          minimumFare: response.minimumFare,
        };

        this.settings.set(data);
        this.originalSettings = { ...data };

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load settings', error);
        this.isLoading.set(false);
      },
    });
  }

  editSettings() {
    // Take a snapshot before editing
    this.originalSettings = { ...this.settings() };

    this.isEditMode.set(true);
  }
  cancelEdit() {
    // Restore original values
    this.settings.set({ ...this.originalSettings });

    this.isEditMode.set(false);
  }

  updateSettings() {
    const payload = {
      unitFare: this.settings().unitFare,
      minimumFare: this.settings().minimumFare,
    };

    this.adminService.updateSettings(payload).subscribe({
      next: (response) => {
        const updatedSettings: SettingsModel = {
          unitFare: response.unitFare,
          minimumFare: response.minimumFare,
        };

        this.settings.set(updatedSettings);
        this.originalSettings = { ...updatedSettings };

        this.isEditMode.set(false);
      },
      error: (error) => {
        console.error('Failed to update settings', error);
      },
    });
  }
}

export interface SettingsModel {
  unitFare: number;
  minimumFare: number;
}
