import { ListarDadosPokemon } from "../src/lib/pokeAPI.js";

const pokemon = await ListarDadosPokemon("zeraora");
console.log(pokemon.nome);
console.log(pokemon.tipo);
console.log(pokemon.altura);
console.log(pokemon.peso);
console.log(pokemon.abilidades);
console.log(pokemon.movimentos);
console.log(pokemon.status);
console.log(pokemon.som);
