import React, { useEffect, useState } from 'react';
import {
    View, FlatList, Text, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { useColorScheme } from 'react-native';
import { obtenerDeudas, guardarDeuda, actualizarDeuda } from '../utils/storage';


export default function HomeScreen({ navigation }) {
    const sistemaEsquema = useColorScheme();
    const [modoManual, setModoManual] = useState(null);
    const esquema = modoManual || sistemaEsquema;
    const styles = getStyles(esquema);

    const [deudasFiltradas, setDeudasFiltradas] = useState([]);
    const [mesActual, setMesActual] = useState(new Date());
    const [alertaMostrada, setAlertaMostrada] = useState(false); // Estado para evitar mostrar alerta varias veces

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerDeudas();
            filtrarPorMes(data);
        };

        const unsubscribe = navigation.addListener('focus', cargar);
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        obtenerDeudas().then(filtrarPorMes);
    }, [mesActual]);

    const filtrarPorMes = (deudas) => {
        console.log('Filtrando deudas por mes...');

        const año = mesActual.getFullYear();
        const mes = mesActual.getMonth(); // 0-indexed
        const resultado = [];

        deudas.forEach((item, index) => {
            console.log(`Procesando deuda: ${item.motivo}`);
            const fechaBase = new Date(item.fechaInicio);
            const historial = item.historialPagos || [];
            const fechasPagadas = new Set(historial.map(p => p.fecha));
            const fechasEnMes = [];

            const agregarFecha = (f) => {
                if (f.getFullYear() === año && f.getMonth() === mes) {
                    const fStr = f.toISOString().split('T')[0];
                    console.log(`Agregando fecha: ${fStr} con estado: ${fechasPagadas.has(fStr) ? '✔ Pagado' : '⏳ Pendiente'}`);
                    fechasEnMes.push({
                        fecha: fStr,
                        estado: fechasPagadas.has(fStr) ? '✔ Pagado' : '⏳ Pendiente'
                    });
                }
            };

            // Agregar fechas según frecuencia
            if (item.frecuencia === 'único') agregarFecha(fechaBase);
            if (item.frecuencia === 'dias') {
                const rep = item.repeticiones || 100;
                const intervalo = item.intervaloDias;
                for (let i = 0; i < rep; i++) {
                    const f = new Date(fechaBase);
                    f.setDate(f.getDate() + i * intervalo);
                    agregarFecha(f);
                }
            }
            if (item.frecuencia === 'semanal') {
                const rep = item.repeticiones || 100;
                for (let i = 0; i < rep; i++) {
                    const f = new Date(fechaBase);
                    f.setDate(f.getDate() + i * 7);
                    agregarFecha(f);
                }
            }
            if (item.frecuencia === 'fija') {
                const rep = item.meses || 100;
                for (let i = 0; i < rep; i++) {
                    const f = new Date(fechaBase);
                    f.setMonth(f.getMonth() + i);
                    agregarFecha(f);
                }
            }
            if (item.frecuencia === 'personalizada') {
                (item.fechas || []).forEach(fechaStr => {
                    const f = new Date(fechaStr);
                    agregarFecha(f);
                });
            }

            if (item.frecuencia === 'inicio_mes' || item.frecuencia === 'fin_mes') {
                const rep = item.meses || 100;
                for (let i = 0; i < rep; i++) {
                    const f = new Date(fechaBase);
                    f.setMonth(f.getMonth() + i);

                    if (item.frecuencia === 'inicio_mes') {
                        f.setDate(1);
                    } else {
                        f.setMonth(f.getMonth() + 1);
                        f.setDate(0); // último día del mes anterior
                    }

                    agregarFecha(f);
                }
            }

            if (fechasEnMes.length > 0) {
                resultado.push({
                    ...item,
                    index,
                    fechasDelMes: fechasEnMes
                });
            }
        });
        console.log('Deudas filtradas:', resultado);  // Log para ver las deudas filtradas
        setDeudasFiltradas(resultado);
    };

    const cambiarMes = (delta) => {
        const nuevo = new Date(mesActual);
        nuevo.setMonth(nuevo.getMonth() + delta);
        setMesActual(nuevo);
    };

    const renderItem = ({ item }) => {
        const pagosRealizados = (item.historialPagos || []).length;
        console.log(`Renderizando deuda: ${item.motivo}, Pagos realizados: ${pagosRealizados}`);  // Log para pagos realizados

        // Ver los estados de las fechas
        item.fechasDelMes.forEach((fechaItem, index) => {
            console.log(`Fecha ${index}: ${fechaItem.fecha} - Estado: ${fechaItem.estado}`);
        });

        // Ajustar totalPagos según el tipo de frecuencia y las repeticiones
        let totalPagos = item.repeticiones || 1;

        if (item.frecuencia === 'semanal' || item.frecuencia === 'fija') {
            totalPagos = item.repeticiones || 1;
        } else if (item.frecuencia === 'dias') {
            totalPagos = item.repeticiones || 1;
        } else if (item.frecuencia === 'inicio_mes' || item.frecuencia === 'fin_mes') {
            totalPagos = item.meses || 1; // Número de meses a pagar
        }

        const completado = pagosRealizados >= totalPagos;

        const hoy = new Date();
        const fechaUltimoPago = new Date(item.fechasDelMes[0]?.fecha);
        const vencidoHoy = fechaUltimoPago.toDateString() === hoy.toDateString() && item.fechasDelMes[0].estado === '⏳ Pendiente';
        const vencido = fechaUltimoPago < hoy && item.fechasDelMes[0].estado === '⏳ Pendiente';
        const proximoPagoEstaSemana = (fechaUltimoPago - hoy) <= 7 * 24 * 60 * 60 * 1000 && item.fechasDelMes[0].estado === '⏳ Pendiente';

        const bordeColor = completado
            ? '#cccccc'
            : vencidoHoy
                ? '#FFD700'
                : vencido
                    ? '#FF6F6F'
                    : proximoPagoEstaSemana
                        ? '#FFD700'
                        : item.fechasDelMes[0].estado === '✔ Pagado'
                            ? '#D3D3D3'
                            : '#75cec5';

        // Verificar el índice del primer pago pendiente
        const primerPagoPendienteIndex = item.fechasDelMes.findIndex(f => f.estado === '⏳ Pendiente');
        console.log(`Primer pago pendiente para deuda ${item.motivo} en la fecha: ${primerPagoPendienteIndex}`);

        // Agregar más logs para verificar si la comparación funciona correctamente
        item.fechasDelMes.forEach((fechaItem) => {
            console.log(`Comparando fecha: ${fechaItem.fecha} con estado: ${fechaItem.estado}`);
            // Verificar si las fechas son comparables y con el estado correcto
        });

        // Si ya se pagó la fecha, actualizamos el estado
        const actualizarEstadoPago = () => {
            console.log('Actualizando estado de la deuda...', item.index);
            // Verificar que estamos buscando la deuda correcta
            console.log('Fechas actuales de la deuda:', item.fechasDelMes);
            console.log('Historial de pagos actual:', item.historialPagos);

            // Copiar las fechas del mes
            const nuevasFechasDelMes = [...item.fechasDelMes];

            // Verificar cuál es la fecha pendiente
            if (primerPagoPendienteIndex >= 0) {
                console.log(`Fecha pendiente encontrada: ${nuevasFechasDelMes[primerPagoPendienteIndex].fecha}`);
                nuevasFechasDelMes[primerPagoPendienteIndex].estado = '✔ Pagado';
            } else {
                console.log('No se encontró ninguna fecha pendiente.');
            }

            // Verifica que las fechas se están actualizando correctamente
            console.log('Fechas después de actualización:', nuevasFechasDelMes);

            // Actualizar la deuda con el nuevo estado de fechasDelMes
            const deudaActualizada = {
                ...item,
                fechasDelMes: nuevasFechasDelMes,
            };

            console.log('Deuda actualizada antes de guardar:', deudaActualizada);
            // Guardar la deuda actualizada en el almacenamiento
            actualizarDeudaEnStorage(deudaActualizada);
        };


        const desactivarPago = primerPagoPendienteIndex === -1 || item.fechasDelMes[primerPagoPendienteIndex].estado === '✔ Pagado';
        console.log(`Desactivar pago para deuda ${item.motivo}: ${desactivarPago}`);

        return (
            <View style={[styles.item, { borderLeftColor: bordeColor }, completado && { opacity: 0.5 }]}>
                <Text style={styles.titulo}>💰 {item.motivo}</Text>
                <Text style={styles.texto}>Monto a pagar: S/ {item.montoTotal}</Text>
                <Text style={styles.texto}>
                    Tipo de pago: {item.frecuencia === 'inicio_mes'
                    ? 'Mensual (inicio de mes)'
                    : item.frecuencia === 'fin_mes'
                        ? 'Mensual (fin de mes)'
                        : item.frecuencia}
                </Text>

                {item.fechasDelMes.length > 0 && (
                    <Text style={[styles.texto, { marginTop: 6, fontWeight: 'bold' }]}>{/* Aquí muestra la fecha y el estado actual */}
                        📆 Pago del mes: {item.fechasDelMes[0].fecha} - {item.fechasDelMes[0].estado}
                    </Text>
                )}

                {/* ✅ Progreso */}
                <Text style={[styles.texto, { fontStyle: 'italic', marginTop: 4 }]}>
                    Progreso de pagos: {pagosRealizados} / {totalPagos}
                </Text>

                {/* 📚 Ver historial (siempre accesible) */}
                <TouchableOpacity
                    style={styles.botonVerHistorial}
                    onPress={() => navigation.navigate('Historial', { deuda: item, index: item.index })}
                >
                    <Text style={styles.texto}>📚 Ver historial</Text>
                </TouchableOpacity>

                {/* ✅ Mostrar botón de marcar como pagado si el pago aún está pendiente */}
                {!completado && primerPagoPendienteIndex >= 0 && (
                    <TouchableOpacity
                        style={[styles.botonSecundario, desactivarPago && { backgroundColor: '#d3d3d3' }]}
                        onPress={() => {
                            // Cuando el pago se marca como pagado, actualizar el estado
                            actualizarEstadoPago();
                            navigation.navigate('MarcarPagado', { deuda: item, index: item.index });
                        }}
                        disabled={desactivarPago}
                    >
                        <Text style={styles.botonSecundarioTexto}>Marcar como pagado</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

// Función para actualizar la deuda en el almacenamiento
    const actualizarDeudaEnStorage = async (deudaActualizada) => {
        try {
            console.log('Guardando deuda actualizada:', deudaActualizada);
            const deudas = await obtenerDeudas(); // Obtén las deudas actuales
            const index = deudas.findIndex(deuda => deuda.index === deudaActualizada.index);
            if (index >= 0) {
                deudas[index] = deudaActualizada; // Reemplazamos la deuda con la nueva información
                console.log('Deuda antes de guardar en AsyncStorage:', deudas[index]);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deudas)); // Guardamos las deudas actualizadas
            } else {
                console.warn('Deuda no encontrada en almacenamiento');
            }
        } catch (error) {
            console.error('Error al actualizar deuda en storage:', error);
        }
    };



    useEffect(() => {
        deudasFiltradas.forEach(item => {
            const hoy = new Date();
            const fechaUltimoPago = new Date(item.fechasDelMes[0]?.fecha);
            const esHoy = fechaUltimoPago.toDateString() === hoy.toDateString();
            if (esHoy && item.fechasDelMes[0].estado === '⏳ Pendiente' && !alertaMostrada) {
                Alert.alert(
                    'Alerta',
                    `¡La deuda de ${item.motivo} vence hoy y aún no se ha pagado!`
                );
                setAlertaMostrada(true);
            }
        });
    }, [deudasFiltradas, alertaMostrada]);



    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Registrar deuda')}>
                <Text style={styles.botonTexto}>Registrar nueva deuda 📝</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.botonMes}>
                    <Text style={styles.botonTexto}>◀ Mes anterior</Text>
                </TouchableOpacity>
                <Text style={[styles.titulo, { fontSize: 16 }]}>
                    {mesActual.toLocaleString('default', { month: 'long' }).toUpperCase()} {mesActual.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.botonMes}>
                    <Text style={styles.botonTexto}>Mes siguiente ▶</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={deudasFiltradas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={[styles.texto, { marginTop: 20 }]}>
                        No hay deudas registradas para este mes
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
            padding: 16,
            backgroundColor: esOscuro ? '#121212' : '#ffffff',
        },
        item: {
            padding: 15,
            marginVertical: 10,
            backgroundColor: esOscuro ? '#1e1e1e' : '#f9f9f9',
            borderRadius: 8,
            borderLeftWidth: 15,
        },
        amarillo: {
            borderLeftColor: '#bca51d',
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
        },
        botonMes: {
            padding: 8,
            backgroundColor: '#cccccc',
            borderRadius: 5,
        }
    });
};
