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

    const renderItem = ({ item, index }) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let fechasPagos = [];
        const fechaBase = new Date(item.fechaInicio);

        if (item.frecuencia === 'único') {
            fechasPagos = [fechaBase];
        }

        if (item.frecuencia === 'dias') {
            const rep = item.repeticiones || 100;
            const intervalo = item.intervaloDias;
            for (let i = 0; i < rep; i++) {
                const f = new Date(fechaBase);
                f.setDate(f.getDate() + i * intervalo);
                fechasPagos.push(f);
            }
        }

        if (item.frecuencia === 'semanal') {
            const rep = item.repeticiones || 100;
            for (let i = 0; i < rep; i++) {
                const f = new Date(fechaBase);
                f.setDate(f.getDate() + i * 7);
                fechasPagos.push(f);
            }
        }

        if (item.frecuencia === 'personalizada') {
            fechasPagos = item.fechas?.map(f => new Date(f)) || [];
        }

        if (item.frecuencia === 'fija') {
            const rep = item.meses || 100;
            for (let i = 0; i < rep; i++) {
                const f = new Date(fechaBase);
                f.setMonth(f.getMonth() + i);
                fechasPagos.push(f);
            }
        }

        const vencidas = fechasPagos.filter(f => f <= hoy);
        const futuras = fechasPagos.filter(f => f > hoy);

        const fechaVencida = vencidas.length > 0
            ? vencidas[vencidas.length - 1].toISOString().split('T')[0]
            : '—';

        const fechaSiguiente = futuras.length > 0
            ? futuras[0].toISOString().split('T')[0]
            : '✔ Completado';

        return (
            <View style={[styles.item, styles.amarillo]}>
                <Text style={styles.titulo}>💰 {item.motivo}</Text>
                <Text style={styles.texto}>Monto total: S/ {item.montoTotal}</Text>
                <Text style={styles.texto}>Frecuencia: {item.frecuencia}</Text>
                <Text style={styles.texto}>📅 Último pago vencido: {fechaVencida}</Text>
                <Text style={styles.texto}>📆 Próximo pago: {fechaSiguiente}</Text>

                {futuras.length > 0 && (
                    <>
                        <TouchableOpacity
                            style={styles.botonVerHistorial}
                            onPress={() => navigation.navigate('Historial', { deuda: item })}
                        >
                            <Text style={styles.texto}>📚 Ver historial</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botonSecundario}
                            onPress={() => navigation.navigate('MarcarPagado', { deuda: item, index })}
                        >
                            <Text style={styles.botonSecundarioTexto}>Marcar como pagado</Text>
                        </TouchableOpacity>
                    </>
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
        botonSecundario: {
            backgroundColor: '#4478d8',
            marginTop: 12,
            borderRadius: 5,
            paddingVertical: 10,
            alignItems: 'center',
        },
        botonSecundarioTexto: {
            color: '#fff',
            fontWeight: 'bold',
        },
        botonVerHistorial: {
            marginTop: 10,
            backgroundColor: '#aaa',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
        }

    });
};
