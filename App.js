import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './src/screens/Home';
import PokemonList from './src/screens/PokemonList';
import PokemonDetails from './src/screens/PokemonDetails';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{ title: 'PokéDex' }}
                />

                <Stack.Screen
                    name="PokemonList"
                    component={PokemonList}
                    options={{ title: 'Pokémons' }}
                />

                <Stack.Screen
                    name="PokemonDetails"
                    component={PokemonDetails}
                    options={{ title: 'Detalhes' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
