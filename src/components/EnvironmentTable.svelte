<!-- EnvironmentTable.svelte -->
<script lang="ts">
    import {
        PUBLIC_GREEN_DISTRIBUTION_ID,
        PUBLIC_BLUE_DISTRIBUTION_ID,
        PUBLIC_OAC_ID,
    } from "$env/static/public";

    let { onPromote, onRetry, onDelete, environmentsPromise, onCreate } = $props();

    const promoteToGreen =
        (
            environmentId: string,
            hostBucketName: string,
            recipesBucketName: string,
            albDnsName: string,
        ) =>
        async () => {
            try {
                const response = await fetch("/api/promote-green", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        environment_id: environmentId,
                        distribution_id: GREEN_DISTRIBUTION_ID,
                        oac_id: OAC_ID,
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

    const promoteToBlue = (environmentId: string) => async () => {
        try {
            const response = await fetch("/api/promote-blue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    environment_id: environmentId,
                    primary_distribution_id: BLUE_DISTRIBUTION_ID,
                    staging_distribution_id: GREEN_DISTRIBUTION_ID,
                }),
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error promoting environment:", error);
        }
    };

    const deleteEnvironment = (environmentId: string) => async () => {
        try {
            const response = await fetch("/api/destroy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    environment_id: environmentId,
                }),
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error promoting environment:", error);
        }
    };

    function handlePromote(id: string, state: string) {
        if (state === "active" || state === "deploying") return;
        onPromote(id);
    }

    function handleCreate() {
        onCreate()
    }

    function handleRetry() {
        onRetry()
    }

    // function handleDelete(id: string, state: string) {
    //     if (state === "active") return; // Protección para producción
    //     onDelete(id);
    // }
</script>

<div class="table-container">
    <div class="table-header">
        <h2 class="section-title">Deployment Environments Registry</h2>
        <button class="btn btn-retry" onclick={handleCreate}>Create new environment</button>
    </div>
    {#await environmentsPromise}
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    {:then response}
        <table class="env-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>State</th>
                    <th>Promote</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {#each response.environments as env (env.id)}
                    <tr>
                        <!-- Colores dinámicos para los IDs principales -->
                        <td
                            class="env-id"
                            class:blue={env.id.includes("BLUE")}
                            class:green={env.id.includes("GREEN")}
                        >
                            {env.id}
                        </td>

                        <!-- Etiquetas de Estado -->
                        <td>
                            <span class="state-tag tag-{env.state}">
                                {#if env.state === "active"}Active (Live){/if}
                                {#if env.state === "standby"}Standby (Idle){/if}
                                {#if env.state === "deploying"}Provisioning...{/if}
                            </span>
                        </td>

                        <!-- Acción Promote -->
                        <td>
                            {#if env.state === "active"}
                                <button
                                    class="btn btn-promote disabled"
                                    disabled>Current Live</button
                                >
                            {:else}
                                <button
                                    class="btn btn-promote"
                                    disabled={env.state === "deploying"}
                                    onclick={() =>
                                        handlePromote(env.id, env.state)}
                                >
                                    {env.state === "deploying"
                                        ? "Building"
                                        : "Route Traffic (Switch)"}
                                </button>
                            {/if}
                        </td>

                        <!-- Acción Delete -->
                        <td>
                            {#if env.state === "active"}
                                <button
                                    class="btn btn-delete disabled"
                                    disabled
                                    style="opacity: 0.3;">Protected</button
                                >
                            {:else}
                                <button
                                    class="btn btn-delete"
                                    onclick={() => deleteEnvironment(env.id)}
                                >
                                    {env.state === "deploying"
                                        ? "Cancel"
                                        : "Terminate"}
                                </button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <button class="btn btn-retry" onclick={handleRetry}> Retry loading </button>
    {/await}
</div>

<style>
    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        & h2 {
            margin-bottom: unset;
        }
    }
    .table-container {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 16px;
    }
    .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0 0 16px 0;
        border-left: 4px solid #38bdf8;
        padding-left: 8px;
    }
    .env-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    .env-table th {
        background-color: #0f172a;
        color: #94a3b8;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 14px;
        border-bottom: 2px solid #334155;
    }
    .env-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #334155;
        font-size: 0.9rem;
        color: #f1f5f9;
    }
    .env-table tr:hover {
        background-color: #243247;
    }
    .env-id {
        font-weight: bold;
        color: #94a3b8;
    }
    .env-id.blue {
        color: #60a5fa;
    }
    .env-id.green {
        color: #4ade80;
    }

    /* Etiquetas de Estado */
    .state-tag {
        display: inline-block;
        font-size: 0.8rem;
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: 500;
    }
    .tag-active {
        background-color: #10b981;
        color: #042f2e;
    }
    .tag-standby {
        background-color: #3b82f6;
        color: #172554;
    }
    .tag-deploying {
        background-color: #f59e0b;
        color: #451a03;
    }

    /* Botones Mockup */
    .btn {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 4px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .btn-promote {
        background-color: #0ea5e9;
        color: #ffffff;
        border-color: #0284c7;
    }
    .btn-promote:hover:not(:disabled) {
        background-color: #0284c7;
    }
    .btn-promote.disabled {
        background-color: #334155;
        color: #64748b;
        border-color: #475569;
        cursor: not-allowed;
    }

    .btn-delete {
        background-color: #1e293b;
        color: #f1f5f9;
        border-color: #ef4444;
    }
    .btn-delete:hover:not(:disabled) {
        background-color: #991b1b;
        color: #ffffff;
    }
    .btn-delete.disabled {
        cursor: not-allowed;
    }
</style>
