import React, { useState } from 'react';
import { View, Image, Dimensions } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

import { runOnJS } from 'react-native-reanimated';
import CanvasFieldBox from './CanvasFieldBox';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CanvasPage = ({
  page,
  fields,
  selectedField,
  setSelectedField,
  updateField,
  handleTap,
  setIsZoomed,
  setEnableResize,
  enableResize,
  showToolbar,setShowToolbar
}) => {
  const scale = screenWidth / page.width;

  const [zoomScale, setZoomScale] = useState(1);

  const contentWidth = screenWidth;
  const contentHeight = page.height * scale;

  return (
    <View
      style={{
        width: contentWidth,
        height: contentHeight,
      }}
    >
      <ImageZoom
  cropWidth={screenWidth}
  cropHeight={contentHeight}
  imageWidth={contentWidth}
  imageHeight={contentHeight}
  minScale={1}
  maxScale={4}
        enableCenterFocus={false}
        
        onMove={(e) => {
    const zoomed = e.scale > 1.01;
  runOnJS(setZoomScale)(e.scale);
  runOnJS(setIsZoomed)(zoomed);
}}
  onClick={(e) => {
    // ✅ FIXED
    const locationX = e.locationX;
    const locationY = e.locationY;

    if (selectedField) {
      setSelectedField(null);
    }

    if (enableResize) {
      
      setEnableResize(false);
      
    }

    handleTap(
      {
        nativeEvent: {
          locationX,
          locationY,
        },
      },
      page
    );
  }}
>
        <View
          style={{
            width: contentWidth,
            height: contentHeight,
            position: 'relative',
          }}
        >
          {/* IMAGE */}
          <Image
            source={{ uri: page.url }}
            style={{ width: '100%', height: '100%' }}
          />

          {/* FIELDS */}
          {fields
            .filter(
              (f) =>
                String(f.document_key) ===
                  String(page.document_key) &&
                f.page === page.page
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
                zoomScale={zoomScale}
                                  showToolbar={showToolbar}
                  setShowToolbar={setShowToolbar}
              />
            ))}
        </View>
      </ImageZoom>
    </View>
  );
};

export default React.memo(CanvasPage);