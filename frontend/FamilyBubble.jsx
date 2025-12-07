import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import {collection, query, where, onSnapshot, getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

// ===== UTILITY =====
const statusColors = {
    Safe: '#34D399',
    Busy: '#FBBF24',
    Offline: '#6B7280',
    Help: '#F87171'
};

// ===== FIREBASE CONFIG =====
// You'll need to set up firebase in your app and import it here
// import { db, auth } from './firebaseConfig';

const MemberCircle = ({ member, radius, angle, center }) => {
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;

    return (
        <React.Fragment>
            <Circle
                cx={x}
                cy={y}
                r={40}
                fill={statusColors[member.status] || '#888'}
            />
            <SvgText
                x={x}
                y={y}
                fontSize="12"
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                dy="4"
            >
                {member.name}
            </SvgText>
        </React.Fragment>
    );
};

const BubbleView = ({ bubble, center }) => {
    const radius = 120;
    return (
        <Svg height="100%" width="100%" viewBox={`0 0 ${center * 2} ${center * 2}`}>
            {bubble.members.map((m, i) => (
                <MemberCircle
                    key={m.id}
                    member={m}
                    radius={radius}
                    angle={(i / bubble.members.length) * Math.PI * 2}
                    center={center}
                />
            ))}
        </Svg>
    );
};

export default function FamilyBubble() {
    const [bubble, setBubble] = useState(null);
    const [loading, setLoading] = useState(true);
    // const auth = getAuth();
    // const db = getFirestore();
    // const user = auth.currentUser;

    useEffect(() => {
        // This is a mock implementation. Replace with your actual Firebase logic.
        const mockBubble = {
            id: 'bubble1',
            name: "Family Bubble",
            members: [
                { id: 'm1', name: 'Mom', status: 'Safe' },
                { id: 'm2', name: 'Dad', status: 'Busy' },
                { id: 'm3', name: 'Me', status: 'Safe' }
            ]
        };
        setBubble(mockBubble);
        setLoading(false);
        /*
        if (user) {
            const nodesRef = collection(db, "nodes");
            const q = query(nodesRef, where("ownerId", "==", user.uid));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const bubbleData = [];
                querySnapshot.forEach((doc) => {
                    bubbleData.push({ id: doc.id, ...doc.data() });
                });

                // For simplicity, we're assuming one bubble per user for now
                // And we'll need another query to get the members of the bubble
                setBubble(bubbleData[0]);
                setLoading(false);
            });

            return () => unsubscribe();
        }
        */
    }, [/* user */]);


    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{bubble ? bubble.name : "My Bubble"}</Text>
            <View style={styles.bubbleContainer}>
                {bubble && <BubbleView bubble={bubble} center={150} />}
            </View>
            <View style={styles.controls}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Add Participant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Broadcast Status</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Approve Referrals</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
    },
    bubbleContainer: {
        flex: 1,
        width: '100%',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
    },
    button: {
        backgroundColor: '#6366F1',
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});