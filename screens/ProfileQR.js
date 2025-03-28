import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as CryptoJS from 'crypto-js';
import { db } from '../App';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileQR({ route, navigation }) {
    const { profileId } = route.params;
    const [encryptedData, setEncryptedData] = useState('');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            const profileRef = doc(db, "profiles", profileId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const profileData = {
                    id: profileSnap.id,
                    name: profileSnap.data().name,
                    age: calculateAge(profileSnap.data().dob),
                    dob: profileSnap.data().dob,

                };
                
                setProfile(profileData);
                
                // Encrypt the profile data for the QR code
                const jsonData = JSON.stringify([profileData]); // Wrap in array to maintain format similar to group QR
                const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
                const key = CryptoJS.enc.Utf8.parse('abcdefghijklmnop');
                const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }).toString();
                
                setEncryptedData(encrypted);
            } else {
                console.log('No profile data found for ID:', profileId);
            }
        };

        fetchProfileData();
    }, [profileId]);

    return (
        <ScrollView style={styles.container}>
            {profile && (
                <>
                    <Text style={styles.title}>Profile QR Code</Text>
                    <Text style={styles.profileText}>Name: {profile.name}</Text>
                    <Text style={styles.profileText}>Date of Birth: {profile.dob} [Age: {profile.age}]</Text>
                    <Text style={styles.profileText}>Passport Number: {profile.id}</Text>
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