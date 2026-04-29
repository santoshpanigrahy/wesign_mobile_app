import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { ArrowLeft, CalendarDays, Check, ChevronDown, EllipsisVertical } from 'lucide-react-native'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import AppInput from '@components/AppInput'
import { Controller, useForm } from 'react-hook-form'
import AppToggleButton from '@components/AppToggleButton'
import AppButton from '@components/AppButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AppBottomSheet from '@components/AppBottomSheet'
import { Calendar } from 'react-native-calendars'
import api from '@utils/api'
import Toast from 'react-native-toast-message'
import { useAppDispatch, useAppSelector } from '@redux/hooks'
import { hideLoader, showLoader } from '@redux/slices/loaderSlice'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import moment from 'moment'
import { goBack, navigate, resetAndNavigate } from '@utils/NavigationUtils'
import EnvelopeSentModal from '@components/EnvelopeSentModal'
import { resetEnvelope } from '@redux/slices/envelopeSlice'

// --- Static Data ---
const reminders = [
    { label: 'Every Day', value: 1 },
    { label: 'Every 2 Days', value: 2 },
    { label: 'Every 3 Days', value: 3 },
    { label: 'Every 4 Days', value: 4 },
    { label: 'Every 5 Days', value: 5 },
    { label: 'Every 6 Days', value: 6 },
    { label: 'Every 7 Days', value: 7 },
    { label: 'Every 8 Days', value: 8 },
    { label: 'Every 9 Days', value: 9 },
];

const noOfReminders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// --- Helper Functions (Moved outside to prevent recreation on every render) ---
const getFutureDate = (days) => {
    if (!days) return moment().format("MM/DD/YYYY");
    return moment().add(Number(days), "days").format("MM/DD/YYYY");
};

const formatLanguages = (languages) =>
    languages.map((lang) => {
        const label = lang
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        return { value: lang, label };
    });

