import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import RenderFieldContent from './RenderFieldContent';
import { Colors, fp, wp } from '@utils/Constants';

const CanvasFieldBox = ({
  field,
  scale,
  isSelected,
  onSelect,
  onUpdate,
  pageWidth,
  pageHeight,
  zoomScale,
  showToolbar,
  setShowToolbar
}) => {

  const translateX = useSharedValue(field.x * scale);
  const translateY = useSharedValue(field.y * scale);
  const width = useSharedValue(field.width * scale);
  const height = useSharedValue(field.height * scale);

  const [showTempToolbar, setShowTempToolbar] = useState(true);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateX.value = field.x * scale;
    translateY.value = field.y * scale;
    width.value = field.width * scale;
    height.value = field.height * scale;
  }, [field, scale]);


  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;

      runOnJS(setShowTempToolbar)(false);
    })
    .onUpdate((event) => {

      const currentZoom = zoomScale.value;
      const newX = startX.value + (event.translationX / currentZoom);
      const newY = startY.value + (event.translationY / currentZoom);

      const maxX = (pageWidth * scale) - width.value;
      const maxY = (pageHeight * scale) - height.value;

      translateX.value = Math.max(0, Math.min(newX, maxX));
      translateY.value = Math.max(0, Math.min(newY, maxY));
    })
    .onEnd(() => {
      let finalX = translateX.value / scale;
      let finalY = translateY.value / scale;

      finalX = Math.max(0, Math.min(finalX, pageWidth - field.width));
      finalY = Math.max(0, Math.min(finalY, pageHeight - field.height));

      runOnJS(onUpdate)(field.id, {
        x: finalX,
        y: finalY,
      });
    })
    .onFinalize(() => {
      runOnJS(setShowTempToolbar)(true);
    });


  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(setShowToolbar)(true);
      runOnJS(onSelect)(field);
    });


  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);


  const autoSizeFields = [
    'my_date_signed', 'my_full_name', 'my_email',
    'my_company', 'full_name', 'email', 'plain_text'
  ];

  const noResizeFields = [
    'my_date_signed', 'my_full_name', 'my_email',
    'my_company', 'full_name', 'email', 'plain_text'
  ];

  const isNoSizedField = noResizeFields.includes(field.field_name);
  const isAutoSized = autoSizeFields.includes(field.field_name);

  const handleLayout = (event) => {
    if (isAutoSized) {
      const { width: layoutW, height: layoutH } = event.nativeEvent.layout;
      width.value = layoutW;
      height.value = layoutH;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    width: isAutoSized ? 'auto' : width.value,
    height: isAutoSized ? 'auto' : height.value,
  }));



  const removeTap = Gesture.Tap().onEnd(() => {
    runOnJS(onUpdate)(field.id, { deleted: true });
  });

  const editTap = Gesture.Tap().onEnd(() => {
    runOnJS(onUpdate)('edit', field);
    runOnJS(setShowToolbar)(false);
  });

  const duplicateTap = Gesture.Tap().onEnd(() => {
    runOnJS(onUpdate)('duplicate', field);
    runOnJS(setShowToolbar)(false);
  });

  const resizeTap = Gesture.Tap().onEnd(() => {
    runOnJS(onUpdate)('resize', field);
    runOnJS(setShowToolbar)(false);
  });



  const toolbarAnimatedStyle = useAnimatedStyle(() => {

    const invScale = 1 / zoomScale.value;


    const TOOLBAR_W = 280;
    const TOOLBAR_H = 35;
    const GAP = 15;


    const effW = TOOLBAR_W * invScale;
    const effH = TOOLBAR_H * invScale;
    const effGap = GAP * invScale;

    const fW = width.value;
    const fH = height.value;
    const fX = translateX.value;
    const fY = translateY.value;


    let desiredCenterX = fW / 2;
    let desiredCenterY = -effGap - (effH / 2);


    if (fY - effGap - effH < 0) {
      desiredCenterY = fH + effGap + (effH / 2);
    }


    if (fX + desiredCenterX - (effW / 2) < 10) {
      desiredCenterX = (effW / 2) - fX + 10;
    }


    const canvasWidth = pageWidth * scale;
    if (fX + desiredCenterX + (effW / 2) > canvasWidth - 10) {
      desiredCenterX = canvasWidth - fX - (effW / 2) - 10;
    }


    return {
      position: 'absolute',

      left: desiredCenterX - (TOOLBAR_W / 2),
      top: desiredCenterY - (TOOLBAR_H / 2),
      width: TOOLBAR_W,
      height: TOOLBAR_H,
      transform: [{ scale: invScale }]
    };
  });
  return (
    <Animated.View onLayout={handleLayout} style={[animatedStyle, { zIndex: isSelected ? 10 : 1 }]}
      pointerEvents="box-none"
    >

      <GestureDetector gesture={composedGesture}>
        <View style={{ flex: 1 }} pointerEvents="auto" >
          <RenderFieldContent isSelected={isSelected} field={field} onUpdate={onUpdate} />
        </View>
      </GestureDetector>


      {isSelected && showToolbar && showTempToolbar && (
        <Animated.View
          style={[
            toolbarAnimatedStyle,
            {
              flexDirection: 'row',
              backgroundColor: '#000',
              borderRadius: 20,
              paddingHorizontal: 3,
              // paddingVertical: 4,
              zIndex: 1000,
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: 280
            }
          ]}
        >
          <GestureDetector gesture={removeTap}>
            <View hitSlop={10} style={styles.toolBarButton}>
              <Text style={styles.toolBarBtnText}>Remove</Text>
            </View>
          </GestureDetector>

          <View style={styles.hr} />

          <GestureDetector gesture={editTap} >
            <View hitSlop={10} style={styles.toolBarButton}>
              <Text style={styles.toolBarBtnText}>Edit</Text>
            </View>
          </GestureDetector>
          <View style={styles.hr} />


          <GestureDetector gesture={duplicateTap}>
            <View hitSlop={10} style={styles.toolBarButton}>
              <Text style={styles.toolBarBtnText}>Duplicate</Text>
            </View>
          </GestureDetector>

          {
            !isNoSizedField && <>


              <View style={styles.hr} />


              <GestureDetector gesture={resizeTap}>
                <View hitSlop={10} style={styles.toolBarButton}>
                  <Text style={styles.toolBarBtnText}>Resize</Text>
                </View>
              </GestureDetector>
            </>
          }

        </Animated.View>
      )}
    </Animated.View>
  );
};

export default React.memo(CanvasFieldBox);

const styles = StyleSheet.create({
  toolBarButton: {
    paddingHorizontal: wp(1),
  },
  toolBarBtnText: {
    fontSize: fp(1.8),
    color: Colors.white
  },
  hr: {
    height: '100%',
    backgroundColor: Colors.white,
    width: 1
  }

});