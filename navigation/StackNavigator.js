import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AddDebtScreen from '../screens/AddDebtScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    // ✅ color de fondo del header
                    headerStyle: {
                        backgroundColor: '#76cfc6', // azul ejemplo
                        height: 100,                // simula padding top
                    },
                    // ✅ color del texto
                    headerTintColor: '#000000',
                    // ✅ estilo del texto centrado + desplazado abajo
                    headerTitleStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        fontSize: 20,
                        marginTop: 20, // simula paddingTop en el texto
                    }
                }}
            >
                <Stack.Screen name="INICIO" component={HomeScreen} />
                <Stack.Screen name="Registrar deuda" component={AddDebtScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
