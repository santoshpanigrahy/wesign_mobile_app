import { Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState, useCallback, memo, useMemo, useImperativeHandle, forwardRef } from 'react'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import { ArrowLeft, BookUser, ChevronDown, EllipsisVertical, Info, KeyRound, Mail, Phone, Save, Trash, User, UserPlus, X } from 'lucide-react-native'
import { Colors, Fonts, fp, hp, RECIPIENT_COLORS, wp } from '@utils/Constants'
import AppBottomSheet from '@components/AppBottomSheet'
import { Controller, useForm } from 'react-hook-form'
import AppInput from '@components/AppInput'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CountryPicker, { getAllCountries } from "react-native-country-picker-modal";
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated'
import AddressBook from '@components/AddressBook'
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useAppDispatch, useAppSelector } from '@redux/hooks'
import { deleteRecipientById, resetEnvelope, setRecipients, setRecipientsBulk, setSigningOrder, updateRecipientById } from '@redux/slices/envelopeSlice'
import AppButton from '@components/AppButton'
import { goBack, navigate, replace, resetAndNavigate } from '@utils/NavigationUtils'
import AppToggleButton from '@components/AppToggleButton'
import Toast from 'react-native-toast-message'
import { hideLoader, showLoader } from '@redux/slices/loaderSlice'
import moment from 'moment'
import api from '@utils/api';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useKeyboard } from '@utils/documentService'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import RecipientEmailField from '@components/RecipientEmailField'
import RecipientNameField from '@components/RecipientNameField'

const typeOptions = [
  { label: "Email", value: "email" },
  { label: "Email & SMS", value: "email_and_sms" },
  { label: "SMS", value: "sms" }
];

const roleOptions = [
  { label: "Need to Sign", value: "needs_to_sign", subLabel: "For anyone who isn't with you" },
  { label: "Receives a Copy", value: "receive_copy", subLabel: "For anyone who is with you" },
  { label: "In Person Sign", value: "in_person_sign", subLabel: "For anyone who needs a signed copy" }
];

