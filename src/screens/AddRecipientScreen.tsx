import { Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import { ArrowLeft, BookUser, ChevronDown, EllipsisVertical, Info, KeyRound, Mail, Phone, Plus, Save, Trash, User, UserPlus, X } from 'lucide-react-native'
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
import { goBack, navigate, resetAndNavigate } from '@utils/NavigationUtils'
import AppToggleButton from '@components/AppToggleButton'
import Toast from 'react-native-toast-message'
import { hideLoader, showLoader } from '@redux/slices/loaderSlice'
import moment from 'moment'
import api from '@utils/api';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

const typeOptions = [{
  label: "Email",
  value: "email",
}, {
  label: "Email & SMS",
  value: "email_and_sms",
},
{
  label: "SMS",
  value: "sms",
}

];
const roleOptions = [{
  label: "Need to Sign",
  value: "needs_to_sign",
  subLabel: "For anyone who isn't with you"
},
{
  label: "Receives a Copy",
  value: "receive_copy",
  subLabel: "For anyone who is with you"
},

{
  label: "In Person Sign",
  value: "in_person_sign",
  subLabel: "For anyone who needs a signed copy"
}

];




const AddRecipientScreen = () => {

  const [countries, setCountries] = useState([]);

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
  const envelopeDocuments = useAppSelector(
    state => state.envelope.envelopeDocuments
  );
  const userId = useAppSelector(state => state.auth.user?.id);


  const dispatch = useAppDispatch();

  const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);


  const recipientRef = useRef(null);
  const editRef = useRef(null);
  const [showSecurity, setShowSecurity] = useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [isPhoneNumberFocus, setPhoneNumberFocus] = useState(false);
  const { control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
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



  // const [recipients, setRecipients] = useState([]);

  const method = watch("method");
  const action = watch("action");

  const onSubmit = (data: any) => {

    const isDuplicate = recipients.some(r =>
      r.id !== editRecipientId &&
      r.recepient_email === data.recepient_email &&
      r.recepient_phone === data.recepient_phone
    );

    if (isDuplicate) {
      Toast.show({
        type: 'error',
        text1: 'This recipient already exists',
      });
      return;
    }

    if (editRecipientId) {


      dispatch(updateRecipientById({
        id: editRecipientId,
        data
      }));

      setEditRecipientId(null)
    } else {

      const usedColors = recipients.map((r) => r.recepient_color);
      const availableColors = RECIPIENT_COLORS.filter(
        (c) => !usedColors.includes(c?.meta_info?.recepient_color)
      );


      const selectedColor = availableColors.length > 0
        ? availableColors[0]
        : RECIPIENT_COLORS[Math.floor(Math.random() * RECIPIENT_COLORS.length)];
      const meta_info = selectedColor;

      const newRecipient = {
        ...data,
        id: Date.now().toString(),
        meta_info,
      };



      dispatch(setRecipients(newRecipient));


    }


    handleCloseRecipient();
  };

  const handleSave = async () => {
    dispatch(showLoader('Saving'))
    var subject = 'Wesign:';

    console.log(recipients);



    const envelope_documents = envelopeDocuments
      ?.filter(doc => !doc.error)
      .map(document => ({
        document_id: document.document_id,
        document_key: document.document_key,
        document_url: document.document_url,
      }));


    var request_data = {
      subject: subject.substring(0, 240),
      holder: userId,
      envelope_recepients: recipients.map(item => ({
        ...item,
        host_email: item.host_email ? item.host_email : null
      })),
      envelope_documents: envelope_documents,
      email_content: {
        subject: subject,
        content: "",
      },
      expiry_date: null,
      enable_comments: false,
      last_changed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
      last_viewed: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
      follow_signing_order: enableSigningOrder,
      enable_writing_id: enableEnvelopeId,
      enable_certification: true,
    };

    console.log(request_data)

    try {

      const res = await api.post('/api/envelope', request_data);
      console.log(res)

      if (res?.status) {
        Toast.show({
          type: 'success',
          text1: "Draft Saved Successfully",
        });

        resetAndNavigate('Drawer');

        dispatch(resetEnvelope());
        // resetAndNavigate('Drawer');



      }



    } catch (error) {

      Toast.show({
        type: 'error',
        text1: error?.message,

      });
    } finally {
      dispatch(hideLoader())
    }



  }

  const handleDiscard = () => {
    dispatch(resetEnvelope());
    goBack();
  }

  const handleOpenRecipient = () => {

    setShowRecipientModal(true)

  }



  const getCountryCodeFromCallingCode = async (callingCode) => {

    if (!callingCode) return 'US';

    try {

      const cleanCode = callingCode.replace('+', '');





      const foundCountry = countries.find(country =>
        country.callingCode && country.callingCode.includes(cleanCode)
      );


      return foundCountry ? foundCountry.cca2 : 'US';

    } catch (error) {
      console.error("Error fetching country list:", error);
      return 'US';
    }
  };
  const handleRecipientSelect = async (recipient: any) => {
    console.log("Selected:", recipient);
    Keyboard.dismiss();

    setValue('recepient_name', recipient?.recepient_name || '');

    if (method === 'sms' || method === 'email_and_sms') {
      const phoneCode = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[0] : "+1";
      const phone = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[1] : "";
      const countryCode = await getCountryCodeFromCallingCode(phoneCode);
      setValue('recepient_phone', phone || '');
      setValue('recepient_phone_code', phoneCode || '');
      setValue('recepient_country_code', countryCode)
    } else if (method === 'email' || method === 'email_and_sms') {
      setValue('recepient_email', recipient?.recepient_email || '');

    }
    setTimeout(() => {
      recipientRef.current?.close();
    }, 200);
  };


  const [selectedRecipientId, setSelectedRecipientId] = useState(null)
  const openRecipientSheet = (id) => {

    setSelectedRecipientId(id);
    editRef.current?.snapToIndex(0);



  }

  const handleDeleteRecipient = () => {

    dispatch(deleteRecipientById(selectedRecipientId));

    editRef.current?.close();
  };

  const handleCloseRecipient = () => {
    setShowRecipientModal(false)
    reset({
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
    });
  }

  const [editRecipientId, setEditRecipientId] = useState(null);
  const handleEditRecipient = (recipient) => {

    setEditRecipientId(recipient.id);

    console.log("Selected:", recipient);

    setValue('action', recipient?.action);
    setValue('recepient_name', recipient?.recepient_name);
    setValue('recepient_email', recipient?.recepient_email);
    setValue('method', recipient?.method);
    setValue('host_email', recipient?.host_email);
    setValue('recepient_phone', recipient?.recepient_phone);
    setValue('recepient_phone_code', recipient?.recepient_phone_code);
    setValue('recepient_country_code', recipient?.recepient_country_code)
    setValue('meta_data', recipient?.meta_data);
    setValue('completed_alert', recipient?.completed_alert);
    setValue('sign_request_alert', recipient?.sign_request_alert);
    setValue('access_code', recipient?.access_code);


    setShowRecipientModal(true);

  }

  // const [enableEnvelopeId, setEnableEnvelopeId] = useState(false)
  const enableSigningOrder = useAppSelector(state => state?.envelope?.set_signing_order);
  const enableEnvelopeId = useAppSelector(state => state.envelope?.enable_writing_id);

  const handleNext = () => {
    navigate('Canvas');
  }

  const renderItem = ({ item, drag, isActive }) => {

    return <TouchableOpacity activeOpacity={0.9} onLongPress={drag} onPress={() => handleEditRecipient(item)} style={[styles.recipientCard, { backgroundColor: isActive ? "#ddd" : "#fff", borderLeftColor: item?.meta_info?.recepient_border_color }]}>

      <View style={[styles.recipientCircle, { backgroundColor: item?.meta_info.recepient_border_color }]}>

        <Text style={styles.recipientCircleText}>
          {item?.recepient_name?.slice(0, 2)}
        </Text>
      </View>


      <View style={{ flex: 1 }}>
        <Text style={styles.recipientCardName} numberOfLines={1}>{item?.recepient_name}</Text>

        {
          item?.recepient_email && <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
            <Mail color={Colors.text_secondary} size={fp(1.8)} style={{ marginTop: 1 }} />
            <Text style={styles.recipientCardEmail} numberOfLines={1}>{item?.recepient_email}</Text></View>

        }
        {
          item?.recepient_phone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
            <Phone color={Colors.text_secondary} size={fp(1.8)} />

            <Text style={styles.recipientCardEmail} numberOfLines={1}>{item?.recepient_phone_code}-{item?.recepient_phone}</Text></View>

        }

        <Text style={[styles.recipientCardAction, { backgroundColor: item.action === 'needs_to_sign' ? '#1fadff' : item.action === 'receive_copy' ? "#52f439" : "#f76e48" }]}>{
          item.action === "needs_to_sign" ? "Need to Sign" : item.action === "receive_copy" ? "Receives a Copy" : item.action === "in_person_sign" ? "In Person Sign" : ''
        }</Text>

      </View>

      <TouchableOpacity style={styles.iconWrapper} onPress={() => openRecipientSheet(item?.id)}>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_secondary} strokeWidth={1.6} />
      </TouchableOpacity>




    </TouchableOpacity>

  };


  return (
    <CustomSafeAreaView>



      <View style={styles.header}>


        <TouchableOpacity onPress={() => goBack()}>
          <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
        </TouchableOpacity>


        <Text style={styles.title}>Add Recipients</Text>


        <Menu>
          <MenuTrigger>
            <EllipsisVertical
              size={fp(2.8)}
              color={Colors.text_primary}
              strokeWidth={1.6}
            />
          </MenuTrigger>

          <MenuOptions placement="bottom"
            customStyles={{
              optionsContainer: {
                marginTop: hp(2),   // 👈 spacing from icon

                paddingVertical: 3,
                backgroundColor: '#fff',
                elevation: 3,
              },
            }}>
            <MenuOption onSelect={() => handleSave()}>
              <View style={{ height: hp(4), gap: wp(2), flexDirection: "row", alignItems: 'center', paddingHorizontal: wp(3) }}>
                <Save color={Colors.text_primary} size={fp(2.5)} />
                <Text style={{ fontFamily: Fonts.Medium, color: Colors.text_primary, fontSize: fp(1.9) }}>Save</Text>
              </View>

            </MenuOption>

            <MenuOption onSelect={() => handleDiscard()}>
              <View style={{ height: hp(4), gap: wp(2), flexDirection: "row", alignItems: 'center', paddingHorizontal: wp(3) }}>
                <Trash color={Colors.error} size={fp(2.5)} />
                <Text style={{ fontFamily: Fonts.Medium, color: Colors.error, fontSize: fp(1.9) }}>Discard</Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>

      </View>


      <View style={styles.container}>

        {
          recipients?.length > 0 && <AppToggleButton containerStyle={styles.toggleBtnWrapper} size={40} label='Set Singing Order' value={enableSigningOrder} onToggle={(v) => dispatch(setSigningOrder(v))} />

        }



        <DraggableFlatList
          // contentContainerStyle={{ flex: 1 }}
          data={recipients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => dispatch(setRecipientsBulk(data))} // 👈 update order
        />



        <TouchableOpacity onPress={handleOpenRecipient} style={{ backgroundColor: Colors.white, height: hp(8), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2), borderStyle: 'dashed', borderColor: Colors.border, borderWidth: 1.5, marginTop: hp(1) }}>
          <UserPlus color={Colors.text_primary} size={fp(2.5)} />
          <Text style={{ fontSize: fp(2), fontFamily: Fonts.SemiBold, color: Colors.text_primary }}>Add Recepient</Text>
        </TouchableOpacity>

      </View>

      {
        recipients?.length > 0 && <View style={{ backgroundColor: Colors.white, height: hp(9), flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: wp(5) }}>
          <AppButton onPress={() => handleNext()} title='Next' style={{ width: wp(25), height: hp(5.2) }} />
        </View>
      }










      {
        showRecipientModal && <Animated.View
          entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))}
          // 🚀 Faster exit (100ms)
          exiting={FadeOut.duration(100)}
          style={styles.overlay}
        >

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
              <TouchableOpacity onPress={() => handleCloseRecipient()}>

                <X color={Colors.text_primary} size={fp(3)} />
              </TouchableOpacity>
              <Text style={{ fontFamily: Fonts.SemiBold, color: Colors.text_primary, fontSize: fp(2) }}>{editRecipientId ? 'Edit' : 'Add'} Recipient</Text>

            </View>

            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
              <Text style={{ fontFamily: Fonts.Bold, color: Colors.primary_dark, fontSize: fp(2) }}>
                {editRecipientId ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>


          <KeyboardAwareScrollView
            contentContainerStyle={{ paddingBottom: 50 }}

            enableOnAndroid={true}
            extraScrollHeight={150}
          >

            <View style={{ gap: hp(2), paddingTop: hp(1) }}>



              <Controller
                control={control}
                name="method"

                render={({ field: { onChange, value } }) => (
                  <View>

                    <Text style={styles.label}>
                      Method<Text style={styles.error}>*</Text>
                    </Text>

                    <View style={styles.typeWrapper}>
                      {typeOptions.map((item) => (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.type,
                            value === item.value && styles.activeType,
                          ]}
                          onPress={() => onChange(item.value)}
                        >
                          <Text
                            style={[
                              styles.typeText,
                              value === item.value && styles.activeTypeText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                  </View>

                )}
              />

              {
                action === "in_person_sign" && <Controller
                  control={control}
                  name="host_email"
                  rules={{ required: 'Host email is required' }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <AppInput

                      label="Host Email"
                      placeholder="Enter host email"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={Mail}
                    />
                  )}
                />
              }



              <Controller
                control={control}
                name="recepient_name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (

                  <AppInput
                    label="Name"
                    placeholder="Enter your name"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    leftIcon={User}
                    onRightIconPress={() => { recipientRef.current?.snapToIndex(0) }}
                    rightIcon={BookUser}
                  />
                )}
              />



              {
                (method === "email_and_sms" || method === "email") && <Controller
                  control={control}
                  name="recepient_email"
                  rules={{ required: 'Email is required' }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <AppInput

                      label="Email"
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={Mail}
                    />
                  )}
                />
              }







              {
                (method === "email_and_sms" || method === "sms") && <View >
                  <Text style={styles.label}>
                    Phone Number<Text style={styles.error}>*</Text>
                  </Text>
                  <View style={[styles.inputBox, {
                    borderColor: errors?.recepient_phone?.message
                      ? Colors.error
                      : isPhoneNumberFocus
                        ? Colors.primary_dark
                        : Colors.text_secondary,
                  }]}>


                    <Controller
                      control={control}
                      name="recepient_country_code"

                      render={({ field: { onChange, value } }) => (

                        <CountryPicker
                          countryCode={value || 'US'}
                          withFlag

                          withCallingCode={false} // 🔥 hides +1
                          withFilter
                          onSelect={(country) => onChange(country.cca2)}
                        />
                      )}
                    />





                    <Controller
                      control={control}
                      name="recepient_phone"
                      rules={{
                        required: "Phone number is required",
                        validate: (value) =>
                          value?.length === 10 || "Must be 10 digits",
                      }}
                      render={({ field: { onChange, value } }) => (

                        <TextInput
                          style={styles.input}
                          placeholder="Enter phone number"
                          keyboardType="number-pad"
                          placeholderTextColor={Colors.placeholder}
                          value={value}
                          onChangeText={(text) =>
                            onChange(text.replace(/[^0-9]/g, ""))
                          }
                          onFocus={() => setPhoneNumberFocus(true)}
                          onBlur={() => setPhoneNumberFocus(false)}
                        />
                      )}
                    />

                  </View>

                  {errors?.recepient_phone?.message && <Text style={styles.error}>{errors?.recepient_phone?.message}</Text>}
                </View>
              }

              <View >
                <Text style={[styles.label, { marginBottom: wp(3) }]}>
                  Action<Text style={styles.error}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="action"
                  rules={{ required: "Select Action" }}
                  render={({ field: { onChange, value } }) => (


                    <View style={{ gap: hp(2.5) }}>
                      {roleOptions.map((item) => (
                        <TouchableOpacity
                          key={item.value}
                          onPress={() => onChange(item.value)}
                          style={{ flexDirection: "row", alignItems: 'flex-start', gap: wp(2) }}
                        >
                          <View style={styles.outerCircle}>
                            {value === item.value && <View style={styles.innerCircle} />}
                          </View>
                          <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: fp(1.8), fontFamily: Fonts.Regular, color: Colors.text_primary }}>{item.label}</Text>

                            <Text style={{ fontSize: fp(1.6), fontFamily: Fonts.Regular, color: Colors.text_secondary, marginTop: wp(1.5) }}>
                              {item.subLabel}
                            </Text>
                          </View>

                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />

              </View>







              <View style={{ marginTop: hp(0.5) }}>
                <TouchableOpacity onPress={() => setShowSecurity(prev => !prev)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(2), height: hp(6) }}>

                  <Text style={{ flex: 1, fontFamily: Fonts.SemiBold, fontSize: fp(2), }}>Advance Security</Text>

                  <ChevronDown color={Colors.text_primary} size={fp(3)} strokeWidth={1.5} />
                </TouchableOpacity>



                {
                  showSecurity && <Animated.View
                    entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))}
                    // 🚀 Faster exit (100ms)
                    exiting={FadeOut.duration(100)} style={{ gap: hp(3) }}>


                    <Controller
                      control={control}
                      name="access_code"

                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <AppInput
                          secureTextEntry
                          required={false}
                          label="Access Code"
                          placeholder="Enter your access code"
                          value={value}
                          onChangeText={onChange}
                          error={error?.message}
                          leftIcon={KeyRound}
                        />
                      )}
                    />



                    <Controller
                      control={control}
                      name="sign_request_alert"

                      render={({ field: { onChange, value } }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>

                            <Text style={{
                              fontSize: 14,
                              color: Colors.text_primary,
                              fontFamily: Fonts.Medium,
                            }}>
                              Sign Request Alert
                            </Text>

                            <Info color={Colors.text_primary} size={fp(2.3)} />
                          </View>


                          <TouchableOpacity onPress={() => { onChange(!value) }}>
                            {
                              value ?

                                <Image source={require('@assets/icons/switch_on.png')} style={{ width: wp(11), height: wp(7) }} /> :
                                <Image source={require('@assets/icons/switch_off.png')} style={{ width: wp(11), height: wp(7) }} />
                            }

                          </TouchableOpacity>
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="completed_alert"

                      render={({ field: { onChange, value } }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>

                            <Text style={{
                              fontSize: 14,
                              color: Colors.text_primary,
                              fontFamily: Fonts.Medium,
                            }}>
                              Completed Alert
                            </Text>

                            <Info color={Colors.text_primary} size={fp(2.3)} />
                          </View>


                          <TouchableOpacity onPress={() => { onChange(!value) }}>
                            {
                              value ?

                                <Image source={require('@assets/icons/switch_on.png')} style={{ width: wp(11), height: wp(7) }} /> :
                                <Image source={require('@assets/icons/switch_off.png')} style={{ width: wp(11), height: wp(7) }} />
                            }

                          </TouchableOpacity>
                        </View>
                      )}
                    />

                  </Animated.View>
                }



              </View>


              {/* <AdvanceSecurity control={control}/> */}






            </View>

          </KeyboardAwareScrollView>

        </Animated.View>
      }

      <AppBottomSheet ref={recipientRef} title={'Address Book'} snapPoints={['100%']}  >



        <AddressBook onSelectRecipient={handleRecipientSelect} />



      </AppBottomSheet>


      <AppBottomSheet ref={editRef} withCloseBtn={false} snapPoints={["10%"]}>


        <View >
          <TouchableOpacity style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center', height: hp(5) }} onPress={() => handleDeleteRecipient()}>
            <Trash size={fp(2.5)} color={Colors.error} />
            <Text style={[styles.providerText, { fontSize: fp(2) }]}>Delete</Text>
          </TouchableOpacity>


        </View>

      </AppBottomSheet>

    </CustomSafeAreaView>
  )
}

