import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
    ListarPokemons,
    ListarDadosPokemon
} from '../lib/pokeApi';

import {
    listarFavoritos,
    alternarFavorito
} from '../lib/favoritosDb';

import CardPokemon from './CardPokemon.js';

const POR_PAGINA = 20;

function pegarId(url) {
    return url.split('/').filter(Boolean).pop();
}

export default function PokemonList({ navigation }) {

    const [favoritos, setFavoritos] = useState([]);

    const [todos, setTodos] = useState([]);
    const [pokemons, setPokemons] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [pagina, setPagina] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [pokemonEncontrado, setPokemonEncontrado] = useState(null);
    const [erro, setErro] = useState('');

    const listaRef = useRef(null);

    const totalPaginas = Math.ceil(todos.length / POR_PAGINA);

    useFocusEffect(
        useCallback(() => {
            carregarFavoritos();
        }, [])
    );

    useEffect(() => {
        carregarLista();
    }, []);

    useEffect(() => {
        if (todos.length > 0) {
            carregarPagina();
        }
    }, [pagina, todos]);

    async function carregarFavoritos() {
        setFavoritos(await listarFavoritos());
    }

    async function alternar(item) {
        const novosFavoritos = await alternarFavorito(item);
        setFavoritos(novosFavoritos);
    }

    function ehFavorito(nome) {
        return favoritos.some((item) => item.nome === nome);
    }

    async function carregarLista() {

        try {
            setCarregando(true);
            setErro('');

            const resposta = await ListarPokemons();

            setTodos(resposta.data.results);

        } catch (error) {
            console.log('ERRO AO BUSCAR LISTA:', error);

            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    }

    async function carregarPagina() {

        try {
            setCarregando(true);
            setErro('');

            const inicio = pagina * POR_PAGINA;
            const itens = todos.slice(inicio, inicio + POR_PAGINA);

            const detalhados = await Promise.all(
                itens.map(async (item) => {

                    const dados = await ListarDadosPokemon(item.name);

                    return {
                        nome: item.name,
                        id: pegarId(item.url),
                        tipos: Array.isArray(dados?.tipo)
                            ? dados.tipo
                            : []
                    };
                })
            );

            setPokemons(detalhados);

            listaRef.current?.scrollToOffset({
                offset: 0,
                animated: false
            });

        } catch (error) {
            console.log('ERRO AO CARREGAR PÁGINA:', error);

            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    }

    async function pesquisar() {

        const termo = pesquisa.trim().toLowerCase();

        if (termo === '') {
            setPokemonEncontrado(null);
            setErro('');
            return;
        }

        try {
            setCarregando(true);
            setErro('');

            const dados = await ListarDadosPokemon(termo);

            if (dados === null) {
                setPokemonEncontrado(null);
                setErro('Pokémon não encontrado');
                return;
            }

            if (Array.isArray(dados)) {
                setPokemonEncontrado(null);
                setErro(
                    'Não foi possível pesquisar. Verifique sua conexão.'
                );
                return;
            }

            setPokemonEncontrado({
                id: dados.id,
                nome: dados.nome,
                tipos: dados.tipo
            });

        } finally {
            setCarregando(false);
        }
    }

    function abrirDetalhes(nome) {
        navigation.navigate('PokemonDetails', {
            pokemon: nome
        });
    }

    function renderizarCard(item) {
        return (
            <CardPokemon
                item={item}
                favorito={ehFavorito(item.nome)}
                onAbrir={abrirDetalhes}
                onAlternarFavorito={alternar}
            />
        );
    }

    return (
        <View style={styles.container}>

            <TextInput
                style={styles.input}
                placeholder="Pesquisar Pokémon..."
                value={pesquisa}
                onChangeText={setPesquisa}
                onSubmitEditing={pesquisar}
            />

            <TouchableOpacity
                style={styles.botaoPesquisar}
                onPress={pesquisar}
            >
                <Text style={styles.textoBotao}>
                    Pesquisar
                </Text>
            </TouchableOpacity>

            {erro !== '' && (
                <Text style={styles.erro}>
                    Erro: {erro}
                </Text>
            )}

            {carregando && (
                <Text style={styles.carregando}>
                    Carregando...
                </Text>
            )}

            {pokemonEncontrado ? (

                renderizarCard(pokemonEncontrado)

            ) : (

                <FlatList
                    ref={listaRef}
                    data={pokemons}
                    extraData={favoritos}
                    keyExtractor={(item) => item.nome}
                    renderItem={({ item }) => renderizarCard(item)}
                />

            )}

            {!pokemonEncontrado && (
                <View style={styles.paginacao}>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (pagina === 0 || carregando) &&
                            styles.botaoDesativado
                        ]}
                        disabled={pagina === 0 || carregando}
                        onPress={() => setPagina(pagina - 1)}
                    >
                        <Text style={styles.textoPagina}>
                            ← Anterior
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.numeroPagina}>
                        Página {pagina + 1}
                        {totalPaginas > 0
                            ? ` de ${totalPaginas}`
                            : ''}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (pagina + 1 >= totalPaginas ||
                                carregando) &&
                            styles.botaoDesativado
                        ]}
                        disabled={
                            pagina + 1 >= totalPaginas ||
                            carregando
                        }
                        onPress={() => setPagina(pagina + 1)}
                    >
                        <Text style={styles.textoPagina}>
                            Próxima →
                        </Text>
                    </TouchableOpacity>

                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5'
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 10
    },

    botaoPesquisar: {
        backgroundColor: '#e53935',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15
    },

    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },

    erro: {
        color: 'red',
        fontSize: 16,
        marginBottom: 10
    },

    carregando: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 10
    },

    paginacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },

    botaoPagina: {
        backgroundColor: '#e53935',
        padding: 12,
        borderRadius: 8
    },

    botaoDesativado: {
        backgroundColor: '#aaa'
    },

    textoPagina: {
        color: '#fff',
        fontWeight: 'bold'
    },

    numeroPagina: {
        fontWeight: 'bold',
        fontSize: 16
    }
});

