import React, { useRef, useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
    Alert
} from 'react-native';
import PagerView from 'react-native-pager-view';
import FastImage from 'react-native-fast-image';
import { useForm, Controller } from 'react-hook-form';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Country, State } from 'country-state-city';
import {
    User, Mail, Briefcase, Building, MapPin, Phone, Globe,
    ChevronRight, ShieldCheck, FileSignature, Trash2, Edit3,
    Type, Stamp as StampIcon, Image as ImageIcon, Layout, ChevronDown, Lock, Search,
    ArrowLeft,
    MapPinHouse,
    EyeOff,
    Eye
} from 'lucide-react-native';

// Custom Imports from your project structure
import { Colors, fp, hp, wp } from '@utils/Constants';
import { Fonts } from '@utils/Constants';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import api from '@utils/api';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';
import Toast from 'react-native-toast-message';
import SignaturePad from './canvas/components/SignaturePad';
import InitialPad from './canvas/components/InitialPad';
import StampPad from './canvas/components/StampPad';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateUser } from '@redux/slices/authSlice';
import { goBack } from '@utils/NavigationUtils';
import AppBottomSheet from '@components/AppBottomSheet';
import DrawerHeader from '@components/DrawerHeader';

// --- Memoized Input Component for Performance ---
const InputField = memo(({ control, name, label, icon: Icon, rules, secureTextEntry = false, ...props }) => {

    const [hidePassword, setHidePassword] = useState(secureTextEntry);

    return (

        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{label}</Text>
                    <View style={[styles.inputWrapper, error && styles.inputError, secureTextEntry && { paddingRight: 0 }]}>
                        {Icon && <Icon size={fp(2.2)} color="#94a3b8" style={styles.inputIcon} />}
                        <TextInput
                            style={styles.textInput}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry={hidePassword}
                            placeholderTextColor="#cbd5e1"
                            {...props}

                        />
                        {secureTextEntry && (
                            <TouchableOpacity
                                onPress={() => setHidePassword(!hidePassword)}
                                style={styles.securityPassword}
                            >
                                {hidePassword ? (
                                    <EyeOff size={20} color={Colors.placeholder} />
                                ) : (
                                    <Eye size={20} color={Colors.placeholder} />
                                )}
                            </TouchableOpacity>
                        )}

                    </View>
                    {error && <Text style={styles.errorText}>{error.message || 'Required'}</Text>}
                </View>
            )}
        />
    )
});

// --- Individual Asset Card Component ---
const AssetCard = memo(({ title, icon: Icon, imageUrl, onEdit, onDelete }) => (
    <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
            <View style={styles.assetTitleRow}>
                <Icon size={fp(2)} color="#64748b" />
                <Text style={styles.assetTitleText}>{title}</Text>
            </View>
            {imageUrl && (
                <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash2 size={fp(2)} color="#ef4444" />
                </TouchableOpacity>
            )}
        </View>
        <View style={styles.assetBody}>
            {imageUrl ? (
                <FastImage
                    style={styles.assetImage}
                    source={{ uri: imageUrl, priority: FastImage.priority.high }}
                    resizeMode={FastImage.resizeMode.contain}
                />
            ) : (
                <View style={styles.emptyAsset}>
                    <Text style={styles.emptyText}>No {title} uploaded</Text>
                </View>
            )}
        </View>
        <TouchableOpacity style={styles.assetFooterBtn} onPress={onEdit}>
            <Edit3 size={fp(1.8)} color="#06b6d4" />
            <Text style={styles.assetFooterText}>{imageUrl ? 'Update' : 'Add'} {title}</Text>
        </TouchableOpacity>
    </View>
));