export default AddRecipientScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    backgroundColor: '#F4F7FB',
  },
  header: {
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),

    backgroundColor: '#FFFFFF',

    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,

    // elevation (Android)
    // elevation: 4,
  },

  providerText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary
  },

  title: {
    fontSize: fp(2.2),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    letterSpacing: 0.5,
  },
  typeWrapper: {
    flexDirection: 'row',
    gap: wp(3)
  },
  type: {
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderColor: Colors.text_secondary,
    borderWidth: 1,
    borderRadius: 2

  },

  activeType: {
    borderColor: "#319af1",
    backgroundColor: "#319af110"
  },

  typeText: {
    color: Colors.text_primary,
    fontFamily: Fonts.Regular,
    fontSize: fp(1.7)
  },

  activeTypeText: {
    color: Colors.primary_dark,

  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  outerCircle: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    borderWidth: 1.5,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 3
  },
  innerCircle: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: "#007AFF",
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

  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text_primary,
    fontFamily: Fonts.Regular,

  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,


  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: hp(100),
    backgroundColor: Colors.white,
    width: wp(100),
    padding: wp(5),


  },
  recipientCard: {
    flexDirection: 'row', gap: wp(4), borderLeftWidth: 4, borderLeftColor: Colors.primary_dark, alignItems: 'center', paddingHorizontal: wp(3.5), elevation: 1, paddingVertical: hp(2), borderRadius: 0, marginBottom: hp(1)
  },
  recipientCircle: {
    width: wp(10), height: wp(10), borderRadius: wp(5), backgroundColor: Colors.primary_dark, justifyContent: 'center', alignItems: 'center'
  },
  recipientCircleText: {
    textTransform: 'uppercase', textAlign: 'center', color: Colors.white, fontFamily: Fonts.SemiBold
  },
  recipientCardName: {
    fontFamily: Fonts.SemiBold, fontSize: fp(2), color: Colors.text_primary, marginBottom: 3
  },
  recipientCardEmail: { fontFamily: Fonts.Regular, fontSize: fp(1.7), color: Colors.text_secondary, marginBottom: 3 },
  recipientCardAction: { fontFamily: Fonts.Regular, fontSize: fp(1.3), color: Colors.white, backgroundColor: Colors.success, maxWidth: 'auto', width: wp(24), borderRadius: wp(6), alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingVertical: 1, marginTop: 7 },


  iconWrapper: {
    width: wp(10),
    height: wp(10),
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',


  },
  toggleBtnWrapper: { backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: wp(2), height: hp(8), marginBottom: hp(2), paddingHorizontal: wp(4) }


});