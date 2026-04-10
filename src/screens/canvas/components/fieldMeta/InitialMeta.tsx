import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'

const InitialMeta = ({ field,setField}) => {
    
    const initial_with_border = field?.initial_with_border;
  return (
    <View style={{gap:hp(4)}}>
       
          
          <View>
                   <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(1.2),color:Colors.text_primary}}>Choose Initial Type</Text>
             
            <Pressable onPress={() => setField((prev) => ({...prev,initial_with_border: true}))} style={{height:hp(7),borderWidth:1,borderColor:initial_with_border ? Colors.primary : Colors.border,paddingHorizontal:wp(3),flexDirection:'row',alignItems:'center',gap:wp(3)}}>
                  
                      <View style={styles.outerCircle}>
                                                       {initial_with_border && <View style={styles.innerCircle} />}

                               </View>

                      <Text style={{fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>Initial with border</Text>
                  

                  
              </Pressable>

              <Pressable onPress={() => setField((prev) => ({...prev,initial_with_border: false}))} style={{height:hp(7),borderWidth:1,borderColor:!initial_with_border ? Colors.primary : Colors.border,paddingHorizontal:wp(3),flexDirection:'row',alignItems:'center',gap:wp(3),marginTop:hp(1.5)}}>
                  
                      <View style={styles.outerCircle}>
                      {!initial_with_border && <View style={styles.innerCircle} />}
                               </View>

                      <Text style={{fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>Initial without border</Text>
                  

                  
              </Pressable>
          </View>

    </View>
  )
}

export default InitialMeta

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