const ProfilePagerScreen = ({ navigation }) => {

    const user = useAppSelector(state => state?.auth?.user);

    const dispatch = useAppDispatch();

    const {
        id,
        first_name = "",
        last_name = "",
        phone,
        email,
        company_name,
        banner_link,
        logo_link,
        job_title,
        country,
        state,
        time_zone,
        zip,
        address,
        city
    } = user || {};

    const fullName = first_name && last_name ? `${first_name} ${last_name}` : "";
    const initial = (first_name?.slice(0, 1) || "") + (last_name?.slice(0, 1) || "");
    const pagerRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const timezoneRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);
    const [pickerType, setPickerType] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [sigBase64, setSigBase64] = useState("");
    const [initBase64, setInitBase64] = useState("");
    const [stampBase64, setStampBase64] = useState("");
    const [timezones, setTimezones] = useState([]);
    // const [bannerImage, setBannerImage] = useState(banner_link || '');
    // const [logoImage, setLogoImage] = useState(logo_link || '');
    const [stampIntId, setStampIntId] = useState(null);
    const [showPrefilledSignatureModal, setShowPrefilledSignatureModal] = useState(false);
    const [showPrefilledInitialModal, setShowPrefilledInitialModal] = useState(false);
    const [showPrefilledStampModal, setShowPrefilledStampModal] = useState(false);

    const { control, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            job_title: '',
            company_name: '',
            phone: '',
            country: '',
            state: '',
            currentPassword: '',
            newPassword: '',
            time_zone: '',
            zip: '',
            address: '',
            city: ''
        }
    });

    const {
        control: passwordControl,
        handleSubmit: handlePasswordSubmit,
        reset: resetPasswordForm,
    } = useForm({
        defaultValues: {
            old_password: '',
            new_password: '',
        },
    });


    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                job_title: user.job_title || '',
                company_name: user.company_name || '',
                phone: user.phone || '',
                country: user.country || '',
                state: user.state || '',
                city: user.city || '',
                address: user.address || '',
                zip: user.zip || '',
                time_zone: user.time_zone || '',

            });


        }
    }, [user]);


    const fetchAllAssetsAtOnce = async () => {
        if (!user) return
        dispatch(showLoader('Fetching'));


        try {
            const [sigRes, initRes, stampRes, timezoneRes] = await Promise.allSettled([
                api.get(`/api/signature?user=${id}`),
                api.get(`/api/initial?user=${id}`),
                api.get(`/api/stamp?user=${id}`),
                api.get('/info/timezones')
            ]);

            if (sigRes.status === 'fulfilled' && sigRes.value.data.status_code === 200) {
                setSigBase64(sigRes.value.data.signature?.signature || "");
            }

            if (initRes.status === 'fulfilled' && initRes.value.data.status_code === 200) {
                setInitBase64(initRes.value.data.initial?.initial || "");
            }

            if (stampRes.status === 'fulfilled' && stampRes.value.data.status_code === 200) {
                const stamps = stampRes.value.data.stamps || [];
                if (stamps.length > 0) {
                    const lastItem = stamps[stamps.length - 1];
                    setStampBase64(lastItem.stamp || "");
                    setStampIntId(lastItem.id);
                }
            }

            if (timezoneRes.status === 'fulfilled' && timezoneRes.value.data.status_code === 200) {

                setTimezones(timezoneRes.value.data.time_zone) || [];
            }
        } catch (e) {

            Toast.show({ type: 'error', text1: e?.message });

            console.log("Fetch error", e);
        } finally {
            dispatch(hideLoader());
        }
    };

    const handleDelete = async (type) => {
        dispatch(showLoader('Deleting'));

        const endpoint = type === 'stamp' ? '/api/stamp' : type === 'banner' ? '/auth/banner' : type === 'logo' ? '/auth/logo' : `/api/${type}`;
        const body = type === 'stamp' ? { id: stampIntId } : { user: id };

        try {
            const res = await api.delete(`${endpoint}`, {

                data: body
            });

            if (res.data.status_code === 200) {
                Toast.show({ type: 'success', text1: res.data.message });
                // Alert.alert("Success", res.data.message);
                if (type === 'signature') setSigBase64("");
                if (type === 'initial') setInitBase64("");
                if (type === 'stamp') setStampBase64("");
                if (type === 'banner') dispatch(updateUser({ banner_link: null }));
                if (type === 'logo') dispatch(updateUser({ logo_link: null }));
            } else {
                Toast.show({ type: 'error', text1: res.data.message });


            }
        } catch (e) {
            Toast.show({ type: 'error', text1: e?.message });


        } finally {
            dispatch(hideLoader());

        }
    };

    useEffect(() => {
        fetchAllAssetsAtOnce();
    }, []);


    const onPassSubmit = async (data) => {
        dispatch(showLoader('Updating'))
        try {
            const request_data = {
                ...data,
                email,
            };

            const response = await api.post(
                '/auth/change/password',
                request_data
            );

            if (response.data.status_code === 200) {

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data.message,
                });
                resetPasswordForm();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Something went wrong',
                });

            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });

        } finally {
            dispatch(hideLoader());
        }
    };

    const onSubmit = async (formData) => {

        dispatch(showLoader('Loading'));


        const request_data = {
            ...formData,
            email: email,
        };

        try {
            const response = await api.post('/auth/profile', request_data);
            const data = response?.data;

            if (data?.status_code === 200) {

                dispatch(updateUser(data?.user));


                dispatch(hideLoader());
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: data.message || 'Profile updated successfully!',
                });
            } else {

                dispatch(hideLoader());
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data.message || 'Something went wrong',
                });
            }
        } catch (error) {

            dispatch(hideLoader());
            console.log('Profile Update Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Network request failed',
            });
        }
    };



    const selectedCountry = watch('country');
    const selectedTimezone = watch('time_zone');
    const allCountries = useMemo(() => Country.getAllCountries(), []);
    // console.log(allCountries)
    const allStates = useMemo(() => {
        const countryTemp = allCountries?.find(
            c => c.name === selectedCountry
        );



        return countryTemp ? State.getStatesOfCountry(countryTemp.isoCode) : []
    }

        ,
        [selectedCountry]
    );



    // Search Logic
    const filteredData = useMemo(() => {
        const data = pickerType === 'country' ? allCountries : allStates;
        if (!searchQuery) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.isoCode.toLowerCase().includes(query)
        );
    }, [searchQuery, pickerType, allCountries, allStates]);

    const openPicker = useCallback((type) => {
        setSearchQuery('');
        setPickerType(type);
        bottomSheetRef.current?.expand();
    }, []);

    const onSelectTimezone = useCallback((item) => {

        setValue('time_zone', item?.time_zone);
        timezoneRef.current?.close();


    }, [setValue]);
    const onSelectLocation = useCallback((item) => {
        if (pickerType === 'country') {
            setValue('country', item.name);
            // console.log(item.name)
            setValue('state', '');
        } else {
            // console.log(item.name)
            setValue('state', item.name);
        }
        bottomSheetRef.current?.close();
    }, [pickerType, setValue]);

    const handleTabPress = (index) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };


    const onAddBanner = async () => {

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) return;

            if (response.errorCode) {
                Toast.show({ type: 'error', text1: 'Error', text2: response.errorMessage });
                return;
            }

            const selectedImage = response?.assets[0];


            if (selectedImage.fileSize >= 2100000) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Image file size should be less than 2MB!',
                });
                return;
            }


            const formData = new FormData();

            // console.log(selectedImage)


            formData.append('file', {
                uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
                type: selectedImage.type,
                name: selectedImage.fileName.replace(/^\s+|\s+$/g, ""),
            });

            formData.append('user', id);


            dispatch(showLoader('Loading'));

            try {

                const apiResponse = await api.put('/auth/banner', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const data = apiResponse?.data;

                // 5. Hide Loader
                dispatch(hideLoader());

                if (data.status_code === 200) {
                    // Update Local State/Store


                    dispatch(updateUser({ banner_link: data?.image }));


                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: data.message || 'Banner updated successfully!',
                    });


                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: data.message,
                    });
                }
            } catch (error) {
                // console.log(error)
                dispatch(hideLoader());
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Network request failed',
                });
            }
        });
    };

    const onAddLogo = async () => {

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) return;

            if (response.errorCode) {
                Toast.show({ type: 'error', text1: 'Error', text2: response.errorMessage });
                return;
            }

            const selectedImage = response?.assets[0];


            if (selectedImage.fileSize >= 2100000) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Image file size should be less than 2MB!',
                });
                return;
            }


            const formData = new FormData();

            // console.log(selectedImage)


            formData.append('file', {
                uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
                type: selectedImage.type,
                name: selectedImage.fileName.replace(/^\s+|\s+$/g, ""),
            });

            formData.append('user', id);


            dispatch(showLoader('Loading'));

            try {

                const apiResponse = await api.put('/auth/logo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const data = apiResponse?.data;


                dispatch(hideLoader());

                if (data.status_code === 200) {


                    dispatch(updateUser({ logo_link: data?.image }));


                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: data.message || 'Logo updated successfully!',
                    });


                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: data.message,
                    });
                }
            } catch (error) {
                // console.log(error)
                dispatch(hideLoader());
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Network request failed',
                });
            }
        });
    };

    const renderBackdrop = useCallback(props => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ), []);

    if (!user) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.headerContainer}>
                <TouchableOpacity onPress={goBack}><ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} /></TouchableOpacity>
                <Text style={styles.title}>Profile</Text>
                <View></View>
            </View> */}
            <DrawerHeader navigation={navigation} title="Profile" />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}><Text style={styles.avatarText}>{initial}</Text></View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.userNameText}>{fullName}</Text>
                        <Text style={styles.userRoleText}>{job_title}</Text>
                    </View>
                </View>

                {/* Tab Bar Navigation */}
                <View style={styles.tabBar}>
                    {[
                        { id: 0, label: 'Profile', icon: User },
                        { id: 1, label: 'Assets', icon: FileSignature },
                        { id: 2, label: 'Security', icon: ShieldCheck }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity key={tab.id} onPress={() => handleTabPress(tab.id)} style={[styles.tabItem, isActive && styles.activeTabItem]}>
                                <Icon size={fp(2)} color={isActive ? '#06b6d4' : '#64748b'} />
                                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    ref={pagerRef}
                    onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
                >
                    {/* TAB 1: PROFILE DETAILS */}
                    <View key="1">
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}><InputField control={control} name="first_name" label="First Name*" rules={{ required: 'Required' }} /></View>
                                <View style={{ width: wp(4) }} />
                                <View style={{ flex: 1 }}><InputField control={control} name="last_name" label="Last Name*" rules={{ required: 'Required' }} /></View>
                            </View>

                            <InputField control={control} name="email" label="Email Address" icon={Mail} editable={false} />
                            <InputField control={control} name="job_title" label="Job Title*" icon={Briefcase} rules={{ required: 'Required' }} />
                            <InputField control={control} name="company_name" label="Company" icon={Building} />
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Country</Text>
                                    <TouchableOpacity style={styles.inputWrapper} onPress={() => openPicker('country')}>
                                        <Globe size={fp(2.2)} color="#94a3b8" />
                                        <Text style={styles.pickerText} numberOfLines={1}>
                                            {watch('country') || 'Select'}
                                        </Text>
                                        <ChevronDown size={fp(2)} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: wp(4) }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TouchableOpacity style={styles.inputWrapper} onPress={() => openPicker('state')}>
                                        <MapPin size={fp(2.2)} color="#94a3b8" />
                                        <Text style={styles.pickerText} numberOfLines={1}>
                                            {watch('state') || 'Select'}
                                        </Text>
                                        <ChevronDown size={fp(2)} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <InputField control={control} name="city" label="City*" icon={Briefcase} rules={{ required: 'Required' }} />
                            <InputField control={control} name="address" label="Address*" icon={MapPinHouse} rules={{ required: 'Required' }} />
                            <InputField control={control} name="zip" label="Postal Code / Zip*" icon={Briefcase} rules={{ required: 'Required' }} />





                            <InputField control={control} name="phone" label="Phone" icon={Phone} keyboardType="phone-pad" />

                            <View>
                                <Text style={styles.inputLabel}>Timezone*</Text>
                                <TouchableOpacity style={styles.inputWrapper} onPress={() => timezoneRef?.current?.snapToIndex(0)}>
                                    <MapPin size={fp(2.2)} color="#94a3b8" />
                                    <Text style={styles.pickerText} numberOfLines={1}>
                                        {selectedTimezone || 'Select'}
                                    </Text>
                                    <ChevronDown size={fp(2)} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSubmit(onSubmit)}>
                                <Text style={styles.saveProfileBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* TAB 2: ASSETS MANAGEMENT */}
                    <View key="2">
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            <AssetCard title="Signature" icon={FileSignature} imageUrl={sigBase64} onDelete={() => handleDelete('signature')} onEdit={() => setShowPrefilledSignatureModal(true)} />
                            <AssetCard title="Initial" icon={Type} imageUrl={initBase64} onDelete={() => handleDelete('initial')} onEdit={() => setShowPrefilledInitialModal(true)} />
                            <AssetCard title="Stamp" icon={StampIcon} imageUrl={stampBase64} onDelete={() => handleDelete('stamp')} onEdit={() => setShowPrefilledStampModal(true)} />
                            <AssetCard title="Logo" icon={ImageIcon} imageUrl={logo_link} onDelete={() => handleDelete('logo')} onEdit={onAddLogo} />
                            <AssetCard title="Banner" icon={Layout} imageUrl={banner_link} onDelete={() => handleDelete('banner')} onEdit={onAddBanner} />
                        </ScrollView>
                    </View>

                    {/* TAB 3: PASSWORD & SECURITY */}
                    <View key="3">
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <Text style={styles.tabTitle}>Security Settings</Text>
                            <InputField control={passwordControl} name="old_password" label="Current Password" rules={{ required: 'Required' }} icon={Lock} secureTextEntry />
                            <InputField control={passwordControl} name="password" label="New Password" rules={{ required: 'Required' }} icon={Lock} secureTextEntry />
                            <TouchableOpacity style={styles.saveProfileBtn} onPress={handlePasswordSubmit(onPassSubmit)}>
                                <Text style={styles.saveProfileBtnText}>Update Password</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </PagerView>

                {/* --- Searchable Bottom Sheet --- */}


            </KeyboardAvoidingView>


            {showPrefilledSignatureModal && (
                <View style={styles.overlay}>
                    <SignaturePad userId={id} userName={fullName} onClose={() => { setShowPrefilledSignatureModal(false); }} onSave={(data) => { setShowPrefilledSignatureModal(false); setSigBase64(data?.base_url) }} />
                </View>
            )}

            {showPrefilledInitialModal && (
                <View style={styles.overlay}>
                    <InitialPad userId={id} userName={initial} onClose={() => { setShowPrefilledInitialModal(false); }} onSave={(data) => { setShowPrefilledInitialModal(false); setInitBase64(data?.base_url) }} />
                </View>
            )}

            {showPrefilledStampModal && (
                <View style={styles.overlay}>
                    <StampPad userId={id} userName={fullName} onClose={() => { setShowPrefilledStampModal(false); }} onSave={(data) => { setShowPrefilledStampModal(false); setStampBase64(data?.base_url) }} />
                </View>
            )}

            <AppBottomSheet ref={bottomSheetRef} snapPoints={['100%']} title={''}>

                <View style={styles.sheetContainer}>
                    <View style={styles.searchWrapper}>
                        <Search size={fp(2)} color="#94a3b8" style={{ marginRight: wp(2) }} />
                        <TextInput
                            style={styles.sheetSearchInput}
                            placeholder="Search..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <BottomSheetFlatList
                        data={filteredData}
                        keyExtractor={(item) => item.isoCode + item.name}
                        initialNumToRender={20}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.sheetItem} onPress={() => onSelectLocation(item)}>
                                <Text style={styles.sheetItemText}>{item.name}</Text>
                                <Text style={styles.isoCodeText}>{item.isoCode}</Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: hp(5) }}
                    />
                </View>

            </AppBottomSheet>

            <AppBottomSheet ref={timezoneRef} snapPoints={['100%']} title={'Select Timezone'}>

                <View style={styles.sheetContainer}>
                    {/* <View style={styles.searchWrapper}>
                        <Search size={fp(2)} color="#94a3b8" style={{ marginRight: wp(2) }} />
                        <TextInput
                            style={styles.sheetSearchInput}
                            placeholder="Search..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View> */}
                    <BottomSheetFlatList
                        data={timezones}
                        keyExtractor={(item) => item?.id}
                        initialNumToRender={20}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.sheetItem} onPress={() => onSelectTimezone(item)}>
                                <Text style={styles.sheetItemText}>{item.time_zone}</Text>
                                {/* <Text style={styles.isoCodeText}></Text> */}
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: hp(5) }}
                    />
                </View>

            </AppBottomSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', padding: wp(6), alignItems: 'center' },
    avatarContainer: { width: wp(14), height: wp(14), borderRadius: wp(7), backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontSize: fp(2.2), fontFamily: Fonts.Bold },
    headerInfo: { marginLeft: wp(4) },
    userNameText: { fontSize: fp(2.2), fontFamily: Fonts.Bold, color: '#0f172a' },
    userRoleText: { fontSize: fp(1.5), fontFamily: Fonts.Regular, color: '#64748b' },

    tabBar: { flexDirection: 'row', marginHorizontal: wp(5), backgroundColor: '#f1f5f9', borderRadius: wp(4), padding: wp(1.2), marginBottom: hp(1) },
    tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: hp(1.2), borderRadius: wp(3), gap: wp(1) },

    activeTabItem: { backgroundColor: 'white', elevation: 2, shadowOpacity: 0.1 },

    tabLabel: { fontSize: fp(1.5), fontFamily: Fonts.SemiBold, color: '#64748b' },
    activeTabLabel: { color: '#0f172a' },

    pagerView: { flex: 1 },
    scrollContent: { padding: wp(5) },
    row: { flexDirection: 'row', marginBottom: hp(1) },
    tabTitle: { fontSize: fp(2), fontFamily: Fonts.Bold, color: '#1e293b', marginBottom: hp(2) },

    inputContainer: { marginBottom: hp(2) },
    inputLabel: { fontSize: fp(1.5), fontFamily: Fonts.Medium, color: '#475569', marginBottom: hp(0.5) },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: wp(3), borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: wp(3), height: hp(6.2) },
    inputIcon: { marginRight: wp(2) },
    textInput: { flex: 1, color: '#0f172a', fontSize: fp(1.7), fontFamily: Fonts.Regular },
    pickerText: { flex: 1, color: '#0f172a', fontSize: fp(1.7), fontFamily: Fonts.Regular, marginLeft: wp(1) },
    inputError: { borderColor: '#ef4444' },
    errorText: { color: '#ef4444', fontSize: fp(1.3), marginTop: 4, fontFamily: Fonts.Regular },

    assetCard: { backgroundColor: 'white', borderRadius: wp(4), borderWidth: 1, borderColor: '#e2e8f0', marginBottom: hp(2), overflow: 'hidden' },
    assetHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: wp(4), borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    assetTitleRow: { flexDirection: 'row', alignItems: 'center' },
    assetTitleText: { marginLeft: wp(2), fontSize: fp(1.7), fontFamily: Fonts.SemiBold, color: '#475569' },
    assetBody: { height: hp(18), justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfcfc' },
    assetImage: { width: '85%', height: '85%' },
    emptyAsset: { padding: wp(5) },
    emptyText: { color: '#cbd5e1', fontSize: fp(1.6), fontFamily: Fonts.Regular },
    assetFooterBtn: { paddingVertical: hp(1.5), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    assetFooterText: { marginLeft: wp(2), color: '#06b6d4', fontFamily: Fonts.Bold, fontSize: fp(1.5) },

    saveProfileBtn: { backgroundColor: '#06b6d4', height: hp(6.5), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', marginTop: hp(2) },
    saveProfileBtnText: { color: 'white', fontSize: fp(1.8), fontFamily: Fonts.Bold },

    sheetContainer: { flex: 1, marginTop: hp(2) },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: wp(3), paddingHorizontal: wp(3), marginBottom: hp(2), marginTop: hp(1) },
    sheetSearchInput: { flex: 1, height: hp(5.5), fontSize: fp(1.7), fontFamily: Fonts.Regular, color: '#0f172a' },
    sheetItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: hp(2), borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    sheetItemText: { fontSize: fp(1.7), fontFamily: Fonts.Regular, color: '#1e293b' },
    isoCodeText: { fontSize: fp(1.4), color: '#94a3b8', fontFamily: Fonts.Medium },
    overlay: { position: 'absolute', top: 0, left: 0, height: hp(100), backgroundColor: Colors.white, width: wp(100), padding: wp(5) },
    title: { fontSize: fp(2.2), fontFamily: Fonts.SemiBold, color: Colors.text_primary, letterSpacing: 0.5 },
    headerContainer: { height: hp(7), flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(5), backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, gap: wp(5) },
    securityPassword: { height: '100%', width: wp(12), justifyContent: 'center', alignItems: 'center' }
});

export default ProfilePagerScreen;