import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { Delete, Plus, Trash } from 'lucide-react-native'

const RadioMeta = ({ field, updateFieldValue }) => {
    const fieldData = field?.field_data || "Dropdown,Option 1,Option 2,Option 3";
    const parts = fieldData.split("@-@-@");
    const radioGroupName = parts[0];
    const radioOptionValue = parts[1];

    const [groupName, setGroupName] = useState(radioGroupName);
    const [radioValue, setRadioValue] = useState(radioOptionValue);
    const [optionText, setOptionText] = useState('');
    const [options, setOptions] = useState([]);


    const handleAddOption = () => {
        const updated = [...options, optionText];
        setOptions(updated);
        // updateFieldData(label, updated);
        setOptionText('');
    };

    const handleDelete = (index) => {
        const updated = options.filter((_, i) => i !== index);
        setOptions(updated);
        // updateFieldData(label, updated);
    };



    const updateFieldData = (newLabel) => {
        const finalString = [groupName, newLabel].join("@-@-@");
        updateFieldValue("field_data", finalString);
    };

    return (
        <View style={{ gap: hp(3) }}>


            <View >
                <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Group Name</Text>


                <TextInput editable={false} style={{ padding: wp(3), borderWidth: 1, borderColor: Colors.text_primary, fontFamily: Fonts.Regular, color: Colors.text_primary }} placeholder='Enter value' placeholderTextColor={Colors.placeholder} value={groupName} onChangeText={(e) => {

                }} />

            </View>

            <View >
                <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Radio Value</Text>


                <TextInput style={{ padding: wp(3), borderWidth: 1, borderColor: Colors.text_primary, fontFamily: Fonts.Regular, color: Colors.text_primary }} placeholder='Enter value' placeholderTextColor={Colors.placeholder} value={radioValue} onChangeText={(e) => {
                    setRadioValue(e);
                    updateFieldData(e);
                }} />

            </View>

            {/* <View >
                <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Add Radio Options</Text>

                <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                    <TextInput style={{ padding: wp(3), flex: 1, borderWidth: 1, borderColor: Colors.text_primary, fontFamily: Fonts.Regular, color: Colors.text_primary }} placeholder='Enter option' placeholderTextColor={Colors.placeholder} value={optionText} onChangeText={(e) => {
                        setOptionText(e);

                    }} />

                    <Pressable disabled={optionText?.trim() === ''} onPress={() => handleAddOption()} style={{ padding: wp(3), justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: Colors.primary_dark, borderColor: Colors.primary_dark, borderWidth: 1 }}>

                       

                        <Text style={{ fontFamily: Fonts.Medium, color: Colors.white }}>

                            Add
                        </Text>

                    </Pressable>
                </View>
                <View style={{ gap: wp(2), marginTop: hp(2) }}>
                    {
                        options?.map((option, index) => {
                            return <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', height: hp(6), backgroundColor: Colors.background_light, alignItems: 'center', paddingHorizontal: wp(3) }}>
                                <Pressable style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: Fonts.Medium, fontSize: fp(1.9) }}>
                                        {option}
                                    </Text>

                                </Pressable>
                                <Pressable onPress={() => handleDelete(index)} style={{ width: wp(8), height: wp(8), borderRadius: wp(1), justifyContent: 'center', alignItems: 'center', backgroundColor: "#f9d4d4" }}>

                                    <Trash size={fp(2.5)} color={Colors.error} />
                                </Pressable>
                            </View>
                        })
                    }
                </View>





            </View> */}










        </View>
    )
}

export default RadioMeta

const styles = StyleSheet.create({

    outerCircle: {
        width: wp(5),
        height: wp(5),
        borderRadius: wp(2.5),
        borderWidth: 1.5,
        borderColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 3
    },
    innerCircle: {
        width: wp(2.4),
        height: wp(2.4),
        borderRadius: wp(1.2),
        backgroundColor: "#007AFF",
    },
})