// --- 1. Memoized Drag Item ---
const DraggableRecipientItem = memo(({ item, drag, isActive, onMenuOpen, onEdit }) => {
  const badgeColor = item.action === 'needs_to_sign' ? '#1fadff' : item.action === 'receive_copy' ? "#52f439" : "#f76e48";
  const badgeLabel = item.action === "needs_to_sign" ? "Need to Sign" : item.action === "receive_copy" ? "Receives a Copy" : item.action === "in_person_sign" ? "In Person Sign" : '';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={drag}
      onPress={() => onEdit(item)}
      style={[styles.recipientCard, { backgroundColor: isActive ? "#ddd" : "#fff", borderLeftColor: item?.meta_info?.recepient_border_color }]}
    >
      <View style={[styles.recipientCircle, { backgroundColor: item?.meta_info?.recepient_border_color }]}>
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

        {item?.recepient_phone && (
          <View style={styles.contactRow}>
            <Phone color={Colors.text_secondary} size={fp(1.8)} />
            <Text style={styles.recipientCardEmail} numberOfLines={1}>{item?.recepient_phone_code}-{item?.recepient_phone}</Text>
          </View>
        )}

        <Text style={[styles.recipientCardAction, { backgroundColor: badgeColor }]}>{badgeLabel}</Text>
      </View>

      <TouchableOpacity style={styles.iconWrapper} onPress={() => onMenuOpen(item)}>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_secondary} strokeWidth={1.6} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

// --- 2. Isolated Form Component (Stops Main Screen Re-renders) ---
const RecipientFormModal = forwardRef(({ onClose, onSave, onSaveAndReset, editData, openAddressBook, recipientsList }, ref) => {
  const [countries, setCountries] = useState([]);
  const [showSecurity, setShowSecurity] = useState(false);
  const [isPhoneNumberFocus, setPhoneNumberFocus] = useState(false);

  const { control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
    defaultValues: editData || {
      method: 'email',
      action: 'needs_to_sign',
      recepient_name: '',
      recepient_email: '',
      host_email: '',
      recepient_phone: '',
      recepient_phone_code: '+1',
      recepient_country_code: 'US',
      meta_data: [],
      completed_alert: true,
      sign_request_alert: true,
      access_code: ''
    }
  });

  const method = watch("method");
  const action = watch("action");

  // Lazy load countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to load countries' });
      }
    };
    fetchCountries();
  }, []);


  useImperativeHandle(ref, () => ({
    populateFromAddressBook: async (recipient) => {
      Keyboard.dismiss();
      setValue('recepient_name', recipient?.recepient_name || '');

      if (method === 'sms' || method === 'email_and_sms') {
        const phoneCode = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[0] : "+1";
        const phone = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[1] : "";

        const cleanCode = phoneCode.replace('+', '');
        const foundCountry = countries.find(country => country.callingCode && country.callingCode.includes(cleanCode));
        const countryCode = foundCountry ? foundCountry.cca2 : 'US';

        setValue('recepient_phone', phone || '');
        setValue('recepient_phone_code', phoneCode || '');
        setValue('recepient_country_code', countryCode);
      }

      if (method === 'email' || method === 'email_and_sms') {
        setValue('recepient_email', recipient?.recepient_email || '');
      }
    }
  }));

  const saveAndReset = (data) => {
    onSaveAndReset(data);
    reset()
  }

  return (
    <Animated.View entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))} exiting={FadeOut.duration(100)} style={styles.overlay}>
      <View style={styles.modalHeaderRow}>
        <View style={styles.modalTitleRow}>
          <TouchableOpacity onPress={onClose}>
            <X color={Colors.text_primary} size={fp(3)} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editData ? 'Edit' : 'Add'} Recipient</Text>
        </View>
        <TouchableOpacity onPress={handleSubmit(onSave)}>
          <Text style={styles.saveBtnText}>{editData ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>



      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        enableOnAndroid={true}
        extraScrollHeight={150}
        showsVerticalScrollIndicator={false}>


        <View style={styles.formContainer}>
          <Controller control={control} name="method" render={({ field: { onChange, value } }) => (
            <View>
              <Text style={styles.label}>Method<Text style={styles.error}>*</Text></Text>
              <View style={styles.typeWrapper}>
                {typeOptions.map((item) => (
                  <TouchableOpacity key={item.value} style={[styles.type, value === item.value && styles.activeType]} onPress={() => onChange(item.value)}>
                    <Text style={[styles.typeText, value === item.value && styles.activeTypeText]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )} />

          {action === "in_person_sign" && (
            <Controller control={control} name="host_email" rules={{
              required: 'Host email is required', pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            }} render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AppInput label="Host Email" placeholder="Enter host email" value={value} onChangeText={onChange} error={error?.message} leftIcon={Mail} />
            )} />
          )}

          <RecipientNameField method={method} control={control} recipientsList={recipientsList} onSelectedRecipient={(data) => {
            ref?.current?.populateFromAddressBook(data)
          }} openAddressBook={openAddressBook} />

          {/* <Controller control={control} name="recepient_name" rules={{ required: 'Name is required' }} render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AppInput label="Name" placeholder="Enter your name" value={value} onChangeText={onChange} error={error?.message} leftIcon={User} onRightIconPress={openAddressBook} rightIcon={BookUser} />
          )} /> */}

          <RecipientEmailField method={method} control={control} recipientsList={recipientsList} onSelectedRecipient={(data) => {
            ref?.current?.populateFromAddressBook(data)
          }} />


          {/* {(method === "email_and_sms" || method === "email") && (
            <Controller control={control} name="recepient_email" rules={{
              required: 'Email is required', pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            }} render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AppInput label="Email" placeholder="Enter your email" value={value} onChangeText={onChange} error={error?.message} leftIcon={Mail} />
            )} />
          )} */}

          {(method === "email_and_sms" || method === "sms") && (
            <View>
              <Text style={styles.label}>Phone Number<Text style={styles.error}>*</Text></Text>
              <View style={[styles.inputBox, { borderColor: errors?.recepient_phone?.message ? Colors.error : isPhoneNumberFocus ? Colors.primary_dark : Colors.text_secondary }]}>
                <Controller control={control} name="recepient_country_code" render={({ field: { onChange, value } }) => (
                  <CountryPicker countryCode={value || 'US'} withFlag withCallingCode={false} withFilter onSelect={(country) => onChange(country.cca2)} />
                )} />
                <Controller control={control} name="recepient_phone" rules={{ required: "Phone is required", validate: (value) => value?.length === 10 || "Must be 10 digits" }} render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="Enter phone number" keyboardType="number-pad" placeholderTextColor={Colors.placeholder} value={value} onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))} onFocus={() => setPhoneNumberFocus(true)} onBlur={() => setPhoneNumberFocus(false)} />
                )} />
              </View>
              {errors?.recepient_phone?.message && <Text style={styles.error}>{errors?.recepient_phone?.message}</Text>}
            </View>
          )}

          <View>
            <Text style={[styles.label, { marginBottom: wp(3) }]}>Action<Text style={styles.error}>*</Text></Text>
            <Controller control={control} name="action" rules={{ required: "Select Action" }} render={({ field: { onChange, value } }) => (
              <View style={styles.actionGroup}>
                {roleOptions.map((item) => (
                  <TouchableOpacity key={item.value} onPress={() => onChange(item.value)} style={styles.actionBtn}>
                    <View style={styles.outerCircle}>
                      {value === item.value && <View style={styles.innerCircle} />}
                    </View>
                    <View style={styles.actionTextWrapper}>
                      <Text style={styles.actionLabel}>{item.label}</Text>
                      <Text style={styles.actionSubLabel}>{item.subLabel}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )} />
          </View>

          <View style={styles.securityWrapper}>
            <TouchableOpacity onPress={() => setShowSecurity(!showSecurity)} style={styles.securityToggle}>
              <Text style={styles.securityTitle}>Advance Security</Text>
              <ChevronDown color={Colors.text_primary} size={fp(3)} strokeWidth={1.5} />
            </TouchableOpacity>

            {showSecurity && (
              <Animated.View entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))} exiting={FadeOut.duration(100)} style={styles.securityGroup}>
                <Controller control={control} name="access_code" render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <AppInput secureTextEntry required={false} label="Access Code" placeholder="Enter your access code" value={value} onChangeText={onChange} error={error?.message} leftIcon={KeyRound} />
                )} />

                <Controller control={control} name="sign_request_alert" render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <View style={styles.switchTitleGroup}>
                      <Text style={styles.switchLabel}>Sign Request Alert</Text>
                      <Info color={Colors.text_primary} size={fp(2.3)} />
                    </View>
                    <TouchableOpacity onPress={() => onChange(!value)}>
                      <Image source={value ? require('@assets/icons/switch_on.png') : require('@assets/icons/switch_off.png')} style={styles.switchImg} />
                    </TouchableOpacity>
                  </View>
                )} />

                <Controller control={control} name="completed_alert" render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <View style={styles.switchTitleGroup}>
                      <Text style={styles.switchLabel}>Completed Alert</Text>
                      <Info color={Colors.text_primary} size={fp(2.3)} />
                    </View>
                    <TouchableOpacity onPress={() => onChange(!value)}>
                      <Image source={value ? require('@assets/icons/switch_on.png') : require('@assets/icons/switch_off.png')} style={styles.switchImg} />
                    </TouchableOpacity>
                  </View>
                )} />
              </Animated.View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {
        !editData && <View style={{ paddingTop: hp(1), backgroundColor: Colors.white }}>

          <AppButton onPress={handleSubmit(saveAndReset)} title='Save & Add New Recipient' />
        </View>
      }



    </Animated.View>
  );
});


