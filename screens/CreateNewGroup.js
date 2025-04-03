import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert,TouchableOpacity } from 'react-native';
import { db } from '../App';
import { collection, query, where, getDocs, addDoc, orderBy, setDoc, doc } from 'firebase/firestore';

export default function CreateGroup({ navigation }) {
    const [groupName, setGroupName] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [selectedProfiles, setSelectedProfiles] = useState([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            const profilesCollectionRef = collection(db, "profiles");
            const profilesQuery = query(profilesCollectionRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(profilesQuery);
            const loadedProfiles = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name, 
            }));
            setProfiles(loadedProfiles);
        };

        fetchProfiles();
    }, []);

    const handleSelectProfile = (id) => {
        setSelectedProfiles(prevSelected => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(profileId => profileId !== id);
            } else {
                if (prevSelected.length >= 4) {
                    Alert.alert("Limit Reached", "You can only select up to 4 profiles.");
                    return prevSelected;
                }
                return [...prevSelected, id];
            }
        });
    };

    const checkGroupNameExists = async () => {
        const q = query(collection(db, "groups"), where("name", "==", groupName));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const CreateGroup = async () => {
        if (selectedProfiles.length < 2) {
            Alert.alert("Error", "Please select at least two profiles to form a group.");
            return;
        }

        const nameExists = await checkGroupNameExists();
        if (nameExists) {
            Alert.alert("Error", "Group name already exists, please choose another name.");
            return;
        }

        try {
            await setDoc(doc(db, "groups", groupName), {
                name: groupName,
                members: selectedProfiles
            });
            Alert.alert("Success", "Group created successfully!");
            navigation.navigate('ViewGroup', { groupId: groupName });
        } catch (error) {
            console.error("Error creating group: ", error);
            Alert.alert("Error", "Failed to create the group.");
        }
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, selectedProfiles.includes(item.id) ? styles.itemSelected : null]}
            onPress={() => handleSelectProfile(item.id)}
        >
            <Text style={styles.itemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Please enter Group Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
            />
            <Text style={styles.label}>Please select group members</Text>
            <Text style={styles.label}>(Select up to 4 profiles, minimum 2 profiles)</Text>
            <FlatList
                data={profiles}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                extraData={selectedProfiles}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={CreateGroup}
            >
                <Text style={styles.buttonText}>Create Group</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        paddingHorizontal: 8,
    },
    input: {
        marginBottom: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderBottomWidth: 1,
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#ddd',
    },
    item: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    itemSelected: {
        backgroundColor: '#e2f1f8',
    },
    itemText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#131b4d',
        padding: 10,
        margin: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    }
});
