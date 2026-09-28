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

import TipoPokemon from './TipoPokemon';

// "special-attack" -> "special attack"
function formatar(texto) {
    return texto.replace(/-/g, ' ');
}

// Quantos movimentos aparecem antes de o usuário tocar em "Ver todos"
const MOVIMENTOS_VISIVEIS = 12;

export default function PokemonDetails({ route }) {

    const [pokemon, setPokemon] = useState(null);
    const [erro, setErro] = useState('');
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [filtro, setFiltro] = useState('');

    // nome ou número do pokémon, vindo da tela anterior
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

            // ListarDadosPokemon devolve [] quando dá erro de rede/timeout
            if (Array.isArray(dados)) {
                setErro('Não foi possível carregar os dados. Verifique sua conexão.');
                return;
            }

            setPokemon(dados);

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

    // Só mostra as imagens que o pokémon realmente tem
    const imagens = [
        { titulo: 'Normal', uri: pokemon.imgMale },
        { titulo: 'Shiny', uri: pokemon.imgMaleS },
        { titulo: 'Fêmea', uri: pokemon.imgFemale },
        { titulo: 'Fêmea Shiny', uri: pokemon.imgFemaleS }
    ].filter((imagem) => imagem.uri);

    // Movimentos em ordem alfabética, sem repetição
    const movimentosOrdenados = [...new Set(pokemon.movimentos)].sort();

    const movimentosFiltrados = movimentosOrdenados.filter((movimento) =>
        formatar(movimento).includes(filtro.trim().toLowerCase())
    );

    const movimentosExibidos = mostrarTodos
        ? movimentosFiltrados
        : movimentosOrdenados.slice(0, MOVIMENTOS_VISIVEIS);

    function alternarMovimentos() {
        setMostrarTodos(!mostrarTodos);
        setFiltro('');
    }

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.nome}>
                #{pokemon.id} {pokemon.nome}
            </Text>

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

                <Text style={styles.informacao}>
                    Altura: {pokemon.altura} m
                </Text>

                <Text style={styles.informacao}>
                    Peso: {pokemon.peso} kg
                </Text>

                <Text style={styles.informacao}>
                    Tipo:
                </Text>

                <View style={styles.tipos}>
                    {pokemon.tipo.map((tipo) => (
                        <TipoPokemon
                            key={tipo}
                            tipo={tipo}
                            tamanho={32}
                        />
                    ))}
                </View>

                <Text style={styles.informacao}>
                    Habilidades:
                </Text>

                {pokemon.habilidades.map((habilidade) => (
                    <Text
                        key={habilidade}
                        style={styles.informacao}
                    >
                        {formatar(habilidade)}
                    </Text>
                ))}

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
        marginBottom: 20
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