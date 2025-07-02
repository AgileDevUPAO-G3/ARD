import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deudas';
const COUNTER_KEY = 'deuda_id_counter'; // Para mantener un contador incremental

export const guardarDeuda = async (nuevaDeuda) => {
    try {
        // Obtén las deudas actuales
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        const lista = datos ? JSON.parse(datos) : [];

        // Obtén el contador de IDs
        let id = await AsyncStorage.getItem(COUNTER_KEY);
        id = id ? parseInt(id) : 0; // Si no existe, empieza en 0

        // Asignamos el nuevo id a la deuda
        const deudaCompleta = {
            id, // Usamos el contador como ID
            ...nuevaDeuda,
            historialPagos: [],
            estaPagada: false,
            archivosGuardados: 0,
        };

        // Agregar la deuda a la lista
        lista.push(deudaCompleta);

        // Guardar la nueva lista de deudas
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));

        // Incrementamos y guardamos el nuevo contador
        await AsyncStorage.setItem(COUNTER_KEY, (id + 1).toString());

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

        // Verificamos que el id corresponda a un índice válido dentro del array
        if (id < 0 || id >= deudas.length) {
            console.warn(`No se encontró deuda con id ${id}`);
            return;
        }

        // Actualiza la deuda directamente usando el índice
        deudas[id] = { ...deudas[id], ...nuevaData };

        // Guardamos las deudas actualizadas
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deudas));
        console.log('Deuda actualizada correctamente');
    } catch (error) {
        console.error('Error al actualizar deuda:', error);
    }
};


