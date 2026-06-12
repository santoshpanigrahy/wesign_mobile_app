import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import api from '@utils/api';
import CustomSafeAreaView from '@components/CustomSafeAreaView';

import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, CheckCircle2, Info, Link} from 'lucide-react-native';

import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import {pricingData} from '@utils/pricingData';
import {goBack, navigate} from '@utils/NavigationUtils';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hideLoader, showLoader} from '@redux/slices/loaderSlice';
import {useRoute} from '@react-navigation/native';

import * as RNIap from 'react-native-iap';
import {
  useIAP,
  getAvailablePurchases,
  finishTransaction,
  clearTransactionIOS,
  validateReceiptIos,
} from 'react-native-iap';
import {Alert} from 'react-native';
import moment from 'moment';
import {APP_SHARED_SECRET} from '@env';
import {
  setSubscription,
  updateSubscriptionLocally,
} from '@redux/slices/authSlice';
import SubscriptionSuccessModal from '@components/SubscriptionSuccessModal';
import ConfirmationModal from '@components/ConfirmationModal';
import ManageSubscriptionModal from '@components/ManageSubscriptionModal';
import SubscriptionStatusBadge from '@components/SubscriptionStatusBadge';
import {
  isPlanUpgrade,
  isPlanDowngrade,
  formatRenewalDate,
  getUpgradeConfirmationMessage,
  getDowngradeConfirmationMessage,
} from '@utils/subscriptionHelpers';
import {SubscriptionStatus} from '../types/subscription';
import AppButton from '@components/AppButton';
import {RefreshCcw, Settings} from 'lucide-react-native';

