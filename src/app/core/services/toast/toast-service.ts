import { Service, signal } from '@angular/core';

@Service()
export class ToastService {
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  private id = 0;

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 2500) {
    const toast: ToastMessage = {
      id: ++this.id,
      message,
      type,
    };

    this.toastsSignal.update((current) => [...current, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }
  success(message: string, duration = 2500) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 2500) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 2500) {
    this.show(message, 'info', duration);
  }

  remove(id: number) {
    this.toastsSignal.update((current) => current.filter((toast) => toast.id !== id));
  }
}

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
