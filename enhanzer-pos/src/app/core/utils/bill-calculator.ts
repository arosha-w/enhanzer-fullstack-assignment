const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const calcMargin = (cost: number, price: number): number => round2(price - cost);

/** (Standard Cost x Qty) reduced by Discount%  e.g. 100 x 5 less 20% = 400 */
export const calcTotalCost = (cost: number, qty: number, discountPct: number): number =>
  round2(cost * qty * (1 - discountPct / 100));

/** Standard Price x Qty  e.g. 150 x 5 = 750 */
export const calcTotalSelling = (price: number, qty: number): number => round2(price * qty);
