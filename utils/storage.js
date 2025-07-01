import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deudas';

export const guardarDeuda = async (nuevaDeuda) => {
    try {
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        const lista = datos ? JSON.parse(datos) : [];

        const deudaCompleta = {
            ...nuevaDeuda,
            historialPagos: [], // ← importante
            estaPagada: false,
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
        const deudas = await obtenerDeudas();

        if (!deudas[id]) {
            console.warn(`No se encontró deuda con id ${id}`);
            return;
        }

        deudas[id] = { ...deudas[id], ...nuevaData };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deudas));
    } catch (error) {
        console.error('Error al actualizar deuda:', error);
    }
};

