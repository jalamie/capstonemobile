import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function MainPage({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('NewProfile')}
          >
            <Text style={styles.primaryButtonText}>Create New User Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ViewProfiles')}
          >
            <Text style={styles.primaryButtonText}>View All Profiles</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Text style={styles.primaryButtonText}>Create New Group</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('GroupList')}
          >
            <Text style={styles.primaryButtonText}>View All Groups</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Define the styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
    width: '90%', // Adjust width as necessary
  },
  content: {
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
    width: '100%', // Full width of the card
  },
  primaryButton: {
    backgroundColor: '#131b4d',
  },
  secondaryButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
  },
  secondaryButtonText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 16,
  }
});