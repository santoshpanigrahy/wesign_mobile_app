import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
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
import { goBack } from '@utils/NavigationUtils'

const reminders = [
    {
        label: 'Every Day',
        value: 1
    },
    {
        label: 'Every 2 Days',
        value: 2
    },
    {
        label: 'Every 3 Days',
        value: 3
    },
    {
        label: 'Every 4 Days',
        value: 4
    },
    {
        label: 'Every 5 Days',
        value: 5
    },
    {
        label: 'Every 6 Days',
        value: 6
    },
    {
        label: 'Every 7 Days',
        value: 7
    },
    {
        label: 'Every 8 Days',
        value: 8
    },
    {
        label: 'Every 9 Days',
        value: 9
    },

]

const noOfReminders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FinishScreen = () => {

    const userId = useAppSelector(state => state?.auth?.user?.id);
    const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);
    const envelopeDocuments = useAppSelector(state => state?.envelope?.envelopeDocuments);

    const dispatch = useAppDispatch();
    const [languageList, setLanguageList] = useState([]);
    const dateRef = useRef(null);
    const languageRef = useRef(null);
    const dayRef = useRef(null);
    const reminderRef = useRef(null);


    const { control, handleSubmit, setValue, watch } = useForm(
        {
            defaultValues: {
                automatic_reminders: false,
                number_of_reminders: 1,
                envelope_language: {
                    label: 'English',
                    value: 'english'
                },
                auto_reminder: {
                    label: 'Every Day',
                    value: 1
                },
                expiry_days: 120,
                expiry_date: ''

            }
        }
    );

    const [isFocused, setIsFocused] = useState(false);

    const isAutomaticRemindersChecked = watch('automatic_reminders');


    const getFutureDate = (days) => {
        if (!days) {
            return moment().format("MM/DD/YYYY"); // ✅ today
        }

        return moment()
            .add(Number(days), "days")
            .format("MM/DD/YYYY");
    };

    const formatLanguages = (languages) =>
        languages.map((lang) => {
            const label = lang
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());

            return { value: lang, label };
        });

    const getAllLanguages = async () => {
        dispatch(showLoader('Loading'));
        try {
            const res = await api.get("/info/get/conf?key=email_langauges");

            if (res?.data?.status) {

                setLanguageList(formatLanguages(JSON.parse(res?.data?.value)));

            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error?.message,

            });
        } finally {
            dispatch(hideLoader());
        }

    }

    useEffect(() => {
        setValue("expiry_date", getFutureDate(120)); // ✅ today

        getAllLanguages();
    }, []);

    const selectedLanguage = watch("envelope_language");
    const selectedNumberOfReminders = watch('number_of_reminders');
    const selectedDays = watch('auto_reminder');
    const expiryDate = watch('expiry_date');

    const onSubmit = async (data) => {

        try {



            const envelope_documents = envelopeDocuments?.map((document) => {
                return {
                    document_id: document.document_id,
                    document_key: document.document_key,
                    document_url: document.document_url
                }
            })

            const { subject, message, automatic_reminders, number_of_reminders, envelope_language, auto_reminder, expiry_days, expiry_date } = data


            var request_data = {
                subject: subject.substring(0, 240),
                holder: userId,
                sent_by: userId ?? null,
                envelope_recepients: recipients.map(item => ({
                    ...item,
                    host_email: item.host_email ? item.host_email : null
                })),
                envelope_documents,
                email_content: { subject: subject.substring(0, 240), content: message },
                expiry_date: moment(expiryDate).format('YYYY-MM-DD'),
                envelope_language: envelope_language?.value,
                im_signer: false,
                enable_comments: false,
                last_changed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
                last_viewed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
                follow_signing_order: false,
                enable_writing_id: false,
                enable_certification: true,
                device_info: {},
                api_v1: true,
                iam: null,
                sent_ip: null,
                auto_reminder: 0,
                number_of_reminders: 0

            };

            console.log("Final Data =====> ", request_data);



            const res = await api.post('/api/envelope/send', request_data);
            console.log("Final Data =====> ", res);

            Toast.show({
                type: 'success',
                text1: "Done",

            });
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <CustomSafeAreaView>



            <View style={styles.header}>


                <View style={{ flexDirection: 'row', alignItems: "center", gap: wp(4) }}>
                    <TouchableOpacity onPress={() => goBack()}>
                        <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
                    </TouchableOpacity>


                    <Text style={styles.title}>Review & Send</Text>

                </View>


                <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{ height: hp(4), backgroundColor: Colors.primary_dark, paddingHorizontal: wp(6), justifyContent: "center", alignItems: 'center', borderRadius: wp(1) }}>
                    <Text style={{ color: Colors.white, fontSize: fp(1.7), fontFamily: Fonts.Medium }}>Send</Text>
                </TouchableOpacity>

            </View>

            <View style={styles.container}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ backgroundColor: '#fff', paddingBottom: 50, gap: hp(3) }}

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
                                    Email Message<Text style={{ color: Colors.error }}>*</Text>
                                </Text>

                                <TextInput
                                    style={[styles.input, {
                                        borderColor: error?.message
                                            ? Colors.error
                                            : isFocused
                                                ? Colors.primary_dark
                                                : Colors.text_secondary,

                                    }]}

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
                            <AppToggleButton label={'Send automatic reminders'} value={value} onToggle={(val) => {

                                onChange(val);

                            }} />
                        )}
                    />
                    {

                        isAutomaticRemindersChecked && <>
                            <View>

                                <Text style={styles.label}>
                                    Number of Reminders<Text style={{ color: Colors.error }}>*</Text>
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: "center", gap: wp(3) }}>

                                    <Pressable onPress={() => dayRef.current?.snapToIndex(0)} style={{ height: hp(6), flex: 1, flexDirection: 'row', paddingHorizontal: wp(4), backgroundColor: Colors.white, borderColor: Colors.text_secondary, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9) }}>{selectedDays?.label}</Text>


                                        <ChevronDown size={fp(2)} color={Colors.text_primary} />
                                    </Pressable>

                                    <Pressable onPress={() => reminderRef.current?.snapToIndex(0)} style={{ height: hp(6), width: wp(15), flexDirection: 'row', paddingHorizontal: wp(4), backgroundColor: Colors.white, borderColor: Colors.text_secondary, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9), textAlign: "center" }}>{selectedNumberOfReminders}</Text>



                                    </Pressable>

                                </View>
                            </View>
                        </>
                    }



                    <View>

                        <Text style={styles.label}>
                            Expiration
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: "center", gap: wp(3) }}>
                            <Pressable onPress={() => dateRef.current?.snapToIndex(0)} style={{ height: hp(6), flexDirection: 'row', flex: 1, paddingHorizontal: wp(4), backgroundColor: Colors.white, borderColor: Colors.text_secondary, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9) }}>{expiryDate}</Text>


                                <CalendarDays size={fp(2.5)} color={Colors.text_primary} />
                            </Pressable>

                            <Controller
                                control={control}
                                name="expiry_days"

                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        keyboardType='numeric'
                                        style={[styles.input, {
                                            borderColor: Colors.text_secondary,
                                            height: hp(6),
                                            width: wp(15),
                                            textAlign: "center"
                                        }]}
                                        value={value?.toString()}

                                        onChangeText={(text) => {
                                            const num = parseInt(text, 10);

                                            if (!text) {
                                                onChange("");
                                                setValue("expiry_date", getFutureDate(0)); // ✅ today
                                                return;
                                            }

                                            if (!isNaN(num) && num <= 120) {
                                                onChange(text);

                                                const futureDate = getFutureDate(num);
                                                setValue("expiry_date", futureDate);
                                            }
                                        }}


                                    />

                                )} />
                        </View>

                    </View>

                    <View>

                        <Text style={styles.label}>
                            Choose Language
                        </Text>
                        <Pressable onPress={() => languageRef.current?.snapToIndex(0)} style={{ height: hp(6), flexDirection: 'row', paddingHorizontal: wp(4), backgroundColor: Colors.white, borderColor: Colors.text_secondary, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(1.9) }}>{selectedLanguage?.label}</Text>


                            <ChevronDown size={fp(2)} color={Colors.text_primary} />
                        </Pressable>

                    </View>


                    <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.6), color: Colors.placeholder, textAlign: 'justify' }}>
                        Once the envelope is completed, all recipients will receive a copy of the completed envelope.
                    </Text>


                </KeyboardAwareScrollView>


            </View>





            <AppBottomSheet ref={dateRef} title={'Select expiration date'} snapPoints={['60%']}  >



                <View style={{ marginTop: hp(2) }}>
                    <Calendar

                        minDate={moment().format("YYYY-MM-DD")}
                        maxDate={moment().add(120, "days").format("YYYY-MM-DD")}
                        onDayPress={(day) => {
                            const selected = moment(day.dateString).startOf("day");
                            const today = moment().startOf("day");

                            const diffDays = selected.diff(today, "days");

                            setValue("expiry_days", diffDays.toString(), {
                                shouldValidate: true,
                                shouldDirty: true,
                            });

                            setValue(
                                "expiry_date",
                                selected.format("MM/DD/YYYY"),
                                { shouldValidate: true }
                            );

                            dateRef.current?.close();
                        }}
                    />
                </View>






            </AppBottomSheet>

            <AppBottomSheet ref={languageRef} title={'Select language'} snapPoints={['50%']}  >


                <BottomSheetFlatList
                    data={languageList}
                    contentContainerStyle={{ marginTop: hp(2), paddingBottom: hp(4) }}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {

                        return <Pressable onPress={() => { setValue('envelope_language', item); languageRef?.current?.close() }} style={{ height: hp(4.5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: Colors.text_primary, flex: 1, fontFamily: Fonts.Medium, fontSize: fp(1.9) }}>{item?.label}</Text>

                            {
                                selectedLanguage?.value === item?.value && <Check size={fp(3)} color={Colors.success} />
                            }

                        </Pressable>

                    }}
                    keyboardShouldPersistTaps="handled"


                />




            </AppBottomSheet>


            <AppBottomSheet ref={dayRef} title={'Select'} snapPoints={['50%']}  >


                <BottomSheetFlatList
                    data={reminders}
                    contentContainerStyle={{ marginTop: hp(2), paddingBottom: hp(4) }}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {

                        return <Pressable onPress={() => { setValue('auto_reminder', item); dayRef?.current?.close() }} style={{ height: hp(4.5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: Colors.text_primary, flex: 1, fontFamily: Fonts.Medium, fontSize: fp(1.9) }}>{item?.label}</Text>

                            {
                                selectedDays?.value === item?.value && <Check size={fp(3)} color={Colors.success} />
                            }

                        </Pressable>

                    }}
                    keyboardShouldPersistTaps="handled"


                />




            </AppBottomSheet>

            <AppBottomSheet ref={reminderRef} title={'Select'} snapPoints={['50%']}  >


                <BottomSheetFlatList
                    data={noOfReminders}
                    contentContainerStyle={{ marginTop: hp(2), paddingBottom: hp(4) }}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {

                        return <Pressable onPress={() => { setValue('number_of_reminders', item); reminderRef?.current?.close() }} style={{ height: hp(4.5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: Colors.text_primary, flex: 1, fontFamily: Fonts.Medium, fontSize: fp(1.9) }}>{item}</Text>

                            {
                                selectedNumberOfReminders === item && <Check size={fp(3)} color={Colors.success} />
                            }

                        </Pressable>

                    }}
                    keyboardShouldPersistTaps="handled"


                />




            </AppBottomSheet>



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

        // shadow (iOS)
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,

        // elevation (Android)
        // elevation: 4,
    },

    title: {
        fontSize: fp(2.2),
        fontFamily: Fonts.SemiBold,
        color: Colors.text_primary,
        letterSpacing: 0.5,
    },

    input: {
        // flex: 1,
        height: hp(20),
        fontSize: 16,
        color: Colors.text_primary,
        fontFamily: Fonts.Regular,
        flexDirection: 'row',
        // alignItems: 'center',
        borderWidth: 1,
        borderRadius: 3,
        paddingHorizontal: 14,
        backgroundColor: Colors.background,

    },

    label: {
        fontSize: 14,
        color: Colors.text_primary,
        fontFamily: Fonts.Medium,
        marginBottom: 6,
    },
    error: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
    },
})