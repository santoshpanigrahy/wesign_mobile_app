import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const NoteMeta = ({ field,updateFieldValue}) => {
    const fieldData = field?.field_data;
    const isLinkInserted = field?.is_link_inserted;
    const link_url = field?.external_link_url;
  return (
    <View style={{gap:hp(3)}}>
          <AppToggleButton label={'Insert Link'} value={isLinkInserted}  onToggle={(val) => {
    
              updateFieldValue('is_link_inserted',val)
             
          }} />

          {
              isLinkInserted &&  <TextInput     style={{padding:wp(3),borderWidth:1,borderColor:Colors.text_primary,fontFamily:Fonts.Regular}} placeholder='Enter link' placeholderTextColor={Colors.placeholder} value={link_url} onChangeText={(e) => {
                  updateFieldValue('external_link_url', e);
              }}/>
          }
          
          
          <View>
                    <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Note Text</Text>
              

              <TextInput   multiline={true}              // ✅ IMPORTANT
                numberOfLines={6}             // initial visible lines
                textAlignVertical="top"  style={{padding:wp(3),borderWidth:1,borderColor:Colors.text_primary,minHeight:hp(10),fontFamily:Fonts.Regular}} placeholder='Enter note text' placeholderTextColor={Colors.placeholder} value={fieldData} onChangeText={(e) => {
                  updateFieldValue('field_data', e);
              }}/>
          </View>
          



    </View>
  )
}

export default NoteMeta

const styles = StyleSheet.create({

      outerCircle: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop:3
  },
  innerCircle: {
    width: wp(2.4),
    height: wp(2.4),
    borderRadius: wp(1.2),
    backgroundColor: "#007AFF",
  },
})