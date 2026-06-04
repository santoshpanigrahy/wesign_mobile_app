import React, { forwardRef, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle } from "react-native";
import BottomSheet, {
    BottomSheetView,
    BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import { X } from "lucide-react-native";
import { Colors, Fonts, fp, wp } from "@utils/Constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    children: React.ReactNode;
    title?: string;
    withCloseBtn?: boolean;
    containerStyle?: ViewStyle;
    // New prop to toggle between fixed snap points and content height
    autoHeight?: boolean;
    snapPoints?: (string | number)[];
};

const AppNewBottomSheet = forwardRef<BottomSheet, Props>(
    (
        {
            children,
            title,
            withCloseBtn = true,
            containerStyle = {},
            autoHeight = true, // Default to true for "content height"
            snapPoints,
        },
        ref
    ) => {
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
            []
        );

        const inset = useSafeAreaInsets();

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                topInset={inset.top}
                bottomInset={inset.bottom}
                // 1. If autoHeight is true, don't pass snapPoints
                snapPoints={autoHeight ? undefined : snapPoints}
                // 2. Enable Dynamic Sizing
                enableDynamicSizing={autoHeight}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.handleIndicator}
                backgroundStyle={styles.sheetBg}
            >
                {/* 3. Use BottomSheetView for auto-calculation */}
                <BottomSheetView style={[styles.content, containerStyle]}>
                    {(title || withCloseBtn) && (
                        <View style={styles.bottomSheetHeader}>
                            <Text style={styles.bottomSheetHeaderText}>{title}</Text>
                            {withCloseBtn && (
                                <TouchableOpacity
                                    onPress={() => (ref as any)?.current?.close()}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <X color={Colors.text} size={wp(6)} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View style={styles.childrenContainer}>
                        {children}
                    </View>
                </BottomSheetView>
            </BottomSheet>
        );
    }
);

export default AppNewBottomSheet;

const styles = StyleSheet.create({
    sheetBg: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    content: {
        // 4. CRITICAL: Remove flex: 1 for autoHeight
        paddingBottom: 40,
    },
    childrenContainer: {
        paddingHorizontal: wp(5),
    },
    handleIndicator: {
        width: 40,
        height: 4,
        backgroundColor: "#E0E0E0",
        alignSelf: "center",
        borderRadius: 2,
        marginTop: 8,
        // display: 'none'
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        // paddingVertical: 15,
    },
    bottomSheetHeaderText: {
        fontFamily: Fonts.SemiBold,
        fontSize: fp(2.2),
        color: Colors.text
    }
});