// Mock Data Definitions
const marketOverviewData = {
    bitcoinPrice: '$68,750.20',
    ethereumPrice: '$3,450.80',
    totalMarketCap: '$2.55T',
    marketDominanceBTC: '52.1%',
    tradingVolume24h: '$120B'
};

const watchedAssetsData = [
    { name: 'Bitcoin', ticker: 'BTC', price: '$68,750.20', change24h: '+1.5%', chartData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [67000, 67500, 68000, 68200, 67900, 68500, 68750] } },
    { name: 'Ethereum', ticker: 'ETH', price: '$3,450.80', change24h: '-0.8%', chartData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [3500, 3480, 3420, 3450, 3460, 3430, 3450] } },
    { name: 'Solana', ticker: 'SOL', price: '$170.45', change24h: '+3.2%', chartData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [165, 166, 168, 172, 171, 169, 170] } },
    { name: 'Cardano', ticker: 'ADA', price: '$0.58', change24h: '+0.1%', chartData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [0.57, 0.58, 0.57, 0.59, 0.58, 0.58, 0.58] } },
];

const mainChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Overall Market Trend (USD Trillions)',
        data: [1.8, 1.9, 1.7, 2.0, 2.2, 2.1, 2.3, 2.4, 2.2, 2.5, 2.7, 2.55],
        borderColor: '#00bcd4', // Tech Teal
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        borderWidth: 2, tension: 0.4, fill: true,
        pointBackgroundColor: '#00bcd4', pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff', pointHoverBorderColor: '#00bcd4',
        pointRadius: 4, pointHoverRadius: 6
    }]
};

const nvtsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [1.5, 1.6, 1.4, 1.8, 2.0, 1.9, 2.1, 2.3, 2.0, 2.4, 2.6, 2.2]
};
const mvrvData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [2.2, 2.5, 2.1, 2.8, 3.1, 2.9, 3.3, 3.5, 3.0, 3.6, 3.9, 3.4]
};
const exchangeFlowData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon-2', 'Tue-2', 'Wed-2'],
    netFlows: [1500, -500, 2000, -1200, 800, 300, -100, 1800, -700, 1300]
};

const futuresOpenInterestData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    values: [10.5, 11.2, 10.8, 11.5, 12.1, 11.7, 12.5, 12.8]
};
const fundingRatesData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '00:00 (Next Day)'],
    rates: [0.005, 0.008, -0.002, 0.010, 0.007, -0.003, 0.006]
};
const impliedVolatilityData = {
    strikePrices: [50000, 55000, 60000, 65000, 68000, 70000, 75000, 80000],
    volatility: [0.65, 0.60, 0.55, 0.50, 0.48, 0.52, 0.58, 0.62]
};
const optionsChainData = [
    { type: 'Call', strike: 65000, premium: 2500.50, iv: '52.5%', volume: 120, oi: 1500 },
    { type: 'Call', strike: 68000, premium: 1800.75, iv: '50.0%', volume: 250, oi: 2200 },
    { type: 'Put', strike: 62000, premium: 1350.50, iv: '53.5%', volume: 150, oi: 1700 },
];

const technicalSignalsData = [
    { asset: 'BTC/USD', type: 'MA Crossover', signal: 'Golden Cross (50/200 DMA)', strength: 'Medium', timestamp: '2023-10-26 10:00 UTC' },
    { asset: 'ETH/USD', type: 'RSI', signal: 'Oversold (RSI < 30)', strength: 'High', timestamp: '2023-10-26 12:30 UTC' },
];
const onchainAnomalySignalsData = [
    { id: 'OCA001', type: 'Large Transfer to Exchange', details: '10,000 ETH ($34.5M) transferred from Unknown Wallet to Binance.', significance: 'High', timestamp: '2023-10-25 15:00 UTC' },
    { id: 'OCA002', type: 'Whale Accumulation', details: 'Address 0x123...abc has accumulated 500 BTC in the last 24h.', significance: 'High', timestamp: '2023-10-26 09:00 UTC' },
];

// --- Simulated AI (Gemini) API and Features ---

