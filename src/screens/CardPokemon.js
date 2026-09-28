import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import TipoPokemon from './TipoPokemon.js';

export default function CardPokemon({
    item,
    favorito,
    onAbrir,
    onAlternarFavorito
}) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onAbrir(item.nome)}
        >
            <Text style={styles.nome}>
                #{item.id} {item.nome}
            </Text>

            <View style={styles.direita}>

                <TouchableOpacity
                    style={styles.botaoFavorito}
                    onPress={(evento) => {
                        evento.stopPropagation();
                        onAlternarFavorito(item);
                    }}
                >
                    <Text
                        style={[
                            styles.estrela,
                            favorito && styles.estrelaAtiva
                        ]}
                    >
                        {favorito ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.tipos}>
                    {item.tipos.map((tipo) => (
                        <TipoPokemon
                            key={tipo}
                            tipo={tipo}
                            mostrarNome={false}
                        />
                    ))}
                </View>

            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2
    },

    nome: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },

    direita: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    botaoFavorito: {
        marginRight: 8,
        paddingHorizontal: 4
    },

    estrela: {
        fontSize: 28,
        color: '#aaa'
    },

    estrelaAtiva: {
        color: '#FFD700'
    },

    tipos: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

