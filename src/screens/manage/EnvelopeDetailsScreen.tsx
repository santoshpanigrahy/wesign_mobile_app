import React, { useState, useRef, memo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import PagerView from 'react-native-pager-view';
import {
    ArrowLeft, FileText, History, Trash2,
    Download, Printer, QrCode, Mail,
    CheckCircle, FileDown, ExternalLink, Clapperboard,
    PencilLine,
    Calendar,
    CheckCircle2,
    Copy,
    OctagonX,
    CircleAlert
} from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import { Colors, Fonts, formatDate, fp, hp, wp } from '@utils/Constants';
import { goBack } from '@utils/NavigationUtils';
import LinearGradient from 'react-native-linear-gradient';
import BackHeader from '@components/BackHeader';
import { useAppDispatch } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import api from '@utils/api';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import AppBottomSheet from '@components/AppBottomSheet';

const ACTION_ICON_SIZE = wp(5.5);

const ActionButton = memo(({ Icon, label, onPress, isOutline, disabled = false }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.actionBtn, { opacity: disabled ? 0.3 : 1 }]} disabled={disabled}>
        <View style={[styles.actionIconPill, isOutline && styles.actionPillOutline]}>
            <Icon color={isOutline ? Colors.blue : "#FFF"} size={ACTION_ICON_SIZE - 2} />
        </View>
        <Text style={[styles.actionLabel, isOutline && styles.labelOutline]}>{label}</Text>
    </TouchableOpacity>
));

const MetaItem = memo(({ label, value }) => (
    <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
    </View>
));





