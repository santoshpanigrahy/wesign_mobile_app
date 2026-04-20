import React, {
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { X } from "lucide-react-native";
import { Colors, Fonts, fp, wp } from "@utils/Constants";

type Props = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableScroll?: boolean;
  title?: String,
  withCloseBtn?: boolean,

};

const AppBottomSheet = forwardRef<any, Props>(
  (
    {
      children,
      snapPoints = ["25%", "50%", "90%"],
      enableScroll = false,
      title = null,
      withCloseBtn = true,
      containerStyle = {}
    },
    ref
  ) => {
    const memoSnapPoints = useMemo(() => snapPoints, []);


    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close" // ✅ close on outside click
          opacity={0.3} // ✅ rgba(0,0,0,0.3)
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={memoSnapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // enableContentPanningGesture={false}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
        style={{ zIndex: 9999 }}

      >
        {/* {enableScroll ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >

             <View style={styles.bottomSheetHeader}>
                                <Text style={styles.bottomSheetHeaderText}>{title}</Text>

                               {withCloseBtn &&  <TouchableOpacity onPress={() => ref?.current?.close()}>
          <X color={Colors.text_primary} strokeWidth={1.4} />
        </TouchableOpacity>} 
                            </View>
            {children}
          </BottomSheetScrollView>
        ) : ( */}
        {/* <BottomSheetView style={styles.content}> */}

        <View style={[styles.content, containerStyle]}>

          {
            (title || withCloseBtn) && <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetHeaderText}>{title}</Text>

              {withCloseBtn && <TouchableOpacity onPress={() => ref?.current?.close()}>
                <X color={Colors.text_primary} strokeWidth={1.4} />
              </TouchableOpacity>}
            </View>
          }


          <View style={{ flex: 1 }}>
            {children}
          </View>

        </View>


        {/* </BottomSheetView> */}
        {/* )} */}
      </BottomSheet>
    );
  }
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 2,
    display: 'none'
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheetHeaderText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary

  }
});