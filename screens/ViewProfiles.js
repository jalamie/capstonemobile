// Now, let's update the ViewProfiles component to navigate to ProfileQR when a profile is selected
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { db } from '../App';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
    const [profiles, setProfiles] = useState([]);

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

    const handleProfilePress = (profileId) => {
        navigation.navigate('ProfileQR', { profileId });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => handleProfilePress(item.id)}
        >
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.qrButton}
                    onPress={() => handleProfilePress(item.id)}
                >
                    <Icon name="qr-code" size={20} color="white" />  
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProfile(item.id)}
                >
                    <Icon name="delete" size={20} color="white" />  
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
    
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
    // ViewProfiles styles
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
    buttonContainer: {
        flexDirection: 'row',
    },
    qrButton: {
        padding: 10,
        backgroundColor: '#4287f5',
        borderRadius: 5,
        marginRight: 10,
    },
    deleteButton: {
        padding: 10,
        backgroundColor: '#ff6347',
        borderRadius: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#131b4d',
    },
});