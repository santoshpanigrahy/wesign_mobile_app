import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const BottomSheetDemo = () => {
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handleOpen = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={handleOpen} />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.text}>🔥 Gorhom Bottom Sheet Working!</Text>
          <Button title="Close" onPress={handleClose} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default BottomSheetDemo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});