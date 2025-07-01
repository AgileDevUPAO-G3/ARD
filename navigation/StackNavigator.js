import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddDebtScreen from '../screens/AddDebtScreen';
import MarcarPagadoScreen from '../screens/MarcarPagadoScreen';
import HistorialScreen from "../screens/HistorialScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#76cfc6',
                        height: 100,
                    },
                    headerTintColor: '#000000',
                    headerTitleStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        fontSize: 20,
                        marginTop: 20,
                    }
                }}
            >
                <Stack.Screen name="INICIO" component={HomeScreen} />
                <Stack.Screen name="Registrar deuda" component={AddDebtScreen} />
                <Stack.Screen name="MarcarPagado" component={MarcarPagadoScreen} />
                <Stack.Screen name="Historial" component={HistorialScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
