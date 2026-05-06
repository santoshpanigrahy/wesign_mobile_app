import React, { useCallback, useEffect, useState, memo, useRef } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    Pressable
} from 'react-native';
import {
    Search,
    Users,
    EllipsisVertical,
    Calendar,
    AlertCircle,
    ArrowLeft,
    CircleX,
    Copy,
    Download,
    MailOpen,
    Ban,
    Trash
} from 'lucide-react-native';
import moment from 'moment';

// Project specific imports
import { Colors, Fonts, fp, hp, STATUS_CONFIG, wp } from '@utils/Constants';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import api from '@utils/api';
import Skeleton from '@components/Skeleton';
import { goBack, navigate } from '@utils/NavigationUtils';
import AppBottomSheet from '@components/AppBottomSheet';
import AppActionButton from '@components/AppActionButton';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import Toast from 'react-native-toast-message';
import DownloadModal from './DownloadModal';
import DeleteEnvelopeModal from './DeleteEnvelopeModal';
import NoDataFound from '@components/NoDataFound';
import DrawerHeader from '@components/DrawerHeader';

// --- Sub-Component: Memoized List Item ---
const EnvelopeItem = memo(({ item, onDetails, onAction }) => {
    const statusKey = item.signed_status?.toLowerCase();
    const status = STATUS_CONFIG[statusKey] || {
        label: item.signed_status,
        color: "#999",
        icon: AlertCircle,
    };
    const Icon = status.icon;

    return (
        <TouchableOpacity style={styles.card} onPress={() => onDetails(item)}>
            <View style={{ flex: 1 }}>
                <Text style={styles.subject} numberOfLines={1}>
                    {item.subject || 'No Subject'}
                </Text>

                <View style={styles.recipientRow}>
                    <Users color={Colors.text_primary} size={fp(1.7)} />
                    <Text style={styles.recipients} numberOfLines={1}>
                        {item.recipients || 'No recipients'}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: status.color + "20" }]}>
                        <Icon size={fp(1.7)} color={status.color} />
                        <Text style={[styles.badgeText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.dateRow}>
                        <Calendar size={fp(1.8)} color={Colors.text_secondary} />
                        <Text style={styles.dateText}>
                            {moment(item.last_changed).format("DD MMM YYYY hh:mm A")}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionColumn}>
                <TouchableOpacity style={styles.iconWrapper} onPress={() => onAction(item)}>
                    <EllipsisVertical color={Colors.text_primary} size={fp(2.5)} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});


