import React, { useState, useRef, memo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import FastImage from 'react-native-fast-image';
import PagerView from 'react-native-pager-view';
import * as Clipboard from 'expo-clipboard';
import {
    ArrowLeft, FileText, History, Trash2,
    Download, Printer, QrCode, Mail,
    CheckCircle, FileDown, ExternalLink, Clapperboard,
    PencilLine,
    Calendar,
    CheckCircle2,
    Copy
} from 'lucide-react-native';

import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { goBack } from '@utils/NavigationUtils';
import LinearGradient from 'react-native-linear-gradient';
import BackHeader from '@components/BackHeader';

const ACTION_ICON_SIZE = wp(5.5);

// ------------------------------------------------------------------
// 1. Memoized Components for Performance
// ------------------------------------------------------------------
const ActionButton = memo(({ Icon, label, onPress, isOutline }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.actionBtn}>
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



const RecipientCard = memo(({ data }) => {
    return (
        <View style={styles.cardContainer}>
            {/* 1. Header: Avatar and Identity */}
            <View style={styles.headerRow}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>KR</Text>
                </View>

                <View style={styles.infoColumn}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>krishna1</Text>
                        <TouchableOpacity style={styles.editBtn}>
                            <PencilLine size={wp(4)} color={Colors.grey} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userEmail}>skreddy.dev@gmail.com</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.needsSignBadge}>
                    <Text style={styles.needsSignText}>Needs to Sign</Text>
                </View>
            </View>

            {/* 2. Status Tracking Section */}
            <View style={styles.statusSection}>
                <View style={styles.statusItem}>
                    <Calendar size={wp(3.5)} color={Colors.grey} />
                    <Text style={styles.statusLabel}>Viewed On:</Text>
                    <Text style={styles.statusValue}>20th April 2026, 05:06 PM</Text>
                </View>

                <View style={styles.deliveryRow}>
                    <CheckCircle2 size={wp(4.5)} color="#22C55E" fill="#DCFCE7" />
                    <Text style={styles.deliveryText}>Email Delivery Status - <Text style={styles.boldSuccess}>SUCCESS</Text></Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* 3. Modern Action Buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.qrButton} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#0EA5E9', '#0284C7']}
                        style={styles.gradientBtn}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <QrCode size={wp(4.5)} color="#FFF" />
                        <Text style={styles.qrBtnText}>QR Code</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
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
const SummaryScene = ({ recipients }) => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scenePadding}>
        <Text style={styles.sectionTitle}>Envelope Recipients</Text>
        {recipients.map((recip, index) => (
            <RecipientCard key={index} data={recip} />
        ))}
        <View style={{ height: hp(15) }} />
    </ScrollView>
);

const DocumentsScene = ({ docName }) => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scenePadding}>
        <Text style={styles.sectionTitle}>Uploaded Files</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.fileCard}>
            <FileText color={Colors.grey} size={wp(7)} />
            <Text style={[styles.titleText, { flex: 1 }]}>{docName}</Text>
            <Clapperboard color={Colors.blue} size={wp(5.5)} />
        </TouchableOpacity>
    </ScrollView>
);

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
const EnvelopeDetailsScreen = ({ route }) => {
    // Mock data for display - replace with data from route params
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
            {/* 3. Immersive Header Image Section */}
            {/* <View style={styles.heroHeader}>
              

                <View style={styles.headerAbsoluteContent}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
                        <ArrowLeft color="#FFF" size={wp(6)} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.roundAction}><Trash2 color="#FFF" size={wp(5)} /></TouchableOpacity>
                        <TouchableOpacity style={styles.roundAction}><Printer color="#FFF" size={wp(5)} /></TouchableOpacity>
                    </View>
                </View>

               
            </View> */}

            <View style={styles.infoOverlapCard}>
                <View style={styles.row}>
                    <Text style={styles.title}>{envelopeData.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.statusItem}>
                            <Calendar size={wp(3.5)} color={Colors.grey} />
                            <Text style={styles.statusLabel}>Sent On:</Text>
                            <Text style={styles.statusValue}>20th April 2026, 05:06 PM</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.quickActions}>
                    <ActionButton Icon={FileText} label="Resend" onPress={() => console.log('resend')} />
                    <ActionButton Icon={History} label="History" onPress={() => console.log('history')} isOutline />
                    <ActionButton Icon={Printer} label="Print" onPress={() => console.log('qr')} isOutline />
                    <ActionButton Icon={Download} label="Download" onPress={() => console.log('qr')} isOutline />
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
                        <SummaryScene recipients={envelopeData.recipients} />
                    </View>
                    <View key="2">
                        <DocumentsScene docName={envelopeData.docName} />
                    </View>
                </PagerView>
            </View>


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
    contentBody: { flex: 1, marginTop: hp(1), zIndex: 5 },
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
    avatarText: { color: '#FFF', fontSize: fp(1.6), fontFamily: Fonts.Bold },
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
        borderWidth: 1,
        borderColor: '#BAE6FD',
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
    },
    qrButton: {
        flex: 1,
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
    },
    linkBtnText: {
        color: '#475569',
        fontSize: fp(1.7),
        fontFamily: Fonts.SemiBold,
    },
    editBtn: {}
});