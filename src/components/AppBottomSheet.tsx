// import React, { forwardRef, useMemo, useCallback } from 'react';
// import { StyleSheet, TouchableOpacity, View, Text, Keyboard } from 'react-native';
// import BottomSheet, {
//   BottomSheetView,
//   BottomSheetBackdrop,
//   BottomSheetScrollView,
// } from '@gorhom/bottom-sheet';

// import { X } from 'lucide-react-native';
// import { Colors, Fonts, fp, wp } from '@utils/Constants';
// import { useKeyboard } from '@utils/documentService';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// type Props = {
//   children: React.ReactNode;
//   snapPoints?: (string | number)[];
//   enableScroll?: boolean;
//   title?: String;
//   withCloseBtn?: boolean;
// };

// const AppBottomSheet = forwardRef<any, Props>(
//   (
//     {
//       children,
//       snapPoints = ['25%', '50%', '90%'],
//       enableScroll = false,
//       title = null,
//       withCloseBtn = true,
//       containerStyle = {},
//     },
//     ref,
//   ) => {
//     const isKeyboardOpen = useKeyboard();

//     const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);

//     const renderBackdrop = useCallback(
//       (props: any) => (
//         <BottomSheetBackdrop
//           {...props}
//           appearsOnIndex={0}
//           disappearsOnIndex={-1}

//           pressBehavior="close" // ✅ close on outside click
//           opacity={0.3} // ✅ rgba(0,0,0,0.3)
//         />
//       ),
//       [],
//     );
//     const inset = useSafeAreaInsets();
//     return (
//       <BottomSheet
//         ref={ref}
//         index={-1}
//         snapPoints={memoSnapPoints}
//         enablePanDownToClose
//         enableDynamicSizing={false}
//         topInset={inset.top}
//         bottomInset={inset.bottom}
//         backdropComponent={renderBackdrop}
//         keyboardBehavior="extend" // "extend" or "fillParent" prevents the hovering bug
//         keyboardBlurBehavior="none" // Change this from "restore" to "none"
//         // enableContentPanningGesture={false}
//         handleIndicatorStyle={styles.handle}
//         backgroundStyle={styles.sheetBg}
//         style={{ zIndex: 99 }}>
//         {/* {enableScroll ? (
//           <BottomSheetScrollView
//             contentContainerStyle={styles.content}
//             showsVerticalScrollIndicator={false}
//           >

//              <View style={styles.bottomSheetHeader}>
//                                 <Text style={styles.bottomSheetHeaderText}>{title}</Text>

//                                {withCloseBtn &&  <TouchableOpacity onPress={() => ref?.current?.close()}>
//           <X color={Colors.text_primary} strokeWidth={1.4} />
//         </TouchableOpacity>}
//                             </View>
//             {children}
//           </BottomSheetScrollView>
//         ) : ( */}
//         {/* <BottomSheetView style={styles.content}> */}

//         <View
//           style={[
//             styles.content,
//             containerStyle,
//             { paddingTop: snapPoints[0] === '100%' ? inset.top : 0 },
//           ]}>
//           {(title || withCloseBtn) && (
//             <View style={styles.bottomSheetHeader}>
//               <Text style={styles.bottomSheetHeaderText}>{title}</Text>

//               {withCloseBtn && (
//                 <TouchableOpacity
//                   onPress={() => {
//                     Keyboard.dismiss(); // 👈 Dismiss the keyboard first
//                     if (isKeyboardOpen) {
//                       setTimeout(() => {
//                         ref?.current?.close();
//                       }, 250);
//                     } else {
//                       ref?.current?.close();
//                     }
//                   }}>
//                   <X color={Colors.text_primary} strokeWidth={1.4} />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           <View style={{ flex: 1 }}>{children}</View>
//         </View>

//         {/* </BottomSheetView> */}
//         {/* )} */}
//       </BottomSheet>
//     );
//   },
// );

// export default AppBottomSheet;

// const styles = StyleSheet.create({
//   sheetBg: {
//     backgroundColor: '#fff',
//     // borderTopLeftRadius: 20,
//     // borderTopRightRadius: 20,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: wp(5),
//     paddingBottom: 40,
//   },
//   handle: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#ccc',
//     alignSelf: 'center',
//     borderRadius: 2,
//     display: 'none',
//   },
//   bottomSheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   bottomSheetHeaderText: {
//     fontFamily: Fonts.Regular,
//     fontSize: fp(2),
//     color: Colors.text_primary,
//   },
// });

import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Keyboard} from 'react-native';
import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {X} from 'lucide-react-native';

import {Colors, Fonts, fp, wp} from '@utils/Constants';
import {useKeyboard} from '@utils/documentService';

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
      snapPoints = ['50%'],
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
      snapToIndex: () => setVisible(true), // compatibility
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

    const firstSnapPoint = snapPoints?.[0];
    const height =
      typeof firstSnapPoint === 'string'
        ? firstSnapPoint
        : `${firstSnapPoint}%`;

    return (
      <Modal
        isVisible={visible}
        onBackdropPress={closeSheet}
        onBackButtonPress={closeSheet}
        // swipeDirection="down"
        // onSwipeComplete={closeSheet}
        scrollTo={() => {}}
        scrollOffset={1}
        scrollOffsetMax={400}
        style={styles.modal}
        backdropOpacity={0.3}
        avoidKeyboard
        propagateSwipe={true}>
        <View
          style={[
            styles.container,
            {
              height,
              paddingTop: height === '100%' ? inset.top : 0,
              paddingBottom: inset.bottom,
            },
            containerStyle,
          ]}>
          {(title || withCloseBtn) && (
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetHeaderText}>{title}</Text>

              {withCloseBtn && (
                <TouchableOpacity onPress={closeSheet}>
                  <X color={Colors.text_primary} strokeWidth={1.4} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{flex: 1}}>{children}</View>
        </View>
      </Modal>
    );
  },
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp(5),
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
  },
  bottomSheetHeaderText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary,
  },
});
