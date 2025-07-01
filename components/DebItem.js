import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebtItem({ deuda }) {
    return (
        <View style={styles.item}>
            <Text style={styles.text}>💰 {deuda.motivo} - S/ {deuda.monto}</Text>
            <Text style={styles.date}>📅 {deuda.fecha}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        marginVertical: 8,
        padding: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    text: {
        fontSize: 16,
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
});
