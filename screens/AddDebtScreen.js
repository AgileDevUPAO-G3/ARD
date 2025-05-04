import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Platform, Pressable, Text } from 'react-native';
import { guardarDeuda } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddDebtScreen({ navigation }) {
    const [motivo, setMotivo] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);

    const onChangeFecha = (event, selectedDate) => {
        setMostrarPicker(false);
        if (selectedDate) {
            setFecha(selectedDate);
        }
    };

    const guardar = async () => {
        if (!motivo.trim() || !monto.trim()) {
            Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
            return;
        }

        const numero = parseFloat(monto);
        if (isNaN(numero) || numero <= 0) {
            Alert.alert('Monto inválido', 'El monto debe ser un número positivo.');
            return;
        }

        const nuevaDeuda = {
            motivo: motivo.trim(),
            monto: numero,
            fecha: fecha.toISOString().split('T')[0], // YYYY-MM-DD
        };

        await guardarDeuda(nuevaDeuda);
        Alert.alert('Éxito', 'La deuda fue registrada correctamente.');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Motivo de la deuda"
                value={motivo}
                onChangeText={setMotivo}
                style={styles.input}
            />
            <TextInput
                placeholder="Monto (ej. 123.45)"
                value={monto}
                onChangeText={setMonto}
                keyboardType="numeric"
                inputMode="decimal"
                style={styles.input}
            />

            <Pressable onPress={() => setMostrarPicker(true)} style={styles.input}>
                <Text style={{ color: '#333' }}>📅 {fecha.toISOString().split('T')[0]}</Text>
            </Pressable>

            {mostrarPicker && (
                <DateTimePicker
                    value={fecha}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeFecha}
                />
            )}

            <Button title="Guardar deuda" onPress={guardar} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, padding: 20, justifyContent: 'center',
    },
    input: {
        borderWidth: 1, borderColor: '#ccc',
        borderRadius: 5, padding: 10, marginBottom: 15,
    },
});
