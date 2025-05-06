import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AddDebtScreen from "./screens/AddDebtScreen";
import HomeScreen from "./screens/HomeScreen";
import StackNavigator from './navigation/StackNavigator';

export default function App() {
  //modificar para prueba a StackNavigarion
  return <StackNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
