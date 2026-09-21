const API_URL = 'https://pokeapi.co/api/v2';

export async function buscarPokemons() {
    const resposta = await fetch(`${API_URL}/pokemon?limit=30`);

    const dados = await resposta.json();

    return dados.results;
}

export async function buscarPokemon(url) {
    const resposta = await fetch(url);

    const dados = await resposta.json();

    return dados;
}

