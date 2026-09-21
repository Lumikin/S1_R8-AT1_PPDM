import React, { useEffect, useState } from 'react';

import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';

import { buscarPokemons, buscarPokemon } from '../services/api';

export default function PokemonList({ navigation }) {

    const [pokemons, setPokemons] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarPokemons();
    }, []);

    async function carregarPokemons() {
        try {
            const dados = await buscarPokemons();

            const lista = [];

            for (const pokemon of dados) {
                const detalhes = await buscarPokemon(pokemon.url);

                lista.push(detalhes);
            }

            setPokemons(lista);

        } catch (error) {
            console.log(error);
        }

        setCarregando(false);
    }

    function abrirDetalhes(pokemon) {
        navigation.navigate('PokemonDetails', {
            pokemon: pokemon
        });
    }

    if (carregando) {
        return (
            <View style={styles.carregando}>
                <ActivityIndicator size="large" />
                <Text>Carregando Pokémons...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <FlatList
                data={pokemons}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => abrirDetalhes(item)}
                    >

                        <Image
                            source={{
                                uri: item.sprites.front_default
                            }}
                            style={styles.imagem}
                        />

                        <View>
                            <Text style={styles.nome}>
                                {item.name}
                            </Text>

                            <Text>
                                ID: {item.id}
                            </Text>

                            <Text>
                                Tipo: {item.types[0].type.name}
                            </Text>
                        </View>

                    </TouchableOpacity>
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5'
    },

    carregando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },

    card: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10
    },

    imagem: {
        width: 80,
        height: 80,
        marginRight: 15
    },

    nome: {
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginBottom: 5
    }

});
