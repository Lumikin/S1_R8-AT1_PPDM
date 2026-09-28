import React from 'react';
import {
    NavigationContainer,
    getFocusedRouteNameFromRoute
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from './src/screens/Home';
import PokemonList from './src/screens/PokemonList';
import Favoritos from './src/screens/Favoritos';
import PokemonDetails from './src/screens/PokemonDetails';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Abas() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#e53935',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: 'bold'
                },
                tabBarIcon: ({ color, size }) => (
                    <Ionicons
                        name={route.name === 'Favoritos' ? 'heart' : 'list'}
                        size={size}
                        color={color}
                    />
                )
            })}
        >
            <Tab.Screen
                name="Pokemons"
                component={PokemonList}
                options={{ title: 'Pokémons' }}
            />

            <Tab.Screen
                name="Favoritos"
                component={Favoritos}
            />
        </Tab.Navigator>
    );
}

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
                    component={Abas}
                    options={({ route }) => ({
                        title:
                            getFocusedRouteNameFromRoute(route) === 'Favoritos'
                                ? 'Favoritos'
                                : 'Pokémons'
                    })}
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