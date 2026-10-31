import { Component, input, output } from '@angular/core';
import { BillItem } from '../../core/models/bill.model';

@Component({
  selector: 'app-bill-items-table',
  template: `
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th class="l">Item</th><th class="l">Batch</th><th>Standard Cost</th><th>Standard Price</th>
            <th>Margin</th><th>Qty</th><th>Free Qty</th><th>Discount</th><th>Total Cost</th><th>Total Selling</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (r of items(); track r.id) {
            <tr>
              <td class="l">{{ r.item }}</td><td class="l">{{ r.batch }}</td>
              <td>{{ r.standardCost.toFixed(2) }}</td><td>{{ r.standardPrice.toFixed(2) }}</td>
              <td>{{ r.margin.toFixed(2) }}</td><td>{{ r.qty }}</td><td>{{ r.freeQty }}</td>
              <td>{{ r.discount.toFixed(2) }}%</td><td>{{ r.totalCost.toFixed(2) }}</td><td>{{ r.totalSelling.toFixed(2) }}</td>
              <td><button type="button" class="remove" (click)="remove.emit(r.id)" [attr.aria-label]="'Remove ' + r.item">&times;</button></td>
            </tr>
          } @empty {
            <tr><td colspan="11" class="empty">No items added yet.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 760px; }
    th { color: var(--blue-dark); font-weight: 600; text-align: right; padding: 8px; border-bottom: 1px solid var(--border); white-space: nowrap; }
    td { text-align: right; padding: 8px; border-bottom: 1px solid #eef0f5; }
    .l { text-align: left; }
    .empty { text-align: center; color: var(--muted); padding: 20px; }
    .remove { border: 0; background: none; color: var(--danger); font-size: 18px; line-height: 1; }
  `,
})
export class BillItemsTableComponent {
  readonly items = input.required<readonly BillItem[]>();
  readonly remove = output<number>();
}
