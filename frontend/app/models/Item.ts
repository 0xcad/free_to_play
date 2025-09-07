export interface Item {
  id: number;
  name: string;
  slug: string;
  image: string;
  cost: number;
  description: string;
  count: number;
  quantity: number | null;
  is_available: boolean;
}

export interface ItemCategory {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  items: number[];
}

export interface ItemPurchase {
  id: number;
  item_id: number;
  user_id: number;
  item_type: 'user' | 'play';
  created: string;
}
