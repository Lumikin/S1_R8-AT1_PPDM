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

            <View style={styles.tipos}>
                {item.tipos.map((tipo) => (
                    <TipoPokemon
                        key={tipo}
                        tipo={tipo}
                        mostrarNome={false}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={styles.botaoFavorito}
                onPress={() => onAlternarFavorito(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text
                    style={[
                        styles.coracao,
                        favorito && styles.coracaoAtivo
                    ]}
                >
                    {favorito ? '♥' : '♡'}
                </Text>
            </TouchableOpacity>
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

    tipos: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    botaoFavorito: {
        marginLeft: 4,
        paddingHorizontal: 4
    },

    coracao: {
        fontSize: 28,
        color: '#aaa'
    },

    coracaoAtivo: {
        color: '#e53935'
    }
});