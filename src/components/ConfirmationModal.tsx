import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {AlertCircle, X} from 'lucide-react-native';
import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import AppButton from './AppButton';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  bulletPoints?: string[];
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  icon?: 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  bulletPoints = [],
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
  icon = 'info',
}) => {
  const getIconColor = () => {
    switch (icon) {
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'info':
      default:
        return Colors.primary;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (confirmButtonVariant) {
      case 'danger':
        return {backgroundColor: '#EF4444'};
      case 'success':
        return {backgroundColor: '#10B981'};
      case 'primary':
      default:
        return {backgroundColor: Colors.primary};
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.closeButton}
            disabled={loading}>
            <X size={fp(2.4)} color="#6B7280" />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}>
            <View style={styles.iconContainer}>
              <AlertCircle size={fp(5)} color={getIconColor()} />
            </View>

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.message}>{message}</Text>

            {bulletPoints.length > 0 && (
              <View style={styles.bulletContainer}>
                {bulletPoints.map((point, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <AppButton
              title={cancelText}
              onPress={onCancel}
              variant="outlined"
              style={styles.cancelButton}
              disabled={loading}
            />

            <AppButton
              title={confirmText}
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              style={[styles.confirmButton, getConfirmButtonStyle()]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: wp(5),
    width: '100%',
    maxWidth: 400,
    maxHeight: hp(80),
  },
  closeButton: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    maxHeight: hp(60),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  title: {
    fontSize: fp(2.2),
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  message: {
    fontSize: fp(1.6),
    fontFamily: Fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp(2),
    lineHeight: fp(2.2),
  },
  bulletContainer: {
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: hp(1),
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: fp(1.8),
    color: Colors.primary,
    marginRight: wp(2),
    fontFamily: Fonts.bold,
  },
  bulletText: {
    flex: 1,
    fontSize: fp(1.5),
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: fp(2),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(2),
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default ConfirmationModal;
