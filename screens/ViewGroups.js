import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { db } from '../App';
import { collection, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const handleDeleteGroup = (groupId) => {
    Alert.alert(
        "Delete Group",
        "Are you sure you want to delete this group?",
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
                        await deleteDoc(doc(db, "groups", groupId));
                        console.log("Group deleted successfully");
                    } catch (error) {
                        console.error("Error deleting group:", error);
                    }
                },
                style: "destructive"
            }
        ]
    );
};


export default function ViewGroup({ navigation }) {
    const [groups, setGroups] = useState([]); 

    useEffect(() => {
        const usersCollectionRef = collection(db, `groups`);

        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            if (snapshot.empty) {
                console.log('No documents found in Firestore!');
                return;
            }

            const loadedGroups= snapshot.docs.map((doc) => ({
                id: doc.id,
                // name: doc.data().name,
            }));

            setGroups(loadedGroups);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('ViewGroup', { groupId: item.id })}
        >
            <Text style={styles.itemText}>{item.id}</Text> 
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                    e.stopPropagation();  // Prevent the delete button's press from triggering the navigation
                    handleDeleteGroup(item.id);
                }}
            >
                <Icon name="delete" size={20} color="white" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
    
    

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={groups}
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

