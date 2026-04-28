import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';

// Importing your responsive dimensions
import {
  responsiveWidth as wp,
  responsiveHeight as hp,
  responsiveFontSize as fp,
} from 'react-native-responsive-dimensions';

const DeleteEnvelopeModal = ({ isVisible, onClose, onDelete }) => {

  if (!isVisible) return null
  return (

    <TouchableWithoutFeedback onPress={onClose} style={styles.overlay}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Delete Envelope</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={wp(6)} color="#333" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.bodyText}>
                You can find all your deleted envelopes in your Deleted bin within{' '}
                <Text style={styles.boldText}>24 hours</Text> before they're removed permanently.
              </Text>

              <Text style={[styles.bodyText, { marginTop: hp(2) }]}>
                Document will be permanently deleted after{' '}
                <Text style={styles.boldText}>1 week</Text>.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>

  );
};

export default DeleteEnvelopeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
    zIndex: 99
  },
  modalContainer: {
    width: wp(90),
    backgroundColor: '#ffffff',
    borderRadius: wp(1.5),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#ebebeb',
  },
  headerTitle: {
    // f=2.2 is roughly 18-20px depending on device diagonal
    fontSize: fp(2.2),
    fontWeight: '700',
    color: '#2C3E50',
  },
  body: {
    padding: wp(5),
    paddingBottom: hp(4),
  },
  bodyText: {
    // f=1.8 is roughly 15-16px depending on device diagonal
    fontSize: fp(1.8),
    color: '#4A4A4A',
    lineHeight: fp(2.6),
  },
  boldText: {
    fontWeight: '700',
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: wp(4.5),
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    backgroundColor: '#fff',
  },
  cancelButton: {
    marginRight: wp(6),
  },
  cancelText: {
    fontSize: fp(1.8),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center'
  },
  deleteButton: {
    backgroundColor: '#EE5E5E', // Red/coral color from the image
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(6),
    borderRadius: wp(1),

  },
  deleteText: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: "center"
  },
});