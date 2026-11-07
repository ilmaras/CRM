import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { ValidatorFn } from '@angular/forms';
import { phoneValidator } from './form-validation';

const requiredText: ValidatorFn = (control) =>
  (control.value as string).trim() ? null : { required: true };

export function createContactForm() {
  return new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    lastName: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    position: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, phoneValidator],
    }),
  });
}

export type ContactForm = ReturnType<typeof createContactForm>;
