import React, { useState } from 'react';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import CanvasFieldBox from './CanvasFieldBox';
import FastImage from 'react-native-fast-image';
import { Colors } from '@utils/Constants';

const { width: screenWidth } = Dimensions.get('window');

const CanvasPage = ({
  page,
  fields,
  selectedField,
  setSelectedField,
  updateField,
  handleTap,
  setIsZoomed,
  isZoomed,
  setEnableResize,
  enableResize,
  showToolbar,
  setShowToolbar
}) => {
  const zoomScale = useSharedValue(1);


  const isZoomedShared = useSharedValue(false);

  const scale = screenWidth / page.width;
  const contentWidth = screenWidth;
  const contentHeight = page.height * scale;

  const handleZoomState = (newState) => {
    setIsZoomed(newState);
  };


  const isInteracting = useSharedValue(false);


  const hideToolbarOnInteraction = () => {
    if (showToolbar) setShowToolbar(false);
  };

  const showToolbarOnEnd = () => {
    if (selectedField) {
      setShowToolbar(true);
    }
  };

  const handleCanvasTap = (x, y) => {
    handleTap(
      {
        nativeEvent: {
          locationX: x,
          locationY: y,
        },
      },
      page
    );

    if (selectedField) setSelectedField(null);
    if (enableResize) setEnableResize(false);
  };

  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={{ width: contentWidth, height: contentHeight }}>
      <ResumableZoom
        maxScale={4}
        minScale={1}

        onTap={(e) => {
          'worklet';

          runOnJS(handleCanvasTap)(e.x, e.y);
        }}


        panEnabled={isZoomed}

        onUpdate={(e) => {
          'worklet';
          zoomScale.value = e.scale;
          const currentlyZoomed = e.scale > 1.05;


          // if (!isInteracting.value) {
          //   isInteracting.value = true;
          //   runOnJS(hideToolbarOnInteraction)();
          // }

          if (currentlyZoomed && !isZoomedShared.value) {
            isZoomedShared.value = true;
            runOnJS(handleZoomState)(true);
          } else if (!currentlyZoomed && isZoomedShared.value) {
            isZoomedShared.value = false;
            runOnJS(handleZoomState)(false);
          }
        }}

        onGestureEnd={() => {



          if (isInteracting.value) {
            isInteracting.value = false;
            runOnJS(showToolbarOnEnd)();
          }
        }}

      >

        <View
          style={{
            width: contentWidth,
            height: contentHeight,
            position: 'relative',
          }}
        // onTouchEnd={(e) => {
        //   if (selectedField) setSelectedField(null);
        //   if (enableResize) setEnableResize(false);

        //   handleTap(
        //     { nativeEvent: { locationX: e.nativeEvent.locationX, locationY: e.nativeEvent.locationY } },
        //     page
        //   );
        // }}
        >
          <FastImage
            style={{ width: '100%', height: '100%' }}
            source={{
              uri: page.url,
              priority: FastImage.priority.normal,
              // 'immutable' tells the app that the URL content never changes. 
              // It will aggressively load it from the disk cache instantly next time.
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />

          {imageLoading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}

          {fields
            .filter(
              (f) =>
                String(f.document_key) === String(page.document_key) &&
                f.page_no === page.page
            )
            .map((field) => (
              <CanvasFieldBox
                key={field.id}
                field={field}
                scale={scale}
                isSelected={selectedField?.id === field.id}
                onSelect={setSelectedField}
                onUpdate={updateField}
                pageWidth={page.width}
                pageHeight={page.height}
                showToolbar={showToolbar}
                setShowToolbar={setShowToolbar}
                zoomScale={zoomScale}
              />
            ))}
        </View>
      </ResumableZoom>
    </View>
  );
};

export default React.memo(CanvasPage);