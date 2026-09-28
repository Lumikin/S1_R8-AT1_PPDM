import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { ListarPokemons, ListarDadosPokemon } from "../services/pokeApi.js";

import TipoPokemon from "./TipoPokemon";
import { Image } from "expo-image";

const POR_PAGINA = 20;

// Tempo de espera após digitar para recarregar os tipos dos resultados
const ESPERA_BUSCA = 300;

// Pega o número do pokémon a partir da url (".../pokemon/25/" -> "25")
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
  const [todos, setTodos] = useState([]); // lista completa (nome + url)
  const [pokemons, setPokemons] = useState([]); // itens da página atual, com tipos
  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const listaRef = useRef(null);
  const cacheTipos = useRef({}); // guarda os tipos já buscados
  const requisicaoAtual = useRef(0);

  const termo = pesquisa.trim().toLowerCase();

  // Filtra a lista completa pelos caracteres digitados
  const filtrados = useMemo(() => {
    if (termo === "") {
      return todos;
    }

    return todos.filter(item => corresponde(item, termo));
  }, [todos, termo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

  // Evita página vazia quando o filtro reduzir a quantidade de resultados
  const paginaAtual = Math.min(pagina, totalPaginas - 1);

  // Busca a lista completa uma única vez
  useEffect(() => {
    carregarLista();
  }, []);

  // Cada busca nova volta para a primeira página
  useEffect(() => {
    setPagina(0);
  }, [termo]);

  // Sempre que a página ou o filtro mudar, carrega os 20 itens da página
  useEffect(() => {
    if (todos.length === 0) {
      return;
    }

    // Espera o usuário parar de digitar para não buscar a cada tecla
    const timer = setTimeout(carregarPagina, termo === "" ? 0 : ESPERA_BUSCA);

    return () => clearTimeout(timer);
  }, [paginaAtual, todos, termo]);

  async function carregarLista() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await ListarPokemons();

      setTodos(resposta.data.results);
    } catch (error) {
      console.log("ERRO AO BUSCAR LISTA:", error);

      setErro(error.message);
    } finally {
      setCarregando(false);
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

  function abrirDetalhes(nome) {
    navigation.navigate("PokemonDetails", {
      pokemon: nome,
    });
  }

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

      {filtrados.length === 0 && !carregando && termo !== "" && (
        <Text style={styles.semResultado}>Nenhum Pokémon encontrado</Text>
      )}

      <FlatList
        ref={listaRef}
        data={pokemons}
        keyExtractor={item => item.nome}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => abrirDetalhes(item.nome)}
          >
            <Text style={styles.nome}>
              #{item.id} {item.nome}
            </Text>

            <View style={styles.tipos}>
              {item.tipos.map(tipo => (
                <TipoPokemon key={tipo} tipo={tipo} mostrarNome={false} />
              ))}
            </View>
          </TouchableOpacity>
        )}
      />

      {filtrados.length > POR_PAGINA && (
        <View style={styles.paginacao}>
          <TouchableOpacity
            style={[
              styles.botaoPagina,
              (paginaAtual === 0 || carregando) && styles.botaoDesativado,
            ]}
            disabled={paginaAtual === 0 || carregando}
            onPress={() => setPagina(paginaAtual - 1)}
          >
            <Text style={styles.textoPagina}>← Anterior</Text>
          </TouchableOpacity>

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

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  nome: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  tipos: {
    flexDirection: "row",
    alignItems: "center",
  },

  paginacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
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
