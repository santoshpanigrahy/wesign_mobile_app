export enum PlanTier {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  GRACE_PERIOD = 'grace_period',
  PENDING_UPGRADE = 'pending_upgrade',
  PENDING_DOWNGRADE = 'pending_downgrade',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  sku: string;
  tier: PlanTier;
  tierLevel: number; // Used to compare plans (higher = better)
  features: string[];
  maxUsers: number;
  maxDocuments: number | 'unlimited';
  prioritySupport: boolean;
  customBranding: boolean;
  teamCollaboration: boolean;
  gradient: string[];
  badgeColor: string;
  icon: string;
}

export interface SubscriptionDetails {
  productId: string;
  transactionId: string;
  purchaseDate: string;
  expiresDate: string;
  isActive: boolean;
  status: SubscriptionStatus;
  plan?: SubscriptionPlan;
  renewalDate?: string;
  daysRemaining?: number;
  pendingPlanChange?: {
    newPlan: SubscriptionPlan;
    effectiveDate: string;
    isUpgrade: boolean;
  };
}

export interface PlanComparisonResult {
  isUpgrade: boolean;
  isDowngrade: boolean;
  isSamePlan: boolean;
  tierDifference: number;
}
