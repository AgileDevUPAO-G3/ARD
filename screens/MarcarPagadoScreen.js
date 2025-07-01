import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'react-native';
import { actualizarDeuda } from '../utils/storage';

export default function MarcarPagadoScreen({ route, navigation }) {
    const { deuda, index } = route.params;
    const esquema = useColorScheme();
    const styles = getStyles(esquema);

    const [modalVisible, setModalVisible] = useState(false);
    const [comprobanteUri, setComprobanteUri] = useState(null);

    const seleccionarComprobante = async () => {
        const permisoGaleria = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permisoGaleria.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para adjuntar comprobantes.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!resultado.canceled && resultado.assets?.length > 0) {
            setComprobanteUri(resultado.assets[0].uri);
        }
    };

    const tomarFoto = async () => {
        const permisoCamara = await ImagePicker.requestCameraPermissionsAsync();
        if (!permisoCamara.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara.');
            return;
        }

        const resultado = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!resultado.canceled && resultado.assets?.length > 0) {
            setComprobanteUri(resultado.assets[0].uri);
        }
    };

    const marcarComoPagado = async () => {
        if (!comprobanteUri) {
            Alert.alert('Comprobante requerido', 'Por favor, adjunta un comprobante antes de confirmar.');
            return;
        }

        const nuevaData = {
            estaPagada: true,
            comprobanteUri,
        };

        await actualizarDeuda(index, nuevaData);
        Alert.alert('Éxito', 'Deuda marcada como pagada.');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>📄 Marcar deuda como pagada</Text>
            <Text style={styles.texto}>Motivo: {deuda.motivo}</Text>
            <Text style={styles.texto}>Monto: S/ {deuda.montoTotal}</Text>
            <Text style={styles.texto}>Fecha de inicio: {deuda.fechaInicio}</Text>

            <TouchableOpacity style={styles.botonArchivo} onPress={seleccionarComprobante}>
                <Text style={styles.botonTexto}>
                    {comprobanteUri ? '📎 Cambiar comprobante' : '📎 Adjuntar comprobante'}
                </Text>
            </TouchableOpacity>

            {comprobanteUri && (
                <>
                    <TouchableOpacity style={styles.previewContainer} onPress={() => setModalVisible(true)}>
                        <Text style={styles.texto}>Vista previa del comprobante:</Text>
                        <Image
                            source={{ uri: comprobanteUri }}
                            style={styles.imagenPreview}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <Modal visible={modalVisible} transparent>
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <Image
                                    source={{ uri: comprobanteUri }}
                                    style={styles.imagenGrande}
                                    resizeMode="contain"
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </>
            )}

            <TouchableOpacity style={styles.botonGuardar} onPress={marcarComoPagado}>
                <Text style={styles.botonGuardarTexto}>✔ Confirmar pago</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonArchivo} onPress={tomarFoto}>
                <Text style={styles.botonTexto}>📷 Tomar foto del comprobante</Text>
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
            backgroundColor: esOscuro ? '#121212' : '#fff',
        },
        titulo: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            color: esOscuro ? '#fff' : '#000',
        },
        texto: {
            fontSize: 16,
            marginBottom: 10,
            color: esOscuro ? '#ccc' : '#333',
        },
        botonArchivo: {
            backgroundColor: '#5555ff',
            padding: 12,
            borderRadius: 5,
            alignItems: 'center',
            marginVertical: 15,
        },
        botonGuardar: {
            backgroundColor: '#2d9b55',
            paddingVertical: 15,
            alignItems: 'center',
            borderRadius: 5,
            marginTop: 20,
        },
        botonTexto: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
        },
        botonGuardarTexto: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        previewContainer: {
            marginVertical: 15,
            alignItems: 'center',
        },
        imagenPreview: {
            width: '100%',
            height: 250,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#999',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        imagenGrande: {
            width: '90%',
            height: '80%',
        },
    });
};
