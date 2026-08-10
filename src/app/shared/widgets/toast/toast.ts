import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast/toast-service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  standalone: true,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
