import React from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, TouchableWithoutFeedback
} from 'react-native';

export default function HistorialScreen({ route }) {
    const { deuda } = route.params;
    const historial = deuda.historialPagos || [];
    const [imagenSeleccionada, setImagenSeleccionada] = React.useState(null);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => setImagenSeleccionada(item.uri)} style={styles.item}>
            <Image source={{ uri: item.uri }} style={styles.preview} resizeMode="cover" />
            <Text style={styles.fecha}>🕒 {new Date(item.fecha).toLocaleDateString()}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>📚 Historial de pagos</Text>

            {historial.length === 0 ? (
                <Text style={styles.textoVacio}>No hay nada registrado</Text>
            ) : (
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
                        <Image source={{ uri: imagenSeleccionada }} style={styles.imagenGrande} resizeMode="contain" />
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
