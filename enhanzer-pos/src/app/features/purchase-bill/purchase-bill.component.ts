import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { LocationDto } from '../../core/models/auth.model';
import { BillItem, ITEM_OPTIONS } from '../../core/models/bill.model';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { calcMargin, calcTotalCost, calcTotalSelling } from '../../core/utils/bill-calculator';
import { toErrorMessage } from '../../core/utils/http-error';
import { AutocompleteComponent } from '../../shared/components/autocomplete.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { BillItemsTableComponent } from './bill-items-table.component';
import { ItemSummaryComponent } from './item-summary.component';

/** Item must be one of the allowed values (case-insensitive). */
const inList = (options: readonly string[]) => (c: AbstractControl): ValidationErrors | null =>
  !c.value || options.some((o) => o.toLowerCase() === String(c.value).trim().toLowerCase()) ? null : { notInList: true };

const num = (v: unknown): number => Number(v) || 0;

@Component({
  selector: 'app-purchase-bill',
  imports: [ReactiveFormsModule, AutocompleteComponent, FieldErrorComponent, BillItemsTableComponent, ItemSummaryComponent],
  templateUrl: './purchase-bill.component.html',
  styleUrl: './purchase-bill.component.css',
})
export class PurchaseBillComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly itemOptions = ITEM_OPTIONS;
  private nextId = 1;

  protected readonly defaults = { item: '', batch: '', standardCost: 0, standardPrice: 0, qty: 1, freeQty: 0, discount: 0 };

  protected readonly form = this.fb.group({
    item: [this.defaults.item, [Validators.required, inList(ITEM_OPTIONS)]],
    batch: [this.defaults.batch, [Validators.required]],
    standardCost: [this.defaults.standardCost, [Validators.required, Validators.min(0)]],
    standardPrice: [this.defaults.standardPrice, [Validators.required, Validators.min(0)]],
    qty: [this.defaults.qty, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    freeQty: [this.defaults.freeQty, [Validators.min(0), Validators.pattern(/^\d+$/)]],
    discount: [this.defaults.discount, [Validators.min(0), Validators.max(100)]],
  });

  private readonly values = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  // Live, read-only calculated fields
  protected readonly margin = computed(() => calcMargin(num(this.values().standardCost), num(this.values().standardPrice)));
  protected readonly totalCost = computed(() => {
    const v = this.values();
    return calcTotalCost(num(v.standardCost), num(v.qty), num(v.discount));
  });
  protected readonly totalSelling = computed(() => calcTotalSelling(num(this.values().standardPrice), num(this.values().qty)));

  protected readonly items = signal<BillItem[]>([]);
  protected readonly locations = signal<LocationDto[]>([]);
  protected readonly loadingLocations = signal(false);
  protected readonly locationsError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLocations();
  }

  protected loadLocations(): void {
    this.loadingLocations.set(true);
    this.locationsError.set(null);
    this.locationService.getLocations()
      .pipe(finalize(() => this.loadingLocations.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (l) => this.locations.set(l),
        error: (err) => this.locationsError.set(toErrorMessage(err, 'Could not load batches.')),
      });
  }

  protected addItem(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const canonical = this.itemOptions.find((o) => o.toLowerCase() === v.item.trim().toLowerCase()) ?? v.item;

    const row: BillItem = {
      id: this.nextId++,
      item: canonical,
      batch: v.batch,
      standardCost: num(v.standardCost),
      standardPrice: num(v.standardPrice),
      margin: this.margin(),
      qty: num(v.qty),
      freeQty: num(v.freeQty),
      discount: num(v.discount),
      totalCost: this.totalCost(),
      totalSelling: this.totalSelling(),
    };
    this.items.update((list) => [...list, row]);
    this.form.reset(this.defaults);
  }

  protected removeItem(id: number): void {
    this.items.update((list) => list.filter((i) => i.id !== id));
  }
}