const RecipientCard = memo(({ data, handleCopyEnvelopeLink, handleEnvelopeQrCode }) => {
    const initial = data?.recepient_name?.slice(0, 2);
    const isEmailDelivered = data.email_status === 'accepted' || data.email_status === 'delivered' || data.email_status === 'opened' || data.email_status === 'clicked'
    const isEmailNotDelivered = data.email_status === 'rejected' || data.email_status === 'failed';
    const isEmailUnSubscribed = data.email_status === 'unsubscribed' || data.email_status === 'complained'

    return (
        <View style={styles.cardContainer}>
            {/* 1. Header: Avatar and Identity */}
            <View style={styles.headerRow}>
                <View style={[styles.avatarContainer, { backgroundColor: data?.meta_info?.recepient_border_color }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.infoColumn}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{data?.recepient_name}</Text>
                        {/* <TouchableOpacity style={styles.editBtn}>
                            <PencilLine size={wp(4)} color={Colors.grey} />
                        </TouchableOpacity> */}
                    </View>
                    <Text style={styles.userEmail}>{data?.recepient_email}</Text>
                </View>


                {data?.signed_status === 'unsigned' && (
                    <View style={styles.statusWrapper}>
                        {data?.action === 'needs_to_sign' && (
                            <Text style={[styles.envelopeStatus, styles.needToSign]}>
                                Needs to Sign
                            </Text>
                        )}

                        {data?.action === 'receive_copy' && (
                            <Text style={[styles.envelopeStatus, styles.receiveCopy]}>
                                Receive Copy
                            </Text>
                        )}

                        {data?.action === 'in_person_sign' && (
                            <Text style={[styles.envelopeStatus, styles.inPersonSign]}>
                                In Person Sign
                            </Text>
                        )}


                    </View>
                )}


                {data?.signed_status === 'signed' && (
                    <>
                        {data?.action === 'needs_to_sign' && (
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.envelopeStatus, styles.signed]}>
                                    Signed
                                </Text>


                            </View>
                        )}

                        {data?.action === 'receive_copy' && (
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.envelopeStatus, styles.receiveCopy]}>
                                    Receive Copy
                                </Text>


                            </View>
                        )}

                        {data?.action === 'in_person_sign' && (
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.envelopeStatus, styles.signed]}>
                                    Signed
                                </Text>


                            </View>
                        )}
                    </>
                )}


                {data?.signed_status === 'declined' && (
                    <View style={styles.statusWrapper}>
                        <Text style={[styles.envelopeStatus, styles.declined]}>
                            Declined
                        </Text>


                    </View>
                )}


            </View>


            <View style={styles.statusSection}>
                <View style={styles.recipientRight}>
                    <View>

                        {data?.signed_status === 'unsigned' && (
                            <View style={styles.statusWrapper}>

                                {data?.last_viewed ? (
                                    <Text style={styles.statusText}>
                                        Viewed On: {formatDate(data.last_viewed)}
                                    </Text>
                                ) : (
                                    <Text style={styles.statusText}>
                                        Document not viewed yet
                                    </Text>
                                )}
                            </View>
                        )}


                        {data?.signed_status === 'signed' && (
                            <>
                                {data?.action === 'needs_to_sign' && (
                                    <View style={styles.statusWrapper}>


                                        {data?.signed_date && (
                                            <Text style={styles.statusText}>
                                                Signed On: {formatDate(data.signed_date)}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {data?.action === 'receive_copy' && (
                                    <View style={styles.statusWrapper}>


                                        <Text style={styles.statusText}>
                                            {data?.last_viewed
                                                ? `Viewed On: ${formatDate(data.last_viewed)}`
                                                : 'Document not viewed yet'}
                                        </Text>
                                    </View>
                                )}

                                {data?.action === 'in_person_sign' && (
                                    <View style={styles.statusWrapper}>


                                        {data?.signed_date && (
                                            <Text style={styles.statusText}>
                                                Signed On: {formatDate(data.signed_date)}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </>
                        )}


                        {data?.signed_status === 'declined' && (
                            <View style={styles.statusWrapper}>


                                {data?.last_viewed && (
                                    <Text style={styles.statusText}>
                                        Declined On: {formatDate(data.last_viewed)}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>


                    {/* {data?.action === 'in_person_sign' &&
                        data?.signed_status !== 'signed' && (
                            <TouchableOpacity
                                style={styles.signBtn}
                            // onPress={() =>
                            //   inPersonSignLink(data?.recepient_email)
                            // }
                            >
                                <Text style={styles.signBtnText}>Sign Here</Text>
                            </TouchableOpacity>
                        )} */}
                </View>

                {
                    isEmailDelivered && <View style={styles.deliveryRow}>
                        <CheckCircle2 size={wp(4.5)} color="#22C55E" fill="#DCFCE7" />
                        <Text style={styles.deliveryText}>Email Delivery Status - <Text style={styles.boldSuccess}>SUCCESS</Text></Text>
                    </View>
                }

                {
                    isEmailNotDelivered && <View style={[styles.deliveryRow, { backgroundColor: '#f9eeee' }]}>
                        <OctagonX size={wp(4.5)} color="#c52222" fill="#f9eeee" />
                        <Text style={[styles.deliveryText, { color: '#c52222' }]}>Email Delivery Status - <Text style={styles.boldSuccess}>FAILED</Text></Text>
                    </View>
                }

                {
                    isEmailUnSubscribed && <View style={[styles.deliveryRow, { backgroundColor: '#fcf6dc' }]}>
                        <CircleAlert size={wp(4.5)} color="#f9ab00" fill="#fcf6dc" />
                        <Text style={[styles.deliveryText, { color: '#f9ab00' }]}>Email Delivery Status - <Text style={styles.boldSuccess}>UNSUBSCRIBE</Text></Text>
                    </View>
                }

            </View>

            <View style={styles.divider} />

            {/* 3. Modern Action Buttons */}
            <View style={styles.actionRow}>
                {
                    data?.qr_code && <TouchableOpacity style={styles.qrButton} activeOpacity={0.8} onPress={() => handleEnvelopeQrCode(data?.qr_code)}>
                        <LinearGradient
                            colors={['#0EA5E9', '#0284C7']}
                            style={styles.gradientBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <QrCode size={wp(4.5)} color="#FFF" />
                            <Text style={styles.qrBtnText}>QR Code</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                }


                <TouchableOpacity onPress={() => handleCopyEnvelopeLink(data?.link)} style={styles.linkButton} activeOpacity={0.7}>
                    <Copy size={wp(4.5)} color={Colors.blue} />
                    <Text style={styles.linkBtnText}>Envelope Link</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

// ------------------------------------------------------------------
// 2. Tab Scene Components
// ------------------------------------------------------------------
const SummaryScene = ({ recipients, handleCopyEnvelopeLink, handleEnvelopeQrCode }) => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scenePadding}>
        <Text style={styles.sectionTitle}>Envelope Recipients</Text>
        {recipients.map((recip, index) => (
            <RecipientCard key={index} data={recip} handleCopyEnvelopeLink={handleCopyEnvelopeLink} handleEnvelopeQrCode={handleEnvelopeQrCode} />
        ))}
        <View style={{ height: hp(15) }} />
    </ScrollView>
);

const DocumentsScene = ({ docNames }) => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scenePadding}>
        <Text style={styles.sectionTitle}>Uploaded Files</Text>
        {
            docNames?.map((doc, index) => {
                return <TouchableOpacity activeOpacity={0.8} style={styles.fileCard} key={index}>
                    <FileText color={Colors.grey} size={wp(7)} />
                    <Text style={[styles.titleText, { flex: 1 }]}>{doc}</Text>
                    <Clapperboard color={Colors.blue} size={wp(5.5)} />
                </TouchableOpacity>
            })
        }

    </ScrollView>
);

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
const EnvelopeDetailsScreen = ({ route }) => {

    const envelopeId = route.params.id;
    const qrCodeRef = useRef(null);
    const dispatch = useAppDispatch();


    const [envelopeDetails, setEnvelopeDetails] = useState();
    const [recipients, setRecipients] = useState([]);
    const [documentNames, setDocumentNames] = useState([]);
    const [holderId, setHolderId] = useState(null);
    const [links, setLinks] = useState([]);
    const [qrCode, setQrCode] = useState(null);

    const handleCopyEnvelopeLink = (link) => {
        Clipboard.setString(link);

        Toast.show({
            type: 'success',
            text1: 'Envelope Link Copied to Clipboard!',
        });
    };

    const handleEnvelopeQrCode = (qr_code) => {
        setQrCode(qr_code);
        qrCodeRef?.current?.snapToIndex(0);
    }


    const resendEnvelope = async () => {
        try {
            dispatch(showLoader('Sending'));

            const response = await api.post(`/api/envelope/resend/${envelopeId}`);

            const data = response?.data;

            if (data?.status === true) {
                if (!data?.sent_emails?.length) {
                    Toast.show({
                        type: 'error',
                        text1: 'Limit Exceeded',
                        text2: 'Resend limit has been exceeded',
                    });
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: data?.message,
                    });
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data?.message,
                });
            }
        } catch (error) {
            console.log('Resend Envelope Error:', error);

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });
        } finally {
            dispatch(hideLoader());
        }
    };







    const getDocDetails = async () => {
        try {
            dispatch(showLoader('Loading'));

            const response = await api.get(
                `/api/envelope/details/${envelopeId}`
            );

            dispatch(hideLoader());

            const data = response.data;

            if (data.status_code === 200) {
                const envelope = data.envelope;



                setHolderId(envelope?.holder);
                setLinks(envelope?.links);

                const envelopeDetailsData = {
                    subject: envelope?.envelope_content?.subject,
                    sentOn: formatDate(envelope?.sent_on),
                    holderId: envelope?.holder,
                    envelopeId: envelope?.id,
                    signedStatus: envelope.signed_status
                }

                setEnvelopeDetails(envelopeDetailsData);

                const links = envelope?.links || [];
                const resp = envelope?.envelope_recepients || []

                const mappedRecipients = resp.map((recipient, index) => {
                    const linkData = links[index]; // index-based mapping

                    return {
                        ...recipient,
                        link: linkData?.link || null,
                        qr_code: linkData?.qr_code || null,
                    };
                });



                setRecipients(mappedRecipients || []);
                const envelope_documents = envelope.envelope_documents;

                const documentNames = envelope_documents?.map((doc) => {
                    return doc?.document_name;
                });

                setDocumentNames(documentNames);

                console.log(documentNames)
















            }
        } catch (error) {
            dispatch(hideLoader());

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch document details',
            });

            console.log(error);
        }
    };

    const envelopeData = {
        title: "Test Envelope",
        sentOn: "20th April 2026 01:32 PM",
        thumbnailUrl: "https://via.placeholder.com/300x400.png?text=ResumeDebashish.pdf",
        recipients: [
            { name: "krishnal skreddy", email: "dev@gmail.com", viewedAt: "20th April 2026 01:38 PM" },
            { name: "Ram skreddy", email: "dev@gmail.com", viewedAt: "20th April 2026 01:38 PM" },
            { name: "Syam skreddy", email: "dev@gmail.com", viewedAt: "20th April 2026 01:38 PM" }
        ],


        docName: "resumeDebashish.pdf"
    };



    useEffect(() => {
        if (envelopeId) {

            getDocDetails();
        }
    }, [envelopeId])

    const pagerRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ["Summary", "Documents"];

    const setPage = (index) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };

    return (
        <View style={styles.mainContainer}>
            <BackHeader screenName={'Envelope Details'} goBack={goBack} />


            <View style={styles.infoOverlapCard}>
                <View style={styles.row}>
                    <Text style={styles.title}>{envelopeDetails?.subject}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.statusItem}>
                            <Calendar size={wp(3.5)} color={Colors.grey} />
                            <Text style={styles.statusLabel}>Sent On:</Text>
                            <Text style={styles.statusValue}>{envelopeDetails?.sentOn}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.quickActions}>
                    <ActionButton Icon={FileText} label="Resend" onPress={() => resendEnvelope()} />
                    <ActionButton Icon={History} disabled={true} label="History" onPress={() => console.log('history')} isOutline />
                    <ActionButton Icon={Printer} disabled={true} label="Print" onPress={() => console.log('qr')} isOutline />
                    <ActionButton Icon={Download} disabled={true} label="Download" onPress={() => console.log('qr')} isOutline />
                </View>
            </View>

            {/* 4. Optimized Tab Navigation */}
            <View style={styles.contentBody}>
                <View style={styles.tabBar}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setPage(index)}>
                            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
                            <View style={[styles.tabIndicator, activeTab === index && styles.activeIndicator]} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 5. PagerView Implementation for smoothness */}
                <PagerView
                    ref={pagerRef}
                    style={styles.pager}
                    initialPage={0}
                    onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
                >
                    <View key="1">
                        <SummaryScene recipients={recipients} handleCopyEnvelopeLink={handleCopyEnvelopeLink} handleEnvelopeQrCode={handleEnvelopeQrCode} />
                    </View>
                    <View key="2">

                        <DocumentsScene docNames={documentNames} />
                    </View>
                </PagerView>
            </View>


            <AppBottomSheet ref={qrCodeRef} title={'QR Code'} snapPoints={['60%']}>

                <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: hp(3) }}>

                    <Image source={{
                        uri: `data:image/png;base64,${qrCode}`,
                    }} alt='qr' style={{ height: '100%', width: '100%', }} />

                </View>

            </AppBottomSheet>


        </View>
    );
};

