import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appTrim]',
  host: { '(blur)': 'trim()' },
})
export class TrimInput {
  private readonly ngControl = inject(NgControl, { self: true });

  trim(): void {
    const control = this.ngControl.control;
    if (typeof control?.value === 'string') {
      control.setValue(control.value.trim());
    }
  }
}
