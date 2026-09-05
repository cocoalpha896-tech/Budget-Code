import { Utensils, Home, Users, Smartphone, Fuel, Heart, Droplets, ShoppingBag, Dumbbell } from 'lucide-react';

export const CATEGORY_META = {
  food: { icon: Utensils, color: '#F59E0B' },
  house: { icon: Home, color: '#38BDF8' },
  parents: { icon: Users, color: '#F472B6' },
  phone: { icon: Smartphone, color: '#A78BFA' },
  fuel_toll: { icon: Fuel, color: '#34D399' },
  dating: { icon: Heart, color: '#FB7185' },
  toiletries: { icon: Droplets, color: '#FCD34D' },
  shopping: { icon: ShoppingBag, color: '#818CF8' },
  gym: { icon: Dumbbell, color: '#86EFAC' },
};

export function metaFor(categoryId) {
  return CATEGORY_META[categoryId] || { icon: ShoppingBag, color: '#9195A0' };
}
