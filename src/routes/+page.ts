import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
    // Retornamos la promesa directamente, NO la esperamos aquí
    const environmentsPromise = fetch("https://orchestrator.vijote.dev/api/getall").then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar los entornos");
        return res.json(); // Esto debe retornar la estructura { environments: [...] }
    });

    return { environmentsPromise };
};