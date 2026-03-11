export interface Chef {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  bio: string | null;
  cuisineTypes: string[];
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChefWithUser extends Chef {
  user: {
    email: string;
    phone: string | null;
  };
}

export type ChefStatus = 'pending' | 'active' | 'inactive' | 'suspended';
