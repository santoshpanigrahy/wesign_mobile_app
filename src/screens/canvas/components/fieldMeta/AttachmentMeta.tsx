import {  StyleSheet, View } from 'react-native'
import React from 'react'
import AppToggleButton from '@components/AppToggleButton'
import {  hp, wp } from '@utils/Constants'

const AttachmentMeta = ({ field,updateFieldValue}) => {
    
    const isRequired = field?.required_field_checkbox;
  return (
    <View style={{gap:hp(3)}}>
          <AppToggleButton label={'Required'} value={isRequired}  onToggle={(val) => {
    
              updateFieldValue('required_field_checkbox',val)
             
          }} />
          
         



    </View>
  )
}

export default AttachmentMeta

