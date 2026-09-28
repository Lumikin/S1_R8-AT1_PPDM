import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
    listarFavoritos,
    alternarFavorito
} from '../lib/favoritosDb';

import CardPokemon from './CardPokemon.js';

export default function Favoritos({ navigation }) {

    const [favoritos, setFavoritos] = useState([]);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [])
    );

    async function carregar() {
        const dados = await listarFavoritos();

        const dadosValidos = dados.filter(
            (item) => item && item.nome
        );

        setFavoritos(dadosValidos);
    }

    async function remover(item) {
        const novosFavoritos = await alternarFavorito(item);

        const dadosValidos = novosFavoritos.filter(
            (pokemon) => pokemon && pokemon.nome
        );

        setFavoritos(dadosValidos);
    }

    function abrirDetalhes(nome) {
        navigation.navigate('PokemonDetails', {
            pokemon: nome
        });
    }

    const ordenados = [...favoritos].sort(
        (a, b) => Number(a.id) - Number(b.id)
    );

    return (
        <View style={styles.container}>

            <FlatList
                data={ordenados}
                keyExtractor={(item) => item.nome}
                renderItem={({ item }) => (
                    <CardPokemon
                        item={item}
                        favorito={true}
                        onAbrir={abrirDetalhes}
                        onAlternarFavorito={remover}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.vazio}>
                        Você ainda não favoritou nenhum Pokémon.
                    </Text>
                }
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5'
    },

    vazio: {
        textAlign: 'center',
        color: '#777',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 40
    }
});
