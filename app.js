document.addEventListener("DOMContentLoaded", () => {
    const uptimeDisplay = document.getElementById("uptime-display");
    const statCpu = document.getElementById("stat-cpu");
    const statRam = document.getElementById("stat-ram");
    const statLatency = document.getElementById("stat-latency");
    const statRequests = document.getElementById("stat-requests");
    const reqRate = document.getElementById("req-rate");
    const cpuTrend = document.getElementById("cpu-trend");
    const latencyStatus = document.getElementById("latency-status");
    
    const terminalLogs = document.getElementById("terminal-logs");
    const autoScrollBtn = document.getElementById("auto-scroll-btn");
    const btnClear = document.getElementById("btn-clear");
    
    const waveSvg = document.getElementById("wave-svg");
    const waveStroke = document.getElementById("wave-stroke");
    const waveArea = document.getElementById("wave-area");
    const waveContainer = document.getElementById("wave-container");
    
    const reqMethod = document.getElementById("req-method");
    const reqPayload = document.getElementById("req-payload");
    const btnFire = document.getElementById("btn-fire");
    
    const themeDots = document.querySelectorAll(".accent-picker-dot");
    const btnToggleSim = document.getElementById("btn-toggle-sim");
    const btnInjectError = document.getElementById("btn-inject-error");
    const btnInjectLatency = document.getElementById("btn-inject-latency");

    let totalRequests = 0;
    let requestsThisSecond = 0;
    let lastSecRequestCount = 0;
    
    let autoScroll = true;
    let backgroundTrafficActive = true;
    let startTime = Date.now();
    let currentAccent = "cyan";
    
    let latencyHistory = [35, 42, 38, 45, 52, 48, 41, 44, 46, 39, 43, 37, 40, 42, 45, 41, 39, 43, 40, 42];
    const maxLatencyHistoryPoints = 24;
    
    let cpuSpikeActive = false;
    let latencySpikeActive = false;

    const syntaxHighlightJson = (jsonObj) => {
        let jsonStr = JSON.stringify(jsonObj, null, 2);
        jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    return `<span class="${cls}">${match.replace(":", "")}</span>:`;
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    const updateUptime = () => {
        const diffMs = Date.now() - startTime;
        const diffSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSecs / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, "0");
        const seconds = (diffSecs % 60).toString().padStart(2, "0");
        uptimeDisplay.textContent = `Uptime: ${hours}:${minutes}:${seconds}`;
    };
    setInterval(updateUptime, 1000);

    const updateSystemStats = () => {
        let cpuVal;
        if (cpuSpikeActive) {
            cpuVal = Math.random() * (85 - 65) + 65;
        } else {
            cpuVal = Math.random() * (6.5 - 2.0) + 2.0;
        }
        statCpu.textContent = `${cpuVal.toFixed(1)}%`;
        
        const ramVal = 2.15 + (Math.sin(Date.now() / 20000) * 0.15) + (Math.random() * 0.03);
        statRam.textContent = `${ramVal.toFixed(2)} GB`;

        const avgLatency = Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length);
        statLatency.textContent = `${avgLatency} ms`;

        if (avgLatency < 50) {
            latencyStatus.textContent = "Excelente";
            latencyStatus.className = "stat-trend optimal";
            statLatency.className = "stat-val terminal-font glow-accent";
        } else if (avgLatency < 120) {
            latencyStatus.textContent = "Aceitável";
            latencyStatus.className = "stat-trend warning";
            statLatency.className = "stat-val terminal-font";
        } else {
            latencyStatus.textContent = "Degradado";
            latencyStatus.className = "stat-trend";
            latencyStatus.style.color = "var(--status-5xx)";
            latencyStatus.style.background = "rgba(239, 68, 68, 0.08)";
            statLatency.className = "stat-val terminal-font";
            statLatency.style.textShadow = "0 0 10px rgba(239, 68, 68, 0.4)";
        }

        if (cpuVal > 50) {
            cpuTrend.textContent = "Estressado";
            cpuTrend.className = "stat-trend";
            cpuTrend.style.color = "var(--status-5xx)";
            cpuTrend.style.background = "rgba(239, 68, 68, 0.08)";
        } else {
            cpuTrend.textContent = "Estável";
            cpuTrend.className = "stat-trend optimal";
            cpuTrend.style.color = "";
            cpuTrend.style.background = "";
        }

        reqRate.textContent = `${lastSecRequestCount} req/s`;
        lastSecRequestCount = requestsThisSecond;
        requestsThisSecond = 0;
    };
    setInterval(updateSystemStats, 1000);

    const drawLatencyWave = () => {
        const width = waveContainer.clientWidth;
        const height = waveContainer.clientHeight;
        
        if (width === 0 || height === 0) return;

        waveSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        const pointsCount = latencyHistory.length;
        const stepX = width / (pointsCount - 1);
        const maxVal = Math.max(...latencyHistory, 120);

        const coords = latencyHistory.map((val, idx) => {
            const x = idx * stepX;
            const y = height - 15 - ((val / maxVal) * (height - 30));
            return { x, y };
        });

        let strokeD = "";
        let areaD = "";

        if (coords.length > 0) {
            strokeD = `M ${coords[0].x} ${coords[0].y}`;
            
            for (let i = 0; i < coords.length - 1; i++) {
                const p0 = coords[i];
                const p1 = coords[i+1];
                
                const cpX1 = p0.x + (p1.x - p0.x) / 2;
                const cpY1 = p0.y;
                const cpX2 = p0.x + (p1.x - p0.x) / 2;
                const cpY2 = p1.y;
                
                strokeD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
            }

            areaD = strokeD + ` L ${width} ${height} L 0 ${height} Z`;
        }

        waveStroke.setAttribute("d", strokeD);
        waveArea.setAttribute("d", areaD);
    };

    setTimeout(drawLatencyWave, 100);
    window.addEventListener("resize", drawLatencyWave);

    const injectLog = (method, endpoint, status, latency, payload) => {
        totalRequests++;
        requestsThisSecond++;
        statRequests.textContent = totalRequests.toLocaleString("pt-BR");

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${(now.getMilliseconds() / 10).toFixed(0).padStart(2, "0")}`;

        let statusClass = "s-5xx";
        if (status >= 200 && status < 300) statusClass = "s-2xx";
        else if (status >= 300 && status < 400) statusClass = "s-3xx";
        else if (status >= 400 && status < 500) statusClass = "s-4xx";

        const logRow = document.createElement("div");
        logRow.className = "log-row";
        
        const mockHeaders = {
            "Host": "api.devflow.io",
            "User-Agent": "DevFlow-Webhook-Listener/1.0",
            "Content-Type": "application/json",
            "X-Request-ID": Math.random().toString(36).substring(2, 15).toUpperCase(),
            "Authorization": "Bearer df_live_key_" + Math.random().toString(36).substring(2, 6)
        };

        logRow.innerHTML = `
            <div class="log-main-line">
                <span class="log-timestamp">${timeStr}</span>
                <span class="log-method ${method}">${method}</span>
                <span class="log-endpoint">${endpoint}</span>
                <span class="log-status ${statusClass}">
                    <span class="log-status-dot"></span>
                    <span>${status}</span>
                </span>
                <span class="log-latency">${latency}ms</span>
                <span class="log-expand-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>
            <div class="log-details">
                <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-secondary);">Request Headers:</div>
                <div class="json-container" style="margin-bottom: 0.75rem;">
                    ${syntaxHighlightJson(mockHeaders)}
                </div>
                <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-secondary);">Request Body Payload:</div>
                <div class="json-container">
                    ${syntaxHighlightJson(payload)}
                </div>
            </div>
        `;

        logRow.addEventListener("click", (e) => {
            if (e.target.closest(".json-container") || e.target.closest(".log-details div")) return;
            logRow.classList.toggle("expanded");
        });

        terminalLogs.appendChild(logRow);

        const allLogs = terminalLogs.querySelectorAll(".log-row");
        if (allLogs.length > 50) {
            allLogs[0].remove();
        }

        if (autoScroll) {
            terminalLogs.scrollTop = terminalLogs.scrollHeight;
        }

        latencyHistory.push(latency);
        if (latencyHistory.length > maxLatencyHistoryPoints) {
            latencyHistory.shift();
        }
        drawLatencyWave();
    };

    const mockRoutes = [
        { method: "GET", endpoint: "/api/v1/auth/session", weight: 30 },
        { method: "POST", endpoint: "/api/v1/webhooks/stripe-charge", weight: 15 },
        { method: "GET", endpoint: "/api/v1/products/list", weight: 20 },
        { method: "PUT", endpoint: "/api/v1/users/profile", weight: 10 },
        { method: "DELETE", endpoint: "/api/v1/cache/purge-cdn", weight: 5 },
        { method: "GET", endpoint: "/api/v1/system/telemetry", weight: 15 },
        { method: "POST", endpoint: "/api/v1/analytics/clickstream", weight: 5 }
    ];

    const generateRandomPayload = (method, endpoint) => {
        if (method === "GET" || method === "DELETE") {
            return { query_params: { page: 1, limit: 10, filter: "active" } };
        }
        
        if (endpoint.includes("stripe-charge")) {
            return {
                id: "ch_" + Math.random().toString(36).substring(2, 10),
                amount: Math.floor(Math.random() * 9500) + 500,
                currency: "brl",
                customer: "cus_" + Math.random().toString(36).substring(2, 8),
                payment_status: "succeeded"
            };
        }

        if (endpoint.includes("profile")) {
            const firstNames = ["Jerry", "Carlos", "Renata", "Juliana", "Vitor"];
            return {
                updated_fields: {
                    display_name: firstNames[Math.floor(Math.random() * firstNames.length)] + " Projetos",
                    avatar_url: "https://cdn.devflow.io/avatars/u_402.png",
                    notifications_enabled: Math.random() > 0.5
                }
            };
        }

        return {
            timestamp: Date.now(),
            client_id: "cl_app_" + Math.floor(Math.random() * 900),
            session_token: "sess_" + Math.random().toString(36).substring(2, 16)
        };
    };

    const triggerBackgroundTraffic = () => {
        if (!backgroundTrafficActive) return;

        let totalWeight = mockRoutes.reduce((sum, r) => sum + r.weight, 0);
        let randomWeight = Math.random() * totalWeight;
        let selectedRoute = mockRoutes[0];
        
        for (let route of mockRoutes) {
            randomWeight -= route.weight;
            if (randomWeight <= 0) {
                selectedRoute = route;
                break;
            }
        }

        let status = 200;
        let latency = Math.floor(Math.random() * 25) + 15;

        if (latencySpikeActive) {
            latency = Math.floor(Math.random() * (450 - 320)) + 320;
        }

        const rand = Math.random() * 100;
        if (rand < 75) {
            status = selectedRoute.method === "POST" ? 201 : 200;
        } else if (rand < 88) {
            status = 304;
            latency = Math.floor(Math.random() * 8) + 3;
        } else if (rand < 96) {
            status = [400, 401, 403, 404][Math.floor(Math.random() * 4)];
            latency = Math.floor(Math.random() * 60) + 30;
        } else {
            status = 500;
            latency = Math.floor(Math.random() * 200) + 150;
        }

        const payload = generateRandomPayload(selectedRoute.method, selectedRoute.endpoint);
        injectLog(selectedRoute.method, selectedRoute.endpoint, status, latency, payload);

        const nextTimeout = Math.random() * (3500 - 1200) + 1200;
        setTimeout(triggerBackgroundTraffic, nextTimeout);
    };

    setTimeout(triggerBackgroundTraffic, 1500);

    btnFire.addEventListener("click", () => {
        const method = reqMethod.value;
        const endpoint = method === "GET" 
            ? "/api/v1/query/resource" 
            : method === "POST" 
            ? "/api/v1/webhook/manual-trigger" 
            : method === "PUT" 
            ? "/api/v1/update/resource" 
            : "/api/v1/delete/resource";

        let payload;
        
        try {
            payload = JSON.parse(reqPayload.value);
        } catch (err) {
            const errorRow = document.createElement("div");
            errorRow.className = "log-row";
            errorRow.style.borderColor = "var(--status-5xx)";
            errorRow.style.background = "rgba(239, 68, 68, 0.03)";
            
            const timeStr = new Date().toLocaleTimeString("pt-BR");
            
            errorRow.innerHTML = `
                <div class="log-main-line" style="color: var(--status-5xx);">
                    <span class="log-timestamp">${timeStr}</span>
                    <span class="log-method DELETE" style="background: var(--status-5xx);">ERR</span>
                    <span class="log-endpoint">[PARSING ERROR] Sintaxe JSON inválida no payload.</span>
                    <span class="log-status s-5xx" style="margin-left: auto;">
                        <span class="log-status-dot"></span>
                        <span>400</span>
                    </span>
                </div>
            `;
            terminalLogs.appendChild(errorRow);
            if (autoScroll) terminalLogs.scrollTop = terminalLogs.scrollHeight;
            
            cpuSpikeActive = true;
            setTimeout(() => { cpuSpikeActive = false; }, 2000);
            return;
        }

        btnFire.style.transform = "scale(0.96)";
        setTimeout(() => { btnFire.style.transform = ""; }, 150);

        const latency = Math.floor(Math.random() * 20) + 10;
        const status = method === "POST" ? 201 : 200;

        injectLog(method, endpoint, status, latency, payload);

        cpuSpikeActive = true;
        setTimeout(() => { cpuSpikeActive = false; }, 1200);
    });

    btnInjectError.addEventListener("click", () => {
        const payload = {
            error_code: "INTERNAL_SERVER_FATAL",
            exception_trace: "NullPointerException at com.devflow.controller.WebhookReceiver.parsePayload(WebhookReceiver.java:42)",
            context: {
                database_pool_active: 100,
                max_connections_reached: true
            }
        };

        injectLog("POST", "/api/v1/users/register", 500, 524, payload);

        cpuSpikeActive = true;
        setTimeout(() => { cpuSpikeActive = false; }, 2500);
    });

    btnInjectLatency.addEventListener("click", () => {
        latencySpikeActive = true;

        const payload = {
            network_gateway: "cloudflare_edge_poa",
            bgp_route_flapping: true,
            packet_loss_ratio: "2.4%",
            warning: "BGP route updates causing routing loops at Latin America gateway."
        };

        injectLog("GET", "/api/v1/gateway/status", 200, 842, payload);

        setTimeout(() => {
            latencySpikeActive = false;
        }, 6000);
    });

    themeDots.forEach(dot => {
        dot.addEventListener("click", () => {
            themeDots.forEach(d => d.classList.remove("active"));
            dot.classList.add("active");

            const color = dot.getAttribute("data-color");
            currentAccent = color;
            document.body.setAttribute("data-accent", color);

            setTimeout(drawLatencyWave, 50);
        });
    });

    btnToggleSim.addEventListener("click", () => {
        backgroundTrafficActive = !backgroundTrafficActive;
        btnToggleSim.classList.toggle("active");

        if (backgroundTrafficActive) {
            btnToggleSim.textContent = "Fluxo Ativo: ON";
            triggerBackgroundTraffic();
        } else {
            btnToggleSim.textContent = "Fluxo Ativo: OFF";
        }
    });

    btnClear.addEventListener("click", () => {
        const welcome = terminalLogs.querySelector(".welcome-log").cloneNode(true);
        terminalLogs.innerHTML = "";
        terminalLogs.appendChild(welcome);
    });

    autoScrollBtn.addEventListener("click", () => {
        autoScroll = !autoScroll;
        autoScrollBtn.classList.toggle("active");
    });
});
