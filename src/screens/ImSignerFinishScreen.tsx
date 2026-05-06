import { FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import { ArrowLeft, CalendarDays, Check, ChevronDown, EllipsisVertical, Mail, Trash, UserPlus } from 'lucide-react-native'
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
import { deleteRecipientById, resetEnvelope, setRecipients, updateRecipientById } from '@redux/slices/envelopeSlice'
import IamSignerRecipientModal from '@components/IamSignerRecipientModal'


const DraggableRecipientItem = memo(({ item, onMenuOpen, onEdit }) => {

    return (
        <Pressable
            // activeOpacity={0.9}

            onPress={() => onEdit(item)}
            style={styles.recipientCard}
        >
            <View style={styles.recipientCircle}>
                <Text style={styles.recipientCircleText}>{item?.recepient_name?.slice(0, 2)}</Text>
            </View>

            <View style={styles.flexOne}>
                <Text style={styles.recipientCardName} numberOfLines={1}>{item?.recepient_name}</Text>

                {item?.recepient_email && (
                    <View style={styles.contactRow}>
                        <Mail color={Colors.text_secondary} size={fp(1.8)} style={styles.mailIcon} />
                        <Text style={styles.recipientCardEmail} numberOfLines={1}>{item?.recepient_email}</Text>
                    </View>
                )}




            </View>

            <TouchableOpacity style={styles.iconWrapper} onPress={() => onMenuOpen(item)}>
                <EllipsisVertical size={fp(2.8)} color={Colors.text_secondary} strokeWidth={1.6} />
            </TouchableOpacity>
        </Pressable>
    );
});

const IamSignerFinishScreen = ({ navigation }) => {
    const user = useAppSelector(state => state?.auth?.user);
    const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);
    const envelopeDocuments = useAppSelector(state => state?.envelope?.envelopeDocuments);
    const enableSigningOrder = useAppSelector(state => state?.envelope?.set_signing_order);
    const enableEnvelopeId = useAppSelector(state => state?.envelope?.enable_writing_id);


    const { id, first_name, last_name, email } = user;
    const fullName = first_name + " " + last_name;

    const fields = useAppSelector(state => state?.envelope?.allFields);
    const dispatch = useAppDispatch();

    const [editData, setEditData] = useState(null);


    const [isFocused, setIsFocused] = useState(false);


    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRecipientModal, setShowRecipientModal] = useState(false);

    const { control, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            subject: '',
            message: ''

        }
    });



    const onSubmit = async (data) => {

        dispatch(showLoader('Sending'))

        try {


            if (recipients?.length === 0) {
                Toast.show({ type: 'error', text1: "Please add Recipient" });
                return

            }





            const recipientFields = fields.map(field => ({
                ...field,
                top: field.y,
                left: field.x,
            }));


            const updatedRecipient = recipients?.map(recp => ({
                recepient_name: recp.recepient_name,
                recepient_email: recp.recepient_email,
                action: 'receive_copy',

                meta_data: []
            }));



            updatedRecipient.push({
                recepient_name: fullName,
                recepient_email: email,
                meta_data: recipientFields,
                action: "needs_to_sign",
                signed_lat: null,
                signed_long: null,
                signed_location: null,
                signed_ip: null
            })






            const envelope_documents = envelopeDocuments?.map((document) => ({
                document_id: document.document_id,
                document_key: document.document_key,
                document_url: document.document_url
            }));

            const { subject, message } = data;




            const request_data = {
                subject: subject.substring(0, 240),
                holder: id,

                envelope_recepients: updatedRecipient,
                envelope_documents,
                email_content: { subject: subject.substring(0, 240), content: message },
                expiry_date: moment().add(120, "days").format("YYYY-MM-DD"),

                im_signer: true,
                enable_comments: false,
                last_changed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
                last_viewed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),

                enable_writing_id: enableEnvelopeId,

                api_v1: true,

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

    const editRef = useRef(null);

    const [tempRecipient, setTempRecipient]: any = useState([]);

    console.log(tempRecipient)

    const onSaveRecipient = (data) => {

        if (editData) {
            dispatch(updateRecipientById({ id: editData?.id, data }));
        } else {

            dispatch(setRecipients({ ...data, id: Date.now().toString(), meta_data: [], action: "receive_a_copy" }));
        }

        setShowRecipientModal(false);
        setEditData(null);




    }





    const [selectedRecipient, setSelectedRecipient] = useState(null); // Used for Action Sheet

    const handleEditRecipient = useCallback((recipient) => {
        setEditData(recipient);
        setShowRecipientModal(true);
    }, []);

    const openRecipientSheet = useCallback((recipient) => {
        setSelectedRecipient(recipient);
        editRef.current?.snapToIndex(0);
    }, []);
    const renderItem = useCallback(({ item }) => {
        return <DraggableRecipientItem item={item} onEdit={handleEditRecipient} onMenuOpen={openRecipientSheet} />;
    }, [openRecipientSheet]);

    const handleDeleteRecipient = useCallback(() => {
        if (selectedRecipient) dispatch(deleteRecipientById(selectedRecipient.id));

        editRef.current?.close();
    }, [selectedRecipient]);




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
                        rules={{ required: 'Message is required' }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <View>
                                <Text style={styles.label}>
                                    Message<Text style={styles.asterisk}>*</Text>
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        error?.message ? styles.inputError : isFocused ? styles.inputFocus : styles.inputDefault
                                    ]}
                                    multiline
                                    textAlignVertical="top"
                                    placeholder='Enter message'
                                    placeholderTextColor={Colors.placeholder}
                                    value={value}
                                    onChangeText={onChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    autoComplete="off"
                                    textContentType="none"
                                    importantForAutofill="no"
                                />
                                {error?.message && <Text style={styles.error}>{error?.message}</Text>}
                            </View>
                        )}
                    />

                    <Text style={styles.infoText}>Send your signed document to anyone you would like. Enter an optional email address below </Text>

                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowRecipientModal(true)}>
                        <UserPlus color={Colors.text_primary} size={fp(2.5)} />
                        <Text style={styles.addBtnText}>Add Recepient</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <FlatList
                            removeClippedSubviews={false}
                            data={recipients}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            scrollEnabled={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>




                </KeyboardAwareScrollView>
            </View>


            <EnvelopeSentModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onGoToDashboard={() => {
                    setShowSuccessModal(false);
                    dispatch(resetEnvelope());
                    navigation?.pop(4);
                }}
            />

            <IamSignerRecipientModal editData={editData} visible={showRecipientModal} onClose={() => setShowRecipientModal(false)} onSave={onSaveRecipient} />

            <AppBottomSheet ref={editRef} withCloseBtn={false} snapPoints={["10%"]}>
                <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetActionRow} onPress={handleDeleteRecipient}>
                        <Trash size={fp(2.5)} color={Colors.error} />
                        <Text style={styles.providerText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </AppBottomSheet>
        </CustomSafeAreaView>
    )
}

