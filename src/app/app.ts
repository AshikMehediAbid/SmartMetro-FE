import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth/auth-service';
import { ToastComponent } from './shared/widgets/toast/toast';

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SmartMetro-FE');
  protected sidebarOpened = signal(true);

  private authService = inject(AuthService);
  protected router = inject(Router);
  protected isAdmin = signal(false);
  protected isLoggedIn = signal(false);


  ngOnInit(): void {
    this.updateUserState();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateUserState();
    });
  }

  private updateUserState(): void {
    const loggedIn = this.authService.isLoggedIn();
    this.isLoggedIn.set(loggedIn);
    this.isAdmin.set(this.authService.isAdmin());
  }

  protected toggleSidebar(): void {
    this.sidebarOpened.update((opened) => !opened);
  }

  protected onStationManagement(): void {
    this.router.navigate(['/stations']);
  }
}
