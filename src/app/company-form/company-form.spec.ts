import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CompanyForm } from './company-form';

describe('Įmonės forma', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyForm],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  it('palikus lauką pašalina kraštinius tarpus ir atnaujina mygtuko būseną', () => {
    const fixture = TestBed.createComponent(CompanyForm);
    fixture.componentInstance.companyForm.controls.name.setValue('Mano įmonė');
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const email = page.querySelector<HTMLInputElement>('#company-email')!;
    const save = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    email.value = '  info@example.lt  ';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    email.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(email.value).toBe('info@example.lt');
    expect(save.disabled).toBe(false);

    const phone = page.querySelector<HTMLInputElement>('#company-phone')!;
    phone.value = '   ';
    phone.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(save.disabled).toBe(true);
    phone.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(phone.value).toBe('');
    expect(save.disabled).toBe(false);
    expect(fixture.componentInstance.companyForm.controls.name.value).toBe('Mano įmonė');
  });

  it('tuščios formos mygtukas neaktyvus, o tiesioginis pateikimas irgi atmetamas', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fixture = TestBed.createComponent(CompanyForm);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.error')).toBeNull();

    const button = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.disabled).toBe(true);
    button.click();
    expect(log).not.toHaveBeenCalled();

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(page.textContent).toContain('Įrašykite įmonės pavadinimą.');
    expect(page.textContent).toContain('Įrašykite įmonės el. pašto adresą.');
    expect(page.querySelectorAll('[aria-invalid="true"]')).toHaveLength(2);
    expect(log).not.toHaveBeenCalled();
  });

  it('įvestus duomenis apkarpo ir pateikia į konsolę be neprivalomų laukų', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fixture = TestBed.createComponent(CompanyForm);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    for (const [field, value] of [
      ['name', '  Įmonė  '],
      ['email', '  info@example.lt  '],
    ]) {
      const input = page.querySelector<HTMLInputElement>(`[formControlName="${field}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(log).toHaveBeenCalledExactlyOnceWith({
      name: 'Įmonė',
      companyCode: '',
      vatCode: '',
      address: '',
      email: 'info@example.lt',
      phone: '',
      contacts: [],
    });
    expect(fixture.componentInstance.companyForm.controls.name.value).toBe('Įmonė');
    expect(page.querySelector('.error')).toBeNull();
  });

  it('mygtukas aktyvuojamas tik tinkamai užpildžius formą, įskaitant neprivalomus laukus', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fixture = TestBed.createComponent(CompanyForm);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const button = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const enter = (field: string, value: string) => {
      const input = page.querySelector<HTMLInputElement>(`[formControlName="${field}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    expect(button.disabled).toBe(true);
    enter('name', 'Įmonė');
    expect(button.disabled).toBe(true);
    enter('email', 'info@example.lt');
    expect(button.disabled).toBe(false);
    enter('companyCode', '123');
    expect(button.disabled).toBe(true);
    enter('companyCode', '');
    expect(button.disabled).toBe(false);
    enter('email', 'klaida');
    expect(button.disabled).toBe(true);
    enter('email', 'info@example.lt');
    button.click();
    expect(log).toHaveBeenCalledOnce();
  });

  it.each([
    ['name', ' ', false],
    ['name', ' A ', false],
    ['name', 'AB', true],
    ['name', 'A'.repeat(30), true],
    ['name', 'A'.repeat(31), false],
    ['companyCode', '', true],
    ['companyCode', '0012345', true],
    ['companyCode', '001234567', true],
    ['companyCode', '12A', false],
    ['companyCode', '123456', false],
    ['companyCode', '00123456', false],
    ['companyCode', '1234567890', false],
    ['companyCode', '12345678A', false],
    ['vatCode', '', true],
    ['vatCode', '123456789', true],
    ['vatCode', 'LT123456789', true],
    ['vatCode', '123456789012', true],
    ['vatCode', 'LT123456789012', true],
    ['vatCode', '12345678', false],
    ['vatCode', '1234567890', false],
    ['vatCode', '12345678901', false],
    ['vatCode', '1234567890123', false],
    ['vatCode', 'LT12345678', false],
    ['vatCode', 'LT1234567890', false],
    ['vatCode', 'LT12345678901', false],
    ['vatCode', 'LT1234567890123', false],
    ['vatCode', 'LT12345678A', false],
    ['vatCode', 'DE123456789', false],
    ['vatCode', 'LT', false],
    ['vatCode', 'DE123', false],
    ['email', '', false],
    ['email', 'netinkamas', false],
    ['email', 'info@example.lt', true],
    ['phone', '', true],
    ['phone', '+37060000000', true],
    ['phone', '060000000', true],
    ['phone', '860000000', false],
    ['phone', '+3706000000', false],
    ['phone', '+370600000000', false],
    ['phone', '0600A0000', false],
  ] as const)('tikrina lauką %s su reikšme %s (galioja: %s)', (field, value, valid) => {
    const form = TestBed.createComponent(CompanyForm).componentInstance.companyForm;
    form.controls[field].setValue(value);
    expect(form.controls[field].valid).toBe(valid);
  });

  it('neteisingo neprivalomo lauko nepraleidžia ir išlaiko įvestį', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const component = TestBed.createComponent(CompanyForm).componentInstance;
    component.companyForm.patchValue({ name: 'Įmonė', email: 'info@example.lt', phone: '123' });
    component.submit();
    expect(log).not.toHaveBeenCalled();
    expect(component.error('phone')).toContain('+3706XXXXXXX');
    expect(component.companyForm.controls.phone.value).toBe('123');
  });
});
