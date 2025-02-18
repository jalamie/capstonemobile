import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { db } from '../App';
import {collection, query, orderBy, onSnapshot } from 'firebase/firestore';

import { Alert } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const handleDeleteProfile = (profileId) => {
    Alert.alert(
        "Delete Profile",
        "Are you sure you want to delete this profile?",
        [
            {
                text: "Cancel",
                onPress: () => console.log("Deletion cancelled"),
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, "profiles", profileId));
                        console.log("Profile deleted successfully");
                    } catch (error) {
                        console.error("Error deleting profile:", error);
                    }
                },
                style: "destructive"
            }
        ]
    );
};


export default function ViewProfiles({ navigation }) {
    const [profiles, setProfiles] = useState([]); // State to store profile data

    useEffect(() => {
        const usersCollectionRef = collection(db, `profiles`);
        const queryRef = query(usersCollectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(queryRef, (snapshot) => {
            if (snapshot.empty) {
                console.log('No documents found in Firestore!');
                return;
            }

            const loadedProfiles = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
            }));

            setProfiles(loadedProfiles);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteProfile(item.id)}
            >
                <Icon name="delete" size={20} color="white" />  
            </TouchableOpacity>
        </View>
    );
    
    const handleNavigateHome = () => {
        navigation.navigate('MainPage'); // Assuming 'Home' is your home screen route name
    };
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={profiles}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 8,
        borderRadius: 5,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    deleteButton: {
        padding: 10,
        backgroundColor: '#ff6347',  // Tomato color for the delete button
        borderRadius: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: '#131b4d',
    },
});

