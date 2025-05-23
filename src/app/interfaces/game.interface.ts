export interface Game {
  id: number;
  name: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  cover_url: string;
  banner_url: string | null;
  image?: string;
  description?: string;
  categories?: string[];
  category_ids?: number[];
  developer?: string;
  releaseDate?: string;
  tags?: string[];
  rating?: number;
  discount?: number;
  platform?: string;
  isNew?: boolean;
  isTrending?: boolean;
  reviewCount?: number;
  requirements?: {
    minimum?: {
      os?: string;
      processor?: string;
      memory?: string;
      graphics?: string;
      storage?: string;
    },
    recommended?: {
      os?: string;
      processor?: string;
      memory?: string;
      graphics?: string;
      storage?: string;
    }
  };
} 