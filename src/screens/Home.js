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

            <View style={styles.sombra} />

            <View style={styles.pokebola}>
                <View style={styles.parteVermelha} />

                <View style={styles.brilho} />

                <View style={styles.linha} />

                <View style={styles.circulo}>
                    <View style={styles.centro} />
                </View>
            </View>

            <Text style={styles.titulo}>
                PokéDex
            </Text>

            <Text style={styles.descricao}>
               Explore as informações dos pokemons 
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

    sombra: {
        position: 'absolute',
        width: 140,
        height: 18,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginTop: -250
    },

    pokebola: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#fff',
        borderWidth: 5,
        borderColor: '#171717',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6
    },

    parteVermelha: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '50%',
        backgroundColor: '#e53935'
    },

    brilho: {
        position: 'absolute',
        width: 45,
        height: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
        opacity: 0.7,
        top: 22,
        left: 25,
        transform: [
            { rotate: '-25deg' }
        ]
    },

    linha: {
        position: 'absolute',
        width: '100%',
        height: 7,
        backgroundColor: '#171717',
        top: '50%',
        marginTop: -3
    },

    circulo: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#171717',
        justifyContent: 'center',
        alignItems: 'center'
    },

    centro: {
        width: 29,
        height: 29,
        borderRadius: 15,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#aaa'
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
