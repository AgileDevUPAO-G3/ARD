import React, { useState } from 'react';
import {
    View, TextInput, Alert, Text, Platform, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { guardarDeuda } from '../utils/storage';
import { useColorScheme } from 'react-native';

export default function AddDebtScreen({ navigation }) {
    const sistemaEsquema = useColorScheme();
    const [modoManual, setModoManual] = useState(null);
    const esquema = modoManual || sistemaEsquema;
    const styles = getStyles(esquema);

    const [indiceFechaPersonalizadaActual, setIndiceFechaPersonalizadaActual] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [monto, setMonto] = useState('');
    const [frecuencia, setFrecuencia] = useState('único');
    const [fecha, setFecha] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);

    const [diasIntervalo, setDiasIntervalo] = useState('');
    const [repeticiones, setRepeticiones] = useState('');
    const [fechasPersonalizadas, setFechasPersonalizadas] = useState([]);

    const onChangeFecha = (event, selectedDate) => {
        setMostrarPicker(false);
        if (selectedDate) {
            if (indiceFechaPersonalizadaActual !== null) {
                actualizarFechaPersonalizada(indiceFechaPersonalizadaActual, selectedDate);
                setIndiceFechaPersonalizadaActual(null);
            } else {
                setFecha(selectedDate);
            }
        }
    };

    // ✅ FIX: ahora permite al usuario seleccionar la nueva fecha inmediatamente
    const agregarFechaPersonalizada = () => {
        const nuevaFecha = new Date();
        const nuevasFechas = [...fechasPersonalizadas, nuevaFecha];
        setFechasPersonalizadas(nuevasFechas);
        setIndiceFechaPersonalizadaActual(nuevasFechas.length - 1);
        setFecha(nuevaFecha);
        setMostrarPicker(true);
    };

    const actualizarFechaPersonalizada = (index, nuevaFecha) => {
        const nuevasFechas = [...fechasPersonalizadas];
        nuevasFechas[index] = nuevaFecha;
        setFechasPersonalizadas(nuevasFechas);
    };

    const guardar = async () => {
        const montoNumerico = parseFloat(monto);
        const repeticionesNum = repeticiones ? parseInt(repeticiones) : 0;

        if (!motivo.trim() || !monto.trim()) {
            Alert.alert('Campos incompletos', 'Por favor completa motivo y monto.');
            return;
        }

        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            Alert.alert('Monto inválido', 'Por favor ingresa un monto mayor a 0.');
            return;
        }

        if (repeticiones && repeticionesNum < 0) {
            Alert.alert('Repeticiones inválidas', 'La cantidad de repeticiones no puede ser negativa.');
            return;
        }

        const deuda = {
            motivo: motivo.trim(),
            montoTotal: montoNumerico,
            frecuencia,
            fechaInicio: fecha.toISOString().split('T')[0],
        };

        if (frecuencia === 'dias') {
            const intervalo = parseInt(diasIntervalo);
            if (isNaN(intervalo) || intervalo <= 0) {
                Alert.alert('Intervalo inválido', 'Debes ingresar un número de días mayor a 0.');
                return;
            }
            deuda.intervaloDias = intervalo;
            if (repeticiones) deuda.repeticiones = repeticionesNum;
        } else if (frecuencia === 'semanal') {
            if (repeticiones) deuda.repeticiones = repeticionesNum;
        } else if (frecuencia === 'personalizada') {
            deuda.fechas = fechasPersonalizadas.map(f => f.toISOString().split('T')[0]);
        } else if (frecuencia === 'fija') {
            if (repeticiones) deuda.meses = repeticionesNum;
        }

        await guardarDeuda(deuda);
        Alert.alert('Éxito', 'La deuda ha sido registrada.');
        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
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

            <Text style={styles.label}>Tipo de frecuencia:</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={frecuencia}
                    onValueChange={(itemValue) => setFrecuencia(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Pago único" value="único" />
                    <Picker.Item label="Cada ciertos días" value="dias" />
                    <Picker.Item label="Semanalmente" value="semanal" />
                    <Picker.Item label="Fecha personalizada" value="personalizada" />
                    <Picker.Item label="Mensual (fecha fija)" value="fija" />
                </Picker>
            </View>

            {(frecuencia === 'único' || frecuencia === 'dias' || frecuencia === 'semanal' || frecuencia === 'fija') && (
                <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.input}>
                    <Text style={styles.text}>Fecha de inicio: {fecha.toISOString().split('T')[0]}</Text>
                </TouchableOpacity>
            )}

            {mostrarPicker && (
                <DateTimePicker
                    value={fecha}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeFecha}
                />
            )}

            {frecuencia === 'dias' && (
                <>
                    <TextInput
                        placeholder="Cada cuántos días"
                        value={diasIntervalo}
                        onChangeText={setDiasIntervalo}
                        keyboardType="numeric"
                        placeholderTextColor={styles.placeholder.color}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Repeticiones (opcional)"
                        value={repeticiones}
                        onChangeText={setRepeticiones}
                        keyboardType="numeric"
                        placeholderTextColor={styles.placeholder.color}
                        style={styles.input}
                    />
                </>
            )}

            {frecuencia === 'semanal' && (
                <TextInput
                    placeholder="Número de semanas (opcional)"
                    value={repeticiones}
                    onChangeText={setRepeticiones}
                    keyboardType="numeric"
                    placeholderTextColor={styles.placeholder.color}
                    style={styles.input}
                />
            )}

            {frecuencia === 'fija' && (
                <TextInput
                    placeholder="Número de meses (opcional)"
                    value={repeticiones}
                    onChangeText={setRepeticiones}
                    keyboardType="numeric"
                    placeholderTextColor={styles.placeholder.color}
                    style={styles.input}
                />
            )}

            {frecuencia === 'personalizada' && (
                <>
                    {fechasPersonalizadas.map((f, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                setIndiceFechaPersonalizadaActual(i);
                                setFecha(f);
                                setMostrarPicker(true);
                            }}
                            style={styles.input}
                        >
                            <Text style={styles.text}>📅 {f.toISOString().split('T')[0]}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={agregarFechaPersonalizada} style={styles.botonAgregarFecha}>
                        <Text style={styles.botonGuardarTexto}>+ Agregar fecha</Text>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
                <Text style={styles.botonGuardarTexto}>Guardar deuda</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const getStyles = (modo) => {
    const esOscuro = modo === 'dark';

    return StyleSheet.create({
        container: {
            padding: 20,
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
        pickerWrapper: {
            borderWidth: 1,
            borderColor: '#999',
            borderRadius: 5,
            marginBottom: 15,
            overflow: 'hidden',
        },
        picker: {
            color: esOscuro ? '#fff' : '#000',
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
        botonAgregarFecha: {
            backgroundColor: '#5555ff',
            padding: 12,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 20,
        },
    });
};
