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

import { ListarPokemons, ListarDadosPokemon } from "../services/pokeApi.js";

import {
    listarFavoritos,
    alternarFavorito
} from '../lib/favoritosDb';

import CardPokemon from './CardPokemon.js';

const POR_PAGINA = 20;

function pegarId(url) {
  return url.split("/").filter(Boolean).pop();
}

// Procura por qualquer trecho de caracteres no nome ("char" -> charizard)
// ou, se o texto for número, pelo começo do número ("25" -> #25, #250, #251)
function corresponde(item, termo) {
  if (item.name.includes(termo)) {
    return true;
  }

  const id = item.url.split("/").filter(Boolean).pop();

  return /^\d+$/.test(termo) && id.startsWith(termo);
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

  const termo = pesquisa.trim().toLowerCase();

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
        setFavoritos(await alternarFavorito(item));
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

    return todos.filter(item => corresponde(item, termo));
  }, [todos, termo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

  // Evita página vazia quando o filtro reduzir a quantidade de resultados
  const paginaAtual = Math.min(pagina, totalPaginas - 1);

            const detalhados = await Promise.all(
                itens.map(async (item) => {

  // Cada busca nova volta para a primeira página
  useEffect(() => {
    setPagina(0);
  }, [termo]);

                    return {
                        nome: item.name,
                        id: pegarId(item.url),
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

    // Espera o usuário parar de digitar para não buscar a cada tecla
    const timer = setTimeout(carregarPagina, termo === "" ? 0 : ESPERA_BUSCA);

    return () => clearTimeout(timer);
  }, [paginaAtual, todos, termo]);

        if (termo === '') {
            setPokemonEncontrado(null);
            setErro('');
            return;
        }

      const resposta = await ListarPokemons();

      setTodos(resposta.data.results);
    } catch (error) {
      console.log("ERRO AO BUSCAR LISTA:", error);

            if (dados === null) {
                setPokemonEncontrado(null);
                setErro('Pokémon não encontrado');
                return;
            }

            if (Array.isArray(dados)) {
                setPokemonEncontrado(null);
                setErro('Não foi possível pesquisar. Verifique sua conexão.');
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
  }

  async function carregarPagina() {
    // ignora respostas de buscas que já foram substituídas por outra
    const idRequisicao = ++requisicaoAtual.current;

    try {
      setCarregando(true);
      setErro("");

      const inicio = paginaAtual * POR_PAGINA;
      const itens = filtrados.slice(inicio, inicio + POR_PAGINA);

      // Busca os dados de cada pokémon da página em paralelo (para pegar os tipos)
      const detalhados = await Promise.all(
        itens.map(async item => {
          // reaproveita os tipos já buscados em outras páginas/buscas
          if (cacheTipos.current[item.name]) {
            return {
              nome: item.name,
              id: pegarId(item.url),
              tipos: cacheTipos.current[item.name],
            };
          }

          const dados = await ListarDadosPokemon(item.name);

          // ListarDadosPokemon devolve [] quando dá erro
          const tipos = Array.isArray(dados?.tipo) ? dados.tipo : [];

          cacheTipos.current[item.name] = tipos;

          return {
            nome: item.name,
            id: pegarId(item.url),
            tipos,
          };
        }),
      );

      if (idRequisicao !== requisicaoAtual.current) {
        return;
      }

      setPokemons(detalhados);

      listaRef.current?.scrollToOffset({ offset: 0, animated: false });
    } catch (error) {
      if (idRequisicao !== requisicaoAtual.current) {
        return;
      }

      console.log("ERRO AO CARREGAR PÁGINA:", error);

      setErro(error.message);
    } finally {
      if (idRequisicao === requisicaoAtual.current) {
        setCarregando(false);
      }
    }
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

      {erro !== "" && <Text style={styles.erro}>Erro: {erro}</Text>}

      {carregando && <Text style={styles.carregando}>Carregando...</Text>}

      {!carregando && termo !== "" && (
        <Text style={styles.contagem}>
          {`${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"} para "${pesquisa.trim()}"`}
        </Text>
      )}

            {pokemonEncontrado && renderizarCard(pokemonEncontrado)}

            {!pokemonEncontrado && (
                <FlatList
                    ref={listaRef}
                    data={pokemons}
                    extraData={favoritos}
                    keyExtractor={(item) => item.nome}
                    renderItem={({ item }) => renderizarCard(item)}
                />
            )}

          <Text style={styles.numeroPagina}>
            Página {paginaAtual + 1} de {totalPaginas}
          </Text>

          <TouchableOpacity
            style={[
              styles.botaoPagina,
              (paginaAtual + 1 >= totalPaginas || carregando) &&
                styles.botaoDesativado,
            ]}
            disabled={paginaAtual + 1 >= totalPaginas || carregando}
            onPress={() => setPagina(paginaAtual + 1)}
          >
            <Text style={styles.textoPagina}>Próxima →</Text>
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
    backgroundColor: "#f5f5f5",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  contagem: {
    color: "#777",
    fontSize: 14,
    marginBottom: 10,
  },

  semResultado: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 20,
  },

  erro: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },

  carregando: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },

    paginacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },

  botaoPagina: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
  },

  botaoDesativado: {
    backgroundColor: "#aaa",
  },

  textoPagina: {
    color: "#fff",
    fontWeight: "bold",
  },

  numeroPagina: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
