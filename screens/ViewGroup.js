// ViewGroup.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { db } from '../App';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ViewGroup({ route, navigation }) {
    const { groupId } = route.params;
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const groupRef = doc(db, "groups", groupId);

        const unsubscribe = onSnapshot(groupRef, (doc) => {
            if (doc.exists()) {
                setGroup({ id: doc.id, ...doc.data() });
            } else {
                console.log('No such document!');
            }
        });

        return () => unsubscribe();
    }, [groupId]);

    const handleEditGroup = () => {
        navigation.navigate('EditGroup', { groupId });
    };

    const generateQR = () => {
        navigation.navigate('GenerateQR', { groupId }); // Assuming you have a GenerateQR component set up
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{group ? group.name : 'Loading...'}</Text>
            <FlatList
                data={group ? group.members : []}
                renderItem={({ item }) => <Text style={styles.member}>{item}</Text>}
                keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity style={styles.editButton} onPress={handleEditGroup}>
                <Icon name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Button title="Generate QR Code" onPress={generateQR} />
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
