import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, TouchableWithoutFeedback, Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useColorScheme } from 'react-native';
import { actualizarDeuda } from '../utils/storage';

export default function MarcarPagadoScreen({ route, navigation }) {
    const { deuda, index } = route.params;
    const esquema = useColorScheme();
    const styles = getStyles(esquema);

    const [modalVisible, setModalVisible] = useState(false);
    const [comprobante, setComprobante] = useState(null); // { uri, type, name }

    const seleccionarArchivo = async () => {
        const resultado = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            copyToCacheDirectory: true,
        });

        if (!resultado.canceled && resultado.assets?.length > 0) {
            const file = resultado.assets[0];
            setComprobante({
                uri: file.uri,
                name: file.name,
                type: file.mimeType || '',
            });
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
            const image = resultado.assets[0];
            setComprobante({
                uri: image.uri,
                name: 'foto.jpg',
                type: 'image',
            });
        }
    };

    const marcarComoPagado = async () => {
        if (!comprobante) {
            Alert.alert('Falta comprobante', 'Por favor adjunta un comprobante antes de continuar.');
            return;
        }

        const nuevaData = {
            estaPagada: true,
            comprobanteUri: comprobante.uri,
            comprobanteTipo: comprobante.type,
        };

        await actualizarDeuda(index, nuevaData);
        Alert.alert('Éxito', 'Deuda marcada como pagada.');
        navigation.goBack();
    };

    const abrirArchivo = () => {
        if (comprobante?.uri) {
            Linking.openURL(comprobante.uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>📄 Marcar deuda como pagada</Text>
            <Text style={styles.texto}>Motivo: {deuda.motivo}</Text>
            <Text style={styles.texto}>Monto: S/ {deuda.montoTotal}</Text>
            <Text style={styles.texto}>Fecha de inicio: {deuda.fechaInicio}</Text>

            <TouchableOpacity style={styles.botonArchivo} onPress={seleccionarArchivo}>
                <Text style={styles.botonTexto}>
                    {comprobante ? '📎 Cambiar comprobante' : '📎 Adjuntar comprobante'}
                </Text>
            </TouchableOpacity>

            {comprobante && (
                <View style={styles.previewContainer}>
                    <Text style={styles.texto}>Comprobante seleccionado:</Text>
                    {comprobante.type.startsWith('image') ? (
                        <>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Image
                                    source={{ uri: comprobante.uri }}
                                    style={styles.imagenPreview}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Modal visible={modalVisible} transparent>
                                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                    <View style={styles.modalOverlay}>
                                        <Image
                                            source={{ uri: comprobante.uri }}
                                            style={styles.imagenGrande}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </>
                    ) : (
                        <TouchableOpacity onPress={abrirArchivo} style={styles.archivoPreview}>
                            <Text style={styles.archivoTexto}>📄 {comprobante.name}</Text>
                            <Text style={styles.archivoSubtexto}>Tocar para abrir</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
            height: 200,
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
        archivoPreview: {
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#aaa',
            width: '100%',
            alignItems: 'center',
        },
        archivoTexto: {
            fontSize: 16,
            color: '#333',
        },
        archivoSubtexto: {
            fontSize: 12,
            color: '#777',
        },
    });
};
