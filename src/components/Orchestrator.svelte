<script lang="ts">
    import { PUBLIC_DISTRIBUTION_ID, PUBLIC_OAC_ID, PUBLIC_ALB_DNS_NAME } from '$env/static/public';

    function generateSecureShortHash(length = 8) {
        const arr = new Uint8Array(length / 2);
        crypto.getRandomValues(arr);
        return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function handleCreate() {
        try {
            const response = await fetch("/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ environment_id: generateSecureShortHash(8) })
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error creating environment:", error);
        }
    }

    async function handlePromote() {
        try {
            const response = await fetch("/api/promote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    distribution_id: PUBLIC_DISTRIBUTION_ID,
                    oac_id: PUBLIC_OAC_ID,
                    alb_dns_name: PUBLIC_ALB_DNS_NAME
                })
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error promoting environment:", error);
        }
    }

    function handleDelete() {
        console.log("Iniciando: Delete Old Environment...");
        alert("Acción: Eliminando el entorno antiguo de forma segura");
    }

    // Función que realiza la petición a tu API
    async function fetchEnvironments() {
        const response = await fetch('/api/getall');
        
        if (!response.ok) {
        throw new Error('Error al cargar los datos');
        }
        
        // Retornamos el array de objetos directamente
        return await response.json();
    }

    // Guardamos la promesa en una variable
    let environmentsPromise = fetchEnvironments();

    const promoteToGreen = (hostBucketName: string, recipesBucketName: string) => async () => {
        try {
            const response = await fetch("/api/promote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    distribution_id: PUBLIC_DISTRIBUTION_ID,
                    oac_id: PUBLIC_OAC_ID,
                    alb_dns_name: PUBLIC_ALB_DNS_NAME,
                    host_bucket_name: hostBucketName,
                    recipes_bucket_name: recipesBucketName,
                })
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error promoting environment:", error);
        }
    }
</script>

<div class="env-manager-container">
    <h2>Environment Management</h2>

    <h2>Lista de Entornos</h2>

  {#await environmentsPromise}
    <p>Cargando datos...</p>
  {:then environments}
    {#if environments.length === 0}
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
          {#each environments as env}
            <tr>
              <td>{env.environment_id}</td>
              <td>
                <span class="status-{env.state.toLowerCase()}">
                  {env.state}
                </span>
              </td>
              <td>
                <button on:click={promoteToGreen(env.host_bucket_name, env.recipes_bucket_name)}>Promote to green</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:catch error}
    <p style="color: red;">Hubo un problema: {error.message}</p>
  {/await}

    <div class="button-group">
        <button class="btn btn-create" on:click={handleCreate}>
            Create New Green Environment
        </button>

        <button class="btn btn-promote" on:click={handlePromote}>
            Promote Green to Blue
        </button>

        <button class="btn btn-delete" on:click={handleDelete}>
            Delete Old Environment
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
        transition: background-color 0.2s, transform 0.1s;
        text-align: left;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn-create {
        background-color: #22c55e;
        color: white;
    }
    .btn-create:hover {
        background-color: #16a34a;
    }

    .btn-promote {
        background-color: #3b82f6;
        color: white;
    }
    .btn-promote:hover {
        background-color: #2563eb;
    }

    .btn-delete {
        background-color: #ef4444;
        color: white;
    }
    .btn-delete:hover {
        background-color: #dc2626;
    }
</style>