// --- Main Screen Component ---
const SentScreen = ({ navigation }) => {

    const actionRef = useRef(null);
    const user = useAppSelector(state => state?.auth?.user);
    const dispatch = useAppDispatch();

    const { id: userId, email } = user || {};
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleDownloadConfirm = (options) => {
        console.log("Download Options selected:", options);
        // Add logic here to download the files based on options selected
        setModalVisible(false);
    };


    const handleDelete = async () => {


        if (!selectedEnvelope) return;
        try {
            dispatch(showLoader('Loading'));

            const ids = [selectedEnvelope?.id];

            const response = await api.delete(
                `/api/envelope`,
                {
                    data: { id: ids },

                }
            );

            dispatch(hideLoader());

            if (response.data.status_code === 200) {
                setDeleteModalVisible(false);

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data.message,
                });

                const finalData = data?.filter(envelope => envelope?.id !== selectedEnvelope?.id);
                setData(finalData)


            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message,
                });
            }
        } catch (error) {


            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });

            console.log(error);
        } finally {
            dispatch(hideLoader());
        }


    };

    // States
    const [data, setData] = useState([]);
    const [pageNo, setPageNo] = useState(1);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [totalCount, setTotalCount] = useState(0);


    // Fetch Logic
    const fetchData = async (pageNum = 1, isRefreshing = false) => {

        if (loading && !isRefreshing) return;

        setLoading(true);
        try {
            const requestData = {
                user: userId
            };

            const res = await api.post(`/api/sent/envelope?page=${pageNum}`, requestData);
            const envelopes = res?.data?.envelope || [];
            const count = res?.data?.total_count || 0;

            setTotalCount(count);

            const formatted = envelopes.map((item) => ({
                id: item.id,
                subject: item.subject,
                signed_status: item.signed_status,
                recipients: (item.envelope_recepients || []).map(r => r.recepient_name).join(", "),
                last_changed: item.last_changed
            }));


            setData(prev => {

                if (pageNum === 1) return formatted;


                const existingIds = new Set(prev.map(item => item.id));
                const uniqueNewItems = formatted.filter(item => !existingIds.has(item.id));

                return [...prev, ...uniqueNewItems];
            });

            setPageNo(pageNum);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setFirstLoading(false);
        }
    };



    const handleSearch = async (pageNum = 1) => {

        console.log(pageNum);
        try {
            setLoading(true);





            console.log(`/api/envelope/sent/search?query=${search.trim()}&user=${userId}`)


            const response = await api(`/api/envelope/sent/search?query=${search.trim()}&user=${userId}&from_date=&to_date=&status=&page=${pageNum}`);



            if (response.data.status_code === 200) {




                const envelopes = response?.data?.result || [];
                const count = response?.data?.count || 0;

                setTotalCount(count);

                const formatted = envelopes.map((item) => ({
                    id: item.id,
                    subject: item.subject,
                    signed_status: item.signed_status,
                    recipients: (item.envelope_recepients || []).map(r => r.recepient_name).join(", "),
                    last_changed: item.last_changed
                }));


                setData(prev => {

                    if (pageNum === 1) return formatted;


                    const existingIds = new Set(prev.map(item => item.id));
                    const uniqueNewItems = formatted.filter(item => !existingIds.has(item.id));

                    return [...prev, ...uniqueNewItems];
                });

                setPageNo(pageNum);


            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            setLoading(false);

            console.log('Search Error:', error);

            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
            setFirstLoading(false);
            setRefreshing(false);
        }
    };

    const [selectedEnvelope, setSelectedEnvelope] = useState(null);
    const emailDownload = async () => {

        if (!selectedEnvelope) return;

        actionRef?.current?.close();
        try {
            dispatch(showLoader('Loading'));

            const request_data = {
                envelope: selectedEnvelope?.id,
                email: email,
                user: userId,
            };

            const response = await api.post(
                `/download/envelope`,
                request_data
            );



            if (response.data.status === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data.message,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message,
                });
            }
        } catch (error) {


            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });

            console.log(error);
        } finally {
            dispatch(hideLoader());
        }
    };


    const voidEnvelope = async () => {
        if (!selectedEnvelope) return

        actionRef?.current?.close();

        try {
            dispatch(showLoader('Loading'));
            console.log(`/api/envelope/mark/void?id=${selectedEnvelope?.id}&user=${userId}`)


            const response = await api.get(
                `/api/envelope/mark/void?id=${selectedEnvelope?.id}&user=${userId}`
            );

            console.log(response)

            if (response.data.status === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data.message,
                });

                fetchData(pageNo)
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message,
                });
            }
        } catch (error) {


            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });

            console.log(error);
        } finally {
            dispatch(hideLoader());
        }
    };



    const onRefresh = useCallback(() => {
        setData([]);
        setRefreshing(true);
        setFirstLoading(true);

        if (search !== '') {

            handleSearch(1);
        } else {

            fetchData(1, true);
        }
    }, [userId]);

    useEffect(() => {
        setFirstLoading(true);

        fetchData(1);
    }, []);

    const reset = () => {
        setData([]);
        setSearch('');
        setFirstLoading(true);
        fetchData(1);


    }

    const handleKeyBoardSearchDone = () => {

        setData([]);


        setFirstLoading(true);


        if (search !== '') {
            handleSearch(1);
        } else {

            fetchData(1, true);
        }

    }

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

    const handleDetails = useCallback((item) => {
        navigate('EnvelopeDetails', { id: item.id });
    }, []);

    const handleAction = useCallback((item) => {
        setSelectedEnvelope(item);
        actionRef?.current?.snapToIndex(0);
    }, []);

    const renderItem = useCallback(({ item }) => (
        <EnvelopeItem item={item} onDetails={handleDetails} onAction={handleAction} />
    ), [handleDetails]);

    const renderSkeleton = () => (
        <View style={styles.cardRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} style={styles.skeletonCard} />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <DownloadModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onDownload={handleDownloadConfirm}
            />

            <DeleteEnvelopeModal
                isVisible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={handleDelete}
            />
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={goBack}><ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} /></TouchableOpacity>
                <Text style={styles.title}>Sent</Text>


            </View> */}

            <DrawerHeader navigation={navigation} title="Sent" />


            <View style={styles.inner}>

                <View style={styles.searchBar}>
                    <Search color={Colors.text_primary} size={fp(2.5)} />
                    <TextInput
                        placeholder="Search here..."
                        placeholderTextColor={Colors.text_secondary}
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        onSubmitEditing={() => handleKeyBoardSearchDone()}
                        returnKeyType="done"
                    />
                    {
                        search && <Pressable onPress={reset}>

                            <CircleX color={Colors.text_secondary} size={fp(2.5)} />
                        </Pressable>
                    }

                </View>

                {
                    !firstLoading && data.length === 0 && <NoDataFound />
                }


                {firstLoading && data.length === 0 ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        onEndReached={loadMore}

                        onEndReachedThreshold={0.2}
                        contentContainerStyle={styles.listContent}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListFooterComponent={
                            loading && data.length > 0 ? (
                                <ActivityIndicator color={Colors.text_primary} style={{ margin: 20 }} />
                            ) : null
                        }
                    />
                )}
            </View>

            <AppBottomSheet ref={actionRef} snapPoints={['20%']} withCloseBtn={false}>

                <View style={{ flex: 1 }}>
                    {/* <AppActionButton btnText='Copy' icon={Copy} onPress={() => console.log('Copy Pressed')} /> */}
                    {/* <AppActionButton btnText='Download' icon={Download} onPress={() => { actionRef?.current?.close(); setModalVisible(true); }} /> */}
                    <AppActionButton btnText='Email Download' icon={MailOpen} onPress={emailDownload} />
                    <AppActionButton btnText='Void' icon={Ban} onPress={() => voidEnvelope()} />
                    <AppActionButton btnText='Delete' icon={Trash} onPress={() => { actionRef?.current?.close(); setDeleteModalVisible(true) }} />
                </View>


            </AppBottomSheet>


        </View>
    );
};

