import { Alert, Dimensions, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import { ArrowLeft, Check, ChevronDown, Ellipsis, UserPen, } from 'lucide-react-native';

import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { getDocumentListing, getDocumentUrl, getSnapshots } from '@utils/documentService';
import CanvasBottomFieldsBar from './components/CanvasBottomFieldsBar';
import { ALL_COLORS, BASIC_COLORS, FIELD_META_COMPONENTS, getFieldDefaults, getFieldLabel, IAMSIGNER_FIELDS, PREFILLED_FIELDS, TEXT_STYLE_ELIGIBLE } from '@utils/fieldConstants';
import CanvasPage from './components/CanvasPage';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';
import CanvasPrefilledFields from './components/CanvasPrefilledFields';
import CanvasRecipients from './components/CanvasRecipients';
import AppBottomSheet from '@components/AppBottomSheet';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import AppButton from '@components/AppButton';
import TextStyleMeta from './components/fieldMeta/TextStyleMeta';
import api from '@utils/api';
import moment from 'moment';
import SignaturePad from './components/SignaturePad';
import InitialPad from './components/InitialPad';
import StampPad from './components/StampPad';
import TopSheet from './components/TopSheet';
import Toast from 'react-native-toast-message';
import { setAllFields, setRecipientsBulk } from '@redux/slices/envelopeSlice';
import { navigate } from '@utils/NavigationUtils';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/native';
import CreateRadioFieldModal from './components/CreateRadioFieldModal';
import SwipeHint from '@components/SwipeHint';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CanvasIamSignerFields from './components/CanvasIamSignerFields';

const screenWidth = Dimensions.get('window').width;
const MemoTopSheet = React.memo(TopSheet);

const CanvasScreen = ({ navigation }) => {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const im_signer = useAppSelector(state => state?.envelope?.im_signer);

  const [showHint, setShowHint] = useState(false);


  const checkFirstVisit = async () => {
    try {
      const alreadyShown = await AsyncStorage.getItem('pager_swipe_hint');

      if (!alreadyShown) {
        setShowHint(true);


        await AsyncStorage.setItem('pager_swipe_hint', 'true');
      }
    } catch (error) {
      console.log('Storage error', error);
    }
  };

  const reduxFields = useAppSelector(state => state?.envelope?.allFields);

  const { id, first_name, last_name, email, company_name, job_title } = user;
  const fullName = first_name + " " + last_name;
  const initial = first_name?.slice(0, 1) + last_name?.slice(0, 1);

  // UI Modals
  const [showPrefilledSignatureModal, setShowPrefilledSignatureModal] = useState(false);
  const [showPrefilledInitialModal, setShowPrefilledInitialModal] = useState(false);
  const [showPrefilledStampModal, setShowPrefilledStampModal] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showFieldMetaModal, setShowFieldMetaModal] = useState(false);
  const [showRadioButtonCreateModal, setShowRadioButtonCreateModal] = useState(false);

  const [pendingField, setPendingField] = useState(null);

  // Animation Values
  const widthProgress = useSharedValue(0);
  const heightProgress = useSharedValue(0);
  const min = useSharedValue(20);
  const max = useSharedValue(300);
  const rotate = useSharedValue(0);

  // Refs
  const recipientRef = useRef(null);
  const colorRef = useRef(null);
  const dateRef = useRef(null);
  const flatListRef = useRef(null);

  // State
  const [tempField, setTempField] = useState(null);
  const [widthValue, setWidthValue] = useState(0);
  const [heightValue, setHeightValue] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState([]);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [enableResize, setEnableResize] = useState(false);
  const [enablePrefilled, setEnablePrefilled] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState();
  const [fields, setFields] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  const [prefillData, setPrefillData] = useState({
    my_signature: null,
    my_initial: null,
    my_stamp: null,
    my_date_signed: moment().format('MM/DD/YYYY'),
    my_full_name: fullName,
    my_email: email,
    my_company: company_name
  });

  const [iamSignerData, setIamSignerData] = useState({
    signature: null,
    initial: null,
    stamp: null,
    date_signed: moment().format('MM/DD/YYYY'),
    full_name: fullName,
    first_name: first_name,
    last_name: last_name,
    email: email,
    company: company_name,
    title: job_title,
  });

  const documentData = useAppSelector(state => state?.envelope?.envelopeDocuments);
  const recipients = useAppSelector(state => state?.envelope?.addRecipientsBox);
  const allNonRecipients = recipients?.filter((recp) => recp?.action !== 'receive_copy');
  // console.log(recipients)
  const isAllRecipientReceiveCopy = recipients.every(
    (item) => item.action === 'receive_copy'
  );

  // console.log(isAllRecipientReceiveCopy)
  const documentKeys = documentData?.map(item => item?.document_key);
  console.log(documentKeys)

  const MetaComponent = FIELD_META_COMPONENTS[tempField?.field_name];
  const snap = (val) => Math.round(val / 10) * 10;

  // useEffect(() => {
  //   if (allNonRecipients?.length === 0 && isAllRecipientReceiveCopy) {
  //     setEnablePrefilled(true);
  //   } else {

  //     setSelectedRecipient(allNonRecipients[0]);
  //   }
  //   loadCanvas();
  // }, []);

  useEffect(() => {
    dispatch(showLoader('Loading Documents'))
    const timer = setTimeout(() => {
      if (allNonRecipients?.length === 0 && isAllRecipientReceiveCopy) {
        setEnablePrefilled(true);
      } else {
        setSelectedRecipient(allNonRecipients[0]);
      }

      loadCanvas();
      dispatch(hideLoader())

    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedField) {
      widthProgress.value = Number(selectedField.width);
      heightProgress.value = Number(selectedField.height);
      setWidthValue(Number(selectedField.width));
      setHeightValue(Number(selectedField.height));
    }
  }, [selectedField?.id]);



  // useFocusEffect(
  //   useCallback(() => {
  //     // Screen focused → load redux data into local state
  //     setFields(reduxFields || []);

  //     return () => {
  //       // Screen unfocused → save local fields back to redux
  //       dispatch(setAllFields(fields));
  //     };
  //   }, [reduxFields, fields, dispatch])
  // );

  useEffect(() => {
    rotate.value = withTiming(showDocuments ? 180 : 0, { duration: 250 });
  }, [showDocuments]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  // --- API CALLS ---
  const fetchSignature = async () => (await api.get(`/api/signature?user=${id}`)).data;
  const fetchInitial = async () => (await api.get(`/api/initial?user=${id}`)).data;
  const fetchStamp = async () => (await api.get(`/api/stamp?user=${id}`)).data;

  const PREFILL_API_MAP = {
    my_signature: fetchSignature,
    my_initial: fetchInitial,
    my_stamp: fetchStamp,
  };

  const IAMSIGNER_API_MAP = {
    signature: fetchSignature,
    initial: fetchInitial,
    stamp: fetchStamp,
  };

  const loadCanvas = async () => {
    dispatch(showLoader('Loading Documents'))
    try {
      const docs = await getDocumentListing(documentKeys);
      let allPages = [];
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const urls = await getDocumentUrl(doc.document_key);


        const pages = await mapUrlsToPages(urls, doc, i + 1);
        allPages = [...allPages, ...pages];
      }
      const documentsWithIndex = addGlobalIndex(allPages);
      setGroupedDocuments(groupDocuments(documentsWithIndex));
      setDocuments(documentsWithIndex);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      checkFirstVisit();
      dispatch(hideLoader())
    }
  };

  const mapUrlsToPages = async (urls, doc, order) => {
    const signed_urls = urls?.signed_urls || [];
    // console.log("hehke++", urls?.documents?.[0]?.doc_width)
    const docWidth = urls?.documents?.[0]?.doc_width;
    const docHeight = urls?.documents?.[0]?.doc_height;
    return signed_urls.map((url, index) => ({
      imageId: `page_${index + 1}`,
      id: `${doc.document_key}_${index + 1}`,
      document_name: doc.document_name,
      document_key: order.toString(),
      document_order: order,
      page: index + 1,
      page_no: index + 1,
      url,
      width: docWidth,
      height: docHeight,
    }));
  };

  const addGlobalIndex = (docs) => docs.map((doc, index) => ({ ...doc, globalIndex: index }));

  const groupDocuments = (docs) => {
    const grouped = {};
    docs.forEach((doc) => {
      if (!grouped[doc.document_key]) {
        grouped[doc.document_key] = { document_name: doc.document_name, pages: [] };
      }
      grouped[doc.document_key].pages.push(doc);
    });
    return Object.values(grouped);
  };

  // --- FIELD GENERATION ---
  const makeid = (prefix) => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return prefix + "-" + result;
  };

  const isTextStyleEligible = (fieldName) => TEXT_STYLE_ELIGIBLE.includes(fieldName);

  const createField = (type, x, y, page_no, document_key, document_order, recipient, prefillData = null, isPrefilled = false) => {
    const defaults = getFieldDefaults(type);
    let field = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, x, y, top: y, left: x,
      width: defaults.width,
      height: defaults.height,
      page_no, document_key, document_order,
      recipient_id: recipient?.recepient_email,
      recipient_color: recipient?.meta_info?.recepient_color,
      value: '', required: true,
      font_size: 9, font_color: "rgb(0,0,0)", font_family: "couriernew", font_weight: "normal", font_style: "normal", text_decoration: "normal",
      signature_with_border: false, include_date_name: false, initial_with_border: false,
      element_id: makeid(type), field_name: type,
    };

    if (isPrefilled && prefillData && !im_signer) {
      field.is_prefilled_field = true;
      if (['my_signature', 'my_initial', 'my_stamp'].includes(type)) {
        field.field_data = prefillData?.id;
        field.image_base_64 = prefillData?.base_url;
        field.recipient_color = Colors.prefilled;
      } else {
        field.field_data = prefillData;
        field.recipient_color = Colors.prefilled;
      }
    }
    console.log(isPrefilled, prefillData, im_signer)

    if (im_signer) {
      field.recipient_color = Colors.iamSigner;

    }

    if (prefillData && im_signer) {
      field.is_prefilled_field = true;
      if (['signature', 'initial', 'stamp'].includes(type)) {
        field.field_data = prefillData?.id;
        field.image_base_64 = prefillData?.base_url;
        field.recipient_color = Colors.iamSigner;
      } else {
        field.field_data = prefillData;
        field.recipient_color = Colors.iamSigner;
      }
    }

    if (type === 'checkbox' && im_signer) field.is_checked = true;
    if (type === 'full_name' && !im_signer) field.field_data = recipient?.recepient_name;
    if (type === 'email' && !im_signer) field.field_data = recipient?.recepient_email;
    if (type === 'plain_text') field.field_data = '';
    if (type === 'dropdown') field.field_data = 'Dropdown';

    return field;
  };

  const createRadioGroup = (data) => {

    console.log(data)

    const groupName = data?.groupName;
    const radioOptions = data?.radioOptions;

    const { x, y, page, selectedRecipient } = pendingField;


    const radioFields = radioOptions?.map((option, index) => {
      const fieldValue = `${groupName}@-@-@${option}`;
      const space = (index + 1) * 50;
      return { ...createField('radio', x + space, y, page?.page_no, page.document_key, page.document_order, selectedRecipient), group: groupName, field_data: fieldValue, selected: false }
    })

    setFields(prev => [...prev, ...radioFields]);

    console.log("Radio Fields =========> ", radioFields);

    setShowRadioButtonCreateModal(false);

    setPendingField(null)


  };

  const handlePrefillSaved = (data) => {
    setPrefillData(prev => ({ ...prev, [pendingField.selectedFieldType]: data }));
    const newField = createField(pendingField.selectedFieldType, pendingField.x, pendingField.y, pendingField.page.page, pendingField.page.document_key, pendingField.selectedRecipient, data, true);
    setFields(prev => [...prev, newField]);
    setPendingField(null);
  };

  // --- EVENT HANDLERS ---
  const updateField = useCallback((id, updates) => {
    if (updates?.deleted) {
      setFields(prev => prev.filter(f => f.id !== id));
      setEnableResize(false);

      return;
    }
    if (id === 'duplicate') {
      setFields(prev => [...prev, { ...updates, id: Date.now().toString(), y: updates.y + 40 }]);
      setEnableResize(false);
      return;
    }
    if (id === 'resize') {
      setSelectedField(updates);
      setEnableResize(true);
      return;
    }
    if (id === 'edit') {
      setTempField({ ...updates });
      setSelectedField(updates);
      setShowFieldMetaModal(true);
      setEnableResize(false);
      return;
    }
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const updateFieldValue = useCallback((key, value) => {
    setTempField((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTap = async (e, page) => {
    if (!selectedFieldType) return;
    const { locationX, locationY } = e.nativeEvent;
    const baseScale = screenWidth / page.width;
    const originalX = locationX / baseScale;
    const originalY = locationY / baseScale;

    const isPrefillType = PREFILLED_FIELDS.includes(selectedFieldType);
    const isIamSignerType = IAMSIGNER_FIELDS.includes(selectedFieldType);

    console.log("Is Iam Signer Type", isIamSignerType, im_signer, selectedFieldType);

    let prefillValue = null;
    let prefilledError = null;

    if (isPrefillType) {
      if (!prefillData[selectedFieldType]) {
        dispatch(showLoader('Fetching'));
        try {
          const apiFn = PREFILL_API_MAP[selectedFieldType];
          if (apiFn) {
            const res = await apiFn();
            let fieldData = {};

            if (selectedFieldType === 'my_signature') {
              if (res?.signature?.signature_id && res?.signature?.signature) {
                fieldData.id = res.signature?.signature_id; fieldData.base_url = res.signature?.signature;
              } else { setShowPrefilledSignatureModal(true); }
            } else if (selectedFieldType === 'my_initial') {
              if (res?.initial?.initial_id && res?.initial?.initial) {
                fieldData.id = res.initial?.initial_id; fieldData.base_url = res.initial?.initial;
              } else { setShowPrefilledInitialModal(true); }
            } else if (selectedFieldType === 'my_stamp') {
              if (res?.stamps[0]?.stamp_id && res?.stamps[0]?.stamp) {
                fieldData.id = res.stamps[0]?.stamp_id; fieldData.base_url = res.stamps[0]?.stamp;
              } else { setShowPrefilledStampModal(true); }
            }

            if (fieldData?.id && fieldData?.base_url) {
              prefillValue = fieldData;
              setPrefillData(prev => ({ ...prev, [selectedFieldType]: prefillValue }));
            } else {
              prefilledError = true;
              setPendingField({ x: originalX, y: originalY, page, selectedFieldType, selectedRecipient });
            }
          }
        } catch (err) { console.log(`${selectedFieldType} fetch failed`, err); }
        dispatch(hideLoader());
      } else {
        prefillValue = prefillData[selectedFieldType];
      }
    }

    if (prefilledError) return;



    if (isIamSignerType && im_signer) {
      if (!iamSignerData[selectedFieldType]) {
        dispatch(showLoader('Fetching'));
        try {
          const apiFn = IAMSIGNER_API_MAP[selectedFieldType];
          if (apiFn) {
            const res = await apiFn();
            let fieldData = {};

            if (selectedFieldType === 'signature') {
              if (res?.signature?.signature_id && res?.signature?.signature) {
                fieldData.id = res.signature?.signature_id; fieldData.base_url = res.signature?.signature;
              } else { setShowPrefilledSignatureModal(true); }
            } else if (selectedFieldType === 'initial') {
              if (res?.initial?.initial_id && res?.initial?.initial) {
                fieldData.id = res.initial?.initial_id; fieldData.base_url = res.initial?.initial;
              } else { setShowPrefilledInitialModal(true); }
            } else if (selectedFieldType === 'stamp') {
              if (res?.stamps[0]?.stamp_id && res?.stamps[0]?.stamp) {
                fieldData.id = res.stamps[0]?.stamp_id; fieldData.base_url = res.stamps[0]?.stamp;
              } else { setShowPrefilledStampModal(true); }
            }

            if (fieldData?.id && fieldData?.base_url) {
              prefillValue = fieldData;
              setIamSignerData(prev => ({ ...prev, [selectedFieldType]: prefillValue }));
            } else {
              prefilledError = true;
              setPendingField({ x: originalX, y: originalY, page, selectedFieldType, selectedRecipient });
            }
          }
        } catch (err) { console.log(`${selectedFieldType} fetch failed`, err); }
        dispatch(hideLoader());
      } else {
        prefillValue = iamSignerData[selectedFieldType];
      }
    }

    if (prefilledError) return;



    if (selectedFieldType === 'radio') {

      setShowRadioButtonCreateModal(true);

      setPendingField({ x: originalX, y: originalY, page, selectedFieldType, selectedRecipient });
      setSelectedFieldType(null);

      return;
    }

    const newField = createField(selectedFieldType, originalX, originalY, page.page, page.document_key, page.document_order, selectedRecipient, prefillValue, isPrefillType);
    setFields(prev => [...prev, newField]);
    setSelectedFieldType(null);
  };

  const handleNext = () => {
    dispatch(showLoader('Loading'))
    const temp_resp = recipients?.filter(recp => recp.action !== 'receive_copy').map(resp => resp.recepient_email);
    const recipientsWithFields = new Set(fields.map(field => field.recipient_id));
    const recipientsWithoutFields = temp_resp.filter(resp => !recipientsWithFields.has(resp));

    console.log(fields);

    if (recipientsWithoutFields.length > 0 && !im_signer) {
      dispatch(hideLoader());
      Toast.show({ type: 'error', text1: `Please add fields for: ${recipientsWithoutFields.join(", ")}` });
      return;
    }

    if (fields?.length === 0 && im_signer) {
      dispatch(hideLoader());
      Toast.show({ type: 'error', text1: `Please add at least one field` });
      return;
    }


    const hasEmptyPlainText = fields.some(
      (item) =>
        item.field_name === 'plain_text' &&
        (!item.field_data || item.field_data.trim() === '')
    );

    if (hasEmptyPlainText) {
      dispatch(hideLoader());

      Toast.show({
        type: 'error',
        text1: 'Note cannot be empty',
      });

      return;
    }


    const hasInvalidDropdown = fields.some(
      (item) =>
        item.field_name === 'dropdown' &&
        (
          !item.field_data ||
          !item.field_data.includes(',') ||
          item.field_data.split(',').filter(v => v.trim() !== '').length < 2
        )
    );

    if (hasInvalidDropdown) {
      dispatch(hideLoader());

      Toast.show({
        type: 'error',
        text1: 'Please add Dropdown Options',
      });

      return;
    }
    dispatch(setAllFields(fields));

    dispatch(hideLoader());


    if (im_signer) {
      navigate('IamSignerFinish')
    } else {

      navigate('Finish');
    }
  };

  // --- MEMOIZED RENDERERS ---
  const handleColorSelect = useCallback((color) => {
    setTempField(prev => ({ ...prev, font_color: color }));
    colorRef.current?.close();
  }, []);

  const handleDateSelect = useCallback((format) => {
    updateFieldValue('date_format', format);
    dateRef?.current?.close();
  }, [updateFieldValue]);

  const renderRecipientItem = useCallback(({ item }) => (
    <Pressable onPress={() => {
      setTempField(prev => ({ ...prev, recipient_id: item.recepient_email, recipient_color: item.meta_info?.recepient_color }));
      recipientRef.current?.close();
    }} style={styles.recipientRow}>
      <View style={[styles.recipientAvatar, { borderColor: item?.meta_info?.recepient_border_color, backgroundColor: (item?.meta_info?.recepient_border_color + '40') }]}>
        <Text style={[styles.recipientAvatarText, { color: item?.meta_info?.recepient_border_color }]}>{item?.recepient_name?.slice(0, 2)}</Text>
      </View>
      <Text style={styles.recipientNameText}>{item?.recepient_name}</Text>
    </Pressable>
  ), []);

  const scrollToPage = useCallback((index) => {
    flatListRef.current?.setPage(index);
  }, []);

  const renderPageItem = useCallback(({ item: page }) => (
    <Pressable onPress={() => { setShowDocuments(false); scrollToPage(page.globalIndex); }} style={styles.pageBox}>
      <FastImage source={{ uri: page.url }} style={styles.pageImage} resizeMode={FastImage.resizeMode.cover} />
      <Text style={styles.pageNumber}>{page.page_no}</Text>
    </Pressable>
  ), [scrollToPage]);

  const renderDocumentItem = useCallback(({ item }) => (
    <View style={styles.docContainer}>
      <Text style={styles.docTitle}>{item.document_name}</Text>
      <FlatList
        data={item.pages} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageList}
        keyExtractor={(page) => page.id} renderItem={renderPageItem}
        initialNumToRender={5} maxToRenderPerBatch={5} windowSize={3} removeClippedSubviews
      />
    </View>
  ), [renderPageItem]);

  return (
    <CustomSafeAreaView>
      <View style={styles.header}>
        <Pressable style={styles.headerTitleRow} onPress={() => setShowDocuments(prev => !prev)}>
          <Text style={styles.title}>Documents</Text>
          <Animated.View style={animatedStyle}>
            <ChevronDown color={Colors.text_primary} size={fp(2)} />
          </Animated.View>
        </Pressable>

        <View style={styles.headerActions}>
          {/* <TouchableOpacity><Ellipsis size={fp(3)} color={Colors.text_primary} strokeWidth={1.6} /></TouchableOpacity> */}
          <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <MemoTopSheet visible={showDocuments} onClose={() => setShowDocuments(false)} >
          <FlatList
            data={groupedDocuments} keyExtractor={(item, index) => index.toString()} renderItem={renderDocumentItem}
            initialNumToRender={3} maxToRenderPerBatch={3} windowSize={3} removeClippedSubviews
          />
        </MemoTopSheet>
        {
          !im_signer && <View style={styles.recipientsWrapper}>
            <Pressable onPress={() => {
              setSelectedField(null); setEnableResize(false); setSelectedFieldType(null);
              if (!isAllRecipientReceiveCopy) {
                setEnablePrefilled(prev => !prev);
              }
            }}>
              <View style={[styles.prefillToggleBtn, { borderColor: enablePrefilled ? Colors.prefilled : Colors.border, backgroundColor: enablePrefilled ? (Colors.prefilled + "20") : 'transparent' }]}>
                <UserPen color={enablePrefilled ? Colors.prefilled : Colors.black} size={fp(2)} />
                <Text style={[styles.prefillToggleText, { color: enablePrefilled ? Colors.prefilled : Colors.text_secondary }]}>Pre Filled</Text>
              </View>
            </Pressable>
            {
              !isAllRecipientReceiveCopy && <>
                <View style={styles.verticalDivider} />
                <CanvasRecipients recipients={allNonRecipients} selectedRecipient={selectedRecipient} setSelectedRecipient={setSelectedRecipient} />


              </>
            }

          </View>
        }


        <View style={styles.pagerWrapper}>
          {!isZoomed && showHint && <SwipeHint setShowHint={setShowHint} />}
          <PagerView ref={flatListRef} style={styles.pagerWrapper} initialPage={0} scrollEnabled={!isZoomed} overdrag={false}>
            {documents.map((page, index) => (
              <View key={page.id} style={styles.pageWrapper} collapsable={false}>
                <CanvasPage
                  page={page} fields={fields} selectedField={selectedField} setSelectedField={setSelectedField}
                  updateField={updateField} handleTap={handleTap} setIsZoomed={setIsZoomed} isZoomed={isZoomed}
                  setEnableResize={setEnableResize} enableResize={enableResize} showToolbar={showToolbar} setShowToolbar={setShowToolbar}
                />
              </View>
            ))}
          </PagerView>
        </View>

        <View style={styles.sliderSection}>
          {selectedField && enableResize && (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{

                  (selectedField?.field_name === 'checkbox' || selectedField?.field_name === 'radio') ? 'SCALE' : 'HORIZONTAL'

                }</Text><Text>{widthValue}px</Text>
              </View>
              <Slider
                progress={widthProgress} minimumValue={min} maximumValue={max}
                onValueChange={(val) => { if (typeof val === 'number') widthProgress.value = snap(val); }}
                onSlidingComplete={(val) => {
                  const snapped = snap(val);
                  if (selectedField?.field_name === 'checkbox' || selectedField?.field_name === 'radio') {
                    setWidthValue(snapped);
                    setHeightValue(snapped)
                    updateField(selectedField.id, { width: snapped, height: snapped });
                  } else {


                    setWidthValue(snapped);
                    updateField(selectedField.id, { width: snapped });

                  }
                }}
                theme={{ minimumTrackTintColor: '#007AFF', maximumTrackTintColor: '#ddd', bubbleBackgroundColor: '#007AFF' }}
              />

              {
                (selectedField?.field_name !== 'checkbox' && selectedField?.field_name !== 'radio') && <>

                  <View style={styles.sliderRowVertical}>
                    <Text style={styles.sliderLabel}>VERTICAL</Text><Text>{heightValue}px</Text>
                  </View>
                  <Slider
                    progress={heightProgress} minimumValue={min} maximumValue={max}
                    onValueChange={(val) => { if (typeof val === 'number') heightProgress.value = snap(val); }}
                    onSlidingComplete={(val) => {
                      const snapped = snap(val);
                      setHeightValue(snapped);
                      updateField(selectedField.id, { height: snapped });
                    }}
                    theme={{ minimumTrackTintColor: '#007AFF', maximumTrackTintColor: '#ddd', bubbleBackgroundColor: '#007AFF' }}
                  />

                </>
              }

            </View>
          )}

          {!im_signer && !enablePrefilled && !enableResize && <CanvasBottomFieldsBar selectedType={selectedFieldType} onSelect={setSelectedFieldType} selectedRecipient={selectedRecipient} />}
          {!im_signer && enablePrefilled && <CanvasPrefilledFields selectedType={selectedFieldType} onSelect={setSelectedFieldType} selectedRecipient={selectedRecipient} />}
          {im_signer && !enableResize && <CanvasIamSignerFields selectedType={selectedFieldType} onSelect={setSelectedFieldType} selectedRecipient={selectedRecipient} />}
        </View>
      </View>

      {/* Overlays */}
      {showPrefilledSignatureModal && (
        <View style={styles.overlay}>
          <SignaturePad userId={id} userName={fullName} onClose={() => { setShowPrefilledSignatureModal(false); setPendingField(null); }} onSave={(data) => { setShowPrefilledSignatureModal(false); handlePrefillSaved(data); }} />
        </View>
      )}

      {showPrefilledInitialModal && (
        <View style={styles.overlay}>
          <InitialPad userId={id} userName={initial} onClose={() => { setShowPrefilledInitialModal(false); setPendingField(null); }} onSave={(data) => { setShowPrefilledInitialModal(false); handlePrefillSaved(data); }} />
        </View>
      )}

      {showPrefilledStampModal && (
        <View style={styles.overlay}>
          <StampPad userId={id} userName={fullName} onClose={() => { setShowPrefilledStampModal(false); setPendingField(null); }} onSave={(data) => { setShowPrefilledStampModal(false); handlePrefillSaved(data); }} />
        </View>
      )}

      {/* Field Meta Edit Modal */}
      {showFieldMetaModal && (
        <View style={styles.overlay}>
          <View style={styles.metaHeader}>
            <View style={styles.metaHeaderTitleRow}>
              <TouchableOpacity onPress={() => setShowFieldMetaModal(false)}><ArrowLeft color={Colors.text_primary} size={fp(2.8)} /></TouchableOpacity>
              <Text style={styles.metaTitle}>{getFieldLabel(tempField?.field_name)}</Text>
            </View>
          </View>

          <View style={styles.metaBody}>
            {
              !im_signer && <>
                <View>
                  <Text style={styles.metaLabel}>Assign To</Text>
                  <Pressable onPress={() => recipientRef.current?.snapToIndex(0)} style={styles.metaAssignBox}>
                    <View style={styles.metaAssignRow}>
                      <Text style={styles.metaAssignText}>{tempField?.recipient_id}</Text>
                      <ChevronDown color={Colors.text_primary} size={fp(2.3)} />
                    </View>
                  </Pressable>
                </View>

                <View style={styles.metaDivider} />

              </>
            }

            {MetaComponent && (
              <MetaComponent field={tempField} setField={setTempField} updateFieldValue={updateFieldValue} openDateFormatPicker={() => dateRef.current?.snapToIndex(0)} />
            )}
            {isTextStyleEligible(tempField?.field_name) && (
              <TextStyleMeta field={tempField} setField={setTempField} openColorPicker={() => colorRef.current?.snapToIndex(0)} closeColorPicker={() => colorRef.current?.close()} />
            )}
          </View>

          <AppButton title={'Update'} onPress={() => {
            if (!tempField) return;
            updateField(tempField.id, tempField);
            setShowFieldMetaModal(false);
            setTempField(null);
          }} />
        </View>
      )}

      <CreateRadioFieldModal visible={showRadioButtonCreateModal} onSave={(data) => {
        createRadioGroup(data);
      }} setVisible={setShowRadioButtonCreateModal} />



      {/* Bottom Sheets */}
      <AppBottomSheet ref={recipientRef} title={'Choose Recipient'} snapPoints={['60%']}>
        <BottomSheetFlatList
          data={allNonRecipients} keyExtractor={(item, index) => index.toString()} renderItem={renderRecipientItem}
          keyboardShouldPersistTaps="handled" contentContainerStyle={styles.recipientListContent}
          ListEmptyComponent={() => (<Text style={styles.empty}>No recipients</Text>)}
        />
      </AppBottomSheet>

      <AppBottomSheet ref={dateRef} title={'Select Date Format'} snapPoints={['25%']}>
        <View style={styles.datePickerContainer}>
          {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'].map(format => (
            <Pressable key={format} style={styles.dateRowPressable} onPress={() => handleDateSelect(format)}>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{format}</Text>
                {tempField?.date_format === format && <Check color={Colors.primary} size={fp(2.8)} />}
              </View>
            </Pressable>
          ))}
        </View>
      </AppBottomSheet>

      <AppBottomSheet ref={colorRef} title={'Select Color'} snapPoints={['60%']}>
        <View style={styles.colorSection}>
          <Text style={styles.colorTitle}>Basic Colors</Text>
          <View style={styles.basicColorRow}>
            {BASIC_COLORS?.map((color, index) => {
              const isSelected = tempField?.font_color === color;
              return (
                <Pressable key={index} style={[styles.basicColorPressable, { borderColor: isSelected ? "#000" : "transparent" }]} onPress={() => handleColorSelect(color)}>
                  <View style={[styles.colorBox, { backgroundColor: color }]}>
                    {isSelected && <Check size={fp(2.5)} color={Colors.white} />}
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={styles.colorSection}>
          <Text style={styles.colorTitleMore}>More Colors</Text>
          <BottomSheetFlatList
            data={ALL_COLORS} keyExtractor={(item) => item} numColumns={7} scrollEnabled={false}
            renderItem={({ item, index }) => {
              const isSelected = tempField?.font_color === item;
              return (
                <Pressable onPress={() => handleColorSelect(item)} style={[
                  styles.allColorPressable,
                  { marginRight: (index + 1) % 7 === 0 ? 0 : wp(1), borderColor: isSelected ? "#000" : "transparent" }
                ]}>
                  <View style={[styles.allColorBox, { backgroundColor: item }]}>
                    {isSelected && <Check size={fp(2.5)} color={Colors.white} />}
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
  // Global & Wrappers
  pageWrapper: { flex: 1, width: screenWidth, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: Colors.background_light, position: 'relative' },
  pagerWrapper: { flex: 1, position: 'relative' },
  overlay: { position: 'absolute', top: 0, left: 0, height: hp(100), backgroundColor: Colors.white, width: wp(100), padding: wp(5) },
  verticalDivider: { height: '80%', width: 1, backgroundColor: Colors.border },

  // Header
  header: { height: hp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(5), backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: fp(2.2), fontFamily: Fonts.Medium, color: Colors.text_primary, letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  nextBtn: { height: hp(4), backgroundColor: Colors.primary_dark, paddingHorizontal: wp(6), justifyContent: "center", alignItems: 'center', borderRadius: wp(1) },
  nextBtnText: { color: Colors.white, fontSize: fp(1.7), fontFamily: Fonts.Medium },

  // Recipients Row
  recipientsWrapper: { flexDirection: 'row', paddingHorizontal: wp(3), paddingVertical: hp(1), backgroundColor: Colors.white, gap: wp(3), justifyContent: 'center', alignItems: 'center', width: '100%' },
  prefillToggleBtn: { borderWidth: 1.5, borderRadius: wp(2), gap: 4, alignItems: 'center', width: wp(18), height: wp(16), justifyContent: 'center', padding: wp(2) },
  prefillToggleText: { fontSize: fp(1.4), fontFamily: Fonts.Regular },

  // Bottom Slider Section
  sliderSection: { height: hp(13), backgroundColor: Colors.white, borderTopWidth: 1, borderColor: '#eee' },
  sliderContainer: { paddingVertical: hp(1.5), paddingHorizontal: wp(5) },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sliderRowVertical: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 6 },
  sliderLabel: { fontSize: 12, fontWeight: '600' },

  // Meta Modal
  metaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) },
  metaHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  metaTitle: { fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(2.2) },
  metaBody: { flex: 1, paddingTop: hp(1), gap: hp(2.5) },
  metaLabel: { fontFamily: Fonts.Regular, marginBottom: hp(0.8), color: Colors.text_primary },
  metaAssignBox: { height: hp(6), borderWidth: 1, borderColor: Colors.text_primary, justifyContent: 'center', paddingHorizontal: wp(4) },
  metaAssignRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaAssignText: { flex: 1, fontFamily: Fonts.Medium },
  metaDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },

  // List Items & Documents
  empty: { textAlign: 'center', marginTop: hp(5), color: '#999' },
  docContainer: { marginBottom: 20 },
  docTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 10 },
  pageList: { paddingHorizontal: 10, gap: 10 },
  pageBox: { height: hp(14), width: 80, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  pageImage: { height: '90%', width: '90%' },
  pageNumber: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', color: '#fff', fontSize: 10, paddingHorizontal: 4 },

  // Bottom Sheet Recipients
  recipientListContent: { marginTop: hp(2), gap: hp(0.5) },
  recipientRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3), height: hp(6) },
  recipientAvatar: { width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  recipientAvatarText: { fontFamily: Fonts.Medium, textTransform: 'uppercase', fontSize: fp(1.6) },
  recipientNameText: { fontFamily: Fonts.Regular, color: Colors.text_primary, fontSize: fp(2) },

  // Bottom Sheet Date Picker
  datePickerContainer: { marginTop: hp(1) },
  dateRowPressable: { height: hp(5), justifyContent: 'center' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { flex: 1, fontFamily: Fonts.Regular, fontSize: fp(1.8) },

  // Bottom Sheet Color Picker
  colorSection: { marginTop: hp(2) },
  colorTitle: { fontFamily: Fonts.Medium, fontSize: fp(1.8) },
  colorTitleMore: { fontFamily: Fonts.Medium, fontSize: fp(1.8), marginBottom: hp(1.5) },
  basicColorRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: wp(2), marginTop: hp(1.5) },
  basicColorPressable: { flex: 1, borderWidth: 1.5, padding: 1 },
  colorBox: { height: hp(3.5), borderWidth: 1, borderColor: Colors.border, justifyContent: "center", alignItems: 'center' },
  allColorPressable: { flex: 1, aspectRatio: 1, marginBottom: wp(1), padding: 1, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  allColorBox: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }
});