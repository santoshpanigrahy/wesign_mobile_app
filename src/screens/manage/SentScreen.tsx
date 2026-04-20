import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Colors, Fonts, fp, hp, STATUS_CONFIG, wp } from '@utils/Constants';
import {
    Rocket,
    Clock,
    Timer,
    CheckCircle2,
    FileSignature, ArrowRight,
    Search,
    Users,
    EllipsisVertical,
    CloudCheck,
    AlarmClockCheck,
    Calendar
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import DrawerHeader from '@components/DrawerHeader';
import { useAppSelector } from '@redux/hooks';

import api from '@utils/api';
import Skeleton from '@components/Skeleton';
import { navigate } from '@utils/NavigationUtils';
import moment from 'moment';





const SentScreen = ({ navigation }) => {

    const userId = useAppSelector(state => state.auth.user?.id);
    const userName = useAppSelector(state => state.auth.user?.first_name);
    const [pageNo, setPageNo] = useState(1);

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([]);

    const getStatus = (status) => {
        return STATUS_CONFIG[status] || {
            label: status,
            color: "#999",
        };
    };

    const formatDateTime = (date) => {
        return moment(date).format("DD MMM YYYY hh:mm A");
    };
    const loadMore = () => {
        if (!loading) {
            fetchData(pageNo + 1);
        }
    };

    const formatEnvelopes = async (data) => {
        console.log(data)
        return data.map((item) => {
            const recipients = item.envelope_recepients || [];

            const names = recipients
                .map((r) => r.recepient_name)
                .join(", ");

            return {
                id: item?.id,
                subject: item?.subject,
                signed_status: item?.signed_status,
                recipients: names,
                recipient_count: recipients.length,
                last_changed: item.last_changed
            };
        });
    };

    // API call
    // const fetchData = async (page) => {
    //     setRefreshing(true);
    //     const requestData = {
    //         user: userId
    //     }
    //     try {
    //         const res = await api.post(
    //             `/api/sent/envelope?page=${page}`, requestData
    //         );
    //         const envelopes = res?.data?.envelope;
    //         // console.log(envelopes)
    //         const formattedData = await formatEnvelopes(envelopes);
    //         console.log(formattedData)
    //         setData((prev) => [...prev, ...formattedData])
    //         setPageNo(page)

    //         // console.log(formattedData)
    //     } catch (error) {
    //         console.log('API ERROR:', error);
    //     } finally {
    //         setRefreshing(false);
    //     }
    // };

    const fetchData = async (pageNum = 1, isRefresh = false) => {
        if (loading) return;
        const requestData = {
            user: userId
        }

        setLoading(true);

        try {

            const res = await api.post(
                `/api/sent/envelope?page=${pageNum}`, requestData
            );
            const envelopes = res?.data?.envelope;

            const formattedData = await formatEnvelopes(envelopes);
            setData((prev) =>
                pageNum === 1 ? formattedData : [...prev, ...formattedData]
            );

            setPageNo(pageNum);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = useCallback(async () => {

        setRefreshing(true);
        await fetchData(1, true);

    }, [userId]);


    useEffect(() => {
        fetchData(1);
    }, [userId]);

    const renderItem = ({ item }) => {

        const status = getStatus(item.signed_status);
        const Icon = status.icon;
        return (

            <TouchableOpacity style={styles.card}>
                <View style={{ flex: 1 }}>


                    <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1.5), marginTop: wp(1) }}>
                        <Users color={Colors.text_primary} size={fp(1.7)} />
                        <Text style={styles.recipients} numberOfLines={1}>
                            {item.recipients}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: "center", gap: wp(3), marginTop: wp(3) }}>



                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: status.color + "20" }, // light bg
                            ]}
                        >
                            <Icon size={fp(1.7)} color={status.color} />
                            <Text style={[styles.badgeText, { color: status.color }]}>
                                {status.label}
                            </Text>



                        </View>

                        <View style={{ height: hp(2), width: 1, backgroundColor: Colors.border }} />

                        <View style={{ flexDirection: "row", alignItems: 'center', gap: wp(1) }}>
                            <Calendar size={fp(1.8)} color={Colors.text_secondary} />
                            <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.5) }}>
                                {formatDateTime(item.last_viewed)}
                            </Text>
                        </View>

                    </View>



                </View>

                <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity style={styles.iconWrapper}>

                        <EllipsisVertical color={Colors.text_primary} size={fp(2.5)} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }


    return (
        <View style={styles.container}>
            <DrawerHeader navigation={navigation} title="Sent" />
            <View style={styles.inner}>
                <View style={{ flexDirection: "row", height: hp(6), borderWidth: 1, borderColor: Colors.text_secondary, marginVertical: hp(1), borderRadius: wp(10), paddingLeft: wp(3), alignItems: 'center' }}>
                    <Search color={Colors.text_primary} size={fp(3)} />
                    <TextInput
                        placeholder="Search here..."
                        placeholderTextColor={Colors.text_secondary}
                        value={search}
                        onChangeText={setSearch}
                        style={styles.search}
                    />
                </View>

                {


                    refreshing ? <View style={styles.cardRow}>
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                        <Skeleton style={styles.skeletonCard} />
                    </View> : <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        onEndReached={loadMore}
                        contentContainerStyle={{ gap: hp(1) }}
                        onEndReachedThreshold={0.9}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListFooterComponent={
                            loading ? <View style={styles.cardRow}>
                                <Skeleton style={styles.skeletonCard} />
                                <Skeleton style={styles.skeletonCard} />

                            </View> : null
                        }
                    />

                }




            </View>

        </View>
    );
};

export default SentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background_light,
        // padding: wp(5),
    },
    inner: {
        paddingHorizontal: wp(5),
        paddingVertical: wp(2)
    },

    heading: {
        fontSize: fp(2.5),
        fontFamily: Fonts.SemiBold,
        color: '#1E2A5A',
        marginBottom: hp(2),
    },


    search: {
        flex: 1,
        fontFamily: Fonts.Regular, fontSize: fp(1.9)

    },
    card: {
        backgroundColor: Colors.white,
        flexDirection: 'row',


        borderWidth: 1,
        padding: wp(4),
        paddingRight: wp(1.5),
        borderColor: Colors.border,
        borderRadius: wp(3),
        // elevation: 2,
    },
    subject: {
        fontSize: fp(1.8),
        fontFamily: Fonts.SemiBold,
        color: Colors.text_primary
    },
    recipients: {
        // marginTop: wp(1),
        fontSize: fp(1.7),
        fontFamily: Fonts.Regular,
        color: Colors.text_secondary,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    status: {
        color: "green",
        fontWeight: "600",
    },
    count: {
        color: "#888",
    },
    skeletonCard: {
        width: '100%',
        borderRadius: wp(3),
        height: hp(13)
    },
    cardRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: wp(2),
        // paddingHorizontal: wp(3)
    },

    badge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: 20,
        width: wp(25),
        // marginTop: wp(3),
        justifyContent: "center", alignItems: "center",
        flexDirection: "row", gap: wp(1)
    },

    badgeText: {
        fontSize: fp(1.4),
        fontFamily: Fonts.Regular,
        textAlign: 'center'
    },
    iconWrapper: {
        width: wp(10),
        height: wp(10),
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: Colors.placeholder


    }
});