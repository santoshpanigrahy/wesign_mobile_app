import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import { ArrowLeft, BookUser, ChevronDown, EllipsisVertical, Info, KeyRound, Mail, Phone, Plus, Trash, User, UserPlus, X } from 'lucide-react-native'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import AppBottomSheet from '@components/AppBottomSheet'
import { Controller, useForm } from 'react-hook-form'
import AppInput from '@components/AppInput'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CountryPicker, { getAllCountries } from "react-native-country-picker-modal";

import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated'

import AddressBook from '@components/AddressBook'
import DraggableFlatList from 'react-native-draggable-flatlist';
import AppDropdown from '@components/AppDropdown'
import AdvanceSecurity from '@components/AppAccordance'
const typeOptions = [{
  label: "Email",
  value: "email",
},{
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
  subLabel:"For anyone who isn't with you"
},
  {
    label: "Receives a Copy",
    value: "receive_copy",
  subLabel:"For anyone who is with you"
  },

  {
    label: "In Person Sign",
    value: "in_person_sign",  
  subLabel:"For anyone who needs a signed copy"
  }

];


const colorArray = [
    { recepient_color: "#e7baf5", recepient_border_color: "#c99cd7" },
    { recepient_color: "#98edff", recepient_border_color: "#7acfe1" },
    { recepient_color: "#c1f8ac", recepient_border_color: "#a3da8e" },
    { recepient_color: "#b58fd2", recepient_border_color: "#9771b4" },
    { recepient_color: "#9ed8e5", recepient_border_color: "#80bac7" },
    { recepient_color: "#f9ca95", recepient_border_color: "#dbac77" },
    { recepient_color: "#ead8bf", recepient_border_color: "#ccbaa1" },
    { recepient_color: "#eacaae", recepient_border_color: "#ccac90" },
    { recepient_color: "#dcc0c3", recepient_border_color: "#bea2a5" },
    { recepient_color: "#e597bb", recepient_border_color: "#c7799d" },
    { recepient_color: "#fdb3b9", recepient_border_color: "#df959b" },
    { recepient_color: "#b0f6d3", recepient_border_color: "#92d8b5" },
    { recepient_color: "#f5a5d2", recepient_border_color: "#d787b4" },
    { recepient_color: "#91feb1", recepient_border_color: "#73e093" },
    { recepient_color: "#f9cda4", recepient_border_color: "#dbaf86" },
    { recepient_color: "#d8e6dc", recepient_border_color: "#bac8be" },
    { recepient_color: "#b7ac84", recepient_border_color: "#998e66" },
    { recepient_color: "#87f9ef", recepient_border_color: "#69dbd1" },
    { recepient_color: "#9c90e1", recepient_border_color: "#7e72c3" },
    { recepient_color: "#ddc0bf", recepient_border_color: "#bfa2a1" },
    { recepient_color: "#aab5c6", recepient_border_color: "#8c97a8" },
    { recepient_color: "#a5b1d7", recepient_border_color: "#8793b9" },
    { recepient_color: "#faf5d0", recepient_border_color: "#dcd7b2" },
    { recepient_color: "#a1a8c5", recepient_border_color: "#838aa7" },
    { recepient_color: "#8a9ba5", recepient_border_color: "#6c7d87" },
    { recepient_color: "#abf5b7", recepient_border_color: "#8dd799" },
    { recepient_color: "#b3f6ff", recepient_border_color: "#95d8e1" },
    { recepient_color: "#a2d3c8", recepient_border_color: "#84b5aa" },
    { recepient_color: "#a2acb5", recepient_border_color: "#848e97" },
    { recepient_color: "#b3e3e7", recepient_border_color: "#95c5c9" },
    { recepient_color: "#cc8dcc", recepient_border_color: "#ae6fae" },
    { recepient_color: "#e4edc0", recepient_border_color: "#c6cfa2" },
    { recepient_color: "#a4f0d2", recepient_border_color: "#86d2b4" },
    { recepient_color: "#a59b86", recepient_border_color: "#877d68" },
    { recepient_color: "#9fad9e", recepient_border_color: "#818f80" },
    { recepient_color: "#abefa6", recepient_border_color: "#8dd188" },
    { recepient_color: "#81dda3", recepient_border_color: "#63bf85" },
    { recepient_color: "#d9d9c5", recepient_border_color: "#bbbba7" },
    { recepient_color: "#d3e0b6", recepient_border_color: "#b5c298" },
    { recepient_color: "#a2c2ed", recepient_border_color: "#84a4cf" },
    { recepient_color: "#f4d7e6", recepient_border_color: "#d6b9c8" },
    { recepient_color: "#dde995", recepient_border_color: "#bfcb77" },
    { recepient_color: "#cadb90", recepient_border_color: "#acbd72" },
    { recepient_color: "#c7ac8e", recepient_border_color: "#a98e70" },
    { recepient_color: "#f68ce4", recepient_border_color: "#d86ec6" },
    { recepient_color: "#d3d7c7", recepient_border_color: "#b5b9a9" },
    { recepient_color: "#b692a3", recepient_border_color: "#987485" },
    { recepient_color: "#b8c8a0", recepient_border_color: "#9aaa82" },
    { recepient_color: "#93d79c", recepient_border_color: "#75b97e" },
    { recepient_color: "#d29da6", recepient_border_color: "#b47f88" },
    { recepient_color: "#a0b0d9", recepient_border_color: "#8292bb" },
    { recepient_color: "#f4b9ba", recepient_border_color: "#d69b9c" },
    { recepient_color: "#e8fd81", recepient_border_color: "#cadf63" },
    { recepient_color: "#dc8feb", recepient_border_color: "#be71cd" },
    { recepient_color: "#f9b2c6", recepient_border_color: "#db94a8" },
    { recepient_color: "#cfdff3", recepient_border_color: "#b1c1d5" },
    { recepient_color: "#88fea7", recepient_border_color: "#6ae089" },
    { recepient_color: "#b4a095", recepient_border_color: "#968277" },
    { recepient_color: "#b2a5d2", recepient_border_color: "#9487b4" },
    { recepient_color: "#e483b5", recepient_border_color: "#c66597" },
    { recepient_color: "#f5a888", recepient_border_color: "#d78a6a" },
    { recepient_color: "#e4c68f", recepient_border_color: "#c6a871" },
    { recepient_color: "#c1dac8", recepient_border_color: "#a3bcaa" },
    { recepient_color: "#81bb9e", recepient_border_color: "#639d80" },
    { recepient_color: "#9c91ac", recepient_border_color: "#7e738e" },
    { recepient_color: "#9098ef", recepient_border_color: "#727ad1" },
    { recepient_color: "#bcfae1", recepient_border_color: "#9edcc3" },
    { recepient_color: "#90dda1", recepient_border_color: "#72bf83" },
    { recepient_color: "#ca90e0", recepient_border_color: "#ac72c2" },
    { recepient_color: "#b9a7c1", recepient_border_color: "#9b89a3" },
    { recepient_color: "#94e087", recepient_border_color: "#76c269" },
    { recepient_color: "#8583fd", recepient_border_color: "#6765df" },
    { recepient_color: "#9de79a", recepient_border_color: "#7fc97c" },
    { recepient_color: "#97b2d1", recepient_border_color: "#7994b3" },
    { recepient_color: "#c5d9a4", recepient_border_color: "#a7bb86" },
    { recepient_color: "#c3f793", recepient_border_color: "#a5d975" },
    { recepient_color: "#cceaa1", recepient_border_color: "#aecc83" },
    { recepient_color: "#e7ddce", recepient_border_color: "#c9bfb0" },
    { recepient_color: "#cd9bf3", recepient_border_color: "#af7dd5" },
    { recepient_color: "#c4e794", recepient_border_color: "#a6c976" },
    { recepient_color: "#e2aab1", recepient_border_color: "#c48c93" },
    { recepient_color: "#df868b", recepient_border_color: "#c1686d" },
    { recepient_color: "#a09c90", recepient_border_color: "#827e72" },
    { recepient_color: "#ddf0e1", recepient_border_color: "#bfd2c3" },
    { recepient_color: "#ffb6f6", recepient_border_color: "#e198d8" },
    { recepient_color: "#80a3b1", recepient_border_color: "#628593" },
    { recepient_color: "#cbd9f8", recepient_border_color: "#adbbda" },
    { recepient_color: "#a3ebe5", recepient_border_color: "#85cdc7" },
    { recepient_color: "#80acd3", recepient_border_color: "#628eb5" },
    { recepient_color: "#b990ef", recepient_border_color: "#9b72d1" },
    { recepient_color: "#8ce0b7", recepient_border_color: "#6ec299" },
    { recepient_color: "#d285e5", recepient_border_color: "#b467c7" },
    { recepient_color: "#e18180", recepient_border_color: "#c36362" },
    { recepient_color: "#829cc9", recepient_border_color: "#647eab" },
    { recepient_color: "#ade5eb", recepient_border_color: "#8fc7cd" },
    { recepient_color: "#bbbfb7", recepient_border_color: "#9da199" },
    { recepient_color: "#c18bd7", recepient_border_color: "#a36db9" },
    { recepient_color: "#f0cf92", recepient_border_color: "#d2b174" },
    { recepient_color: "#90d8d2", recepient_border_color: "#72bab4" },
    { recepient_color: "#8eaeed", recepient_border_color: "#7090cf" },
  ];

