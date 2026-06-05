import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react-native';
import {SubscriptionStatus} from '../types/subscription';
import {
  getStatusBadgeColor,
  getStatusMessage,
} from '../utils/subscriptionHelpers';
import {fp} from '../utils/Constants';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  expiryDate?: string;
  renewalDate?: string;
  onInfoPress?: () => void;
  style?: any;
}

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  expiryDate,
  renewalDate,
  onInfoPress,
  style,
}) => {
  const badgeColor = getStatusBadgeColor(status);
  const statusText = getStatusMessage(status, expiryDate, renewalDate);

  const getIcon = () => {
    const iconSize = fp(1.6);
    const iconColor = '#FFFFFF';

    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <CheckCircle2 size={iconSize} color={iconColor} />;
      case SubscriptionStatus.CANCELLED:
        return <XCircle size={iconSize} color={iconColor} />;
      case SubscriptionStatus.EXPIRED:
        return <Clock size={iconSize} color={iconColor} />;
      case SubscriptionStatus.GRACE_PERIOD:
        return <AlertCircle size={iconSize} color={iconColor} />;
      case SubscriptionStatus.PENDING_UPGRADE:
        return <ArrowUp size={iconSize} color={iconColor} />;
      case SubscriptionStatus.PENDING_DOWNGRADE:
        return <ArrowDown size={iconSize} color={iconColor} />;
      default:
        return <Info size={iconSize} color={iconColor} />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Active';
      case SubscriptionStatus.CANCELLED:
        return 'Cancelled';
      case SubscriptionStatus.EXPIRED:
        return 'Expired';
      case SubscriptionStatus.GRACE_PERIOD:
        return 'Payment Issue';
      case SubscriptionStatus.PENDING_UPGRADE:
        return 'Upgrading';
      case SubscriptionStatus.PENDING_DOWNGRADE:
        return 'Downgrade Scheduled';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor,
          },
        ]}>
        {getIcon()}
        <Text style={styles.badgeText}>{getStatusLabel()}</Text>
      </View>

      <Text style={styles.statusMessage}>{statusText}</Text>

      {onInfoPress && (
        <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
          <Info size={fp(1.6)} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fp(1.4),
    fontWeight: '600',
  },
  statusMessage: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: fp(1.3),
    flex: 1,
  },
  infoButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default SubscriptionStatusBadge;
