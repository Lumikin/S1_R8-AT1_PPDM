import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList
} from 'react-native';

import {
    ListarPokemons,
    ListarDadosPokemon
} from '../lib/pokeApi';

import TipoPokemon from './TipoPokemon';

const POR_PAGINA = 20;

// Pega o número do pokémon a partir da url (".../pokemon/25/" -> "25")
function pegarId(url) {
    return url.split('/').filter(Boolean).pop();
}

export default function PokemonList({ navigation }) {

    const [todos, setTodos] = useState([]);           // lista completa (nome + url)
    const [pokemons, setPokemons] = useState([]);     // itens da página atual, com tipos
    const [pesquisa, setPesquisa] = useState('');
    const [pagina, setPagina] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [pokemonEncontrado, setPokemonEncontrado] = useState(null);
    const [erro, setErro] = useState('');

    const listaRef = useRef(null);

    const totalPaginas = Math.ceil(todos.length / POR_PAGINA);

    // Busca a lista completa uma única vez
    useEffect(() => {
        carregarLista();
    }, []);

    // Sempre que a lista chegar ou a página mudar, carrega os 20 da página
    useEffect(() => {
        if (todos.length > 0) {
            carregarPagina();
        }
    }, [pagina, todos]);

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

            // Busca os dados de cada pokémon da página em paralelo (para pegar os tipos)
            const detalhados = await Promise.all(
                itens.map(async (item) => {

                    const dados = await ListarDadosPokemon(item.name);

                    return {
                        nome: item.name,
                        id: pegarId(item.url),
                        // ListarDadosPokemon devolve [] quando dá erro
                        tipos: Array.isArray(dados?.tipo) ? dados.tipo : []
                    };
                })
            );

            setPokemons(detalhados);

            listaRef.current?.scrollToOffset({ offset: 0, animated: false });

        } catch (error) {
            console.log('ERRO AO CARREGAR PÁGINA:', error);

            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    }

    async function pesquisar() {

        const termo = pesquisa.trim().toLowerCase();

        // Pesquisa vazia: volta a mostrar a lista
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
                // 404: não existe
                setPokemonEncontrado(null);
                setErro('Pokémon não encontrado');
                return;
            }

            if (Array.isArray(dados)) {
                // qualquer outro erro (internet, timeout...)
                setPokemonEncontrado(null);
                setErro('Não foi possível pesquisar. Verifique sua conexão.');
                return;
            }

            setPokemonEncontrado(dados);

        } finally {
            setCarregando(false);
        }
    }

    function abrirDetalhes(nome) {
        navigation.navigate('PokemonDetails', {
            pokemon: nome
        });
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

            {pokemonEncontrado && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => abrirDetalhes(pokemonEncontrado.nome)}
                >
                    <Text style={styles.nome}>
                        #{pokemonEncontrado.id} {pokemonEncontrado.nome}
                    </Text>

                    <View style={styles.tipos}>
                        {pokemonEncontrado.tipo.map((tipo) => (
                            <TipoPokemon
                                key={tipo}
                                tipo={tipo}
                                mostrarNome={false}
                            />
                        ))}
                    </View>
                </TouchableOpacity>
            )}

            {!pokemonEncontrado && (
                <FlatList
                    ref={listaRef}
                    data={pokemons}
                    keyExtractor={(item) => item.nome}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => abrirDetalhes(item.nome)}
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
                        </TouchableOpacity>
                    )}
                />
            )}

            {!pokemonEncontrado && (
                <View style={styles.paginacao}>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (pagina === 0 || carregando) && styles.botaoDesativado
                        ]}
                        disabled={pagina === 0 || carregando}
                        onPress={() => setPagina(pagina - 1)}
                    >
                        <Text style={styles.textoPagina}>
                            ← Anterior
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.numeroPagina}>
                        Página {pagina + 1}{totalPaginas > 0 ? ` de ${totalPaginas}` : ''}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (pagina + 1 >= totalPaginas || carregando) && styles.botaoDesativado
                        ]}
                        disabled={pagina + 1 >= totalPaginas || carregando}
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