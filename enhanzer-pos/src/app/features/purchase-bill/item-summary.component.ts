import { Component, computed, input } from '@angular/core';
import { BillItem } from '../../core/models/bill.model';

@Component({
  selector: 'app-item-summary',
  template: `
    <h2>Summary</h2>
    <h3>Item Summary</h3>
    <dl>
      <dt>Total Items</dt><dd>{{ totalItems() }}</dd>
      <dt>Total Qty</dt><dd>{{ totalQty() }}</dd>
    </dl>
    <h3>Financial Summary</h3>
    <dl>
      <dt>Total Cost</dt><dd>{{ totalCost().toFixed(2) }}</dd>
      <dt>Gross Total</dt><dd>{{ grossTotal().toFixed(2) }}</dd>
    </dl>
  `,
  styles: `
    h2 { font-size: 13px; color: var(--blue-dark); margin: 0 0 12px; }
    h3 { font-size: 12px; margin: 14px 0 6px; }
    dl { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; margin: 0; font-size: 12px; color: var(--muted); }
    dd { margin: 0; text-align: right; color: var(--text); font-weight: 600; }
  `,
})
export class ItemSummaryComponent {
  readonly items = input.required<readonly BillItem[]>();

  readonly totalItems = computed(() => this.items().length);
  readonly totalQty = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  readonly totalCost = computed(() => this.items().reduce((s, i) => s + i.totalCost, 0));
  readonly grossTotal = computed(() => this.items().reduce((s, i) => s + i.totalSelling, 0));
}