const FinishScreen = ({ navigation }) => {
    const user = useAppSelector(state => state?.auth?.user);
    const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);
    const envelopeDocuments = useAppSelector(state => state?.envelope?.envelopeDocuments);
    const enableSigningOrder = useAppSelector(state => state?.envelope?.set_signing_order);
    const enableEnvelopeId = useAppSelector(state => state?.envelope?.enable_writing_id);


    const { id, first_name, last_name, email } = user;
    const fullName = first_name + " " + last_name;

    const fields = useAppSelector(state => state?.envelope?.allFields);
    const dispatch = useAppDispatch();

    const [languageList, setLanguageList] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    const dateRef = useRef(null);
    const languageRef = useRef(null);
    const dayRef = useRef(null);
    const reminderRef = useRef(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { control, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            automatic_reminders: false,
            number_of_reminders: 1,
            envelope_language: { label: 'English', value: 'english' },
            auto_reminder: { label: 'Every Day', value: 1 },
            expiry_days: 120,
            expiry_date: ''
        }
    });

    const isAutomaticRemindersChecked = watch('automatic_reminders');
    const selectedLanguage = watch("envelope_language");
    const selectedNumberOfReminders = watch('number_of_reminders');
    const selectedDays = watch('auto_reminder');
    const expiryDate = watch('expiry_date');

    const getAllLanguages = useCallback(async () => {
        dispatch(showLoader('Loading'));
        try {
            const res = await api.get("/info/get/conf?key=email_langauges");
            if (res?.data?.status) {
                setLanguageList(formatLanguages(JSON.parse(res?.data?.value)));
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: error?.message });
        } finally {
            dispatch(hideLoader());
        }
    }, [dispatch]);

    useEffect(() => {
        setValue("expiry_date", getFutureDate(120));
        getAllLanguages();
    }, [getAllLanguages, setValue]);

    const onSubmit = async (data) => {

        dispatch(showLoader('Sending'))

        try {


            const normalFields = fields.filter(field => !field.is_prefilled_field);
            const prefilledFields = fields.filter(field => field.is_prefilled_field);

            // Existing recipients with normal fields
            const recipientsWithMeta = recipients.map(recipient => {
                const email = recipient.recepient_email;

                const recipientFields = normalFields
                    .filter(field => field.recipient_id === email)
                    .map(field => ({
                        ...field,
                        top: field.y,
                        left: field.x,
                    }));

                return {
                    ...recipient,
                    meta_data: recipientFields,
                };
            });

            // Prefilled recipient object
            if (prefilledFields.length > 0) {
                const prefilledRecipient = {
                    action: "needs_to_sign",
                    host_email: null,
                    is_prefilled_field: true,
                    meta_data: prefilledFields.map(field => ({
                        ...field,
                        field_name: field.field_name?.startsWith('my_')
                            ? field.field_name.replace('my_', '')
                            : field.field_name,
                        top: field.y,
                        left: field.x,
                    })),
                    meta_info: {
                        recepient_border_color: "#ffff76",
                        recepient_color: "#ffd65b",
                    },
                    recepient_email: email,
                    recepient_name: fullName,
                    recepient_phone: null,
                    signature_with_border: "true",
                    type: "email",
                };

                recipientsWithMeta.push(prefilledRecipient);
            }

            console.log(recipientsWithMeta);



            const envelope_documents = envelopeDocuments?.map((document) => ({
                document_id: document.document_id,
                document_key: document.document_key,
                document_url: document.document_url
            }));

            const { subject, message, envelope_language, expiry_date, number_of_reminders, auto_reminder } = data;
            console.log(expiry_date)

            const updatedRecipients = enableSigningOrder
                ? recipientsWithMeta.map((item, index) => ({
                    ...item,
                    host_email: item.host_email ? item.host_email : null,
                    order: index + 1,
                }))
                : recipientsWithMeta.map(item => ({
                    ...item,
                    host_email: item.host_email ? item.host_email : null,
                }));

            const request_data = {
                subject: subject.substring(0, 240),
                holder: id,
                sent_by: id ?? null,
                envelope_recepients: updatedRecipients,
                envelope_documents,
                email_content: { subject: subject.substring(0, 240), content: message },
                expiry_date: moment(expiry_date, 'MM/DD/YYYY').format('YYYY-MM-DD'),
                envelope_language: envelope_language?.value,
                im_signer: false,
                enable_comments: false,
                last_changed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
                last_viewed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
                follow_signing_order: enableSigningOrder,
                enable_writing_id: enableEnvelopeId,
                enable_certification: true,
                device_info: {},
                api_v1: true,
                iam: null,
                sent_ip: null,
                auto_reminder: auto_reminder?.value,
                number_of_reminders: number_of_reminders
            };

            console.log("Requiest Data=======> ", request_data);



            const res = await api.post('/api/envelope/send', request_data);

            setShowSuccessModal(true);
            // Toast.show({ type: 'success', text1: "Done" });
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: error?.message });
        } finally {
            dispatch(hideLoader());

        }
    };

    // --- Memoized Handlers for Better Performance ---
    const handleDayPress = useCallback((day) => {
        const selected = moment(day.dateString).startOf("day");
        const today = moment().startOf("day");
        const diffDays = selected.diff(today, "days");

        setValue("expiry_days", diffDays.toString(), { shouldValidate: true, shouldDirty: true });
        setValue("expiry_date", selected.format("MM/DD/YYYY"), { shouldValidate: true });
        dateRef.current?.close();
    }, [setValue]);

    const handleLanguageSelect = useCallback((item) => {
        setValue('envelope_language', item);
        languageRef.current?.close();
    }, [setValue]);

    const handleReminderDaySelect = useCallback((item) => {
        setValue('auto_reminder', item);
        dayRef.current?.close();
    }, [setValue]);

    const handleReminderCountSelect = useCallback((item) => {
        setValue('number_of_reminders', item);
        reminderRef.current?.close();
    }, [setValue]);

    const handleExpiryDaysChange = useCallback((text, onChange) => {
        const num = parseInt(text, 10);
        if (!text) {
            onChange("");
            setValue("expiry_date", getFutureDate(0));
            return;
        }
        if (!isNaN(num) && num <= 120) {
            onChange(text);
            setValue("expiry_date", getFutureDate(num));
        }
    }, [setValue]);

    // --- Memoized Render Items ---
    const renderLanguageItem = useCallback(({ item }) => (
        <Pressable onPress={() => handleLanguageSelect(item)} style={styles.sheetItemRow}>
            <Text style={styles.sheetItemText}>{item?.label}</Text>
            {selectedLanguage?.value === item?.value && <Check size={fp(3)} color={Colors.success} />}
        </Pressable>
    ), [handleLanguageSelect, selectedLanguage]);

    const renderReminderDayItem = useCallback(({ item }) => (
        <Pressable onPress={() => handleReminderDaySelect(item)} style={styles.sheetItemRow}>
            <Text style={styles.sheetItemText}>{item?.label}</Text>
            {selectedDays?.value === item?.value && <Check size={fp(3)} color={Colors.success} />}
        </Pressable>
    ), [handleReminderDaySelect, selectedDays]);

    const renderReminderCountItem = useCallback(({ item }) => (
        <Pressable onPress={() => handleReminderCountSelect(item)} style={styles.sheetItemRow}>
            <Text style={styles.sheetItemText}>{item}</Text>
            {selectedNumberOfReminders === item && <Check size={fp(3)} color={Colors.success} />}
        </Pressable>
    ), [handleReminderCountSelect, selectedNumberOfReminders]);

    return (
        <CustomSafeAreaView>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <TouchableOpacity onPress={() => goBack()}>
                        <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Review & Send</Text>
                </View>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.sendBtn}>
                    <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.container}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    enableOnAndroid={true}
                    extraScrollHeight={250}
                >
                    <Controller
                        control={control}
                        name="subject"
                        rules={{ required: 'Email subject is required' }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Email Subject"
                                placeholder="Enter subject"
                                value={value}
                                onChangeText={onChange}
                                error={error?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="message"
                        rules={{ required: 'Email message is required' }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <View>
                                <Text style={styles.label}>
                                    Email Message<Text style={styles.asterisk}>*</Text>
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        error?.message ? styles.inputError : isFocused ? styles.inputFocus : styles.inputDefault
                                    ]}
                                    multiline
                                    textAlignVertical="top"
                                    placeholder='Enter email message'
                                    placeholderTextColor={Colors.placeholder}
                                    value={value}
                                    onChangeText={onChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                                {error?.message && <Text style={styles.error}>{error?.message}</Text>}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="automatic_reminders"
                        render={({ field: { onChange, value } }) => (
                            <AppToggleButton containerStyle={{ height: hp(5) }} label={'Send automatic reminders'} value={value} onToggle={onChange} />
                        )}
                    />

                    {isAutomaticRemindersChecked && (
                        <View>
                            <Text style={styles.label}>
                                Number of Reminders<Text style={styles.asterisk}>*</Text>
                            </Text>
                            <View style={styles.rowGap}>
                                <Pressable onPress={() => dayRef.current?.snapToIndex(0)} style={[styles.dropdownPressable, styles.flexOne]}>
                                    <Text style={styles.dropdownText}>{selectedDays?.label}</Text>
                                    <ChevronDown size={fp(2)} color={Colors.text_primary} />
                                </Pressable>
                                <Pressable onPress={() => reminderRef.current?.snapToIndex(0)} style={[styles.dropdownPressable, styles.countPressable]}>
                                    <Text style={styles.dropdownTextCenter}>{selectedNumberOfReminders}</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    <View>
                        <Text style={styles.label}>Expiration</Text>
                        <View style={styles.rowGap}>
                            <Pressable onPress={() => dateRef.current?.snapToIndex(0)} style={[styles.dropdownPressable, styles.flexOne]}>
                                <Text style={styles.dropdownText}>{expiryDate}</Text>
                                <CalendarDays size={fp(2.5)} color={Colors.text_primary} />
                            </Pressable>
                            <Controller
                                control={control}
                                name="expiry_days"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        keyboardType='numeric'
                                        style={styles.numericInput}
                                        value={value?.toString()}
                                        onChangeText={(text) => handleExpiryDaysChange(text, onChange)}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View>
                        <Text style={styles.label}>Choose Language</Text>
                        <Pressable onPress={() => languageRef.current?.snapToIndex(0)} style={styles.dropdownPressable}>
                            <Text style={styles.dropdownText}>{selectedLanguage?.label}</Text>
                            <ChevronDown size={fp(2)} color={Colors.text_primary} />
                        </Pressable>
                    </View>

                    <Text style={styles.infoText}>
                        Once the envelope is completed, all recipients will receive a copy of the completed envelope.
                    </Text>

                </KeyboardAwareScrollView>
            </View>

            {/* Bottom Sheets */}
            <AppBottomSheet ref={dateRef} title={'Select expiration date'} snapPoints={['60%']}>
                <View style={styles.calendarContainer}>
                    <Calendar
                        minDate={moment().format("YYYY-MM-DD")}
                        maxDate={moment().add(120, "days").format("YYYY-MM-DD")}
                        onDayPress={handleDayPress}
                    />
                </View>
            </AppBottomSheet>

            <AppBottomSheet ref={languageRef} title={'Select language'} snapPoints={['50%']}>
                <BottomSheetFlatList
                    data={languageList}
                    contentContainerStyle={styles.sheetListContent}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderLanguageItem}
                    keyboardShouldPersistTaps="handled"
                />
            </AppBottomSheet>

            <AppBottomSheet ref={dayRef} title={'Select'} snapPoints={['50%']}>
                <BottomSheetFlatList
                    data={reminders}
                    contentContainerStyle={styles.sheetListContent}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderReminderDayItem}
                    keyboardShouldPersistTaps="handled"
                />
            </AppBottomSheet>

            <AppBottomSheet ref={reminderRef} title={'Select'} snapPoints={['50%']}>
                <BottomSheetFlatList
                    data={noOfReminders}
                    contentContainerStyle={styles.sheetListContent}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderReminderCountItem}
                    keyboardShouldPersistTaps="handled"
                />
            </AppBottomSheet>

            <EnvelopeSentModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onGoToDashboard={() => {
                    setShowSuccessModal(false);
                    dispatch(resetEnvelope());
                    navigation?.pop(4);
                }}
            />

        </CustomSafeAreaView>
    )
}

