import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,



    Linking,
    Platform,
    TouchableOpacity
} from 'react-native';
import api from '@utils/api';
import CustomSafeAreaView from '@components/CustomSafeAreaView';

import { ScrollView, Pressable } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, CheckCircle2, Info, Link } from 'lucide-react-native';


import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { pricingData } from '@utils/pricingData';
import AppBottomSheet from '@components/AppBottomSheet';
import AppNewBottomSheet from '@components/AppNewBottomSheet';
import { goBack, navigate } from '@utils/NavigationUtils';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { useRoute } from '@react-navigation/native';

import * as RNIap from 'react-native-iap';
import { Alert } from 'react-native';
import { setSubscription, updateSubscriptionLocally } from '@redux/slices/authSlice';
import SubscriptionSuccessModal from '@components/SubscriptionSuccessModal';

const SUBSCRIPTION_IDS = [
    'ws_personal', 'ws_personal_quarterly', 'ws_personal_yearly',
    'ws_business', 'ws_business_quarterly', 'ws_business_yearly',
    'ws_enterprise', 'ws_enterprise_quarterly', 'ws_enterprise_yearly'
];
const IS_ANDROID = Platform.OS === 'android';
const order = [
    'ws_personal',
    'ws_business',
    'ws_enterprise',
];


