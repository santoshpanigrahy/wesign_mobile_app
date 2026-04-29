import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  EllipsisVertical,
  Save,
  Trash,
  Upload,
} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';
import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import api from '@utils/api';
import {goBack, navigate} from '@utils/NavigationUtils';
import AppBottomSheet from '@components/AppBottomSheet';
import ConfirmExitModal from '@components/ConfirmExitModal';
import {Portal} from '@gorhom/portal';
import AppButton from '@components/AppButton';
import {hideLoader, showLoader} from '@redux/slices/loaderSlice';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
// import { authorize } from 'react-native-app-auth';

const validTypes = [
  'image/gif',
  'image/tiff',
  'image/tif',
  'image/TIF',
  'image/bmp',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-excel',
  'application/excel',
  'application/x-excel',
  'application/x-msexcel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'text/html',
  'image/jpg',
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/doc',
  'application/ms-doc',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const FILE_ICONS = {
  PDF: require('@assets/icons/pdf.png'),
  DOC: require('@assets/icons/doc.png'),
  DOCX: require('@assets/icons/doc.png'),
  CSV: require('@assets/icons/sheets.png'),
  XLS: require('@assets/icons/sheets.png'),
  XLSX: require('@assets/icons/sheets.png'),
  TXT: require('@assets/icons/file.png'),
  IMG: require('@assets/icons/img.png'),
  DEFAULT: require('@assets/icons/file.png'),
};

const FILE_TYPE_MAP = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'DOCX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
};

// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import RNFS from 'react-native-fs';
import {
  deleteDocumentByIndex,
  removeErrorDocuments,
  resetEnvelope,
  setDocuments,
  setEnableWritingID,
  updateDocumentByIndex,
} from '@redux/slices/envelopeSlice';
import AppToggleButton from '@components/AppToggleButton';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {launchImageLibrary} from 'react-native-image-picker';

const configureGoogleDrive = () => {
  // GoogleSignin.configure({
  //   // This scope is MANDATORY to read files from Drive
  //   scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  //   // You get this ID from the Google Cloud Console
  //   // webClientId: '396564745764-lk21f8ddr1nshcp3gsbqtkvjj692e5tt.apps.googleusercontent.com',
  //   webClientId: '396564745764-disnuci9msclu3j7i3r9knke7b9qtr9f.apps.googleusercontent.com',
  //   offlineAccess: true,
  // });
};

const dropboxAuthConfig = {
  clientId: 'fzhtxlkmaxm5awm',
  redirectUrl: 'com.wesign://auth',
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token',
  },
};

