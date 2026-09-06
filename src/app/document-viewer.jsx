import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import * as ScreenCapture from 'expo-screen-capture';

import Pdf from 'react-native-pdf';

import ReactNativeBlobUtil from 'react-native-blob-util';

import { ArrowLeft } from 'lucide-react-native';


const API_BASE_URL =
  'https://service.kkfinsure.org';


// =====================================================
// DOCUMENT VIEWER
// =====================================================

export default function DocumentViewer() {

  const router = useRouter();

  const params = useLocalSearchParams();


  // ---------------------------------------------------
  // Get params
  // ---------------------------------------------------

  const filePath = Array.isArray(params.filePath)
    ? params.filePath[0]
    : params.filePath;

  const title = Array.isArray(params.title)
    ? params.title[0]
    : params.title || 'Document';


  // ---------------------------------------------------
  // States
  // ---------------------------------------------------

  const [fileUri, setFileUri] =
    useState(null);

  const [fileType, setFileType] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ===================================================
  // EFFECT
  // ===================================================

  useEffect(() => {

    let mounted = true;

    let downloadedFile = null;


    // -------------------------------------------------
    // Enable screenshot protection
    // -------------------------------------------------

    const protectScreen = async () => {

      try {

        await ScreenCapture.preventScreenCaptureAsync(
          'protected-document'
        );

        console.log(
          'DOCUMENT SCREEN PROTECTION ENABLED'
        );

      } catch (err) {

        console.log(
          'SCREEN PROTECTION ERROR:',
          err
        );

      }

    };


    // -------------------------------------------------
    // Build URL
    // -------------------------------------------------

    const getDocumentUrl = () => {

      if (!filePath) {

        throw new Error(
          'No document path was provided.'
        );

      }


      const path =
        String(filePath).trim();


      // Full URL

      if (
        path.startsWith('http://') ||
        path.startsWith('https://')
      ) {

        return path;

      }


      // /uploads/...

      if (path.startsWith('/')) {

        return `${API_BASE_URL}${path}`;

      }


      // uploads/...

      return `${API_BASE_URL}/${path}`;

    };


    // -------------------------------------------------
    // Detect extension
    // -------------------------------------------------

    const getExtension = (url) => {

      try {

        const cleanUrl =
          url.split('?')[0];

        const lastPart =
          cleanUrl.split('/').pop() || '';

        const parts =
          lastPart.split('.');

        if (parts.length < 2) {

          return '';

        }

        return parts
          .pop()
          .toLowerCase();

      } catch {

        return '';

      }

    };


    // -------------------------------------------------
    // Determine document type
    // -------------------------------------------------

    const detectFileType = (
      extension,
      contentType
    ) => {

      const imageExtensions = [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'bmp',
        'heic',
        'heif',
      ];


      // PDF

      if (
        extension === 'pdf' ||
        contentType.includes('application/pdf')
      ) {

        return 'pdf';

      }


      // Image

      if (
        imageExtensions.includes(extension) ||
        contentType.startsWith('image/')
      ) {

        return 'image';

      }


      return null;

    };


    // =================================================
    // DOWNLOAD DOCUMENT
    // =================================================

    const downloadDocument = async () => {

      try {

        setLoading(true);

        setError(null);

        setFileUri(null);

        setFileType(null);


        const documentUrl =
          getDocumentUrl();


        console.log(
          '================================'
        );

        console.log(
          'DOCUMENT URL:',
          documentUrl
        );

        console.log(
          '================================'
        );


        const extension =
          getExtension(documentUrl);


        console.log(
          'FILE EXTENSION:',
          extension
        );


        // ------------------------------------------------
        // Temporary extension
        // ------------------------------------------------

        let tempExtension =
          extension || 'bin';


        if (
          tempExtension === 'jpg'
        ) {
          tempExtension = 'jpg';
        }


        const fileName =
          `protected_document_${Date.now()}.${tempExtension}`;


        const localPath =
          `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;


        console.log(
          'LOCAL FILE:',
          localPath
        );


        // ------------------------------------------------
        // Download
        // ------------------------------------------------

        const response =
          await ReactNativeBlobUtil
            .config({
              path: localPath,
              fileCache: false,
            })
            .fetch(
              'GET',
              documentUrl,
              {
                Accept:
                  '*/*',

                'Cache-Control':
                  'no-cache',
              }
            );


        const responseInfo =
          response.info();


        const status =
          responseInfo.status;


        const headers =
          responseInfo.headers || {};


        console.log(
          'HTTP STATUS:',
          status
        );


        console.log(
          'RESPONSE HEADERS:',
          headers
        );


        // ------------------------------------------------
        // HTTP validation
        // ------------------------------------------------

        if (
          status < 200 ||
          status >= 300
        ) {

          throw new Error(
            `Server returned HTTP ${status}`
          );

        }


        // ------------------------------------------------
        // Check file exists
        // ------------------------------------------------

        const exists =
          await ReactNativeBlobUtil.fs.exists(
            localPath
          );


        if (!exists) {

          throw new Error(
            'Downloaded file was not created.'
          );

        }


        // ------------------------------------------------
        // File size
        // ------------------------------------------------

        const stat =
          await ReactNativeBlobUtil.fs.stat(
            localPath
          );


        console.log(
          'FILE SIZE:',
          stat.size
        );


        if (
          !stat.size ||
          Number(stat.size) < 10
        ) {

          throw new Error(
            'Downloaded file is empty or corrupted.'
          );

        }


        // ------------------------------------------------
        // Content type
        // ------------------------------------------------

        let contentType = '';


        Object.keys(headers).forEach(
          (key) => {

            if (
              key.toLowerCase() ===
              'content-type'
            ) {

              contentType =
                String(headers[key] || '')
                  .toLowerCase();

            }

          }
        );


        console.log(
          'CONTENT TYPE:',
          contentType
        );


        // ------------------------------------------------
        // Detect type
        // ------------------------------------------------

        let detectedType =
          detectFileType(
            extension,
            contentType
          );


        // ------------------------------------------------
        // PDF magic-byte verification
        // ------------------------------------------------

        const firstBytes =
          await ReactNativeBlobUtil.fs.readFile(
            localPath,
            'base64'
          );


        console.log(
          'FILE HEADER:',
          firstBytes.substring(0, 20)
        );


        const isPdf =
          firstBytes.startsWith(
            'JVBERi0'
          );


        if (isPdf) {

          detectedType = 'pdf';

          console.log(
            'DETECTED FILE TYPE: PDF'
          );

        }


        // ------------------------------------------------
        // Image detection
        // ------------------------------------------------

        const imageExtensions = [
          'jpg',
          'jpeg',
          'png',
          'webp',
          'gif',
          'bmp',
          'heic',
          'heif',
        ];


        const isImage =
          imageExtensions.includes(
            extension
          ) ||
          contentType.startsWith(
            'image/'
          );


        if (isImage) {

          detectedType = 'image';

          console.log(
            'DETECTED FILE TYPE: IMAGE'
          );

        }


        // ------------------------------------------------
        // Unknown file
        // ------------------------------------------------

        if (!detectedType) {

          console.log(
            'UNKNOWN FILE TYPE'
          );

          throw new Error(
            'This document format is not supported. Only PDF and image documents are supported.'
          );

        }


        downloadedFile =
          localPath;


        // ------------------------------------------------
        // Set UI
        // ------------------------------------------------

        if (mounted) {

          setFileType(
            detectedType
          );

          setFileUri(
            `file://${localPath}`
          );

          setLoading(false);

        }


        console.log(
          'DOCUMENT READY:',
          detectedType
        );


      } catch (err) {

        console.log(
          '================================'
        );

        console.log(
          'DOCUMENT DOWNLOAD ERROR:',
          err
        );

        console.log(
          '================================'
        );


        if (mounted) {

          setError(
            err?.message ||
            'Unable to load the document.'
          );

          setLoading(false);

        }

      }

    };


    // -------------------------------------------------
    // Start
    // -------------------------------------------------

    protectScreen();

    downloadDocument();


    // -------------------------------------------------
    // Cleanup
    // -------------------------------------------------

    return () => {

      mounted = false;


      // Disable protection after leaving viewer

      ScreenCapture
        .allowScreenCaptureAsync(
          'protected-document'
        )
        .catch(() => {});


      // Delete temporary file

      if (downloadedFile) {

        ReactNativeBlobUtil.fs
          .unlink(downloadedFile)
          .catch(() => {});

      }

    };

  }, [filePath]);


  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {

    router.back();

  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <View style={styles.container}>

        <Header
          title={title}
          onBack={handleBack}
        />


        <View style={styles.center}>

          <ActivityIndicator
            size="large"
            color={BLUE}
          />


          <Text
            style={styles.loadingText}
          >
            Loading document...
          </Text>


          <Text
            style={styles.secureText}
          >
            🔒 Protected document
          </Text>

        </View>

      </View>

    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (
    error ||
    !fileUri
  ) {

    return (

      <View style={styles.container}>

        <Header
          title={title}
          onBack={handleBack}
        />


        <View style={styles.center}>

          <Text
            style={styles.errorTitle}
          >
            Unable to load document
          </Text>


          <Text
            style={styles.errorText}
          >
            {error ||
              'The document could not be opened.'}
          </Text>


          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            style={styles.backHomeButton}
          >

            <Text
              style={styles.backHomeText}
            >
              Go Back
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    );

  }


  // ===================================================
  // PDF
  // ===================================================

  if (fileType === 'pdf') {

    return (

      <View style={styles.container}>

        <Header
          title={title}
          onBack={handleBack}
        />


        <ProtectedBar />


        <Pdf
          source={{
            uri: fileUri,
            cache: false,
          }}

          style={styles.pdf}

          trustAllCerts={false}

          enablePaging={false}

          horizontal={false}

          onLoadComplete={(
            numberOfPages
          ) => {

            console.log(
              'PDF LOADED:',
              numberOfPages,
              'pages'
            );

          }}

          onPageChanged={(
            page,
            numberOfPages
          ) => {

            console.log(
              'PDF PAGE:',
              page,
              '/',
              numberOfPages
            );

          }}

          onError={(pdfError) => {

            console.log(
              'PDF RENDER ERROR:',
              pdfError
            );

            setError(
              'Unable to render this PDF document.'
            );

          }}

        />

      </View>

    );

  }


  // ===================================================
  // IMAGE
  // ===================================================

  if (fileType === 'image') {

    return (

      <View style={styles.container}>

        <Header
          title={title}
          onBack={handleBack}
        />


        <ProtectedBar />


        <View style={styles.imageContainer}>

          <Image
            source={{
              uri: fileUri,
            }}

            style={styles.image}

            resizeMode="contain"

            onLoad={() => {

              console.log(
                'IMAGE LOADED SUCCESSFULLY'
              );

            }}

            onError={(imageError) => {

              console.log(
                'IMAGE LOAD ERROR:',
                imageError
              );

              setError(
                'Unable to display this image.'
              );

            }}

          />

        </View>

      </View>

    );

  }


  return null;

}


