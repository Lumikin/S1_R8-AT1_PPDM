import React from 'react';

import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView
} from 'react-native';

export default function PokemonDetails({ route }) {

    const { pokemon } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.nome}>
                {pokemon.name}
            </Text>

            <Image
                source={{
                    uri: pokemon.sprites.front_default
                }}
                style={styles.imagem}
            />

            <Text style={styles.informacao}>
                ID: {pokemon.id}
            </Text>

            <Text style={styles.informacao}>
                Altura: {pokemon.height / 10} m
            </Text>

            <Text style={styles.informacao}>
                Peso: {pokemon.weight / 10} kg
            </Text>

            <Text style={styles.tituloSecao}>
                Tipos
            </Text>

            {pokemon.types.map((item, index) => (
                <Text
                    key={index}
                    style={styles.informacao}
                >
                    {item.type.name}
                </Text>
            ))}

            <Text style={styles.tituloSecao}>
                Habilidades
            </Text>

            {pokemon.abilities.map((item, index) => (
                <Text
                    key={index}
                    style={styles.informacao}
                >
                    {item.ability.name}
                </Text>
            ))}

            <Text style={styles.tituloSecao}>
                Estatísticas
            </Text>

            {pokemon.stats.map((item, index) => (
                <Text
                    key={index}
                    style={styles.informacao}
                >
                    {item.stat.name}: {item.base_stat}
                </Text>
            ))}

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5'
    },

    nome: {
        fontSize: 32,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginBottom: 10
    },

    imagem: {
        width: 200,
        height: 200,
        marginBottom: 20
    },

    informacao: {
        fontSize: 18,
        marginBottom: 8,
        textTransform: 'capitalize'
    },

    tituloSecao: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10
    }

});
