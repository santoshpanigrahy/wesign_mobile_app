import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, fp, wp } from '@utils/Constants';
import { Portal } from '@gorhom/portal';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onSave: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  saveText?: string;
};

const ConfirmExitModal = ({
  visible,
  title = 'Discard changes?',
  description = 'You have unsaved changes. If you leave, they will be lost.',
  onCancel,
  onConfirm,
  onSave,
  confirmText = 'Discard',
  cancelText = 'Stay',
  saveText = "Save & Close"
}: Props) => {
  console.log(visible)

  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))}

      exiting={FadeOut.duration(100)}
      style={styles.overlay}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>

          <View style={styles.actions}>

            <TouchableOpacity onPress={onSave} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{saveText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.cancelBtn}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>


          </View>

        </View>
      </View>

    </Animated.View>


  );
};

export default ConfirmExitModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,

    zIndex: 9999,


  },
  container: {
    width: wp(85),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    marginBottom: 8,
  },
  desc: {
    fontSize: fp(1.7),
    fontFamily: Fonts.Regular,
    color: Colors.text_secondary,
    marginBottom: 20,
  },
  actions: {
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: wp(2),
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  cancelText: {
    fontSize: fp(1.6),
    color: Colors.primary,
    fontFamily: Fonts.SemiBold
  },
  confirmText: {
    fontSize: fp(1.6),
    color: Colors.primary,

    //    color: Colors.text_primary,
    fontFamily: Fonts.SemiBold

  },
});