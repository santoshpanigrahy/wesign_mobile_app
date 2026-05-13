import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import AppToggleButton from '@components/AppToggleButton'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { Bold, ChevronDown, Italic, Minus, Plus, Underline } from 'lucide-react-native'

const TextStyleMeta = ({ field, setField, openColorPicker, closeColorPicker }) => {

    const fontSize = field?.font_size;
    const fontColor = field?.font_color;
    const fontFamily = field?.font_family;
    const fontStyle = field?.font_style;


    return (
        <View style={{ gap: hp(2) }}>

            <Text style={{ fontFamily: Fonts.SemiBold, fontSize: fp(2.1), color: Colors.text_primary }}>Formatting</Text>

            <View style={{ flexDirection: 'row', gap: wp(4) }}>


                <View style={{ flex: 1 }}>

                    <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Font Size</Text>


                    <View style={{ height: hp(6), backgroundColor: Colors.border, flexDirection: 'row' }}>
                        <Pressable style={{ width: wp(12), justifyContent: 'center', alignItems: 'center' }} onPress={() => {

                            if (fontSize <= 6) {
                                return;
                            }
                            setField((prev) => ({
                                ...prev,
                                font_size: fontSize - 1
                            }));
                        }}>
                            <Minus color={Colors.text_primary} size={fp(2.5)} />
                        </Pressable>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, margin: 3 }}>
                            <Text style={{ textAlign: "center", fontFamily: Fonts.Medium, fontSize: fp(1.8) }}>
                                {fontSize}
                            </Text>
                        </View>

                        <Pressable style={{ width: wp(12), justifyContent: 'center', alignItems: 'center' }} onPress={() => {

                            if (fontSize >= 72) {
                                return;
                            }
                            setField((prev) => ({
                                ...prev,
                                font_size: fontSize + 1
                            }));
                        }}>
                            <Plus color={Colors.text_primary} size={fp(2.5)} />
                        </Pressable>
                    </View>
                </View>

                <View style={{ flex: 1 }}>

                    <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Font Color</Text>


                    <Pressable onPress={() => openColorPicker()} style={{ height: hp(6), flexDirection: 'row', paddingHorizontal: wp(3), backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'space-between' }} >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(3.5), borderColor: fontColor, borderWidth: 2, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: wp(2.5), height: wp(2.5), borderRadius: wp(3.5), backgroundColor: fontColor }}>

                                </View>
                            </View>

                            <Text style={{ fontFamily: Fonts.Medium, color: Colors.text_primary, fontSize: fp(1.6) }}>{fontColor}</Text>

                        </View>

                        <ChevronDown size={fp(2)} color={Colors.text_primary} />
                    </Pressable>
                </View>

            </View>


            {/* <View >

                <Text style={{ fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary }}>Font Family</Text>


                <Pressable style={{ height: hp(6), flexDirection: 'row', paddingHorizontal: wp(5), backgroundColor: Colors.white, borderColor: Colors.text_primary, borderWidth: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9) }}>{fontFamily}</Text>


                    <ChevronDown size={fp(2)} color={Colors.text_primary} />
                </Pressable>

                <View style={{ flexDirection: 'row', gap: wp(3), justifyContent: 'flex-end', marginTop: hp(1) }}>
                    <Pressable onPress={() => {
                        setField((prev) => ({
                            ...prev,
                            font_style: 'bold'
                        }));
                    }} style={[styles.fontStyle, { backgroundColor: fontStyle === 'bold' ? Colors.primary_dark : "#f4f4f4" }]}>
                        <Bold size={fp(2.2)} color={fontStyle === 'bold' ? Colors.white : Colors.text_primary} />
                    </Pressable>

                    <Pressable onPress={() => {
                        setField((prev) => ({
                            ...prev,
                            font_style: 'italic'
                        }));
                    }} style={[styles.fontStyle, { backgroundColor: fontStyle === 'italic' ? Colors.primary_dark : "#f4f4f4" }]}>
                        <Italic size={fp(2.2)} color={fontStyle === 'italic' ? Colors.white : Colors.text_primary} />
                    </Pressable>

                    <Pressable onPress={() => {
                        setField((prev) => ({
                            ...prev,
                            font_style: 'underline'
                        }));
                    }} style={[styles.fontStyle, { backgroundColor: fontStyle === 'underline' ? Colors.primary_dark : "#f4f4f4" }]}>
                        <Underline size={fp(2.2)} color={fontStyle === 'underline' ? Colors.white : Colors.text_primary} />
                    </Pressable>
                </View>
            </View> */}







        </View>
    )
}

export default TextStyleMeta

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

    fontStyle: { width: wp(10), height: wp(10), justifyContent: 'center', alignItems: 'center' }
})