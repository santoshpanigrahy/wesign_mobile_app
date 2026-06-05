import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import {
  X,
  ExternalLink,
  XCircle,
  Settings,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import AppButton from './AppButton';
import ConfirmationModal from './ConfirmationModal';

interface ManageSubscriptionModalProps {
  visible: boolean;
  planName: string;
  expiryDate?: string;
  onClose: () => void;
  onCancelSubscription: () => Promise<void>;
}

const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  visible,
  planName,
  expiryDate,
  onClose,
  onCancelSubscription,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleOpenAppStore = () => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

    Linking.openURL(url).catch(err =>
      console.error('Failed to open App Store:', err),
    );
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      await onCancelSubscription();
      setShowCancelConfirm(false);
      setShowInstructions(true);
    } catch (error) {
      console.error('Cancel failed:', error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Manage Subscription</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={fp(2.4)} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.content}>
              <View style={styles.planInfo}>
                <Text style={styles.planLabel}>Current Plan</Text>
                <Text style={styles.planName}>{planName}</Text>
              </View>

              <View style={styles.optionsList}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={handleOpenAppStore}>
                  <View style={styles.optionIcon}>
                    <Settings size={fp(2.4)} color={Colors.primary} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>
                      View in App Store Settings
                    </Text>
                    <Text style={styles.optionDescription}>
                      Manage your subscription directly in iOS Settings
                    </Text>
                  </View>
                  <ExternalLink size={fp(2)} color="#6B7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.option, styles.dangerOption]}
                  onPress={() => setShowCancelConfirm(true)}>
                  <View style={styles.optionIcon}>
                    <XCircle size={fp(2.4)} color="#EF4444" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, styles.dangerText]}>
                      Cancel Subscription
                    </Text>
                    <Text style={styles.optionDescription}>
                      Stop automatic renewal
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <AlertTriangle size={fp(2)} color="#F59E0B" />
                <Text style={styles.infoText}>
                  To complete cancellation, you'll need to confirm in your iOS
                  Settings. We'll guide you through the process.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelConfirm}
        title={`Cancel ${planName}?`}
        message="If you cancel:"
        bulletPoints={[
          expiryDate
            ? `You'll have access until ${expiryDate}`
            : 'Access continues until period end',
          'No refunds for current billing period',
          'You can resubscribe anytime',
        ]}
        confirmText="Yes, Cancel"
        cancelText="Keep Subscription"
        confirmButtonVariant="danger"
        onConfirm={handleCancelRequest}
        onCancel={() => setShowCancelConfirm(false)}
        loading={cancelling}
        icon="warning"
      />

      {/* Cancellation Instructions Modal */}
      <Modal
        visible={showInstructions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowInstructions(false);
          onClose();
        }}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowInstructions(false);
                onClose();
              }}
              style={styles.closeButtonTop}>
              <X size={fp(2.4)} color="#6B7280" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.successIcon}>
                <CheckCircle size={fp(6)} color="#10B981" />
              </View>

              <Text style={styles.instructionsTitle}>
                Complete Cancellation
              </Text>

              <Text style={styles.instructionsSubtitle}>
                Follow these steps to finish cancelling:
              </Text>

              <View style={styles.stepsList}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Open <Text style={styles.bold}>Settings</Text> on your
                    iPhone
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Tap your name →{' '}
                    <Text style={styles.bold}>Subscriptions</Text>
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Select <Text style={styles.bold}>WeSign</Text> →{' '}
                    <Text style={styles.bold}>Cancel Subscription</Text>
                  </Text>
                </View>
              </View>

              <AppButton
                title="Open Settings"
                onPress={() => {
                  handleOpenAppStore();
                  setShowInstructions(false);
                  onClose();
                }}
                leftIcon={ExternalLink}
                style={styles.openSettingsButton}
              />

              <Text style={styles.helpText}>
                Already cancelled?{' '}
                <Text style={styles.helpLink}>Tap 'Sync Subscription'</Text> in
                the main screen to update.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wp(5),
    maxHeight: hp(80),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: fp(2.4),
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonTop: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    zIndex: 10,
    padding: 4,
  },
  content: {
    marginBottom: hp(2),
  },
  planInfo: {
    backgroundColor: '#F3F4F6',
    padding: wp(4),
    borderRadius: 12,
    marginBottom: hp(2),
  },
  planLabel: {
    fontSize: fp(1.3),
    fontFamily: Fonts.regular,
    color: '#6B7280',
    marginBottom: 4,
  },
  planName: {
    fontSize: fp(2),
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  optionsList: {
    marginBottom: hp(2),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: hp(1.5),
  },
  dangerOption: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  optionIcon: {
    marginRight: wp(3),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fp(1.6),
    fontFamily: Fonts.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  optionDescription: {
    fontSize: fp(1.3),
    fontFamily: Fonts.regular,
    color: '#6B7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: wp(3),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: wp(2),
  },
  infoText: {
    flex: 1,
    fontSize: fp(1.3),
    fontFamily: Fonts.regular,
    color: '#92400E',
    lineHeight: fp(1.8),
  },
  successIcon: {
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  instructionsTitle: {
    fontSize: fp(2.4),
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  instructionsSubtitle: {
    fontSize: fp(1.5),
    fontFamily: Fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  stepsList: {
    marginBottom: hp(3),
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: fp(1.6),
    fontFamily: Fonts.bold,
  },
  stepText: {
    flex: 1,
    fontSize: fp(1.5),
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: fp(2.2),
  },
  bold: {
    fontFamily: Fonts.bold,
  },
  openSettingsButton: {
    marginBottom: hp(2),
  },
  helpText: {
    fontSize: fp(1.3),
    fontFamily: Fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: fp(1.8),
  },
  helpLink: {
    color: Colors.primary,
    fontFamily: Fonts.semibold,
  },
});

export default ManageSubscriptionModal;
