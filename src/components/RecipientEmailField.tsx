import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Controller } from 'react-hook-form';
import AppInput from './AppInput';
import { Mail, Phone } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';


const RecipientItem = memo(({ item, onSelectRecipient }) => {
    return (
        <TouchableOpacity onPress={() => onSelectRecipient(item)} style={styles.card}>
            {item.recepient_name && (
                <Text style={styles.name}>{item.recepient_name}</Text>
            )}

            {item.recepient_email && (
                <View style={styles.contactRow}>
                    <Mail color={Colors.text_secondary} size={fp(2)} style={styles.mailIcon} />
                    <Text style={styles.info}>{item.recepient_email}</Text>
                </View>
            )}

            {item.recepient_phone && (
                <View style={styles.contactRow}>
                    <Phone color={Colors.text_secondary} size={fp(1.8)} />
                    <Text style={styles.info}>{item.recepient_phone}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
});
const RecipientEmailField = ({ control, method, recipientsList, onSelectedRecipient }) => {
    const [showDropdown, setShowDropdown] = useState(false);



    return (
        <>
            {(method === "email_and_sms" || method === "email") && (

                <View style={{ position: 'relative' }}>
                    <Controller
                        control={control}
                        name="recepient_email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Please enter a valid email address',
                            },
                        }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => {
                            const lowerText = value.toLowerCase();
                            const filteredRecipients = recipientsList.filter(item =>
                                item.recepient_name?.toLowerCase().includes(lowerText) ||
                                item.recepient_email?.toLowerCase().includes(lowerText) ||
                                item.recepient_phone?.toLowerCase().includes(lowerText)
                            );


                            return (
                                <View>
                                    <AppInput
                                        label="Email"
                                        placeholder="Enter your email"
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);

                                            if (text.trim().length > 0) {
                                                setShowDropdown(true);
                                            } else {
                                                setShowDropdown(false);
                                            }
                                        }}
                                        error={error?.message}
                                        leftIcon={Mail}
                                    />

                                    {showDropdown && filteredRecipients.length > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 80,
                                                left: 0,
                                                right: 0,
                                                backgroundColor: '#fff',
                                                elevation: 5,
                                                zIndex: 99999,
                                                maxHeight: 250,
                                                marginHorizontal: '1%',
                                                // borderRadius: 8,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <ScrollView
                                                nestedScrollEnabled={true}
                                                keyboardShouldPersistTaps="handled"
                                                showsVerticalScrollIndicator={true}
                                                style={{ flex: 1 }}
                                            >
                                                {filteredRecipients.map((item) => (
                                                    <RecipientItem
                                                        key={item.id}
                                                        item={item}
                                                        onSelectRecipient={() => { onSelectedRecipient(item); setShowDropdown(false) }}
                                                    />
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {showDropdown && (
                                        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: -1000,
                                                    bottom: -1000,
                                                    left: -1000,
                                                    right: -1000,
                                                    zIndex: 9998,
                                                }}
                                            />
                                        </TouchableWithoutFeedback>
                                    )}
                                </View>
                            );
                        }}
                    />
                </View>
            )}
        </>
    );
};

export default RecipientEmailField;

const styles = StyleSheet.create({
    name: {
        fontSize: fp(1.9),
        fontFamily: Fonts.Medium,
        color: Colors.text_primary,
    },
    info: {
        fontSize: fp(1.7),
        color: Colors.text_secondary,
        fontFamily: Fonts.Regular,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        // marginTop: 5
    },
    mailIcon: { marginTop: 3 },
    card: {
        paddingVertical: hp(1),
        borderRadius: 2,
        paddingBottom: hp(1.8),
        // marginBottom: hp(1.5),
        borderBottomColor: Colors.border,
        borderBottomWidth: 1,
        paddingHorizontal: wp(3)
    },
})