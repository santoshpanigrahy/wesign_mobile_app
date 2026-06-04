import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Platform,
    SafeAreaView,
} from 'react-native';
import * as RNIap from 'react-native-iap';

const SUBSCRIPTION_IDS = ['ws_personal_test', 'ws_business_test', 'ws_enterprise_test'];
const IS_ANDROID = Platform.OS === 'android';
const INTERVALS = ['Monthly', 'Quarterly', 'Yearly'];

const SubscriptionScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);
    const [activeInterval, setActiveInterval] = useState("ws-personal-test");

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
                setSubscriptions(items);
                console.log(items)
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
                        purchaseToken: purchase.purchaseToken,
                        productId: purchase.productId,
                    }),
                });

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
            });
        } catch (error) {
            if (error.code !== 'E_USER_CANCELLED') {
                Alert.alert('Checkout Error', error?.message);
            }
        }
    };

    const getTierName = (productId) => {
        if (productId.includes('personal')) return 'Personal';
        if (productId.includes('business') || productId.includes('bussiness')) return 'Business';
        if (productId.includes('enterprise')) return 'Enterprise';
        return 'Premium';
    };

    // Mock features matching the exact document management list in 1000450020.jpg
    const getFeaturesList = (tier) => {
        return [
            'Single user/license',
            `Send ${tier === 'Personal' ? '100' : 'Unlimited'} documents per month`,
            'Single Channel Email Delivery',
            'Real-time tracking and notifications',
            'Envelope Ordering  🔗',
            'Basic & Pre-filled fields  🔗',
            'Access Code',
            'Reminders & Private Messaging  🔗',
        ];
    };

    const renderPlanCard = ({ item }) => {
        const activeOffers = item.subscriptionOfferDetails?.filter(
            offer => offer.basePlanId.toLowerCase() === activeInterval.toLowerCase()
        );

        if (!activeOffers || activeOffers.length === 0) return null;

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
        const tierName = getTierName(item.productId);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.tierTitle}>{tierName}</Text>
                    {tierName === 'Personal' && (
                        <View style={styles.popularBadge}>
                            <View style={styles.greenDot} />
                            <Text style={styles.popularText}>Popular</Text>
                        </View>
                    )}
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>{price}</Text>
                    <Text style={styles.intervalLabel}> / month (USD)</Text>
                </View>

                <Text style={styles.desc}>
                    {item.description || 'Easy digital signing for individuals to send, track, and manage documents securely from anywhere online.'}
                </Text>

                <View style={styles.divider} />

                {/* Features List with green checkmarks */}
                <View style={styles.featuresContainer}>
                    {getFeaturesList(tierName).map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <Text style={styles.checkmark}>✓</Text>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={() => buySubscriptionPlan(item, activeInterval)}>
                    <Text style={styles.subscribeButtonText}>
                        {hasTrial ? 'Start 30-days Free Trial' : 'Subscribe Now'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0066ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar with Back Navigation and Custom Tab Group */}
            <View style={styles.topNavigationRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <View style={styles.tabContainer}>
                    {INTERVALS.map((interval) => (
                        <TouchableOpacity
                            key={interval}
                            style={[
                                styles.tabButton,
                                activeInterval === interval && styles.activeTabButton
                            ]}
                            onPress={() => setActiveInterval(interval)}>
                            <Text style={[
                                styles.tabButtonText,
                                activeInterval === interval && styles.activeTabButtonText
                            ]}>
                                {interval}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Pricing Title Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.screenHeader}>Pricing</Text>
                <View style={styles.paginationDots}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            <FlatList
                data={subscriptions}
                keyExtractor={item => item.productId}
                renderItem={renderPlanCard}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef1f6', // Light grayish canvas tint matching 1000450020.jpg
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eef1f6',
    },
    topNavigationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 20,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 4,
        flex: 1,
        marginLeft: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTabButton: {
        backgroundColor: '#323338', // Dark charcoal capsule background from image
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#71717a',
    },
    activeTabButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginVertical: 20,
    },
    screenHeader: {
        fontSize: 32,
        fontWeight: '500',
        color: '#2d3142',
    },
    paginationDots: {
        flexDirection: 'row',
    },
    dot: {
        width: 14,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#b0b5c1',
        marginLeft: 4,
    },
    activeDot: {
        backgroundColor: '#f9c22e', // Yellow status indicator line
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fffdf9', // Clean off-white soft background
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tierTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1f36',
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f5f8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4caf50',
        marginRight: 6,
    },
    popularText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4a5568',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 16,
    },
    priceValue: {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#1a202c',
    },
    intervalLabel: {
        fontSize: 16,
        color: '#718096',
    },
    desc: {
        fontSize: 14,
        color: '#4a5568',
        lineHeight: 22,
        marginBottom: 20,
    },
    divider: {
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderColor: '#cbd5e0',
        marginBottom: 20,
    },
    featuresContainer: {
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    checkmark: {
        color: '#ffffff',
        backgroundColor: '#4caf50', // Solid green circular checks
        width: 20,
        height: 20,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 12,
        overflow: 'hidden',
        lineHeight: 20,
        marginRight: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#2d3748',
    },
    subscribeButton: {
        backgroundColor: '#1a73e8', // Accurate rich operational blue element
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});