/* src/assets/js/calculator.js */
document.addEventListener("DOMContentLoaded", function () {
    const simulatorNode = document.getElementById("simulator");
    if (!simulatorNode) return;

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    runCalculatorLogic(simulatorNode);
});

function runCalculatorLogic(simulatorNode) {
    const SIMULATION_MONTHS = 12;
    const MAX_COMMISSION_SUM = 80;

    const els = {
        price: simulatorNode.querySelector("#price"),
        initialPartners: simulatorNode.querySelector("#initialPartners"),
        partnerDuplication: simulatorNode.querySelector("#partnerDuplication"),
        priceValue: simulatorNode.querySelector("#priceValue"),
        initialPartnersValue: simulatorNode.querySelector("#initialPartnersValue"),
        partnerDuplicationValue: simulatorNode.querySelector("#partnerDuplicationValue"),
        
        // Classic Column
        classic: {
            title: simulatorNode.querySelector("#classicTitle"),
            levels: simulatorNode.querySelector("#classicLevels"),
            levelsValue: simulatorNode.querySelector("#classicLevelsValue"),
            l1Row: simulatorNode.querySelector("#classicL1Row"),
            l2Row: simulatorNode.querySelector("#classicL2Row"),
            l1: simulatorNode.querySelector("#classicL1"),
            l2: simulatorNode.querySelector("#classicL2"),
            subtitle: simulatorNode.querySelector("#classicSubtitle"),
            partners: simulatorNode.querySelector("#classicTotalPartners"),
            income: simulatorNode.querySelector("#classicAuthorIncome"),
            incomeLabel: simulatorNode.querySelector("#classicIncomeLabel"),
        },
        
        // SetHubble Column
        sethubble: {
            levels: simulatorNode.querySelector("#sethubbleLevels"),
            levelsValue: simulatorNode.querySelector("#sethubbleLevelsValue"),
            l1: simulatorNode.querySelector("#sethubbleL1"),
            l2plus: simulatorNode.querySelector("#sethubbleL2plus"),
            l1Row: simulatorNode.querySelector("#sethubbleL1Row"),
            l2plusRow: simulatorNode.querySelector("#sethubbleL2plusRow"),
            warning: simulatorNode.querySelector("#sethubbleWarning"),
            subtitle: simulatorNode.querySelector("#sethubbleSubtitle"),
            l2plusLabel: simulatorNode.querySelector("#sethubbleL2plusLabel"),
            partners: simulatorNode.querySelector("#sethubbleTotalPartners"),
            income: simulatorNode.querySelector("#sethubbleAuthorIncome"),
            incomeLabel: simulatorNode.querySelector("#sethubbleIncomeLabel"),
        },

        conclusionText: simulatorNode.querySelector("#conclusionText"),
        chartCtx: simulatorNode.querySelector("#salesChart")?.getContext("2d"),
        
        // Switchers
        modeSwitcher: simulatorNode.querySelector("#simulatorModeSwitcher"),
        businessSwitcher: simulatorNode.querySelector("#businessTypeSwitcher"),
        
        simulatorSubtitle: simulatorNode.querySelector("#simulatorSubtitle"),
        priceLabel: simulatorNode.querySelector("#priceLabel"),
        initialPartnersLabel: simulatorNode.querySelector("#initialPartnersLabel"),
        duplicationLabel: simulatorNode.querySelector("#duplicationLabel"),
    };

    if (!els.price || !els.chartCtx) return;

    let salesChartInstance = null;
    let currentMode = "author"; 
    let currentBizType = "online"; 

    const config = {
        general: { price: 100, partners: 10, sales: 2 },
        classic: { levels: 2, commissions: [30, 5] },
        sethubble: { levels: 5, commissions: { l1: 40, l2plus: 5 } },
    };

    const formatNumber = (num) => Math.round(num).toLocaleString("en-US");

    // --- ANIMATION ---
    function animateCounter(element, targetValue, isCurrency = false) {
        let startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        if (isNaN(startValue)) startValue = 0;
        if(targetValue > 10000000) {
             element.textContent = isCurrency ? "$" + formatNumber(targetValue) : formatNumber(targetValue);
             return;
        }
        const duration = 800;
        let startTime = null;
        function animationStep(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (targetValue - startValue) * easeProgress;
            element.textContent = isCurrency ? "$" + formatNumber(currentValue) : formatNumber(currentValue);
            if (progress < 1) requestAnimationFrame(animationStep);
        }
        requestAnimationFrame(animationStep);
    }

    // --- LOGIC ---
    function runSimulation(modelConfig, mode) {
        const { levels, commissions } = modelConfig;
        const { price, partners: monthlyRecruits, sales: duplicationRate } = config.general;
        
        let partnersByLevel = Array(levels).fill(0);
        let totalPayout = 0;
        let totalSalesCount = 0;
        let monthlyPartnersChart = [0];

        for (let month = 1; month <= SIMULATION_MONTHS; month++) {
            let newPartnersThisMonth = Array(levels).fill(0);

            if (levels === 0) {
                 totalSalesCount += monthlyRecruits;
            } else {
                newPartnersThisMonth[0] = monthlyRecruits;
                totalSalesCount += monthlyRecruits;
                totalPayout += monthlyRecruits * price * (commissions[0] / 100);
            }

            if (levels > 0) {
                for (let level = 0; level < levels - 1; level++) {
                    const newRecruitsFromDepth = Math.round(partnersByLevel[level] * duplicationRate);
                    newPartnersThisMonth[level + 1] += newRecruitsFromDepth;
                    totalSalesCount += newRecruitsFromDepth;
                    if (commissions[level + 1]) {
                        totalPayout += newRecruitsFromDepth * price * (commissions[level + 1] / 100);
                    }
                }
                partnersByLevel = partnersByLevel.map((p, i) => p + newPartnersThisMonth[i]);
            }

            const currentTotalActive = levels > 0 
                ? partnersByLevel.reduce((a, b) => a + b, 0)
                : totalSalesCount; 
            
            monthlyPartnersChart.push(currentTotalActive);
        }

        const totalPartners = levels > 0 ? partnersByLevel.reduce((a, b) => a + b, 0) : totalSalesCount;

        if (mode === "author") {
            const totalRevenue = totalSalesCount * price;
            return { totalPartners, income: totalRevenue - totalPayout, monthlyPartnersChart };
        } else {
            return { totalPartners, income: totalPayout, monthlyPartnersChart };
        }
    }

    // --- UI UPDATES ---
    window.setBusinessType = function(newType) {
        currentBizType = newType;
        if(els.businessSwitcher) {
            els.businessSwitcher.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === newType);
            });
        }

        if (newType === 'offline') {
            els.classic.levels.disabled = true;
            els.classic.levels.value = 0;
            els.classic.levels.style.opacity = '0.3';
            config.classic.levels = 0;
            els.classic.title.innerText = "Traditional Business";
            els.classic.subtitle.innerText = "No referral system";
            els.duplicationLabel.innerText = "Word-of-Mouth Rate";
            config.general.price = 50; 
            els.price.value = 50;
        } else {
            els.classic.levels.disabled = false;
            els.classic.levels.value = 2;
            els.classic.levels.style.opacity = '0.7';
            config.classic.levels = 2;
            els.classic.title.innerText = "Standard Affiliate";
            els.duplicationLabel.innerText = "Virality Factor";
            config.general.price = 100;
            els.price.value = 100;
        }
        updateLabels();
        updateSimulatorUI();
        window.renderSimulator();
    }

    window.setSimulatorMode = function (newMode) {
        if (newMode === currentMode) return;
        currentMode = newMode;
        els.modeSwitcher.querySelectorAll('.mode-btn').forEach(btn => 
            btn.classList.toggle("active", btn.dataset.mode === newMode)
        );
        updateLabels();
        window.renderSimulator();
    };

    function updateLabels() {
        if (currentMode === "author") {
            els.simulatorSubtitle.innerText = currentBizType === 'online' 
                ? "Calculate net profit for your online course or service."
                : "Calculate net profit for your shop, salon, or restaurant.";
            els.priceLabel.innerText = currentBizType === 'online' ? "Product/Service Price" : "Average Check";
            els.initialPartnersLabel.innerText = "New Clients / Month";
            els.classic.incomeLabel.innerText = "Your Net Profit";
            els.sethubble.incomeLabel.innerText = "Your Net Profit";
        } else {
            els.simulatorSubtitle.innerText = "Calculate commissions earned by recommending businesses.";
            els.priceLabel.innerText = "Purchase Amount";
            els.initialPartnersLabel.innerText = "My Direct Sales";
            els.classic.incomeLabel.innerText = "Your Commission";
            els.sethubble.incomeLabel.innerText = "Your Commission";
        }
    }

    function updateSimulatorUI() {
        els.priceValue.textContent = "$" + config.general.price;
        els.initialPartnersValue.textContent = config.general.partners;
        els.partnerDuplicationValue.textContent = config.general.sales;
        
        els.classic.levelsValue.textContent = config.classic.levels;
        els.classic.l1Row.style.display = config.classic.levels < 1 ? 'none' : 'flex';
        els.classic.l2Row.style.display = config.classic.levels < 2 ? 'none' : 'flex';

        if (config.classic.levels > 0) {
            let info = `${config.classic.levels} Lvl: ${config.classic.commissions[0]}%`;
            if (config.classic.levels > 1) info += ` + ${config.classic.commissions[1]}%`;
            els.classic.subtitle.textContent = info;
        } else {
            els.classic.subtitle.textContent = "Direct Sales Only";
        }

        els.sethubble.levelsValue.textContent = config.sethubble.levels;
        els.sethubble.l1Row.classList.toggle("hidden", config.sethubble.levels < 1);
        els.sethubble.l2plusRow.classList.toggle("hidden", config.sethubble.levels < 2);
        
        if (config.sethubble.levels > 1) {
            els.sethubble.l2plusLabel.textContent = `Comm. Lvl 2-${config.sethubble.levels}, %`;
        }
    }

    function validateSetHubbleCommissions() {
        const { levels } = config.sethubble;
        let l1 = parseInt(els.sethubble.l1.value) || 0;
        let l2plus = parseInt(els.sethubble.l2plus.value) || 0;
        const currentTotal = levels > 1 ? l1 + (levels - 1) * l2plus : l1;
        if (currentTotal > MAX_COMMISSION_SUM) {
            els.sethubble.warning.textContent = `⚠️ Payout limit ${MAX_COMMISSION_SUM}% exceeded`;
        } else {
            els.sethubble.warning.textContent = "";
        }
        config.sethubble.commissions.l1 = l1;
        config.sethubble.commissions.l2plus = l2plus;
    }

    window.renderSimulator = function () {
        if (!els.chartCtx) return;
        config.classic.commissions = [ parseInt(els.classic.l1.value)||0, parseInt(els.classic.l2.value)||0 ];

        const sethubbleCommsArray = Array(config.sethubble.levels).fill(0).map((_, i) =>
            i === 0 ? config.sethubble.commissions.l1 : config.sethubble.commissions.l2plus
        );

        const classicResults = runSimulation({
            levels: config.classic.levels, commissions: config.classic.commissions
        }, currentMode);

        const sethubbleResults = runSimulation({
            levels: config.sethubble.levels, commissions: sethubbleCommsArray
        }, currentMode);

        animateCounter(els.classic.partners, classicResults.totalPartners);
        animateCounter(els.classic.income, classicResults.income, true);
        animateCounter(els.sethubble.partners, sethubbleResults.totalPartners);
        animateCounter(els.sethubble.income, sethubbleResults.income, true);

        let conclusion = "";
        const diff = sethubbleResults.income - classicResults.income;
        if (diff > 0) {
            const times = (sethubbleResults.income / (classicResults.income || 1)).toFixed(1);
            conclusion = `With SetHubble you get <span class="highlight-text">${times}x more</span> reach and income.`;
        } else {
            conclusion = "Income is comparable, but SetHubble automates the entire process.";
        }
        els.conclusionText.innerHTML = conclusion;

        if (salesChartInstance) salesChartInstance.destroy();
        const labels = Array.from({ length: SIMULATION_MONTHS + 1 }, (_, i) => i === 0 ? "Start" : i);
        const colorSetHubble = "#00f7ff";
        const colorClassic = currentBizType === 'offline' ? "#666666" : "#ec4899";

        salesChartInstance = new Chart(els.chartCtx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: currentBizType === 'offline' ? "Linear Growth (No System)" : "Classic (2 Levels)",
                        data: classicResults.monthlyPartnersChart,
                        borderColor: colorClassic,
                        borderWidth: 2,
                        backgroundColor: currentBizType === 'offline' ? "rgba(100,100,100,0.1)" : "rgba(236, 72, 153, 0.1)",
                        fill: true,
                        tension: 0.2,
                        pointRadius: 0
                    },
                    {
                        label: "SetHubble (Exponential)",
                        data: sethubbleResults.monthlyPartnersChart,
                        borderColor: colorSetHubble,
                        borderWidth: 3,
                        backgroundColor: "rgba(0, 247, 255, 0.15)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { labels: { color: "#9ca3af" } },
                    tooltip: { mode: 'index' }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: "#6b7280" } },
                    y: { grid: { color: "#374151" }, ticks: { color: "#6b7280" } },
                },
            },
        });
    };

    simulatorNode.querySelectorAll("input").forEach((input) => {
        const evt = input.type === "range" ? "input" : "change";
        input.addEventListener(evt, (e) => {
            const { id, value } = e.target;
            const val = parseFloat(value) || 0;
            if (id === 'price') config.general.price = val;
            if (id === 'initialPartners') config.general.partners = val;
            if (id === 'partnerDuplication') config.general.sales = val;
            if (id === 'classicLevels') config.classic.levels = val;
            if (id === 'sethubbleLevels') { config.sethubble.levels = val; validateSetHubbleCommissions(); }
            if (id === 'sethubbleL1') { config.sethubble.commissions.l1 = val; validateSetHubbleCommissions(); }
            if (id === 'sethubbleL2plus') { config.sethubble.commissions.l2plus = val; validateSetHubbleCommissions(); }
            updateSimulatorUI();
            window.renderSimulator();
        });
    });

    if (els.businessSwitcher) {
        els.businessSwitcher.addEventListener("click", (e) => {
            const btn = e.target.closest(".mode-btn");
            if (btn) window.setBusinessType(btn.dataset.type);
        });
    }

    els.modeSwitcher.addEventListener("click", (e) => {
        const btn = e.target.closest(".mode-btn");
        if (btn) window.setSimulatorMode(btn.dataset.mode);
    });

    window.setBusinessType('online');
}
