import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deudas';

export const guardarDeuda = async (nuevaDeuda) => {
    try {
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        const lista = datos ? JSON.parse(datos) : [];

        const deudaCompleta = {
            ...nuevaDeuda,
            historialPagos: [],
            estaPagada: false,
            archivosGuardados: 0 // ← opcional, para evitar undefined más adelante
        };

        lista.push(deudaCompleta);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (error) {
        console.error('Error al guardar deuda:', error);
    }
};


export const obtenerDeudas = async () => {
    try {
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error('Error al leer deudas:', error);
        return [];
    }
};

export const actualizarDeuda = async (id, nuevaData) => {
    try {
        const deudas = await obtenerDeudas(); // Obtén las deudas actuales
        if (!deudas[id]) {
            console.warn(`No se encontró deuda con id ${id}`);
            return;
        }
        deudas[id] = { ...deudas[id], ...nuevaData }; // Actualiza la deuda con la nueva data
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deudas)); // Guarda las deudas actualizadas
    } catch (error) {
        console.error('Error al actualizar deuda:', error);
    }
};

