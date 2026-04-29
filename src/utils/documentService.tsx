// services/documentService.js

import api from "./api";

import RNFS from 'react-native-fs';
import * as PdfToImage from 'react-native-pdf-to-image';
console.log('PDFToImage:', PdfToImage);



async function loadPdfAndConvertToImages(url, key) {
  const cleanKey = key.toString().replace(/\.pdf$/i, '');
  const folderPath = cleanKey.includes('/') ? cleanKey.substring(0, cleanKey.lastIndexOf('/')) : '';
  const targetDir = `${RNFS.CachesDirectoryPath}/${folderPath}`;
  const filename = cleanKey.includes('/') ? cleanKey.substring(cleanKey.lastIndexOf('/') + 1) : cleanKey;
  const localPath = `${targetDir}/${filename}.pdf`;

  try {
    await RNFS.mkdir(targetDir);

    // 1. Download the file
    const download = await RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
    }).promise;

    if (download.statusCode !== 200) {
      throw new Error(`Download failed with status ${download.statusCode}`);
    }

    // 2. STRICT VALIDATION: Check file size and header
    const fileStat = await RNFS.stat(localPath);
    if (fileStat.size < 100) { // Tiny files are usually error messages, not PDFs
      const content = await RNFS.readFile(localPath, 'utf8').catch(() => "");
      console.error("File is too small. Content snippet:", content.substring(0, 100));
      throw new Error("Downloaded file is too small to be a valid PDF.");
    }

    // 3. Convert to Images
    const pathForNative = Platform.OS === 'android' ? `file://${localPath}` : localPath;

    console.log("Attempting conversion for:", pathForNative);

    const result = await PdfToImage.convert(pathForNative, {
      outputType: 'png',
      quality: 100,
    });

    // If result exists but pages array is empty
    if (!result || !result.pages || result.pages.length === 0) {
      throw new Error("Native converter returned zero pages. The PDF might be encrypted or invalid.");
    }

    return {
      images: result.pages.map((path) => ({
        url: `file://${path}`,
        width: result.width,
        height: result.height,
      })),
      actualWidth: result.width,
      actualHeight: result.height,
    };

  } catch (err) {
    console.error("Conversion Error Details:", err);
    throw err;
  }
}


export const getDocumentListing = async (document_keys) => {

  // console.log(document_keys)
  const res = await api.post('/api/document/listing', {
    document_keys,
  });
  // console.log(res.data.documents);

  // console.log(res)

  if (!res.data.status) throw new Error(res.data.message);

  return res.data.documents;
};

export const getDocumentUrl = async (document_key) => {
  // console.log(document_key);

  const res = await api.get(`/api/access/document/snapshot/revised?key=${document_key}&type=image`);


  if (!res.data.status) throw new Error(res.data.message);

  console.log(res.data);

  return res.data;
};



export const getSnapshots = async (
  document_key

) => {
  try {
    const response = await api.get(
      `/api/access/document?key=${document_key}`,
    );

    const data = response.data;

    console.log('getSnapshots response', data);

    if (data?.status === true) {
      const urls = data?.url;

      console.log(urls)

      // call your existing RN function
      const docDetails = await loadPdfAndConvertToImages(urls, document_key);

      console.log("Doc Details======> ", docDetails);




    } else {
      console.log('Error:', data?.message);
    }
  } catch (error) {
    console.error('getSnapshots Error:', error);
  }
};




import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboard = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // iOS and Android use slightly different event names for the smoothest timing
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(
      showEvent,
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      hideEvent,
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup function
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};