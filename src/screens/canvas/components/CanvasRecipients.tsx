import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors, Fonts, fp, wp } from '@utils/Constants';

const CanvasRecipients = ({recipients,selectedRecipient,setSelectedRecipient}) => {
    const renderItem = ({ item }) => {
      const recpBgColor = item?.meta_info?.recepient_color + "20";
        const recpBorderColor = item?.meta_info?.recepient_border_color;
        const email = item?.recepient_email;
        const selectedRecipientEmail = selectedRecipient?.recepient_email;
        
        
        return (
      <TouchableOpacity onPress={()=>setSelectedRecipient(item)} style={[styles.card, {
          backgroundColor: email === selectedRecipientEmail ? recpBgColor : 'transparent',
          borderColor:email === selectedRecipientEmail ?  recpBorderColor : Colors.border
            }]}>
          <View style={[styles.cardCircle,{
         
          borderColor:email === selectedRecipientEmail ?  recpBorderColor : Colors.placeholder
            
            }]}>
                    <Text style={[styles.cardCircleText, {
                  color: email === selectedRecipientEmail &&  recpBorderColor 
              }]}>
                  {item.recepient_name.slice(0,2)}
              </Text>
          </View>
      <Text numberOfLines={1} style={styles.recpName}>{item.recepient_name}</Text>
    </TouchableOpacity>
  )};

  return (
    <FlatList
      data={recipients}
      renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{gap:wp(2)}}
      horizontal={true}   // 🔥 This makes it horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
}

export default CanvasRecipients

const styles = StyleSheet.create({

    card: {
        borderWidth: 1.5,
        borderColor:'transparent',
        borderRadius: wp(2),
        gap: 4,
        alignItems: 'center',
        width: wp(18),
        height: wp(16),
        justifyContent:'center',padding:wp(2)
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
        textTransform:'uppercase',
    },
    recpName: {
        fontSize: fp(1.4),
        fontFamily: Fonts.Regular,
        color:Colors.text_secondary
    }

})