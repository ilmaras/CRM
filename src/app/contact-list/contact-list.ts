import { Component, input, output, signal } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { createContactForm, type ContactForm } from '../contact';
import { TrimInput } from '../trim-input';

@Component({
  selector: 'app-contact-list',
  imports: [ReactiveFormsModule, TrimInput],
  templateUrl: './contact-list.html',
  styleUrls: ['../form-fields.css', './contact-list.css'],
})
export class ContactList {
  readonly contacts = input.required<FormArray<ContactForm>>();
  readonly editingChanged = output<boolean>();
  // -1 žymi naują kontaktą; null – užvertą redaktorių.
  readonly editingIndex = signal<number | null>(null);
  readonly draft = createContactForm();

  add(): void {
    if (this.editingIndex() !== null) return;
    this.draft.reset();
    this.editingIndex.set(-1);
    this.editingChanged.emit(true);
  }

  edit(index: number): void {
    if (this.editingIndex() !== null) return;
    this.draft.reset(this.contacts().at(index).getRawValue());
    this.editingIndex.set(index);
    this.editingChanged.emit(true);
  }

  confirm(): void {
    const index = this.editingIndex();
    if (index === null) return;
    const value = this.draft.getRawValue();
    this.draft.setValue({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      position: value.position.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
    });
    this.draft.markAllAsTouched();
    if (this.draft.invalid) return;

    if (index === -1) {
      const contact = createContactForm();
      contact.setValue(this.draft.getRawValue());
      this.contacts().push(contact);
    } else {
      this.contacts().at(index).setValue(this.draft.getRawValue());
    }
    this.contacts().markAsDirty();
    this.cancel();
  }

  cancel(): void {
    this.draft.reset();
    this.editingIndex.set(null);
    this.editingChanged.emit(false);
  }

  remove(index: number): void {
    if (this.editingIndex() !== null) return;
    this.contacts().removeAt(index);
    this.contacts().markAsDirty();
  }

  error(field: keyof typeof this.draft.controls): string | null {
    const control = this.draft.controls[field];
    if (!control.touched || control.valid) return null;
    switch (field) {
      case 'firstName':
        return 'Įrašykite vardą.';
      case 'lastName':
        return 'Įrašykite pavardę.';
      case 'email':
        return control.hasError('required')
          ? 'Įrašykite el. pašto adresą.'
          : 'Įrašykite tinkamą el. pašto adresą.';
      case 'phone':
        return control.hasError('required')
          ? 'Įrašykite telefono numerį.'
          : 'Naudokite formatą +3706XXXXXXX arba 06XXXXXXX.';
      default:
        return null;
    }
  }
}
