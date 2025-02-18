import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
// import { db } from '../App';
import { storage, db } from '../App';

const { width } = Dimensions.get('window');

export default function NewProfile({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChoosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: [7, 14],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setFormData(prev => ({...prev, photo: result.assets[0].uri}));
      }
    } catch (err) {
      setError('Failed to pick image');
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      console.log('Starting image upload...');
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('Creating filename...');
      const filename = `profiles/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const storageRef = ref(storage, filename);
      
      console.log('Uploading to Firebase...');
      await uploadBytes(storageRef, blob);
      console.log('Getting download URL...');
      const url = await getDownloadURL(storageRef);
      console.log('Upload successful, URL:', url);
      return url;
    } catch (err) {
      console.error('Upload error details:', err.message);
      throw new Error(`Failed to upload image: ${err.message}`);
    }
};

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    if (!formData.photo) {
      Alert.alert('Error', 'Please select a photo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const photoURL = await uploadImage(formData.photo);
      
      await addDoc(collection(db, 'profiles'), {
        name: formData.name,
        photo: photoURL,
        createdAt: new Date().toISOString(),
      });
      
      navigation.navigate('ViewProfiles');
    } catch (err) {
      // More detailed error logging
      console.error('Error details:', err.message);
      setError(`Failed to create profile: ${err.message}`);
      Alert.alert('Error', `Failed to create profile: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
              placeholder="Enter name"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.photoButton, formData.photo ? styles.photoSelected : null]}
            onPress={handleChoosePhoto}
            disabled={isLoading}
          >
            <Text style={styles.photoButtonText}>
              {formData.photo ? 'Change Photo' : 'Choose Photo'}
            </Text>
          </TouchableOpacity>

          {formData.photo ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: formData.photo }} 
                style={styles.image} 
                resizeMode="cover"
              />
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.primaryButton,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    width: width - 64,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  photoButton: {
    padding: 16,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoSelected: {
    backgroundColor: '#e0e0e0',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 150,
    height: 150,
    // borderRadius: 75,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
});