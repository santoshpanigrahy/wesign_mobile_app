import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AppBottomSheet from '@components/AppBottomSheet';
import { Colors, Fonts, formatDate, fp, hp, wp } from '@utils/Constants';
import {
    History,
    FileText,
    Download,
    Calendar,
    CheckCircle2,
    Users,
    MapPin,
    X,
    FileDown
} from 'lucide-react-native';

interface ActivityItem {
    id: string;
    name: string;
    created_on: string;
    action: string;
    activity: string;
}

interface EnvelopeHistoryProps {

    onDownloadCertificate: () => void;
    onExportActivity: () => void;
    details: {
        holder: string;
        subject: string;
        envelopeId: string;
        sent: string;
        created: string;
        location: string;
        recipients: string;
        status: string;
    };
    historyList: ActivityItem[];
}

const EnvelopeHistorySheet: React.FC<EnvelopeHistoryProps> = ({

    onDownloadCertificate,
    onExportActivity,
    details,
    historyList,
}) => {
    // Helper component for details rows to keep code DRY
    const DetailRow = ({ icon: Icon, label, value }: any) => (
        <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
                <Icon size={fp(2)} color="#64748B" strokeWidth={2} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                {value}
            </Text>
        </View>
    );

    return (

        <View style={styles.container}>



            <ScrollView
                style={styles.scrollArea}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Envelope Details</Text>
                    <View style={styles.card}>
                        <DetailRow icon={Users} label="Holder" value={details.holder} />
                        <DetailRow icon={FileText} label="Subject" value={details.subject} />
                        <DetailRow icon={FileText} label="Envelope ID" value={details.envelopeId} />
                        <DetailRow icon={Calendar} label="Sent" value={formatDate(details.sent)} />
                        <DetailRow icon={Calendar} label="Created" value={formatDate(details.created)} />
                        <DetailRow icon={MapPin} label="Location" value={details.location} />
                        <DetailRow icon={Users} label="Recipients" value={details.recipients} />
                        <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <View style={styles.detailLabelContainer}>
                                <CheckCircle2 size={fp(2)} color="#64748B" strokeWidth={2} />
                                <Text style={styles.detailLabel}>Status</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{details.status}</Text>
                            </View>
                        </View>
                    </View>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity History</Text>
                    <View style={styles.activityList}>
                        {historyList.map((item, index) => (
                            <View key={item.id || index} style={styles.activityCard}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.activityUser}>{item.name}</Text>
                                    <Text style={styles.activityTime}>{formatDate(item.created_on)}</Text>
                                </View>
                                <View style={styles.activityDetails}>
                                    <Text style={styles.activityAction}>
                                        <Text style={styles.activityLabel}>Action: </Text>
                                        {item.action}
                                    </Text>
                                    <Text style={styles.activityText}>
                                        <Text style={styles.activityLabel}>Activity: </Text>
                                        {item.activity}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>


            <View style={styles.footer}>


                <View style={styles.primaryBtnGroup}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={onDownloadCertificate}>
                        <Download color="#FFF" size={fp(2.2)} />
                        <Text style={styles.primaryBtnText}>Certificate</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={styles.primaryBtn} onPress={onExportActivity}>
                        <FileDown color="#FFF" size={fp(2.2)} />
                        <Text style={styles.primaryBtnText}>Export</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>

    );
};

export default EnvelopeHistorySheet;

const styles = StyleSheet.create({
    container: {


        borderTopLeftRadius: wp(5),
        borderTopRightRadius: wp(5),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2.5),
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: wp(5),
        borderTopRightRadius: wp(5),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    headerTitle: {
        fontSize: fp(2.4),
        fontFamily: Fonts.Bold,
        color: '#0F172A',
    },
    closeIcon: {
        padding: wp(1),
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flex: 1,
        paddingVertical: hp(2),
        paddingBottom: hp(4),
    },
    section: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: fp(1.8),
        fontFamily: Fonts.SemiBold,
        color: '#334155',
        marginBottom: hp(1.5),
        marginLeft: wp(1),
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
        borderColor: Colors.border,
        borderWidth: 1,
        padding: wp(4),

    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1.2),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        flex: 1,
    },
    detailLabel: {
        fontSize: fp(1.6),
        fontFamily: Fonts.Medium,
        color: '#64748B',
    },
    detailValue: {
        fontSize: fp(1.6),
        fontFamily: Fonts.SemiBold,
        color: '#1E293B',
        flex: 1.5,
        textAlign: 'right',
    },
    statusBadge: {
        backgroundColor: '#DCFCE7', // Light green
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(5),
        width: wp(20),
        // alignSelf: "flex-end",

    },
    statusText: {
        color: '#166534',
        fontFamily: Fonts.SemiBold,
        fontSize: fp(1.4),
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    activityList: {
        gap: hp(1.5),
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
        padding: wp(4),

        borderColor: Colors.border,
        borderWidth: 1
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    activityUser: {
        fontSize: fp(1.7),
        fontFamily: Fonts.SemiBold,
        color: '#0F172A',
    },
    activityTime: {
        fontSize: fp(1.4),
        fontFamily: Fonts.Regular,
        color: '#94A3B8',
    },
    activityDetails: {
        gap: hp(0.5),
    },
    activityLabel: {
        fontFamily: Fonts.SemiBold,
        color: '#4a4b4d',
    },
    activityAction: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: '#334155',
    },
    activityText: {
        fontSize: fp(1.5),
        fontFamily: Fonts.Regular,
        color: '#334155',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: wp(3),
    },
    primaryBtnGroup: {
        flex: 1,
        flexDirection: 'row',
        gap: wp(2),
    },
    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#2563EB', // Modern blue
        borderRadius: wp(2.5),
        paddingVertical: hp(1.5),
        justifyContent: 'center',
        alignItems: 'center',
        gap: wp(1.5),
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontFamily: Fonts.SemiBold,
        fontSize: fp(1.6),
    },
    secondaryBtn: {
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2.5),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#475569',
        fontFamily: Fonts.SemiBold,
        fontSize: fp(1.6),
    },
});