function mockGeminiApiCall(prompt, context = {}) {
    return new Promise((resolve) => {
        const delay = 700 + Math.random() * 800;
        let responseText = "Sorry, I don't have information on that specific query at the moment. I can answer questions about MVRV, NVTS, market sentiment, and general crypto terms like 'What are funding rates?'.";
        const normalizedPrompt = typeof prompt === 'string' ? prompt.toLowerCase().trim() : prompt;

        switch (normalizedPrompt) {
            case "interpret_onchain_nvts_mock":
                responseText = `AI Insight (NVTS): The current mock NVTS ratio of ${nvtsData.values.slice(-1)[0] || "N/A"} suggests the network might be slightly overvalued relative to recent transaction volume. Historically, prolonged periods above 2.5 have sometimes preceded market corrections. Consider this alongside MVRV. This is a simulated analysis.`;
                break;
            case "interpret_onchain_mvrv_mock":
                responseText = `AI Insight (MVRV): The mock MVRV ratio currently stands at ${mvrvData.values.slice(-1)[0] || "N/A"}. An MVRV above 3.0 often signals market tops, whereas below 1.0 can indicate bottoms. The current level suggests fair valuation. This is a simulated analysis.`;
                break;
            case "get_derivatives_sentiment_mock":
                responseText = `AI Sentiment Analysis (Derivatives): Based on simulated data – stable funding rates (${fundingRatesData.rates.slice(-1)[0] || "N/A"}%) and robust open interest ($${futuresOpenInterestData.values.slice(-1)[0] || "N/A"}B) – short-term sentiment appears cautiously optimistic. IV at ${((impliedVolatilityData.volatility.slice(-1)[0] * 100).toFixed(1) || "N/A")}% warrants attention. This is a simulated analysis.`;
                break;
            case "what is mvrv?": case "explain mvrv":
                responseText = `The MVRV (Market Value to Realized Value) ratio compares market cap to realized cap. High MVRV (>3.0) can indicate overvaluation; low MVRV (<1.0) undervaluation. Mock MVRV is ${mvrvData.values.slice(-1)[0] || "N/A"}. Simulated explanation.`;
                break;
            case "what is nvts?": case "explain nvts":
                responseText = `The NVTS (Network Value to Transactions Signal) uses a 90-day MA of transaction volume to assess if network value is supported by activity. High NVTS might suggest overvaluation. Mock NVTS is ${nvtsData.values.slice(-1)[0] || "N/A"}. Simulated explanation.`;
                break;
            case "what are funding rates?": case "explain funding rates":
                responseText = `Funding rates are payments between longs and shorts in perpetual futures. Positive: longs pay shorts (bullish sentiment). Negative: shorts pay longs (bearish). Mock rate is ${fundingRatesData.rates.slice(-1)[0] || "N/A"}%. Simulated explanation.`;
                break;
            default:
                if (normalizedPrompt.includes("help") || normalizedPrompt.includes("what can you do")) {
                    responseText = "I can provide interpretations for NVTS and MVRV, offer simulated market sentiment, and answer questions like 'What is MVRV?', 'Explain NVTS?', or 'What are funding rates?'.";
                }
                break;
        }
        setTimeout(() => resolve(responseText), delay);
    });
}

function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-indicator"><span></span><span></span><span></span> Thinking...</div>';
    }
}

function displayResponse(element, text) {
    if (element) {
        element.innerHTML = text.replace(/\n/g, '<br>'); // Replace newlines for HTML display
    }
}

function setupNLQHandler() {
    const nlqInput = document.getElementById('nlqInput');
    const nlqSubmitBtn = document.getElementById('nlqSubmitBtn');
    const nlqResponseArea = document.getElementById('nlqResponseArea');

    if (nlqSubmitBtn && nlqInput && nlqResponseArea && !nlqSubmitBtn.dataset.listenerAttached) {
        nlqSubmitBtn.addEventListener('click', () => {
            const query = nlqInput.value.trim();
            if (query) {
                showLoading(nlqResponseArea);
                mockGeminiApiCall(query)
                    .then(response => displayResponse(nlqResponseArea, response))
                    .catch(error => displayResponse(nlqResponseArea, "Error processing query."));
                nlqInput.value = '';
            } else {
                displayResponse(nlqResponseArea, "Please enter a question.");
            }
        });
        nlqSubmitBtn.dataset.listenerAttached = 'true';

        if (!nlqInput.dataset.listenerAttached) {
            nlqInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') nlqSubmitBtn.click();
            });
            nlqInput.dataset.listenerAttached = 'true';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a.nav-link');
    const sections = document.querySelectorAll('.section');
    const dashboardLink = document.querySelector('nav a.nav-link[data-section="dashboard"]');
    const dashboardSection = document.getElementById('dashboard');

    if (dashboardLink && dashboardSection) {
        dashboardLink.classList.add('active');
        dashboardSection.style.display = 'block';
        if (typeof initializeDashboard === 'function') initializeDashboard();
        if (typeof setupNLQHandler === 'function') setupNLQHandler();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('data-section');
            console.log(`Navigation link clicked: ${sectionId}`);

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => section.style.display = 'none');
            const targetSection = document.getElementById(sectionId);

            if (targetSection) {
                targetSection.style.display = 'block';
                if (sectionId === 'dashboard') {
                    if (typeof initializeDashboard === 'function') initializeDashboard(); // Optional: re-init or just ensure visible
                    if (typeof setupNLQHandler === 'function') setupNLQHandler(); // Ensure NLQ is ready
                } else if (sectionId === 'on-chain-analysis' && typeof initializeOnchainAnalysisModule === 'function') {
                    initializeOnchainAnalysisModule();
                } else if (sectionId === 'derivatives-analysis' && typeof initializeDerivativesAnalysisModule === 'function') {
                    initializeDerivativesAnalysisModule();
                } else if (sectionId === 'trading-signals' && typeof initializeTradingSignalsModule === 'function') {
                    initializeTradingSignalsModule();
                }
            } else {
                console.error(`Section with ID '${sectionId}' not found.`);
            }
        });
    });
    console.log('WTR Crypto Dashboard script loaded.');
});

