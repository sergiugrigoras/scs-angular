import { ToastService } from './../../services/toast.service';
import { Component, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.css']
})
export class ToastsComponent implements OnInit {
  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
  }

  get toasts() {
    return this.toastService.toasts;
  }

  remove(toast: any) {
    this.toastService.remove(toast);
  }

  isTemplate(toast: any) { return toast.textOrTpl instanceof TemplateRef; }
}
