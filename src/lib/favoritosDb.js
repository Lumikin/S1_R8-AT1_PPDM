import * as SQLite from 'expo-sqlite';

let bancoPromise = null;

function abrirBanco() {

    if (!bancoPromise) {

        bancoPromise = (async () => {

            const banco = await SQLite.openDatabaseAsync('pokedex.db');

            await banco.execAsync(`
                CREATE TABLE IF NOT EXISTS favoritos (
                    id INTEGER PRIMARY KEY NOT NULL,
                    nome TEXT NOT NULL UNIQUE,
                    tipos TEXT NOT NULL
                );
            `);

            return banco;
        })();

        bancoPromise.catch(() => {
            bancoPromise = null;
        });
    }

    return bancoPromise;
}

export async function listarFavoritos() {

    try {
        const banco = await abrirBanco();

        const linhas = await banco.getAllAsync(
            'SELECT id, nome, tipos FROM favoritos ORDER BY id'
        );

        return linhas.map((linha) => ({
            id: linha.id,
            nome: linha.nome,
            tipos: linha.tipos ? linha.tipos.split(',') : []
        }));

    } catch (error) {
        console.log('ERRO AO LER FAVORITOS:', error);

        return [];
    }
}

export async function alternarFavorito(pokemon) {

    try {
        const banco = await abrirBanco();

        const existente = await banco.getFirstAsync(
            'SELECT id FROM favoritos WHERE nome = ?',
            [pokemon.nome]
        );

        if (existente) {
            await banco.runAsync(
                'DELETE FROM favoritos WHERE nome = ?',
                [pokemon.nome]
            );
        } else {
            await banco.runAsync(
                'INSERT INTO favoritos (id, nome, tipos) VALUES (?, ?, ?)',
                [Number(pokemon.id), pokemon.nome, pokemon.tipos.join(',')]
            );
        }

    } catch (error) {
        console.log('ERRO AO ALTERNAR FAVORITO:', error);
    }

    return listarFavoritos();
}