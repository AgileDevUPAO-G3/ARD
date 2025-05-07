import React, { useEffect, useState } from 'react';
import {useColorScheme} from "react-native";
import {
    View, FlatList, Text, StyleSheet, Button, TouchableOpacity
} from 'react-native';
import { obtenerDeudas } from '../utils/storage';

export default function HomeScreen({ navigation }) {
    const [deudas, setDeudas] = useState([]);
    const esquema = useColorScheme(); // devuelve 'light' o 'dark'
    const esOscuro = esquema === 'dark';


    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerDeudas();
            setDeudas(data);
        };

        const unsubscribe = navigation.addListener('focus', cargar);
        return unsubscribe;
    }, [navigation]);

    const renderItem = ({ item }) => {
        const esCuotas = item.tipo === 'cuotas';
        const estiloLateral = esCuotas ? styles.violeta : styles.amarillo;

        // Calcular próximo pago si es de cuotas
        let proximoPago = '';
        if (esCuotas && Array.isArray(item.detalleCuotas)) {
            const hoy = new Date().toISOString().split('T')[0];
            const siguientes = item.detalleCuotas.filter(cuota => cuota.fecha >= hoy);
            proximoPago = siguientes.length > 0 ? siguientes[0].fecha : '✔ Pagado';
        }

        return (
            <View style={[styles.item, estiloLateral]}>
                <Text style={styles.titulo}>💰 {item.motivo}</Text>
                <Text>Monto total: S/ {item.montoTotal}</Text>
                <Text>Tipo: {esCuotas ? `Cuotas (${item.cuotas})` : 'Pago único'}</Text>
                {esCuotas && <Text>Próximo pago: {proximoPago}</Text>}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Button title="Registrar nueva deuda" onPress={() => navigation.navigate('Registrar deuda')} />
            <FlatList
                data={deudas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ marginTop: 20 }}>No hay deudas registradas</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, padding: 20, backgroundColor: '#fff',
    },
    item: {
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderLeftWidth: 9,


        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3, // para Android
    },
    amarillo: {
        borderLeftColor: '#FFD700', // amarillo fuerte
    },
    violeta: {
        borderLeftColor: '#8A2BE2', // violeta
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
});