// --- 3. Main Screen ---
const AddRecipientScreen = ({ navigation }) => {
  const envelopeDocuments = useAppSelector(state => state.envelope.envelopeDocuments);
  const userId = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);
  const enableSigningOrder = useAppSelector(state => state?.envelope?.set_signing_order);
  const enableEnvelopeId = useAppSelector(state => state.envelope?.enable_writing_id);

  const invalidEmailsRef = useRef();
  const duplicateWarningRef = useRef();

  const [invalidEmails, setInvalidEmails] = useState([]);

  const validateAllEmail = async (mails) => {

    if (!mails || mails.length === 0) {
      return true;
    }


    const requestData = { emails: mails };

    try {


      const response = await api.post('/api/validate/email', requestData)

      const data = response.data;


      setInvalidEmails(data.invalid || []);

      return data.status === true;

    } catch (error) {
      console.error("Email validation error:", error);
      return false;
    }
  };

  const handleValidateEmail = async (mail) => {


    const isValidate = await validateEmail(mail);

    console.log(isValidate)

    if (isValidate) {
      const updatedValidEmails = invalidEmails?.filter(m => m !== mail);
      setInvalidEmails(updatedValidEmails);

      if (updatedValidEmails?.length === 0) {
        invalidEmailsRef?.current?.close();
      }
    }


  }

  const validateEmail = async (mail) => {

    dispatch(showLoader('Validating'));

    if (!mail) {
      return true;
    }


    const requestData = { email: mail };

    try {


      const response = await api.post('/api/validate/email', requestData)

      const data = response.data;




      return data.status === true;

    } catch (error) {
      console.error("Email validation error:", error);
      Toast.show({ type: 'error', text1: error?.message });
      return false;

    } finally {
      dispatch(hideLoader());

    }
  };

  const isKeyboardOpen = useKeyboard();

  const recipientRef = useRef(null);
  const editRef = useRef(null);
  const formModalRef = useRef(null);

  const [recipientsList, setRecipientsList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null); // Used for Action Sheet
  const [editData, setEditData] = useState(null); // Used for Modal Form

  const handleSaveToRedux = (data) => {
    // const isDuplicate = recipients.some(r =>
    //   r.id !== editData?.id && r.recepient_email === data.recepient_email && r.recepient_phone === data.recepient_phone
    // );

    // if (isDuplicate) {
    //   Toast.show({ type: 'error', text1: 'This recipient already exists' });
    //   return;
    // }

    if (editData) {
      dispatch(updateRecipientById({ id: editData.id, data }));
    } else {
      const usedColors = recipients.map((r) => r.meta_info?.recepient_color);
      const availableColors = RECIPIENT_COLORS.filter((c) => !usedColors.includes(c?.recepient_color));
      const selectedColor = availableColors.length > 0 ? availableColors[0] : RECIPIENT_COLORS[Math.floor(Math.random() * RECIPIENT_COLORS.length)];

      dispatch(setRecipients({ ...data, id: Date.now().toString(), meta_info: selectedColor }));
    }
    setModalVisible(false);
    setEditData(null);
  };

  const handleSaveToReduxAndReset = (data) => {



    const usedColors = recipients.map((r) => r.meta_info?.recepient_color);
    const availableColors = RECIPIENT_COLORS.filter((c) => !usedColors.includes(c?.recepient_color));
    const selectedColor = availableColors.length > 0 ? availableColors[0] : RECIPIENT_COLORS[Math.floor(Math.random() * RECIPIENT_COLORS.length)];

    dispatch(setRecipients({ ...data, id: Date.now().toString(), meta_info: selectedColor }));

    Toast.show({
      type: 'success',
      text1: 'Recipient Added'
    })


  };

  const handleSaveEnvelope = async () => {
    dispatch(showLoader('Saving'))
    const envelope_documents = envelopeDocuments?.filter(doc => !doc.error).map(document => ({
      document_id: document.document_id, document_key: document.document_key, document_url: document.document_url,
    }));

    const request_data = {
      subject: 'Wesign:'.substring(0, 240),
      holder: userId,
      envelope_recepients: recipients.map(item => ({ ...item, host_email: item.host_email || null })),
      envelope_documents: envelope_documents,
      email_content: { subject: 'Wesign:', content: "" },
      expiry_date: null,
      enable_comments: false,
      last_changed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
      last_viewed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
      follow_signing_order: enableSigningOrder,
      enable_writing_id: enableEnvelopeId,
      enable_certification: true,
    };

    try {
      const res = await api.post('/api/envelope', request_data);
      if (res?.status) {
        // resetAndNavigate('Drawer');
        navigation.pop(2);
        // navigation.replace('Drawer');

        dispatch(resetEnvelope());

        Toast.show({ type: 'success', text1: "Draft Saved Successfully" });

      }
    } catch (error) { Toast.show({ type: 'error', text1: error?.message }); }
    finally { dispatch(hideLoader()) }
  }




  const openRecipientSheet = useCallback((recipient) => {
    setSelectedRecipient(recipient);
    editRef.current?.snapToIndex(0);
  }, []);

  const handleDeleteRecipient = useCallback(() => {
    if (selectedRecipient) dispatch(deleteRecipientById(selectedRecipient.id));
    editRef.current?.close();
  }, [dispatch, selectedRecipient]);

  const handleEditRecipient = useCallback((recipient) => {
    setEditData(recipient);
    // editRef.current?.close();
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }) => {
    return <DraggableRecipientItem item={item} drag={drag} isActive={isActive} onEdit={handleEditRecipient} onMenuOpen={openRecipientSheet} />;
  }, [openRecipientSheet]);

  const renderErrorItem = useCallback(({ item }) => {


    return (
      <View style={styles.fileItemError} >


        <Text style={{ fontFamily: Fonts.Medium, fontSize: fp(1.7), flex: 1 }}>{item}</Text>

        <TouchableOpacity onPress={() => handleValidateEmail(item)} style={{ borderRadius: wp(8), backgroundColor: Colors.error, height: hp(5), width: wp(20), justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: Fonts.SemiBold, color: Colors.white }}>Validate</Text>
        </TouchableOpacity>



      </View>



    );
  }, [validateEmail]);

  const handleNext = async () => {


    let recepientEmails = new Set();

    if (!enableSigningOrder) {
      for (let recipient of recipients) {

        if (recipient.action === "in_person_sign") continue;


        if (
          recipient &&
          (recipient.method === "email" ||
            recipient.method === "email_and_sms")
        ) {
          const email = recipient.recepient_email?.toLowerCase()?.trim();

          // Skip empty emails
          if (!email) continue;

          if (recepientEmails.has(email)) {
            console.error("Duplicate recipient email found: " + email);

            duplicateWarningRef?.current?.snapToIndex(0);
            return;
          }

          recepientEmails.add(email);
        }
      }
    }



    let emailCount: any = {};

    let updatedRecipients = recipients.map((r, i) => {
      let updatedRecipient = { ...r };

      // Generate dummy email for in-person sign
      if (
        (updatedRecipient.method === "email" ||
          updatedRecipient.method === "email_and_sms") &&
        updatedRecipient.action === "in_person_sign" &&
        (!updatedRecipient.recepient_email ||
          updatedRecipient.recepient_email === "")
      ) {
        updatedRecipient.recepient_email =
          `${updatedRecipient.recepient_name}${i}@wesign.com`;
      }

      // Apply duplicate email handling only if signing order enabled
      if (
        enableSigningOrder &&
        (updatedRecipient.method === "email" ||
          updatedRecipient.method === "email_and_sms") &&
        updatedRecipient.recepient_email
      ) {
        const email = updatedRecipient.recepient_email.toLowerCase();

        console.log(email)

        if (!emailCount.hasOwnProperty(email)) {


          emailCount[email] = 0;
          return r;
        } else {
          emailCount[email] += 1;

          const [name, domain] = email.split("@");

          updatedRecipient.recepient_email =
            `${name}+${emailCount[email]}@${domain}`;
        }
      }

      return updatedRecipient;
    });


    // console.log(updatedRecipients);
    dispatch(setRecipientsBulk(updatedRecipients));

    const emails = updatedRecipients?.map(r => r?.recepient_email);


    const isValidEmails = await validateAllEmail(emails);

    if (isValidEmails) {
      navigate('Canvas');
    } else {
      invalidEmailsRef?.current?.snapToIndex(0);
    }

  }

  if (!recipients) {
    return null;
  }

  return (
    <CustomSafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}><ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} /></TouchableOpacity>
        <Text style={styles.title}>Add Recipients</Text>
        <Menu>
          <MenuTrigger><EllipsisVertical size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} /></MenuTrigger>
          <MenuOptions placement="bottom" customStyles={{ optionsContainer: styles.menuContainer }}>
            <MenuOption onSelect={handleSaveEnvelope}>
              <View style={styles.menuRow}>
                <Save color={Colors.text_primary} size={fp(2.5)} />
                <Text style={styles.menuText}>Save</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => { dispatch(resetEnvelope()); navigation.pop(2); }}>
              <View style={styles.menuRow}>
                <Trash color={Colors.error} size={fp(2.5)} />
                <Text style={styles.menuErrorText}>Discard</Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <View style={styles.container}>
        {recipients?.length > 0 && (
          <AppToggleButton containerStyle={styles.toggleBtnWrapper} size={40} label='Set Signing Order' value={enableSigningOrder} onToggle={(v) => dispatch(setSigningOrder(v))} />
        )}

        <TouchableOpacity onPress={() => { setEditData(null); setModalVisible(true); }} style={styles.addBtn}>
          <UserPlus color={Colors.text_primary} size={fp(2.5)} />
          <Text style={styles.addBtnText}>Add Recepient</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            removeClippedSubviews={false}
            data={recipients}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => dispatch(setRecipientsBulk(data))}
            // Optional: Add some bottom padding so the last item isn't flush with the button
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

      </View>

      {recipients?.length > 0 && (
        <View style={styles.footer}>
          <AppButton onPress={handleNext} title='Next' style={styles.nextBtn} />
        </View>
      )}



      {modalVisible && (
        <RecipientFormModal
          editData={editData}
          ref={formModalRef}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveToRedux}
          onSaveAndReset={handleSaveToReduxAndReset}
          recipientsList={recipientsList}
          openAddressBook={() => recipientRef.current?.snapToIndex(0)}

        />
      )}

      <AppBottomSheet ref={recipientRef} title={'Address Book'} snapPoints={['100%']}>
        {/* Pass your logic for handling selection back from AddressBook to RecipientFormModal via ref or global state if needed */}
        <AddressBook setRecipientsList={setRecipientsList} onSelectRecipient={(data) => {
          formModalRef.current?.populateFromAddressBook(data);
          if (isKeyboardOpen) {
            setTimeout(() => {
              recipientRef.current?.close();
            }, 250);
          } else {
            recipientRef.current?.close()
          }

        }} />
      </AppBottomSheet>



      <AppBottomSheet ref={editRef} withCloseBtn={false} snapPoints={["10%"]}>
        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.sheetActionRow} onPress={handleDeleteRecipient}>
            <Trash size={fp(2.5)} color={Colors.error} />
            <Text style={styles.providerText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      <AppBottomSheet ref={invalidEmailsRef} withCloseBtn={false} containerStyle={{ paddingBottom: wp(4) }} snapPoints={["50%"]}>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.Medium, color: Colors.text_primary, fontSize: fp(1.9), marginBottom: hp(1) }}>
            Invalid Emails Detected
          </Text>

          <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_secondary, fontSize: fp(1.7), marginBottom: hp(1) }}>
            We detected invalid email addresses in your list. Kindly update them before proceeding.
          </Text>



          <BottomSheetFlatList
            data={invalidEmails}
            contentContainerStyle={{ flex: 1 }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderErrorItem}
            keyboardShouldPersistTaps="handled"
          />

          {/* <AppButton title='Remove All' onPress={() => clearAllErrorFiles()} style={{ backgroundColor: Colors.error }} /> */}

        </View>

      </AppBottomSheet>

      <AppBottomSheet ref={duplicateWarningRef} withCloseBtn={false} containerStyle={{ paddingBottom: wp(4) }} snapPoints={["30%"]}>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.SemiBold, color: Colors.text_primary, fontSize: fp(2.3), marginBottom: hp(1) }}>
            Duplicate recipients found
          </Text>

          <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_secondary, fontSize: fp(1.7), marginBottom: hp(1) }}>
            This envelope contains duplicate recipients at the same signing order position.
          </Text>

          <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_secondary, fontSize: fp(1.7), marginBottom: hp(5) }}>
            To keep the duplicates, edit the recipients list to set a signing order and adjust order as needed.
          </Text>





          <AppButton title='Enable Signing Order' onPress={() => {



            dispatch(setSigningOrder(true));
            duplicateWarningRef?.current?.close()

          }} style={{ backgroundColor: Colors.error }} />

        </View>

      </AppBottomSheet>

    </CustomSafeAreaView>
  )
}

