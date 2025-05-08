import React, { useState } from 'react';
import {
    View, TextInput, Alert, Text, Platform, TouchableOpacity, StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { guardarDeuda } from '../utils/storage';
import { useColorScheme } from 'react-native';

export default function AddDebtScreen({ navigation }) {
    const sistemaEsquema = useColorScheme();
    const [modoManual, setModoManual] = useState(null);
    const esquema = modoManual || sistemaEsquema;
    const styles = getStyles(esquema);

    const [motivo, setMotivo] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [tipo, setTipo] = useState('único');
    const [cuotas, setCuotas] = useState('');

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
                placeholderTextColor={styles.placeholder.color}
                style={styles.input}
            />
            <TextInput
                placeholder="Monto total (ej. 1500)"
                value={monto}
                onChangeText={setMonto}
                keyboardType="numeric"
                inputMode="decimal"
                placeholderTextColor={styles.placeholder.color}
                style={styles.input}
            />
            <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.input}>
                <Text style={styles.text}>Fecha: {fecha.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
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
                <TouchableOpacity
                    onPress={() => setTipo('único')}
                    style={tipo === 'único' ? styles.botonUnicoActivo : styles.botonUnicoInactivo}
                >
                    <Text style={styles.botonTexto}>Pago único</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTipo('cuotas')}
                    style={tipo === 'cuotas' ? styles.botonCuotasActivo : styles.botonCuotasInactivo}
                >
                    <Text style={styles.botonTexto}>Pago por cuotas</Text>
                </TouchableOpacity>
            </View>

            {tipo === 'cuotas' && (
                <TextInput
                    placeholder="Número de cuotas"
                    value={cuotas}
                    onChangeText={setCuotas}
                    keyboardType="numeric"
                    placeholderTextColor={styles.placeholder.color}
                    style={styles.input}
                />
            )}

            <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
                <Text style={styles.botonGuardarTexto}>Guardar deuda</Text>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (modo) => {
    const esOscuro = modo === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            justifyContent: 'center',
            backgroundColor: esOscuro ? '#121212' : '#fff',
        },
        input: {
            borderWidth: 1,
            borderColor: '#4c4c4c',
            borderRadius: 5,
            padding: 10,
            marginBottom: 15,
            color: esOscuro ? '#fff' : '#000',
            backgroundColor: esOscuro ? '#1e1e1e' : '#f5f5f5',
        },
        placeholder: {
            color: esOscuro ? '#888' : '#555',
        },
        text: {
            color: esOscuro ? '#eee' : '#222',
        },
        label: {
            fontWeight: 'bold',
            marginBottom: 5,
            color: esOscuro ? '#f1f1f1' : '#222',
        },
        selector: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 15,
        },
        botonUnicoActivo: {
            backgroundColor: '#FFD700',
            borderRadius: 5,
            padding: 12,
            width: '45%',
            alignItems: 'center',
        },
        botonUnicoInactivo: {
            backgroundColor: 'rgba(255,215,0,0.48)',
            borderRadius: 5,
            padding: 12,
            width: '45%',
            alignItems: 'center',
        },
        botonCuotasActivo: {
            backgroundColor: '#8A2BE2',
            borderRadius: 5,
            padding: 12,
            width: '45%',
            alignItems: 'center',
        },
        botonCuotasInactivo: {
            backgroundColor: 'rgba(138,43,226,0.25)',
            borderRadius: 5,
            padding: 12,
            width: '45%',
            alignItems: 'center',
        },
        botonTexto: {
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 18,
        },
        botonGuardar: {
            backgroundColor: '#2d9b55',
            borderRadius: 5,
            paddingHorizontal: 60,
            alignItems: 'center',
            paddingVertical: 15,
        },

        botonGuardarTexto: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
};