export default memo(EnvelopeDetailsScreen);

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#FFF' },
    heroHeader: { height: hp(20), zIndex: 10, position: 'relative' },
    heroImage: { ...StyleSheet.absoluteFillObject },
    topGradient: { ...StyleSheet.absoluteFillObject, height: hp(15) },
    headerAbsoluteContent: { position: 'absolute', top: hp(6), left: wp(5), right: wp(5), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    backBtn: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 50 },
    headerActions: { flexDirection: 'row', gap: 10 },
    roundAction: { width: wp(10), height: wp(10), borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    infoOverlapCard: { backgroundColor: '#FFF', borderRadius: wp(6), padding: wp(5), borderWidth: 1, borderColor: Colors.border, marginHorizontal: wp(3), marginTop: hp(2), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    typeTag: { fontSize: fp(1.4), color: Colors.blue, fontFamily: Fonts.Bold, marginBottom: 4 },
    title: { fontSize: fp(2.4), fontFamily: Fonts.Bold, color: '#1A1A1A' },
    metaRow: { flexDirection: 'row', gap: 10, marginTop: hp(0.5) },
    metaBox: { alignItems: 'center', flexDirection: "row", gap: wp(2) },
    metaLabel: { fontSize: fp(1.2), color: Colors.grey, fontFamily: Fonts.Regular },
    metaValue: { fontSize: fp(1.4), color: '#333', fontFamily: Fonts.SemiBold },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: wp(4) },
    quickActions: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
    actionIconPill: { width: ACTION_ICON_SIZE * 1.8, height: ACTION_ICON_SIZE * 1.8, borderRadius: wp(5), backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
    actionPillOutline: { backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#D0E4FF' },
    actionLabel: { fontSize: fp(1.4), fontFamily: Fonts.SemiBold, color: Colors.blue },
    labelOutline: { color: Colors.blue },
    contentBody: { flex: 1, marginTop: hp(1) },
    tabBar: { flexDirection: 'row', paddingHorizontal: wp(5), borderBottomWidth: 1, borderColor: '#EEE' },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 15 },
    tabText: { fontSize: fp(1.7), color: '#777', fontFamily: Fonts.Medium },
    activeTabText: { color: Colors.blue, fontFamily: Fonts.SemiBold },
    tabIndicator: { height: 3, width: '100%', position: 'absolute', bottom: 0 },
    activeIndicator: { backgroundColor: Colors.blue, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    pager: { flex: 1 },
    scenePadding: { padding: wp(5) },
    sectionTitle: { fontSize: fp(1.9), fontFamily: Fonts.Bold, color: '#333', marginBottom: wp(4) },
    recipientCard: { backgroundColor: '#F9FAFB', borderRadius: wp(4), padding: wp(4), marginBottom: wp(3), borderWidth: 1, borderColor: '#F0F0F0' },
    recipInfo: { flex: 1 },
    recipMeta: { fontSize: fp(1.4), color: Colors.grey, fontFamily: Fonts.Regular, textAlign: 'right' },
    cardDivider: { height: 1, backgroundColor: '#EEE', marginVertical: wp(3) },
    fileCard: { flexDirection: 'row', alignItems: 'center', gap: wp(3), backgroundColor: '#FFF', padding: wp(4), borderRadius: wp(3), borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    titleText: { fontSize: fp(1.7), fontFamily: Fonts.SemiBold, color: '#333' },
    subText: { fontSize: fp(1.4), color: '#777', fontFamily: Fonts.Regular },
    statusBadge: { backgroundColor: Colors.background_light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
    badgeText: { fontSize: fp(1.2), color: '#FFF', fontFamily: Fonts.Bold },
    avatar: { width: wp(10), height: wp(10), borderRadius: wp(5), backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontSize: fp(1.6), fontFamily: Fonts.Bold, textTransform: 'uppercase' },
    detailActionFooter: { height: hp(12), borderTopWidth: 1, borderColor: '#EEE', paddingHorizontal: wp(5), flexDirection: 'row', alignItems: 'center', gap: 15, position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF' },
    footerCircleBtn: { width: wp(14), height: wp(14), borderRadius: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    primaryActionBtn: { flex: 1 },
    gradientBtn: { height: wp(14), borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    btnText: { color: '#FFF', fontSize: fp(1.9), fontFamily: Fonts.Bold },
    cardContainer: {
        backgroundColor: '#FFF',
        borderRadius: wp(5),
        padding: wp(4),
        marginBottom: wp(4),
        // Modern Shadow
        elevation: 1,
        shadowColor: '#ddd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    avatarContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: '#35a4ee',
        // borderWidth: 1,
        // borderColor: '#BAE6FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },

    infoColumn: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
    },
    userName: {
        fontSize: fp(2),
        fontFamily: Fonts.Bold,
        color: '#1E293B',
    },
    userEmail: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Regular,
        color: '#64748B',
        marginTop: 2,
    },
    needsSignBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: 20,
    },
    needsSignText: {
        color: '#0284C7',
        fontSize: fp(1.4),
        fontFamily: Fonts.SemiBold,
    },
    statusSection: {
        gap: wp(2.5),
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    statusLabel: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: '#64748B',
    },
    statusValue: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Medium,
        color: '#334155',
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        backgroundColor: '#F0FDF4',
        padding: wp(2.5),
        borderRadius: wp(2),
    },
    deliveryText: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: '#15803D',
    },
    boldSuccess: {
        fontFamily: Fonts.Bold,
    },

    actionRow: {
        flexDirection: 'row',
        gap: wp(3),
        // alignItems: 'baseline'
    },
    qrButton: {
        flex: 1,
        // height: hp(6)
        // borderWidth: 1,

    },

    qrBtnText: {
        color: '#FFF',
        fontSize: fp(1.7),
        fontFamily: Fonts.Bold,
    },
    linkButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: wp(3),
        gap: wp(2),
        backgroundColor: '#F8FAFC',
        minHeight: hp(6)

    },
    linkBtnText: {
        color: '#475569',
        fontSize: fp(1.7),
        fontFamily: Fonts.SemiBold,
    },
    editBtn: {},
    recipientRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    statusWrapper: {
        gap: 4,
    },

    envelopeStatus: {
        alignSelf: 'flex-start',
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: 20,

        fontSize: fp(1.5),
        fontFamily: Fonts.Regular
    },

    needToSign: {
        backgroundColor: '#FFF4D6',
        color: '#B7791F',
    },

    receiveCopy: {
        backgroundColor: '#E6F0FF',
        color: '#2563EB',
    },

    inPersonSign: {
        backgroundColor: '#F3E8FF',
        color: '#7C3AED',
    },

    signed: {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
    },

    declined: {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
    },

    statusText: {
        fontSize: fp(1.5),
        color: '#666',
        fontFamily: Fonts.Regular
    },

    signBtn: {
        borderWidth: 1,
        borderColor: '#222',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    signBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

});