const AddRecipientScreen = () => {
  const recipientRef = useRef(null);
  const editRef = useRef(null);
  const [showSecurity,setShowSecurity]=useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [isPhoneNumberFocus, setPhoneNumberFocus] = useState(false);
  const { control, handleSubmit,watch,formState:{errors},reset,setValue } = useForm({
    defaultValues: {
      method: 'email',
      action: 'needs_to_sign',
      name: '',
      email: '',
      host_email: '',
      recepient_phone: '',
      recepient_phone_code: '+1',
      recepient_country_code: 'US',
      meta_data: [],
      completed_alert: true,
      sign_request_alert: true,
      access_code:''
      
      
    }
  });



  const [recipients, setRecipients] = useState([]);

  const method = watch("method");
  const action = watch("action");
  
const onSubmit = (data: any) => {
  // 1. Check if we are editing (does the data already have an ID?)
  if (editRecipientId) {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === editRecipientId 
          ? { ...recipient, ...data } // Merge new data into the existing recipient
          : recipient
      )
    );

    setEditRecipientId(null)
  } else {
    // 2. ADDING NEW RECIPIENT LOGIC
    
    // Find used colors to ensure uniqueness
    const usedColors = recipients.map((r) => r.recepient_color);
    const availableColors = colorArray.filter(
      (c) => !usedColors.includes(c.recepient_color)
    );

    // Pick a color (fallback to random if the 100 colors are exhausted)
    const selectedColor = availableColors.length > 0 
      ? availableColors[0] 
      : colorArray[Math.floor(Math.random() * colorArray.length)];

    const newRecipient = {
      ...data,
      id: Date.now().toString(), // Generate new ID
      ...selectedColor,          // Assign unique color
    };

    console.log(newRecipient);

    setRecipients((prev) => [...prev, newRecipient]);
  }

  // 3. Clean up
  handleCloseRecipient();
};

  const handleOpenRecipient = () => {
    // recipientRef.current?.snapToIndex(1);
    setShowRecipientModal(true)
  
  }

  const getCountryCodeFromCallingCode = async (callingCode) => {
 
  if (!callingCode) return 'US';

  try {
   
    const cleanCode = callingCode.replace('+', '');

    
    const countries = await getAllCountries();

   
    const foundCountry = countries.find(country => 
      country.callingCode && country.callingCode.includes(cleanCode)
    );

    
    return foundCountry ? foundCountry.cca2 : 'US';
    
  } catch (error) {
    console.error("Error fetching country list:", error);
    return 'US'; 
  }
};
  const handleRecipientSelect = async(recipient:any) => {
  console.log("Selected:", recipient);
  
      setValue('name', recipient?.recepient_name || '');
    
    if (method === 'sms' || method === 'email_and_sms') {
      const phoneCode = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[0] : "+1";
      const phone = recipient?.recepient_phone?.includes('-') ? recipient?.recepient_phone?.split('-')[1] : "";
      const countryCode = await getCountryCodeFromCallingCode(phoneCode);
      setValue('recepient_phone', phone || '');
      setValue('recepient_phone_code', phoneCode || '');
      setValue('recepient_country_code',countryCode)
    } else if (method === 'email' ||  method === 'email_and_sms') {
      setValue('email', recipient?.recepient_email || '');
      
  }
  recipientRef.current?.close();
  };
  

  const [selectedRecipientId,setSelectedRecipientId]=useState(null)
  const openRecipientSheet = (id) => {

    setSelectedRecipientId(id);
  editRef.current?.snapToIndex(0);


    
  }