function initializeDashboard() {
    populateCoreIndicators();
    renderMainChart();
    populateWatchedAssets();
    console.log('Dashboard initialized/updated.');
}

function populateCoreIndicators() {
    document.getElementById('bitcoinPrice').textContent = marketOverviewData.bitcoinPrice;
    document.getElementById('ethereumPrice').textContent = marketOverviewData.ethereumPrice;
    document.getElementById('totalMarketCap').textContent = marketOverviewData.totalMarketCap;
    document.getElementById('marketDominanceBTC').textContent = marketOverviewData.marketDominanceBTC;
    document.getElementById('tradingVolume24h').textContent = marketOverviewData.tradingVolume24h;
}

function renderMainChart() {
    const ctx = document.getElementById('mainMarketChart').getContext('2d');
    if (window.mainChartInstance) window.mainChartInstance.destroy();
    window.mainChartInstance = new Chart(ctx, { type: 'line', data: mainChartData, options: getCommonChartOptions('Overall Market Trend (USD Trillions)', 'Date', 'Market Cap ($T)')});
}

function populateWatchedAssets() {
    const container = document.getElementById('watchedAssetsContainer');
    if (!container) return;
    container.innerHTML = '';
    watchedAssetsData.forEach(asset => {
        const changeClass = asset.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400';
        const assetElement = `
            <div class="watched-asset-item">
                <div class="asset-info">
                    <span class="asset-name">${asset.name} (${asset.ticker})</span>
                    <span class="asset-price">${asset.price}</span>
                </div>
                <div class="asset-change ${changeClass}">${asset.change24h}</div>
                <div class="asset-sparkline-container">
                    <canvas id="sparkline-${asset.ticker}" class="sparkline-chart"></canvas>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', assetElement);
        renderSparklineChart(asset.ticker, asset.chartData);
    });
}

function renderSparklineChart(ticker, chartData) {
    const ctx = document.getElementById(`sparkline-${ticker}`).getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ data: chartData.values, borderColor: chartData.values.slice(-1)[0] > chartData.values.slice(-2)[0] ? '#4CAF50' : '#F44336', borderWidth: 1.5, tension: 0.4, fill: false, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { line: { borderJoinStyle: 'round'}}}
    });
}

function initializeOnchainAnalysisModule() {
    console.log('On-chain Analysis Module Initializing...');
    renderNvtsChart();
    renderMvrvChart();
    renderExchangeFlowChart();

    const mvrvInsightBtn = document.getElementById('mvrvAiInsightBtn');
    const mvrvResponseArea = document.getElementById('mvrvAiResponseArea');
    if (mvrvInsightBtn && mvrvResponseArea && !mvrvInsightBtn.dataset.listenerAttached) {
        mvrvInsightBtn.addEventListener('click', () => {
            showLoading(mvrvResponseArea);
            mockGeminiApiCall("interpret_onchain_mvrv_mock").then(response => displayResponse(mvrvResponseArea, response));
        });
        mvrvInsightBtn.dataset.listenerAttached = 'true';
    }

    const nvtsInsightBtn = document.getElementById('nvtsAiInsightBtn');
    const nvtsResponseArea = document.getElementById('nvtsAiResponseArea');
    if (nvtsInsightBtn && nvtsResponseArea && !nvtsInsightBtn.dataset.listenerAttached) {
        nvtsInsightBtn.addEventListener('click', () => {
            showLoading(nvtsResponseArea);
            mockGeminiApiCall("interpret_onchain_nvts_mock").then(response => displayResponse(nvtsResponseArea, response));
        });
        nvtsInsightBtn.dataset.listenerAttached = 'true';
    }
    console.log('On-chain Analysis Module Initialized.');
}

function renderNvtsChart() {
    const ctx = document.getElementById('nvtsChart').getContext('2d');
    if (window.nvtsChartInstance) window.nvtsChartInstance.destroy();
    window.nvtsChartInstance = new Chart(ctx, { type: 'line', data: { labels: nvtsData.labels, datasets: [{ label: 'NVTS Ratio', data: nvtsData.values, borderColor: '#8E44AD', backgroundColor: 'rgba(142, 68, 173, 0.1)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#8E44AD', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#8E44AD' }] }, options: getCommonChartOptions('NVTS Ratio', 'Date', 'Ratio') });
}

function renderMvrvChart() {
    const ctx = document.getElementById('mvrvChart').getContext('2d');
    if (window.mvrvChartInstance) window.mvrvChartInstance.destroy();
    window.mvrvChartInstance = new Chart(ctx, { type: 'line', data: { labels: mvrvData.labels, datasets: [{ label: 'MVRV Ratio', data: mvrvData.values, borderColor: '#2ECC71', backgroundColor: 'rgba(46, 204, 113, 0.1)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#2ECC71', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#2ECC71' }] }, options: getCommonChartOptions('MVRV Ratio', 'Date', 'Ratio') });
}

function renderExchangeFlowChart() {
    const ctx = document.getElementById('exchangeFlowChart').getContext('2d');
    if (window.exchangeFlowChartInstance) window.exchangeFlowChartInstance.destroy();
    window.exchangeFlowChartInstance = new Chart(ctx, { type: 'bar', data: { labels: exchangeFlowData.labels, datasets: [{ label: 'Net Exchange Flow (BTC)', data: exchangeFlowData.netFlows, backgroundColor: exchangeFlowData.netFlows.map(flow => flow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'), borderColor: exchangeFlowData.netFlows.map(flow => flow >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'), borderWidth: 1 }] }, options: getCommonChartOptions('Exchange Net Inflow/Outflow', 'Date', 'Net Flow (BTC)', true) });
}

function getCommonChartOptions(legendLabel, xLabel, yLabel, isBarChart = false) { // Simplified main chart options
    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { color: '#e0e0e0', font: { size: 14, family: "'Segoe UI', sans-serif" } } }, tooltip: { enabled: true, backgroundColor: 'rgba(0,0,0,0.8)', titleFont: {size: 14}, bodyFont: {size: 12}, padding: 10, borderColor: '#00bcd4', borderWidth: 1 } },
        scales: { x: { title: { display: true, text: xLabel, color: '#a0a0a0' }, ticks: { color: '#a0a0a0' }, grid: { color: '#333' } }, y: { title: { display: true, text: yLabel, color: '#a0a0a0' }, ticks: { color: '#a0a0a0' }, grid: { color: '#333' } } }
    };
    if (legendLabel === 'Overall Market Trend (USD Trillions)') { // Specific for main chart
         options.scales.y.ticks.callback = function(value) { return value + 'T'; };
         options.plugins.tooltip.callbacks = { label: function(context) { return (context.dataset.label || '') + ': ' + context.parsed.y + 'T'; }};
    }
    if (isBarChart) options.scales.y.beginAtZero = true;
    return options;
}

function initializeDerivativesAnalysisModule() {
    console.log('Derivatives Analysis Module Initializing...');
    renderOpenInterestChart();
    renderFundingRatesChart();
    renderImpliedVolatilityChart();
    displayOptionsChain();

    const sentimentCardDisplayArea = document.querySelector('#derivatives-analysis .ai-sentiment-card .ai-response-area');
    if (sentimentCardDisplayArea) {
        showLoading(sentimentCardDisplayArea);
        mockGeminiApiCall("get_derivatives_sentiment_mock")
            .then(response => displayResponse(sentimentCardDisplayArea, response))
            .catch(error => displayResponse(sentimentCardDisplayArea, "Error fetching AI sentiment."));
    }
    console.log('Derivatives Analysis Module Initialized.');
}

function renderOpenInterestChart() {
    const ctx = document.getElementById('openInterestChart').getContext('2d');
    if (window.openInterestChartInstance) window.openInterestChartInstance.destroy();
    window.openInterestChartInstance = new Chart(ctx, { type: 'bar', data: { labels: futuresOpenInterestData.labels, datasets: [{ label: 'Open Interest ($B)', data: futuresOpenInterestData.values, backgroundColor: 'rgba(52, 152, 219, 0.7)', borderColor: 'rgba(52, 152, 219, 1)', borderWidth: 1 }] }, options: getCommonChartOptions('Open Interest', 'Month', 'Value ($B)', true) });
}

function renderFundingRatesChart() {
    const ctx = document.getElementById('fundingRatesChart').getContext('2d');
    if (window.fundingRatesChartInstance) window.fundingRatesChartInstance.destroy();
    window.fundingRatesChartInstance = new Chart(ctx, { type: 'line', data: { labels: fundingRatesData.labels, datasets: [{ label: 'Funding Rate (%)', data: fundingRatesData.rates, borderColor: '#F39C12', backgroundColor: 'rgba(243, 156, 18, 0.1)', borderWidth: 2, tension: 0.1, fill: true, pointBackgroundColor: '#F39C12', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#F39C12'}] }, options: getCommonChartOptions('Funding Rates', 'Time', 'Rate (%)') });
}

function renderImpliedVolatilityChart() {
    const ctx = document.getElementById('impliedVolatilityChart').getContext('2d');
    if (window.impliedVolatilityChartInstance) window.impliedVolatilityChartInstance.destroy();
    window.impliedVolatilityChartInstance = new Chart(ctx, { type: 'line', data: { labels: impliedVolatilityData.strikePrices.map(String), datasets: [{ label: 'Implied Volatility (%)', data: impliedVolatilityData.volatility, borderColor: '#1ABC9C', backgroundColor: 'rgba(26, 188, 156, 0.1)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#1ABC9C', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#1ABC9C' }] }, options: getCommonChartOptions('Implied Volatility Smile/Skew', 'Strike Price', 'Volatility (%)') });
}

function displayOptionsChain() {
    const container = document.getElementById('optionsChainContainer');
    if (!container) return;
    container.innerHTML = '<h3 class="options-chain-title">Simplified Options Chain (BTC)</h3>';
    const table = document.createElement('table');
    table.className = 'options-chain-table';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    ['Type', 'Strike', 'Premium', 'IV', 'Volume', 'OI'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    const tbody = table.createTBody();
    optionsChainData.forEach(option => {
        const row = tbody.insertRow();
        Object.values(option).forEach(text => { const cell = row.insertCell(); cell.textContent = text; });
        row.classList.add(option.type.toLowerCase() + '-row');
    });
    container.appendChild(table);
}

function initializeTradingSignalsModule() {
    console.log('Trading Signals Module Initializing...');
    displayTechnicalSignals();
    displayOnchainAnomalySignals();
    console.log('Trading Signals Module Initialized.');
}

function getSignalStrengthIndicator(level) {
    const levelLower = level.toLowerCase();
    let colorClass = '';
    if (levelLower === 'high') colorClass = 'strength-high';
    else if (levelLower === 'medium') colorClass = 'strength-medium';
    else if (levelLower === 'low') colorClass = 'strength-low';
    return `<span class="signal-strength-indicator ${colorClass}" title="${level}"></span>`;
}

function displayTechnicalSignals() {
    const container = document.getElementById('technicalSignalsContainer');
    if (!container) return;
    container.innerHTML = '';
    technicalSignalsData.forEach(signal => {
        const signalElement = `
            <div class="signal-item">
                <div class="signal-header">
                    <span class="signal-asset">${signal.asset}</span>
                    ${getSignalStrengthIndicator(signal.strength)}
                </div>
                <div class="signal-body">
                    <p class="signal-type"><strong>Type:</strong> ${signal.type}</p>
                    <p class="signal-details"><strong>Signal:</strong> ${signal.signal}</p>
                </div>
                <div class="signal-footer">
                    <span class="signal-timestamp">${signal.timestamp}</span>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', signalElement);
    });
}

function displayOnchainAnomalySignals() {
    const container = document.getElementById('onchainAnomalySignalsContainer');
    if (!container) return;
    container.innerHTML = '';
    onchainAnomalySignalsData.forEach(signal => {
        const signalElement = `
            <div class="signal-item onchain-anomaly-item">
                <div class="signal-header">
                    <span class="signal-asset">On-chain Event</span>
                     ${getSignalStrengthIndicator(signal.significance)}
                </div>
                <div class="signal-body">
                    <p class="signal-type"><strong>Type:</strong> ${signal.type}</p>
                    <p class="signal-details"><strong>Details:</strong> ${signal.details}</p>
                </div>
                <div class="signal-footer">
                    <span class="signal-timestamp">${signal.timestamp}</span>
                    <span class="signal-id">Ref: ${signal.id}</span>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', signalElement);
    });
}
