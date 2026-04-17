import AppButton from '@components/AppButton';
import AppInput from '@components/AppInput';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { Trash, Upload, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, PermissionsAndroid, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Signature from 'react-native-signature-canvas';
import RNFS from 'react-native-fs';
import api from '@utils/api';
import Toast from 'react-native-toast-message';

const uploading_base64_signature_border_box =
    "data:image/png;base64,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";
const uploading_base64_initial_border_box =
    "data:image/png;base64,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";


const InitialPad = ({ userId, userName, onSave, onClose }) => {



    const dispatch = useAppDispatch();
    const [fullName, setFullName] = useState(userName);

    const ref = useRef();

    const [activeTab, setActiveTab] = useState('Draw');

    // const tabs = ['Draw', 'Choose', 'Upload'];
    const tabs = ['Draw', 'Upload'];



    const [image, setImage] = useState(null);

    const handleOK = async (sig) => {
        // console.log("Base64:", sig);
        await uploadInitial(sig);
    };

    const requestPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };
    const pickImage = async () => {
        const hasPermission = await requestPermission();

        if (!hasPermission) {
            console.log('Permission denied');
            return;
        }

        launchImageLibrary(
            { mediaType: 'photo', selectionLimit: 1 },
            (response) => {
                if (response.didCancel) {
                    console.log('User cancelled');
                } else if (response.errorCode) {
                    console.log('Error:', response.errorMessage);
                } else {
                    const asset = response.assets?.[0]; // 👈 only first image
                    if (asset) {
                        setImage(asset);
                        console.log('Selected:', asset);
                    }
                }
            }
        );
    };


    const uploadFile = async () => {



        if (activeTab === 'Draw') {
            ref.current.readSignature();
            return;
        }


        try {

            let base64Img = null;
            const filePath = image.uri;
            const base64Data = await RNFS.readFile(filePath, 'base64');
            base64Img = `data:${image.type};base64,${base64Data}`;
            await uploadInitial(base64Img);

        } catch (err) {


            Alert.alert('Error', err);
        }
    }


    const uploadInitial = async (base64) => {
        dispatch(showLoader('Uploading'));
        try {
            const requestData = {
                user: userId,
                initial: base64,
            };

            const res = await api.post(`/api/initial`, requestData);

            let fieldData = {};
            if (res?.status === 200) {
                fieldData.id = res?.data?.initial?.initial_id;
                fieldData.base_url = res?.data?.initial?.initial;
            }

            onSave(fieldData);

            console.log(fieldData)


            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Initial uploaded successfully',

            });

        } catch (err) {

            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: 'Please try again',
            });

        } finally {
            dispatch(hideLoader());
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ marginBottom: hp(3), flexDirection: "row", gap: wp(3), alignItems: "center" }}>

                <Pressable onPress={() => onClose()}>

                    <X size={fp(3)} color={Colors.text_primary} />
                </Pressable>
                <Text style={styles.header}>Adopt you initial</Text>
            </View>
            <AppInput label="Initial" placeholder='Enter full name' value={fullName} onChangeText={setFullName} />

            {/* <View style={{ height: hp(10), marginVertical: hp(3), flexDirection: 'row', padding: wp(2) }}>
              <Pressable style={{backgroundColor:Colors.primary_light, flex: 1,}}>
                  <View style={{ flex: 1 , borderWidth:1.5,borderRadius:wp(2), borderColor:Colors.primary_dark,position:"relative",justifyContent:'center',alignItems:"center",borderRightWidth:0}}>
                  <Text style={{position:'absolute',left:'20%',top:-10,width:'80%',backgroundColor:Colors.white}}>
                      Wesigned by:
                  </Text>

                  <Text style={{position:'absolute',left:'20%',bottom:-10,width:'80%',backgroundColor:Colors.white}}>
                      ShG7Hx97djud...
                  </Text>

                  
                  <Image source={{uri:uploading_base64_signature_border_box}} style={{width:wp(30),height:wp(30)}} resizeMode='contain'/>
              </View>
              </Pressable>
              

              <Pressable >
                  
  <View style={{flex:1,justifyContent:'center',alignItems:"center"}}>
                  <Image source={{uri:uploading_base64_signature_border_box}} style={{width:wp(30),height:wp(30)}} resizeMode='contain'/>
             
              </View>
              </Pressable>
           

          </View> */}


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2), padding: wp(1.5), backgroundColor: Colors.background_light }}>
                {tabs.map((item, index) => {
                    const isActive = activeTab === item;

                    return (
                        <Pressable
                            key={index}
                            onPress={() => {
                                setImage(null);
                                // setSignature(null);
                                setActiveTab(item);
                            }}
                            style={{
                                paddingVertical: wp(2.5),
                                paddingHorizontal: wp(2),
                                backgroundColor: isActive ? Colors.white : 'transparent',
                                elevation: isActive ? 1 : 0,
                                borderRadius: 7,
                                flex: 1,
                                justifyContent: 'center'

                            }}
                        >
                            <Text
                                style={{
                                    fontSize: fp(1.8),
                                    color: isActive ? Colors.text_primary : '#777',
                                    // fontWeight: isActive ? '600' : '400',
                                    fontFamily: isActive ? Fonts.Medium : Fonts.Regular,
                                    textAlign: 'center'
                                }}
                            >
                                {item}
                            </Text>
                        </Pressable>

                    );
                })}
            </View>
            <View style={{ flex: 1 }}>


                {activeTab === "Draw" &&
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', marginVertical: hp(2) }}>
                            <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.9), flex: 1 }}>
                                Draw you Initial
                            </Text>

                            <TouchableOpacity onPress={() => { ref.current.clearSignature(); }}>
                                <Text style={{ fontFamily: Fonts.SemiBold, color: Colors.error }}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: hp(30) }}>
                            <Signature
                                ref={ref}
                                onOK={handleOK}
                                // onEnd={() =>ref.current.readSignature()}
                                descriptionText="Sign here"
                                clearText="Clear"
                                confirmText="Save"

                                autoClear={false}
                                webStyle={`
      .m-signature-pad--footer {display: none; margin: 0px;}
      body,html { height: 100%; }
    `}
                                style={{ flex: 1 }}
                            />
                        </View>

                    </View>

                }

                {activeTab === "Upload" && <View style={{ paddingVertical: hp(2) }}>

                    <View style={styles.uploadBox}>
                        {image && <Pressable onPress={() => setImage(null)} style={{ position: 'absolute', right: 0, top: 0, backgroundColor: "rgba(243, 166, 166,0.3)", width: wp(10), height: wp(10), justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: wp(2) }}><Trash color={Colors.error} size={fp(2.5)} /></Pressable>}
                        {image ? <Image source={{ uri: image?.uri }} resizeMode='contain' style={{ width: '80%', height: '80%' }} /> :
                            <TouchableOpacity onPress={() => pickImage()} style={{
                                width: '100%', height: '100%', justifyContent: 'center',
                                alignItems: 'center',
                            }}>

                                <Upload size={fp(4)} color={Colors.text_primary} />
                                <Text style={styles.uploadText}>
                                    Upload Initial
                                </Text>



                            </TouchableOpacity>

                        }
                    </View>


                    <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.6), color: Colors.text_secondary, marginTop: hp(3) }}>
                        For best results use an image that is 400 x 145 pixels
                    </Text>

                    <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.6), color: Colors.text_secondary, marginTop: hp(1), textAlign: 'justify' }}>
                        By selecting Adopt and Sign, I agree that the signature and initials will be the electronic representation of my signature and initials for all purposes when I (or my agent) use them on documents, including legally binding contracts - just the same as a pen-and-paper signature or initial.
                    </Text>
                </View>}

            </View>

            <AppButton title={'Save'} onPress={() => {
                uploadFile();
            }} />






        </View>

    );
};

export default InitialPad;

const styles = StyleSheet.create({
    header: {
        fontFamily: Fonts.Bold,
        fontSize: fp(2.3),
        color: Colors.text_primary,

    },
    uploadBox: {
        height: hp(30),
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        borderRadius: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden'
    },

    uploadText: {
        marginTop: 8,
        fontSize: fp(2),
        fontFamily: Fonts.Medium,
        color: Colors.text_primary,
    },
})