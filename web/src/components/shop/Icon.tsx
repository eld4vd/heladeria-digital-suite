import type { CSSProperties } from 'react';
import {
  ArrowRight, Check, Clock, CreditCard, IceCreamCone, Leaf,
  Minus, Plus, QrCode, Search, ShoppingBag, SlidersHorizontal, Truck, UserRound, X,
} from 'lucide-react';

// Reutiliza la familia de iconos instalada sin cambiar los componentes que la usan ni añadir dependencias.
const icons = {
  user: UserRound, arrow: ArrowRight, bag: ShoppingBag, leaf: Leaf,
  truck: Truck, check: Check, search: Search, plus: Plus, minus: Minus,
  card: CreditCard, qr: QrCode, ice: IceCreamCone, clock: Clock,
  filters: SlidersHorizontal, close: X,
} as const;

export function Icon({ name, size = 20, style }: { name: keyof typeof icons; size?: number; style?: CSSProperties }) {
  const Glyph = icons[name];
  return <Glyph size={size} strokeWidth={1.6} aria-hidden="true" focusable="false" style={style} />;
}
