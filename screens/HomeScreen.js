import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Button } from 'react-native';
import { obtenerDeudas } from '../utils/storage';

export default function HomeScreen({ navigation }) {
    const [deudas, setDeudas] = useState([]);

    // Se ejecuta al entrar a la pantalla
    useEffect(() => {
        const cargar = async () => {
            const lista = await obtenerDeudas();
            setDeudas(lista);
        };

        const unsubscribe = navigation.addListener('focus', cargar);
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Button title="Registrar nueva deuda" onPress={() => navigation.navigate('Registrar deuda')} />

            <FlatList
                data={deudas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.text}>📌 {item.motivo}</Text>
                        <Text>Monto: S/ {item.monto}</Text>
                        <Text>Fecha: {item.fecha}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ marginTop: 20 }}>No hay deudas registradas</Text>}
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
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});