const handleDeleteRecipient = () => {
  // 1. Create a new array excluding the recipient with the matching ID
  const updatedRecipients = recipients.filter(recipient => recipient.id !== selectedRecipientId);

  // 2. Update the state
  setRecipients(updatedRecipients);

  // 3. Close the modal/bottom sheet
  editRef.current?.close();
};

  const handleCloseRecipient = () => {
    setShowRecipientModal(false)
    reset({ method: 'email',
      action: 'needs_to_sign',
      name: '',
      email: '',
      host_email: '',
      recepient_phone: '',
      recepient_phone_code: '+1',
      recepient_country_code: 'US',
      meta_data: [],
      completed_alert: true,
      sign_request_alert: true,
      access_code:''});
  }

  const [editRecipientId, setEditRecipientId] = useState(null);
  const handleEditRecipient = (recipient) => {
    
    setEditRecipientId(recipient.id);
     
      console.log("Selected:", recipient);
  
      setValue('action', recipient?.action);
      setValue('name', recipient?.name);
      setValue('email', recipient?.email);
      setValue('method', recipient?.method);
      setValue('host_email', recipient?.host_email);
      setValue('recepient_phone', recipient?.recepient_phone);
      setValue('recepient_phone_code',recipient?.recepient_phone_code);
      setValue('recepient_country_code', recipient?.recepient_country_code)
      setValue('meta_data', recipient?.meta_data);
      setValue('completed_alert', recipient?.completed_alert);
      setValue('sign_request_alert', recipient?.sign_request_alert);
      setValue('access_code', recipient?.access_code);

  
    setShowRecipientModal(true);
  
  }

  const [enableEnvelopeId,setEnableEnvelopeId] =useState(false)
  
 

  const renderItem = ({ item, drag, isActive }) => {
   
    return <TouchableOpacity activeOpacity={0.9} onLongPress={drag} onPress={() =>  handleEditRecipient(item) } style={[styles.recipientCard,{ backgroundColor: isActive ? "#ddd" : "#fff",borderLeftColor:item.recepient_border_color }]}>

              <View style={[styles.recipientCircle,{backgroundColor:item.recepient_border_color}]}>

                <Text style={styles.recipientCircleText}>
                {item?.name?.slice(0,2)}
              </Text>
                </View>
              
              
                  <View style={{flex:1}}>
         <Text style={styles.recipientCardName} numberOfLines={1}>{item?.name}</Text>
         
         {
           item?.email && <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
             <Mail color={Colors.text_secondary} size={fp(1.8)} style={{ marginTop: 1 }} />
             <Text style={styles.recipientCardEmail} numberOfLines={1}>{item?.email}</Text></View>
           
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
       
       <TouchableOpacity style={styles.iconWrapper} onPress={()=>openRecipientSheet(item?.id)}>
               <EllipsisVertical size={fp(2.8)} color={Colors.text_secondary} strokeWidth={1.6} />
             </TouchableOpacity>
              

             </TouchableOpacity>
   
  };

  
  return (
      <CustomSafeAreaView>


        
        <View style={styles.header}>
      
      {/* Left Menu */}
      <TouchableOpacity>
        <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Add Recipients</Text>

      {/* Right Notification */}
      <TouchableOpacity>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

    </View>
            
     
      <View style={styles.container}>

          <View style={{backgroundColor:Colors.white,flexDirection:'row',alignItems:'center',paddingHorizontal:wp(4),justifyContent:'space-between',borderRadius:wp(2),height:hp(8),marginTop:hp(1),marginBottom:hp(2)}}>
                    <Text style={{fontFamily:Fonts.SemiBold,fontSize:fp(2)}}>
                      Set Singing Order
                    </Text>
        
                    <TouchableOpacity onPress={() => { setEnableEnvelopeId(prev => !prev) }}>
                      {
                        enableEnvelopeId ?
                      
                          <Image source={require('@assets/icons/switch_on.png')} style={{ width: wp(11), height: wp(7) }} /> :
                          <Image source={require('@assets/icons/switch_off.png')} style={{ width: wp(11), height: wp(7) }} />
                      }
                      
                    </TouchableOpacity>
                  </View>
        
         <DraggableFlatList
        data={recipients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => setRecipients(data)} // 👈 update order
      />

       

        <TouchableOpacity onPress={handleOpenRecipient} style={{ backgroundColor: Colors.white, height: hp(8), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2), borderStyle:'dashed',borderColor:Colors.border,borderWidth:1.5,marginTop:hp(1)}}>
          <UserPlus color={Colors.text_primary} size={fp(2.5)}/>
          <Text style={{fontSize:fp(2),fontFamily:Fonts.SemiBold,color:Colors.text_primary}}>Add Recepient</Text>
        </TouchableOpacity>
              
      </View>
      


         
      
     
      
      
      

       {
        showRecipientModal && <Animated.View 
          entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))} 
           // 🚀 Faster exit (100ms)
           exiting={FadeOut.duration(100)}
           style={styles.overlay}
        > 
          
           <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:hp(2)}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                  <TouchableOpacity onPress={()=>handleCloseRecipient()}>

 <X color={Colors.text_primary} size={fp(3)}/>
                  </TouchableOpacity>
                <Text style={{fontFamily:Fonts.SemiBold,color:Colors.text_primary,fontSize:fp(2)}}>{editRecipientId ? 'Edit' : 'Add'} Recipient</Text>

                </View>
               
                <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                  <Text style={{fontFamily:Fonts.Bold,color:Colors.primary_dark,fontSize:fp(2)}}>
                   {editRecipientId ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

        
           <KeyboardAwareScrollView
contentContainerStyle={{ paddingBottom: 50 }}

  enableOnAndroid={true}
  extraScrollHeight={150}
        >
          
            <View style={{  gap: hp(2) ,paddingTop:hp(1)}}>
             
         

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
            action === "in_person_sign" &&  <Controller
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
          name="name"
          rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
            
            <AppInput
              label="Name"
              placeholder="Enter your name"
              value={value}
              onChangeText={onChange}
              error={error?.message}
                leftIcon={User}
              onRightIconPress={()=>{recipientRef.current?.snapToIndex(0)}}
              rightIcon={BookUser}
            />
          )}
          />

           
          
          {
            (method === "email_and_sms" || method === "email") &&   <Controller
          control={control}
          name="email"
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
            (method === "email_and_sms" || method === "sms") &&  <View >
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
      onBlur={()=>setPhoneNumberFocus(false)}
      />
  )}
              />
              
               </View>
        
                  {errors?.recepient_phone?.message && <Text style={styles.error}>{errors?.recepient_phone?.message}</Text>}
        </View>
              }
              
               <View >
           <Text style={[styles.label,{marginBottom:wp(3)}]}>
                  Action<Text style={styles.error}>*</Text>
                </Text>
          <Controller
  control={control}
  name="action"
  rules={{ required: "Select Action" }}
                  render={({ field: { onChange, value } }) => (
    
                    
    <View style={{gap:hp(2.5)}}>
      {roleOptions.map((item) => (
        <TouchableOpacity
          key={item.value}
          onPress={() => onChange(item.value)}
          style={{ flexDirection: "row" ,alignItems:'flex-start',gap:wp(2)}}
        >
          <View style={styles.outerCircle}>
            {value === item.value && <View style={styles.innerCircle} />}
          </View>
          <View style={{ marginLeft: 10 }}>
 <Text style={{fontSize:fp(1.8),fontFamily:Fonts.Regular,color:Colors.text_primary}}>{item.label}</Text>

          <Text style={{fontSize:fp(1.6),fontFamily:Fonts.Regular,color:Colors.text_secondary,marginTop:wp(1.5)}}>
            {item.subLabel}
          </Text>
          </View>
         
        </TouchableOpacity>
      ))}
    </View>
  )}
            />
            
              </View>

              {/* <AppDropdown/> */}
              

              


              <View style={{ marginTop: hp(0.5) }}>
                <TouchableOpacity onPress={()=>setShowSecurity(prev=>!prev)} style={{flexDirection:'row',alignItems:'center',marginBottom: hp(2),height:hp(6)}}>

                  <Text style={{ flex:1,fontFamily: Fonts.SemiBold, fontSize: fp(2),  }}>Advance Security</Text>
                  
                  <ChevronDown color={Colors.text_primary} size={fp(3)} strokeWidth={1.5}/>
                </TouchableOpacity>

               
                
                {
                  showSecurity &&   <Animated.View 
          entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))} 
           // 🚀 Faster exit (100ms)
           exiting={FadeOut.duration(100)} style={{gap:hp(3)}}>

                
                 <Controller
          control={control}
          name="access_code"
         
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AppInput
              // secureTextEntry
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
         
          render={({ field: { onChange, value }}) => (
           <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
              <View style={{flexDirection:'row',gap:5,alignItems:'center'}}>

                  <Text style={{
                fontSize: 14,
      color: Colors.text_primary,
    fontFamily:Fonts.Medium,}}>
                              Sign Request Alert
              </Text>
              
              <Info color={Colors.text_primary} size={fp(2.3)}/>
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
         
          render={({ field: { onChange, value }}) => (
           <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
              <View style={{flexDirection:'row',gap:5,alignItems:'center'}}>

                  <Text style={{
                fontSize: 14,
      color: Colors.text_primary,
    fontFamily:Fonts.Medium,}}>
                              Completed Alert
              </Text>
              
              <Info color={Colors.text_primary} size={fp(2.3)}/>
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
            <TouchableOpacity style={{ flexDirection: 'row',gap: wp(2),alignItems:'center',height:hp(5)}} onPress={()=>handleDeleteRecipient()}>
              <Trash size={fp(2.5)} color={Colors.error}/>
              <Text style={[styles.providerText,{fontSize:fp(2)}]}>Delete</Text>
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
    color:Colors.text_primary
  },

  title: {
    fontSize: fp(2.2),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    letterSpacing: 0.5,
  },
  typeWrapper: {
    flexDirection: 'row',
    gap:wp(3)
  },
  type: {
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderColor: Colors.text_secondary,
    borderWidth: 1,
    borderRadius:2

  },

  activeType: {
    borderColor: "#319af1",
    backgroundColor:"#319af110"
  },

  typeText: {
    color: Colors.text_primary,
    fontFamily: Fonts.Regular,
    fontSize:fp(1.7)
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
    marginTop:3
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
    fontFamily:Fonts.Medium,
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

  inputBox:{
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
    flexDirection:'row',gap:wp(4),borderLeftWidth:4,borderLeftColor:Colors.primary_dark,alignItems:'center',paddingHorizontal:wp(3.5),elevation:1, paddingVertical:hp(2),borderRadius:0,marginBottom:hp(1) 
  },
  recipientCircle: {
    width:wp(10),height:wp(10),borderRadius:wp(5),backgroundColor:Colors.primary_dark,justifyContent:'center',alignItems:'center'
  },
  recipientCircleText: {
    textTransform:'uppercase',textAlign:'center',color:Colors.white,fontFamily:Fonts.SemiBold
  },
  recipientCardName: {
    fontFamily:Fonts.SemiBold,fontSize:fp(2),color:Colors.text_primary,marginBottom:3
  },
  recipientCardEmail: {fontFamily:Fonts.Regular,fontSize:fp(1.7),color:Colors.text_secondary,marginBottom:3},
  recipientCardAction: { fontFamily: Fonts.Regular, fontSize: fp(1.3), color: Colors.white, backgroundColor: Colors.success, maxWidth:'auto',width:wp(24),borderRadius:wp(6),alignItems:'center',justifyContent:'center',textAlign:'center',paddingVertical:1,marginTop:7},
  
  
  iconWrapper: {
    width: wp(10),
    height: wp(10),
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  

}

  
});