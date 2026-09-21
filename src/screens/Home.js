import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';

export default function Home({ navigation }) {
    return (
        <View style={styles.container}>

            <Text style={styles.titulo}>
                PokéDex
            </Text>

            <Text style={styles.descricao}>
                Explore informações sobre diversos Pokémons
                utilizando a PokéAPI.
            </Text>

            <TouchableOpacity
                style={styles.botao}
                onPress={() => navigation.navigate('PokemonList')}
            >
                <Text style={styles.textoBotao}>
                    Ver Pokémons
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5'
    },

    titulo: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20
    },

    descricao: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30
    },

    botao: {
        backgroundColor: '#e53935',
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: 10
    },

    textoBotao: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
