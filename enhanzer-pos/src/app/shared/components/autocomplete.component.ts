import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/** Reusable autocomplete input. Works with formControlName / ngModel. */
@Component({
  selector: 'app-autocomplete',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteComponent), multi: true }],
  template: `
    <label [for]="id">{{ label() }}</label>
    <div class="wrap">
      <input
        [id]="id" type="text" autocomplete="off" role="combobox"
        [attr.aria-expanded]="isOpen()" [attr.aria-controls]="id + '-list'"
        [value]="value()" [disabled]="disabled()" [placeholder]="placeholder()"
        (input)="onInput($any($event.target).value)"
        (focus)="isOpen.set(true)" (blur)="onBlur()" (keydown)="onKeydown($event)" />
      @if (isOpen() && filtered().length) {
        <ul role="listbox" [id]="id + '-list'">
          @for (o of filtered(); track o; let i = $index) {
            <li role="option" [class.active]="i === activeIndex()" (mousedown)="select(o, $event)">{{ o }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    label { display: block; font-size: 12px; color: var(--muted); }
    .wrap { position: relative; }
    input { width: 100%; border: 0; border-bottom: 1px solid var(--border); padding: 6px 0; font: inherit; background: transparent; outline: none; }
    input:focus { border-color: var(--blue); }
    ul { position: absolute; z-index: 20; left: 0; right: 0; margin: 2px 0 0; padding: 4px 0; list-style: none; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 6px 18px rgb(0 0 0 / .12); max-height: 200px; overflow-y: auto; }
    li { padding: 8px 12px; cursor: pointer; }
    li:hover, li.active { background: #eaf1ff; }
  `,
})
export class AutocompleteComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<readonly string[]>([]);

  protected readonly id = `ac-${nextId++}`;
  protected readonly value = signal('');
  protected readonly isOpen = signal(false);
  protected readonly disabled = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filtered = computed(() => {
    const q = this.value().trim().toLowerCase();
    return this.options().filter((o) => o.toLowerCase().includes(q));
  });

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string | null): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled.set(d); }

  protected onInput(v: string): void {
    this.value.set(v);
    this.onChange(v);
    this.isOpen.set(true);
    this.activeIndex.set(-1);
  }

  protected select(option: string, event?: Event): void {
    event?.preventDefault(); // keep focus; avoid blur before selection
    this.value.set(option);
    this.onChange(option);
    this.isOpen.set(false);
  }

  protected onBlur(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  protected onKeydown(e: KeyboardEvent): void {
    const list = this.filtered();
    if (e.key === 'ArrowDown') { e.preventDefault(); this.isOpen.set(true); this.activeIndex.update((i) => Math.min(i + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.activeIndex.update((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && this.isOpen() && this.activeIndex() >= 0) { e.preventDefault(); this.select(list[this.activeIndex()]); }
    else if (e.key === 'Escape') this.isOpen.set(false);
  }
}
