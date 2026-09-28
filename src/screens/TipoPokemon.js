import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

const ICONES = {
    bug: require('../../assets/icons/types/bug.svg'),
    dark: require('../../assets/icons/types/dark.svg'),
    dragon: require('../../assets/icons/types/dragon.svg'),
    electric: require('../../assets/icons/types/electric.svg'),
    fairy: require('../../assets/icons/types/fairy.svg'),
    fighting: require('../../assets/icons/types/fighting.svg'),
    fire: require('../../assets/icons/types/fire.svg'),
    flying: require('../../assets/icons/types/flying.svg'),
    ghost: require('../../assets/icons/types/ghost.svg'),
    grass: require('../../assets/icons/types/grass.svg'),
    ground: require('../../assets/icons/types/ground.svg'),
    ice: require('../../assets/icons/types/ice.svg'),
    normal: require('../../assets/icons/types/normal.svg'),
    poison: require('../../assets/icons/types/poison.svg'),
    psychic: require('../../assets/icons/types/psychic.svg'),
    rock: require('../../assets/icons/types/rock.svg'),
    steel: require('../../assets/icons/types/steel.svg'),
    water: require('../../assets/icons/types/water.svg')
};

export default function TipoPokemon({
    tipo,
    tamanho = 28,
    mostrarNome = true
}) {

    const icone = ICONES[tipo];

    return (
        <View style={styles.container}>

            {icone && (
                <Image
                    source={icone}
                    style={{ width: tamanho, height: tamanho }}
                    contentFit="contain"
                />
            )}

            {mostrarNome && (
                <Text style={styles.nome}>
                    {tipo}
                </Text>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 4
    },

    nome: {
        fontSize: 16,
        marginLeft: 6,
        textTransform: 'capitalize'
    }
});