const PricingScreen = () => {
    const userId = useAppSelector(state => state.auth.user?.id);
    const token = useAppSelector(state => state.auth.token);

    console.log("User ID==========> ", userId);
    console.log("Token ======> ", token)

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);


    const [activePlanId, setActivePlanId] = useState(null);
    const [activeBasePlanId, setActiveBasePlanId] = useState(null);
    const [purchaseToken, setPurchaseToken] = useState(null);
    const [purchasePlatform, setPurchasePlatform] = useState(null);




    const route = useRoute();

    const { fromRegister } = route.params || {};


    const [plans, setPlans] = useState([])
    const [groupedPlans, setGroupedPlans] = useState([]);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);

    const [billingCycle, setBillingCycle] = useState('monthly');
    const [activePage, setActivePage] = useState(0);
    const [infoText, setInfoText] = useState('');
    const infoRef = useRef(null);
    const openInfoBottomSheet = (text) => {
        if (!text) return
        setInfoText(text);
        infoRef?.current?.snapToIndex(0);
    }

    const handleOpenLink = (link) => {
        Linking.openURL(link)
    }

    const getBadgeText = () => {

        if (billingCycle === 'quarterly') {
            return 'Save 20%'
        } else if (billingCycle === 'yearly') {
            return "Save 40%"
        } else {
            return 'Popular'
        }
    }

    const getFinalPrice = (price) => {
        if (!price) return null;
        let finalPrice = {}

        if (billingCycle === 'monthly') {
            finalPrice.monthlyText = `$${price}`;
            finalPrice.subText = `$${price * 12} billed yearly`
        } else if (billingCycle === 'quarterly') {
            finalPrice.monthlyText = `$${price / 3}`;
            finalPrice.subText = `$${price} billed quarterly`
        } else if (billingCycle === 'yearly') {
            finalPrice.monthlyText = `$${price / 12}`;
            finalPrice.subText = `$${price} billed yearly`
        }

        return finalPrice
    }



    const getCurrentPlan = async () => {
        try {
            const resData = await api.get(`/auth/subscription/active?user=${userId}`);
            console.log(resData)
            if (resData?.data?.status) {

                console.log(resData?.data?.subscription)
                const subscription = resData?.data?.subscription;

                if (subscription?.payment_method === 'Card') {
                    setPurchasePlatform('web');
                    let plan = subscription?.activated_plan_id || '';

                    plan = plan
                        .replace('_free', '')
                        .replace('_reactivate', '');

                    setActivePlanId(plan);
                }

                dispatch(setSubscription(subscription));

            }

        } catch (error) {
            console.log(error);
        }
    }






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


                const items = await RNIap.getSubscriptions({ skus: SUBSCRIPTION_IDS });

                const purchases = await RNIap.getAvailablePurchases();

                await getCurrentPlan();



                if (purchases && purchases.length > 0) {

                    const currentPurchase = purchases[0];



                    setActivePlanId(currentPurchase?.productId);

                    setPurchaseToken(currentPurchase?.purchaseToken);
                }


                const groupedItems = items?.map(plan => {
                    const pricingInfo = pricingData.find(

                        item => plan.productId.includes(item.skuDataId)
                    );
                    return { ...plan, ...pricingInfo };
                });


                setSubscriptions(groupedItems);

            } catch (e) {
                console.error('IAP Init Error:', e);
            } finally {

                dispatch(hideLoader());
                setLoading(false);
            }
        };


        initIAP();


        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async purchase => {
            try {

                await RNIap.finishTransaction({ purchase, isConsumable: false });




                setShowSuccessModal(true);

                setActivePlanId(purchase.productId);
                setPurchaseToken(purchase.purchaseToken);

                await getCurrentPlan();


            } catch (e) {
                console.error('Transaction Finish Error:', e);

            }
        });


        purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {

            if (error.code !== 'E_USER_CANCELLED') {
                Alert.alert('Purchase Error', error?.message || 'Billing error encountered.');
            }
        });


        return () => {

            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();


            RNIap.endConnection();
        };
    }, []);



    const handleCancelSubscription = async (productId) => {

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
                Alert.alert("Error", "Could not open the subscription manager.");
            }
        } catch (error) {
            console.error('Deep Link Error:', error);
        }
    };

    const openWebPricing = () => {
        Linking.openURL(`https://wesign.com/login?user_id=${userId}&token=${token}`);
    }



    const upgradeSubscriptionPlan = async (newProduct, isWebPurchase) => {

        if (isWebPurchase) {
            openWebPricing();
            return;
        }

        try {

            const chosenOffer = newProduct?.subscriptionOfferDetails?.[0];
            const offerToken = chosenOffer?.offerToken;

            await RNIap.requestSubscription({
                sku: newProduct.productId,
                ...(IS_ANDROID && {
                    subscriptionOffers: [{ sku: newProduct.productId, offerToken }],
                    purchaseTokenAndroid: purchaseToken,
                    replacementModeAndroid: RNIap.ReplacementModesAndroid.WITH_TIME_PRORATION,
                }),
                obfuscatedAccountIdAndroid: userId?.toString(),
                obfuscatedProfileIdAndroid: userId?.toString(),
            });

        } catch (error) {
            if (error.code !== 'E_USER_CANCELLED') Alert.alert('Upgrade Error', error?.message);
        }
    };


    const buySubscriptionPlan = async (product, isWebPurchase) => {
        if (isWebPurchase) {
            openWebPricing();
            return;
        }

        try {

            const trialOffer = product?.subscriptionOfferDetails?.find(offer =>
                offer.pricingPhases?.pricingPhaseList?.some(
                    phase => phase.priceAmountMicros === '0' || phase.priceAmountMicros === 0
                )
            );

            const chosenOffer = trialOffer || product?.subscriptionOfferDetails?.[0];
            const offerToken = chosenOffer?.offerToken;

            if (!offerToken) return;

            await RNIap.requestSubscription({
                sku: product.productId,
                ...(IS_ANDROID && {
                    subscriptionOffers: [{ sku: product.productId, offerToken }],
                }),
                obfuscatedAccountIdAndroid: userId?.toString(),
                obfuscatedProfileIdAndroid: userId?.toString(),
            });

        } catch (error) {
            if (error.code !== 'E_USER_CANCELLED') Alert.alert('Checkout Error', error?.message);
        }
    };

    return (
        <CustomSafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#E5E7EB', '#D1D5DB']}
                style={styles.container}>


                <View style={styles.header}>
                    {
                        !fromRegister && <Pressable style={styles.backButton} onPress={() => goBack()}>
                            <ArrowLeft color="#333" size={wp(6)} />
                        </Pressable>
                    }


                    <View style={[styles.toggleContainer, fromRegister && { marginHorizontal: 'auto' }]}>




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
                        {[0, 1, 2].map((pageIndex) => (
                            <View
                                key={pageIndex}
                                style={[
                                    styles.dot,
                                    activePage === pageIndex ? styles.activeDot : styles.inactiveDot,
                                ]}
                            />
                        ))}
                    </View>
                </View>


                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
                    onPageScrollStateChanged={(e) => {

                        setIsSwiping(e.nativeEvent.pageScrollState !== 'idle');
                    }}
                >

                    {
                        subscriptions?.filter(plan => {
                            const id = plan.productId;
                            if (billingCycle === 'monthly') return ['ws_personal', 'ws_business', 'ws_enterprise'].includes(id);
                            if (billingCycle === 'quarterly') return id.endsWith('_quarterly');
                            if (billingCycle === 'yearly') return id.endsWith('_yearly');
                            return false;
                        })?.sort((a, b) => {
                            const getBaseId = id =>
                                id.replace('_quarterly', '').replace('_yearly', '');

                            return (
                                order.indexOf(getBaseId(a.productId)) -
                                order.indexOf(getBaseId(b.productId))
                            );
                        })?.map((plan, index) => {

                            const standardOffer = plan?.subscriptionOfferDetails?.[0];

                            const hasTrial = standardOffer?.pricingPhases?.pricingPhaseList?.some(
                                phase => phase.priceAmountMicros === '0' || phase.priceAmountMicros === 0
                            );

                            const standardPricePhase = standardOffer?.pricingPhases?.pricingPhaseList?.find(
                                phase => phase.priceAmountMicros !== '0' && phase.priceAmountMicros !== 0
                            );

                            const price = standardPricePhase?.formattedPrice || '$4.99';


                            const isActive = plan.productId === activePlanId;
                            const isWebPurchase = purchasePlatform === 'web';
                            const currencyCode = standardPricePhase?.priceCurrencyCode || 'INR';
                            return (
                                <View key={plan.productId} style={styles.page}>
                                    <LinearGradient
                                        colors={isActive ? ['#e9f4fc', '#fff'] : ['#FFFFFF', '#FDF8EA']}
                                        style={[styles.cardContainer, isActive && styles.activeSubscription]}>


                                        {/* Card Header & Badge */}
                                        <View style={{ flex: 1 }} pointerEvents={isSwiping ? 'none' : 'auto'}>


                                            <View style={styles.cardHeader}>
                                                <Text style={styles.planTitle}>{`${plan?.title}`}</Text>
                                                {
                                                    isActive ? <View style={styles.activeBadgeContainer}>

                                                        <Text style={styles.activeBadgeText}>Active</Text>
                                                        <View style={styles.activeBadgeDot} />
                                                    </View> : <View style={styles.badgeContainer}>
                                                        <Text style={styles.badgeText}>{getBadgeText()}</Text>

                                                        <View style={styles.badgeDot} />
                                                    </View>
                                                }

                                            </View>


                                            <View style={styles.pricingRow}>
                                                <Text style={styles.priceAmount}>{price}</Text>
                                                <View style={styles.priceDetails}>
                                                    <Text style={styles.priceSubtext}>/ {billingCycle} ({currencyCode})</Text>
                                                    {/* {

                                                    billingCycle !== 'monthly' && <Text style={styles.priceSubtext}>{getFinalPrice(plan?.price)?.subText}</Text>

                                                } */}
                                                </View>
                                            </View>


                                            <Text style={styles.planDescription}>
                                                {plan?.description}
                                            </Text>


                                            <View style={styles.divider} />


                                            <ScrollView showsVerticalScrollIndicator={false}
                                                keyboardShouldPersistTaps="always"
                                                nestedScrollEnabled={true}>
                                                <View style={[styles.featuresContainer, { marginBottom: hp(1) }]}>
                                                    {plan.features.map((feature, index) => (
                                                        <Pressable onPress={() => openInfoBottomSheet(feature?.tooltipText)} key={index} style={styles.featureItem}>
                                                            <CheckCircle2
                                                                color="#ffffff"
                                                                fill="#65A30D"
                                                                size={wp(5.5)}
                                                            />

                                                            <View style={styles.featureItemText}>

                                                                <Text style={styles.featureText}>{feature.name}</Text>
                                                                {
                                                                    feature?.link && <Pressable style={styles.link} onPress={() => { handleOpenLink(feature?.link) }}>

                                                                        <Link
                                                                            color="#222"
                                                                            size={wp(3.5)}
                                                                        />
                                                                    </Pressable>
                                                                }

                                                            </View>



                                                        </Pressable>
                                                    ))}
                                                </View>

                                                {
                                                    plan.webFeatures?.length > 0 && <View>

                                                        <Text style={styles.webFeatureTitle}>Web features:</Text>

                                                        <View style={styles.featuresContainer}>
                                                            {plan.webFeatures.map((feature, index) => (
                                                                <Pressable onPress={() => openInfoBottomSheet(feature?.tooltipText)} key={index} style={styles.featureItem}>
                                                                    <CheckCircle2
                                                                        color="#ffffff"
                                                                        fill="#65A30D"
                                                                        size={wp(5.5)}
                                                                    />

                                                                    <View style={styles.featureItemText}>

                                                                        <Text style={styles.featureText}>{feature.name}</Text>
                                                                        {
                                                                            feature?.link && <Pressable style={styles.link} onPress={() => { handleOpenLink(feature?.link) }}>

                                                                                <Link
                                                                                    color="#222"
                                                                                    size={wp(3.5)}
                                                                                />
                                                                            </Pressable>
                                                                        }

                                                                    </View>



                                                                </Pressable>
                                                            ))}
                                                        </View>
                                                    </View>
                                                }



                                            </ScrollView>


                                            {isActive ? (


                                                <View style={{ marginTop: hp(1) }}>


                                                    <Pressable
                                                        style={[styles.ctaButton, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: Colors.primary }]}
                                                        onPress={() => {
                                                            if (isWebPurchase) {

                                                                Linking.openURL('https://wesign.com/pricing');
                                                            } else {

                                                                handleCancelSubscription(plan.productId);
                                                            }
                                                        }}
                                                    >
                                                        <Text style={[styles.ctaText, { color: Colors.primary }]}>Manage Subscription</Text>
                                                    </Pressable>
                                                </View>

                                            ) : (


                                                <View style={{ marginTop: hp(1) }}>
                                                    {/* {isWebPurchase ? (

                                                    <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 10 }}>
                                                        To change your plan, please visit our website.
                                                    </Text>
                                                ) : ( */}
                                                    <LinearGradient
                                                        colors={['#3d6df0', '#2f7bff']}
                                                        style={{ borderRadius: wp(8) }}
                                                    >
                                                        <Pressable
                                                            style={styles.ctaButton}
                                                            onPress={() => {
                                                                if (activePlanId) {

                                                                    upgradeSubscriptionPlan(plan, isWebPurchase);
                                                                } else {

                                                                    buySubscriptionPlan(plan, isWebPurchase);
                                                                }
                                                            }}
                                                        >
                                                            <Text style={styles.ctaText}>
                                                                {activePlanId
                                                                    ? `Upgrade to ${billingCycle}`
                                                                    : (hasTrial ? 'Start 15-days Free Trial' : 'Subscribe Now')
                                                                }
                                                            </Text>
                                                        </Pressable>
                                                    </LinearGradient>
                                                    {/* )} */}
                                                </View>

                                            )}

                                        </View>

                                    </LinearGradient>
                                </View>
                            )
                        })
                    }


                </PagerView>
            </LinearGradient>

            <AppNewBottomSheet ref={infoRef} autoHeight={false} withCloseBtn={false} snapPoints={['20%']} containerStyle={{ paddingBottom: wp(7) }}>
                <View style={styles.infoWrapper}>
                    <View style={styles.infoBadge}>
                        <Info size={fp(2.5)} color={"#222"} />
                        <Text style={styles.InfoText}>Info</Text>

                    </View>

                    <Text style={styles.InfoText}>{infoText}</Text>
                </View>
            </AppNewBottomSheet>

            <SubscriptionSuccessModal
                visible={showSuccessModal}
                onContinue={() => {
                    setShowSuccessModal(false);

                    if (fromRegister) {

                        navigate('Drawer', {
                            screen: 'Home',
                        });
                    } else {
                        goBack()
                    }
                }}
            />
        </CustomSafeAreaView>
    );

}

export default PricingScreen

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
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.1,
        // shadowRadius: 10,
        // elevation: 5,
        overflow: 'hidden'

    },
    activeSubscription: {
        borderWidth: 1.5,
        borderColor: "#4392ff"
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
        marginTop: hp(2),
        marginBottom: hp(1.5),
    },
    priceAmount: {
        fontFamily: Fonts.Medium,
        fontSize: fp(5.4),
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

        marginBottom: hp(3),
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        borderStyle: 'dashed',
        marginBottom: hp(3),
    },
    featuresContainer: {
        marginBottom: hp(3),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    featureItemText: {
        flexDirection: 'row', alignItems: 'center',
        gap: 5
    },

    featureText: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.7),
        color: '#374151',
        marginLeft: wp(3),
    },
    ctaButton: {
        // backgroundColor: '#FCFDF6',
        paddingVertical: hp(2),
        borderRadius: wp(8),
        alignItems: 'center',

        // marginTop: hp(1),
    },
    ctaText: {
        fontFamily: Fonts.Medium,
        fontSize: fp(1.8),
        color: '#fff',
    },
    infoWrapper: {
        gap: hp(2)
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5

    },
    InfoText: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.9),
        color: Colors.text_primary
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
        marginBottom: hp(2)

    }

});