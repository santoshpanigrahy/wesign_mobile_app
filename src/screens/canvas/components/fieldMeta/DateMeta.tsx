import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { ChevronDown } from 'lucide-react-native'
import AppToggleButton from '@components/AppToggleButton'

const DateMeta = ({ field, setField, openDateFormatPicker, updateFieldValue }) => {
  const dateFormat = field?.date_format || "MM/DD/YYYY";
  const isRequired = field?.required_field_checkbox;

  return (
    <View style={{ gap: hp(3.5) }}>
      <AppToggleButton label={'Required'} value={isRequired} onToggle={(val) => {

        updateFieldValue('required_field_checkbox', val)

      }} />
      <View>


        <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Select Date Format</Text>


        <Pressable onPress={() => openDateFormatPicker()} style={{ height: hp(6), flexDirection: 'row', paddingHorizontal: wp(5), backgroundColor: Colors.white, borderColor: Colors.text_primary, borderWidth: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9) }}>{dateFormat}</Text>


          <ChevronDown size={fp(2)} color={Colors.text_primary} />
        </Pressable>

      </View>


    </View>
  )
}

export default DateMeta

const styles = StyleSheet.create({})