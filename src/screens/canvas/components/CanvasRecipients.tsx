import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors, Fonts, fp, wp } from '@utils/Constants';

const RecipientItem = React.memo(({ item, isSelected, onPress }) => {
  const recpBgColor = item?.meta_info?.recepient_color + "20";
  const recpBorderColor = item?.meta_info?.recepient_border_color;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        isSelected && {
          backgroundColor: recpBgColor,
          borderColor: recpBorderColor,
        },
      ]}
    >
      <View
        style={[
          styles.cardCircle,
          {
            borderColor: isSelected
              ? recpBorderColor
              : Colors.placeholder,
          },
        ]}
      >
        <Text
          style={[
            styles.cardCircleText,
            isSelected && { color: recpBorderColor },
          ]}
        >
          {item.recepient_name?.slice(0, 2)}
        </Text>
      </View>

      <Text numberOfLines={1} style={styles.recpName}>
        {item.recepient_name}
      </Text>
    </TouchableOpacity>
  );
});

const CanvasRecipients = ({
  recipients,
  selectedRecipient,
  setSelectedRecipient,
}) => {
  const selectedEmail = selectedRecipient?.recepient_email;

  const renderItem = React.useCallback(({ item }) => {
    const isSelected = item?.recepient_email === selectedEmail;

    return (
      <RecipientItem
        item={item}
        isSelected={isSelected}
        onPress={() => setSelectedRecipient(item)}
      />
    );
  }, [selectedEmail, setSelectedRecipient]);

  const keyExtractor = React.useCallback(
    (item) => item.id?.toString(),
    []
  );

  return (
    <FlatList
      data={recipients}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews
    />
  );
};

export default CanvasRecipients

const styles = StyleSheet.create({

  listContainer: {
    gap: wp(2),
  },

  card: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: wp(2),
    gap: 4,
    alignItems: 'center',
    width: wp(18),
    height: wp(16),
    justifyContent: 'center', padding: wp(2)
  },
  cardCircle: {
    width: wp(6.5),
    height: wp(6.5),
    borderRadius: '50%',
    borderWidth: 1.3,
    justifyContent: 'center',
    // alignItems:'center',
  },
  cardCircleText: {
    textAlign: 'center',
    fontFamily: Fonts.Medium,
    fontSize: fp(1.3),
    color: Colors.text_primary,
    textTransform: 'uppercase',
  },
  recpName: {
    fontSize: fp(1.4),
    fontFamily: Fonts.Regular,
    color: Colors.text_secondary
  }

})