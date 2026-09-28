import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity
} from 'react-native';

import { ListarDadosPokemon } from '../lib/pokeApi';

import { listarFavoritos, alternarFavorito } from '../lib/favoritosDb';

import TipoPokemon from './TipoPokemon.js';

function formatar(texto) {
    return texto.replace(/-/g, ' ');
}

const MOVIMENTOS_VISIVEIS = 12;

export default function PokemonDetails({ route }) {

    const [pokemon, setPokemon] = useState(null);
    const [erro, setErro] = useState('');
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [favorito, setFavorito] = useState(false);

    const identificador = route.params.pokemon;

    useEffect(() => {
        carregarPokemon();
    }, []);

    async function carregarPokemon() {

        try {
            setErro('');

            const dados = await ListarDadosPokemon(identificador);

            if (dados === null) {
                setErro('Pokémon não encontrado');
                return;
            }

            if (Array.isArray(dados)) {
                setErro('Não foi possível carregar os dados. Verifique sua conexão.');
                return;
            }

            setPokemon(dados);

            const favoritos = await listarFavoritos();

            setFavorito(favoritos.some((item) => item.nome === dados.nome));

        } catch (error) {
            console.log('ERRO AO BUSCAR DETALHES:', error);

            setErro(error.message);
        }
    }

    if (erro !== '') {
        return (
            <View style={styles.carregando}>
                <Text style={styles.erro}>
                    Erro: {erro}
                </Text>
            </View>
        );
    }

    if (!pokemon) {
        return (
            <View style={styles.carregando}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    const imagens = [
        { titulo: 'Normal', uri: pokemon.imgMale },
        { titulo: 'Shiny', uri: pokemon.imgMaleS },
        { titulo: 'Fêmea', uri: pokemon.imgFemale },
        { titulo: 'Fêmea Shiny', uri: pokemon.imgFemaleS }
    ].filter((imagem) => imagem.uri);

    const movimentosOrdenados = [...new Set(pokemon.movimentos)].sort();

    const movimentosFiltrados = movimentosOrdenados.filter((movimento) =>
        formatar(movimento).includes(filtro.trim().toLowerCase())
    );

    const movimentosExibidos = mostrarTodos
        ? movimentosFiltrados
        : movimentosOrdenados.slice(0, MOVIMENTOS_VISIVEIS);

    async function alternarFav() {

        const novos = await alternarFavorito({
            id: pokemon.id,
            nome: pokemon.nome,
            tipos: pokemon.tipo
        });

        setFavorito(novos.some((item) => item.nome === pokemon.nome));
    }

    function alternarMovimentos() {
        setMostrarTodos(!mostrarTodos);
        setFiltro('');
    }

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.nome}>
                #{pokemon.id} {pokemon.nome}
            </Text>

            <TouchableOpacity
                style={[
                    styles.botaoFavorito,
                    favorito && styles.botaoFavoritoAtivo
                ]}
                onPress={alternarFav}
            >
                <Text
                    style={[
                        styles.textoFavorito,
                        favorito && styles.textoFavoritoAtivo
                    ]}
                >
                    {favorito ? '♥ Favoritado' : '♡ Favoritar'}
                </Text>
            </TouchableOpacity>

            <View style={styles.imagens}>
                {imagens.map((imagem) => (
                    <View key={imagem.titulo} style={styles.itemImagem}>
                        <Image
                            source={{ uri: imagem.uri }}
                            style={styles.imagem}
                        />
                        <Text style={styles.legendaImagem}>
                            {imagem.titulo}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.card}>

                <Text style={styles.titulo}>
                    Informações
                </Text>

                <View style={styles.medidas}>

                    <View style={styles.caixaMedida}>
                        <Text style={styles.rotuloMedida}>Altura</Text>
                        <Text style={styles.valorMedida}>
                            {pokemon.altura} m
                        </Text>
                    </View>

                    <View style={styles.caixaMedida}>
                        <Text style={styles.rotuloMedida}>Peso</Text>
                        <Text style={styles.valorMedida}>
                            {pokemon.peso} kg
                        </Text>
                    </View>

                </View>

                <Text style={styles.subtitulo}>
                    Tipo
                </Text>

                <View style={styles.tipos}>
                    {pokemon.tipo.map((tipo) => (
                        <View key={tipo} style={styles.pilulaTipo}>
                            <TipoPokemon
                                tipo={tipo}
                                tamanho={28}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.subtitulo}>
                    Habilidades
                </Text>

                <View style={styles.chips}>
                    {pokemon.habilidades.map((habilidade) => (
                        <View key={habilidade} style={styles.chipHabilidade}>
                            <Text style={styles.textoHabilidade}>
                                {formatar(habilidade)}
                            </Text>
                        </View>
                    ))}
                </View>

            </View>

            <View style={styles.card}>

                <Text style={styles.titulo}>
                    Status
                </Text>

                {pokemon.status.map((item) => (
                    <View key={item.status} style={styles.statusLinha}>

                        <Text style={styles.statusNome}>
                            {formatar(item.status)}
                        </Text>

                        <Text style={styles.statusValor}>
                            {item.valor}
                        </Text>

                        <View style={styles.barraFundo}>
                            <View
                                style={[
                                    styles.barra,
                                    { width: `${Math.min((item.valor / 255) * 100, 100)}%` }
                                ]}
                            />
                        </View>

                    </View>
                ))}

            </View>

            <View style={styles.card}>

                <Text style={styles.titulo}>
                    Movimentos ({movimentosOrdenados.length})
                </Text>

                {mostrarTodos && (
                    <TextInput
                        style={styles.inputFiltro}
                        placeholder="Filtrar movimento..."
                        value={filtro}
                        onChangeText={setFiltro}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                )}

                <ScrollView
                    style={mostrarTodos && styles.caixaMovimentos}
                    nestedScrollEnabled
                >
                    <View style={styles.chips}>
                        {movimentosExibidos.map((movimento) => (
                            <View key={movimento} style={styles.chip}>
                                <Text style={styles.textoChip}>
                                    {formatar(movimento)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {mostrarTodos && movimentosFiltrados.length === 0 && (
                        <Text style={styles.semResultado}>
                            Nenhum movimento encontrado
                        </Text>
                    )}
                </ScrollView>

                {movimentosOrdenados.length > MOVIMENTOS_VISIVEIS && (
                    <TouchableOpacity
                        style={styles.botaoVerMais}
                        onPress={alternarMovimentos}
                    >
                        <Text style={styles.textoVerMais}>
                            {mostrarTodos
                                ? 'Mostrar menos'
                                : `Ver todos os ${movimentosOrdenados.length} movimentos`}
                        </Text>
                    </TouchableOpacity>
                )}

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20
    },

    carregando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },

    erro: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center'
    },

    nome: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: 10
    },

    botaoFavorito: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e53935',
        marginBottom: 20
    },

    botaoFavoritoAtivo: {
        backgroundColor: '#e53935'
    },

    textoFavorito: {
        color: '#e53935',
        fontSize: 16,
        fontWeight: 'bold'
    },

    textoFavoritoAtivo: {
        color: '#fff'
    },

    imagens: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20
    },

    itemImagem: {
        alignItems: 'center',
        marginHorizontal: 6,
        marginBottom: 10
    },

    imagem: {
        width: 130,
        height: 130
    },

    legendaImagem: {
        fontSize: 14,
        color: '#555'
    },

    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
    },

    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15
    },

    informacao: {
        fontSize: 18,
        marginBottom: 8,
        textTransform: 'capitalize'
    },

    medidas: {
        flexDirection: 'row',
        marginBottom: 20
    },

    caixaMedida: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 4
    },

    rotuloMedida: {
        fontSize: 13,
        color: '#777',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4
    },

    valorMedida: {
        fontSize: 22,
        fontWeight: 'bold'
    },

    subtitulo: {
        fontSize: 13,
        color: '#777',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8
    },

    pilulaTipo: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingVertical: 4,
        paddingLeft: 12,
        paddingRight: 4,
        marginRight: 8,
        marginBottom: 8
    },

    chipHabilidade: {
        backgroundColor: '#fdecea',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8
    },

    textoHabilidade: {
        fontSize: 16,
        color: '#c62828',
        fontWeight: '600',
        textTransform: 'capitalize'
    },

    tipos: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8
    },

    statusLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },

    statusNome: {
        width: 120,
        fontSize: 16,
        textTransform: 'capitalize'
    },

    statusValor: {
        width: 40,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        marginRight: 10
    },

    barraFundo: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
        overflow: 'hidden'
    },

    barra: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: '#e53935'
    },

    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    chip: {
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6
    },

    textoChip: {
        fontSize: 14,
        textTransform: 'capitalize'
    },

    inputFiltro: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 12
    },

    caixaMovimentos: {
        maxHeight: 280
    },

    semResultado: {
        textAlign: 'center',
        color: '#777',
        fontSize: 15,
        paddingVertical: 10
    },

    botaoVerMais: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e53935',
        alignItems: 'center'
    },

    textoVerMais: {
        color: '#e53935',
        fontSize: 16,
        fontWeight: 'bold'
    }
});