import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as CryptoJS from 'crypto-js';
import { db } from '../App';
import { doc, getDoc } from 'firebase/firestore';

export default function GenerateQR({ route, navigation }) {
    const { groupId } = route.params;
    const [encryptedData, setEncryptedData] = useState('');
    const [group, setGroup] = useState(null);
    const [membersData, setMembersData] = useState([]);

    useEffect(() => {
        const fetchGroupData = async () => {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                const groupData = groupSnap.data();
                setGroup(groupData);

                if (groupData.members && Array.isArray(groupData.members)) {
                    const profilesData = await Promise.all(groupData.members.map(async (id) => {
                        const docRef = doc(db, "profiles", id);
                        const docSnap = await getDoc(docRef);
                        return docSnap.exists() ? { id: docSnap.id, name: docSnap.data().name } : null;
                    }));

                    const filteredProfiles = profilesData.filter(profile => profile !== null);
                    setMembersData(filteredProfiles);
                    const jsonData = JSON.stringify(filteredProfiles);
                    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
                    const key = CryptoJS.enc.Utf8.parse('abcdefghijklmnop');
                    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }).toString();
                    setEncryptedData(encrypted);
                } else {
                    console.error('Members data is missing or not an array');
                }
            } else {
                console.log('No group data found for ID:', groupId);
            }
        };

        fetchGroupData();
    }, [groupId]);

    return (
        <ScrollView style={styles.container}>
            {group && (
                <>
                    <Text style={styles.title}>{group.name}</Text>
                    {membersData.map((member, index) => (
                        <Text key={member.id} style={styles.profileText}>Name: {member.name}</Text>
                    ))}
                </>
            )}
            {encryptedData && (
                <View style={styles.qrContainer}>
                    <QRCode
                        value={encryptedData}
                        size={250}
                        backgroundColor="white"
                        color="black"
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    profileText: {
        fontSize: 16,
        marginLeft: 10,
        marginBottom: 5
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: 20,
    }
});
