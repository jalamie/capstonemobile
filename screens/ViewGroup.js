import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { db } from '../App';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ViewGroup({ route, navigation }) {
    const { groupId } = route.params;
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const groupRef = doc(db, "groups", groupId);

const unsubscribe = onSnapshot(groupRef, async (docSnapshot) => {
    if (docSnapshot.exists()) {
        setGroup({ id: docSnapshot.id, ...docSnapshot.data() });
        const memberIds = docSnapshot.data().members || [];

        try {
            const memberProfiles = await Promise.all(memberIds.map(async (memberId) => {
                try {
                    const memberRef = doc(db, "profiles", memberId); // Proper use of doc function
                    const memberDoc = await getDoc(memberRef);
                    if (memberDoc.exists()) {
                        return { id: memberDoc.id, name: memberDoc.data().name };
                    } else {
                        console.log(`No profile found for ID: ${memberId}`);
                        return null;
                    }
                } catch (error) {
                    console.error(`Failed to fetch profile for ID: ${memberId}`, error);
                    return null;
                }
            }));

            setMembers(memberProfiles.filter(profile => profile !== null));
        } catch (error) {
            console.error("Error fetching member profiles:", error);
        }
    } else {
        console.log('No such group document!');
        Alert.alert('Error', 'No such group found!');
    }
});


        return () => unsubscribe();
    }, [groupId]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{group ? group.name : 'Loading...'}</Text>
            <FlatList
                data={members}
                renderItem={({ item }) => <Text style={styles.member}>{item.name}</Text>}
                keyExtractor={(item) => item.id}
            />
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditGroup', { groupId })}>
                <Icon name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Button title="Generate QR Code" onPress={() => navigation.navigate('GenerateQR', { groupId })} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    member: {
        fontSize: 18,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    editButton: {
        position: 'absolute',
        right: 20,
        bottom: 80,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 30,
    }
});
