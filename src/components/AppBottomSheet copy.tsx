import React, { forwardRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Keyboard } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';

import { X } from 'lucide-react-native';
import { Colors, Fonts, fp, wp } from '@utils/Constants';
import { useKeyboard } from '@utils/documentService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableScroll?: boolean;
  title?: String;
  withCloseBtn?: boolean;
  containerStyle?: any;
};

const AppBottomSheet = forwardRef<any, Props>(
  (
    {
      children,
      snapPoints = ['25%', '50%', '90%'],
      enableScroll = false,
      title = null,
      withCloseBtn = true,
      containerStyle = {},
    },
    ref,
  ) => {
    const isKeyboardOpen = useKeyboard();
    const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);
    const inset = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.3}
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={memoSnapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        topInset={inset.top}
        bottomInset={inset.bottom}
        animateOnMount={true}
        backdropComponent={renderBackdrop}

        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"

        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
        style={{ zIndex: 99 }}>

        <View
          style={[
            styles.content,
            containerStyle,
            { paddingTop: snapPoints[0] === '100%' ? inset.top : 0 },
          ]}>
          {(title || withCloseBtn) && (
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetHeaderText}>{title}</Text>

              {withCloseBtn && (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    ref?.current?.close();
                  }}>
                  <X color={Colors.text_primary} strokeWidth={1.4} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </BottomSheet>
    );
  },
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 2,
    display: 'none',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bottomSheetHeaderText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary,
  },
});