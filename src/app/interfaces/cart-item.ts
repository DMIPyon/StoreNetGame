export interface CartItem {
  id: number;
  game_id: number;
  quantity: number;
  title: string;
  price: number;
  cover_url: string;
  discount?: number;
  original_price?: number;
  itemTotal: number;
} 