import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { ArrowLeft, Delete, Plus, Trash } from 'lucide-react-native'
import AppButton from '@components/AppButton'
import Toast from 'react-native-toast-message'

const CreateRadioFieldModal = ({ visible, setVisible, onSave }) => {


    const [groupName, setGroupName] = useState('');
    const [optionText, setOptionText] = useState('');
    const [options, setOptions] = useState([]);


    const handleAddOption = () => {
        const updated = [...options, optionText];
        setOptions(updated);

        setOptionText('');
    };

    const handleDelete = (index) => {
        const updated = options.filter((_, i) => i !== index);
        setOptions(updated);

    };

    const handleCreateRadio = () => {
        if (!groupName) {
            Toast.show({
                type: 'error',
                text1: 'Enter Group Name'
            });

            return
        }

        if (options?.length < 2) {
            Toast.show({
                type: 'error',
                text1: 'Add at least two Radio Options'
            });

            return
        }

        const finalData = {
            groupName: groupName,
            radioOptions: options
        }

        onSave(finalData)
        setOptions([]);
        setGroupName('');
        setOptionText('');
    }

    const handleCloseModal = () => {
        setVisible(false);
        setOptions([]);
        setGroupName('');
        setOptionText('');
    }


    if (!visible) {
        return null
    }




    return (
        <View style={styles.overlay}>
            <View style={styles.metaHeader}>
                <View style={styles.metaHeaderTitleRow}>
                    <TouchableOpacity onPress={handleCloseModal}><ArrowLeft color={Colors.text_primary} size={fp(2.8)} /></TouchableOpacity>
                    <Text style={styles.metaTitle}>Create Radio Button</Text>
                </View>
            </View>

            <View style={styles.metaBody}>
                <View style={{ gap: hp(3) }}>


                    <View >
                        <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Group Name</Text>


                        <TextInput style={{ padding: wp(3), borderWidth: 1, borderColor: Colors.text_primary, fontFamily: Fonts.Regular, color: Colors.text_primary }} placeholder='Enter value' placeholderTextColor={Colors.placeholder} value={groupName} onChangeText={(e) => {
                            setGroupName(e);
                        }} />

                    </View>

                    <View >
                        <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Radio Options</Text>

                        <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                            <TextInput style={{ padding: wp(3), flex: 1, borderWidth: 1, borderColor: Colors.text_primary, fontFamily: Fonts.Regular, color: Colors.text_primary }} placeholder='Enter option' placeholderTextColor={Colors.placeholder} value={optionText} onChangeText={(e) => {
                                setOptionText(e);

                            }} />

                            <Pressable disabled={optionText?.trim() === ''} onPress={() => handleAddOption()} style={{ padding: wp(3), justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: Colors.primary_dark, borderColor: Colors.primary_dark, borderWidth: 1 }}>

                                {/* <Plus color={Colors.primary_dark} size={fp(2.5)} /> */}

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





                    </View>










                </View>

            </View>

            <AppButton title={'Create Radio'} onPress={handleCreateRadio} />

        </View>
    )
}

export default CreateRadioFieldModal

const styles = StyleSheet.create({

    overlay: { position: 'absolute', top: 0, left: 0, height: hp(100), backgroundColor: Colors.white, width: wp(100), padding: wp(5) },
    metaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) },
    metaHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
    metaTitle: { fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(2.2) },
    metaBody: { flex: 1, paddingTop: hp(1), gap: hp(2.5) },


})