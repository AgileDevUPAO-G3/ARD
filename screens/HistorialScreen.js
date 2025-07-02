import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerDeudas } from '../utils/storage';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { actualizarDeuda } from '../utils/storage'; // Asegúrate de tener esta función

export default function HistorialScreen({ route }) {
    const { deuda, index } = route.params;
    const historial = deuda.historialPagos || [];
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

    const numeroDeArchivos = historial.length;
    const repeticiones = deuda.repeticiones || 1; // por defecto 1 para deudas únicas

    useEffect(() => {
        const actualizarEstado = async () => {
            const yaPagada = numeroDeArchivos >= repeticiones;

            if (
                deuda.archivosGuardados !== numeroDeArchivos ||
                deuda.estaPagada !== yaPagada
            ) {
                const nuevaDeuda = {
                    ...deuda,
                    archivosGuardados: numeroDeArchivos,
                    estaPagada: yaPagada,
                };

                await actualizarDeuda(index, nuevaDeuda);
                console.log('Deuda actualizada desde historial:', nuevaDeuda);
            }
        };

        actualizarEstado();
    }, [numeroDeArchivos]);
    useFocusEffect(
        React.useCallback(() => {
            const cargarDeudas = async () => {
                const lista = await obtenerDeudas();
                setDeudas(lista); // o como se llame tu estado de lista
            };

            cargarDeudas();
        }, [])
    );
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => setImagenSeleccionada(item.uri)} style={styles.item}>
            <Image source={{ uri: item.uri }} style={styles.preview} resizeMode="cover" />
            <Text style={styles.fecha}>
                🕒 {new Date(item.fecha).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>📚 Historial de pagos</Text>

            {numeroDeArchivos > 0 ? (
                <Text style={styles.texto}>Total de comprobantes guardados: {numeroDeArchivos}</Text>
            ) : (
                <Text style={styles.textoVacio}>No hay nada registrado</Text>
            )}

            {numeroDeArchivos > 0 && (
                <FlatList
                    data={historial}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Modal visible={!!imagenSeleccionada} transparent>
                <TouchableWithoutFeedback onPress={() => setImagenSeleccionada(null)}>
                    <View style={styles.modalOverlay}>
                        <Image
                            source={{ uri: imagenSeleccionada }}
                            style={styles.imagenGrande}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    textoVacio: { fontSize: 16, color: '#888', marginTop: 30 },
    texto: { fontSize: 16, marginTop: 15, color: '#333' },
    item: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        height: 200,
    },
    fecha: {
        padding: 8,
        fontSize: 14,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenGrande: {
        width: '90%',
        height: '80%',
    },
});