export default AddRecipientScreen

// --- Extracted & Cleaned Styles ---
const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  container: { flex: 1, padding: wp(5), backgroundColor: '#F4F7FB' },
  header: { height: hp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(5), backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: fp(2.2), fontFamily: Fonts.SemiBold, color: Colors.text_primary, letterSpacing: 0.5 },
  menuContainer: { marginTop: hp(2), paddingVertical: 3, backgroundColor: '#fff', elevation: 3 },
  menuRow: { height: hp(4), gap: wp(2), flexDirection: "row", alignItems: 'center', paddingHorizontal: wp(3) },
  menuText: { fontFamily: Fonts.Medium, color: Colors.text_primary, fontSize: fp(1.9) },
  menuErrorText: { fontFamily: Fonts.Medium, color: Colors.error, fontSize: fp(1.9) },
  addBtn: { backgroundColor: Colors.white, height: hp(8), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2), borderStyle: 'dashed', borderColor: Colors.border, borderWidth: 1.5, marginBottom: hp(1) },
  addBtnText: { fontSize: fp(2), fontFamily: Fonts.SemiBold, color: Colors.text_primary },
  footer: { backgroundColor: Colors.white, height: hp(9), flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: wp(5) },
  nextBtn: { width: wp(25), height: hp(5.2) },
  overlay: { position: 'absolute', top: 0, left: 0, height: hp(100), backgroundColor: Colors.white, width: wp(100), padding: wp(5) },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  modalTitle: { fontFamily: Fonts.SemiBold, color: Colors.text_primary, fontSize: fp(2) },
  saveBtnText: { fontFamily: Fonts.Bold, color: Colors.primary_dark, fontSize: fp(2) },
  formContainer: { gap: hp(2), paddingTop: hp(1) },
  label: { fontSize: 14, color: Colors.text_primary, fontFamily: Fonts.Medium, marginBottom: 6 },
  error: { color: Colors.error, fontSize: 12, marginTop: 4 },
  typeWrapper: { flexDirection: 'row', gap: wp(3) },
  type: { height: hp(5), justifyContent: 'center', alignItems: 'center', flex: 1, borderColor: Colors.text_secondary, borderWidth: 1, borderRadius: 2 },
  activeType: { borderColor: "#319af1", backgroundColor: "#319af110" },
  typeText: { color: Colors.text_primary, fontFamily: Fonts.Regular, fontSize: fp(1.7) },
  activeTypeText: { color: Colors.primary_dark },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 3, paddingHorizontal: 12, backgroundColor: Colors.background },
  input: { flex: 1, height: 48, fontSize: 16, color: Colors.text_primary, fontFamily: Fonts.Regular },
  actionGroup: { gap: hp(2.5) },
  actionBtn: { flexDirection: "row", alignItems: 'flex-start', gap: wp(2) },
  outerCircle: { width: wp(6), height: wp(6), borderRadius: wp(3), borderWidth: 1.5, borderColor: "#007AFF", justifyContent: "center", alignItems: "center", marginTop: 3 },
  innerCircle: { width: wp(3), height: wp(3), borderRadius: wp(1.5), backgroundColor: "#007AFF" },
  actionTextWrapper: { marginLeft: 10 },
  actionLabel: { fontSize: fp(1.8), fontFamily: Fonts.Regular, color: Colors.text_primary },
  actionSubLabel: { fontSize: fp(1.6), fontFamily: Fonts.Regular, color: Colors.text_secondary, marginTop: wp(1.5) },
  securityWrapper: { marginTop: hp(0.5) },
  securityToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(2), height: hp(6) },
  securityTitle: { flex: 1, fontFamily: Fonts.SemiBold, fontSize: fp(2) },
  securityGroup: { gap: hp(3) },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchTitleGroup: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  switchLabel: { fontSize: 14, color: Colors.text_primary, fontFamily: Fonts.Medium },
  switchImg: { width: wp(11), height: wp(7) },
  recipientCard: { flexDirection: 'row', gap: wp(4), borderLeftWidth: 4, alignItems: 'center', paddingHorizontal: wp(3.5), elevation: 1, paddingVertical: hp(2), borderRadius: 0, marginBottom: hp(1) },
  recipientCircle: { width: wp(10), height: wp(10), borderRadius: wp(5), justifyContent: 'center', alignItems: 'center' },
  recipientCircleText: { textTransform: 'uppercase', textAlign: 'center', color: Colors.white, fontFamily: Fonts.SemiBold },
  recipientCardName: { fontFamily: Fonts.SemiBold, fontSize: fp(2), color: Colors.text_primary, marginBottom: 3 },
  recipientCardEmail: { fontFamily: Fonts.Regular, fontSize: fp(1.7), color: Colors.text_secondary, marginBottom: 3 },
  recipientCardAction: { fontFamily: Fonts.Regular, fontSize: fp(1.3), color: Colors.white, maxWidth: 'auto', width: wp(24), borderRadius: wp(6), alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingVertical: 1, marginTop: 7 },
  iconWrapper: { width: wp(10), height: wp(10), borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  toggleBtnWrapper: { backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: wp(2), height: hp(8), marginBottom: hp(1), paddingHorizontal: wp(4) },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  mailIcon: { marginTop: 1 },
  sheetActions: { paddingHorizontal: wp(4) },
  sheetActionRow: { flexDirection: 'row', gap: wp(3), alignItems: 'center', height: hp(6) },
  providerText: { fontFamily: Fonts.Regular, fontSize: fp(2), color: Colors.text_primary },
  fileItemError: {
    backgroundColor: '#fff',
    padding: wp(3),
    paddingRight: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center"
  },
});