export default FinishScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(5),
        backgroundColor: '#fff',
        gap: hp(3)
    },
    header: {
        height: hp(7),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        backgroundColor: '#FFFFFF',
        borderBottomColor: Colors.border,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: "center",
        gap: wp(4)
    },
    title: {
        fontSize: fp(2.2),
        fontFamily: Fonts.SemiBold,
        color: Colors.text_primary,
        letterSpacing: 0.5,
    },
    sendBtn: {
        height: hp(4),
        backgroundColor: Colors.primary_dark,
        paddingHorizontal: wp(6),
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: wp(1)
    },
    sendBtnText: {
        color: Colors.white,
        fontSize: fp(1.7),
        fontFamily: Fonts.Medium
    },
    scrollContent: {
        backgroundColor: '#fff',
        paddingBottom: 50,
        gap: hp(3)
    },
    label: {
        fontSize: 14,
        color: Colors.text_primary,
        fontFamily: Fonts.Medium,
        marginBottom: 6,
    },
    asterisk: {
        color: Colors.error
    },
    input: {
        height: hp(20),
        fontSize: 16,
        color: Colors.text_primary,
        fontFamily: Fonts.Regular,
        borderWidth: 1,
        borderRadius: 3,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: Colors.background,
    },
    inputDefault: {
        borderColor: Colors.text_secondary,
    },
    inputFocus: {
        borderColor: Colors.primary_dark,
    },
    inputError: {
        borderColor: Colors.error,
    },
    error: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    rowGap: {
        flexDirection: 'row',
        alignItems: "center",
        gap: wp(3)
    },
    flexOne: {
        flex: 1
    },
    dropdownPressable: {
        height: hp(6),
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        backgroundColor: Colors.white,
        borderColor: Colors.text_secondary,
        borderWidth: 1,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    countPressable: {
        width: wp(15),
        justifyContent: 'center',
        paddingHorizontal: 0
    },
    dropdownText: {
        fontFamily: Fonts.Regular,
        color: Colors.text_primary,
        fontSize: fp(1.9)
    },
    dropdownTextCenter: {
        fontFamily: Fonts.Regular,
        color: Colors.text_primary,
        fontSize: fp(1.9),
        textAlign: "center"
    },
    numericInput: {
        height: hp(6),
        width: wp(15),
        borderWidth: 1,
        borderColor: Colors.text_secondary,
        borderRadius: 3,
        textAlign: "center",
        fontSize: 16,
        color: Colors.text_primary,
        fontFamily: Fonts.Regular,
        backgroundColor: Colors.background
    },
    infoText: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.6),
        color: Colors.placeholder,
        textAlign: 'justify'
    },
    calendarContainer: {
        marginTop: hp(2)
    },
    sheetListContent: {
        marginTop: hp(2),
        paddingBottom: hp(4)
    },
    sheetItemRow: {
        height: hp(4.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sheetItemText: {
        color: Colors.text_primary,
        flex: 1,
        fontFamily: Fonts.Medium,
        fontSize: fp(1.9)
    }
});