// services/documentService.js

import api from "./api";

import RNFS from 'react-native-fs';
import * as PdfToImage from 'react-native-pdf-to-image';




export async function loadPdfAndConvertToImages(url, key) {
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
      throw new Error(`Download failed with HTTP status ${download.statusCode}`);
    }

    // 2. Validate file size
    const fileStat = await RNFS.stat(localPath);
    if (fileStat.size < 100) {
      throw new Error("Downloaded file is too small to be a valid PDF.");
    }

    // 3. Convert to Images
    const pathForNative = Platform.OS === 'android' ? `file://${localPath}` : localPath;

    // The library returns { outputFiles: string[] }
    const result = await PdfToImage.convert(pathForNative, {
      outputType: 'png',
      quality: 100,
    });

    // FIX: Check 'outputFiles' instead of 'pages'
    if (!result || !result.outputFiles || result.outputFiles.length === 0) {
      throw new Error("Native converter returned zero pages. The PDF might be encrypted or invalid.");
    }

    // 4. Get dimensions from the first generated image (assuming all pages are the same size)
    const firstImagePath = `file://${result.outputFiles[0]}`;

    const dimensions = await new Promise((resolve) => {
      Image.getSize(
        firstImagePath,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 0, height: 0 }) // Fallback if size check fails
      );
    });

    // 5. Map the results matching your original return structure
    return {
      images: result.outputFiles.map((path) => ({
        url: `file://${path}`,
        width: dimensions.width,
        height: dimensions.height,
      })),
      actualWidth: dimensions.width,
      actualHeight: dimensions.height,
    };

  } catch (err) {
    console.error("Conversion Error Details:", err);
    throw err;
  } finally {
    // 6. Cleanup the original PDF
    try {
      const exists = await RNFS.exists(localPath);
      if (exists) {
        await RNFS.unlink(localPath);
      }
    } catch (cleanupErr) {
      console.warn("Failed to clean up temporary PDF:", cleanupErr);
    }
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


      const docDetails = await loadPdfAndConvertToImages(urls, document_key);

      console.log("Doc Details======> ", docDetails);

      return docDetails





    } else {
      console.log('Error:', data?.message);
    }
  } catch (error) {
    console.error('getSnapshots Error:', error);
  }
};




import { useEffect, useState } from 'react';
import { Image, Keyboard, Platform } from 'react-native';

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