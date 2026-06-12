import {SubscriptionPlan, PlanTier} from '../types/subscription';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'personal',
    name: 'Personal Plan',
    sku: 'ws_personal',
    tier: PlanTier.PERSONAL,
    tierLevel: 1,
    features: [
      'Up to 10 documents per month',
      'Basic e-signature features',
      'Email support',
      'Standard security',
      'Mobile & web access',
    ],
    maxUsers: 1,
    maxDocuments: 10,
    prioritySupport: false,
    customBranding: false,
    teamCollaboration: false,
    gradient: ['#9333EA', '#6D28D9'],
    badgeColor: '#9333EA',
    icon: 'user',
  },
  {
    id: 'business',
    name: 'Business Plan',
    sku: 'ws_business',
    tier: PlanTier.BUSINESS,
    tierLevel: 2,
    features: [
      'Unlimited document signing',
      'Advanced security features',
      'Priority customer support',
      'Custom branding options',
      'Team collaboration tools',
      'Advanced analytics',
      'API access',
    ],
    maxUsers: 10,
    maxDocuments: 'unlimited',
    prioritySupport: true,
    customBranding: true,
    teamCollaboration: true,
    gradient: ['#F59E0B', '#EA580C'],
    badgeColor: '#F59E0B',
    icon: 'briefcase',
  },
];

// Helper to get plan by SKU
export const getPlanBySku = (sku: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.sku === sku);
};

// Helper to get plan by tier
export const getPlanByTier = (tier: PlanTier): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier);
};

// Helper to get plan by ID
export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
};
