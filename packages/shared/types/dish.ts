export interface Dish {
  id: string;
  chefId: string;
  name: string;
  description: string;
  price: number; // in cents
  imageUrl: string | null;
  category: string;
  tags: string[];
  isAvailable: boolean;
  preparationTime: number; // in minutes
  servingSize: string | null;
  allergens: string[];
  nutritionInfo: NutritionInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionInfo {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface DishWithChef extends Dish {
  chef: {
    id: string;
    displayName: string;
    slug: string;
    profileImageUrl: string | null;
  };
}
