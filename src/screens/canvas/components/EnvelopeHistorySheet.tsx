import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {Colors, Fonts, formatDate, fp, hp, wp} from '@utils/Constants';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  MapPin,
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
  details,
  historyList,
}) => {
  const DetailRow = ({icon: Icon, label, value}: any) => (
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

  const renderActivity = ({item}: {item: ActivityItem}) => (
    <View style={styles.activityCard}>
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
  );

  const Header = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Envelope Details</Text>

        <View style={styles.card}>
          <DetailRow icon={Users} label="Holder" value={details.holder} />

          <DetailRow icon={FileText} label="Subject" value={details.subject} />

          <DetailRow
            icon={FileText}
            label="Envelope ID"
            value={details.envelopeId}
          />

          <DetailRow
            icon={Calendar}
            label="Sent"
            value={formatDate(details.sent)}
          />

          <DetailRow
            icon={Calendar}
            label="Created"
            value={formatDate(details.created)}
          />

          <DetailRow icon={MapPin} label="Location" value={details.location} />

          <DetailRow
            icon={Users}
            label="Recipients"
            value={details.recipients}
          />

          <View
            style={[
              styles.detailRow,
              {borderBottomWidth: 0, paddingBottom: 0},
            ]}>
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
      </View>
    </>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onDownloadCertificate}>
        <Download color="#FFF" size={fp(2.2)} />
        <Text style={styles.primaryBtnText}>Certificate</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={historyList}
        renderItem={renderActivity}
        keyExtractor={(item, index) => item.id || index.toString()}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default EnvelopeHistorySheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
  },
  statusText: {
    color: '#166534',
    fontFamily: Fonts.SemiBold,
    fontSize: fp(1.4),
    textTransform: 'capitalize',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    padding: wp(4),
    borderColor: Colors.border,
    borderWidth: 1,
    marginBottom: hp(1.5),
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingTop: hp(2),
    paddingBottom: hp(3),
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1.5),
  },
  primaryBtnText: {
    color: '#FFF',
    fontFamily: Fonts.SemiBold,
    fontSize: fp(1.6),
  },
});
