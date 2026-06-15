
/**
 * ==========================================================================
 * NEXUS PRO ULTRA: INTELLIGENT COMPUTATIONAL ENGINE
 * Unified Feature Modules: Math, Voice, Tape, Currency, Matrix, Unit, Canvas
 * ==========================================================================
 */

class EngineController {
    constructor() {
        // Core Visual View Connectors
        this.exprView = document.getElementById('live-expression');
        this.outputView = document.getElementById('primary-output');
        this.acBtn = document.getElementById('clear-core');
        this.memIndicator = document.getElementById('mem-indicator');
        this.angleToggle = document.getElementById('angle-toggle');
        this.historyStream = document.getElementById('history-stream-box');
        this.voiceStatus = document.getElementById('voice-status');
        this.voiceBtn = document.getElementById('voice-trigger');
        this.calcContainer = document.querySelector('.calculator-wrapper');
        
        // Internal State Engine Pipelines
        this.expressionState = '';
        this.isCalculated = false;
        this.memoryRegister = 0;
        this.angleMode = 'DEG';
        
        // Multi-Unit Database Registry Configuration
        this.unitConfig = {
            temp: { units: ['Celsius', 'Fahrenheit', 'Kelvin'], defaultFrom: 'Celsius', defaultTo: 'Fahrenheit' },
            data: { units: ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes'], defaultFrom: 'Megabytes', defaultTo: 'Gigabytes' },
            speed: { units: ['KM/H', 'MPH', 'M/S'], defaultFrom: 'KM/H', defaultTo: 'MPH' }
        };

        this.bootEcosystem();
    }

    bootEcosystem() {
        this.initTabNavigation();
        this.initVoiceEngine();
        this.initMatrixEngine();
        this.initUnitConverterEngine();
        this.initGraphingEngine();
    }

    /**
     * CORE RUNTIME TAB ROUTER
     */
    initTabNavigation() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.add('active');
                
                if (tab.dataset.target === 'graph-panel') this.renderGraphCurve();
            });
        });
    }

    processInput(character) {
        if (this.isCalculated && !isNaN(character)) {
            this.expressionState = character;
            this.isCalculated = false;
        } else {
            this.isCalculated = false;
            if (character === 'pi') { this.expressionState += Math.PI.toString(); this.renderDisplay(); return; }
            if (character === 'e') { this.expressionState += Math.E.toString(); this.renderDisplay(); return; }
            
            const lastChar = this.expressionState.slice(-1);
            if (['+', '-', '*', '/', '%', '.'].includes(character) && ['+', '-', '*', '/', '%', '.'].includes(lastChar)) {
                this.expressionState = this.expressionState.slice(0, -1) + character;
                this.renderDisplay();
                return;
            }
            this.expressionState += character;
        }
        this.renderDisplay();
    }

    wipeState() { 
        this.expressionState = ''; 
        this.exprView.textContent = ''; 
        this.renderDisplay(); 
    }

    popLastElement() { 
        if (this.isCalculated) { 
            this.wipeState(); 
            return; 
        }
        this.expressionState = this.expressionState.toString().slice(0, -1);
        this.renderDisplay(); 
    }

    executeComplexModifier(action) {
        if (!this.expressionState) return;
        try {
            let val = eval(this.expressionState);
            let resultValue = 0;
            switch(action) {
                case 'sqrt': resultValue = Math.sqrt(val); break;
                case 'square': resultValue = Math.pow(val, 2); break;
                case 'sin': resultValue = Math.sin(this.angleMode === 'DEG' ? (val * Math.PI / 180) : val); break;
                case 'cos': resultValue = Math.cos(this.angleMode === 'DEG' ? (val * Math.PI / 180) : val); break;
                case 'tan': resultValue = Math.tan(this.angleMode === 'DEG' ? (val * Math.PI / 180) : val); break;
                case 'log': resultValue = Math.log10(val); break;
                case 'ln': resultValue = Math.log(val); break;
                case 'exp': resultValue = Math.exp(val); break;
            }
            this.pushToHistoryTape(`${action}(${this.expressionState})`, resultValue.toFixed(6));
            this.expressionState = resultValue.toString();
            this.isCalculated = true;
            this.renderDisplay();
        } catch (e) { this.triggerFailure("Syntax Error"); }
    }

    executePrimaryEvaluation() {
        if (!this.expressionState) return;
        try {
            let result = eval(this.expressionState);
            result = Math.round(result * 100000000) / 100000000;
            this.pushToHistoryTape(this.expressionState, result);
            this.exprView.textContent = this.formatVisualStrings(this.expressionState) + ' =';
            this.expressionState = result.toString();
            this.outputView.textContent = this.expressionState;
            this.isCalculated = true;
        } catch (err) { this.triggerFailure("Syntax Error"); }
    }

    pushToHistoryTape(expr, res) {
        const tapeItem = document.createElement('div');
        tapeItem.className = 'tape-item';
        tapeItem.innerHTML = `<div class="tape-expr">${this.formatVisualStrings(expr)}</div><div class="tape-res">${res}</div>`;
        tapeItem.addEventListener('click', () => this.processInput(res.toString()));
        if (this.historyStream.querySelector('.empty-state')) this.historyStream.innerHTML = '';
        this.historyStream.insertBefore(tapeItem, this.historyStream.firstChild);
    }

    clearHistoryTape() {
        this.historyStream.innerHTML = '<div class="empty-state">No past entries found.</div>';
    }

    /**
     * MOBILE-OPTIMIZED VOICE PIPELINE SYSTEM MODULE
     */
    initVoiceEngine() {
        const SpeechRecognition = window.SpeechRecognition || 
                                  window.webkitSpeechRecognition || 
                                  window.mozSpeechRecognition || 
                                  window.msSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("Speech API missing inside this mobile container platform.");
            return;
        }

        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false; 
        this.recognition.interimResults = false; 
        this.recognition.lang = 'en-US'; 
        
        this.recognition.onstart = () => { 
            this.voiceStatus.style.display = 'block'; 
            this.voiceStatus.textContent = "Listening closely...";
            this.voiceBtn.classList.add('active-pulse'); 
        };
        
        this.recognition.onend = () => { 
            this.voiceStatus.style.display = 'none'; 
            this.voiceBtn.classList.remove('active-pulse'); 
        };
        
        this.recognition.onerror = (event) => {
            console.error("Mobile voice stream error: ", event.error);
            if (event.error === 'not-allowed') {
                this.triggerFailure("Mic Perm Denied");
                alert("Please enable microphone permissions in your mobile browser settings to use voice commands!");
            } else {
                this.triggerFailure("Voice Timeout");
            }
        };

        this.recognition.onresult = (e) => {
            if (!e.results || !e.results[0]) return;
            
            let spokenText = e.results[0][0].transcript.toLowerCase();
            
            // Clean mobile pronunciation anomalies into arithmetic tokens
            spokenText = spokenText.replace(/multiply|times|into/g, '*')
                                   .replace(/divided by|divide|by/g, '/')
                                   .replace(/plus|and/g, '+')
                                   .replace(/minus/g, '-')
                                   .replace(/space| /g, '')
                                   .replace(/[^0-9\+\-\*\/\.]/g, ''); 
            
            if (spokenText) { 
                this.expressionState = spokenText; 
                this.executePrimaryEvaluation(); 
            } else {
                this.triggerFailure("Failed Parse");
            }
        };
    }

    /**
     * SYSTEM MODULE FEATURE 2: LINEAR MATRIX CALCULATOR
     */
    initMatrixEngine() {
        const getMatrixValues = () => [
            [parseFloat(document.getElementById('m11').value || 0), parseFloat(document.getElementById('m12').value || 0)],
            [parseFloat(document.getElementById('m21').value || 0), parseFloat(document.getElementById('m22').value || 0)]
        ];
        
        document.getElementById('matrix-det').addEventListener('click', () => {
            const m = getMatrixValues();
            const det = (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
            this.pushToHistoryTape(`Det([[${m[0]}],[${m[1]}]])`, det);
            this.outputView.textContent = det;
        });

        document.getElementById('matrix-trans').addEventListener('click', () => {
            const m = getMatrixValues();
            this.outputView.textContent = `[[${m[0][0]}, ${m[1][0]}], [${m[0][1]}, ${m[1][1]}]]`;
        });

        document.getElementById('matrix-inv').addEventListener('click', () => {
            const m = getMatrixValues();
            const det = (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
            if (det === 0) return this.triggerFailure("No Inverse (Det=0)");
            this.outputView.textContent = `[[${(m[1][1]/det).toFixed(2)}, ${(-m[0][1]/det).toFixed(2)}], [${(-m[1][0]/det).toFixed(2)}, ${(m[0][0]/det).toFixed(2)}]]`;
        });
    }

    /**
     * SYSTEM MODULE FEATURE 3: DIMENSIONAL UNIT PIPELINE
     */
    initUnitConverterEngine() {
        const typeSelect = document.getElementById('unit-type-select');
        const fromSelect = document.getElementById('unit-from-select');
        const toSelect = document.getElementById('unit-to-select');
        const inputVal = document.getElementById('unit-input-val');
        const outputVal = document.getElementById('unit-output-val');

        const populateUnits = () => {
            const mode = typeSelect.value;
            fromSelect.innerHTML = ''; toSelect.innerHTML = '';
            this.unitConfig[mode].units.forEach(unit => {
                fromSelect.add(new Option(unit, unit));
                toSelect.add(new Option(unit, unit));
            });
            fromSelect.value = this.unitConfig[mode].defaultFrom;
            toSelect.value = this.unitConfig[mode].defaultTo;
            runConversion();
        };

        const runConversion = () => {
            const mode = typeSelect.value; const from = fromSelect.value; const to = toSelect.value; const val = parseFloat(inputVal.value || 0);
            let base = val; let result = 0;

            if (mode === 'temp') {
                if (from === 'Celsius') base = val; else if (from === 'Fahrenheit') base = (val - 32) * 5/9; else base = val - 273.15;
                if (to === 'Celsius') result = base; else if (to === 'Fahrenheit') result = (base * 9/5) + 32; else result = base + 273.15;
            } else if (mode === 'data') {
                const multi = { 'Bytes': 1, 'Kilobytes': 1024, 'Megabytes': 1024*1024, 'Gigabytes': 1024*1024*1024 };
                result = (val * multi[from]) / multi[to];
            } else if (mode === 'speed') {
                const ratio = { 'KM/H': 1, 'MPH': 1.60934, 'M/S': 3.6 };
                result = (val * ratio[from]) / ratio[to];
            }
            outputVal.textContent = result.toFixed(4).replace(/\.?0+$/, "");
        };

        typeSelect.addEventListener('change', populateUnits);
        [fromSelect, toSelect, inputVal].forEach(el => el.addEventListener('input', runConversion));
        populateUnits();
    }

    /**
     * SYSTEM MODULE FEATURE 4: CANVAS MATH CURVE GRAPH PLOTTER
     */
    initGraphingEngine() {
        document.getElementById('plot-trigger').addEventListener('click', () => this.renderGraphCurve());
    }

    renderGraphCurve() {
        const canvas = document.getElementById('graphCanvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const funcStr = document.getElementById('graph-function').value;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
        
        ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
        
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5; ctx.beginPath();
        let firstFrame = true;
        
        for (let pixelX = 0; pixelX < canvas.width; pixelX++) {
            let mathX = (pixelX - canvas.width/2) / 15;
            let mathY;
            try {
                let scopedExpression = funcStr.replace(/x/g, `(${mathX})`).replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan');
                mathY = eval(scopedExpression);
            } catch(e) { return; }
            
            let pixelY = canvas.height/2 - (mathY * 15);
            if (firstFrame) { ctx.moveTo(pixelX, pixelY); firstFrame = false; } else { ctx.lineTo(pixelX, pixelY); }
        }
        ctx.stroke();
    }

    async processCurrencyConversion() {
        const from = document.getElementById('currency-from').value; const to = document.getElementById('currency-to').value; const amount = eval(this.outputView.textContent) || 0;
        this.outputView.textContent = "Fetching...";
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${from}`); const data = await res.json();
            if (data.result === "success") {
                const calculatedExchange = (amount * data.rates[to]).toFixed(2);
                this.pushToHistoryTape(`${amount} ${from} to ${to}`, calculatedExchange);
                this.expressionState = calculatedExchange; this.renderDisplay(); this.isCalculated = true;
            }
        } catch { this.triggerFailure("API Error"); }
    }

    executeMemoryAction(action) {
        let currentVal = eval(this.outputView.textContent) || 0;
        switch(action) {
            case 'mc': this.memoryRegister = 0; break;
            case 'mr': this.expressionState = this.memoryRegister.toString(); this.isCalculated = true; break;
            case 'm+': this.memoryRegister += currentVal; break;
            case 'm-': this.memoryRegister -= currentVal; break;
            case 'ms': this.memoryRegister = currentVal; break;
        }
        this.memIndicator.style.display = this.memoryRegister !== 0 ? 'block' : 'none'; this.renderDisplay();
    }

    toggleAngleMode() { this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG'; this.angleToggle.textContent = this.angleMode; }
    formatVisualStrings(rawText) { return rawText.toString().replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/-/g, ' - '); }
    renderDisplay() { this.outputView.textContent = this.formatVisualStrings(this.expressionState) || '0'; this.acBtn.textContent = this.expressionState ? 'C' : 'AC'; }
    triggerFailure(err) { this.outputView.textContent = err; this.expressionState = ''; this.exprView.textContent = ''; this.isCalculated = true; }
}

const AppCalc = new EngineController();

// RUNTIME GLOBAL INTERCEPT ROUTERS
document.querySelector('.calc-keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    if (btn.dataset.input) AppCalc.processInput(btn.dataset.input);
    if (btn.dataset.action === 'clear') AppCalc.wipeState();
    if (btn.dataset.action === 'backspace') AppCalc.popLastElement();
    if (['sqrt', 'square', 'sin', 'cos', 'tan', 'log', 'ln', 'exp'].includes(btn.dataset.action)) AppCalc.executeComplexModifier(btn.dataset.action);
    if (btn.id === 'evaluate-trigger') AppCalc.executePrimaryEvaluation();
});

document.querySelector('.memory-strip').addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (btn) AppCalc.executeMemoryAction(btn.dataset.action);
});

// COLLAPSIBLE SCIENTIFIC DRAWER TOGGLE LISTENER
document.getElementById('scientific-toggle').addEventListener('click', function() {
    const drawer = document.getElementById('scientific-panel-wrapper');
    const textLabel = this.querySelector('.toggle-text');
    const iconIndicator = this.querySelector('i');
    
    drawer.classList.toggle('hidden-drawer');
    
    if (drawer.classList.contains('hidden-drawer')) {
        textLabel.textContent = "Show Scientific Functions";
        iconIndicator.className = "fas fa-chevron-down";
    } else {
        textLabel.textContent = "Hide Scientific Functions";
        iconIndicator.className = "fas fa-chevron-up";
    }
});

document.getElementById('angle-toggle').addEventListener('click', () => AppCalc.toggleAngleMode());
document.getElementById('clear-tape-btn').addEventListener('click', () => AppCalc.clearHistoryTape());

// Microphone Permission Voice Dispatcher
document.getElementById('voice-trigger').addEventListener('click', async function(e) {
    e.preventDefault();
    if (!AppCalc.recognition) {
        alert("Web Speech logic is unpermitted or unavailable inside this container. Try switching to Google Chrome Mobile!");
        return;
    }
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const permissionCheck = await navigator.mediaDevices.getUserMedia({ audio: true });
            permissionCheck.getTracks().forEach(track => track.stop());
        }
        AppCalc.recognition.start();
    } catch (err) {
        try {
            AppCalc.recognition.start();
        } catch(retryErr) {
            AppCalc.triggerFailure("Mic Blocked");
        }
    }
});

document.getElementById('convert-trigger').addEventListener('click', () => AppCalc.processCurrencyConversion());
document.getElementById('history-toggle').addEventListener('click', () => document.getElementById('history-sidebar').classList.toggle('hidden'));
document.getElementById('hotkey-toggle').addEventListener('click', () => document.querySelector('.calculator-wrapper').classList.toggle('show-hotkeys'));

// Keyboard Mapping Array Registry
document.addEventListener('keydown', (e) => {
    let q = '';
    if ((e.key >= '0' && e.key <= '9') || ['+', '-', '%', '.', '(', ')'].includes(e.key)) { AppCalc.processInput(e.key); q = `[data-input="${e.key}"]`; }
    else if (e.key === '*') { AppCalc.processInput('*'); q = `[data-input="*"]`; }
    else if (e.key === '/') { e.preventDefault(); AppCalc.processInput('/'); q = `[data-input="/"]`; }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); AppCalc.executePrimaryEvaluation(); q = '#evaluate-trigger'; }
    else if (e.key === 'Backspace') { AppCalc.popLastElement(); q = '[data-action="backspace"]'; }
    else if (e.key === 'Escape') { AppCalc.wipeState(); q = '#clear-core'; }
    
    if (q) { const t = document.querySelector(q); if (t) { t.classList.add('keyboard-active'); setTimeout(() => t.classList.remove('keyboard-active'), 120); } }
});

document.getElementById('theme-switcher').addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.getElementById('theme-switcher').innerHTML = activeTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});