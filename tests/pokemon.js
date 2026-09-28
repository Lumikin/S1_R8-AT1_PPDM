import { ListarDadosPokemon } from "../src/services/pokeApi.js";

const pokemon = await ListarDadosPokemon("palkia");
console.log(pokemon.nome);
console.log(pokemon.tipo);
console.log(pokemon.altura);
console.log(pokemon.peso);
console.log(pokemon.habilidades);
console.log(pokemon.movimentos);
console.log(pokemon.status);
console.log(pokemon.som);
