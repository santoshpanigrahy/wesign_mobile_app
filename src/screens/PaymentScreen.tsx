import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import {
  CreditCard,
  Crown,
  RefreshCcw,
  CheckCircle2,
  Sparkles,
  Settings,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Bell,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import {goBack, navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  useIAP,
  validateReceiptIos,
  getAvailablePurchases,
  clearTransactionIOS,
} from 'react-native-iap';
import AppButton from '@components/AppButton';
import Skeleton from '@components/Skeleton';
import ConfirmationModal from '@components/ConfirmationModal';
import ManageSubscriptionModal from '@components/ManageSubscriptionModal';
import SubscriptionStatusBadge from '@components/SubscriptionStatusBadge';
import {
  setSubscriptionStatus,
  setCurrentSubscription,
  setPurchaseLoading,
  setActivePlanSku,
  setSubscriptionStatusEnum,
  setSubscriptionDates,
  setLastSyncTime,
} from '@redux/slices/paymentSlice';
import {SUBSCRIPTION_PLANS, getPlanBySku} from '../constants/subscriptionPlans';
import {SubscriptionStatus} from '../types/subscription';
import {
  isPlanUpgrade,
  isPlanDowngrade,
  getUpgradeConfirmationMessage,
  getDowngradeConfirmationMessage,
  formatRenewalDate,
  calculateDaysRemaining,
} from '../utils/subscriptionHelpers';
import {
  syncSubscription,
  getSubscriptionStatus as fetchSubscriptionStatus,
  cancelSubscription as cancelSubscriptionAPI,
} from '../utils/api';
import moment from 'moment';
import {APP_SHARED_SECRET} from '@env';
import {showLoader, hideLoader} from '@redux/slices/loaderSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from '@redux/slices/authSlice';

// Helper function to generate a valid UUID from userId
// Apple requires appAccountToken to be a valid UUID format
const userIdToUUID = (userId: any) => {
  const padded = String(userId).padStart(12, '0');
  return `00000000-0000-0000-0000-${padded}`;
};
const generateUUIDFromUserId = (
  userId: string | number | undefined,
): string | undefined => {
  if (!userId) return undefined;

  // Convert userId to string and pad it to create a valid UUID v4 format
  const userIdStr = String(userId).padStart(12, '0');

  // Create a deterministic UUID-like string from userId
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = `${userIdStr.slice(0, 8)}-${userIdStr.slice(
    8,
    12,
  )}-4${userIdStr.slice(0, 3)}-a${userIdStr.slice(3, 6)}-${userIdStr.padEnd(
    12,
    '0',
  )}`;

  return uuid;
};

const Gradients = {
  premium: ['#9333EA', '#6D28D9'],
  gold: ['#F59E0B', '#EA580C'],
};

const FeatureItem = ({text}: {text: string}) => (
  <View style={styles.featureItem}>
    <CheckCircle2 size={fp(1.8)} color={Colors.success} strokeWidth={2.5} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const PaymentScreen = ({navigation, route}: any) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state: any) => state.auth.user?.id);
  const token = useAppSelector((state: any) => state.auth.token);

  // Check if user came from login flow
  const fromLogin = route?.params?.fromLogin || false;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      goBack();
    } else {
      // If no screen to go back to, navigate based on auth state
      if (fromLogin) {
        navigate('Login');
      } else {
        navigate('Drawer');
      }
    }
  };

  const {
    currentSubscription,
    isSubscribed,
    purchaseLoading,
    activePlanSku,
    subscriptionStatus,
    subscriptionExpiryDate,
    renewalDate,
    lastSyncTime,
  } = useAppSelector(state => state.payment);

  const {
    connected,
    subscriptions,
    getSubscriptions,
    requestSubscription,
    finishTransaction,
    currentPurchase,
    currentPurchaseError,
  } = useIAP();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Modal states
  const [showManageModal, setShowManageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<any>(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<
    string | null
  >(null);

  // Fetch subscriptions on mount
  useEffect(() => {
    if (connected) {
      handleGetSubscriptions();
    }
  }, [connected]);

  // Handle purchase updates
  // useEffect(() => {
  //   if (currentPurchase) {
  //     handlePurchaseUpdate(currentPurchase);
  //   }
  // }, [currentPurchase]);

  // Handle purchase errors
  // useEffect(() => {
  //   if (currentPurchaseError) {
  //     handlePurchaseError(currentPurchaseError);
  //   }
  // }, [currentPurchaseError]);

  // Check for existing purchases on mount
  useEffect(() => {
    if (connected) {
      checkExistingPurchases();
    }
  }, [connected]);

  const handleGetSubscriptions = async () => {
    try {
      setLoading(true);
      const skus = [
        'ws_personal',
        'ws_personal_quarterly',
        'ws_personal_yearly',
        'ws_business',
        'ws_business_quarterly',
        'ws_business_yearly',
        'ws_enterprise',
        'ws_enterprise_quarterly',
        'ws_enterprise_yearly',
      ];
      // const skus = ['ws_personal_test', 'ws_business_test'];
      await getSubscriptions({skus});
    } catch (error) {
      console.error('Failed to get subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryDateFromPurchase = (purchase: any): string | null => {
    // Try different possible expiry date fields from IAP
    const possibleFields = [
      'expiresDateMs',
      'expires_date_ms',
      'expirationDate',
      'expiresDate',
      'autoRenewingPeriodEndDateMillis',
    ];

    for (const field of possibleFields) {
      if (purchase[field]) {
        const timestamp = Number(purchase[field]);
        if (!isNaN(timestamp) && timestamp > 0) {
          console.log(`Found expiry in ${field}:`, timestamp);
          return moment(timestamp).toISOString();
        }
      }
    }

    // If no expiry field found, we need to validate the receipt
    console.warn(
      '⚠️ No expiry date found in purchase object. Receipt validation needed.',
    );
    console.log('Purchase object keys:', Object.keys(purchase));
    return null;
  };

  // Helper function to validate receipt with automatic environment detection
  // Handles both sandbox (Development/TestFlight) and production receipts
  const validateReceiptWithAutoRetry = async (receipt: string) => {
    try {
      console.log(
        '🔍 Validating receipt (trying production endpoint first)...',
      );

      // Try production endpoint first
      let response = await validateReceiptIos({
        receiptBody: {
          'receipt-data': receipt,
          password: APP_SHARED_SECRET,
        },
        isTest: false, // Production
      });

      // Status 21007 = sandbox receipt sent to production endpoint
      // This happens in TestFlight builds where __DEV__ is false but receipts are sandbox
      if (response?.status === 21007) {
        console.log(
          '🔄 TestFlight/Sandbox receipt detected (status 21007), retrying with sandbox endpoint...',
        );

        response = await validateReceiptIos({
          receiptBody: {
            'receipt-data': receipt,
            password: APP_SHARED_SECRET,
          },
          isTest: true, // Sandbox
        });

        console.log(
          '✅ Receipt validated against sandbox endpoint, status:',
          response.status,
        );
      } else {
        console.log(
          '✅ Receipt validated against production endpoint, status:',
          response.status,
        );
      }

      return response;
    } catch (error) {
      console.error('❌ Receipt validation error:', error);
      throw error;
    }
  };

  const checkExistingPurchases = async () => {
    try {
      const purchases = await getAvailablePurchases();
      console.log('Checking existing purchases:', purchases);
      if (purchases && purchases.length > 0) {
        // User has purchases - need to validate if still active
        const activePurchase = purchases[0];
        dispatch(setCurrentSubscription(activePurchase));
        dispatch(setActivePlanSku(activePurchase.productId));

        // Try to get expiry date from purchase object
        let expiryDate = getExpiryDateFromPurchase(activePurchase);

        // If no expiry date in purchase object, validate receipt with Apple
        if (!expiryDate && activePurchase.transactionReceipt) {
          try {
            const receiptValidation = await validateReceiptWithAutoRetry(
              activePurchase.transactionReceipt,
            );

            console.log('📝 Receipt validation response:', receiptValidation);

            // Extract expiry from receipt validation response
            if (receiptValidation?.latest_receipt_info?.length > 0) {
              const latestReceipt = receiptValidation.latest_receipt_info[0];
              const expiresMs =
                latestReceipt.expires_date_ms ||
                latestReceipt.expires_date ||
                null;
              if (expiresMs) {
                expiryDate = moment(Number(expiresMs)).toISOString();
                console.log(
                  '✅ Got expiry from receipt validation:',
                  expiryDate,
                );
              }
            }
          } catch (validationError) {
            console.error('❌ Receipt validation failed:', validationError);
          }
        }

        console.log('Final expiry date:', expiryDate);

        dispatch(
          setSubscriptionDates({
            expiryDate,
            renewalDate: expiryDate,
          }),
        );

        // Check if subscription is actually still valid
        if (!expiryDate) {
          // No expiry date found - treat as active but warn
          console.warn(
            '⚠️ No expiry date available. Treating as active subscription.',
          );
          dispatch(setSubscriptionStatus(true));
          dispatch(setSubscriptionStatusEnum(SubscriptionStatus.ACTIVE));
        } else {
          const isSubscriptionExpired = moment(expiryDate).isBefore(moment());

          if (isSubscriptionExpired) {
            // Subscription has expired
            dispatch(setSubscriptionStatus(false));
            dispatch(setSubscriptionStatusEnum(SubscriptionStatus.EXPIRED));
            console.log('❌ Subscription expired on:', expiryDate);

            Alert.alert(
              'Subscription Expired',
              'Your subscription has expired. Please renew to continue using premium features.',
            );
          } else {
            // Subscription is still active
            dispatch(setSubscriptionStatus(true));
            dispatch(setSubscriptionStatusEnum(SubscriptionStatus.ACTIVE));
            console.log('✅ Active subscription found, expires:', expiryDate);
          }
        }

        console.log('Found existing purchase:', activePurchase);

        // Sync with backend
        await syncWithBackend(activePurchase);
      } else {
        // No purchases found
        dispatch(setSubscriptionStatus(false));
        dispatch(setSubscriptionStatusEnum(null));
        console.log('No existing purchases found');
      }
    } catch (error) {
      console.error('Failed to check existing purchases:', error);
    }
  };

  const syncWithBackend = async (purchase: any) => {
    return;
    try {
      setSyncing(true);
      const receipt = purchase.transactionReceipt;

      if (receipt) {
        await syncSubscription({
          receipt,
          productId: purchase.productId,
          transactionId: purchase.transactionId,
        });

        dispatch(setLastSyncTime(moment().toISOString()));
        console.log('✅ Synced subscription with backend');
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscriptionAPI();
      console.log('✅ Cancellation recorded in backend');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      Alert.alert('Error', 'Failed to process cancellation. Please try again.');
      throw error;
    }
  };

  const handlePurchaseUpdate = async (purchase: any) => {
    console.log('📦 Purchase received:', purchase);

    try {
      dispatch(setPurchaseLoading(true));

      let expiryDate: string | null = null;

      // Validate receipt with Apple
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          const appleReceiptResponse = await validateReceiptWithAutoRetry(
            receipt,
          );

          console.log(
            '✅ Apple receipt validation response:',
            appleReceiptResponse,
          );

          // Check if receipt is valid
          // Status 0 = success, any other status = error
          if (appleReceiptResponse && appleReceiptResponse.status === 0) {
            console.log('✅ Receipt validated successfully');

            // Extract expiry date from receipt validation
            if (appleReceiptResponse.latest_receipt_info?.length > 0) {
              const latestReceipt = appleReceiptResponse.latest_receipt_info[0];
              const expiresMs =
                latestReceipt.expires_date_ms ||
                latestReceipt.expires_date ||
                null;
              if (expiresMs) {
                expiryDate = moment(Number(expiresMs)).toISOString();
                console.log('✅ Extracted expiry from receipt:', expiryDate);
              }
            }
          } else {
            console.error(
              '❌ Receipt validation failed. Status:',
              appleReceiptResponse?.status,
            );
            throw new Error('Receipt validation failed');
          }
        } catch (validationError) {
          console.error('❌ Receipt validation error:', validationError);
          // You can choose to fail here or continue (for testing)
          // For production, you should fail if validation fails
          throw new Error('Failed to validate receipt with Apple');
        }
      } else {
        console.warn('⚠️ No receipt found in purchase');
      }

      // If still no expiry date, try to get from purchase object
      if (!expiryDate) {
        expiryDate = getExpiryDateFromPurchase(purchase);
      }

      // Store purchase information
      dispatch(setCurrentSubscription(purchase));
      dispatch(setActivePlanSku(purchase.productId));

      dispatch(
        setSubscriptionDates({
          expiryDate,
          renewalDate: expiryDate,
        }),
      );

      // Check if subscription is valid
      if (!expiryDate) {
        console.warn('⚠️ No expiry date for new purchase. Treating as active.');
        dispatch(setSubscriptionStatus(true));
        dispatch(setSubscriptionStatusEnum(SubscriptionStatus.ACTIVE));
      } else {
        const isSubscriptionExpired = moment(expiryDate).isBefore(moment());

        if (isSubscriptionExpired) {
          dispatch(setSubscriptionStatus(false));
          dispatch(setSubscriptionStatusEnum(SubscriptionStatus.EXPIRED));
          console.log('⚠️ Purchase completed but already expired:', expiryDate);
        } else {
          dispatch(setSubscriptionStatus(true));
          dispatch(setSubscriptionStatusEnum(SubscriptionStatus.ACTIVE));
          console.log('✅ Subscription activated, expires:', expiryDate);
        }
      }

      // Sync with backend
      await syncWithBackend(purchase);

      // Finish the transaction
      await finishTransaction({
        purchase,
        isConsumable: false,
      });

      const plan = getPlanBySku(purchase.productId);
      const planName = plan?.name || 'Premium Plan';

      // Determine if it was an upgrade or new subscription
      const wasUpgrade =
        activePlanSku && isPlanUpgrade(activePlanSku, purchase.productId);

      // Show processing loader for 3-4 seconds
      dispatch(showLoader('Processing your purchase...'));

      await new Promise(resolve => setTimeout(resolve, 3500));

      dispatch(hideLoader());
      console.log(
        'Purchase processing complete, showing confirmation alert',
        fromLogin,
      );
      // Handle post-purchase flow based on where user came from
      if (fromLogin) {
        // User came from login - they need to login again after purchase
        Alert.alert(
          'Purchase Successful! 🎉',
          `Your ${planName} subscription is now active. Please login again to access all features.`,
          [
            {
              text: 'Login Now',
              onPress: async () => {
                // Clear auth state and navigate to login
                dispatch(logout());
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('token');
                resetAndNavigate('Login');
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        // Normal flow - user from registration or drawer
        Alert.alert(
          wasUpgrade ? 'Upgraded! 🎉' : 'Welcome! 🎉',
          wasUpgrade
            ? `Your ${planName} is now active`
            : `Your subscription to ${planName} has been activated successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Drawer if they have token
                if (token) {
                  navigate('Drawer');
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Purchase processing error:', error);

      if (fromLogin) {
        Alert.alert(
          'Processing Payment',
          'Your payment is being processed. This may take a few moments. Please try logging in after some time.',
          [
            {
              text: 'Go to Login',
              onPress: () => resetAndNavigate('Login'),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to process purchase. Please contact support.',
        );
      }
    } finally {
      dispatch(setPurchaseLoading(false));
      setSelectedPlanForPurchase(null);
    }
  };

  const handlePurchaseError = (error: any) => {
    console.error('❌ Purchase error:', error);

    dispatch(setPurchaseLoading(false));

    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      E_USER_CANCELLED: 'Purchase cancelled',
      E_ALREADY_OWNED: 'You already have this subscription',
      E_ITEM_UNAVAILABLE: 'This item is not available',
      E_NETWORK_ERROR: 'Network error. Check your connection',
      E_UNKNOWN: 'An unexpected error occurred',
    };

    const message = errorMessages[error.code] || error.message;

    // Only show alert for non-cancellation errors
    if (error.code !== 'E_USER_CANCELLED') {
      Alert.alert('Purchase Error', message);
    }
  };
  const handlePlanAction = (productId: string) => {
    const selectedPlan = getPlanBySku(productId);

    if (!selectedPlan) {
      Alert.alert('Error', 'Invalid subscription plan');
      return;
    }

    // Check if user already has this plan AND it's still active
    if (
      activePlanSku === productId &&
      subscriptionStatus === SubscriptionStatus.ACTIVE &&
      isSubscribed
    ) {
      Alert.alert(
        'Already Subscribed',
        `You already have the ${selectedPlan.name}`,
      );
      return;
    }

    // Determine if it's an upgrade, downgrade, or new subscription
    // Only consider upgrade/downgrade if subscription is active
    const hasActiveSubscription =
      activePlanSku &&
      subscriptionStatus === SubscriptionStatus.ACTIVE &&
      isSubscribed;

    if (hasActiveSubscription) {
      const currentPlan = getPlanBySku(activePlanSku);

      if (isPlanUpgrade(activePlanSku, productId)) {
        // Show upgrade confirmation
        const message = getUpgradeConfirmationMessage(
          selectedPlan,
          renewalDate || undefined,
        );

        setConfirmModalConfig({
          title: `Upgrade to ${selectedPlan.name}?`,
          message: '',
          bulletPoints: [
            'Your new plan starts immediately',
            "You'll be charged the prorated difference today",
            renewalDate
              ? `Next billing: ${formatRenewalDate(renewalDate)}`
              : 'Billing continues monthly',
          ],
          confirmText: 'Confirm Upgrade',
          confirmButtonVariant: 'success',
          icon: 'success',
          onConfirm: () => executePurchase(productId),
        });
        setShowConfirmModal(true);
      } else if (isPlanDowngrade(activePlanSku, productId)) {
        // Show downgrade confirmation
        const message = getDowngradeConfirmationMessage(
          currentPlan!,
          selectedPlan,
          subscriptionExpiryDate || undefined,
        );

        setConfirmModalConfig({
          title: `Downgrade to ${selectedPlan.name}?`,
          message: '',
          bulletPoints: [
            subscriptionExpiryDate
              ? `You'll keep ${currentPlan?.name} until ${formatRenewalDate(
                  subscriptionExpiryDate,
                )}`
              : 'Current features continue until period end',
            subscriptionExpiryDate
              ? `On ${formatRenewalDate(
                  subscriptionExpiryDate,
                )}, you'll switch to ${selectedPlan.name}`
              : 'Plan switches at next billing cycle',
            'You can upgrade again anytime',
          ],
          confirmText: 'Confirm Downgrade',
          confirmButtonVariant: 'primary',
          icon: 'info',
          onConfirm: () => executePurchase(productId),
        });
        setShowConfirmModal(true);
      }
    } else {
      // New subscription - show standard confirmation
      setConfirmModalConfig({
        title: `Subscribe to ${selectedPlan.name}?`,
        message: 'Get access to all premium features',
        bulletPoints: selectedPlan.features.slice(0, 3),
        confirmText: 'Subscribe Now',
        confirmButtonVariant: 'primary',
        icon: 'success',
        onConfirm: () => executePurchase(productId),
      });
      setShowConfirmModal(true);
    }
  };

  const executePurchase = (productId: string) => {
    setShowConfirmModal(false);
    setSelectedPlanForPurchase(productId);
    setTimeout(() => {
      handlePurchaseSubscription(productId);
    }, 300);
  };

  const handlePurchaseSubscription = async (sku: string) => {
    if (!connected) {
      Alert.alert('Error', 'Store is not connected. Please try again.');
      return;
    }

    // Generate valid UUID from userId for appAccountToken
    const appAccountToken = userIdToUUID(userId);
    // const appAccountToken = generateUUIDFromUserId(userId);
    console.log('Initiating purchase for SKU:', sku);
    console.log('User ID:', userId, '→ UUID:', appAccountToken);

    dispatch(setPurchaseLoading(true));
    await clearTransactionIOS();
    requestSubscription({
      sku,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
      // appAccountToken: String(userId),
      ...(appAccountToken && {appAccountToken}), // Only include if valid UUID generated
    })
      .then(res => {
        // setloader(false);
        handlePurchaseUpdate(res);
      })
      .catch(error => {
        dispatch(setPurchaseLoading(false));
        handlePurchaseError(error);
      });
  };
  // const handlePurchaseSubscription = async (sku: string) => {
  //   if (!connected) {
  //     Alert.alert('Error', 'Store is not connected. Please try again.');
  //     return;
  //   }

  //   // Generate valid UUID from userId for appAccountToken
  //   const appAccountToken = userIdToUUID(userId);
  //   // const appAccountToken = generateUUIDFromUserId(userId);
  //   console.log('Initiating purchase for SKU:', sku);
  //   console.log('User ID:', userId, '→ UUID:', appAccountToken);

  //   try {
  //     dispatch(setPurchaseLoading(true));
  //     await requestSubscription({
  //       sku,
  //       andDangerouslyFinishTransactionAutomaticallyIOS: false,
  //       // appAccountToken: String(userId),
  //       ...(appAccountToken && {appAccountToken}), // Only include if valid UUID generated
  //     });
  //   } catch (error: any) {
  //     console.error('Purchase request error:', error);
  //     dispatch(setPurchaseLoading(false));
  //   }
  // };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const purchases = await getAvailablePurchases();

      console.log('📥 Restoring purchases:', purchases.length);

      if (purchases && purchases.length > 0) {
        // Finish restored transactions
        for (const purchase of purchases) {
          await finishTransaction({
            purchase,
            isConsumable: false,
          });
        }

        // Re-validate subscription status (checks for expiry)
        await checkExistingPurchases();

        Alert.alert(
          'Success',
          `Restored ${purchases.length} purchase(s) successfully!`,
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases found to restore.',
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Failed', 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleGetSubscriptions();
    await checkExistingPurchases();
    setRefreshing(false);
  }, [connected]);

  const renderSubscriptionCard = (product: any) => {
    const plan = getPlanBySku(product.productId);

    // Only consider it current plan if it's the active SKU AND subscription is active (not expired)
    const isCurrentPlan =
      activePlanSku === product.productId &&
      subscriptionStatus === SubscriptionStatus.ACTIVE &&
      isSubscribed;

    // Only show upgrade/downgrade if subscription is active (not expired)
    const canUpgradeDowngrade =
      activePlanSku &&
      subscriptionStatus === SubscriptionStatus.ACTIVE &&
      isSubscribed;

    const isUpgrade =
      canUpgradeDowngrade && isPlanUpgrade(activePlanSku, product.productId);
    const isDowngrade =
      canUpgradeDowngrade && isPlanDowngrade(activePlanSku, product.productId);

    const gradientColors = plan?.gradient || ['#9333EA', '#6D28D9'];

    const getButtonConfig = () => {
      if (isCurrentPlan) {
        return {
          title: 'Current Plan',
          disabled: true,
          icon: CheckCircle2,
        };
      }
      if (isUpgrade) {
        return {
          title: 'Upgrade',
          disabled: false,
          icon: ArrowUp,
        };
      }
      if (isDowngrade) {
        return {
          title: 'Downgrade',
          disabled: false,
          icon: ArrowDown,
        };
      }
      return {
        title: 'Subscribe Now',
        disabled: false,
        icon: null,
      };
    };

    const buttonConfig = getButtonConfig();

    return (
      <LinearGradient
        key={product.productId}
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.subscriptionCard,
          isCurrentPlan && styles.currentPlanCard,
        ]}>
        <View style={{width: '90%'}}>
          <View style={styles.cardHeader}>
            <View style={styles.crownContainer}>
              <Crown size={fp(4)} color="#FFD700" fill="#FFD700" />
            </View>
            <Sparkles
              size={fp(2.5)}
              color="rgba(255,255,255,0.7)"
              style={styles.sparkle1}
            />
            <Sparkles
              size={fp(2)}
              color="rgba(255,255,255,0.5)"
              style={styles.sparkle2}
            />
          </View>

          <Text style={styles.productTitle}>
            {plan?.name || product.title || 'Premium Plan'}
          </Text>
          <Text style={styles.productDescription}>
            {product.description || 'Unlock all premium features'}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {product.localizedPrice || product.price || 'N/A'}
            </Text>
            {product.subscriptionPeriodUnitIOS && (
              <Text style={styles.period}>
                / {product.subscriptionPeriodUnitIOS.toLowerCase()}
              </Text>
            )}
          </View>

          <View style={styles.featuresContainer}>
            {plan?.features.map((feature: string, index: number) => (
              <FeatureItem key={index} text={feature} />
            ))}
          </View>

          {/* Show status badge for the plan matching activePlanSku, regardless of status */}
          {activePlanSku === product.productId && subscriptionStatus && (
            <View style={styles.statusBadgeContainer}>
              <SubscriptionStatusBadge
                status={subscriptionStatus}
                expiryDate={subscriptionExpiryDate || undefined}
                renewalDate={renewalDate || undefined}
              />
            </View>
          )}

          <AppButton
            title={
              purchaseLoading && selectedPlanForPurchase === product.productId
                ? isUpgrade
                  ? 'Upgrading...'
                  : isDowngrade
                  ? 'Processing...'
                  : 'Processing...'
                : buttonConfig.title
            }
            onPress={() => handlePlanAction(product.productId)}
            disabled={buttonConfig.disabled || purchaseLoading}
            loading={
              purchaseLoading && selectedPlanForPurchase === product.productId
            }
            leftIcon={buttonConfig.icon}
            style={[
              styles.subscribeButton,
              isCurrentPlan && styles.currentPlanButton,
              isUpgrade && styles.upgradeButton,
              isDowngrade && styles.downgradeButton,
            ]}
            textStyle={styles.subscribeButtonText}
          />

          {isCurrentPlan && (
            <AppButton
              title="Manage Subscription"
              onPress={() => setShowManageModal(true)}
              variant="outlined"
              leftIcon={Settings}
              style={styles.manageButton}
            />
          )}
        </View>
      </LinearGradient>
    );
  };

  return (
    <CustomSafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft
            size={fp(2.8)}
            color={Colors.text_primary}
            strokeWidth={1.6}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Subscription</Text>

        <TouchableOpacity>
          <Bell size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.container}>
          <View style={styles.inner}>
            <View style={styles.contentHeader}>
              <CreditCard
                size={fp(3.5)}
                color={Colors.primary}
                strokeWidth={2}
              />
              <Text style={styles.heading}>Premium Subscription</Text>
              <Text style={styles.subheading}>
                Choose the plan that fits your needs
              </Text>

              {lastSyncTime && (
                <Text style={styles.syncTime}>
                  Last synced: {moment(lastSyncTime).fromNow()}
                </Text>
              )}
            </View>

            {loading || !connected ? (
              <View style={styles.loadingContainer}>
                <Skeleton style={styles.skeletonCard} />
                <Skeleton style={styles.skeletonCard} />
              </View>
            ) : subscriptions && subscriptions.length > 0 ? (
              <View style={styles.subscriptionsContainer}>
                {subscriptions.map(product => renderSubscriptionCard(product))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No subscriptions available at the moment.
                </Text>
              </View>
            )}

            <View style={styles.restoreContainer}>
              <AppButton
                title={restoring ? 'Restoring...' : 'Restore Purchases'}
                onPress={handleRestorePurchases}
                variant="outlined"
                disabled={restoring}
                loading={restoring}
                leftIcon={RefreshCcw}
                style={styles.restoreButton}
              />
              <Text style={styles.restoreInfo}>
                Already have a subscription? Tap to restore your purchases.
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Subscription Information</Text>
              <Text style={styles.infoText}>
                • Subscriptions automatically renew unless cancelled
              </Text>
              <Text style={styles.infoText}>
                • Manage your subscription in your App Store account settings
              </Text>
              <Text style={styles.infoText}>
                • Cancel anytime without penalty
              </Text>
              <Text style={styles.infoText}>
                • Upgrades are prorated and take effect immediately
              </Text>
              <Text style={styles.infoText}>
                • Downgrades take effect at the end of your current billing
                period
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal for Upgrade/Downgrade/Subscribe */}
      {confirmModalConfig && (
        <ConfirmationModal
          visible={showConfirmModal}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          bulletPoints={confirmModalConfig.bulletPoints}
          confirmText={confirmModalConfig.confirmText}
          cancelText="Cancel"
          confirmButtonVariant={confirmModalConfig.confirmButtonVariant}
          onConfirm={confirmModalConfig.onConfirm}
          onCancel={() => setShowConfirmModal(false)}
          loading={purchaseLoading}
          icon={confirmModalConfig.icon}
        />
      )}

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        visible={showManageModal}
        planName={
          activePlanSku
            ? getPlanBySku(activePlanSku)?.name || 'Premium Plan'
            : 'Premium Plan'
        }
        expiryDate={
          subscriptionExpiryDate
            ? formatRenewalDate(subscriptionExpiryDate)
            : undefined
        }
        onClose={() => setShowManageModal(false)}
        onCancelSubscription={handleCancelSubscription}
      />
    </CustomSafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  header: {
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
    backgroundColor: '#FFFFFF',
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fp(2.2),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(3),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },
  contentHeader: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  heading: {
    fontSize: fp(2.6),
    fontFamily: Fonts.Bold,
    color: Colors.text_primary,
    marginTop: hp(1),
  },
  subheading: {
    fontSize: fp(1.6),
    fontFamily: Fonts.Regular,
    color: Colors.text_secondary,
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  syncTime: {
    fontSize: fp(1.2),
    fontFamily: Fonts.Regular,
    color: '#6B7280',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  subscriptionsContainer: {
    marginTop: hp(2),
  },
  subscriptionCard: {
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
    marginBottom: hp(2),
    position: 'relative',
    overflow: 'hidden',
    minHeight: 850,
  },
  currentPlanCard: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  crownContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: wp(10),
    padding: wp(4),
  },
  sparkle1: {
    position: 'absolute',
    top: hp(1),
    right: wp(8),
  },
  sparkle2: {
    position: 'absolute',
    top: hp(3),
    left: wp(6),
  },
  productTitle: {
    fontSize: fp(2.4),
    fontFamily: Fonts.Bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  productDescription: {
    fontSize: fp(1.6),
    fontFamily: Fonts.Regular,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  price: {
    fontSize: fp(3.5),
    fontFamily: Fonts.Bold,
    color: Colors.white,
  },
  period: {
    fontSize: fp(1.8),
    fontFamily: Fonts.Medium,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: wp(1),
  },
  featuresContainer: {
    // marginBottom: hp(2.5),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(1.2),
  },
  featureText: {
    fontSize: fp(1.5),
    fontFamily: Fonts.Medium,
    color: Colors.white,
    flex: 1,
    marginLeft: wp(2),
  },
  subscribeButton: {
    backgroundColor: Colors.white,
    marginTop: hp(1),
    alignSelf: 'stretch',
  },
  subscribeButtonText: {
    color: '#9333EA',
    fontFamily: Fonts.Bold,
    fontSize: fp(1.7),
  },
  currentPlanButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
  },
  downgradeButton: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  manageButton: {
    marginTop: hp(1.5),
    borderColor: 'rgba(255,255,255,0.6)',
  },
  statusBadgeContainer: {
    marginTop: hp(1.5),
    marginBottom: hp(0.5),
  },
  activeSubscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    marginTop: hp(2),
    padding: hp(1.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: wp(2),
  },
  activeSubscriptionText: {
    fontSize: fp(1.6),
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  restoreContainer: {
    marginTop: hp(3),
    width: '100%',
  },
  restoreButton: {
    width: '100%',
    borderColor: Colors.primary,
  },
  restoreInfo: {
    fontSize: fp(1.4),
    fontFamily: Fonts.Regular,
    color: Colors.text_secondary,
    textAlign: 'center',
    marginTop: hp(1.5),
    paddingHorizontal: wp(2),
  },
  infoContainer: {
    marginTop: hp(4),
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: Colors.background_light,
    borderRadius: wp(3),
    width: '100%',
  },
  infoTitle: {
    fontSize: fp(1.8),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    marginBottom: hp(1),
  },
  infoText: {
    fontSize: fp(1.4),
    fontFamily: Fonts.Regular,
    color: Colors.text_secondary,
    marginBottom: hp(0.8),
    lineHeight: fp(2),
  },
  loadingContainer: {
    marginTop: hp(2),
  },
  skeletonCard: {
    height: hp(60),
    borderRadius: wp(4),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(8),
    marginTop: hp(4),
  },
  emptyText: {
    fontSize: fp(1.6),
    fontFamily: Fonts.Medium,
    color: Colors.text_secondary,
    textAlign: 'center',
  },
});
