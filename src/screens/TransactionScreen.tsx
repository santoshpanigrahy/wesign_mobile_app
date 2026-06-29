import React, { useCallback, useEffect, useState, memo } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Linking,
    Pressable
} from 'react-native';
import {
    Search,
    CircleX,
    CreditCard,
    DownloadCloud,
    CheckCircle2,
    Clock,
    FileText,
    AlertCircle
} from 'lucide-react-native';
import moment from 'moment';

import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import DrawerHeader from '@components/DrawerHeader';
import NoDataFound from '@components/NoDataFound';
import Skeleton from '@components/Skeleton';
import api from '@utils/api';
import { useAppSelector } from '@redux/hooks';
import Toast from 'react-native-toast-message';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import BackHeader from '@components/BackHeader';
import { goBack, navigate } from '@utils/NavigationUtils';

// Modern Color Accents for Fire Pass
const ACCENT_PURPLE = '#6C5CE7';
const ACCENT_BLUE = '#0984E3';
const ACCENT_GOLD = '#FDCB6E';
const SUCCESS_GREEN = '#00B894';

const TransactionItem = memo(({ item }) => {
    const formattedAmount = (item.amount / 100).toFixed(2);
    const formattedDate = moment(item.created * 1000).format("DD MMM YYYY, hh:mm A");

    const isSuccess = item.status === 'succeeded';

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

    const handleDownloadInvoice = async () => {
        if (item.invoice_receipt) {
            try {
                navigate('WebView', { url: item.invoice_receipt, screenName: "Transaction Receipt" });

            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Download Failed',
                    text2: 'Could not open the invoice receipt.'
                });
            }
        } else {
            Toast.show({
                type: 'info',
                text1: 'Not Available',
                text2: 'No invoice receipt available for this transaction.'
            });
        }
    };

    return (
        <View style={styles.card}>
            <View style={[{ backgroundColor: isSuccess ? SUCCESS_GREEN : ACCENT_PURPLE }]} />

            <View style={styles.cardContent}>
                <View style={[styles.rowBetween, { marginBottom: hp(1) }]}>

                    {/* <View style={[styles.statusBadge, { backgroundColor: `${ACCENT_PURPLE}15` }]}>  <Text style={[styles.statusText, { color: ACCENT_PURPLE }]}>
                        {item.plan}
                    </Text></View> */}

                    <View style={[styles.statusBadge, { backgroundColor: isSuccess ? `${SUCCESS_GREEN}15` : `${ACCENT_PURPLE}15` }]}>
                        {isSuccess ? (
                            <CheckCircle2 size={fp(1.4)} color={SUCCESS_GREEN} />
                        ) : (
                            <AlertCircle size={fp(1.4)} color={ACCENT_PURPLE} />
                        )}
                        <Text style={[styles.statusText, { color: isSuccess ? SUCCESS_GREEN : ACCENT_PURPLE }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>

                    <View></View>


                </View>
                <View style={styles.rowBetween}>
                    <View style={styles.idContainer}>
                        <FileText size={fp(1.8)} color={ACCENT_BLUE} />
                        <Text style={styles.transactionId} numberOfLines={1} ellipsizeMode="middle">
                            {item.transaction_id}
                        </Text>
                    </View>

                </View>

                <View style={[styles.rowBetween, styles.marginVertical10]}>
                    <Text style={styles.amountText}>
                        {getCurrencySymbol(item?.currency)}{formattedAmount} <Text style={styles.currencyText}>{item?.currency}</Text>
                    </Text>
                    <View style={styles.dateContainer}>
                        <Clock size={fp(1.6)} color={Colors.text_secondary} />
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.rowBetween}>
                    <View style={styles.methodContainer}>
                        {
                            item?.platform === 'google' ? <>

                                <Text style={styles.methodText}>
                                    Google Play
                                </Text>
                            </>
                                : <>
                                    <CreditCard size={fp(2)} color={Colors.text_secondary} />

                                    <Text style={styles.methodText}>
                                        **** {item.payment_method_details?.card?.last4 || item.last4 || 'N/A'}
                                    </Text>
                                </>

                        }

                        <View style={styles.dot} />
                        <Text style={styles.typeText}>{item.action}</Text>
                    </View>

                    {
                        item?.invoice_receipt && <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={handleDownloadInvoice}
                            activeOpacity={0.7}
                        >
                            <DownloadCloud size={fp(2)} color={Colors.white} />
                            <Text style={styles.downloadText}>Invoice</Text>
                        </TouchableOpacity>
                    }

                </View>
            </View>
        </View>
    );
});

