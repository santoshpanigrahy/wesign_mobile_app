import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const CheckboxMeta = ({ field,updateFieldValue}) => {
    const fieldData = field?.field_data;
    const isChecked = field?.is_checked;
    
  return (
    <View style={{gap:hp(3)}}>
          <AppToggleButton label={'Checked'} value={isChecked}  onToggle={(val) => {
    
              updateFieldValue('is_checked',val)
             
          }} />

            <View >
                <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Value</Text>
          

           <TextInput     style={{padding:wp(3),borderWidth:1,borderColor:Colors.text_primary,fontFamily:Fonts.Regular,color:Colors.text_primary}} placeholder='Enter value' placeholderTextColor={Colors.placeholder} value={fieldData} onChangeText={(e) => {
                  updateFieldValue('field_data', e);
              }} />
              
              </View>
          
          
          
        
          



    </View>
  )
}

export default CheckboxMeta

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