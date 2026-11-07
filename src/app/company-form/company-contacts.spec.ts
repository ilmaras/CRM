import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CompanyForm } from './company-form';
import { ContactList } from '../contact-list/contact-list';

describe('Įmonės kontaktinių asmenų sąrašas', () => {
  const first = {
    firstName: 'Jonas',
    lastName: 'Jonaitis',
    position: '',
    email: 'jonas@example.lt',
    phone: '060000000',
  };
  const second = {
    firstName: 'Ona',
    lastName: 'Onaitė',
    position: 'Vadovė',
    email: 'ona@example.lt',
    phone: '+37060000001',
  };

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CompanyForm],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(CompanyForm);
    fixture.componentInstance.companyForm.patchValue({ name: 'Įmonė', email: 'info@example.lt' });
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const contacts = fixture.debugElement.query(By.directive(ContactList))
      .componentInstance as ContactList;
    const click = (selector: string) => {
      const button = page.querySelector<HTMLButtonElement>(selector);
      expect(button).not.toBeNull();
      button!.click();
      fixture.detectChanges();
    };
    const fill = (value: typeof first) => {
      for (const [field, text] of Object.entries(value)) {
        const input = page.querySelector<HTMLInputElement>(`#contact-${field}`)!;
        input.value = text;
        input.dispatchEvent(new Event('input'));
      }
      fixture.detectChanges();
    };
    const add = (value: typeof first) => {
      click('app-contact-list .add-button');
      fill(value);
      click('.confirm-contact');
    };
    return { fixture, page, contacts, click, fill, add };
  }

  afterEach(() => vi.restoreAllMocks());

  it('kontakto el. pašto ir telefono kraštinius tarpus pašalina palikus laukus', async () => {
    const { fixture, page, click, fill, contacts } = await setup();
    click('app-contact-list .add-button');
    fill({ ...first, email: '  jonas@example.lt  ', phone: '  060000000  ' });
    expect(page.querySelector<HTMLButtonElement>('.confirm-contact')!.disabled).toBe(true);
    for (const field of ['email', 'phone']) {
      page.querySelector<HTMLInputElement>(`#contact-${field}`)!.dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();
    expect(page.querySelector<HTMLButtonElement>('.confirm-contact')!.disabled).toBe(false);
    click('.confirm-contact');
    expect(contacts.contacts().getRawValue()).toEqual([first]);
  });

  it('leidžia pateikti įmonę be kontaktų, bet blokuoja pateikimą pradėjus kontaktą', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { fixture, page, click } = await setup();
    const save = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(save.disabled).toBe(false);
    click('app-contact-list .add-button');
    expect(save.disabled).toBe(true);
    expect(page.querySelector<HTMLButtonElement>('.confirm-contact')!.disabled).toBe(true);
    fixture.componentInstance.submit();
    expect(log).not.toHaveBeenCalled();

    click('app-contact-list .cancel-button');
    expect(save.disabled).toBe(false);
    click('button[type="submit"]');
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ contacts: [] }));
  });

  it('prideda kelis kontaktus ir pateikia juos kartu su įmone', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { page, add, click } = await setup();
    add(first);
    add(second);
    expect(page.querySelectorAll('.contact-card')).toHaveLength(2);
    expect(page.textContent).toContain('Jonas Jonaitis');
    expect(page.textContent).toContain('Vadovė');
    click('button[type="submit"]');
    expect(log).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ contacts: [first, second] }),
    );
  });

  it('atšaukus redagavimą išlaiko ankstesnes reikšmes, patvirtinus jas pakeičia', async () => {
    const { fixture, page, add, click, fill } = await setup();
    add(first);
    add(second);
    click('.edit-button');
    expect(page.querySelector<HTMLInputElement>('#contact-firstName')!.value).toBe('Jonas');
    fill({ ...first, firstName: 'Petras' });
    expect(fixture.componentInstance.companyForm.controls.contacts.at(0).value.firstName).toBe(
      'Jonas',
    );
    click('app-contact-list .cancel-button');
    expect(page.textContent).toContain('Jonas Jonaitis');
    expect(page.textContent).not.toContain('Petras');

    click('.edit-button');
    fill({ ...first, firstName: 'Petras' });
    click('.confirm-contact');
    expect(page.textContent).toContain('Petras Jonaitis');
    expect(page.querySelectorAll('.contact-card')).toHaveLength(2);
    expect(fixture.componentInstance.companyForm.controls.contacts.at(1).getRawValue()).toEqual(
      second,
    );
  });

  it('pašalina kontaktus iki tuščio sąrašo ir leidžia vėl pridėti', async () => {
    const { fixture, page, add, click } = await setup();
    add(first);
    add(second);
    click('.delete-button');
    expect(fixture.componentInstance.companyForm.controls.contacts.getRawValue()).toEqual([second]);
    click('.delete-button');
    expect(page.textContent).toContain('Kontaktinių asmenų nėra.');
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    add(first);
    expect(fixture.componentInstance.companyForm.controls.contacts.getRawValue()).toEqual([first]);
  });

  it('neleidžia vienu metu redaguoti kelių kontaktų ar šalinti redaguojant', async () => {
    const { contacts, page, add, click } = await setup();
    add(first);
    click('.edit-button');
    expect(page.querySelector<HTMLButtonElement>('app-contact-list .add-button')!.disabled).toBe(
      true,
    );
    expect(page.querySelector<HTMLButtonElement>('.delete-button')!.disabled).toBe(true);
    contacts.add();
    contacts.remove(0);
    expect(contacts.editingIndex()).toBe(0);
    expect(contacts.contacts().length).toBe(1);
  });

  it.each([
    ['firstName', '   '],
    ['lastName', ''],
    ['email', ''],
    ['email', 'klaida'],
    ['phone', ''],
    ['phone', '+3706000000'],
    ['phone', '860000000'],
  ])('atmeta netinkamą kontakto lauką %s (%s)', async (field, value) => {
    const { contacts, page, click, fill } = await setup();
    click('app-contact-list .add-button');
    fill({ ...first, [field]: value });
    expect(page.querySelector<HTMLButtonElement>('.confirm-contact')!.disabled).toBe(true);
    contacts.confirm();
    expect(contacts.contacts().length).toBe(0);
    expect(contacts.editingIndex()).toBe(-1);
    expect(contacts.error(field as keyof typeof first)).not.toBeNull();
  });

  it('patvirtinant apkarpo laukų kraštinius tarpus', async () => {
    const { contacts, add } = await setup();
    add({ ...first, firstName: '  Jonas  ', lastName: ' Jonaitis ' });
    expect(contacts.contacts().getRawValue()).toEqual([first]);
  });
});
