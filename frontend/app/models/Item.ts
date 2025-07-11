export interface Item {
  id: number;
  name: string;
  slug: string;
  image: string;
  cost: number;
  description: string;
  data: JSON;
  category: number | null;
  quantity: number | null;
  is_available: boolean;
  is_visible?: boolean;
}

export interface ItemCategory {
  id: number;
  name: string;
  order: number;
}
