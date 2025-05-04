import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deudas';

export const guardarDeuda = async (nuevaDeuda) => {
    try {
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        const lista = datos ? JSON.parse(datos) : [];

        lista.push(nuevaDeuda);

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
