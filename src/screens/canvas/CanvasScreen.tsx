import { Alert, Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import { ArrowLeft, Check, ChevronDown, EllipsisVertical, UserPen, X } from 'lucide-react-native';

import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { getDocumentListing, getDocumentUrl } from '@utils/documentService';
import RNFS from 'react-native-fs';
import CanvasBottomFieldsBar from './components/CanvasBottomFieldsBar';
import { ALL_COLORS, BASIC_COLORS, FIELD_DEFAULTS, FIELD_META_COMPONENTS, getFieldDefaults, getFieldLabel, PREFILLED_FIELDS, TEXT_STYLE_ELIGIBLE } from '@utils/fieldConstants';
import PdfRenderer from 'react-native-pdf-renderer';
import CanvasFieldBox from '@components/CanvasFieldBox';
import CanvasPage from './components/CanvasPage';
import Animated, { Easing, FadeIn, FadeOut, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const screenWidth = Dimensions.get('window').width;
// import Slider from '@react-native-community/slider';
import { Slider } from 'react-native-awesome-slider';
import CanvasPrefilledFields from './components/CanvasPrefilledFields';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CanvasRecipients from './components/CanvasRecipients';
import SignatureMeta from './components/fieldMeta/SignatureMeta';
import FieldAssign from './components/FieldAssign';
import AppBottomSheet from '@components/AppBottomSheet';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import AppButton from '@components/AppButton';
import TextStyleMeta from './components/fieldMeta/TextStyleMeta';
import api from '@utils/api';
import moment from 'moment';
const CanvasScreen = ({ navigation }) => {

    const user = useAppSelector(state => state.auth.user);
  
  const dispatch = useAppDispatch();
  // console.log(user);
  const { id } = user;
  

  console.log(user);

  const fetchSignature = async () => {
  try {
    const res = await api.get(`/api/signature?user=${id}`
    );

    return res.data;
  } catch (err) {
    console.log("API error", err);
    throw err;
  }
  };

  const fetchInitial = async () => {
  try {
    const res = await api.get(`/api/initial?user=${id}`
    );

    return res.data;
  } catch (err) {
    console.log("API error", err);
    throw err;
  }
  };

    const fetchStamp = async () => {
  try {
    const res = await api.get(`/api/stamp?user=${id}`
    );

    return res.data;
  } catch (err) {
    console.log("API error", err);
    throw err;
  }
  };

  const PREFILL_API_MAP = {
  my_signature: fetchSignature,
  my_initial: fetchInitial,
  my_stamp: fetchStamp,
};
  
  const [showToolbar, setShowToolbar] = useState(false);
  const [showFieldMetaModal, setShowFieldMetaModal] = useState(false);
  const widthProgress = useSharedValue(0);
  const heightProgress = useSharedValue(0);

  const [prefillData, setPrefillData] = useState( {
  my_signature: null,
  my_initial: null,
  my_stamp: null,
    my_date_signed: moment().format('MM/DD/YYYY'),
    
});
 
  
  const min = useSharedValue(60);
  const max = useSharedValue(500);

 
  const recipientRef = useRef(null);
  const colorRef = useRef(null);
  const dateRef = useRef(null);

  const [tempField, setTempField] = useState(null);
  // console.log("Temp Field ======> ", tempField);
 
  const MetaComponent = FIELD_META_COMPONENTS[tempField?.field_name];
  // console.log("Meta +++", MetaComponent)
  
  const isTextStyleEligible = (fieldName) => {
    return TEXT_STYLE_ELIGIBLE.includes(fieldName);
  }

const updateFieldValue = (key, value) => {
  setTempField((prev) => ({
    ...prev,
    [key]: value
  }));
};

  const renderItem = ({ item }) => <Pressable onPress={() => {
    
    
  
    setTempField(prev => ({
      ...prev,
      recipient_id: item.recepient_email,
      recipient_color: item.meta_info?.recepient_color
    }));

  recipientRef.current?.close();


          


    }} style={{flexDirection:'row',alignItems:'center',gap:wp(3),height:hp(6)}}>
    
        <View style={{width:wp(10),height:wp(10),borderRadius:wp(5),borderWidth:1,borderColor:item?.meta_info?.recepient_border_color,justifyContent:'center',alignItems:'center',backgroundColor:(item?.meta_info?.recepient_border_color + '40')}}>
        <Text style={{ fontFamily: Fonts.Medium, color: item?.meta_info?.recepient_border_color,textTransform:'uppercase', fontSize: fp(1.6) }}>{item?.recepient_name?.slice(0, 2)}</Text>

           
      </View>
      
       <Text style={{fontFamily:Fonts.Regular,color:Colors.text_primary,fontSize:fp(2)}}>{item?.recepient_name}</Text>
    
    </Pressable>;


  const [widthValue, setWidthValue] = useState(0);
  const [heightValue, setHeightValue] = useState(0);

  const snap = (val) => Math.round(val / 10) * 10;
  console.log(selectedField)
 useEffect(() => {
   if (selectedField) {
    
     console.log(selectedField)
    widthProgress.value = Number(selectedField.width);
    heightProgress.value = Number(selectedField.height);

    setWidthValue(Number(selectedField.width));
    setHeightValue(Number(selectedField.height));
  }
}, [selectedField?.id]);
  

    
    
    const [documentKeys, setDocumentKeys] = useState(['817/1404964202612309_all_fun.pdf','817/325642026131231_Contrato_original_de_intermediacion_exclusiva.pdf','817/8869874202612449_DH-YAQ230012UPDATE_1.pdf']);
    const [documents, setDocuments] = useState([]);
    const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [enableResize, setEnableResize] = useState(false);
  const [enablePrefilled, setEnablePrefilled] = useState(false);
    const [recipients,setRecipients]=useState([
    {
      "recepient_name": "adityabhogle2019",
      "recepient_email": "adityabhogle2019@gmail.com",
      "recepient_phone": null,
      "recepient_phone_code": "+1",
      "action": "needs_to_sign",
      "method": "email",
      "meta_info": {
        "recepient_color": "#2F6B3F",
        "recepient_border_color": "#2F6B3F"
      },
      "type": "email",
      "completed_alert": true,
      "sign_request_alert": true,
      "host_email": "",
      "recepient_phone_flag": "US",
      "is_prefilled_field": false,
      "meta_data": [
        {
          "imageId": "page_1",
          "page_no": 1,
          "boxId": null,
          "top": 29.14731200292881,
          "left": 394.82988298829883,
          "x": 394.82988298829883,
          "y": 29.14731200292881,
          "width": 55.004384258005885,
          "height": 55.004384258005885,
          "document_key": "1",
          "document_order": 1,
          "element_id": "signature-ORLoYyWUTh",
          "field_name": "signature",
          "font_size": 9,
          "font_color": "rgb(0,0,0)",
          "font_family": "couriernew",
          "font_weight": "normal",
          "font_style": "normal",
          "text_decoration": "normal",
          "include_date_name": null,
          "date_format": null,
          "is_link_inserted": null,
          "external_link_url": null,
          "required_field_checkbox": null,
          "signature_with_border": "false",
          "initial_with_border": null,
          "type": "image",
          "field_class_name": "signature0"
        },
        {
          "imageId": "page_1",
          "page_no": 1,
          "boxId": null,
          "top": 32.36603387511603,
          "left": 490.85508550855087,
          "x": 490.85508550855087,
          "y": 32.36603387511603,
          "width": 55.004384258005885,
          "height": 55.004384258005885,
          "document_key": "1",
          "document_order": 1,
          "element_id": "signature-ORLoYyWUTh",
          "field_name": "initial",
          "font_size": 9,
          "font_color": "rgb(0,0,0)",
          "font_family": "couriernew",
          "font_weight": "normal",
          "font_style": "normal",
          "text_decoration": "normal",
          "include_date_name": null,
          "date_format": null,
          "is_link_inserted": null,
          "external_link_url": null,
          "required_field_checkbox": null,
          "signature_with_border": null,
          "initial_with_border": "false",
          "type": "image",
          "field_class_name": "initial1"
        }
      ]
    },
    {
      "recepient_name": "preetam",
      "recepient_email": "preetamkumarsahu576@gmail.com",
      "recepient_phone": null,
      "recepient_phone_code": "+1",
      "action": "needs_to_sign",
      "method": "email",
      "type": "email",
      "completed_alert": true,
      "sign_request_alert": true,
      "host_email": "",
      "recepient_phone_flag": "US",
      "meta_info": {
        "recepient_color": "#281C59",
        "recepient_border_color": "#281C59"
      },
      "is_prefilled_field": false,
      "meta_data": [
        {
          "imageId": "page_1",
          "page_no": 1,
          "boxId": null,
          "top": 18.954692741002617,
          "left": 262.86228622862285,
          "x": 262.86228622862285,
          "y": 18.954692741002617,
          "width": 55.004384258005885,
          "height": 55.004384258005885,
          "document_key": "1",
          "document_order": 1,
          "element_id": "signature-ORLoYyWUTh",
          "field_name": "signature",
          "font_size": 9,
          "font_color": "rgb(0,0,0)",
          "font_family": "couriernew",
          "font_weight": "normal",
          "font_style": "normal",
          "text_decoration": "normal",
          "include_date_name": null,
          "date_format": null,
          "is_link_inserted": null,
          "external_link_url": null,
          "required_field_checkbox": null,
          "signature_with_border": "true",
          "initial_with_border": null,
          "type": "image",
          "field_class_name": "signature2"
        }
      ]
        }])
    
    const [selectedRecipient, setSelectedRecipient] = useState( {
      "recepient_name": "adityabhogle2019",
      "recepient_email": "adityabhogle2019@gmail.com",
      "recepient_phone": null,
      "recepient_phone_code": "+1",
      "action": "needs_to_sign",
      "method": "email",
      "meta_info": {
        "recepient_color": "#2F6B3F",
        "recepient_border_color": "#2F6B3F"
      },
      "type": "email",
      "completed_alert": true,
      "sign_request_alert": true,
      "host_email": "",
      "recepient_phone_flag": "US",
      "is_prefilled_field": false,
      "meta_data": [
        {
          "imageId": "page_1",
          "page_no": 1,
          "boxId": null,
          "top": 29.14731200292881,
          "left": 394.82988298829883,
          "x": 394.82988298829883,
          "y": 29.14731200292881,
          "width": 55.004384258005885,
          "height": 55.004384258005885,
          "document_key": "1",
          "document_order": 1,
          "element_id": "signature-ORLoYyWUTh",
          "field_name": "signature",
          "font_size": 9,
          "font_color": "rgb(0,0,0)",
          "font_family": "couriernew",
          "font_weight": "normal",
          "font_style": "normal",
          "text_decoration": "normal",
          "include_date_name": null,
          "date_format": null,
          "is_link_inserted": null,
          "external_link_url": null,
          "required_field_checkbox": null,
          "signature_with_border": "false",
          "initial_with_border": null,
          "type": "image",
          "field_class_name": "signature0"
        },
        {
          "imageId": "page_1",
          "page_no": 1,
          "boxId": null,
          "top": 32.36603387511603,
          "left": 490.85508550855087,
          "x": 490.85508550855087,
          "y": 32.36603387511603,
          "width": 55.004384258005885,
          "height": 55.004384258005885,
          "document_key": "1",
          "document_order": 1,
          "element_id": "signature-ORLoYyWUTh",
          "field_name": "initial",
          "font_size": 9,
          "font_color": "rgb(0,0,0)",
          "font_family": "couriernew",
          "font_weight": "normal",
          "font_style": "normal",
          "text_decoration": "normal",
          "include_date_name": null,
          "date_format": null,
          "is_link_inserted": null,
          "external_link_url": null,
          "required_field_checkbox": null,
          "signature_with_border": null,
          "initial_with_border": "false",
          "type": "image",
          "field_class_name": "initial1"
        }
      ]
    });
    
  console.log(tempField?.field_name)

    const [fields, setFields] = useState([]);

   const  makeid = (prefix) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return prefix + "-" + result;
  }
    

    const createField = (type, x, y, page, document_key, recipient,prefillData = null,isPrefilled=false) => {
  const defaults = getFieldDefaults(type);

  let field =  {
    id: Date.now().toString(),
    type, // signature, text, etc.
    x,
    y,
    top: y,
    left:x,
    width: defaults.width,
    height: defaults.height,
    page,
    document_key,
    recipient_id: recipient?.recepient_email,
    recipient_color: recipient?.meta_info?.recepient_color,
    value: '', // for text fields
    required: true,
   font_size: 9,
          font_color: "rgb(0,0,0)",
          font_family: "couriernew",
          font_weight: "normal",
          font_style: "normal",
    text_decoration: "normal",
    signature_with_border: false,
    include_date_name: false,
          initial_with_border:false,
    element_id: makeid(type),
    field_name: type,

      };
      
      if (isPrefilled && prefillData) {
       
        field.is_prefilled_field = true;
        if (['my_signature', 'my_initial', 'my_stamp'].includes(type)) {
           field.field_data = prefillData?.id;
          field.image_base_64 = prefillData?.base_url;
          field.recipient_color = '#00000000';
          
        } else {
          field.field_data = prefillData;
          field.recipient_color = Colors.prefilled;
          
          
        }

      }

      return field
    };
    

   
const handleTap = async(e, page) => {
  if (!selectedFieldType) return;


  const { locationX, locationY } = e.nativeEvent;

  const baseScale = screenWidth / page.width;

  // ✅ NO transform math here anymore
  const originalX = locationX / baseScale;
  const originalY = locationY / baseScale;

  const isPrefillType = PREFILLED_FIELDS.includes(selectedFieldType);
  let prefillValue:any = null;
  if (isPrefillType) {
    // ✅ check cache first
    if (!prefillData[selectedFieldType]) {
      dispatch(showLoader('Fetching'))
      try {
        const apiFn = PREFILL_API_MAP[selectedFieldType];

        if (apiFn) {
          const res = await apiFn();

          let fieldData = {};

          if (selectedFieldType === 'my_signature') {
            fieldData.id = res.signature.signature_id;
            fieldData.base_url = res.signature.signature;
          } else if (selectedFieldType === 'my_initial') {
            fieldData.id = res.initial.initial_id;
            fieldData.base_url = res.initial.initial;
          } else if (selectedFieldType === 'my_stamp') {
            fieldData.id = res.stamps[0].stamp_id;
            fieldData.base_url = res.stamps[0].stamp;
          }
          console.log(res);

          prefillValue = fieldData;

          // ✅ store in cache
          setPrefillData(prev => ({
            ...prev,
            [selectedFieldType]: prefillValue,
          }));
        }
      } catch (err) {
        console.log(`${selectedFieldType} fetch failed`, err);
      }

      dispatch(hideLoader());
    } else {
      prefillValue = prefillData[selectedFieldType];
    }
  }

  const newField = createField(
    selectedFieldType,
    originalX,
    originalY,
    page.page,
    page.document_key,
    selectedRecipient,
    prefillValue,
    isPrefillType
  );

  setFields(prev => [...prev, newField]);
};
    
    // console.log("Fields =====> ",fields)
    
const mapUrlsToPages = async (urls, doc, order) => {
  const pages = await Promise.all(
    urls.map(
      (url, index) =>
        new Promise((resolve) => {
          Image.getSize(url, (width, height) => {
            resolve({
              imageId:`page_${index + 1}`,
              id: `${doc.document_key}_${index + 1}`,
              document_key: order,
              document_order: order,
              page: index + 1,
              page_no: index + 1,
              url,
              width,
              height,
            });
          });
        })
    )
  );

  return pages;
};
    const loadAllDocuments = async () => {
  const docs = await getDocumentListing(documentKeys);

    let allPages = [];

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];

    // 🔥 backend already gives array of page images
    const urls = await getDocumentUrl(doc.document_key);

    const pages = await mapUrlsToPages(urls, doc, i + 1);

    // ✅ flatten
    allPages = [...allPages, ...pages];
  }

      // console.log(allPages)
  setDocuments(allPages);
};
    const loadCanvas = async() => {
     dispatch(showLoader('Loading Documents'))
try {
  await loadAllDocuments();
} catch (e) {
  Alert.alert('Error', e.message);
} finally {
 dispatch(hideLoader())
}
    }

    useEffect(() => {
       loadCanvas() 
    }, [])
    
  
  
  const updateField = useCallback((id, updates) => {
    if (updates?.deleted) {
    setFields(prev => prev.filter(f => f.id !== id));
    return;
  }

  if (id === 'duplicate') {
    const field = updates;

    const newField = {
      ...field,
      id: Date.now().toString(),
      
      y: field.y + 80,
    };

    setFields(prev => [...prev, newField]);
    return;
    }
    
     if (id === 'resize') {
    const field = updates;

       setSelectedField(field);

       setEnableResize(true);
    return;
    }
    
    if (id === 'edit') {
       const field = updates;
       setTempField({ ...field });
       setSelectedField(field);

    setShowFieldMetaModal(true);
    return;
    }

  setFields(prev =>
    prev.map(f => (f.id === id ? { ...f, ...updates } : f))
  );
  }, []);
  
  console.log("Selected Field =======> ", selectedField);
  console.log("Enable Resize ==========> ", enableResize);
    

  
  const [isZoomed, setIsZoomed] = useState(false);


  return (
     <CustomSafeAreaView>


        
        <View style={styles.header}>
      
      
      <TouchableOpacity >
        <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

      
      <Text style={styles.title}>Add Fields</Text>

      
      <TouchableOpacity>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

          </View>

          <View style={styles.container}>
              <View  style={styles.recipientsWrapper}>
                  
          <Pressable onPress={() => {
            setSelectedField(null);
            setEnableResize(false);
            // setSelectedRecipient(null);
            
            setSelectedFieldType(null);
            setEnablePrefilled(prev=>!prev)
          }}>
            <View style={{ borderWidth: 1.5,
        borderColor:enablePrefilled ? Colors.prefilled :Colors.border,
              borderRadius: wp(2),
         backgroundColor: enablePrefilled ? (Colors.prefilled + "20") : 'transparent',
        gap: 4,
        alignItems: 'center',
        width: wp(18),
        height: wp(16),
        justifyContent:'center',padding:wp(2)}}>
              <UserPen color={enablePrefilled ? Colors.prefilled:Colors.black} size={fp(2)}/>
              
              <Text style={{
        fontSize: fp(1.4),
        fontFamily: Fonts.Regular,
        color:enablePrefilled ? Colors.prefilled :Colors.text_secondary
    }}>Pre Filled</Text>
           </View>
          </Pressable>
          
          <View style={{height:'80%',width:1,backgroundColor:Colors.border}} />
              <CanvasRecipients recipients={recipients} selectedRecipient={selectedRecipient} setSelectedRecipient={setSelectedRecipient}/>

        
          
        
        </View>
  <View style={{ flex: 1 }}>
            <FlatList
             data={documents}
  horizontal
  pagingEnabled
            showsHorizontalScrollIndicator={false}
            
            decelerationRate="fast"
  snapToInterval={screenWidth}
  snapToAlignment="center"
            disableIntervalMomentum={true}
            
            initialNumToRender={2}
windowSize={3}
removeClippedSubviews={true}

  scrollEnabled={!isZoomed}
  keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
     <View style={styles.pageWrapper}>
    <CanvasPage
      page={item}
      fields={fields}
      selectedField={selectedField}
      setSelectedField={setSelectedField}
      updateField={updateField}
      handleTap={handleTap}
                  setIsZoomed={setIsZoomed}
                  setEnableResize={setEnableResize}
                  enableResize={enableResize}
                  showToolbar={showToolbar}
                  setShowToolbar={setShowToolbar}
                  // 🔥 ADD THIS
                />
              </View>
            )}
          />
        </View>
        
        
        <View style={{ height: hp(12), backgroundColor: Colors.white, borderTopWidth: 1, borderColor: '#eee' }}>
          

         


         { selectedField && enableResize && (
  <View 
            // entering={FadeIn.duration(150).easing(Easing.out(Easing.quad))} 
            //  // 🚀 Faster exit (100ms)
            //   exiting={FadeOut.duration(100)}
              style={styles.sliderContainer}>
    
    {/* WIDTH */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginBottom:6 }}>
      <Text style={styles.sliderLabel}>HORIZONTAL</Text>
      <Text>{widthValue}px</Text>
    </View>

    <Slider
      progress={widthProgress}
      minimumValue={min}
      maximumValue={max}

                onValueChange={(val) => {

                  // console.log(val)
         if (typeof val !== 'number') return;
        const snapped = snap(val);
        widthProgress.value = snapped;
        setWidthValue(snapped);
        updateField(selectedField.id, { width: snapped });

      }}

      // onSlidingComplete={(val) => {
      //   const snapped = snap(val);
      // }}

      theme={{
        minimumTrackTintColor: '#007AFF',
        maximumTrackTintColor: '#ddd',
        bubbleBackgroundColor: '#007AFF',
      }}
    />

    {/* HEIGHT */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15,marginBottom:6 }}>
      <Text style={styles.sliderLabel}>VERTICAL</Text>
      <Text>{heightValue}px</Text>
    </View>

    <Slider
      progress={heightProgress}
      minimumValue={min}
      maximumValue={max}

                onValueChange={(val) => {
         if (typeof val !== 'number') return;
        const snapped = snap(val);
        heightProgress.value = snapped;

        updateField(selectedField.id, { height: snapped });
        setHeightValue(snapped);
      }}

      // onSlidingComplete={(val) => {
      //   const snapped = snap(val);
        
      // }}

      theme={{
        minimumTrackTintColor: '#007AFF',
        maximumTrackTintColor: '#ddd',
        bubbleBackgroundColor: '#007AFF',
      }}
    />

  </View>
          )}

           {!enablePrefilled && !enableResize && <CanvasBottomFieldsBar selectedType={selectedFieldType} onSelect={setSelectedFieldType} selectedRecipient={selectedRecipient} />}
        {
      enablePrefilled &&   <CanvasPrefilledFields selectedType={selectedFieldType} onSelect={setSelectedFieldType} selectedRecipient={selectedRecipient} />
           
           }      

        </View>

       
      </View>
      
       {
        showFieldMetaModal && <View 
          // entering={FadeIn.duration(100).easing(Easing.out(Easing.quad))} 
          //  // 🚀 Faster exit (100ms)
          //  exiting={FadeOut.duration(100)}
           style={styles.overlay}
        > 
          
           <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:hp(2)}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                  <TouchableOpacity onPress={()=>setShowFieldMetaModal(false)}>

 <ArrowLeft color={Colors.text_primary} size={fp(2.8)}/>
                  </TouchableOpacity>
              <Text style={{ fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(2.2) }}>{getFieldLabel(tempField?.field_name)}</Text>

                </View>
               
              
              </View>

        
          <View style={{flex:1,paddingTop:hp(1),gap:hp(2.5)}}>

             <View >
      <Text style={{fontFamily:Fonts.Regular,marginBottom:hp(0.8),color:Colors.text_primary}}>Assign To</Text>

          <Pressable onPress={()=> recipientRef.current?.snapToIndex(0)} style={{height:hp(6),borderWidth:1,borderColor:Colors.text_primary,justifyContent:'center',paddingHorizontal:wp(4)}}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                  <Text style={{flex:1,fontFamily:Fonts.Medium}}>
                      {tempField?.recipient_id}
                  </Text>

                  <ChevronDown color={Colors.text_primary} size={fp(2.3)}/>
              </View>
          </Pressable>

            </View>

            
            
             <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
            {MetaComponent && (
              <MetaComponent field={tempField}
                setField={setTempField} updateFieldValue={updateFieldValue} openDateFormatPicker={()=>dateRef.current?.snapToIndex(0)} />
)}
            
            {
              isTextStyleEligible(tempField?.field_name) && <TextStyleMeta field={tempField} setField={setTempField} openColorPicker={()=>colorRef.current?.snapToIndex(0)} closeColorPicker={() => colorRef.current?.close()} />
            }
          </View>

          <AppButton title={'Update'}  onPress={() => {
    if (!tempField) return;

    updateField(tempField.id, tempField); // ✅ APPLY CHANGES

    setShowFieldMetaModal(false);
    setTempField(null);
  }}/>
         

          
           
            




        
        </View>
      }


      <AppBottomSheet ref={recipientRef} title={'Choose Recipient'} snapPoints={['60%']}  >

                
                     <BottomSheetFlatList
        data={recipients}
        keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{marginTop:hp(2),gap:hp(0.5)}}
      
             
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No recipients</Text>
        )}
       
        />
        
     
       
       
                
                
      
     
        
      </AppBottomSheet>

       <AppBottomSheet ref={dateRef} title={'Select Date Format'} snapPoints={['25%']}  >

                
        <View style={{marginTop:hp(1)}}>
          
          <Pressable style={{height:hp(5),justifyContent:'center'}} onPress={() => {
            updateFieldValue('date_format', 'MM/DD/YYYY');
            dateRef?.current?.close();
          }}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

              <Text style={{flex:1,fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>MM/DD/YYYY</Text>

              {
                tempField?.date_format === "MM/DD/YYYY" && <Check color={Colors.primary} size={fp(2.8)}/>
              }
              
            </View>
          </Pressable>

           <Pressable style={{height:hp(5),justifyContent:'center'}} onPress={() => {
            updateFieldValue('date_format', 'DD/MM/YYYY');
            dateRef?.current?.close();
          }}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

              <Text style={{flex:1,fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>DD/MM/YYYY</Text>

              {
                tempField?.date_format === "DD/MM/YYYY" && <Check color={Colors.primary} size={fp(2.8)}/>
              }
              
            </View>
          </Pressable>


           <Pressable style={{height:hp(5),justifyContent:'center'}} onPress={() => {
            updateFieldValue('date_format', 'YYYY/MM/DD');
            dateRef?.current?.close();
          }}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

              <Text style={{flex:1,fontFamily:Fonts.Regular,fontSize:fp(1.8)}}>YYYY/MM/DD</Text>

              {
                tempField?.date_format === "YYYY/MM/DD" && <Check color={Colors.primary} size={fp(2.8)}/>
              }
              
            </View>
          </Pressable>

                    </View>
       
        
        
     
       
       
                
                
      
     
        
      </AppBottomSheet>


            <AppBottomSheet ref={colorRef} title={'Select Color'} snapPoints={['60%']}  >

          <View style={{marginTop:hp(2)}}>
            <Text style={{fontFamily:Fonts.Medium,fontSize:fp(1.8)}}>Basic Colors</Text>

            <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%',gap:wp(2),marginTop:hp(1.5)}}>
              {
              BASIC_COLORS?.map((color, index) => {
              const isSelected = tempField?.font_color === color;
                  
                return <Pressable style={{
                  flex: 1, borderWidth: 1.5,padding:1,
          borderColor:isSelected ? "#000" : "rgba(0,0,0,0)"
                    
                  }}  onPress={() => {
          
        
          setTempField(prev => ({
            ...prev,
            font_color: color
          }))

          colorRef.current?.close()

        }
        }>
                    <View style={{ height: hp(3.5), backgroundColor: color, borderWidth: 1, borderColor: Colors.border, justifyContent:"center",alignItems:'center'}}>
 {isSelected && (
          <Check size={fp(2.5)} color={Colors.white}/>
        )}
                    </View>
                  </Pressable>
                })
              }
            </View>
        </View>
        
        <View style={{marginTop:hp(2)}}>
 
          <Text style={{ fontFamily: Fonts.Medium, fontSize: fp(1.8),marginBottom:hp(1.5) }}>More Colors</Text>
            

         <BottomSheetFlatList
  data={ALL_COLORS}
  keyExtractor={(item) => item}
  numColumns={7} // 🔥 change columns count
            scrollEnabled={false}
            // contentContainerStyle={{gap:wp(1),columnGap:wp(1)}}
  renderItem={({ item,index }) => {
    const isSelected = tempField?.font_color === item;

    return (
      <Pressable
        onPress={() => {
          
        
          setTempField(prev => ({
            ...prev,
            font_color: item
          }))

          colorRef.current?.close()

        }
        }
        style={{
          flex: 1,
          aspectRatio: 1, // 🔥 perfect square
          marginRight: (index + 1) % 7 === 0 ? 0 :wp(1),
          marginBottom: wp(1),
          padding:1,
          // borderRadius: 6,
          // backgroundColor: item,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor:isSelected ? "#000" : "rgba(0,0,0,0)"
        }}
      >
        <View style={{ backgroundColor: item,width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}}>

           {isSelected && (
          <Check size={fp(2.5)} color={Colors.white}/>
        )}
        </View>

       
      </Pressable>
    );
  }}
/>
        </View>
          
          </AppBottomSheet>
    </CustomSafeAreaView>
  )
}

export default CanvasScreen;

const styles = StyleSheet.create({
pageWrapper: {
  width: screenWidth,
  justifyContent: 'center',
  alignItems: 'center',
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
        elevation: 4,
      },
    
      title: {
        fontSize: fp(2.2),
        fontFamily: Fonts.SemiBold,
        color: Colors.text_primary,
        letterSpacing: 0.5,
    },
    container: {
        flex:1,
          backgroundColor:Colors.background_light
    },
    recipientsWrapper:{flexDirection:'row',paddingHorizontal:wp(3),paddingVertical:hp(1),backgroundColor:Colors.white,gap:wp(3),justifyContent:'center',alignItems:'center',width:'100%'},
  sliderContainer: {
    paddingVertical: hp(1.5),
    paddingHorizontal:wp(5),
 
},

sliderLabel: {
  fontSize: 12,
  fontWeight: '600',
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
    empty: {
    textAlign: 'center',
    marginTop: hp(5),
    color: '#999',
  },
}


)