import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Button, FlatList } from 'react-native';
import { db } from '../App';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function EditGroup({ route, navigation }) {
    const { groupId } = route.params;
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);

    useEffect(() => {
        const fetchGroup = async () => {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            if (groupSnap.exists()) {
                setGroup(groupSnap.data());
                setMembers(groupSnap.data().members);
            }
        };

        const fetchProfiles = async () => {
            const profilesSnap = await getDocs(collection(db, "profiles"));
            const profiles = profilesSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            setAllProfiles(profiles);
        };

        fetchGroup();
        fetchProfiles();
    }, [groupId]);

    const handleSave = async () => {
        if (members.length < 2) {
            Alert.alert("Error", "A group must have at least two members.");
            return;
        }

        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, { members });
            Alert.alert("Success", "Group updated successfully.");
            navigation.goBack();
        } catch (error) {
            console.error("Error updating group:", error);
            Alert.alert("Error", "Failed to update the group.");
        }
    };

    const handleSelectProfile = (profileId) => {
        if (members.includes(profileId)) {
            if (members.length > 2) {
                setMembers(members.filter(id => id !== profileId));
            } else {
                Alert.alert("Error", "A group must have at least two members.");
            }
        } else {
            setMembers([...members, profileId]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Group: {group ? group.name : 'Loading...'}</Text>
            <FlatList
                data={allProfiles}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.profileItem}
                        onPress={() => handleSelectProfile(item.id)}
                    >
                        <Text style={styles.profileText}>{item.name}</Text>
                        <Icon
                            name={members.includes(item.id) ? "check-box" : "check-box-outline-blank"}
                            size={24}
                            color="#007aff"
                        />
                    </TouchableOpacity>
                )}
            />
            <Button title="Save Changes" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    profileText: {
        fontSize: 16
    }
});
