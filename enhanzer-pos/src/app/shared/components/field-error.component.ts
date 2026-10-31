import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Shows the first validation message of a control once it has been touched. */
@Component({
  selector: 'app-field-error',
  template: `@if (message(); as m) { <small class="error" role="alert">{{ m }}</small> }`,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly label = input('This field');

  message(): string | null {
    const c = this.control();
    const e = c.errors;
    if (!c.touched || !e) return null;
    const label = this.label();
    if (e['required']) return `${label} is required.`;
    if (e['email']) return 'Enter a valid email address.';
    if (e['notInList']) return `Select a valid ${label.toLowerCase()} from the list.`;
    if (e['min']) return `${label} must be at least ${e['min'].min}.`;
    if (e['max']) return `${label} must be at most ${e['max'].max}.`;
    if (e['pattern']) return `${label} must be a whole number.`;
    return `${label} is invalid.`;
  }
}
