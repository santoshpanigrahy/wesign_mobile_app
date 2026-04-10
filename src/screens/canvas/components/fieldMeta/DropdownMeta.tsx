import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { Delete, Plus, Trash } from 'lucide-react-native'

const DropdownMeta = ({ field,updateFieldValue}) => {
    const fieldData = field?.field_data || "Dropdown,Option 1,Option 2,Option 3";
    const parts = fieldData.split(",").map(item => item.trim());
    const dropdownLabel = parts[0];
    const dropdownOptions = parts.slice(1);

    const [label, setLabel] = useState(dropdownLabel);
    const [options, setOptions] = useState(dropdownOptions);


    const handleAddOption = () => {
  const updated = [...options, `Option ${options.length + 1}`];
  setOptions(updated);
  updateFieldData(label, updated);
    };
    
    const handleDelete = (index) => {
  const updated = options.filter((_, i) => i !== index);
  setOptions(updated);
  updateFieldData(label, updated);
    };
    
  

const updateFieldData = (newLabel, newOptions) => {
  const finalString = [newLabel, ...newOptions].join(",");
  updateFieldValue("field_data", finalString);
};
    
  return (
    <View style={{gap:hp(3)}}>
          

            <View >
                <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Dropdown Label</Text>
          

              <TextInput     style={{padding:wp(3),borderWidth:1,borderColor:Colors.text_primary,fontFamily:Fonts.Regular,color:Colors.text_primary}} placeholder='Enter value' placeholderTextColor={Colors.placeholder} value={label} onChangeText={(e) => {
  setLabel(e);
  updateFieldData(e, options);
}} />
              
          </View>

           <View >
                <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Dropdown Options</Text>
          
              <View style={{gap:wp(2)}}>
                  {
                      options?.map((option, index) => {
                          return <View key={index} style={{flexDirection:'row',justifyContent:'space-between',height:hp(6),backgroundColor:Colors.background_light,alignItems:'center',paddingHorizontal:wp(3)}}>
                              <Pressable style={{flex:1}}>
                                  <Text style={{fontFamily:Fonts.Medium,fontSize:fp(1.9)}}>
                                      {option}
                                  </Text>

                              </Pressable>
                              <Pressable onPress={()=>handleDelete(index)} style={{ width: wp(8), height: wp(8), borderRadius:wp(1), justifyContent:'center',alignItems:'center', backgroundColor:"#f9d4d4"}}>
                                  
                                  <Trash size={fp(2.5)} color={Colors.error}/>
                              </Pressable>
                          </View>
                      })
                  }
              </View>

              <Pressable onPress={()=>handleAddOption()} style={{height:hp(6),marginTop:hp(2), justifyContent:'center',alignItems:'center',flexDirection:'row',gap:wp(2),borderWidth:1,borderColor:Colors.primary_dark,borderRadius:wp(1)}}>
                
                      <Plus color={Colors.primary_dark} size={fp(2.5)} />
                     
                  <Text style={{fontFamily:Fonts.Medium,color:Colors.primary_dark}}>
                      
                      Add Option
                  </Text>
                 
              </Pressable>
              
              </View>
          

          
          
          
        
          



    </View>
  )
}

export default DropdownMeta

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