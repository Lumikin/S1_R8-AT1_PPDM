import axios from "axios";
let API_URL = "https://pokeapi.co/api/v2";

const API_POKEMON = axios.create({
  baseURL: API_URL,
  timeout: 5000, //5 Segundos
});

export async function ListarPokemons() {
  const result = await API_POKEMON.get("/pokemon?limit=100000&offset=0"); // limit: Para listar TODOS os pokemons sem limite da API
  return result;
}

// Todos os tipos existentes na PokéAPI, usados para montar o mapa de tipos
const TIPOS = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

// O endpoint /pokemon só devolve nome e url, então os tipos de cada pokemon
// seriam 1 requisição por item da página. O endpoint /tipo já devolve todos os
// pokemons de um tipo, então 18 requisições (uma por tipo) bastam para mapear
// os tipos de todos os pokemons de uma vez.
let mapaTiposPromise = null;

export function ListarTiposPorPokemon() {
  if (!mapaTiposPromise) {
    mapaTiposPromise = (async () => {
      const respostas = await Promise.all(
        TIPOS.map((tipo) =>
          API_POKEMON.get(`/type/${tipo}`).then(
            (r) => [tipo, r.data.pokemon.map((p) => p.pokemon.name)],
            (err) => {
              console.log(`ERRO AO BUSCAR TIPO ${tipo}:`, err);
              return [tipo, []];
            },
          ),
        ),
      );

      const mapa = {};

      for (const [tipo, nomes] of respostas) {
        for (const nome of nomes) {
          // A ordem de TIPOS define a ordem em que os tipos aparecem no card
          if (!mapa[nome]) {
            mapa[nome] = [];
          }
          mapa[nome].push(tipo);
        }
      }

      return mapa;
    })();

    // Se falhar, permite tentar de novo em vez de ficar preso com o erro
    mapaTiposPromise.catch(() => {
      mapaTiposPromise = null;
    });
  }

  return mapaTiposPromise;
}

export async function ListarDadosPokemon(pokemon) {
  try {
    const api = await API_POKEMON.get(`/pokemon/${pokemon}`);
    
    /**
     * Dados do pokemon que foi listado
     */
    const dataPokemon = {
      id: api.data.id,
      nome: api.data.name,
      altura: api.data.height / 10, // Transformar em metros
      peso: api.data.weight / 10, // Transformar em KG
      habilidades: api.data.abilities.map(a => a.ability.name),
      movimentos: api.data.moves.map(m => m.move.name), // Mostra todos os movimentos em uma array
      imgMale: api.data.sprites.front_default,
      imgMaleS: api.data.sprites.front_shiny,
      imgFemale: api.data.sprites.front_female,
      imgFemaleS: api.data.sprites.front_shiny_female,
      tipo: api.data.types.map(t => t.type.name), // Mostra todos os tipos em array
      status: api.data.stats.map(s => ({
        //Filtra por status
        status: s.stat.name,
        valor: s.base_stat,
      })),
      som: api.data.cries.latest,
    };

    return dataPokemon;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(error);
    return [];
  }
}
