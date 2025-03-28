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
                        return docSnap.exists() ? { 
                            id: docSnap.id, 
                            name: docSnap.data().name, 
                            age: calculateAge(docSnap.data().dob),
                            dob: docSnap.data().dob,
                        } : null;
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
function calculateAge(dobString) {
    // If dob is not provided or invalid, return null or a default value
    if (!dobString) return null;
    
    // Parse the date string - expected format is "YYYY-MM-DD"
    const dobParts = dobString.split('-');
    
    // Check if we have a valid date format
    if (dobParts.length !== 3) return null;
    
    // Create date object (note: month is 0-indexed in JavaScript Date)
    const year = parseInt(dobParts[0]);
    const month = parseInt(dobParts[1]) - 1; // Subtract 1 since JS months are 0-indexed
    const day = parseInt(dobParts[2]);
    
    // Create the date object and validate it
    const dobDate = new Date(year, month, day);
    
    // Check if the date is valid
    if (isNaN(dobDate.getTime())) return null;
    
    const today = new Date();
    
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract 1 from age
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }
    
    return age;
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
