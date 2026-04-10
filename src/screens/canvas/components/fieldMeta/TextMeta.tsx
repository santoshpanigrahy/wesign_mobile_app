import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const TextMeta = ({ field,updateFieldValue}) => {
    const instruction = field?.instruction;
    const isRequired = field?.required_field_checkbox;
  return (
    <View style={{gap:hp(3)}}>
          <AppToggleButton label={'Required'} value={isRequired}  onToggle={(val) => {
    
              updateFieldValue('required_field_checkbox',val)
             
          }} />
          
          <View>
                    <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Instruction</Text>
              

              <TextInput   multiline={true}              // ✅ IMPORTANT
    numberOfLines={6}             // initial visible lines
  textAlignVertical="top"  style={{padding:wp(3),borderWidth:1,borderColor:Colors.text_primary,minHeight:hp(10),fontFamily:Fonts.Regular}} placeholder='Enter instruction' placeholderTextColor={Colors.placeholder} value={instruction} onChangeText={(e) => {
                  updateFieldValue('instruction', e);
              }}/>
          </View>
          



    </View>
  )
}

export default TextMeta

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