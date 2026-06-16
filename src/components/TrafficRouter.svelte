<!-- TrafficRouter.svelte -->
<script>
    let { activeEnvironment = "ENVIRONMENT_BLUE" } = $props();
</script>

<div class="router-section">
    <h2 class="section-title">Traffic Routing Architecture</h2>

    <div class="router-flow">
        <!-- DNS/Gateway -->
        <div class="flow-node">
            <div class="node-box node-dns">
                Cloudfront Associated / DNS
                <span class="subtext">app.vijote.dev</span>
            </div>
        </div>

        <div class="flow-arrow">&rarr;</div>

        <!-- Blue Node -->
        <div class="flow-node">
            <div class="node-box node-blue">
                Blue Environment {activeEnvironment === "ENVIRONMENT_BLUE"
                    ? "(Active)"
                    : "(Standby)"}
                <span class="subtext color-blue">v2.4.0 (Stable release)</span>
            </div>
            {#if activeEnvironment === "ENVIRONMENT_BLUE"}
                <span class="badge badge-live">Live Traffic</span>
            {:else}
                <span class="badge badge-idle">Idle / Preview</span>
            {/if}
        </div>

        <div class="flow-arrow">&rarr;</div>

        <!-- Green Node -->
        <div class="flow-node">
            <div
                class="node-box node-green"
                class:active={activeEnvironment === "ENVIRONMENT_GREEN"}
            >
                Green Environment {activeEnvironment === "ENVIRONMENT_GREEN"
                    ? "(Active)"
                    : "(Standby)"}
                <span class="subtext color-green">v2.4.1-rc3 (Testing)</span>
            </div>
            {#if activeEnvironment === "ENVIRONMENT_GREEN"}
                <span class="badge badge-live">Live Traffic</span>
            {:else}
                <span class="badge badge-idle">Idle / Preview</span>
            {/if}
        </div>
    </div>
</div>

<style>
    .router-section {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 24px;
    }
    .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0 0 16px 0;
        border-left: 4px solid #38bdf8;
        padding-left: 8px;
    }
    .router-flow {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        background-color: #0f172a;
        border-radius: 6px;
        padding: 20px;
        padding-inline: 32px;
        border: 1px dashed #475569;
        gap: 12px;
    }
    .flow-node {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .flow-arrow {
        font-size: 1.5rem;
        color: #475569;
        font-weight: bold;
        user-select: none;
        margin-top: 20px;
        margin-inline: 4px;
    }
    .node-box {
        width: 100%;
        border-radius: 4px;
        padding: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.3s ease;
    }
    .subtext {
        display: block;
        font-size: 0.75rem;
        font-weight: normal;
        margin-top: 4px;
    }
    .node-dns {
        background-color: #334155;
        border: 1px solid #475569;
        color: #f8fafc;
    }
    .node-dns .subtext {
        color: #94a3b8;
    }

    /* Blue State handling */
    .node-blue {
        background-color: #1e3a8a;
        border: 2px solid #3b82f6;
        color: #93c5fd;
        opacity: 0.4;
    }
    .color-blue {
        color: #93c5fd;
    }

    /* Green State handling */
    .node-green {
        background-color: #064e3b;
        border: 2px solid #22c55e;
        color: #86efac;
        opacity: 0.4;
    }
    .node-green.active {
        opacity: 1;
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
    }
    .color-green {
        color: #86efac;
    }

    /* Badges */
    .badge {
        display: inline-block;
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 8px;
    }
    .badge-live {
        background-color: #ef4444;
        color: #ffffff;
    }
    .badge-idle {
        background-color: #475569;
        color: #cbd5e1;
    }
</style>
