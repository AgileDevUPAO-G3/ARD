import React, { useState } from 'react';
import { useColorScheme } from 'react-native';

import {
    View, TextInput, Button, StyleSheet, Alert, Pressable, Text, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { guardarDeuda } from '../utils/storage';

export default function AddDebtScreen({ navigation }) {
    const [motivo, setMotivo] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [tipo, setTipo] = useState('único'); // 'único' o 'cuotas'
    const [cuotas, setCuotas] = useState('');
    const esquema = useColorScheme(); // devuelve 'light' o 'dark'
    const esOscuro = esquema === 'dark';


    const onChangeFecha = (event, selectedDate) => {
        setMostrarPicker(false);
        if (selectedDate) setFecha(selectedDate);
    };

    const calcularCuotas = (fechaInicio, total, numCuotas) => {
        const cuotasArr = [];
        const montoPorCuota = parseFloat(total) / numCuotas;
        const baseDate = new Date(fechaInicio);

        for (let i = 0; i < numCuotas; i++) {
            const cuotaFecha = new Date(baseDate);
            cuotaFecha.setMonth(cuotaFecha.getMonth() + i);
            cuotasArr.push({
                numero: i + 1,
                fecha: cuotaFecha.toISOString().split('T')[0],
                monto: parseFloat(montoPorCuota.toFixed(2)),
            });
        }

        return cuotasArr;
    };

    const guardar = async () => {
        if (!motivo.trim() || !monto.trim()) {
            Alert.alert('Campos incompletos', 'Por favor completa motivo y monto.');
            return;
        }

        if (tipo === 'cuotas' && (!cuotas || parseInt(cuotas) <= 0)) {
            Alert.alert('Cuotas inválidas', 'Ingresa un número válido de cuotas.');
            return;
        }

        const deuda = {
            motivo: motivo.trim(),
            montoTotal: parseFloat(monto),
            tipo,
            fechaInicio: fecha.toISOString().split('T')[0],
        };

        if (tipo === 'cuotas') {
            deuda.cuotas = parseInt(cuotas);
            deuda.detalleCuotas = calcularCuotas(fecha, monto, cuotas);
        }

        await guardarDeuda(deuda);
        Alert.alert('Éxito', 'La deuda ha sido registrada.');
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
                placeholder="Monto total (ej. 1500)"
                value={monto}
                onChangeText={setMonto}
                keyboardType="numeric"
                inputMode="decimal"
                style={styles.input}
            />
            <Pressable onPress={() => setMostrarPicker(true)} style={styles.input}>
                <Text style={{ color: '#333' }}>
                    📅 Fecha: {fecha.toISOString().split('T')[0]}
                </Text>
            </Pressable>
            {mostrarPicker && (
                <DateTimePicker
                    value={fecha}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeFecha}
                />
            )}

            <Text style={styles.label}>Tipo de pago:</Text>
            <View style={styles.selector}>
                <Pressable onPress={() => setTipo('único')} style={tipo === 'único' ? styles.selected : styles.option}>
                    <Text>Pago único</Text>
                </Pressable>
                <Pressable onPress={() => setTipo('cuotas')} style={tipo === 'cuotas' ? styles.selected : styles.option}>
                    <Text>Pago por cuotas</Text>
                </Pressable>
            </View>

            {tipo === 'cuotas' && (
                <TextInput
                    placeholder="Número de cuotas"
                    value={cuotas}
                    onChangeText={setCuotas}
                    keyboardType="numeric"
                    style={styles.input}
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
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    option: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 5,
        padding: 10,
        width: '45%',
        alignItems: 'center',
    },
    selected: {
        borderWidth: 2,
        borderColor: '#007bff',
        backgroundColor: '#e0f0ff',
        borderRadius: 5,
        padding: 10,
        width: '45%',
        alignItems: 'center',
    },
});
