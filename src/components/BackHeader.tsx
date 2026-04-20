import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ArrowLeft } from 'lucide-react-native'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const BackHeader = ({ screenName, goBack }) => {
  return (
    <View style={{ height: hp(6.5), flexDirection: "row", alignItems: "center", gap: wp(1), paddingHorizontal: wp(2), borderBottomWidth: 1, borderBottomColor: Colors.border }}>

      <TouchableOpacity onPress={goBack} style={{ width: wp(10), height: "100%", alignItems: "center", justifyContent: "center" }}>

        <ArrowLeft size={wp(6)} color={Colors.text_primary} />
      </TouchableOpacity>
      <Text style={{ color: Colors.text_primary, fontFamily: Fonts.SemiBold, fontSize: fp(1.8) }}>{screenName}</Text>
    </View>
  )
}

export default BackHeader

const styles = StyleSheet.create({})