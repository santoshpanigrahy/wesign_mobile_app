import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Pressable,
    Linking,
    Platform
} from 'react-native';
import api from '@utils/api';
import CustomSafeAreaView from '@components/CustomSafeAreaView';


import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, CheckCircle2, Info, Link } from 'lucide-react-native';

// User defined utilities
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { pricingData } from '@utils/pricingData';
import AppBottomSheet from '@components/AppBottomSheet';
import AppNewBottomSheet from '@components/AppNewBottomSheet';
import { goBack } from '@utils/NavigationUtils';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { useRoute } from '@react-navigation/native';

import * as RNIap from 'react-native-iap';
import { Alert } from 'react-native';

const SUBSCRIPTION_IDS = ['ws_personal_test', 'ws_business_test', 'ws_enterprise_test'];
const IS_ANDROID = Platform.OS === 'android';


const PricingScreen = () => {
    const userId = useAppSelector(state => state.auth.user?.id);


    console.log(userId)

    const route = useRoute();

    const { fromRegister } = route.params || {};
    console.log('From Register=======> ', fromRegister)

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






    useEffect(() => {
        let purchaseUpdateSubscription;
        let purchaseErrorSubscription;

        const initIAP = async () => {
            try {
                await RNIap.initConnection();
                if (IS_ANDROID) {
                    await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
                }
                const items = await RNIap.getSubscriptions({ skus: SUBSCRIPTION_IDS });


                const groupedItems: any = items?.map(plan => {

                    const pricingInfo = pricingData.find(
                        item =>
                            item.skuDataId ===
                            plan.productId
                    );
                    return { ...plan, ...pricingInfo }
                })
                setSubscriptions(groupedItems);
                console.log(groupedItems)
            } catch (e) {
                console.error('IAP Init Error:', e);
            } finally {
                setLoading(false);
            }
        };

        initIAP();

        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async purchase => {
            try {
                const response = await fetch('https://dev.wesign.com/auth/play/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        purchaseToken: purchase.purchaseToken,
                        productId: purchase.productId,
                    }),
                });

                console.log(response)

                if (!response.ok) throw new Error('Verification failed');

                await RNIap.finishTransaction({ purchase, isConsumable: false });
                Alert.alert('Success', 'Subscription activated successfully!');
            } catch (e) {
                Alert.alert('Verification Error', 'Failed to validate transaction.');
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

    const buySubscriptionPlan = async (product, basePlanId) => {
        try {
            const matchingOffers = product.subscriptionOfferDetails?.filter(
                offer => offer.basePlanId.toLowerCase() === basePlanId.toLowerCase()
            );

            if (!matchingOffers || matchingOffers.length === 0) {
                Alert.alert('Error', `No configurations found for ${basePlanId}`);
                return;
            }

            // Prioritize the free trial offer token
            const trialOffer = matchingOffers.find(offer =>
                offer.pricingPhases?.pricingPhaseList?.some(
                    phase => phase.priceAmountMicros === '0' || phase.priceAmountMicros === 0
                )
            );

            const chosenOffer = trialOffer || matchingOffers[0];
            const offerToken = chosenOffer?.offerToken;

            await RNIap.requestSubscription({
                sku: product.productId,
                ...(IS_ANDROID && {
                    subscriptionOffers: [{ sku: product.productId, offerToken }],
                }),
                // obfuscatedAccountId: userId.toString(),
            });
        } catch (error) {
            if (error.code !== 'E_USER_CANCELLED') {
                Alert.alert('Checkout Error', error?.message);
            }
        }
    };

    return (
        <CustomSafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#E5E7EB', '#D1D5DB']} // Background screen gradient
                style={styles.container}>

                {/* Header Section */}
                <View style={styles.header}>
                    {
                        !fromRegister && <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
                            <ArrowLeft color="#333" size={wp(6)} />
                        </TouchableOpacity>
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

                {/* Title & Pagination Indicators */}
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

                {/* PagerView for Pricing Cards */}
                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={(e) => setActivePage(e.nativeEvent.position)}>

                    {
                        subscriptions?.map((plan, index) => {

                            const activeOffers = plan?.subscriptionOfferDetails?.filter(
                                offer => offer.basePlanId.toLowerCase() === billingCycle.toLowerCase()
                            );

                            if (!activeOffers || activeOffers.length === 0) return <View></View>;

                            const hasTrial = activeOffers.some(offer =>
                                offer.pricingPhases?.pricingPhaseList?.some(
                                    phase => phase.priceAmountMicros === '0' || phase.priceAmountMicros === 0
                                )
                            );

                            const standardOffer = activeOffers.find(offer =>
                                !offer.pricingPhases?.pricingPhaseList?.some(phase => phase.priceAmountMicros === '0')
                            ) || activeOffers[0];

                            const standardPricePhase = standardOffer?.pricingPhases?.pricingPhaseList?.find(
                                phase => phase.priceAmountMicros !== '0' && phase.priceAmountMicros !== 0
                            );

                            const price = standardPricePhase?.formattedPrice || '$4.99'; // Fallback to image value

                            return (
                                <View key={index + 1} style={styles.page}>
                                    <LinearGradient
                                        colors={['#FFFFFF', '#FDF8EA']} // Subtle warm gradient for the card
                                        style={styles.cardContainer}>


                                        {/* Card Header & Badge */}
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.planTitle}>{`${plan?.title} ${billingCycle} plan`}</Text>
                                            <View style={styles.badgeContainer}>
                                                <Text style={styles.badgeText}>{getBadgeText()}</Text>
                                                <View style={styles.badgeDot} />
                                            </View>
                                        </View>

                                        {/* Pricing Area */}
                                        <View style={styles.pricingRow}>
                                            <Text style={styles.priceAmount}>{price}</Text>
                                            <View style={styles.priceDetails}>
                                                <Text style={styles.priceSubtext}>/ month (INR)</Text>
                                                {/* {

                                                    billingCycle !== 'monthly' && <Text style={styles.priceSubtext}>{getFinalPrice(plan?.price)?.subText}</Text>

                                                } */}
                                            </View>
                                        </View>

                                        {/* Description */}
                                        <Text style={styles.planDescription}>
                                            {plan?.description}
                                        </Text>

                                        {/* Dotted Divider */}
                                        <View style={styles.divider} />

                                        {/* Features List */}
                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            <View style={[styles.featuresContainer, { marginBottom: hp(1) }]}>
                                                {plan.features.map((feature, index) => (
                                                    <TouchableOpacity activeOpacity={0.7} onPress={() => openInfoBottomSheet(feature?.tooltipText)} key={index} style={styles.featureItem}>
                                                        <CheckCircle2
                                                            color="#ffffff"
                                                            fill="#65A30D" // Solid green check background
                                                            size={wp(5.5)}
                                                        />

                                                        <View style={styles.featureItemText}>

                                                            <Text style={styles.featureText}>{feature.name}</Text>
                                                            {
                                                                feature?.link && <Pressable style={styles.link} onPress={(e) => { e.stopPropagation(); handleOpenLink(feature?.link) }}>

                                                                    <Link
                                                                        color="#222"
                                                                        size={wp(3.5)}
                                                                    />
                                                                </Pressable>
                                                            }

                                                        </View>



                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            {
                                                plan.webFeatures?.length > 0 && <View>

                                                    <Text style={styles.webFeatureTitle}>Web features:</Text>

                                                    <View style={styles.featuresContainer}>
                                                        {plan.webFeatures.map((feature, index) => (
                                                            <TouchableOpacity activeOpacity={0.7} onPress={() => openInfoBottomSheet(feature?.tooltipText)} key={index} style={styles.featureItem}>
                                                                <CheckCircle2
                                                                    color="#ffffff"
                                                                    fill="#65A30D" // Solid green check background
                                                                    size={wp(5.5)}
                                                                />

                                                                <View style={styles.featureItemText}>

                                                                    <Text style={styles.featureText}>{feature.name}</Text>
                                                                    {
                                                                        feature?.link && <Pressable style={styles.link} onPress={(e) => { e.stopPropagation(); handleOpenLink(feature?.link) }}>

                                                                            <Link
                                                                                color="#222"
                                                                                size={wp(3.5)}
                                                                            />
                                                                        </Pressable>
                                                                    }

                                                                </View>



                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>
                                            }



                                        </ScrollView>

                                        {/* Action Button */}

                                        <LinearGradient
                                            colors={['#3d6df0', '#2f7bff']}
                                            style={{ borderRadius: wp(8), marginTop: hp(1) }}
                                        // Subtle warm gradient for the card
                                        >
                                            <TouchableOpacity style={styles.ctaButton} onPress={() => buySubscriptionPlan(plan, billingCycle)}>
                                                <Text style={styles.ctaText}>{hasTrial ? 'Start 15-days Free Trial' : 'Subscribe Now'}</Text>
                                            </TouchableOpacity>

                                        </LinearGradient>

                                    </LinearGradient>
                                </View>
                            )
                        })
                    }


                </PagerView>
            </LinearGradient>

            <AppNewBottomSheet ref={infoRef} withCloseBtn={false} containerStyle={{ paddingBottom: wp(7) }}>
                <View style={styles.infoWrapper}>
                    <View style={styles.infoBadge}>
                        <Info size={fp(2.5)} color={"#222"} />
                        <Text style={styles.InfoText}>Info</Text>

                    </View>

                    <Text style={styles.InfoText}>{infoText}</Text>
                </View>
            </AppNewBottomSheet>
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
        backgroundColor: '#FACC15', // Yellow accent
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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