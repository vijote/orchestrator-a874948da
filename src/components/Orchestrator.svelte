<script lang="ts">
    import {
        PUBLIC_GREEN_DISTRIBUTION_ID,
        PUBLIC_BLUE_DISTRIBUTION_ID,
        PUBLIC_OAC_ID,
    } from "$env/static/public";

    function generateSecureShortHash(length = 8) {
        const arr = new Uint8Array(length / 2);
        crypto.getRandomValues(arr);
        return Array.from(arr, (byte) =>
            byte.toString(16).padStart(2, "0"),
        ).join("");
    }

    async function handleCreate() {
        try {
            const response = await fetch("/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    environment_id: generateSecureShortHash(8),
                }),
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error creating environment:", error);
        }
    }

    function handleDelete() {
        console.log("Iniciando: Delete Old Environment...");
        alert("Acción: Eliminando el entorno antiguo de forma segura");
    }

    // Función que realiza la petición a tu API
    async function fetchEnvironments() {
        const response = await fetch("/api/getall");

        if (!response.ok) {
            throw new Error("Error al cargar los datos de los entornos");
        }

        const data = await response.json();
        return data;
    }

    // Guardamos la promesa en una variable
    let environmentsPromise = fetchEnvironments();

    // NUEVA FUNCIÓN: Vuelve a ejecutar la petición y reasigna la promesa
    function handleRetry() {
        environmentsPromise = fetchEnvironments();
    }

    const promoteToGreen =
        (environmentId: string, hostBucketName: string, recipesBucketName: string, albDnsName: string) => async () => {
            try {
                const response = await fetch("/api/promote-green", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        environment_id: environmentId,
                        distribution_id: PUBLIC_GREEN_DISTRIBUTION_ID,
                        oac_id: PUBLIC_OAC_ID,
                        alb_dns_name: albDnsName,
                        host_bucket_name: hostBucketName,
                        recipes_bucket_name: recipesBucketName,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`server error: ${response.status}`);
                }
            } catch (error) {
                console.error("error promoting environment:", error);
            }
        };

    const promoteToBlue =
        (hostBucketName: string, recipesBucketName: string, albDnsName: string) => async () => {
            try {
                const response = await fetch("/api/promote-blue", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        distribution_id: PUBLIC_BLUE_DISTRIBUTION_ID,
                        oac_id: PUBLIC_OAC_ID,
                        alb_dns_name: albDnsName,
                        host_bucket_name: hostBucketName,
                        recipes_bucket_name: recipesBucketName,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`server error: ${response.status}`);
                }
            } catch (error) {
                console.error("error promoting environment:", error);
            }
        };
</script>

<div class="env-manager-container">
    <h2>Environment Management</h2>

    <h2>Lista de Entornos</h2>

    {#await environmentsPromise}
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
        </div>
    {:then response}
            <button class="btn btn-retry" on:click={handleRetry}>
                🔄 Reintentar cargar
            </button>
        {#if response.environments.length === 0}
            <p>No se encontraron entornos.</p>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th>ID del Entorno</th>
                        <th>Estado</th>
                        <th>Accion</th>
                    </tr>
                </thead>
                <tbody>
                    {#each response.environments as env}
                        <tr>
                            <td>{env.environment}</td>
                            <td>
                                <span class="status-{env.env_status}">
                                    {env.env_status}
                                </span>
                            </td>
                            {#if env.env_status === "unused"}
                                <td>
                                    <button
                                        on:click={promoteToGreen(
                                            env.environment,
                                            env.host_bucket_domain,
                                            env.recipes_bucket_domain,
                                            env.alb_dns_name
                                        )}>Promote to green</button
                                    >
                                </td>
                            {:else if env.env_status === "green"}
                                <td>
                                    <button
                                        on:click={promoteToBlue(
                                            env.host_bucket_domain,
                                            env.recipes_bucket_domain,
                                            env.alb_dns_name
                                        )}>Promote to blue</button
                                    >
                                </td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    {:catch error}
        <div class="error-container">
            <p class="error-text">Hubo un problema: {error.message}</p>
            <button class="btn btn-retry" on:click={handleRetry}>
                🔄 Reintentar cargar
            </button>
        </div>
    {/await}

    <div class="button-group">
        <button class="btn btn-create" on:click={handleCreate}>
            Create New Green Environment
        </button>
    </div>
</div>

<style>
    .env-manager-container {
        padding: 2rem;
        font-family: system-ui, sans-serif;
    }

    h2 {
        margin-top: 0;
        color: #1e293b;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 1rem;
        color: #64748b;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* CAMBIO AQUÍ: Estilos para el contenedor de error y el botón de retry */
    .error-container {
        padding: 1rem;
        background-color: #fef2f2;
        border: 1px solid #fee2e2;
        border-radius: 6px;
        margin-bottom: 1.5rem;
    }

    .error-text {
        color: #ef4444;
        margin-top: 0;
        font-weight: 500;
    }

    .btn-retry {
        background-color: #475569;
        color: white;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
    }

    .btn-retry:hover {
        background-color: #334155;
    }

    .button-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .btn {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition:
            background-color 0.2s,
            transform 0.1s;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn-create {
        background-color: #22c55e;
        color: white;
        text-align: left;
    }
    .btn-create:hover {
        background-color: #16a34a;
    }
</style>
