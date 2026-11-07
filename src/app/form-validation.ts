import { Validators } from '@angular/forms';

export const phoneValidator = Validators.pattern(/^(\+370[0-9]{8}|0[0-9]{8})$/);
