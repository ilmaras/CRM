import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Mini CRM');
  });

  it('opens the company form from the initial list and returns on cancellation', async () => {
    const harness = await RouterTestingHarness.create('/');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/companies');
    expect(harness.routeNativeElement?.textContent).toContain('Įmonių dar nėra.');

    const addLink = harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'a[aria-label="Pridėti įmonę"]',
    );
    expect(addLink).toBeTruthy();
    addLink!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/companies/new');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Nauja įmonė');

    harness.routeNativeElement?.querySelector<HTMLAnchorElement>('.cancel-button')?.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/companies');
    expect(harness.routeNativeElement?.textContent).toContain('Įmonių dar nėra.');
  });

  it('opens the form by its direct address', async () => {
    const harness = await RouterTestingHarness.create('/companies/new');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Nauja įmonė');
  });
});