export default SentScreen;

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
        marginVertical: hp(1),
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
        gap: hp(1.5),
    },
    card: {
        backgroundColor: Colors.white,
        flexDirection: 'row',
        borderWidth: 1,
        padding: wp(4),
        borderColor: Colors.border,
        borderRadius: wp(3),
    },
    subject: {
        fontSize: fp(1.9),
        fontFamily: Fonts.SemiBold,
        color: Colors.text_primary,
    },
    recipientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        marginTop: wp(1),
    },
    recipients: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Regular,
        color: Colors.text_secondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: "center",
        gap: wp(3),
        marginTop: wp(3),
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(1),
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
        borderRadius: wp(5),
        minWidth: wp(22),
    },
    badgeText: {
        fontSize: fp(1.4),
        fontFamily: Fonts.Medium,
    },
    verticalDivider: {
        height: hp(2),
        width: 1,
        backgroundColor: Colors.border,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: 'center',
        gap: wp(1),
    },
    dateText: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.5),
        color: Colors.text_secondary,
    },
    actionColumn: {
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: wp(2),
    },
    iconWrapper: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonCard: {
        width: '100%',
        borderRadius: wp(3),
        height: hp(13),
        marginBottom: hp(1.5),
    },
    cardRow: {
        flex: 1,
    },
    title: { fontSize: fp(2.2), fontFamily: Fonts.SemiBold, color: Colors.text_primary, letterSpacing: 0.5 },
    header: { height: hp(7), flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(5), backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, gap: wp(5) },

});