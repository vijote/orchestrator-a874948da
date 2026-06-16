<!-- App.svelte -->
<script lang="ts">
    import TrafficRouter from "./TrafficRouter.svelte";
    import EnvironmentTable from "./EnvironmentTable.svelte";
    import { invalidateAll } from '$app/navigation';
    import {
        PUBLIC_GREEN_DISTRIBUTION_ID,
        PUBLIC_BLUE_DISTRIBUTION_ID,
        PUBLIC_OAC_ID,
    } from "$env/static/public";
    import { EnvironmentStates, type Environment } from "../types";

    let { environmentsPromise } = $props();

    // Estado centralizado reactivo
    let environments = $state([
        { id: "ENVIRONMENT_BLUE", state: "active" },
        { id: "ENVIRONMENT_GREEN", state: "standby" },
        { id: "ENV_STAGING_TEMP_A", state: "deploying" },
    ]);

    // Derivamos dinámicamente cuál es el entorno activo para pasarlo a los componentes
    let activeEnv = $derived(
        environments.find((e) => e.state === "active")?.id || "NONE",
    );

    function generateSecureShortHash(length = 8) {
        const arr = new Uint8Array(length / 2);
        crypto.getRandomValues(arr);
        return Array.from(arr, (byte) =>
            byte.toString(16).padStart(2, "0"),
        ).join("");
    }

    async function onRetryClick() {
        // Al invalidar, SvelteKit ejecuta el load de nuevo,
        // genera una nueva promesa y el {#await} se reinicia solo.
        await invalidateAll();
    }

    async function onCreateClick() {
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

    const promoteToGreen =
        (environment: Environment) =>
        async () => {
            try {
                const response = await fetch("/api/promote-green", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        environment_id: environment.environment,
                        distribution_id: PUBLIC_GREEN_DISTRIBUTION_ID,
                        oac_id: PUBLIC_OAC_ID,
                        alb_dns_name: environment.alb_dns_name,
                        host_bucket_name: environment.host_bucket_name,
                        recipes_bucket_name: environment.recipes_bucket_name,
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
                    primary_distribution_id: PUBLIC_BLUE_DISTRIBUTION_ID,
                    staging_distribution_id: PUBLIC_GREEN_DISTRIBUTION_ID,
                }),
            });

            if (!response.ok) {
                throw new Error(`server error: ${response.status}`);
            }
        } catch (error) {
            console.error("error promoting environment:", error);
        }
    };

    function onPromoteClick(environment: Environment) {
        if(environment.status === EnvironmentStates.GREEN) {
            promoteToBlue(environment.environment)
        } else if (environment.status === EnvironmentStates.UNUSED) {
            promoteToGreen(environment)
        }
    }

    const onDeleteClick = (environmentId: string) => async () => {
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
</script>

<main class="console-wrapper">
    <!-- Header General -->
    <header class="main-header">
        <div>
            <h1 class="title">Blue-Green Deployment Console</h1>
            <p class="subtitle">
                Automated zero-downtime infrastructure orchestration environment
                selector
            </p>
        </div>
    </header>

    <!-- Componentes del Dashboard -->

    <TrafficRouter activeEnvironment={activeEnv} />

    <EnvironmentTable
        {environmentsPromise}
        onRetry={onRetryClick}
        onCreate={onCreateClick}
        onPromote={onPromoteClick}
        onDelete={onDeleteClick}
    />
</main>

<style>
    :global(body) {
        background-color: #0f172a;
        margin: 0;
        font-family:
            system-ui,
            -apple-system,
            sans-serif;
    }
    .console-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
        color: #f8fafc;
    }
    .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #334155;
        padding-bottom: 16px;
        margin-bottom: 24px;
    }
    .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #38bdf8;
        margin: 0;
    }
    .subtitle {
        font-size: 0.85rem;
        color: #94a3b8;
        margin: 4px 0 0 0;
    }
</style>