const UploadScreen = () => {
  const userId = useAppSelector(state => state.auth.user?.id);
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]);
  // const dispatch = useAppDispatch()

  useEffect(() => {
    configureGoogleDrive();
  }, []);

  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  const pickImages = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 0, // unlimited selection
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled');
        } else if (response.errorCode) {
          console.log('Error:', response.errorMessage);
        } else {
          sheetRef?.current?.close();

          const files =
            response.assets?.map(asset => ({
              uri: asset.uri,
              name: asset.fileName,
              type: asset.type,
              size: asset.fileSize,
            })) || [];

          if (files.length > 0) {
            handleUpload(files);
            console.log('Selected Images:', files);
          }
        }
      },
    );
  };

  const fetchGoogleDrivePDFs = async () => {
    // try {
    //   // 1. Ensure the device supports Google Play Services (Android)
    //   await GoogleSignin.hasPlayServices();
    //   // 2. Prompt the user to log in and authorize wesign
    //   const userInfo = await GoogleSignin.signIn();
    //   // 3. Get the access token to use with the Drive API
    //   const tokens = await GoogleSignin.getTokens();
    //   const accessToken = tokens.accessToken;
    //   if (!accessToken) {
    //     throw new Error('No access token received');
    //   }
    //   setGoogleAccessToken(accessToken)
    //   const response = await fetch(
    //     'https://www.googleapis.com/drive/v3/files?q=mimeType="application/pdf"&fields=files(id,name,mimeType)',
    //     {
    //       method: 'GET',
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //         Accept: 'application/json',
    //       },
    //     }
    //   );
    //   const data = await response.json();
    //   if (data.files && data.files.length > 0) {
    //     console.log('Found PDFs:', data.files);
    //     return data.files;
    //   } else {
    //     console.log('No PDFs found in this Drive.');
    //     GoogleSignin.signOut();
    //     return [];
    //   }
    // } catch (error) {
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     console.log('User cancelled the login flow');
    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     console.log('Sign in is already in progress');
    //   } else {
    //     console.error('Error fetching from Google Drive:', error);
    //   }
    // }
  };

  const handleDriveLogin = async () => {
    return;
    sheetRef?.current?.close();
    try {
      // if (googleDriveFiles?.length === 0 && !googleAccessToken) {

      const driveFiles = await fetchGoogleDrivePDFs();
      setGoogleDriveFiles(driveFiles);

      // }

      googleDriveRef?.current?.snapToIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFileFromDrive = async (file, accessToken) => {
    const localPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;

    const options = {
      fromUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      toFile: localPath,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      begin: res => {
        console.log('Download started. Content Length:', res.contentLength);
      },
      progress: res => {
        let progressPercent = (res.bytesWritten / res.contentLength) * 100;
        // console.log(`Download Progress: ${progressPercent.toFixed(2)}%`);
      },
    };

    try {
      // Start the download and wait for the promise to resolve
      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        console.log('File successfully downloaded to:', localPath);
        return localPath;
      } else {
        console.error('Download failed with status code:', response.statusCode);
        return null;
      }
    } catch (error) {
      console.error('Error downloading from Drive via RNFS:', error);
      return null;
    }
  };

  const handleDriveFileSelect = async (driveFile, accessToken) => {
    googleDriveRef?.current?.close();
    dispatch(showLoader('Uploading'));
    try {
      const localPath = await downloadFileFromDrive(driveFile, accessToken);

      if (localPath) {
        const fileStats = await RNFS.stat(localPath);
        const actualSizeInBytes = fileStats.size;

        const formattedFile = {
          uri: `file://${localPath}`,
          name: driveFile.name,
          type: 'application/pdf',
          size: actualSizeInBytes || 0,
        };

        await handleUpload([formattedFile]);

        // GoogleSignin.signOut();
        setGoogleAccessToken(null);
        setGoogleDriveFiles([]);
      }
    } catch (error) {
      console.error('Failed to process Drive file:', error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const renderGoogleDriveFileItem = ({item}) => (
    <TouchableOpacity
      style={styles.cloundFileWrapper}
      onPress={() => handleDriveFileSelect(item, googleAccessToken)}>
      <Image
        source={require('@assets/icons/pdf.png')}
        style={{width: wp(8), height: wp(12)}}
      />
      <Text style={styles.cloundFileName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDropboxFileItem = ({item}) => (
    <TouchableOpacity
      style={styles.cloundFileWrapper}
      onPress={() => handleDropboxFileSelect(item)}>
      <Image
        source={require('@assets/icons/pdf.png')}
        style={{width: wp(8), height: wp(12)}}
      />
      <Text style={styles.cloundFileName}>{item.name}</Text>
    </TouchableOpacity>
  );

  //dropbox

  const [dropboxAccessToken, setDropboxAccessToken] = useState(null);
  const [dropboxFiles, setDropboxFiles] = useState([]);
  const dropboxRef = useRef(null);
  const connectAndFetchDropbox = async () => {
    // sheetRef?.current?.close();
    // dispatch(showLoader('Loading'));
    // try {
    //   const authState = await authorize(dropboxAuthConfig);
    //   const token = authState.accessToken;
    //   setDropboxAccessToken(token);
    //   const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       path: "", // Root directory
    //       recursive: true, // Set to true to find PDFs inside subfolders
    //       include_media_info: false,
    //     })
    //   });
    //   const data = await response.json();
    //   if (data.entries && data.entries.length > 0) {
    //     const pdfFiles = data.entries.filter(file =>
    //       file['.tag'] === 'file' && file.name.toLowerCase().endsWith('.pdf')
    //     );
    //     setDropboxFiles(pdfFiles);
    //     dropboxRef?.current?.snapToIndex(0);
    //   } else {
    //     setDropboxFiles([]);
    //   }
    // } catch (error) {
    //   console.error('Dropbox Auth/Fetch Error:', error);
    // } finally {
    //   dispatch(hideLoader());
    // }
  };

  const handleDropboxFileSelect = async file => {
    if (!dropboxAccessToken) return;

    dropboxRef?.current?.close();

    dispatch(showLoader('Loading'));
    console.log(`Downloading ${file.name} from Dropbox...`);

    const localPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
    const dropboxApiArg = JSON.stringify({path: file.path_lower});

    const options = {
      fromUrl: 'https://content.dropboxapi.com/2/files/download',
      toFile: localPath,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        'Dropbox-API-Arg': dropboxApiArg,
      },
      progress: res => {
        let progressPercent = (res.bytesWritten / res.contentLength) * 100;
        console.log(
          `Dropbox Download Progress: ${progressPercent.toFixed(2)}%`,
        );
      },
    };

    try {
      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        console.log('Dropbox file securely downloaded to:', localPath);

        // Await the file stats to ensure we get a real number, not a Promise
        const fileStats = await RNFS.stat(localPath);

        const formattedFile = {
          uri: `file://${localPath}`,
          name: file.name,
          type: 'application/pdf',
          size: fileStats.size,
        };

        // Pass it to your existing upload function as an array
        await handleUpload([formattedFile]);
      } else {
        console.error(
          'Dropbox download failed with status:',
          response.statusCode,
        );
      }
    } catch (error) {
      console.error('Error downloading from Dropbox:', error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const enableEnvelopeId = useAppSelector(
    state => state.envelope?.enable_writing_id,
  );

  const [showExitModal, setShowExitModal] = useState(false);
  // const [enableEnvelopeId,setEnableEnvelopeId] =useState(false)
  const dispatch = useAppDispatch();

  const sheetRef = useRef<any>(null);
  const fileRef = useRef<any>(null);
  const errorFileRef = useRef<any>(null);
  const googleDriveRef = useRef<any>(null);

  const openSheet = () => {
    sheetRef.current?.snapToIndex(0);
  };
  const [documentId, setDocumentId] = useState(null);
  const openFileSheet = index => {
    console.log(index);
    setDocumentId(index);
    fileRef.current?.snapToIndex(0);
  };

  const envelopeDocuments = useAppSelector(
    state => state.envelope.envelopeDocuments,
  );

  const handleBack = () => {
    if (envelopeDocuments.length > 0) {
      setShowExitModal(true);
    } else {
      goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (envelopeDocuments.length > 0) {
          setShowExitModal(true);
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [envelopeDocuments]),
  );

  const handleDocumentPicker = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: ['*/*'],
      });

      sheetRef?.current.close();

      await handleUpload(results);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpload = async files => {
    try {
      const updatedFiles = files.map(file => ({
        ...file,
        progress: 0,
        uploading: true,
        error: null,
        document_id: null,
        document_key: null,
        document_url: null,
        document_name: null,
        snaphots: null,
      }));

      dispatch(setDocuments(updatedFiles));

      files.forEach(async (file, index) => {
        await uploadFile(file, index + envelopeDocuments.length);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      fileRef?.current?.close();
      dispatch(showLoader('Deleting'));
      const doc = envelopeDocuments[documentId];

      console.log(doc);

      const document_key = doc?.document_key;

      const is_file_error = doc?.error;
      console.log(is_file_error, documentId);

      if (is_file_error) {
        dispatch(deleteDocumentByIndex(documentId));

        return;
      }

      const requestData = {
        document_key: [document_key],
        user: userId,
      };

      const res = await api.delete('/api/document', {
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res?.data?.status_code === 200) {
        dispatch(deleteDocumentByIndex(documentId));
      } else {
        console.log('Error:', res?.data?.message);
      }
    } catch (err) {
      console.log('Delete error:', err);
    } finally {
      dispatch(hideLoader());
    }
  };

  const updateFileError = (index, message) => {
    dispatch(
      updateDocumentByIndex({
        index,
        data: {
          uploading: false,
          progress: 0,
          error: message,
        },
      }),
    );
    // setEnvelopeDocuments(prev => {
    //   const updated = [...prev];
    //   updated[index] = {
    //     ...updated[index],
    //     uploading: false,
    //     progress: 0,
    //     error: message,
    //   };
    //   return updated;
    // });
  };

  const uploadFile = async (file, index) => {
    console.log('File===========>', file);

    if (!validTypes.includes(file.type)) {
      updateFileError(index, 'Invalid file type');
      return;
    }
    if (file.size >= 25000000) {
      updateFileError(index, 'File size exceeds 25MB');
      return;
    }

    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });

    formData.append('user', userId);

    try {
      const res = await api.post(
        '/converter/file/upload?ngsw-bypass=true',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},

          onUploadProgress: progressEvent => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );

            updateFileProgress(index, percent);

            // dispatch(setDocuments())
          },
        },
      );

      console.log(res);

      const result = res.data?.result;

      dispatch(
        updateDocumentByIndex({
          index,
          data: {
            document_id: result.document_id,
            document_key: result.document_key,
            document_url: result.document_url,
            document_name: result.document_name.split('.').pop(),
            snaphots: res.data?.snaphots,
          },
        }),
      );

      updateFileProgress(index, 100, false);
    } catch (err) {
      console.log(err);
      updateFileError(index, 'Network Error');
    }
  };

  const updateFileProgress = (index, progress, uploading = true) => {
    dispatch(
      updateDocumentByIndex({
        index,
        data: {
          progress,
          uploading,
        },
      }),
    );
  };

  const formatFileSize = bytes => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileType = file => {
    if (file.type?.startsWith('image/')) return 'IMG';

    return (
      FILE_TYPE_MAP[file.type] ||
      file.name.split('.').pop()?.toUpperCase() ||
      'DEFAULT'
    );
  };
  const getFileIcon = file => {
    const type = getFileType(file);
    return FILE_ICONS[type] || FILE_ICONS.DEFAULT;
  };

  const [errorFiles, setErrorFiles] = useState([]);

  const handleNext = () => {
    // console.log(envelopeDocuments)

    const errorFilesData = envelopeDocuments
      .map((file, index) => ({
        ...file,
        id: index, // ✅ assign index as id
      }))
      .filter(file => file.error);

    if (errorFilesData.length > 0) {
      setErrorFiles(errorFilesData); // store for bottom sheet
      errorFileRef?.current?.snapToIndex(0); // open bottom sheet
      return;
    }

    const document_ids = envelopeDocuments
      .map(doc => doc?.document_key)
      .filter(key => key);

    if (document_ids.length === 0) return;
    dispatch(showLoader('Checking'));
    const request_data = {
      document_ids,
    };

    checkDocumentProcessingStatus(request_data);
  };

  const handleSave = async () => {
    dispatch(showLoader('Saving'));
    var subject = 'Wesign:';

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
      envelope_recepients: [],
      envelope_documents: envelope_documents,
      email_content: {
        subject: subject,
        content: '',
      },
      expiry_date: null,
      enable_comments: false,
      last_changed: moment().utc().format('YYYY-MM-DDTHH:mm:ss'),
      last_viewed: moment().utc().format('YYYY-MM-DDTHH:mm:ss'),
      follow_signing_order: false,
      enable_writing_id: enableEnvelopeId,
      enable_certification: true,
    };

    try {
      const res = await api.post('/api/envelope', request_data);

      if (res?.status) {
        Toast.show({
          type: 'success',
          text1: 'Draft Saved Successfully',
        });

        dispatch(resetEnvelope());
        goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleDiscard = () => {
    dispatch(resetEnvelope());
    goBack();
  };

  const checkDocumentProcessingStatus = async requestData => {
    try {
      const response = await api.post(
        '/api/document/processing/status/revised',
        requestData,
      );

      const data = response.data;

      if (data?.status === true) {
        navigate('Recipient', {keys: requestData});
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(hideLoader());
    }
  };

  // console.log(envelopeDocuments)

  const clearAllErrorFiles = () => {
    errorFileRef?.current?.close();
    dispatch(removeErrorDocuments());
  };

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.fileItem}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Image source={getFileIcon(item)} style={{width: 40, height: 40}} />

          <View style={{flex: 1}}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>

            {item.uploading ? (
              <Text style={styles.subText}>Uploading...</Text>
            ) : item.error ? (
              <Text style={styles.fileEroor}>{item.error}</Text>
            ) : (
              <Text style={styles.subText}>{formatFileSize(item.size)}</Text>
            )}
          </View>

          <TouchableOpacity onPress={() => openFileSheet(index)}>
            <EllipsisVertical
              size={fp(2.8)}
              color={Colors.text_secondary}
              strokeWidth={1.6}
            />
          </TouchableOpacity>
        </View>

        {item.uploading && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${item.progress}%`}]} />
          </View>
        )}
      </View>
    );
  };

  const renderErrorItem = ({item, index}) => {
    return (
      <View style={styles.fileItemError}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Image source={getFileIcon(item)} style={{width: 40, height: 40}} />

          <View style={{flex: 1}}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>

            {item.uploading ? (
              <Text style={styles.subText}>Uploading...</Text>
            ) : item.error ? (
              <Text style={styles.fileEroor}>{item.error}</Text>
            ) : (
              <Text style={styles.subText}>{formatFileSize(item.size)}</Text>
            )}
          </View>

          {/* <TouchableOpacity onPress={() => openFileSheet(index)}>
            <Trash size={fp(2.8)} color={Colors.error} />
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  return (
    <CustomSafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleBack()}>
          <ArrowLeft
            size={fp(2.8)}
            color={Colors.text_primary}
            strokeWidth={1.6}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Add Documents</Text>

        <Menu>
          <MenuTrigger>
            <EllipsisVertical
              size={fp(2.8)}
              color={Colors.text_primary}
              strokeWidth={1.6}
            />
          </MenuTrigger>

          <MenuOptions
            placement="bottom"
            customStyles={{
              optionsContainer: {
                marginTop: hp(2),

                paddingVertical: 3,
                backgroundColor: '#fff',
                elevation: 3,
              },
            }}>
            <MenuOption onSelect={() => handleSave()}>
              <View
                style={{
                  height: hp(4),
                  gap: wp(2),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp(3),
                }}>
                <Save color={Colors.text_primary} size={fp(2.5)} />
                <Text
                  style={{
                    fontFamily: Fonts.Medium,
                    color: Colors.text_primary,
                    fontSize: fp(1.9),
                  }}>
                  Save
                </Text>
              </View>
            </MenuOption>

            <MenuOption onSelect={() => handleDiscard()}>
              <View
                style={{
                  height: hp(4),
                  gap: wp(2),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp(3),
                }}>
                <Trash color={Colors.error} size={fp(2.5)} />
                <Text
                  style={{
                    fontFamily: Fonts.Medium,
                    color: Colors.error,
                    fontSize: fp(1.9),
                  }}>
                  Discard
                </Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderItemDrive}
      /> */}

      <View style={styles.container}>
        <TouchableOpacity style={styles.uploadBox} onPress={() => openSheet()}>
          <Upload size={fp(4)} color={Colors.primary} />
          <Text style={styles.uploadText}>Upload Image / PDF / Docs</Text>
        </TouchableOpacity>

        <AppToggleButton
          containerStyle={{
            backgroundColor: Colors.white,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: wp(3),
            height: hp(8),
            marginVertical: hp(1),
            paddingHorizontal: wp(4),
          }}
          size={40}
          label="Enable Envelope Id on documents"
          value={enableEnvelopeId}
          onToggle={v => dispatch(setEnableWritingID(v))}
        />

        <FlatList
          data={envelopeDocuments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{paddingVertical: hp(1)}}
        />
      </View>

      {envelopeDocuments?.length > 0 && (
        <View
          style={{
            backgroundColor: Colors.white,
            height: hp(9),
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: wp(5),
          }}>
          <AppButton
            onPress={() => handleNext()}
            title="Next"
            style={{width: wp(25), height: hp(5.2)}}
          />
        </View>
      )}

      <AppBottomSheet
        ref={sheetRef}
        title={'Add Documents'}
        snapPoints={['35%']}>
        <View style={styles.providerWrapper}>
          {/* <TouchableOpacity style={styles.provider} >
            <Image source={require('@assets/icons/scan.png')} alt='scan' style={styles.providerIcon} />
            <Text style={styles.providerText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.provider} >
            <Image source={require('@assets/icons/layout.png')} alt='template' style={styles.providerIcon} />
            <Text style={styles.providerText}>Templates</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.provider} onPress={pickImages}>
            <Image
              source={require('@assets/icons/picture.png')}
              alt="Photos"
              style={styles.providerIcon}
            />
            <Text style={styles.providerText}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.provider}
            onPress={() => handleDocumentPicker()}>
            <Image
              source={require('@assets/icons/open-folder.png')}
              alt="media"
              style={styles.providerIcon}
            />
            <Text style={styles.providerText}>My Files</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.provider} >
            <Image source={require('@assets/icons/one-drive.png')} alt='onedrive' style={styles.providerIcon} />
            <Text style={styles.providerText}>One Drive</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.provider}
            onPress={() => handleDriveLogin()}>
            <Image
              source={require('@assets/icons/google-drive.png')}
              alt="googledrive"
              style={styles.providerIcon}
            />
            <Text style={styles.providerText}>Google Drive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.provider}
            onPress={() => connectAndFetchDropbox()}>
            <Image
              source={require('@assets/icons/dropbox.png')}
              alt="dropbox"
              style={styles.providerIcon}
            />
            <Text style={styles.providerText}>Drop Box</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      <AppBottomSheet ref={fileRef} withCloseBtn={false} snapPoints={['10%']}>
        <View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              gap: wp(2),
              alignItems: 'center',
              height: hp(5),
            }}
            onPress={() => handleDeleteDocument()}>
            <Trash size={fp(2.5)} color={Colors.error} />
            <Text style={[styles.providerText, {fontSize: fp(2)}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        ref={errorFileRef}
        withCloseBtn={false}
        containerStyle={{paddingBottom: wp(4)}}
        snapPoints={['50%']}>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily: Fonts.Medium,
              color: Colors.text_primary,
              fontSize: fp(1.9),
              marginBottom: hp(2),
            }}>
            {errorFiles.length === 1
              ? '1 file needs attention. Please remove it.'
              : `${errorFiles.length} files need attention. Please remove them.`}
          </Text>
          {/* <Text style={{ fontFamily: Fonts.Medium, color: Colors.error, fontSize: fp(2), textAlign: 'center' }}>
            {errorFiles.length} {errorFiles.length > 1 ? "files" : "file"} need attention
          </Text> */}

          <BottomSheetFlatList
            data={errorFiles}
            contentContainerStyle={{flex: 1}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderErrorItem}
            keyboardShouldPersistTaps="handled"
          />

          <AppButton
            title="Remove All"
            onPress={() => clearAllErrorFiles()}
            style={{backgroundColor: Colors.error}}
          />
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        ref={googleDriveRef}
        title={'Google Drive Files'}
        containerStyle={{paddingBottom: wp(4)}}
        snapPoints={['90%']}>
        <View style={{flex: 1, paddingTop: hp(2)}}>
          <BottomSheetFlatList
            data={googleDriveFiles}
            // contentContainerStyle={{ flex: 1 }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderGoogleDriveFileItem}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        ref={dropboxRef}
        title={'Dropbox Files'}
        containerStyle={{paddingBottom: wp(4)}}
        snapPoints={['90%']}>
        <View style={{flex: 1, paddingTop: hp(2)}}>
          <BottomSheetFlatList
            data={dropboxFiles}
            // contentContainerStyle={{ flex: 1 }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderDropboxFileItem}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </AppBottomSheet>

      <Portal>
        <ConfirmExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={() => {
            setShowExitModal(false);
            handleDiscard();
          }}
          onSave={() => {
            setShowExitModal(false);
            handleSave();
          }}
        />
      </Portal>
    </CustomSafeAreaView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    backgroundColor: '#F4F7FB',
  },

  uploadBox: {
    height: hp(16),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  uploadText: {
    marginTop: 8,
    fontSize: fp(1.8),
    fontFamily: Fonts.Medium,
    color: Colors.primary,
  },

  fileItem: {
    backgroundColor: '#fff',
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
  },

  fileItemError: {
    backgroundColor: '#fff',
    padding: wp(3),
    paddingRight: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: Colors.border,
  },

  fileName: {
    fontSize: fp(1.6),
    fontFamily: Fonts.Medium,
    marginBottom: 5,
  },

  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4185f2',
  },

  percent: {
    marginTop: 4,
    fontSize: fp(1.4),
    color: '#6B7280',
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

  title: {
    fontSize: fp(2.2),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    letterSpacing: 0.5,
  },
  provider: {
    flexDirection: 'row',
    gap: wp(5),
    alignItems: 'center',
  },
  providerIcon: {
    width: wp(7),
    height: wp(7),
  },
  providerText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color: Colors.text_primary,
  },
  providerWrapper: {
    gap: wp(6),
    marginTop: hp(3),
  },
  fileIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fileExt: {
    fontSize: fp(1.4),
    fontFamily: Fonts.SemiBold,
    color: Colors.primary,
  },

  subText: {
    fontSize: fp(1.4),
    color: '#6B7280',
    marginTop: 2,
  },
  fileEroor: {
    fontSize: fp(1.4),
    color: '#ff0000',
    marginTop: 2,
  },
  cloundFileWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    gap: wp(3),
    alignItems: 'center',
    paddingVertical: wp(2),
  },
  cloundFileName: {
    fontSize: fp(1.6),
    fontFamily: Fonts.Medium,
  },
});
