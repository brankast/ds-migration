import { TestBed } from '@angular/core/testing';
import { FormPage } from './form';

describe('Checkout', () => {
  it('renders current Material form APIs', async () => {
    await TestBed.configureTestingModule({
      imports: [FormPage],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormPage);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('mat-form-field')).toBeTruthy();
    expect(html.querySelector('mat-list-option')).toBeTruthy();
    expect(html.querySelector('button[matButton]')).toBeTruthy();
  });
});
