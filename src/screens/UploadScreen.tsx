import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  BackHandler,
} from 'react-native';
import { ArrowLeft, Delete, EllipsisVertical, Trash, Upload } from 'lucide-react-native';
import { pick } from '@react-native-documents/picker';
import axios from 'axios';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import api from '@utils/api';
import { Menu, Bell } from 'lucide-react-native';
import { goBack, navigate } from '@utils/NavigationUtils';
import AppBottomSheet from '@components/AppBottomSheet';
import ConfirmExitModal from '@components/ConfirmExitModal';
import { Portal } from '@gorhom/portal';
import AppButton from '@components/AppButton';
import { head } from 'node_modules/axios/index.d.cts';
import { hideLoader, showLoader } from '@redux/slices/loaderSlice';

const validTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
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
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
};


import { GoogleSignin } from '@react-native-google-signin/google-signin';
import RNFS from 'react-native-fs';
import { setDocuments } from '@redux/slices/envelopeSlice';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  webClientId: '396564745764-disnuci9msclu3j7i3r9knke7b9qtr9f.apps.googleusercontent.com',
});

const UploadScreen = () => {
  const userId = useAppSelector(state => state.auth.user?.id);
  
  const [showExitModal, setShowExitModal] = useState(false);
const [enableEnvelopeId,setEnableEnvelopeId] =useState(false)
  const dispatch = useAppDispatch();

  // Google Drive Code
  
  const [accessToken, setAccessToken] = useState(null);
const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const handleDriveLogin = async () => {
  try {
    setLoading(true);

    const token = await signIn(); // 👈 your function
    setAccessToken(token);

    const driveFiles = await getDriveFiles(token); // 👈 your function
    setFiles(driveFiles);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const signIn = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();

    console.log(userInfo,tokens)

  return tokens.accessToken;
  };
  
  const getDriveFiles = async (accessToken) => {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return data.files;
  };
  
  const downloadFile = async (file, accessToken) => {
  const url = file.mimeType.includes('google-apps')
    ? `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`
    : `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;

  const path = `${RNFS.DocumentDirectoryPath}/${file.name}`;

  const res = await RNFS.downloadFile({
    fromUrl: url,
    toFile: path,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).promise;

  return {
    uri: 'file://' + path,
    name: file.name,
    type: file.mimeType,
  };
};

  const handleDownload = async (file) => {
  try {
    setLoading(true);

    const downloaded = await downloadFile(file, accessToken);

    console.log('Downloaded file:', downloaded);

    // 👉 Send to your signing flow
    handleSelectedFile(downloaded);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
  };
  

  const handleSelectedFile = (file) => {
  console.log('Ready for signing:', file);

  // 👉 Navigate to PDF screen
  // navigation.navigate('PdfViewer', { file });
};
  
  const renderItemDrive = ({ item }) => (
  <TouchableOpacity
    style={{
      padding: 15,
      borderBottomWidth: 1,
      borderColor: '#eee',
    }}
    onPress={() => handleDownload(item)}
  >
    <Text>{item.name}</Text>
    <Text style={{ fontSize: 12, color: 'gray' }}>
      {item.mimeType}
    </Text>
  </TouchableOpacity>
);


  
  
   const sheetRef = useRef<any>(null);
   const fileRef = useRef<any>(null);

  const openSheet = () => {
    sheetRef.current?.snapToIndex(1);
  };
  const [documentId, setDocumentId] = useState(null);
  const openFileSheet = (index) => {

    console.log(index)
    setDocumentId(index);
    fileRef.current?.snapToIndex(0);
    
  }



  const [envelopeDocuments, setEnvelopeDocuments] = useState([]);


    const handleBack = () => {
  if (envelopeDocuments.length > 0) {
       sheetRef.current?.close(); // 👈 CLOSE FIRST

    setTimeout(() => {
      setShowExitModal(true); // 👈 THEN OPEN MODAL
    }, 300); // 
  } else {
    goBack();
  }
  };
  
  useEffect(() => {
  const backAction = () => {
    if (envelopeDocuments.length > 0) {

          sheetRef.current?.close(); // 👈 CLOSE FIRST

    setTimeout(() => {
      
      setShowExitModal(true); // 👈 THEN OPEN MODAL
    }, 300); // 
      return true;
    }
    return false;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    backAction
  );

  return () => backHandler.remove();
}, [envelopeDocuments]);

  // 🔥 PICK + UPLOAD
  const handleUpload = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: ['*/*'],
      });

      sheetRef?.current.close();

      const updatedFiles = results.map(file => ({
        ...file,
        progress: 0,
        uploading: true,
        error: null,
         document_id: null,
        document_key: null,
        document_url: null,
        document_name: null,
        snaphots:null,
      }));

      setEnvelopeDocuments(prev => [...prev, ...updatedFiles]);

      results.forEach(async(file, index) => {
       await uploadFile(file, index + envelopeDocuments.length);
      });

    } catch (err) {
      console.log(err);
    }
  };

  
  const handleDeleteDocument = async () => {
    try {
      fileRef?.current?.close()
      dispatch(showLoader("Deleting"))
    const doc = envelopeDocuments[documentId];
    
    const document_key = doc?.document_key;
    const document_id = doc?.document_id;
    const is_file_error = doc?.error;
    console.log(is_file_error,documentId);


    if (is_file_error) {
      const updatedDocs = [...envelopeDocuments];
      updatedDocs.splice(documentId, 1);
      setEnvelopeDocuments(updatedDocs);

      return;
      
    }

    // 🔥 request body
    const requestData = {
      document_key: [document_key],
      user: userId,
    };

    // 🔥 API CALL
    const res = await api.delete('/api/document', {
      data: requestData, // ✅ axios uses `data` not body
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res?.data?.status_code === 200) {
      
      // // 🔥 If editing template
      // if (fromEditTemplate && document_id) {
      //   setDeletedDocuments(prev => [
      //     ...prev,
      //     {
      //       id: document_id,
      //       document_key,
      //       delete: true,
      //     },
      //   ]);

      //   updateDraft('save');
      // }

      // 🔥 Remove from arrays
      const updatedDocs = [...envelopeDocuments];
      // const updatedDocsData = [...envelopeDocumentsData];
      // const updatedTitles = [...envelopeDocumentsTitle];

      updatedDocs.splice(documentId, 1);
      // updatedDocsData.splice(index, 1);
      // updatedTitles.splice(index, 1);

      setEnvelopeDocuments(updatedDocs);
      // setEnvelopeDocumentsData(updatedDocsData);
      // setEnvelopeDocumentsTitle(updatedTitles);

      // 🔥 Update recipients meta_data
      // let updatedRecipients = addRecipientsBox?.map((ele) => {
      //   const filtered = ele?.meta_data?.filter(
      //     (obj) => obj.document_key !== document_key
      //   );

      //   return {
      //     ...ele,
      //     meta_data: filtered,
      //   };
      // });

      // setAddRecipientsBox(updatedRecipients);

      // 🔥 Update subject
      // const newSubject = `WeSign: ${updatedTitles.toString()}`;
      // setSubjectTitle(newSubject);

      // // 🔥 Reset if empty
      // if (updatedDocs.length === 0) {
      //   setUploadPercentage(0);
      //   setUploadPercentageBar('');
      //   setFileName('');
      // }

      // 🔥 Redux dispatch (if using)
      // dispatch(setEnvelopeDocuments(updatedDocs));
      // dispatch(setEnvelopeDocumentsData(updatedDocsData));
      // dispatch(setEnvelopeDocumentsTitle(updatedTitles));
      // dispatch(setSubject(newSubject));
      // dispatch(setRecipients(updatedRecipients));

    } else {
      console.log('Error:', res?.data?.message);
    }
  } catch (err) {
    console.log('Delete error:', err);
    } finally {
      dispatch(hideLoader())
      
  }
};

  const updateFileError = (index, message) => {
  setEnvelopeDocuments(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      uploading: false,
      progress: 0,
      error: message, // 🔥 store error
    };
    return updated;
  });
};

  // 🔥 UPLOAD API
  const uploadFile = async (file, index) => {
     if (file.size >= 25000000) {
    updateFileError(index, 'File size exceeds 25MB');
    return;
  }

  // ❌ INVALID TYPE
  if (!validTypes.includes(file.type)) {
    updateFileError(index, 'Invalid file type');
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
     const res =  await api.post(
        'https://dev.wesign.com/converter/file/upload?ngsw-bypass=true',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },

          onUploadProgress: progressEvent => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            updateFileProgress(index, percent);

            // dispatch(setDocuments())
          },
        }
      );

      console.log(res)

      const result = res.data?.result;
      
setEnvelopeDocuments(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        document_id: result.document_id,
        document_key: result.document_key,
        document_url: result.document_url,
        document_name: result.document_name.split(".").pop(),
        snaphots:res.data?.snaphots,
        
  };
  

      return updated;
    });
       
      updateFileProgress(index, 100, false);


      

    } catch (err) {
      console.log(err);
      updateFileProgress(index, 0, false);
    }
  };

  // 🔥 UPDATE PROGRESS
  const updateFileProgress = (index, progress, uploading = true) => {
    setEnvelopeDocuments(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        progress,
        uploading,
      };
      return updated;
    });
  };



const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
  };
  
 

  const getFileType = (file) => {
  if (file.type?.startsWith('image/')) return 'IMG';

  return (
    FILE_TYPE_MAP[file.type] ||
    file.name.split('.').pop()?.toUpperCase() ||
    'DEFAULT'
  );
};
const getFileIcon = (file) => {
  const type = getFileType(file);
  return FILE_ICONS[type] || FILE_ICONS.DEFAULT;
  };


  const handleNext = () => {
    const document_ids = envelopeDocuments
  .map((doc) => doc?.document_key)
  .filter((key) => key); // removes null, undefined, ""

if (document_ids.length === 0) return; // 🚫 don't call API if empty
    dispatch(showLoader('Checking'));
const request_data = {
  document_ids,
};

checkDocumentProcessingStatus(request_data);
  }

  const checkDocumentProcessingStatus = async(requestData) => {
    try {
      const response = await api.post("/api/document/processing/status/revised",
        requestData
      );

      const data = response.data;

      if (data?.status === true) {
      
        navigate('Canvas',{keys:requestData});
        console.log("Done")
         
      }

    } catch (err) {
      console.log(err)
    } finally {
    dispatch(hideLoader());
      
    }
  }

  
  // 🎨 RENDER FILE ITEM
 const renderItem = ({ item,index }) => {


  return (
    <View style={styles.fileItem}>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        
        {/* 🔥 IMAGE OR FILE ICON */}
       <Image source={getFileIcon(item)} style={{ width: 40, height: 40 }} />

        
        {/* 🔥 FILE INFO */}
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* ✅ Show uploading OR size */}
          {item.uploading ? (
            <Text style={styles.subText}>Uploading...</Text>
          ) : item.error ? (
            <Text style={styles.fileEroor}>{item.error}</Text>
          ):(
            <Text style={styles.subText}>
              {formatFileSize(item.size)}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={()=>openFileSheet(index)}>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_secondary} strokeWidth={1.6} />
      </TouchableOpacity>



      </View>

      {/* ❌ REMOVE PROGRESS BAR AFTER UPLOAD */}
      {item.uploading && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
};

    return (
      <CustomSafeAreaView>


        
        <View style={styles.header}>
      
      {/* Left Menu */}
      <TouchableOpacity onPress={()=>handleBack()}>
        <ArrowLeft size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Add Documents</Text>

      {/* Right Notification */}
      <TouchableOpacity>
        <EllipsisVertical size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

    </View>
            
        {/* <FlatList
  data={files}
  keyExtractor={(item) => item.id}
  renderItem={renderItemDrive}
/> */}
     
        <View style={styles.container}>
          
           

      {/* Upload Box */}
      <TouchableOpacity style={styles.uploadBox} onPress={()=>openSheet()}>
        <Upload size={fp(4)} color={Colors.primary} />
        <Text style={styles.uploadText}>
          Upload Image / PDF / Docs
        </Text>
          </TouchableOpacity>
          
          <View style={{backgroundColor:Colors.white,flexDirection:'row',alignItems:'center',paddingHorizontal:wp(4),justifyContent:'space-between',borderRadius:wp(3),height:hp(8),marginTop:hp(1)}}>
            <Text style={{fontFamily:Fonts.Regular}}>
              Enable Envelope Id on documents
            </Text>

            <TouchableOpacity onPress={() => { setEnableEnvelopeId(prev => !prev) }}>
              {
                enableEnvelopeId ?
              
                  <Image source={require('@assets/icons/switch_on.png')} style={{ width: wp(11), height: wp(7) }} /> :
                  <Image source={require('@assets/icons/switch_off.png')} style={{ width: wp(11), height: wp(7) }} />
              }
              
            </TouchableOpacity>
          </View>

      {/* File List */}
      <FlatList
        data={envelopeDocuments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ marginTop: hp(2) }}
          />
          

         
         

          
        </View>

        {
          envelopeDocuments?.length > 0 &&  <View style={{backgroundColor:Colors.white,height:hp(9),flexDirection:'row',justifyContent:'flex-end',alignItems:'center',paddingHorizontal:wp(5)}}>
            <AppButton  onPress={() => handleNext()} title='Next' style={{width:wp(25),height:hp(5.2)}} />
          </View>
        }
        
        
          <AppBottomSheet ref={sheetRef} title={'Add Documents'}>
        

          <View style={styles.providerWrapper}>
            <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/scan.png')} alt='scan' style={styles.providerIcon} />
              <Text style={styles.providerText}>Scan</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/layout.png')} alt='template' style={styles.providerIcon} />
              <Text style={styles.providerText}>Templates</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/picture.png')} alt='Photos' style={styles.providerIcon} />
              <Text style={styles.providerText}>Photos</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/open-folder.png')} alt='media' style={styles.providerIcon} />
              <Text style={styles.providerText}>Media Picker</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/one-drive.png')} alt='onedrive' style={styles.providerIcon} />
              <Text style={styles.providerText}>One Drive</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleDriveLogin}>
              <Image source={require('@assets/icons/google-drive.png')} alt='googledrive' style={styles.providerIcon} />
              <Text style={styles.providerText}>Google Drive</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.provider} onPress={handleUpload}>
              <Image source={require('@assets/icons/dropbox.png')} alt='dropbox' style={styles.providerIcon} />
              <Text style={styles.providerText}>Drop Box</Text>
            </TouchableOpacity>
          </View>
      
        </AppBottomSheet>


        <AppBottomSheet ref={fileRef} withCloseBtn={false} snapPoints={["20%"]}>
        

          <View style={{backgroundColor:Colors.background_light}}>
            <TouchableOpacity style={{ flexDirection: 'row',gap: wp(2),alignItems:'center',height:hp(5)}} onPress={()=>handleDeleteDocument()}>
              <Trash size={fp(2.5)} color={Colors.error}/>
              <Text style={[styles.providerText,{fontSize:fp(2)}]}>Delete</Text>
            </TouchableOpacity>

           
          </View>
      
        </AppBottomSheet>
        

       
        <Portal>

       
         <ConfirmExitModal
  visible={showExitModal}
  onCancel={() => setShowExitModal(false)}
  onConfirm={() => {
    setShowExitModal(false);
    goBack();
          }}
          onSave={() => {
            setShowExitModal(false);
    goBack();
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
    marginTop:8
  },

  progressFill: {
    height: '100%',
    backgroundColor: "#4185f2",
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
    alignItems:'center'
  },
  providerIcon: {
    width: wp(7),
    height:wp(7),
  },
  providerText: {
    fontFamily: Fonts.Regular,
    fontSize: fp(2),
    color:Colors.text_primary
  },
  providerWrapper: {
    gap: wp(6),
    marginTop:hp(3)
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
}
});