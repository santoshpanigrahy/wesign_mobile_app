import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const SignatureMeta = ({ field,setField}) => {
    const include_date_name = field?.include_date_name;
    const signature_with_border = field?.signature_with_border;
  return (
    <View style={{gap:hp(4)}}>
          <AppToggleButton label={'Signature With Date and Time'} value={include_date_name}  onToggle={(val) => {
    setField((prev) => ({
      ...prev,
      include_date_name: val
    }));
  }} />
          
          <View>
                   <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(1.2),color:Colors.text_primary}}>Choose Signature Type</Text>
             
            <Pressable onPress={() => setField((prev) => ({...prev,signature_with_border: true}))} style={{height:hp(7),borderWidth:1,borderColor:signature_with_border ? Colors.primary : Colors.border,paddingHorizontal:wp(3),flexDirection:'row',alignItems:'center',gap:wp(3)}}>
                  
                      <View style={styles.outerCircle}>
                                                       {signature_with_border && <View style={styles.innerCircle} />}

                               </View>

                      <Text style={{fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>Signature with border</Text>
                  

                  
              </Pressable>

              <Pressable onPress={() => setField((prev) => ({...prev,signature_with_border: false}))} style={{height:hp(7),borderWidth:1,borderColor:!signature_with_border ? Colors.primary : Colors.border,paddingHorizontal:wp(3),flexDirection:'row',alignItems:'center',gap:wp(3),marginTop:hp(1.5)}}>
                  
                      <View style={styles.outerCircle}>
                      {!signature_with_border && <View style={styles.innerCircle} />}
                               </View>

                      <Text style={{fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>Signature without border</Text>
                  

                  
              </Pressable>
          </View>

    </View>
  )
}

export default SignatureMeta

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