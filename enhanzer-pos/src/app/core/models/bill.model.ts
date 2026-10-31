export interface BillItem {
  id: number;
  item: string;
  batch: string;
  standardCost: number;
  standardPrice: number;
  margin: number;
  qty: number;
  freeQty: number;
  discount: number; // percentage
  totalCost: number;
  totalSelling: number;
}

export const ITEM_OPTIONS: readonly string[] = ['Mango', 'Apple', 'Banana', 'Orange', 'Grapes', 'Kiwi', 'Strawberry'];
