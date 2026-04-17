import AppButton from '@components/AppButton';
import AppInput from '@components/AppInput';
import { useAppDispatch } from '@redux/hooks';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { Trash, Upload, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, PermissionsAndroid, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import api from '@utils/api';
import Toast from 'react-native-toast-message';


const StampPad = ({ userId, userName, onSave, onClose }) => {

    const dispatch = useAppDispatch();
    const [fullName, setFullName] = useState(userName);
    const [activeTab, setActiveTab] = useState('Draw');
    const tabs = ['Upload'];
    const [image, setImage] = useState(null);

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
        try {
            let base64Img = null;
            const filePath = image.uri;
            const base64Data = await RNFS.readFile(filePath, 'base64');
            base64Img = `data:${image.type};base64,${base64Data}`;
            await uploadStamp(base64Img);
        } catch (err) {
            Alert.alert('Error', err);
        }
    }

    const uploadStamp = async (base64) => {
        dispatch(showLoader('Uploading'));
        try {
            const requestData = {
                user: userId,
                stamp: base64,
            };

            const res = await api.post(`/api/stamp`, requestData);

            let fieldData = {};
            if (res?.status === 200) {
                fieldData.id = res?.data?.stamp?.stamp_id;
                fieldData.base_url = res?.data?.stamp?.stamp;
            }

            onSave(fieldData);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Stamp uploaded successfully',
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
                <Text style={styles.header}>Adopt you stamp</Text>
            </View>
            <AppInput label="Full Name" placeholder='Enter full name' value={fullName} onChangeText={setFullName} />



            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2), padding: wp(1.5), backgroundColor: Colors.background_light }}>
                {tabs.map((item, index) => {
                    const isActive = activeTab === item;

                    return (
                        <Pressable
                            key={index}
                            onPress={() => {
                                // setImage(null);
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
            </View> */}
            <View style={{ flex: 1 }}>

                <View style={{ paddingVertical: hp(2) }}>

                    <View style={styles.uploadBox}>
                        {image && <Pressable onPress={() => setImage(null)} style={{ position: 'absolute', right: 0, top: 0, backgroundColor: "rgba(243, 166, 166,0.3)", width: wp(10), height: wp(10), justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: wp(2) }}><Trash color={Colors.error} size={fp(2.5)} /></Pressable>}
                        {image ? <Image source={{ uri: image?.uri }} resizeMode='contain' style={{ width: '80%', height: '80%' }} /> :
                            <TouchableOpacity onPress={() => pickImage()} style={{
                                width: '100%', height: '100%', justifyContent: 'center',
                                alignItems: 'center',
                            }}>

                                <Upload size={fp(4)} color={Colors.text_primary} />
                                <Text style={styles.uploadText}>
                                    Upload Stamp
                                </Text>



                            </TouchableOpacity>

                        }
                    </View>


                    <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.6), color: Colors.text_secondary, marginTop: hp(3) }}>
                        For best results use an image that is 400 x 145 pixels
                    </Text>

                    <Text style={{ fontFamily: Fonts.Regular, fontSize: fp(1.6), color: Colors.text_secondary, marginTop: hp(1), textAlign: 'justify' }}>
                        By clicking Save, I agree that the image above will be the electronic representation of my stamp for all purposes when I (or my agent) use them on documents, including legally binding contracts – just the same as a stamp-and-paper.
                    </Text>
                </View>

            </View>

            <AppButton title={'Save'} onPress={() => {
                uploadFile();
            }} />






        </View>

    );
};

export default StampPad;

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