const SUBSCRIPTION_IDS = [
  //   'ws_personal_test',
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
const IS_ANDROID = Platform.OS === 'android';

const PricingScreen = () => {
  const userId = useAppSelector((state: any) => state.auth.user?.id);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeBasePlanId, setActiveBasePlanId] = useState<string | null>(null);
  const [purchaseToken, setPurchaseToken] = useState<string | null>(null);
  const [purchasePlatform, setPurchasePlatform] = useState<string | null>(null);

  // iOS-specific state
  const [restoring, setRestoring] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<any>(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<
    string | null
  >(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<
    string | null
  >(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  const route = useRoute<any>();

  const {fromRegister} = (route.params || {}) as {fromRegister?: boolean};

  const [plans, setPlans] = useState<any[]>([]);
  const [groupedPlans, setGroupedPlans] = useState<any[]>([]);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activePage, setActivePage] = useState(0);
  const [infoText, setInfoText] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // iOS IAP Hook
  const {
    connected,
    subscriptions: iapSubscriptions,
    getSubscriptions: getIAPSubscriptions,
    requestSubscription,
    finishTransaction: finishIAPTransaction,
    currentPurchase,
    currentPurchaseError,
  } = !IS_ANDROID
    ? useIAP()
    : {
        connected: false,
        subscriptions: [],
        getSubscriptions: () => {},
        requestSubscription: () => {},
        finishTransaction: () => {},
        currentPurchase: null,
        currentPurchaseError: null,
      };

  const openInfoBottomSheet = (text: string) => {
    if (!text) return;
    setInfoText(text);
    setShowInfoModal(true);
  };

  const handleOpenLink = (link: string) => {
    Linking.openURL(link);
  };

  const getBadgeText = () => {
    if (billingCycle === 'quarterly') {
      return 'Save 20%';
    } else if (billingCycle === 'yearly') {
      return 'Save 40%';
    } else {
      return 'Popular';
    }
  };

  const getFinalPrice = (price: number) => {
    if (!price) return null;
    let finalPrice: any = {};

    if (billingCycle === 'monthly') {
      finalPrice.monthlyText = `$${price}`;
      finalPrice.subText = `$${price * 12} billed yearly`;
    } else if (billingCycle === 'quarterly') {
      finalPrice.monthlyText = `$${price / 3}`;
      finalPrice.subText = `$${price} billed quarterly`;
    } else if (billingCycle === 'yearly') {
      finalPrice.monthlyText = `$${price / 12}`;
      finalPrice.subText = `$${price} billed yearly`;
    }

    return finalPrice;
  };

  const getCurrentPlan = async () => {
    try {
      const resData = await api.get(`/auth/subscription/active?user=${userId}`);
      if (resData?.data?.status) {
        console.log('Active subscription:', resData.data);
        const subscription = resData?.data?.subscription;

        if (subscription?.payment_method === 'Card') {
          setPurchasePlatform('web');
          setActivePlanId(subscription?.activated_plan_id);
          // setActivePlanId(subscription?.activated_plan_id + '_test');
        } else {
          // iOS/Android in-app purchase
          setPurchasePlatform(Platform.OS);
          setActivePlanId(subscription?.activated_plan_id);
        }

        // Extract iOS-specific data for better UI
        // if (!IS_ANDROID) {
        //   // Set subscription status
        //   if (subscription?.status === 'active') {
        //     setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        //   } else if (subscription?.status === 'cancelled') {
        //     setSubscriptionStatus(SubscriptionStatus.CANCELLED);
        //   } else if (subscription?.status === 'expired') {
        //     setSubscriptionStatus(SubscriptionStatus.EXPIRED);
        //   }

        //   // Set dates
        //   setSubscriptionExpiryDate(subscription?.expiry_date || null);
        //   setRenewalDate(
        //     subscription?.renewal_date || subscription?.expiry_date || null,
        //   );
        // }

        dispatch(setSubscription(subscription));
      } else {
        // No active subscription
        setActivePlanId(null);
        setPurchasePlatform(null);
        if (!IS_ANDROID) {
          setSubscriptionStatus(null);
          setSubscriptionExpiryDate(null);
          setRenewalDate(null);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initIAP = async () => {
      dispatch(showLoader('Loading'));

      try {
        await RNIap.initConnection();

        if (IS_ANDROID) {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        const items = await RNIap.getSubscriptions({skus: SUBSCRIPTION_IDS});
        const purchases = await RNIap.getAvailablePurchases();

        await getCurrentPlan();

        if (Platform.OS === 'android' && purchases && purchases.length > 0) {
          const currentPurchase = purchases[0];

          setActivePlanId(currentPurchase?.productId);

          setPurchaseToken(currentPurchase?.purchaseToken ?? null);
        }

        const groupedItems = items?.map(plan => {
          const pricingInfo = pricingData.find(item =>
            plan.productId.includes(item.skuDataId.replace('_test', '')),
          );
          return {...plan, ...pricingInfo};
        });
        console.log('Enriched subscription plans:', groupedItems);
        setSubscriptions(groupedItems);
      } catch (e) {
        console.error('IAP Init Error:', e);
      } finally {
        dispatch(hideLoader());
        setLoading(false);
      }
    };

    initIAP();

    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async purchase => {
        // Only handle Android purchases here - iOS uses .then/.catch handlers
        if (!IS_ANDROID) return;

        try {
          await RNIap.finishTransaction({purchase, isConsumable: false});

          setShowSuccessModal(true);

          setActivePlanId(purchase.productId);
          setPurchaseToken(purchase.purchaseToken || null);

          await getCurrentPlan();
        } catch (e) {
          console.error('Transaction Finish Error:', e);
        }
      },
    );

    purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Error',
          error?.message || 'Billing error encountered.',
        );
      }
    });

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

      RNIap.endConnection();
    };
  }, []);

  const handleCancelSubscription = async (productId: string) => {
    const packageName = 'com.wesign';

    let url;

    if (Platform.OS === 'android') {
      url = `https://play.google.com/store/account/subscriptions?package=${packageName}&sku=${productId}`;
    } else {
      url = 'https://apps.apple.com/account/subscriptions';
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open the subscription manager.');
      }
    } catch (error) {
      console.error('Deep Link Error:', error);
    }
  };

  const openWebPricing = () => {
    Linking.openURL('https://wesign.com/pricing');
  };

  // Helper function to generate UUID from userId for iOS
  const userIdToUUID = (userId: any) => {
    const padded = String(userId).padStart(12, '0');
    return `00000000-0000-0000-0000-${padded}`;
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
          return moment(timestamp).toISOString();
        }
      }
    }
    return null;
  };

  // Helper function to validate receipt with automatic environment detection
  // Handles both sandbox (Development/TestFlight) and production receipts
  const validateReceiptWithAutoRetry = async (receipt: string) => {
    try {
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
        response = await validateReceiptIos({
          receiptBody: {
            'receipt-data': receipt,
            password: APP_SHARED_SECRET,
          },
          isTest: true, // Sandbox
        });
      } else {
      }

      return response;
    } catch (error) {
      console.error('❌ Receipt validation error:', error);
      throw error;
    }
  };

  // iOS-specific purchase handlers
  const handlePurchaseUpdate = async (purchase: any) => {
    if (IS_ANDROID) return; // Skip for Android

    console.log('📦 iOS Purchase received:');

    try {
      dispatch(showLoader('Processing your purchase...'));

      let expiryDate: string | null = null;

      // Validate receipt with Apple
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          const appleReceiptResponse = await validateReceiptWithAutoRetry(
            receipt,
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
              }
            }
          } else {
            throw new Error('Receipt validation failed');
          }
        } catch (validationError) {
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

      // Update local iOS state with expiry information
      if (!IS_ANDROID) {
        if (!expiryDate) {
          console.warn(
            '⚠️ No expiry date for new purchase. Treating as active.',
          );
          setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        } else {
          const isSubscriptionExpired = moment(expiryDate).isBefore(moment());

          if (isSubscriptionExpired) {
            setSubscriptionStatus(SubscriptionStatus.EXPIRED);
          } else {
            setSubscriptionStatus(SubscriptionStatus.ACTIVE);
          }
        }

        setSubscriptionExpiryDate(expiryDate);
        setRenewalDate(expiryDate);
      }

      // Finish the transaction
      await finishIAPTransaction({
        purchase,
        isConsumable: false,
      });

      // Refresh subscription from backend
      await getCurrentPlan();

      // Show success
      dispatch(hideLoader());
      setShowSuccessModal(true);

      console.log('✅ iOS purchase processed successfully');
    } catch (error) {
      dispatch(hideLoader());
      Alert.alert(
        'Error',
        'Failed to process purchase. Please contact support.',
      );
    } finally {
      setSelectedPlanForPurchase(null);
    }
  };

  const handlePurchaseError = (error: any) => {
    if (IS_ANDROID) return; // Skip for Android

    console.error('❌ iOS Purchase error:', error);

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

  const handleRestorePurchases = async () => {
    if (IS_ANDROID) return; // iOS only feature

    try {
      setRestoring(true);
      dispatch(showLoader('Restoring purchases...'));

      const purchases = await getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        // Finish restored transactions
        for (const purchase of purchases) {
          await finishIAPTransaction({
            purchase,
            isConsumable: false,
          });
        }

        // Refresh subscription from backend
        await getCurrentPlan();

        dispatch(hideLoader());
        Alert.alert(
          'Success',
          `Restored ${purchases.length} purchase(s) successfully!`,
        );
      } else {
        dispatch(hideLoader());
        Alert.alert(
          'No Purchases Found',
          'No previous purchases found to restore.',
        );
      }
    } catch (error) {
      console.error('❌ iOS restore failed:', error);
      dispatch(hideLoader());
      Alert.alert('Restore Failed', 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  const upgradeSubscriptionPlan = async (
    newProduct: any,
    isWebPurchase: boolean,
  ) => {
    if (isWebPurchase) {
      openWebPricing();
      return;
    }

    try {
      if (IS_ANDROID) {
        // Android upgrade logic
        const chosenOffer = newProduct?.subscriptionOfferDetails?.[0];
        const offerToken = chosenOffer?.offerToken;

        await RNIap.requestSubscription({
          sku: newProduct.productId,
          subscriptionOffers: [{sku: newProduct.productId, offerToken}],
          purchaseTokenAndroid: purchaseToken || undefined,
          replacementModeAndroid:
            RNIap.ReplacementModesAndroid.WITH_TIME_PRORATION,
          obfuscatedAccountIdAndroid: userId.toString(),
          obfuscatedProfileIdAndroid: userId.toString(),
        });
      } else {
        // iOS upgrade logic
        setSelectedPlanForPurchase(newProduct.productId);
        const appAccountToken = userIdToUUID(userId);
        await clearTransactionIOS();
        const purchaseResult = requestSubscription({
          sku: newProduct.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
          ...(appAccountToken && {appAccountToken}),
        });

        if (purchaseResult && typeof purchaseResult.then === 'function') {
          purchaseResult
            .then((res: any) => {
              handlePurchaseUpdate(res);
            })
            .catch((error: any) => {
              handlePurchaseError(error);
            });
        }
      }
    } catch (error: any) {
      if (error.code !== 'E_USER_CANCELLED')
        Alert.alert('Upgrade Error', error?.message);
    }
  };

  const buySubscriptionPlan = async (product: any, isWebPurchase: boolean) => {
    if (isWebPurchase) {
      openWebPricing();
      return;
    }

    try {
      if (IS_ANDROID) {
        // Android purchase logic
        const trialOffer = product?.subscriptionOfferDetails?.find(
          (offer: any) =>
            offer.pricingPhases?.pricingPhaseList?.some(
              (phase: any) =>
                phase.priceAmountMicros === '0' ||
                phase.priceAmountMicros === 0,
            ),
        );

        const chosenOffer =
          trialOffer || product?.subscriptionOfferDetails?.[0];
        const offerToken = chosenOffer?.offerToken;

        if (!offerToken) return;

        await RNIap.requestSubscription({
          sku: product.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
          subscriptionOffers: [{sku: product.productId, offerToken}],
          obfuscatedAccountIdAndroid: userId.toString(),
          obfuscatedProfileIdAndroid: userId.toString(),
        });
      } else {
        // iOS purchase logic
        setSelectedPlanForPurchase(product.productId);
        const appAccountToken = userIdToUUID(userId);
        await clearTransactionIOS();
        const purchaseResult = requestSubscription({
          sku: product.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
          ...(appAccountToken && {appAccountToken}),
        });

        if (purchaseResult && typeof purchaseResult.then === 'function') {
          purchaseResult
            .then((res: any) => {
              handlePurchaseUpdate(res);
            })
            .catch((error: any) => {
              handlePurchaseError(error);
            });
        }
      }
    } catch (error: any) {
      if (error.code !== 'E_USER_CANCELLED')
        Alert.alert('Checkout Error', error?.message);
    }
  };

  // iOS-specific plan action handler with confirmation modals
  const handlePlanAction = (productId: string) => {
    if (IS_ANDROID) {
      // Android doesn't use confirmation modals, just purchase directly
      const product = subscriptions.find(p => p.productId === productId);
      if (product) {
        const isWebPurchase = purchasePlatform === 'web';
        if (activePlanId) {
          upgradeSubscriptionPlan(product, isWebPurchase);
        } else {
          buySubscriptionPlan(product, isWebPurchase);
        }
      }
      return;
    }

    // iOS confirmation modal logic
    const selectedPlan = subscriptions.find(p => p.productId === productId);

    if (!selectedPlan) {
      Alert.alert('Error', 'Invalid subscription plan');
      return;
    }

    // Check if user already has this plan AND it's still active
    if (
      activePlanId === productId &&
      subscriptionStatus === SubscriptionStatus.ACTIVE
    ) {
      Alert.alert(
        'Already Subscribed',
        `You already have the ${selectedPlan.title}`,
      );
      return;
    }

    // Determine if it's an upgrade, downgrade, or new subscription
    const hasActiveSubscription =
      activePlanId && subscriptionStatus === SubscriptionStatus.ACTIVE;

    if (hasActiveSubscription) {
      const currentPlan = subscriptions.find(p => p.productId === activePlanId);

      if (isPlanUpgrade(activePlanId, productId)) {
        // Show upgrade confirmation
        setConfirmModalConfig({
          title: `Upgrade to ${selectedPlan.title}?`,
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
      } else if (isPlanDowngrade(activePlanId, productId)) {
        // Show downgrade confirmation
        setConfirmModalConfig({
          title: `Downgrade to ${selectedPlan.title}?`,
          message: '',
          bulletPoints: [
            subscriptionExpiryDate
              ? `You'll keep ${
                  currentPlan?.title || 'current plan'
                } until ${formatRenewalDate(subscriptionExpiryDate)}`
              : 'Current features continue until period end',
            subscriptionExpiryDate
              ? `On ${formatRenewalDate(
                  subscriptionExpiryDate,
                )}, you'll switch to ${selectedPlan.title}`
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
      const topFeatures = selectedPlan.features
        ?.slice(0, 3)
        .map((f: any) => f.name || f) || [
        'Access to all premium features',
        'Priority support',
        'Advanced tools',
      ];

      setConfirmModalConfig({
        title: `Subscribe to ${selectedPlan.title}?`,
        message: 'Get access to all premium features',
        bulletPoints: topFeatures,
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
    setTimeout(() => {
      const product = subscriptions.find(p => p.productId === productId);
      if (product) {
        const isWebPurchase = purchasePlatform === 'web';
        if (activePlanId) {
          upgradeSubscriptionPlan(product, isWebPurchase);
        } else {
          buySubscriptionPlan(product, isWebPurchase);
        }
      }
    }, 300);
  };

  return (
    <CustomSafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#E5E7EB', '#D1D5DB']} style={styles.container}>
        <View style={styles.header}>
          {!fromRegister && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => goBack()}>
              <ArrowLeft color="#333" size={wp(6)} />
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.toggleContainer,
              fromRegister && {marginHorizontal: 'auto'},
            ]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === 'monthly' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('monthly')}>
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === 'monthly' && styles.toggleTextActive,
                ]}>
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === 'quarterly' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('quarterly')}>
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === 'quarterly' && styles.toggleTextActive,
                ]}>
                Quarterly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === 'yearly' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('yearly')}>
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === 'yearly' && styles.toggleTextActive,
                ]}>
                Yearly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Pricing</Text>
          <View style={styles.paginationContainer}>
            {[0, 1, 2].map(pageIndex => (
              <View
                key={pageIndex}
                style={[
                  styles.dot,
                  activePage === pageIndex
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={e => setActivePage(e.nativeEvent.position)}
          onPageScrollStateChanged={e => {
            setIsSwiping(e.nativeEvent.pageScrollState !== 'idle');
          }}>
          {subscriptions
            ?.filter(plan => {
              const id = plan.productId;
              if (billingCycle === 'monthly')
                return ['ws_personal', 'ws_business', 'ws_enterprise'].includes(
                  id,
                );
              if (billingCycle === 'quarterly')
                return id.endsWith('_quarterly');
              if (billingCycle === 'yearly') return id.endsWith('_yearly');
              return false;
            })
            ?.map((plan, index) => {
              // Platform-specific pricing extraction
              let price;
              let currencyCode;
              let hasTrial = false;

              if (IS_ANDROID) {
                // Android: Extract from subscriptionOfferDetails
                const standardOffer = plan?.subscriptionOfferDetails?.[0];

                hasTrial = standardOffer?.pricingPhases?.pricingPhaseList?.some(
                  (phase: any) =>
                    phase.priceAmountMicros === '0' ||
                    phase.priceAmountMicros === 0,
                );

                const standardPricePhase =
                  standardOffer?.pricingPhases?.pricingPhaseList?.find(
                    (phase: any) =>
                      phase.priceAmountMicros !== '0' &&
                      phase.priceAmountMicros !== 0,
                  );

                price = standardPricePhase?.formattedPrice || '$4.99';
                currencyCode = standardPricePhase?.priceCurrencyCode || 'USD';
              } else {
                // iOS: Extract from plan object directly
                price = plan.localizedPrice || plan.price || '$4.99';
                currencyCode = plan.currency || plan.currencyCode || 'USD';

                // iOS trial detection (introductory price indicates a trial)
                hasTrial = plan.introductoryPrice ? true : false;
              }
              const isActive = plan.productId === activePlanId;
              const isWebPurchase = purchasePlatform === 'web';
              return (
                <View key={plan.productId} style={styles.page}>
                  <View
                    style={[
                      styles.cardContainer,
                      // isActive && styles.activeSubscription,
                    ]}
                    pointerEvents={isSwiping ? 'none' : 'auto'}>
                    <LinearGradient
                      colors={
                        isActive ? ['#e9f4fc', '#fff'] : ['#FFFFFF', '#FDF8EA']
                      }
                      style={[StyleSheet.absoluteFill, {borderRadius: wp(8)}]}
                      pointerEvents="none"
                    />
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        // width: Platform.OS === 'ios' ? '90%' : '100%',
                      }}>
                      {/* Card Header & Badge */}
                      <View style={styles.cardHeader}>
                        <Text
                          style={
                            styles.planTitle
                          }>{`${plan?.title} ${billingCycle} plan`}</Text>
                        {isActive ? (
                          <View style={styles.activeBadgeContainer}>
                            <Text style={styles.activeBadgeText}>Active</Text>
                            <View style={styles.activeBadgeDot} />
                          </View>
                        ) : (
                          <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>
                              {getBadgeText()}
                            </Text>

                            <View style={styles.badgeDot} />
                          </View>
                        )}
                      </View>

                      <View style={styles.pricingRow}>
                        <Text style={styles.priceAmount}>{price}</Text>
                        <View style={styles.priceDetails}>
                          <Text style={styles.priceSubtext}>
                            / {billingCycle} ({currencyCode})
                          </Text>
                          {/* {

                                                    billingCycle !== 'monthly' && <Text style={styles.priceSubtext}>{getFinalPrice(plan?.price)?.subText}</Text>

                                                } */}
                        </View>
                      </View>

                      <Text style={styles.planDescription}>
                        {plan?.description}
                      </Text>

                      <View style={styles.divider} />

                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled={true}
                        style={{flexGrow: 1, flexShrink: 1}}
                        contentContainerStyle={{
                          paddingBottom: hp(1),
                        }}>
                        <View
                          style={[
                            styles.featuresContainer,
                            {marginBottom: hp(1)},
                          ]}>
                          {plan.features.map((feature: any, index: number) => (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              delayPressIn={200}
                              onPress={() =>
                                openInfoBottomSheet(feature?.tooltipText)
                              }
                              key={index}
                              style={styles.featureItem}>
                              <CheckCircle2
                                color="#ffffff"
                                fill="#65A30D"
                                size={wp(5.5)}
                              />

                              <View style={styles.featureItemText}>
                                <Text style={styles.featureText}>
                                  {feature.name}
                                </Text>
                                {feature?.link && (
                                  <Pressable
                                    style={styles.link}
                                    onPress={e => {
                                      e.stopPropagation();
                                      handleOpenLink(feature?.link);
                                    }}>
                                    <Link color="#222" size={wp(3.5)} />
                                  </Pressable>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {plan.webFeatures?.length > 0 && (
                          <View>
                            <Text style={styles.webFeatureTitle}>
                              Web features:
                            </Text>

                            <View style={styles.featuresContainer}>
                              {plan.webFeatures.map(
                                (feature: any, index: number) => (
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    delayPressIn={200}
                                    onPress={() =>
                                      openInfoBottomSheet(feature?.tooltipText)
                                    }
                                    key={index}
                                    style={styles.featureItem}>
                                    <CheckCircle2
                                      color="#ffffff"
                                      fill="#65A30D"
                                      size={wp(5.5)}
                                    />

                                    <View style={styles.featureItemText}>
                                      <Text style={styles.featureText}>
                                        {feature.name}
                                      </Text>
                                      {feature?.link && (
                                        <Pressable
                                          style={styles.link}
                                          onPress={e => {
                                            e.stopPropagation();
                                            handleOpenLink(feature?.link);
                                          }}>
                                          <Link color="#222" size={wp(3.5)} />
                                        </Pressable>
                                      )}
                                    </View>
                                  </TouchableOpacity>
                                ),
                              )}
                            </View>
                          </View>
                        )}
                      </ScrollView>

                      {/* iOS Subscription Status Badge */}
                      {!IS_ANDROID && isActive && subscriptionStatus && (
                        <View style={{marginTop: hp(2), marginBottom: hp(1)}}>
                          <SubscriptionStatusBadge
                            status={subscriptionStatus}
                            expiryDate={subscriptionExpiryDate || undefined}
                            renewalDate={renewalDate || undefined}
                          />
                        </View>
                      )}

                      {/* Action Button */}
                      {isActive ? (
                        <TouchableOpacity
                          style={[
                            styles.ctaButton,
                            {
                              backgroundColor: '#ffffff',
                              borderWidth: 1,
                              borderColor: Colors.primary,
                            },
                          ]}
                          onPress={() => {
                            if (isWebPurchase) {
                              Linking.openURL('https://wesign.com/pricing');
                            } else if (!IS_ANDROID) {
                              // iOS: Show manage subscription modal
                              setShowManageModal(true);
                            } else {
                              // Android: Open subscription manager
                              handleCancelSubscription(plan.productId);
                            }
                          }}>
                          <Text
                            style={[styles.ctaText, {color: Colors.primary}]}>
                            Manage Subscription
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.ctaButton}
                          onPress={() => {
                            if (!IS_ANDROID) {
                              // iOS: Use confirmation modal flow
                              handlePlanAction(plan.productId);
                            } else {
                              // Android: Direct purchase
                              if (activePlanId) {
                                upgradeSubscriptionPlan(plan, isWebPurchase);
                              } else {
                                buySubscriptionPlan(plan, isWebPurchase);
                              }
                            }
                          }}>
                          <Text style={styles.ctaText}>
                            {!IS_ANDROID && activePlanId
                              ? isPlanUpgrade(activePlanId, plan.productId)
                                ? 'Upgrade'
                                : isPlanDowngrade(activePlanId, plan.productId)
                                ? 'Downgrade'
                                : `Subscribe to ${billingCycle}`
                              : activePlanId
                              ? `Upgrade to ${billingCycle}`
                              : hasTrial
                              ? 'Start 15-days Free Trial'
                              : 'Subscribe Now'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </PagerView>

        {/* iOS-only Restore Purchases Button */}
        {!IS_ANDROID && (
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
        )}
      </LinearGradient>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}>
        <Pressable
          style={styles.infoModalOverlay}
          onPress={() => setShowInfoModal(false)}>
          <Pressable
            style={styles.infoModalContainer}
            onPress={e => e.stopPropagation()}>
            <View style={styles.infoWrapper}>
              <View style={styles.infoBadge}>
                <Info size={fp(2.5)} color={'#222'} />
                <Text style={styles.InfoText}>Info</Text>
              </View>

              <Text style={styles.InfoText}>{infoText}</Text>

              <TouchableOpacity
                style={styles.infoCloseButton}
                onPress={() => setShowInfoModal(false)}>
                <Text style={styles.infoCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <SubscriptionSuccessModal
        visible={showSuccessModal}
        onContinue={() => {
          setShowSuccessModal(false);

          if (fromRegister) {
            navigate('Drawer', {
              screen: 'Home',
            });
          } else {
            goBack();
          }
        }}
      />

      {/* iOS Confirmation Modal for Upgrade/Downgrade/Subscribe */}
      {!IS_ANDROID && confirmModalConfig && (
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
          loading={loading}
          icon={confirmModalConfig.icon}
        />
      )}

      {/* iOS Manage Subscription Modal */}
      {!IS_ANDROID && (
        <ManageSubscriptionModal
          visible={showManageModal}
          planName={
            activePlanId
              ? subscriptions.find(p => p.productId === activePlanId)?.title ||
                'Premium Plan'
              : 'Premium Plan'
          }
          expiryDate={
            subscriptionExpiryDate
              ? formatRenewalDate(subscriptionExpiryDate)
              : undefined
          }
          onClose={() => setShowManageModal(false)}
          onCancelSubscription={async () => {
            // iOS cancellation is handled through App Store
            const url = 'https://apps.apple.com/account/subscriptions';
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert(
                  'Error',
                  'Could not open the subscription manager.',
                );
              }
            } catch (error) {
              console.error('Deep Link Error:', error);
            }
          }}
        />
      )}
    </CustomSafeAreaView>
  );
};

export default PricingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  container: {
    flex: 1,
    paddingTop: hp(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  backButton: {
    padding: wp(3),
    backgroundColor: '#ffffff',
    borderRadius: wp(10),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: wp(6),
    padding: wp(1),
  },
  toggleButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: wp(5),
  },
  toggleButtonActive: {
    backgroundColor: '#333333',
  },
  toggleText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.6),
    color: '#666666',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: wp(6),
    marginBottom: hp(2),
  },
  pageTitle: {
    fontFamily: Fonts.Regular,
    fontSize: fp(4),
    color: '#333333',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: hp(1),
  },
  dot: {
    height: hp(0.4),
    borderRadius: hp(0.2),
    marginHorizontal: wp(0.8),
  },
  activeDot: {
    width: wp(4),
    backgroundColor: '#FACC15',
  },
  inactiveDot: {
    width: wp(3),
    backgroundColor: '#9CA3AF',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  cardContainer: {
    flex: 1,
    borderRadius: wp(8),
    padding: wp(6),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  activeSubscription: {
    borderWidth: 1.5,
    borderColor: '#4392ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontFamily: Fonts.Medium,
    fontSize: fp(2.4),
    color: '#1F2937',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
  },

  activeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a951c',
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(4),
  },
  activeBadgeText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.2),
    color: '#fff',
    marginRight: wp(1.5),
  },
  badgeText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.4),
    color: '#4B5563',
    marginRight: wp(1.5),
  },
  badgeDot: {
    width: wp(1.8),
    height: wp(1.8),
    borderRadius: wp(0.9),
    backgroundColor: '#65A30D',
  },

  activeBadgeDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.9),
    backgroundColor: '#fff',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  priceAmount: {
    fontFamily: Fonts.Medium,
    fontSize: fp(4),
    color: '#1F2937',
    marginRight: wp(3),
    lineHeight: hp(6),
  },
  priceDetails: {
    justifyContent: 'center',
  },
  priceSubtext: {
    fontFamily: Fonts.Regular,
    fontSize: fp(1.6),
    color: '#6B7280',
    marginBottom: hp(0.3),
  },
  planDescription: {
    fontFamily: Fonts.Regular,
    fontSize: fp(1.6),
    color: '#4B5563',
    lineHeight: hp(2.4),

    marginBottom: hp(1),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginBottom: hp(1),
  },
  featuresContainer: {
    marginBottom: hp(1),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  featureItemText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  featureText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(1.7),
    color: '#374151',
    marginLeft: wp(3),
  },
  ctaButton: {
    paddingVertical: hp(2),
    borderRadius: wp(8),
    alignItems: 'center',
    backgroundColor: '#2f7bff',
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  ctaText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.8),
    color: '#fff',
  },
  infoWrapper: {
    gap: hp(2),
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  InfoText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(1.9),
    color: Colors.text_primary,
  },
  link: {
    width: wp(6),
    height: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  webFeatureTitle: {
    color: Colors.blue,
    fontFamily: Fonts.SemiBold,
    // textAlign: 'center',
    fontSize: fp(1.8),
    marginBottom: hp(2),
  },
  // iOS-specific styles
  restoreContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
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
  // Info Modal styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  infoModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(4),
    maxHeight: '80%',
  },
  infoCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(4),
    alignItems: 'center',
    marginTop: hp(2),
  },
  infoCloseButtonText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.8),
    color: '#FFFFFF',
  },
});