export default IamSignerFinishScreen

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
        height: hp(15),
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
    },
    addBtn: { backgroundColor: Colors.white, height: hp(8), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2), borderStyle: 'dashed', borderColor: Colors.text_primary, borderWidth: 1.5, marginBottom: hp(1) },
    addBtnText: { fontSize: fp(2), fontFamily: Fonts.SemiBold, color: Colors.text_primary },
    recipientCard: { flexDirection: 'row', gap: wp(4), borderLeftWidth: 4, borderLeftColor: Colors.primary_dark, alignItems: 'center', paddingHorizontal: wp(3.5), elevation: 1, paddingVertical: hp(2), borderRadius: 0, marginBottom: hp(1) },
    recipientCircle: { width: wp(10), height: wp(10), borderRadius: wp(5), justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary_dark },
    recipientCircleText: { textTransform: 'uppercase', textAlign: 'center', color: Colors.white, fontFamily: Fonts.SemiBold },
    recipientCardName: { fontFamily: Fonts.SemiBold, fontSize: fp(2), color: Colors.text_primary, marginBottom: 3 },
    recipientCardEmail: { fontFamily: Fonts.Regular, fontSize: fp(1.7), color: Colors.text_secondary, marginBottom: 3 },
    recipientCardAction: { fontFamily: Fonts.Regular, fontSize: fp(1.3), color: Colors.white, maxWidth: 'auto', width: wp(24), borderRadius: wp(6), alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingVertical: 1, marginTop: 7 },
    iconWrapper: { width: wp(10), height: wp(10), borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
    mailIcon: { marginTop: 1 },
    sheetActions: { paddingHorizontal: wp(4) },
    sheetActionRow: { flexDirection: 'row', gap: wp(3), alignItems: 'center', height: hp(6) },
    providerText: { fontFamily: Fonts.Regular, fontSize: fp(2), color: Colors.text_primary },


});