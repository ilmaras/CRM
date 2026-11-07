import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ValidatorFn } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactList } from '../contact-list/contact-list';
import type { ContactForm } from '../contact';
import { phoneValidator } from '../form-validation';
import { TrimInput } from '../trim-input';

@Component({
  selector: 'app-company-form',
  imports: [RouterLink, ReactiveFormsModule, ContactList, TrimInput],
  templateUrl: './company-form.html',
  styleUrls: ['../form-fields.css', './company-form.css'],
})
export class CompanyForm {
  private readonly formBuilder = inject(FormBuilder);
  readonly editingContact = signal(false);

  readonly companyForm = this.formBuilder.nonNullable.group({
    name: ['', [trimmedName]],
    companyCode: ['', [Validators.pattern(/^([0-9]{7}|[0-9]{9})$/)]],
    vatCode: ['', [Validators.pattern(/^(LT)?([0-9]{9}|[0-9]{12})$/)]],
    address: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [phoneValidator]],
    contacts: new FormArray<ContactForm>([]),
  });

  error(field: keyof typeof this.companyForm.controls): string | null {
    const control = this.companyForm.controls[field];
    if (!control.touched || control.valid) return null;

    switch (field) {
      case 'name':
        return control.hasError('required')
          ? 'Įrašykite įmonės pavadinimą.'
          : 'Pavadinimą turi sudaryti nuo 2 iki 30 simbolių.';
      case 'companyCode':
        return 'Įmonės kodą turi sudaryti 7 arba 9 skaitmenys.';
      case 'vatCode':
        return 'Įrašykite 9 arba 12 skaitmenų, su LT arba be jo.';
      case 'email':
        return control.hasError('required')
          ? 'Įrašykite įmonės el. pašto adresą.'
          : 'Įrašykite tinkamą el. pašto adresą.';
      case 'phone':
        return 'Naudokite formatą +3706XXXXXXX arba 06XXXXXXX.';
      default:
        return null;
    }
  }

  submit(): void {
    if (this.editingContact()) return;
    const values = this.companyForm.getRawValue();
    this.companyForm.setValue({
      name: values.name.trim(),
      companyCode: values.companyCode.trim(),
      vatCode: values.vatCode.trim(),
      address: values.address.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      contacts: values.contacts,
    });
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) return;

    // Saugojimas dar neįgyvendintas; duomenys pateikiami tik konsolėje.
    console.log(this.companyForm.getRawValue());
  }
}

const trimmedName: ValidatorFn = (control) => {
  const name = (control.value as string).trim();
  if (!name) return { required: true };
  if (name.length < 2) return { minlength: true };
  if (name.length > 30) return { maxlength: true };
  return null;
};
