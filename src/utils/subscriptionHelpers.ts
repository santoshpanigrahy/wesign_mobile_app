import moment from 'moment';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  PlanComparisonResult,
} from '../types/subscription';
import {SUBSCRIPTION_PLANS, getPlanBySku} from '../constants/subscriptionPlans';

/**
 * Format a date string for display
 */
export const formatRenewalDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('MMM DD, YYYY');
};

/**
 * Calculate days remaining until a date
 */
export const calculateDaysRemaining = (expiryDate: string): number => {
  if (!expiryDate) return 0;
  const now = moment();
  const expiry = moment(expiryDate);
  return Math.max(0, expiry.diff(now, 'days'));
};

/**
 * Check if a date is in the past
 */
export const isExpired = (expiryDate: string): boolean => {
  if (!expiryDate) return true;
  return moment(expiryDate).isBefore(moment());
};

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export const isExpiringSoon = (expiryDate: string): boolean => {
  if (!expiryDate) return false;
  const daysRemaining = calculateDaysRemaining(expiryDate);
  return daysRemaining > 0 && daysRemaining <= 7;
};

/**
 * Compare two subscription plans
 */
export const comparePlans = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
): PlanComparisonResult => {
  const tierDifference = newPlan.tierLevel - currentPlan.tierLevel;

  return {
    isUpgrade: tierDifference > 0,
    isDowngrade: tierDifference < 0,
    isSamePlan: tierDifference === 0,
    tierDifference,
  };
};

/**
 * Check if a plan change is an upgrade
 */
export const isPlanUpgrade = (currentSku: string, newSku: string): boolean => {
  const currentPlan = getPlanBySku(currentSku);
  const newPlan = getPlanBySku(newSku);

  if (!currentPlan || !newPlan) return false;

  return newPlan.tierLevel > currentPlan.tierLevel;
};

/**
 * Check if a plan change is a downgrade
 */
export const isPlanDowngrade = (
  currentSku: string,
  newSku: string,
): boolean => {
  const currentPlan = getPlanBySku(currentSku);
  const newPlan = getPlanBySku(newSku);

  if (!currentPlan || !newPlan) return false;

  return newPlan.tierLevel < currentPlan.tierLevel;
};

/**
 * Get a user-friendly status message based on subscription state
 */
export const getStatusMessage = (
  status: SubscriptionStatus,
  expiryDate?: string,
  renewalDate?: string,
): string => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      if (renewalDate) {
        return `Renews on ${formatRenewalDate(renewalDate)}`;
      }
      return 'Active subscription';

    case SubscriptionStatus.CANCELLED:
      if (expiryDate) {
        const days = calculateDaysRemaining(expiryDate);
        return `${days} ${days === 1 ? 'day' : 'days'} remaining`;
      }
      return 'Cancelled';

    case SubscriptionStatus.EXPIRED:
      return 'Subscription expired';

    case SubscriptionStatus.GRACE_PERIOD:
      return 'Payment issue - Update payment method';

    case SubscriptionStatus.PENDING_UPGRADE:
      return 'Upgrade processing...';

    case SubscriptionStatus.PENDING_DOWNGRADE:
      if (renewalDate) {
        return `Downgrade on ${formatRenewalDate(renewalDate)}`;
      }
      return 'Downgrade scheduled';

    default:
      return 'Unknown status';
  }
};

/**
 * Get status badge color based on subscription status
 */
export const getStatusBadgeColor = (status: SubscriptionStatus): string => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return '#10B981'; // Green

    case SubscriptionStatus.CANCELLED:
      return '#EF4444'; // Red

    case SubscriptionStatus.EXPIRED:
      return '#6B7280'; // Gray

    case SubscriptionStatus.GRACE_PERIOD:
      return '#F59E0B'; // Yellow

    case SubscriptionStatus.PENDING_UPGRADE:
      return '#3B82F6'; // Blue

    case SubscriptionStatus.PENDING_DOWNGRADE:
      return '#F97316'; // Orange

    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Parse IAP purchase object to extract subscription details
 */
export const parseIAPPurchase = (purchase: any): any => {
  if (!purchase) return null;

  return {
    productId: purchase.productId,
    transactionId: purchase.transactionId,
    purchaseDate: purchase.transactionDate,
    expiresDate: purchase.transactionDate, // IAP might have different field
    receipt: purchase.transactionReceipt,
  };
};

/**
 * Generate confirmation message for plan upgrade
 */
export const getUpgradeConfirmationMessage = (
  newPlan: SubscriptionPlan,
  renewalDate?: string,
): string => {
  let message = `Upgrade to ${newPlan.name}?\n\n`;
  message += '• Your new plan starts immediately\n';
  message += "• You'll be charged the prorated difference today\n";

  if (renewalDate) {
    message += `• Next billing: ${formatRenewalDate(renewalDate)}\n`;
  }

  return message;
};

/**
 * Generate confirmation message for plan downgrade
 */
export const getDowngradeConfirmationMessage = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  expiryDate?: string,
): string => {
  let message = `Downgrade to ${newPlan.name}?\n\n`;

  if (expiryDate) {
    message += `• You'll keep ${
      currentPlan.name
    } features until ${formatRenewalDate(expiryDate)}\n`;
    message += `• On ${formatRenewalDate(expiryDate)}, you'll switch to ${
      newPlan.name
    }\n`;
  }

  message += '• You can upgrade again anytime\n';

  return message;
};

/**
 * Generate confirmation message for cancellation
 */
export const getCancellationConfirmationMessage = (
  planName: string,
  expiryDate?: string,
): string => {
  let message = `Cancel your ${planName}?\n\nIf you cancel:\n\n`;

  if (expiryDate) {
    message += `• You'll have access until ${formatRenewalDate(expiryDate)}\n`;
  }

  message += '• No refunds for current period\n';
  message += '• You can resubscribe anytime\n';

  return message;
};
