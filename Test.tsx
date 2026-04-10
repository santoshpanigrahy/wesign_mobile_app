import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const BottomSheetTest = () => {
  // 1. Ref to control the sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 2. Snap points (where the sheet rests)
  // '25%' is peek, '50%' is half, '90%' is nearly full
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // 3. Callbacks to handle state changes
  const handleSheetChanges = useCallback((index: number) => {
    console.log('Sheet is now at index:', index);
  }, []);

  const handleOpenPress = () => bottomSheetRef.current?.snapToIndex(1);
  const handleClosePress = () => bottomSheetRef.current?.close();

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>WeSign Test Page</Text>
        <Button title="Open Half Sheet" onPress={handleOpenPress} />
        <View style={{ height: 20 }} />
        <Button title="Close Sheet" onPress={handleClosePress} color="red" />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0} // Starts at the first snap point (25%)
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true} // Allows swiping down to hide
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetText}>Awesome Bottom Sheet! 🎉</Text>
          <Text style={styles.subText}>You can drag this up or down.</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  sheetContent: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  sheetText: {
    fontSize: 20,
    fontWeight: '600',
  },
  subText: {
    marginTop: 10,
    color: '#666',
  },
});

export default BottomSheetTest;