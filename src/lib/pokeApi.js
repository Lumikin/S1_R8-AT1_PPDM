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

export async function ListarDadosPokemon(pokemon) {
  try {
    const api = await API_POKEMON.get(`/pokemon/${pokemon}`);

    const dataPokemon = {
      id: api.data.id,
      nome: api.data.name,
      altura: api.data.height / 10, // Transformar em metros
      peso: api.data.weight / 10, // Transformar em KG
      abilidades: api.data.abilities.map(a => a.ability.name),
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
