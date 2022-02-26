import React, { useState } from 'react';
import { Text, View, StyleSheet, Appearance, Image, ActivityIndicator, Alert, TouchableOpacity, Platform, StatusBar } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import uploadToAnonymousFilesAsync from 'anonymous-files'
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

const App = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedText, setCopiedText] = React.useState('');
  const [loader, setLoaderVisibility] = React.useState('false');

  const getMoviesFromApiAsync = async (uri) => {
    try {
      // extract the filetype
      let fileType = uri.substring(uri.lastIndexOf(".") + 1);

      let formData = new FormData();

      formData.append("file", {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`
      });

      let options = {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      };

      const response = await fetch(
        'https://freeocrapi.com/api', options);
      const json = await response.json();
      setCopiedText(json.text);
      return json.text;
    } catch (error) {
      Alert.alert("Ha ocurrido un error, intenta más tarde");
    }
  };

  let openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Se necesita permiso para acceder a la cámara');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.cancelled === true) {
      return;
    }

    if (Platform.OS === 'web') {
      const remoteUri = await uploadToAnonymousFilesAsync(pickerResult.uri);
      selectedImage({ localUri: pickerResult.uri, remoteUri });
    } else {
      setSelectedImage({ localUri: pickerResult.uri });
    }



  }

  const openShareDialog = async () => {
    setLoaderVisibility("true");
    const text = await getMoviesFromApiAsync(selectedImage.localUri);
    setLoaderVisibility("false");
    Toast.show({
      type: 'success',
      text1: 'Tu texto ha sido copiado al portapapeles',
      text2: text
    });
    Clipboard.setString(text);
  }

  return <View style={styles.app}>
    <View style={styles.container}>
      <Text style={styles.title}>Extractor de texto</Text>
      <Text style={{ fontSize: 18, paddingTop: 10, color: "white" }}>Selecciona una imagen de tu galería y luego presiona copiar para extraer el texto al portapapeles</Text>
      <TouchableOpacity onPress={openImagePickerAsync}>
        <Image
          source={{ uri: selectedImage !== null ? selectedImage.localUri : "https://i.pinimg.com/originals/7a/e3/1a/7ae31a93a3397e08882aae225c20679f.jpg" }}
          style={styles.image}
        />
      </TouchableOpacity>
      {
        selectedImage ?
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableOpacity
              onPress={openShareDialog}
              style={styles.button}>
              <Text style={styles.buttonText}>
                Copiar
              </Text>
            </TouchableOpacity>
          </View>
          : <View />
      }
    </View>
    <Toast />
    {
      loader === "true" ?
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
        :
        <View></View>
    }
  </View>
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "black"
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight + 190,
    margin: 20,
    backgroundColor: "black"
  },
  title: {
    color: "white",
    fontSize: 50
  },
  image: {
    justifyContent: "center",
    height: 300,
    width: 300,
    borderRadius: 10,
    margin: 20
  },
  button: {
    backgroundColor: "darkcyan",
    padding: 7,
    borderRadius: 50
  },
  buttonText: {
    textAlign: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 20
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(0,0,0,0.6)"
  }
});

export default App;