// =====================================================
// HEADER
// =====================================================

const Header = ({
  title,
  onBack,
}) => {

  return (

    <View style={styles.header}>

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        style={styles.backButton}
      >

        <ArrowLeft
          size={24}
          color="#FFFFFF"
        />

      </TouchableOpacity>


      <Text
        style={styles.headerTitle}
        numberOfLines={1}
      >
        {title}
      </Text>


      <View
        style={styles.headerRight}
      />

    </View>

  );

};


// =====================================================
// PROTECTED BAR
// =====================================================

const ProtectedBar = () => {

  return (

    <View
      style={styles.protectedBar}
    >

      <Text
        style={styles.protectedText}
      >
        🔒 Protected Document
      </Text>

    </View>

  );

};


// =====================================================
// COLORS
// =====================================================

const BLUE = '#2B46D5';


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },


  // ---------------------------------------------------
  // Header
  // ---------------------------------------------------

header: {
  height: 90,
  backgroundColor: BLUE,
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 25,
  paddingHorizontal: 14,
},


  backButton: {
    width: 42,
    height: 42,

    justifyContent: 'center',
    alignItems: 'center',
  },


  headerTitle: {
    flex: 1,

    color: '#FFFFFF',

    fontSize: 17,
    fontWeight: '700',

    marginHorizontal: 10,
  },


  headerRight: {
    width: 42,
  },


  // ---------------------------------------------------
  // Protected bar
  // ---------------------------------------------------

  protectedBar: {
    height: 36,

    backgroundColor: '#EAF0FF',

    alignItems: 'center',
    justifyContent: 'center',
  },


  protectedText: {
    color: BLUE,

    fontSize: 12,

    fontWeight: '700',
  },


  // ---------------------------------------------------
  // PDF
  // ---------------------------------------------------

  pdf: {
    flex: 1,

    width: '100%',

    backgroundColor: '#FFFFFF',
  },


  // ---------------------------------------------------
  // Image
  // ---------------------------------------------------

  imageContainer: {
    flex: 1,

    backgroundColor: '#000000',

    justifyContent: 'center',
    alignItems: 'center',
  },


  image: {
    width: '100%',
    height: '100%',
  },


  // ---------------------------------------------------
  // Center
  // ---------------------------------------------------

  center: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 30,
  },


  loadingText: {
    marginTop: 15,

    color: '#1A2332',

    fontSize: 15,

    fontWeight: '600',
  },


  secureText: {
    marginTop: 8,

    color: '#6B7A8F',

    fontSize: 12,
  },


  // ---------------------------------------------------
  // Error
  // ---------------------------------------------------

  errorTitle: {
    color: '#1A2332',

    fontSize: 18,

    fontWeight: '700',

    textAlign: 'center',
  },


  errorText: {
    color: '#6B7A8F',

    fontSize: 13,

    textAlign: 'center',

    marginTop: 10,

    lineHeight: 20,
  },


  backHomeButton: {
    marginTop: 20,

    backgroundColor: BLUE,

    paddingHorizontal: 24,
    paddingVertical: 12,

    borderRadius: 10,
  },


  backHomeText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '700',
  },

});