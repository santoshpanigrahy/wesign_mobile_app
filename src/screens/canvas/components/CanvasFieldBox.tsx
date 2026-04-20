import React, { useEffect, useRef } from 'react';
import { Text, Pressable, View, Image } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { FIELD_CONFIG, FIELD_ICONS, FIELD_NAMES } from '@utils/fieldConstants';
import RenderFieldContent from './RenderFieldContent';




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








  const dragRef = useRef();


  const translateX = useSharedValue(field.x * scale);
  const translateY = useSharedValue(field.y * scale);
  const width = useSharedValue(field.width * scale);
  const height = useSharedValue(field.height * scale);


  useEffect(() => {
    translateX.value = field.x * scale;
    translateY.value = field.y * scale;
    width.value = field.width * scale;
    height.value = field.height * scale;
  }, [field, scale]);

  // ================= DRAG =================
  const dragHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;

      // runOnJS(setShowToolbar)(false);

    },

    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      const newY = ctx.startY + event.translationY;

      const maxX = (pageWidth * scale) - width.value;
      const maxY = (pageHeight * scale) - height.value;

      translateX.value = Math.max(0, Math.min(newX, maxX));
      translateY.value = Math.max(0, Math.min(newY, maxY));
    },

    onEnd: () => {
      let finalX = translateX.value / scale;
      let finalY = translateY.value / scale;

      finalX = Math.max(0, Math.min(finalX, pageWidth - field.width));
      finalY = Math.max(0, Math.min(finalY, pageHeight - field.height));

      runOnJS(onUpdate)(field.id, {
        x: finalX,
        y: finalY,
      });
    },
  });


  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    width: width.value,
    height: height.value,
  }));



  return (
    <PanGestureHandler ref={dragRef} onGestureEvent={dragHandler}>
      <Animated.View
        style={[animatedStyle, { zIndex: isSelected ? 10 : 1 }]}
        pointerEvents="box-none"
      >

        <Pressable
          onPress={(e) => {
            e.stopPropagation();

            setShowToolbar(true);
            onSelect(field);
          }}
          pointerEvents="auto"
          style={{
            flex: 1,

            // justifyContent: 'center',
            // alignItems: 'center',
            // flexDirection: 'row',
            // gap: 5,
          }}
        >
          <RenderFieldContent isSelected={isSelected} field={field} onUpdate={onUpdate} />



        </Pressable>


        {isSelected && showToolbar && (
          <View
            style={{
              position: 'absolute',
              top: -35,
              left: '50%',
              transform: [{ translateX: "-50%" }],
              flexDirection: 'row',
              backgroundColor: '#000',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 4,
              zIndex: 1000,
              width: 200,
              justifyContent: 'space-evenly'
            }}
          >
            <Pressable onPress={(e) => {
              e.stopPropagation()
              onUpdate(field.id, { deleted: true });
            }}>
              <Text style={{ color: '#fff', fontSize: 10, marginHorizontal: 5 }}>
                Remove
              </Text>
            </Pressable>

            <Pressable onPress={(e) => {
              e.stopPropagation();
              onUpdate('edit', field);
              setShowToolbar(false);
            }} >
              <Text style={{ color: '#fff', fontSize: 10, marginHorizontal: 5 }}>
                Edit
              </Text>
            </Pressable>

            <Pressable onPress={(e) => {
              e.stopPropagation()
              onUpdate('duplicate', field);
              setShowToolbar(false);

            }} >
              <Text style={{ color: '#fff', fontSize: 10, marginHorizontal: 5 }}>
                Duplicate
              </Text>
            </Pressable>

            <Pressable onPress={(e) => {
              e.stopPropagation()
              onUpdate('resize', field);
              setShowToolbar(false);
            }} >
              <Text style={{ color: '#fff', fontSize: 10, marginHorizontal: 5 }}>
                Resize
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default React.memo(CanvasFieldBox);