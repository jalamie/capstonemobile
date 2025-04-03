import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet } from 'react-native';
import MainPage from './screens/MainPage';
import NewProfile from './screens/NewProfile';
import ViewProfiles from './screens/ViewProfiles';
import CreateNewGroup from './screens/CreateNewGroup';
import ViewGroups from './screens/ViewGroups';
import ViewGroup from './screens/ViewGroup';
import EditGroup from './screens/EditGroup';
import GenerateQR from './screens/GenerateQR';
import  ProfileQR  from './screens/ProfileQR';
import { initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { HeaderBackButton } from '@react-navigation/elements';


const firebaseConfig = {
  apiKey: "AIzaSyDc3qxRx6i28a_tY3bMB0tXWK3jM7MUo-g",
  authDomain: "capstone-sal.firebaseapp.com",
  projectId: "capstone-sal",
  storageBucket: "capstone-sal.firebasestorage.app",
  messagingSenderId: "506687469413",
  appId: "1:506687469413:web:661076c64cf63e6197138c",
  measurementId: "G-YPD0ZE5W55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);

const Stack = createNativeStackNavigator(); // Changed from createStackNavigator

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#131b4d',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={MainPage}
          options={{ title: 'Home',
            headerBackVisible: false,
           }}
        />
        <Stack.Screen 
          name="NewProfile" 
          component={NewProfile}
          options={{ title: 'Create Profile' }}
        />
        <Stack.Screen
          name="ViewProfiles"
          component={ViewProfiles}
          options={({ navigation }) => ({
            headerLeft: (props) => (
              <HeaderBackButton
                {...props}
                label="Home"
                onPress={() => { navigation.navigate("Home")}}
              />
            ),
          })}
/>
        <Stack.Screen 
          name="GroupList" 
          component={ViewGroups}
          options={({ navigation }) => ({
            headerLeft: (props) => (
              <HeaderBackButton
                {...props}
                label="Home"
                onPress={() => { navigation.navigate("Home")}}
              />
            ),
          })}
          
        />
        <Stack.Screen 
          name="ViewGroup" 
          component={ViewGroup}
          options={({ navigation }) => ({
            headerLeft: (props) => (
              <HeaderBackButton
                {...props}
                label="Groups"
                onPress={() => { navigation.navigate("GroupList")}}
              />
            ),
          })}
        />
        <Stack.Screen 
          name="CreateGroup" 
          component={CreateNewGroup}
          options={{ title: 'Create Group QR' }}
        />
        <Stack.Screen 
          name="EditGroup" 
          component={EditGroup}
          options={{ title: 'Edit Group' }}
        />
        <Stack.Screen 
          name="GenerateQR" 
          component={GenerateQR}
          options={{ title: 'Generate QR' }}
        />
        <Stack.Screen 
          name="ProfileQR" 
          component={ProfileQR}
          options={{ title: 'Profile QR Code' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}