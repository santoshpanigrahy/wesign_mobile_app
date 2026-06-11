import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Crown, CalendarDays, CreditCard, AlertCircle, RefreshCw } from 'lucide-react-native';


import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { navigate } from '@utils/NavigationUtils';

const SubscriptionCard = ({ data }) => {

    const {
        activated_plan_description = 'Unknown Plan',
        is_active = false,
        cancelled = true,
        cancellation_reason = 'Expired',
        start_date,
        nextBillingDate,
        end_date,
        total_amount = 0,
        payment_method = 'unknown',
        currency = 'USD',
        free_trial = true
    } = data || {};


    const getStatusConfig = () => {
        if (is_active) {
            return { label: 'Active', bg: '#DCFCE7', text: '#166534', border: '#bbf7d0' };
        }
        if (cancelled) {
            return { label: 'Expired', bg: '#FEE2E2', text: '#991B1B', border: '#fecaca' };
        }
        return { label: 'Pending', bg: '#FEF3C7', text: '#92400E', border: '#fde68a' };
    };

    const status = getStatusConfig();


    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const getCurrencySymbol = (currencyCode) => {
        const symbols = {
            'USD': '$',
            'INR': '₹',
            'EUR': '€',
            'GBP': '£',
            'AUD': 'A$',
            'CAD': 'C$',
            'JPY': '¥',
        };

        return symbols[currencyCode?.toUpperCase()] || currencyCode || '$';
    };

    const formatPaymentMethod = (method) => {
        if (method === 'google_play') return 'Google Play';
        if (method === 'apple_pay') return 'Apple Pay';
        if (method === 'Card') return 'Credit Card';
        return method;
    };

    return (
        <LinearGradient
            colors={['#FFFFFF', '#FAFAFA']}
            style={styles.cardContainer}
        >

            <View style={styles.header}>
                <View style={styles.planInfo}>
                    <View style={styles.iconContainer}>
                        <Crown color="#EAB308" size={wp(5)} />
                    </View>
                    <View>

                        <Text style={styles.planTitle}>{activated_plan_description}</Text>
                        {/* <Text style={styles.planSubTitle}>Free Trial</Text> */}
                    </View>
                </View>

                <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
                    <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
                </View>

            </View>

            <View style={styles.divider} />

            <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center', justifyContent: 'space-between' }}>

                <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
                    <Text style={styles.amountText}>{total_amount}</Text>
                    <Text style={styles.billingPeriod}>/ total</Text>
                </View>

                {free_trial && (
                    <View style={[styles.badge, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}>
                        <Text style={[styles.badgeText, { color: '#1D4ED8' }]}>Free Trial</Text>
                    </View>
                )}

            </View>


            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                        <CalendarDays color="#6B7280" size={wp(4.5)} />
                        <Text style={styles.detailLabel}>Billing Period</Text>
                    </View>
                    <Text style={styles.detailValue}>
                        {formatDate(start_date)} - {formatDate(end_date)}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                        <CalendarDays color="#6B7280" size={wp(4.5)} />
                        <Text style={styles.detailLabel}>Next Billing Date</Text>
                    </View>
                    <Text style={styles.detailValue}>
                        {formatDate(nextBillingDate)}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                        <CreditCard color="#6B7280" size={wp(4.5)} />
                        <Text style={styles.detailLabel}>Payment Method</Text>
                    </View>
                    <Text style={styles.detailValue}>{formatPaymentMethod(payment_method)}</Text>
                </View>

                {cancelled && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelGroup}>
                            <AlertCircle color="#EF4444" size={wp(4.5)} />
                            <Text style={[styles.detailLabel, { color: '#EF4444' }]}>Reason</Text>
                        </View>
                        <Text style={[styles.detailValue, { color: '#EF4444' }]}>{cancellation_reason}</Text>
                    </View>
                )}
            </View>


            {!is_active ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('Pricing')} style={styles.renewButton}>
                    <RefreshCw color="#FFFFFF" size={wp(4.5)} />
                    <Text style={styles.renewButtonText}>Renew Subscription</Text>
                </TouchableOpacity>
            ) : <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('Pricing')} style={styles.renewButton}>
                <Crown color="#FFFFFF" size={wp(4.5)} />
                <Text style={styles.renewButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: wp(6),
        padding: wp(5),
        marginHorizontal: wp(4),
        marginVertical: hp(1.5),
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2.5),
    },
    iconContainer: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: '#FEF9C3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planTitle: {
        fontFamily: Fonts.SemiBold,
        fontSize: fp(2.2),
        color: '#111827',
    },
    planSubTitle: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.4),
        color: Colors.text_secondary,
    },
    badge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(4),
        borderWidth: 1,
    },
    badgeText: {
        fontFamily: Fonts.Medium,
        fontSize: fp(1.4),
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: hp(2),
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: hp(2.5),
    },
    currencySymbol: {
        fontFamily: Fonts.SemiBold,
        fontSize: fp(4.5),
        color: '#111827',
    },
    amountText: {
        fontFamily: Fonts.Bold,
        fontSize: fp(4.5),
        color: '#111827',
        marginHorizontal: wp(1),
    },
    billingPeriod: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.6),
        color: '#6B7280',
    },
    detailsContainer: {
        gap: hp(1.5),
        marginBottom: hp(3),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    detailLabel: {
        fontFamily: Fonts.Medium,
        fontSize: fp(1.7),
        color: '#4B5563',
    },
    detailValue: {
        fontFamily: Fonts.SemiBold,
        fontSize: fp(1.7),
        color: '#1F2937',
    },
    renewButton: {
        backgroundColor: '#2563EB', // A sharp, modern blue
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(1.8),
        borderRadius: wp(10),
        gap: wp(2),
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    renewButtonText: {
        fontFamily: Fonts.Medium,
        fontSize: fp(1.8),
        color: '#FFFFFF',
    },
});

export default SubscriptionCard;