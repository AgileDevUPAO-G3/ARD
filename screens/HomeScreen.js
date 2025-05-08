import React, { useEffect, useState } from 'react';
import {
    View, FlatList, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import { useColorScheme } from 'react-native';
import { obtenerDeudas } from '../utils/storage';

export default function HomeScreen({ navigation }) {
    const sistemaEsquema = useColorScheme();
    const [modoManual, setModoManual] = useState(null);
    const esquema = modoManual || sistemaEsquema;
    const styles = getStyles(esquema);

    const [deudas, setDeudas] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerDeudas();
            setDeudas(data);
        };

        const unsubscribe = navigation.addListener('focus', cargar);
        return unsubscribe;
    }, [navigation]);

    // 🔢 Cálculo dinámico de cuotas vencidas
    const obtenerCuotasVencidas = (detalleCuotas) => {
        const hoy = new Date();
        return detalleCuotas.filter(cuota => new Date(cuota.fecha) <= hoy).length;
    };

    const renderItem = ({ item }) => {
        const esCuotas = item.tipo === 'cuotas';
        const estiloLateral = esCuotas ? styles.violeta : styles.amarillo;

        let proximoPago = '';
        let cuotasRestantes = item.cuotas;

        if (esCuotas && Array.isArray(item.detalleCuotas)) {
            const hoy = new Date().toISOString().split('T')[0];
            const siguientes = item.detalleCuotas.filter(cuota => cuota.fecha >= hoy);
            proximoPago = siguientes.length > 0 ? siguientes[0].fecha : '✔ Pagado';

            const vencidas = obtenerCuotasVencidas(item.detalleCuotas);
            cuotasRestantes = Math.max(item.cuotas - vencidas, 0);
        }

        return (
            <View style={[styles.item, estiloLateral]}>
                <Text style={styles.titulo}>💰 {item.motivo}</Text>
                <Text style={styles.texto}>Monto total: S/ {item.montoTotal}</Text>
                <Text style={styles.texto}>
                    Tipo: {esCuotas ? (cuotasRestantes === 0 ? '✔ Pagado' : `Cuotas (${cuotasRestantes})`) : 'Pago único'}
                </Text>
                {esCuotas ? (
                    <Text style={styles.texto}>Próximo pago: {proximoPago}</Text>
                ) : (
                    <Text style={styles.texto}>Día de pago: {item.fechaInicio}</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Registrar deuda')}>
                <Text style={styles.botonTexto}>Registrar nueva deuda 📝</Text>
            </TouchableOpacity>

            <FlatList
                data={deudas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={[styles.texto, { marginTop: 20 }]}>
                        No hay deudas registradas
                    </Text>
                }
                contentContainerStyle={{
                    paddingBottom: 20,
                    paddingRight: 25,
                }}
                showsVerticalScrollIndicator={true}
            />
        </View>
    );
}

const getStyles = (modo) => {
    const esOscuro = modo === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: esOscuro ? '#121212' : '#ffffff',
        },
        item: {
            padding: 15,
            marginVertical: 10,
            backgroundColor: esOscuro ? '#1e1e1e' : '#f9f9f9',
            borderRadius: 8,
            borderLeftWidth: 9,
        },
        amarillo: {
            borderLeftColor: '#FFD700',
        },
        violeta: {
            borderLeftColor: '#8A2BE2',
        },
        titulo: {
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 4,
            color: esOscuro ? '#f1f1f1' : '#222',
        },
        texto: {
            color: esOscuro ? '#ccc' : '#333',
        },
        boton: {
            backgroundColor: '#2d9b55',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
            marginHorizontal: 70,
        },
        botonTexto: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
        },
    });
};
