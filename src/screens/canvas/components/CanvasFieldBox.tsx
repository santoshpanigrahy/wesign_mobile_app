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


  
  const config = FIELD_CONFIG[field.field_name] || {};
const Icon = config.icon;
const name = config.label;
  
  

  const dragRef = useRef();

  // ✅ Position + size (based on PDF scale only)
  const translateX = useSharedValue(field.x * scale);
  const translateY = useSharedValue(field.y * scale);
  const width = useSharedValue(field.width * scale);
  const height = useSharedValue(field.height * scale);

  // ✅ Sync when field updates
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
     const newX = ctx.startX + event.translationX / zoomScale;
const newY = ctx.startY + event.translationY / zoomScale;

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

  // ================= STYLE =================
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
        {/* FIELD BOX */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            // ✅ VERY IMPORTANT
            setShowToolbar(true);
    onSelect(field);
  }}
          pointerEvents="auto"
          style={{
            flex: 1,
            borderWidth: 1,
            borderStyle: isSelected ? 'dashed' : 'solid',
            borderColor: field?.recipient_color || '#000',
            backgroundColor: isSelected
              ? field?.recipient_color + '40'
              : field?.recipient_color,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5,
          }}
        >
          {Icon && (
            <Icon
              size={10}
              color={isSelected ? field?.recipient_color : '#fff'}
            />
          )}
          {
            name &&  <Text
            style={{
              fontSize: 10,
              color: isSelected ? field?.recipient_color : '#fff',
            }}
          >
            {name}
          </Text>
          }


           {
            field?.field_data &&  <Text
            style={{
              fontSize: 10,
              color: isSelected ? field?.recipient_color : '#fff',
            }}
          >
            {field?.field_data}
          </Text>
          }
         

          {field.is_prefilled_field && field.image_base_64 &&
  <Image source={{ uri: field.image_base_64 }} style={{ width: '100%', height: '100%' }}  onLoad={(e) => {
    const { width, height } = e.nativeEvent.source;

    const imgAR = width / height;
    const boxW = field.width;
    const boxH = field.height;
    const boxAR = boxW / boxH;

    let finalW, finalH;

    if (imgAR > boxAR) {
      finalH = boxH;
      finalW = boxH * imgAR;
    } else {
      finalW = boxW;
      finalH = boxW / imgAR;
    }

    onUpdate(field.id, {
      width: finalW,
      height: finalH,
    });
  }} />
}
        </Pressable>

        {/* ACTION TOOLBAR */}
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
              justifyContent:'space-evenly'
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