const TransactionScreen = ({ navigation }) => {
    const user = useAppSelector(state => state?.auth?.user);
    console.log(user)
    const { id: userId, customer_id } = user || {};

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchData = async (pageNum = 1, isRefreshing = false) => {
        if (loading && !isRefreshing) return;
        // `auth/transaction/history/${'cus_RMoi0h7eWSx3s4'}?source=all`

        setLoading(true);
        try {
            // Replace with your actual endpoint
            const res = await api.get(
                `auth/transaction/history/${customer_id}?source=all`
            );
            const transactions = res?.data?.transaction || []; // using the provided JSON key
            const count = res?.data?.total_count || transactions.length;

            console.log("transca", transactions)

            setTotalCount(count);

            setData(prev => {
                if (pageNum === 1) return transactions;
                const existingIds = new Set(prev.map(item => item.transaction_id));
                const uniqueNewItems = transactions.filter(item => !existingIds.has(item.transaction_id));
                return [...prev, ...uniqueNewItems];
            });

            setPageNo(pageNum);
        } catch (error) {
            console.error("Fetch Error:", error);
            // Fallback for demonstration based on the provided JSON structure
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch transaction history.',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setFirstLoading(false);
        }
    };

    const handleSearch = async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/transactions/search?query=${search.trim()}&user=${817}&page=${pageNum}&source=google`);

            if (response.data.status_code === 200) {
                const transactions = response?.data?.result || [];
                setTotalCount(response?.data?.count || 0);

                setData(prev => {
                    if (pageNum === 1) return transactions;
                    const existingIds = new Set(prev.map(item => item.transaction_id));
                    const uniqueNewItems = transactions.filter(item => !existingIds.has(item.transaction_id));
                    return [...prev, ...uniqueNewItems];
                });
                setPageNo(pageNum);
            }
        } catch (error) {
            console.log('Search Error:', error);
        } finally {
            setLoading(false);
            setFirstLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setFirstLoading(true);
        if (search !== '') {
            handleSearch(1);
        } else {
            fetchData(1, true);
        }
    }, [search, userId]);

    const resetSearch = () => {
        setSearch('');
        setFirstLoading(true);
        fetchData(1);
    };

    const handleKeyBoardSearchDone = () => {
        setFirstLoading(true);
        if (search !== '') {
            handleSearch(1);
        } else {
            fetchData(1, true);
        }
    };

    const loadMore = () => {
        const hasMore = data.length < totalCount;
        if (!loading && !refreshing && hasMore) {
            if (search !== '') {
                handleSearch(pageNo + 1);
            } else {
                fetchData(pageNo + 1);
            }
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const renderSkeleton = () => (
        <View style={styles.cardRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} style={styles.skeletonCard} />
            ))}
        </View>
    );

    return (
        <CustomSafeAreaView>
            <BackHeader screenName='Transaction History' goBack={goBack} />
            <View style={styles.inner}>

                {/* {!firstLoading && data.length === 0 && (
                    <NoDataFound message="No transactions found." />
                )} */}

                {firstLoading && data.length === 0 ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.created}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.2}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<View style={{ paddingTop: hp(6) }}><NoDataFound message="No transactions found." /></View>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT_PURPLE} />
                        }
                        ListFooterComponent={
                            loading && data.length > 0 ? (
                                <ActivityIndicator color={ACCENT_PURPLE} style={{ margin: 20 }} />
                            ) : null
                        }
                    />
                )}
            </View>
        </CustomSafeAreaView>
    );
};

export default TransactionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background_light,
    },
    inner: {
        flex: 1,
        paddingHorizontal: wp(5),
        paddingVertical: wp(2),
    },
    searchBar: {
        flexDirection: "row",
        height: hp(6),
        borderWidth: 1,
        borderColor: Colors.border,
        marginVertical: hp(1.5),
        borderRadius: wp(10),
        paddingHorizontal: wp(4),
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    searchInput: {
        flex: 1,
        marginLeft: wp(2),
        fontFamily: Fonts.Regular,
        fontSize: fp(1.8),
        color: Colors.text_primary,
    },
    listContent: {
        paddingBottom: hp(5),
        paddingTop: hp(1),
        gap: hp(2),
    },
    card: {
        backgroundColor: Colors.white,
        flexDirection: 'row',
        borderRadius: wp(4),

        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },

    cardContent: {
        flex: 1,
        padding: wp(4),
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    marginVertical10: {
        marginVertical: hp(1.2),
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        flex: 1,
        paddingRight: wp(2),
    },
    transactionId: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Medium,
        color: Colors.text_secondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        paddingHorizontal: wp(2.5),
        paddingVertical: wp(1),
        borderRadius: wp(5),
    },
    statusText: {
        fontSize: fp(1.4),
        fontFamily: Fonts.SemiBold,
    },
    amountText: {
        fontSize: fp(2.6),
        fontFamily: Fonts.Bold,
        color: Colors.text_primary,
    },
    currencyText: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Medium,
        color: Colors.text_secondary,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
    },
    dateText: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: Colors.text_secondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginBottom: hp(1.5),
    },
    methodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    methodText: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Medium,
        color: Colors.text_primary,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.text_secondary,
    },
    typeText: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: Colors.text_secondary,
        textTransform: 'capitalize',
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ACCENT_BLUE,
        paddingHorizontal: wp(3.5),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
        gap: wp(1.5),
    },
    downloadText: {
        color: Colors.white,
        fontFamily: Fonts.Medium,
        fontSize: fp(1.5),
    },
    skeletonCard: {
        width: '100%',
        borderRadius: wp(4),
        height: hp(16),
        marginBottom: hp(2),
    },
    cardRow: {
        flex: 1,
    },
});