import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];

  show(header: string, body: string, classes?: string[] | string) {
    let toast;
    if (classes)
      toast = { header, body, classes };
    else
      toast = { header, body };
    this.toasts.push(toast);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t != toast);
  }
}
