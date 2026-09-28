import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ListarPokemons, ListarTiposPorPokemon } from '../services/pokeApi.js';
import { listarFavoritos, alternarFavorito } from '../services/favoritosDb.js';

import CardPokemon from './CardPokemon.js';

const POR_PAGINA = 20;

// Pega o número do pokémon a partir da url (".../pokemon/25/" -> "25")
function pegarId(url) {
    return url.split('/').filter(Boolean).pop();
}

// Procura por qualquer trecho de caracteres no nome ("char" -> charizard)
// ou, se o texto for número, pelo começo do número ("25" -> #25, #250, #251)
function corresponde(item, termo) {
    if (item.name.includes(termo)) {
        return true;
    }

    const id = item.url.split('/').filter(Boolean).pop();

    return /^\d+$/.test(termo) && id.startsWith(termo);
}

export default function PokemonList({ navigation }) {
    const [favoritos, setFavoritos] = useState([]);

    const [todos, setTodos] = useState([]);
    const [mapaTipos, setMapaTipos] = useState({});
    const [pesquisa, setPesquisa] = useState('');
    const [pagina, setPagina] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    const listaRef = useRef(null);

    const termo = pesquisa.trim().toLowerCase();

    // Filtra a lista completa pelos caracteres digitados
    const filtrados = useMemo(() => {
        if (termo === '') {
            return todos;
        }

        return todos.filter((item) => corresponde(item, termo));
    }, [todos, termo]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

    // Evita página vazia quando o filtro reduzir a quantidade de resultados
    const paginaAtual = Math.min(pagina, totalPaginas - 1);

    // Refresca os corações sempre que a tela volta a ficar em foco
    useFocusEffect(
        useCallback(() => {
            carregarFavoritos();
        }, [])
    );

    // Busca a lista e o mapa de tipos uma única vez
    useEffect(() => {
        carregarLista();
    }, []);

    // Cada busca nova volta para a primeira página
    useEffect(() => {
        setPagina(0);
    }, [termo]);

    async function carregarFavoritos() {
        setFavoritos(await listarFavoritos());
    }

    async function alternar(item) {
        setFavoritos(await alternarFavorito(item));
    }

    function ehFavorito(nome) {
        return favoritos.some((favorito) => favorito.nome === nome);
    }

    async function carregarLista() {
        try {
            setCarregando(true);
            setErro('');

            const [resposta, tipos] = await Promise.all([
                ListarPokemons(),
                ListarTiposPorPokemon()
            ]);

            setTodos(resposta.data.results);
            setMapaTipos(tipos);
        } catch (error) {
            console.log('ERRO AO BUSCAR LISTA:', error);

            setErro(error.message);
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

    // Os itens da página atual. O mapa de tipos já traz os tipos de todos os
    // pokemons, então aqui não é preciso chamar a API para cada item.
    const itensDaPagina = filtrados
        .slice(
            paginaAtual * POR_PAGINA,
            paginaAtual * POR_PAGINA + POR_PAGINA
        )
        .map((item) => ({
            nome: item.name,
            id: pegarId(item.url),
            tipos: mapaTipos[item.name] || []
        }));

    return (
        <View style={styles.container}>

            <TextInput
                style={styles.input}
                placeholder="Pesquisar por nome ou número..."
                value={pesquisa}
                onChangeText={setPesquisa}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
            />

            {erro !== '' && (
                <Text style={styles.erro}>
                    Erro: {erro}
                </Text>
            )}

            {carregando && todos.length === 0 && (
                <Text style={styles.carregando}>
                    Carregando...
                </Text>
            )}

            {!carregando && termo !== '' && (
                <Text style={styles.contagem}>
                    {`${filtrados.length} resultado${
                        filtrados.length === 1 ? '' : 's'
                    } para "${pesquisa.trim()}"`}
                </Text>
            )}

            {!carregando && termo !== '' && filtrados.length === 0 && (
                <Text style={styles.semResultado}>
                    Nenhum Pokémon encontrado
                </Text>
            )}

            <FlatList
                ref={listaRef}
                data={itensDaPagina}
                extraData={favoritos}
                keyExtractor={(item) => item.nome}
                renderItem={({ item }) => renderizarCard(item)}
            />

            {filtrados.length > POR_PAGINA && (
                <View style={styles.paginacao}>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (paginaAtual === 0 || carregando) &&
                                styles.botaoDesativado
                        ]}
                        disabled={paginaAtual === 0 || carregando}
                        onPress={() => setPagina(paginaAtual - 1)}
                    >
                        <Text style={styles.textoPagina}>
                            ← Anterior
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.numeroPagina}>
                        Página {paginaAtual + 1} de {totalPaginas}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.botaoPagina,
                            (paginaAtual + 1 >= totalPaginas || carregando) &&
                                styles.botaoDesativado
                        ]}
                        disabled={
                            paginaAtual + 1 >= totalPaginas || carregando
                        }
                        onPress={() => setPagina(paginaAtual + 1)}
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

    contagem: {
        color: '#777',
        fontSize: 14,
        marginBottom: 10
    },

    semResultado: {
        textAlign: 'center',
        color: '#777',
        fontSize: 16,
        marginTop: 20
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
