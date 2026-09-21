import axios from "axios";
let API_URL = "https://pokeapi.co/api/v2";

const API_POKEMON = axios.create({
  baseURL: API_URL,
  timeout: 5000, //5 Segundos
});

async function ListarPokemons() {
  const result = await API_POKEMON.get("/pokemon?limit=100000&offset=0"); // limit: Para listar TODOS os pokemons sem limite da API
  return result;
}

async function ListarDadosPokemon(pokemon) {
  const result = await API_POKEMON.get(`/pokemon/${pokemon}`);
  return result;
}
