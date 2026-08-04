import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Keyboard, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Colors, Fonts, fp, wp } from '@utils/Constants';
import { useKeyboard } from '@utils/documentService';

type Props = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableScroll?: boolean;
  title?: string;
  withCloseBtn?: boolean;
  containerStyle?: any;
};

const AppBottomSheet = forwardRef<any, Props>(
  (
    {
      children,
      snapPoints,
      title = '',
      withCloseBtn = true,
      containerStyle = {},
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const inset = useSafeAreaInsets();
    const isKeyboardOpen = useKeyboard();

    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      open: () => setVisible(true),
      expand: () => setVisible(true),
      close: () => setVisible(false),
      dismiss: () => setVisible(false),
      snapToIndex: () => setVisible(true),
    }));

    const closeSheet = () => {
      Keyboard.dismiss();

      if (isKeyboardOpen) {
        setTimeout(() => {
          setVisible(false);
        }, 250);
      } else {
        setVisible(false);
      }
    };


    // 👈 2. Check if a snapPoint was actually provided
    const firstSnapPoint = snapPoints?.[0];
    const hasFixedSnapPoint = firstSnapPoint !== undefined;

    const height = typeof firstSnapPoint === 'string'
      ? firstSnapPoint
      : `${firstSnapPoint}%`;



    return (
      <View pointerEvents='box-none'>
        <Modal
          isVisible={visible}
          onBackdropPress={closeSheet}
          onBackButtonPress={closeSheet}
          style={styles.modal}
          hideModalContentWhileAnimating
          backdropOpacity={0.3}
          avoidKeyboard
          propagateSwipe={true}
          // Smooth slide-up bottom sheet animation defaults
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriverForBackdrop
        >
          <View
            style={[
              styles.container,
              {
                paddingBottom: inset.bottom,
              },
              // 👈 3. Only apply fixed height if snapPoints are passed
              hasFixedSnapPoint && { height: height as any },
              containerStyle,
            ]}
          >
            {(title || withCloseBtn) && (
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetHeaderText}>{title}</Text>

                {withCloseBtn && (
                  <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X color={Colors.text_primary} strokeWidth={1.4} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 🌟 THIS WRAPPER FIXES THE CHILD LAYOUT ISSUE AUTOMATICALLY */}
            <View style={[
              styles.contentBody,
              // 👈 4. Remove flex: 1 if auto-height, otherwise content collapses
              !hasFixedSnapPoint && { flex: undefined }
            ]}>
              {children}
            </View>
          </View>
        </Modal>
      </View>

    );
  },
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  modal: {
    // flex: 1,
    justifyContent: 'flex-end',
    margin: 0,

  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp(5),
    width: '100%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  bottomSheetHeaderText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary,
  },
  contentBody: {
    // flex: 1, // 👈 Ensures children scale properly without screen-level View wrappers
    width: '100%',
  },
});