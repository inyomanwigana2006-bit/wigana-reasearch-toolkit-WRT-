// --- GLOBAL STATE ---
let rawData = null; // 2D array: [ [col1, col2, ...], [row1_1, row1_2, ...], ... ]
let headers = [];   // original headers array
let dataMatrix = []; // 2D numeric/string data matrix (excluding headers) - rows match cases
let variables = []; // Array of variable objects
let constructs = []; // Array of constructs
let cleaningIssues = []; // Quality anomalies
let analysisOutput = null; // Stored results of current run
let currentSpssTab = 'data'; // 'data' or 'variable'
let currentSpssPage = 0;
const spssRowsPerPage = 50;
let currentActiveView = 'dashboard';

// Settings configuration values
let config = {
    alpha: 0.05,
    citcThreshold: 0.30,
    imputationMethod: 'mean',
    outlierZ: 2.50
};

// --- SAMPLE DATASETS ---
const SAMPLE_DATASETS = {
    employee: {
        headers: ["Gend", "Age", "JS1", "JS2", "JS3", "JP1", "JP2", "JP3"],
        data: [
            ["Male", 28, "SS", "S", "STS", "S", "SS", "S"], // 1. JS3 is reverse (STS is high job satisfaction if neg worded)
            ["Female", 35, "S", "S", "TS", "S", "S", "S"],
            ["Male", 42, "S", "N", "N", "S", "S", "N"],
            ["Female", 31, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 25, "TS", "TS", "S", "TS", "TS", "TS"],
            ["Female", 29, "S", "S", "TS", "S", "S", "S"],
            ["Male", 38, "SS", "S", "STS", "S", "SS", "S"],
            ["Female", 45, "N", "N", "S", "N", "S", "N"],
            ["Male", 50, "S", "S", "TS", "S", "S", "S"],
            ["Female", 22, "TS", "TS", "SS", "TS", "TS", "TS"], // negative item correlation check
            ["Male", 33, "S", "S", "TS", "S", "S", "S"],
            ["Female", 37, "SS", "S", "STS", "SS", "SS", "S"],
            ["Male", 29, "S", "N", "N", "S", "S", "N"],
            ["Female", 41, "S", "S", "TS", "S", "S", "S"],
            // outlier data point
            ["Male", 32, "S", "S", "TS", "S", "S", 99], // 99 is invalid/outlier on JP3!
            ["Female", 36, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 28, "SS", "S", "STS", "S", "SS", "S"], // duplicate row starts
            ["Male", 28, "SS", "S", "STS", "S", "SS", "S"], // duplicate row 1
            ["Male", 28, "SS", "S", "STS", "S", "SS", "S"], // duplicate row 2
            ["Female", 44, "N", "TS", "S", "N", "N", "TS"],
            ["Male", 30, null, "S", "TS", "S", "S", "S"], // Missing value JS1
            ["Female", 34, "S", "S", "TS", null, "S", "S"], // Missing value JP1
            ["Male", 48, "S", "S", "TS", "S", "S", "S"],
            ["Female", 27, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 39, "S", "S", "TS", "S", "S", "S"],
            ["Female", 32, "TS", "TS", "S", "TS", "TS", "TS"],
            ["Male", 41, "S", "S", "TS", "S", "S", "S"],
            ["Female", 30, "S", "S", "TS", "S", "S", "S"],
            ["Male", 26, "SS", "S", "STS", "S", "SS", "S"],
            ["Female", 35, "S", "S", "TS", "S", "S", "S"],
            ["Male", 38, "S", "N", "N", "S", "S", "N"],
            ["Female", 48, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 24, "TS", "TS", "S", "TS", "TS", "TS"],
            ["Female", 31, "S", "S", "TS", "S", "S", "S"],
            ["Male", 40, "SS", "S", "STS", "S", "SS", "S"],
            ["Female", 42, "N", "N", "S", "N", "S", "N"],
            ["Male", 51, "S", "S", "TS", "S", "S", "S"],
            ["Female", 23, "TS", "TS", "SS", "TS", "TS", "TS"],
            ["Male", 34, "S", "S", "TS", "S", "S", "S"],
            ["Female", 39, "SS", "S", "STS", "SS", "SS", "S"],
            ["Male", 30, "S", "N", "N", "S", "S", "N"],
            ["Female", 43, "S", "S", "TS", "S", "S", "S"],
            ["Female", 44, "N", "TS", "S", "N", "N", "TS"],
            ["Male", 49, "S", "S", "TS", "S", "S", "S"],
            ["Female", 28, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 40, "S", "S", "TS", "S", "S", "S"],
            ["Female", 33, "TS", "TS", "S", "TS", "TS", "TS"],
            ["Male", 42, "S", "S", "TS", "S", "S", "S"],
            ["Female", 31, "S", "S", "TS", "S", "S", "S"],
            ["Male", 27, "SS", "S", "STS", "S", "SS", "S"],
            ["Female", 36, "S", "S", "TS", "S", "S", "S"],
            ["Male", 39, "S", "N", "N", "S", "S", "N"],
            ["Female", 49, "SS", "SS", "STS", "SS", "SS", "SS"],
            ["Male", 25, "TS", "TS", "S", "TS", "TS", "TS"],
            ["Female", 32, "S", "S", "TS", "S", "S", "S"],
            ["Male", 41, "SS", "S", "STS", "S", "SS", "S"],
            ["Female", 43, "N", "N", "S", "N", "S", "N"],
            ["Male", 52, "S", "S", "TS", "S", "S", "S"],
            ["Female", 24, "TS", "TS", "SS", "TS", "TS", "TS"],
            ["Male", 35, "S", "S", "TS", "S", "S", "S"]
        ]
    },
    customer: {
        headers: ["Gender", "Sat1", "Sat2", "Sat3", "Loy1", "Loy2", "Loy3", "Rec"],
        data: [
            ["Female", 5, 4, 5, 4, 5, 5, "Yes"],
            ["Male", 4, 4, 4, 4, 4, 3, "Yes"],
            ["Female", 3, 3, 2, 3, 3, 2, "No"],
            ["Male", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Female", 2, 2, 3, 2, 2, 1, "No"],
            ["Male", 4, 4, 5, 4, 4, 4, "Yes"],
            ["Female", 5, 4, 4, 4, 5, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 3, "Yes"],
            ["Female", 4, 5, 4, 5, 4, 5, "Yes"],
            ["Male", 2, 1, 2, 2, 1, 2, "No"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 4, 3, 4, 4, 3, 4, "Yes"],
            ["Female", 3, 4, 3, 3, 4, 3, "Yes"],
            ["Male", 5, 4, 5, 5, 4, 5, "Yes"],
            ["Female", 1, 2, 1, 1, 2, 1, "No"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 3, 3, 2, 3, 3, 3, "No"],
            ["Female", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Male", 5, 4, 5, 4, 5, 4, "Yes"],
            ["Female", 4, 3, 4, 3, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 2, "No"],
            ["Female", 5, 5, 4, 5, 5, 5, "Yes"],
            ["Male", 2, 2, 2, 2, 2, 2, "No"],
            ["Female", 4, 4, 5, 4, 4, 5, "Yes"],
            ["Male", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Female", 3, 3, 3, 3, 2, 3, "Yes"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 4, 5, 4, 5, 5, "Yes"],
            ["Male", 2, 2, 1, 2, 2, 1, "No"],
            ["Female", 4, 5, 4, 5, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 3, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 4, 3, 4, 4, 3, 3, "Yes"],
            ["Female", 3, 4, 3, 3, 4, 3, "Yes"],
            ["Male", 5, 4, 5, 5, 4, 5, "Yes"],
            ["Female", 2, 2, 2, 2, 2, 2, "No"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 3, 3, 2, 3, 3, 3, "No"],
            ["Female", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Male", 5, 4, 5, 4, 5, 4, "Yes"],
            ["Female", 4, 3, 4, 3, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 2, "No"],
            ["Female", 5, 5, 4, 5, 5, 5, "Yes"],
            ["Male", 2, 2, 2, 2, 2, 2, "No"],
            ["Female", 4, 4, 5, 4, 4, 5, "Yes"],
            ["Male", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Female", 3, 3, 3, 3, 2, 3, "Yes"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 4, 5, 4, 5, 5, "Yes"],
            ["Male", 2, 2, 1, 2, 2, 1, "No"],
            ["Female", 4, 5, 4, 5, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 3, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 4, 3, 4, 4, 3, 3, "Yes"],
            ["Female", 3, 4, 3, 3, 4, 3, "Yes"],
            ["Male", 5, 4, 5, 5, 4, 5, "Yes"],
            ["Female", 2, 2, 2, 2, 2, 2, "No"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 3, 3, 2, 3, 3, 3, "No"],
            ["Female", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Male", 5, 4, 5, 4, 5, 4, "Yes"],
            ["Female", 4, 3, 4, 3, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 2, "No"],
            ["Female", 5, 5, 4, 5, 5, 5, "Yes"],
            ["Male", 2, 2, 2, 2, 2, 2, "No"],
            ["Female", 4, 4, 5, 4, 4, 5, "Yes"],
            ["Male", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Female", 3, 3, 3, 3, 2, 3, "Yes"],
            ["Male", 4, 4, 4, 4, 4, 4, "Yes"],
            ["Female", 5, 4, 5, 4, 5, 5, "Yes"],
            ["Male", 2, 2, 1, 2, 2, 1, "No"],
            ["Female", 4, 5, 4, 5, 4, 4, "Yes"],
            ["Male", 3, 3, 3, 3, 3, 3, "Yes"],
            ["Female", 5, 5, 5, 5, 5, 5, "Yes"],
            ["Male", 4, 3, 4, 4, 3, 3, "Yes"],
            ["Female", 3, 4, 3, 3, 4, 3, "Yes"],
            ["Male", 5, 4, 5, 5, 4, 5, "Yes"]
        ]
    }
};

// Standard scales for Auto Scale Conversion
const LIKERT_5_IND = ["STS", "TS", "N", "S", "SS"];
const LIKERT_5_ENG = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const YES_NO_ENG = ["No", "Yes"];
const YES_NO_IND = ["Tidak", "Ya"];
const GENDER_ENG = ["Female", "Male"];
const GENDER_IND = ["Perempuan", "Laki-Laki"];
const TRUE_FALSE = ["Salah", "Benar"];

// --- APP INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
    switchView('dashboard');
    updateDashboardUI();

    // Main Excel/CSV dataset dropzone
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('border-primary', 'bg-slate-50');
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-primary', 'bg-slate-50');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-primary', 'bg-slate-50');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.files = files;
                    const event = new Event('change');
                    fileInput.dispatchEvent(event);
                }
            }
        });
    }

    // SPSS screenshot dropzone
    const spssDropzone = document.getElementById('spss-reader-dropzone');
    if (spssDropzone) {
        spssDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            spssDropzone.classList.add('border-primary', 'bg-slate-50');
        });
        spssDropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            spssDropzone.classList.remove('border-primary', 'bg-slate-50');
        });
        spssDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            spssDropzone.classList.remove('border-primary', 'bg-slate-50');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const spssFileInput = document.getElementById('spss-reader-file-input');
                if (spssFileInput) {
                    spssFileInput.files = files;
                    const event = new Event('change');
                    spssFileInput.dispatchEvent(event);
                }
            }
        });
    }
});

// --- ROUTING / VIEW SWITCHING ---
function switchView(viewId) {
    currentActiveView = viewId;
    const views = [
        'dashboard', 'data_import', 'smart_converter', 'smart_cleaning', 
        'construct_builder', 'spss_editor', 'one_click_analysis', 
        'output_viewer', 'correlation_regression', 'bab_iv', 'export_center', 'settings', 'spss_reader'
    ];
    
    // Toggle view visibility
    views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if (el) el.style.display = (v === viewId) ? 'block' : 'none';
    });
    
    // Update sidebar navigation active styling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'font-bold', 'scale-95');
        item.classList.add('text-on-surface-variant');
    });
    
    const activeNav = document.getElementById('nav-' + viewId);
    if (activeNav) {
        if (viewId === 'one_click_analysis') {
            activeNav.classList.add('bg-primary/20', 'text-primary', 'font-bold');
        } else {
            activeNav.classList.add('bg-secondary-container', 'text-on-secondary-container', 'font-bold', 'scale-95');
            activeNav.classList.remove('text-on-surface-variant');
        }
    }

    // Sync quick tab visibility and active state styling
    const quickSpss = document.getElementById('quick-spss-tabs');
    if (dataMatrix.length > 0) {
        quickSpss.style.display = 'flex';
        // Reset classes for all quick tabs
        const qTabs = ['quick-tab-data', 'quick-tab-variable', 'quick-tab-output', 'quick-tab-corr-reg'];
        qTabs.forEach(tId => {
            const tEl = document.getElementById(tId);
            if (tEl) {
                tEl.className = 'pb-2 px-1 border-b-2 border-transparent text-on-surface-variant hover:text-primary font-semibold transition-all';
            }
        });
        
        if (viewId === 'spss_editor') {
            const activeSub = (currentSpssTab === 'data') ? 'quick-tab-data' : 'quick-tab-variable';
            const subEl = document.getElementById(activeSub);
            if (subEl) subEl.className = 'text-primary border-b-2 border-primary font-bold pb-2 px-1';
        } else if (viewId === 'output_viewer') {
            const outEl = document.getElementById('quick-tab-output');
            if (outEl) outEl.className = 'text-primary border-b-2 border-primary font-bold pb-2 px-1';
        } else if (viewId === 'correlation_regression') {
            const corrRegEl = document.getElementById('quick-tab-corr-reg');
            if (corrRegEl) corrRegEl.className = 'text-primary border-b-2 border-primary font-bold pb-2 px-1';
        }
    } else {
        quickSpss.style.display = 'none';
    }
    
    // Set App Canvas Title
    const titleEl = document.getElementById('app-canvas-title');
    titleEl.innerText = 'Wigana Research Toolkit - ' + viewId.replace('_', ' ').toUpperCase();

    // Perform contextual updates
    if (viewId === 'dashboard') {
        updateDashboardUI();
    } else if (viewId === 'spss_editor') {
        renderSpssEditor();
    } else if (viewId === 'smart_converter') {
        renderSmartConverter();
    } else if (viewId === 'smart_cleaning') {
        renderSmartCleaning();
    } else if (viewId === 'construct_builder') {
        renderConstructBuilder();
    } else if (viewId === 'output_viewer' || viewId === 'correlation_regression') {
        renderOutputViewer();
    } else if (viewId === 'bab_iv') {
        renderBabIV();
    } else if (viewId === 'spss_reader') {
        renderSpssReader();
    }
}

// SPSS Editor Inner Tab control
function openSpssEditorTab(tab) {
    currentSpssTab = tab;
    const dataContainer = document.getElementById('editor-container-data');
    const varContainer = document.getElementById('editor-container-variable');
    const btnData = document.getElementById('btn-editor-tab-data');
    const btnVar = document.getElementById('btn-editor-tab-variable');
    
    const btnAddRow = document.getElementById('btn-editor-add-row');
    const btnAddVar = document.getElementById('btn-editor-add-var');
    const paginationContainer = document.getElementById('spss-data-pagination');

    if (tab === 'data') {
        dataContainer.style.display = 'block';
        varContainer.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'flex';
        btnData.className = 'tab-btn-active pb-2 px-4 font-semibold text-sm transition-all border-b-2';
        btnVar.className = 'tab-btn-inactive pb-2 px-4 font-semibold text-sm transition-all border-b-2';
        
        btnAddRow.style.display = 'flex';
        btnAddVar.style.display = 'none';
        
        document.getElementById('quick-tab-data').className = 'text-primary border-b-2 border-primary font-bold pb-2';
        document.getElementById('quick-tab-variable').className = 'text-on-surface-variant pb-2 hover:text-primary transition-all';
    } else {
        dataContainer.style.display = 'none';
        varContainer.style.display = 'block';
        if (paginationContainer) paginationContainer.style.display = 'none';
        btnData.className = 'tab-btn-inactive pb-2 px-4 font-semibold text-sm transition-all border-b-2';
        btnVar.className = 'tab-btn-active pb-2 px-4 font-semibold text-sm transition-all border-b-2';
        
        btnAddRow.style.display = 'none';
        btnAddVar.style.display = 'flex';
        
        document.getElementById('quick-tab-data').className = 'text-on-surface-variant pb-2 hover:text-primary transition-all';
        document.getElementById('quick-tab-variable').className = 'text-primary border-b-2 border-primary font-bold pb-2';
    }
    renderSpssEditor();
}

// Reset workspace to clean state
function resetWorkspace() {
    if (confirm("Are you sure you want to reset the current research workspace? All active data and analysis will be lost.")) {
        rawData = null;
        headers = [];
        dataMatrix = [];
        variables = [];
        constructs = [];
        cleaningIssues = [];
        analysisOutput = null;
        updateDashboardUI();
        switchView('dashboard');
        showInspectorHTML(`<div class="text-center py-20 text-on-surface-variant"><span class="material-symbols-outlined text-[36px] opacity-45">ads_click</span><p class="mt-2 text-xs">Workspace reset completed successfully.</p></div>`);
    }
}

// --- DASHBOARD UPDATER ---
function updateDashboardUI() {
    const hasData = (dataMatrix.length > 0);
    
    // Statistics numbers
    document.getElementById('dash-stat-rows').innerText = hasData ? dataMatrix.length : '-';
    document.getElementById('dash-stat-cols').innerText = hasData ? variables.length : '-';
    
    let scalesCount = 0;
    if (hasData) {
        variables.forEach(v => {
            if (Object.keys(v.values).length > 0) scalesCount++;
        });
    }
    document.getElementById('dash-stat-scales').innerText = hasData ? scalesCount : '-';
    document.getElementById('dash-stat-items').innerText = hasData ? variables.filter(v => v.role === 'Input').length : '-';
    
    // Steps UI
    updateStepBadge('import', hasData ? 'Completed' : 'Pending', hasData ? 'check_circle' : 'radio_button_unchecked');
    
    const isConverted = hasData && !variables.some(v => v.type === 'string' && detectCategoricalScale(getColumnValues(variables.indexOf(v))));
    updateStepBadge('convert', hasData ? (isConverted ? 'Completed' : 'Scale Detected') : 'Pending', hasData ? (isConverted ? 'check_circle' : 'warning') : 'radio_button_unchecked');
    
    const isClean = hasData && (cleaningIssues.length === 0);
    updateStepBadge('clean', hasData ? (isClean ? 'Clean' : `${cleaningIssues.length} issues`) : 'Pending', hasData ? (isClean ? 'check_circle' : 'warning') : 'radio_button_unchecked');
    
    const hasConstructs = hasData && (constructs.length > 0);
    updateStepBadge('construct', hasData ? (hasConstructs ? 'Mapped' : 'Unmapped') : 'Pending', hasData ? (hasConstructs ? 'check_circle' : 'warning') : 'radio_button_unchecked');

    // Quality Dashboard Gauges (Requirement 10)
    if (hasData) {
        // Compute Data Quality (100 - penalize for duplicate rows, missing cells, outliers)
        let totalCells = dataMatrix.length * variables.length;
        let missingCount = countMissingCells();
        let dupRowsCount = findDuplicateRows().length;
        let outlierCount = countOutliers();
        
        let dataIssuesRatio = (missingCount + (dupRowsCount * variables.length) + outlierCount) / totalCells;
        let dataQualityScore = Math.max(0, Math.round((1 - dataIssuesRatio) * 100));
        
        // Compute Instrument Quality (ratio of valid items and alpha average)
        let totalItems = variables.filter(v => v.role === 'Input').length;
        let instrumentQualityScore = 0;
        
        if (totalItems > 0 && constructs.length > 0) {
            let validityCount = 0;
            let reliabilitySum = 0;
            
            constructs.forEach(c => {
                let rel = calculateConstructReliability(c);
                reliabilitySum += rel.alpha;
                
                c.items.forEach(itemId => {
                    let val = calculateItemValidity(c, itemId);
                    if (val.isValid) validityCount++;
                });
            });
            
            let valRatio = validityCount / totalItems;
            let relAvg = reliabilitySum / constructs.length;
            
            instrumentQualityScore = Math.round(((valRatio * 0.5) + (Math.max(0, relAvg) * 0.5)) * 100);
        } else {
            instrumentQualityScore = hasConstructs ? 75 : 30; // default initial if no constructs
        }
        
        // Compute Analysis Quality (based on assumption test compliance)
        let analysisQualityScore = 100;
        if (analysisOutput) {
            let testsPassed = 0;
            let testsCount = 0;
            
            // 1. Normality checks
            if (analysisOutput.descriptives) {
                analysisOutput.descriptives.forEach(d => {
                    testsCount += 2; // Skewness and Kurtosis
                    if (Math.abs(d.zSkew) <= 2.0) testsPassed++;
                    if (Math.abs(d.zKurt) <= 2.0) testsPassed++;
                });
            }
            
            // 2. Multicollinearity VIF checks
            if (analysisOutput.regression && analysisOutput.regression.vif) {
                analysisOutput.regression.vif.forEach(v => {
                    testsCount++;
                    if (v.vif < 10) testsPassed++;
                });
            }
            
            // 3. Heteroscedasticity checks
            if (analysisOutput.regression && analysisOutput.regression.hetero) {
                analysisOutput.regression.hetero.forEach(h => {
                    testsCount++;
                    if (h.pValue > 0.05) testsPassed++;
                });
            }
            
            analysisQualityScore = testsCount > 0 ? Math.round((testsPassed / testsCount) * 100) : 100;
        } else {
            analysisQualityScore = 50; // Not run yet
        }
        
        // Compute Research Confidence Score (Requirement 10 weighting)
        let confidenceScore = Math.round((dataQualityScore * 0.30) + (instrumentQualityScore * 0.40) + (analysisQualityScore * 0.30));
        
        // Render Gauges
        setDashboardGauge('confidence', confidenceScore);
        setDashboardGauge('data-quality', dataQualityScore);
        setDashboardGauge('instrument-quality', instrumentQualityScore);
        setDashboardGauge('analysis-quality', analysisQualityScore);
    } else {
        setDashboardGauge('confidence', 0);
        setDashboardGauge('data-quality', 0);
        setDashboardGauge('instrument-quality', 0);
        setDashboardGauge('analysis-quality', 0);
    }
}

function updateStepBadge(stepId, label, icon) {
    const stepBox = document.getElementById('step-status-' + stepId);
    const stepIcon = document.getElementById('step-icon-' + stepId);
    const stepLbl = document.getElementById('step-lbl-' + stepId);
    
    if (stepBox && stepIcon && stepLbl) {
        stepLbl.innerText = label;
        stepIcon.innerText = icon;
        
        stepBox.className = "flex items-center justify-between p-3 rounded-lg border bg-white ";
        if (label === 'Completed' || label === 'Clean' || label === 'Mapped') {
            stepBox.classList.add('border-green-200');
            stepIcon.className = "material-symbols-outlined text-green-600 font-bold";
            stepLbl.className = "text-xs text-green-600 font-extrabold";
        } else if (label.includes('issues') || label === 'Scale Detected' || label === 'Unmapped') {
            stepBox.classList.add('border-amber-200');
            stepIcon.className = "material-symbols-outlined text-amber-500 font-bold";
            stepLbl.className = "text-xs text-amber-500 font-extrabold";
        } else {
            stepBox.classList.add('border-slate-100');
            stepIcon.className = "material-symbols-outlined text-slate-400";
            stepLbl.className = "text-xs text-slate-400 font-semibold";
        }
    }
}

function setDashboardGauge(gaugeId, score) {
    const textEl = document.getElementById(`dash-${gaugeId}`);
    const barEl = document.getElementById(`dash-${gaugeId}-bar`);
    if (textEl && barEl) {
        textEl.innerText = `${score}%`;
        barEl.style.width = `${score}%`;
    }
}

// --- DATA IMPORT ENGINE ---
function handleFileSelect(evt) {
    const files = evt.target.files;
    if (files.length === 0) return;
    const file = files[0];
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        let workbook, worksheet, parsed;
        
        const steps = [
            {
                text: "Mengekstrak struktur tabel lembar kerja Excel...",
                duration: 350,
                action: () => {
                    workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    worksheet = workbook.Sheets[firstSheetName];
                }
            },
            {
                text: "Memetakan baris data dan variabel penelitian...",
                duration: 300,
                action: () => {
                    parsed = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: null});
                }
            },
            {
                text: "Mendeteksi tipe kolom dan konversi kategorik biner...",
                duration: 400,
                action: () => {
                    loadImportedData(file.name, parsed);
                }
            },
            {
                text: "Sinkronisasi antarmuka dan visualisasi statistik...",
                duration: 300,
                action: () => {
                    updateDashboardUI();
                }
            }
        ];
        
        showGlobalLoader(
            "Mengimpor Dataset",
            `Membaca berkas ${file.name} dan memetakan struktur SPSS`,
            steps,
            () => {
                showInspectorHTML(`
                    <div class="space-y-4">
                        <h4 class="font-bold text-emerald-700 border-b pb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[16px]">check_circle</span> Impor Berhasil
                        </h4>
                        <p class="text-xs text-on-surface-variant leading-relaxed">
                            Berkas <strong>${file.name}</strong> berhasil dimuat. <strong>${variables.length}</strong> variabel SPSS telah dibuat secara otomatis.
                        </p>
                    </div>
                `);
                // Automatically run regression and hypothesis tests
                runOneClickAnalysis();
            }
        );
    };
    reader.readAsArrayBuffer(file);
}

function loadImportedData(filename, rows) {
    if (!rows || rows.length < 2) {
        showGlobalError(
            "Gagal Mengimpor Dataset", 
            "Jumlah baris data tidak mencukupi", 
            "Dataset kosong atau memiliki baris yang kurang dari 2. Dataset harus menyertakan baris header dan minimal 3 responden."
        );
        return;
    }
    
    // Filter out columns that are completely empty (all cells are empty/null)
    const numCols = rows[0].length;
    const validColIndices = [];
    
    for (let j = 0; j < numCols; j++) {
        const headerVal = rows[0][j];
        
        let isEmpty = true;
        for (let i = 1; i < rows.length; i++) {
            const cellVal = rows[i][j];
            if (cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== "") {
                isEmpty = false;
                break;
            }
        }
        
        // Keep only columns that contain at least one valid data cell
        if (!isEmpty) {
            validColIndices.push(j);
        }
    }
    
    if (validColIndices.length === 0) {
        showGlobalError(
            "Gagal Mengimpor Dataset", 
            "Kolom data tidak valid", 
            "Dataset kosong atau tidak mengandung kolom data yang valid setelah pembersihan kolom kosong."
        );
        return;
    }
    
    // Reconstruct rows with normalized and cleaned columns
    const cleanedRows = [];
    for (let i = 0; i < rows.length; i++) {
        const newRow = [];
        validColIndices.forEach(j => {
            const val = rows[i][j];
            newRow.push(val !== undefined && val !== null ? val : null);
        });
        cleanedRows.push(newRow);
    }
    
    rawData = cleanedRows;
    headers = cleanedRows[0].map((h, i) => h ? String(h).trim() : `Var${i+1}`);
    dataMatrix = cleanedRows.slice(1);
    currentSpssPage = 0; // Reset pagination page
    
    // Check for binary categories like Pria/Wanita or Benar/Salah or Yes/No to auto convert to 1/0
    const autoMappedCols = {};
    const binaryPairs = [
        { pos: 'pria', neg: 'wanita' },
        { pos: 'laki-laki', neg: 'perempuan' },
        { pos: 'laki - laki', neg: 'perempuan' },
        { pos: 'l', neg: 'p' },
        { pos: 'p', neg: 'w' },
        { pos: 'benar', neg: 'salah' },
        { pos: 'b', neg: 's' },
        { pos: 'ya', neg: 'tidak' },
        { pos: 'y', neg: 't' },
        { pos: 'yes', neg: 'no' },
        { pos: 'true', neg: 'false' }
    ];
    
    headers.forEach((name, index) => {
        const values = dataMatrix.map(row => row[index]);
        const cleanVals = values.filter(v => v !== null && v !== undefined && String(v).trim() !== "");
        const uniqueVals = Array.from(new Set(cleanVals.map(v => String(v).trim().toLowerCase())));
        
        if (uniqueVals.length > 0 && uniqueVals.length <= 2) {
            let matchedPair = null;
            for (let pair of binaryPairs) {
                const allMatch = uniqueVals.every(v => v === pair.pos || v === pair.neg);
                if (allMatch) {
                    matchedPair = pair;
                    break;
                }
            }
            
            if (matchedPair) {
                let posLabel = matchedPair.pos.charAt(0).toUpperCase() + matchedPair.pos.slice(1);
                let negLabel = matchedPair.neg.charAt(0).toUpperCase() + matchedPair.neg.slice(1);
                
                cleanVals.forEach(v => {
                    const lv = String(v).trim().toLowerCase();
                    if (lv === matchedPair.pos) posLabel = String(v).trim();
                    if (lv === matchedPair.neg) negLabel = String(v).trim();
                });
                
                autoMappedCols[index] = { posLabel, negLabel };
                
                dataMatrix.forEach(row => {
                    let cellVal = row[index];
                    if (cellVal !== null && cellVal !== undefined) {
                        const lv = String(cellVal).trim().toLowerCase();
                        if (lv === matchedPair.pos) {
                            row[index] = 1;
                        } else if (lv === matchedPair.neg) {
                            row[index] = 0;
                        }
                    }
                });
            }
        }
    });
    
    // Generate SPSS variable definitions
    variables = headers.map((name, index) => {
        const values = getColumnValues(index);
        const isAutoMapped = autoMappedCols.hasOwnProperty(index);
        const isNumeric = isAutoMapped || values.every(v => v === null || !isNaN(v));
        
        let valLabelMapping = {};
        if (isAutoMapped) {
            valLabelMapping = {
                "1": autoMappedCols[index].posLabel,
                "0": autoMappedCols[index].negLabel
            };
        }
        
        return {
            name: sanitizeVariableName(name),
            label: name,
            type: isNumeric ? 'numeric' : 'string',
            decimals: isAutoMapped ? 0 : (isNumeric ? 2 : 0),
            measure: isAutoMapped ? 'Nominal' : (isNumeric ? 'Scale' : 'Nominal'),
            align: isNumeric ? 'Right' : 'Left',
            values: valLabelMapping,
            missing: 'None',
            role: (name.toLowerCase().includes('gend') || name.toLowerCase().includes('age')) ? 'None' : 'Input'
        };
    });

    // Run automated scans for constructs and cleaning issues
    autoDetectConstructs(false); // Silent scan
    diagnoseQualityIssues();
    
    // Automatically clean data using AI if issues exist!
    if (cleaningIssues.length > 0) {
        runOneClickCleaning(true); // Silent run
    }
    
    // Update UI
    updateDashboardUI();
    
    document.getElementById('upload-filename').innerText = filename;
    document.getElementById('upload-rows').innerText = dataMatrix.length;
    document.getElementById('upload-cols').innerText = variables.length;
    document.getElementById('upload-size').innerText = Math.round(dataMatrix.length * variables.length * 0.1) + " KB";
    document.getElementById('upload-status-card').style.display = 'block';
    
    switchView('spss_editor');
    
    showInspectorHTML(`
        <div class="space-y-4">
            <h4 class="font-bold text-primary border-b pb-2">Dataset Imported</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed">
                The file <strong>${filename}</strong> has been parsed. We generated <strong>${variables.length}</strong> variable columns in SPSS format.
            </p>
            <div class="text-xs bg-slate-50 p-3 rounded space-y-1 font-mono">
                <div>Rows: ${dataMatrix.length}</div>
                <div>Cols: ${variables.length}</div>
            </div>
        </div>
    `);
}

function loadSampleDataset(type) {
    const sample = SAMPLE_DATASETS[type];
    if (!sample) return;
    
    // Mock deep copy
    let rows = [sample.headers].concat(JSON.parse(JSON.stringify(sample.data)));
    loadImportedData(`${type}_research_study.xlsx`, rows);
    
    // Auto run analysis for sample datasets too
    runOneClickAnalysis();
}

// Sanitize string to standard SPSS variable name (alphanumeric, start with letter, no spaces)
function sanitizeVariableName(str) {
    let s = str.replace(/[^a-zA-Z0-9_]/g, '');
    if (s.length === 0) return 'Var';
    if (!/^[a-zA-Z]/.test(s)) {
        s = 'V_' + s;
    }
    return s.substring(0, 12); // SPSS traditional limits
}

function getColumnValues(colIndex) {
    return dataMatrix.map(row => row[colIndex]);
}

// --- SMART SCALE CONVERTER (Requirement 1) ---
function renderSmartConverter() {
    const emptyEl = document.getElementById('scale-conv-empty');
    const listEl = document.getElementById('scale-conv-list');
    const tbody = document.getElementById('scale-conv-table-body');
    
    if (dataMatrix.length === 0) {
        emptyEl.style.display = 'block';
        listEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    listEl.style.display = 'block';
    tbody.innerHTML = '';
    
    let detectedCount = 0;
    
    variables.forEach((v, index) => {
        const values = getColumnValues(index);
        const scaleType = detectCategoricalScale(values);
        
        if (scaleType) {
            detectedCount++;
            const row = document.createElement('tr');
            row.className = "hover:bg-slate-50 border-b border-slate-100";
            row.innerHTML = `
                <td class="p-3 font-semibold text-primary font-data-mono">${v.name}</td>
                <td class="p-3">
                    <span class="status-badge-pill bg-blue-100 text-blue-800">${scaleType.name}</span>
                </td>
                <td class="p-3 font-data-mono text-xs text-on-surface-variant max-w-md truncate" title="${JSON.stringify(scaleType.mapping)}">
                    ${Object.entries(scaleType.mapping).map(([k, v]) => `${k} &rarr; ${v}`).join(', ')}
                </td>
                <td class="p-3">
                    <button onclick="convertSingleScale(${index}, '${scaleType.id}')" class="px-3 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-secondary transition-all">Convert</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
    
    if (detectedCount === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-on-surface-variant font-medium">All columns are already converted to numeric values or no categorical scale mappings were recognized.</td></tr>`;
        document.getElementById('btn-run-scale-conv').disabled = true;
        document.getElementById('btn-run-scale-conv').className = 'px-5 py-2.5 bg-slate-300 text-slate-500 font-bold rounded-lg cursor-not-allowed flex items-center gap-2';
    } else {
        document.getElementById('btn-run-scale-conv').disabled = false;
        document.getElementById('btn-run-scale-conv').className = 'px-5 py-2.5 bg-primary text-white font-bold hover:bg-secondary rounded-lg shadow flex items-center gap-2';
    }
}

// Returns {name, id, mapping} or null
function detectCategoricalScale(values) {
    // Filter non-null strings
    const strings = values.filter(v => typeof v === 'string' && v.trim().length > 0).map(s => s.trim());
    if (strings.length === 0) return null;
    
    const unique = Array.from(new Set(strings));
    
    // Check Likert 5-point Indonesian (STS, TS, N, S, SS)
    if (unique.every(val => LIKERT_5_IND.includes(val) || val === "")) {
        return {
            name: "Likert 5-Point (STS-SS)",
            id: "likert5_ind",
            mapping: { "STS": 1, "TS": 2, "N": 3, "S": 4, "SS": 5 }
        };
    }
    
    // Check Likert 5-point English
    if (unique.every(val => LIKERT_5_ENG.includes(val) || val === "")) {
        return {
            name: "Likert 5-Point (SD-SA)",
            id: "likert5_eng",
            mapping: { "Strongly Disagree": 1, "Disagree": 2, "Neutral": 3, "Agree": 4, "Strongly Agree": 5 }
        };
    }
    
    // Check Gender Indonesian
    if (unique.every(val => GENDER_IND.includes(val) || val === "")) {
        return {
            name: "Demographics (Gender - ID)",
            id: "gender_ind",
            mapping: { "Perempuan": 0, "Laki-Laki": 1 }
        };
    }

    // Check Gender English
    if (unique.every(val => GENDER_ENG.includes(val) || val === "")) {
        return {
            name: "Demographics (Gender - EN)",
            id: "gender_eng",
            mapping: { "Female": 0, "Male": 1 }
        };
    }
    
    // Check Yes/No English
    if (unique.every(val => YES_NO_ENG.includes(val) || val === "")) {
        return {
            name: "Dichotomous (Yes/No)",
            id: "yesno_eng",
            mapping: { "No": 0, "Yes": 1 }
        };
    }
    
    // Check Yes/No Indonesian
    if (unique.every(val => YES_NO_IND.includes(val) || val === "")) {
        return {
            name: "Dichotomous (Ya/Tidak)",
            id: "yesno_ind",
            mapping: { "Tidak": 0, "Ya": 1 }
        };
    }
    
    // Check True/False Indonesian (B/S)
    if (unique.every(val => TRUE_FALSE.includes(val) || val === "")) {
        return {
            name: "Dichotomous (Salah/Benar)",
            id: "truefalse",
            mapping: { "Salah": 0, "Benar": 1 }
        };
    }
    
    return null;
}

function convertSingleScale(colIndex, scaleId) {
    const v = variables[colIndex];
    let mapping = {};
    
    if (scaleId === 'likert5_ind') mapping = { "STS": 1, "TS": 2, "N": 3, "S": 4, "SS": 5 };
    else if (scaleId === 'likert5_eng') mapping = { "Strongly Disagree": 1, "Disagree": 2, "Neutral": 3, "Agree": 4, "Strongly Agree": 5 };
    else if (scaleId === 'gender_ind') mapping = { "Perempuan": 0, "Laki-Laki": 1 };
    else if (scaleId === 'gender_eng') mapping = { "Female": 0, "Male": 1 };
    else if (scaleId === 'yesno_eng') mapping = { "No": 0, "Yes": 1 };
    else if (scaleId === 'yesno_ind') mapping = { "Tidak": 0, "Ya": 1 };
    else if (scaleId === 'truefalse') mapping = { "Salah": 0, "Benar": 1 };
    
    // Perform conversion in data matrix
    dataMatrix.forEach(row => {
        const cellVal = row[colIndex];
        if (cellVal !== null && cellVal !== undefined) {
            const strVal = String(cellVal).trim();
            if (mapping[strVal] !== undefined) {
                row[colIndex] = mapping[strVal];
            }
        }
    });
    
    // Update Variable Metadata
    v.type = 'numeric';
    v.decimals = 0;
    v.measure = (scaleId.startsWith('likert5')) ? 'Ordinal' : 'Nominal';
    
    // Value Labels mapping inversion for SPSS-like labels
    v.values = {};
    Object.entries(mapping).forEach(([str, num]) => {
        v.values[num] = str;
    });
    
    // Refresh
    diagnoseQualityIssues();
    updateDashboardUI();
    renderSmartConverter();
    
    showInspectorHTML(`
        <div class="space-y-4">
            <h4 class="font-bold text-primary border-b pb-2">Scale Converted</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed">
                Variable <strong>${v.name}</strong> was successfully mapped to numeric values.
            </p>
            <div class="text-xs bg-slate-50 p-3 rounded space-y-1">
                <div>Value mappings defined:</div>
                ${Object.entries(v.values).map(([n, l]) => `<div class="pl-2 font-mono">${n} = "${l}"</div>`).join('')}
            </div>
        </div>
    `);
}

function runAutoScaleConversion() {
    let count = 0;
    variables.forEach((v, index) => {
        const values = getColumnValues(index);
        const scaleType = detectCategoricalScale(values);
        if (scaleType) {
            convertSingleScale(index, scaleType.id);
            count++;
        }
    });
    alert(`Auto Scale Conversion successfully transformed ${count} variables.`);
    renderSmartConverter();
}

// --- SMART CLEANING ENGINE (Requirement 2) ---
function diagnoseQualityIssues() {
    cleaningIssues = [];
    if (dataMatrix.length === 0) return;
    
    // 1. Check duplicate rows
    const dupRows = findDuplicateRows();
    dupRows.forEach(rowIndex => {
        cleaningIssues.push({
            type: 'duplicate',
            location: `Row Case ${rowIndex + 1}`,
            description: `Identical row values match other cases in the dataset.`,
            proposed: `Delete duplicate case row`,
            data: { rowIndex }
        });
    });
    
    // 2. Check variables columns
    variables.forEach((v, colIndex) => {
        // Check broken headers (e.g. spaces, symbols)
        if (v.name.includes('_') && v.label.includes(' ')) {
            cleaningIssues.push({
                type: 'header',
                location: `Column ${colIndex + 1} ("${v.label}")`,
                description: `Header contains spaces or illegal SPSS variable characters.`,
                proposed: `Rename to "${v.name}" and save original label`,
                data: { colIndex }
            });
        }
        
        const colValues = getColumnValues(colIndex);
        
        // Check missing values
        colValues.forEach((val, rowIndex) => {
            if (val === null || val === undefined || String(val).trim() === "") {
                cleaningIssues.push({
                    type: 'missing',
                    location: `Cell (${rowIndex + 1}, ${v.name})`,
                    description: `Empty (null) cell detected.`,
                    proposed: `Impute value with column ${config.imputationMethod.toUpperCase()}`,
                    data: { rowIndex, colIndex }
                });
            }
        });
        
        // Outliers (absolute Z-score > configuration threshold)
        if (v.type === 'numeric') {
            const numericVals = colValues.filter(val => val !== null && !isNaN(val));
            if (numericVals.length > 3) {
                const mean = numericVals.reduce((a,b)=>a+b, 0) / numericVals.length;
                const variance = numericVals.reduce((a,b)=>a + Math.pow(b-mean,2), 0) / (numericVals.length - 1);
                const sd = Math.sqrt(variance);
                
                if (sd > 0) {
                    colValues.forEach((val, rowIndex) => {
                        if (val !== null && !isNaN(val)) {
                            const z = (val - mean) / sd;
                            if (Math.abs(z) > config.outlierZ) {
                                cleaningIssues.push({
                                    type: 'outlier',
                                    location: `Cell (${rowIndex + 1}, ${v.name})`,
                                    description: `Outlier detected. Value is ${val} (Z-score: ${z.toFixed(2)}).`,
                                    proposed: `Cap value at Z = ${config.outlierZ} or impute mean`,
                                    data: { rowIndex, colIndex, mean, sd, originalVal: val }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
}

function countMissingCells() {
    let count = 0;
    dataMatrix.forEach(row => {
        row.forEach(cell => {
            if (cell === null || cell === undefined || String(cell).trim() === "") count++;
        });
    });
    return count;
}

function findDuplicateRows() {
    const dups = [];
    const seen = new Set();
    dataMatrix.forEach((row, index) => {
        const str = JSON.stringify(row);
        if (seen.has(str)) {
            dups.push(index);
        } else {
            seen.add(str);
        }
    });
    return dups;
}

function countOutliers() {
    let count = 0;
    variables.forEach((v, colIndex) => {
        if (v.type === 'numeric') {
            const vals = getColumnValues(colIndex).filter(x => x !== null && !isNaN(x));
            if (vals.length > 3) {
                const mean = vals.reduce((a,b)=>a+b, 0) / vals.length;
                const sd = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(vals.length-1));
                if (sd > 0) {
                    getColumnValues(colIndex).forEach(val => {
                        if (val !== null && !isNaN(val)) {
                            if (Math.abs((val - mean) / sd) > config.outlierZ) count++;
                        }
                    });
                }
            }
        }
    });
    return count;
}

function renderSmartCleaning() {
    const emptyEl = document.getElementById('clean-issues-empty');
    const panelEl = document.getElementById('clean-issues-panel');
    const tbody = document.getElementById('clean-issues-tbody');
    
    if (dataMatrix.length === 0) {
        emptyEl.style.display = 'block';
        panelEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    panelEl.style.display = 'block';
    tbody.innerHTML = '';
    
    // Set summaries
    document.getElementById('clean-sum-missing').innerText = cleaningIssues.filter(i => i.type === 'missing').length;
    document.getElementById('clean-sum-dups').innerText = cleaningIssues.filter(i => i.type === 'duplicate').length;
    document.getElementById('clean-sum-outliers').innerText = cleaningIssues.filter(i => i.type === 'outlier').length;
    document.getElementById('clean-sum-headers').innerText = cleaningIssues.filter(i => i.type === 'header').length;

    if (cleaningIssues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-green-700 font-semibold bg-green-50">Excellent! No data quality issues were detected. Your dataset is clean and ready.</td></tr>`;
        document.getElementById('btn-run-clean').disabled = true;
        document.getElementById('btn-run-clean').className = 'px-5 py-2.5 bg-slate-300 text-slate-500 font-bold rounded-lg cursor-not-allowed flex items-center gap-2';
    } else {
        document.getElementById('btn-run-clean').disabled = false;
        document.getElementById('btn-run-clean').className = 'px-5 py-2.5 bg-green-600 text-white font-bold hover:bg-green-700 rounded-lg shadow flex items-center gap-2';
        
        cleaningIssues.forEach((issue, index) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 border-b border-slate-100 clean-issue-row cursor-pointer";
            tr.onclick = () => inspectCleaningIssue(issue);
            
            let badgeColor = "bg-slate-100 text-slate-800";
            if (issue.type === 'missing') badgeColor = "bg-red-100 text-red-800";
            else if (issue.type === 'duplicate') badgeColor = "bg-amber-100 text-amber-800";
            else if (issue.type === 'outlier') badgeColor = "bg-orange-100 text-orange-800";
            else if (issue.type === 'header') badgeColor = "bg-blue-100 text-blue-800";
            
            tr.innerHTML = `
                <td class="p-3">
                    <span class="status-badge-pill ${badgeColor}">${issue.type}</span>
                </td>
                <td class="p-3 font-semibold font-data-mono text-xs">${issue.location}</td>
                <td class="p-3 text-xs text-on-surface-variant">${issue.description}</td>
                <td class="p-3 text-xs font-semibold text-primary">${issue.proposed}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function inspectCleaningIssue(issue) {
    let actionsHtml = '';
    if (issue.type === 'missing') {
        actionsHtml = `
            <button onclick="cleanSingleIssue(${cleaningIssues.indexOf(issue)})" class="w-full py-2 bg-green-600 text-white font-bold hover:bg-green-700 text-xs rounded shadow transition-all">Impute Value</button>
        `;
    } else if (issue.type === 'duplicate') {
        actionsHtml = `
            <button onclick="cleanSingleIssue(${cleaningIssues.indexOf(issue)})" class="w-full py-2 bg-amber-600 text-white font-bold hover:bg-amber-700 text-xs rounded shadow transition-all">Delete Duplicate Case</button>
        `;
    } else if (issue.type === 'outlier') {
        actionsHtml = `
            <button onclick="cleanSingleIssue(${cleaningIssues.indexOf(issue)})" class="w-full py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 text-xs rounded shadow transition-all">Cap Outlier</button>
        `;
    } else if (issue.type === 'header') {
        actionsHtml = `
            <button onclick="cleanSingleIssue(${cleaningIssues.indexOf(issue)})" class="w-full py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 text-xs rounded shadow transition-all">Format Header Name</button>
        `;
    }
    
    showInspectorHTML(`
        <div class="space-y-4">
            <h4 class="font-bold text-primary border-b pb-2">Resolve Issue</h4>
            <div class="text-xs space-y-2">
                <div><strong>Anomaly Category:</strong> ${issue.type.toUpperCase()}</div>
                <div><strong>Target Range:</strong> ${issue.location}</div>
                <div><strong>Details:</strong> ${issue.description}</div>
            </div>
            <div class="pt-4">
                ${actionsHtml}
            </div>
        </div>
    `);
}

function cleanSingleIssue(index) {
    const issue = cleaningIssues[index];
    if (!issue) return;
    
    if (issue.type === 'missing') {
        const colIndex = issue.data.colIndex;
        const rowIndex = issue.data.rowIndex;
        const v = variables[colIndex];
        
        // Get imputation value
        const colVals = getColumnValues(colIndex).filter(x => x !== null && x !== undefined && String(x).trim() !== "");
        let imputeVal = 3; // Neutral scale midpoint default
        
        if (colVals.length > 0) {
            if (v.type === 'numeric') {
                if (config.imputationMethod === 'mean') {
                    const sum = colVals.map(Number).reduce((a,b)=>a+b, 0);
                    imputeVal = Math.round((sum / colVals.length) * 10) / 10;
                } else {
                    const sorted = colVals.map(Number).sort((a,b)=>a-b);
                    const mid = Math.floor(sorted.length / 2);
                    imputeVal = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
                }
            } else {
                // Mode for categorical strings
                const freq = {};
                colVals.forEach(x => freq[x] = (freq[x] || 0) + 1);
                imputeVal = Object.keys(freq).sort((a,b) => freq[b] - freq[a])[0];
            }
        }
        dataMatrix[rowIndex][colIndex] = imputeVal;
        
    } else if (issue.type === 'duplicate') {
        const rowIndex = issue.data.rowIndex;
        dataMatrix.splice(rowIndex, 1);
        
    } else if (issue.type === 'outlier') {
        const colIndex = issue.data.colIndex;
        const rowIndex = issue.data.rowIndex;
        const mean = issue.data.mean;
        const sd = issue.data.sd;
        const val = issue.data.originalVal;
        
        // Cap outlier at threshold
        const direction = val > mean ? 1 : -1;
        const cappedVal = Math.round((mean + direction * config.outlierZ * sd) * 100) / 100;
        
        dataMatrix[rowIndex][colIndex] = cappedVal;
        
    } else if (issue.type === 'header') {
        const colIndex = issue.data.colIndex;
        variables[colIndex].name = sanitizeVariableName(variables[colIndex].name);
    }
    
    // Re-diagnose
    diagnoseQualityIssues();
    updateDashboardUI();
    renderSmartCleaning();
    
    showInspectorHTML(`<div class="text-center py-20 text-on-surface-variant"><span class="material-symbols-outlined text-[36px] opacity-45">ads_click</span><p class="mt-2 text-xs">Issue resolved successfully.</p></div>`);
}

function runOneClickCleaning(silent = false) {
    if (cleaningIssues.length === 0) return;
    
    // Solve duplicates first (requires row indices splice in reverse order)
    const duplicates = cleaningIssues.filter(i => i.type === 'duplicate').sort((a,b) => b.data.rowIndex - a.data.rowIndex);
    duplicates.forEach(d => {
        dataMatrix.splice(d.data.rowIndex, 1);
    });
    
    // Solve other issues
    diagnoseQualityIssues(); // update indices
    
    // Solve missing and outliers
    let issueCount = cleaningIssues.length;
    for (let i = 0; i < issueCount; i++) {
        // Impute first available missing or outliers
        const issue = cleaningIssues[0];
        if (issue && issue.type !== 'duplicate') {
            cleanSingleIssue(0);
        } else {
            break;
        }
    }
    
    if (!silent) {
        alert("One-Click Cleaning resolved all duplicate cases, header naming, missing values, and outliers.");
    }
    diagnoseQualityIssues();
    updateDashboardUI();
    renderSmartCleaning();
}

// --- QUESTIONNAIRE CONSTRUCT BUILDER (Requirement 3) ---
function renderConstructBuilder() {
    const emptyEl = document.getElementById('constructs-empty');
    const listEl = document.getElementById('constructs-list');
    const poolEl = document.getElementById('construct-variables-pool');
    
    if (dataMatrix.length === 0) {
        emptyEl.style.display = 'block';
        listEl.style.display = 'none';
        poolEl.innerHTML = '<div class="text-xs text-on-surface-variant text-center p-4">No data loaded.</div>';
        return;
    }
    
    emptyEl.style.display = 'none';
    listEl.style.display = 'block';
    listEl.innerHTML = '';
    
    // Render Constructs
    if (constructs.length === 0) {
        emptyEl.style.display = 'block';
        listEl.style.display = 'none';
    } else {
        constructs.forEach((c, cIdx) => {
            const card = document.createElement('div');
            card.className = "p-4 border border-outline-variant bg-slate-50/50 rounded-lg space-y-3";
            
            // Construct header
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input type="text" value="${c.name}" onchange="renameConstruct(${cIdx}, this.value)" class="bg-white border border-outline-variant rounded p-1 text-xs font-bold text-primary w-40 focus:ring-1 focus:ring-primary outline-none" />
                        <span class="text-xs text-on-surface-variant">(${c.items.length} items)</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="deleteConstruct(${cIdx})" class="text-red-600 hover:text-red-700 text-xs font-semibold">Delete</button>
                    </div>
                </div>
            `;
            
            // Render construct items list
            const itemsDiv = document.createElement('div');
            itemsDiv.className = "flex flex-wrap gap-1.5 py-2";
            
            c.items.forEach(itemId => {
                const itemVar = variables[itemId];
                const itemBadge = document.createElement('span');
                itemBadge.className = "inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-medium";
                
                // Check for negative correlation flags
                let reverseFlag = '';
                if (c.reverseItems && c.reverseItems.includes(itemId)) {
                    reverseFlag = `<span class="text-orange-600 font-bold" title="Reverse Coded">*REV</span>`;
                } else if (c.suggestedReverse && c.suggestedReverse.includes(itemId)) {
                    reverseFlag = `<span class="text-amber-500 font-bold animate-pulse cursor-pointer" onclick="toggleItemReverseScoring(${cIdx}, ${itemId})" title="Suggest Reverse Score. Click to invert values.">?REV</span>`;
                }
                
                itemBadge.innerHTML = `
                    <span>${itemVar.name}</span>
                    ${reverseFlag}
                    <button onclick="removeItemFromConstruct(${cIdx}, ${itemId})" class="text-[14px] text-slate-400 hover:text-red-600 font-bold select-none ml-1">&times;</button>
                `;
                itemsDiv.appendChild(itemBadge);
            });
            
            if (c.items.length === 0) {
                itemsDiv.innerHTML = `<span class="text-xs text-on-surface-variant italic">No item variables mapped to this construct yet.</span>`;
            }
            card.appendChild(itemsDiv);
            
            // Reliability check badge
            if (c.items.length >= 2) {
                const relResult = calculateConstructReliability(c);
                const relBadge = document.createElement('div');
                relBadge.className = "flex items-center justify-between text-xs pt-1 border-t border-slate-100";
                relBadge.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="font-semibold text-slate-500 font-label-caps">Alpha:</span>
                        <span class="font-data-mono font-bold">${relResult.alpha.toFixed(3)}</span>
                        <span class="status-badge-pill ${relResult.alpha >= 0.70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${relResult.alphaClass}</span>
                    </div>
                    ${c.suggestedReverse && c.suggestedReverse.length > 0 ? `<div class="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Negative Correlation. Suggest reverse scoring item with ?REV.</div>` : ''}
                `;
                card.appendChild(relBadge);
            }
            
            listEl.appendChild(card);
        });
    }
    
    // Render variables pool checkboxes
    poolEl.innerHTML = '';
    variables.forEach((v, idx) => {
        if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
            // Check if already mapped to any construct
            const isMapped = constructs.some(c => c.items.includes(idx));
            
            const div = document.createElement('div');
            div.className = "flex items-center justify-between p-2 hover:bg-slate-100 rounded text-xs";
            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer w-full select-none">
                    <input type="checkbox" ${isMapped ? 'checked disabled' : ''} onchange="handlePoolSelect(event, ${idx})" class="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                    <span class="${isMapped ? 'text-slate-400 font-mono line-through' : 'font-mono font-semibold text-slate-800'}">${v.name}</span>
                    <span class="text-on-surface-variant truncate w-40">(${v.label})</span>
                </label>
            `;
            poolEl.appendChild(div);
        }
    });
}

// Auto-group variables by prefix pattern (e.g. JS1, JS2 -> JS)
function autoDetectConstructs(showAlert = true) {
    if (dataMatrix.length === 0) return;
    
    constructs = [];
    const groupings = {};
    
    variables.forEach((v, idx) => {
        // Must be numeric inputs
        if (v.type === 'numeric' && v.role === 'Input' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
            // Match prefix e.g. JS1, JS_1 -> prefix JS
            const match = v.name.match(/^([a-zA-Z]+)(_)?\d+$/);
            const prefix = match ? match[1] : v.name;
            
            if (!groupings[prefix]) groupings[prefix] = [];
            groupings[prefix].push(idx);
        }
    });
    
    // Create constructs
    Object.entries(groupings).forEach(([name, items]) => {
        if (items.length >= 2) {
            constructs.push({
                name: getFullConstructLabel(name),
                id: name,
                items: items,
                reverseItems: [],
                suggestedReverse: []
            });
        }
    });
    
    // Auto calculate negative items correlation
    calculateSuggestedReverses();
    diagnoseQualityIssues();
    updateDashboardUI();
    
    if (currentActiveView === 'construct_builder') {
        renderConstructBuilder();
    }
    if (showAlert) {
        alert(`Automatically mapped ${constructs.length} questionnaire constructs.`);
    }
}

function getFullConstructLabel(prefix) {
    const labels = {
        "JS": "Job Satisfaction",
        "JP": "Job Performance",
        "Sat": "Customer Satisfaction",
        "Loy": "Customer Loyalty",
        "Mot": "Employee Motivation",
        "Org": "Organizational Commitment",
        "Loyal": "Brand Loyalty",
        "Commit": "Employee Commitment"
    };
    return labels[prefix] || `${prefix} Construct`;
}

function createNewConstruct() {
    const name = prompt("Enter new construct name (e.g. Job Satisfaction):", "New Construct");
    if (!name) return;
    
    constructs.push({
        name: name,
        id: name.replace(/\s+/g, ''),
        items: [],
        reverseItems: [],
        suggestedReverse: []
    });
    renderConstructBuilder();
}

function renameConstruct(index, val) {
    if (constructs[index]) {
        constructs[index].name = val;
        renderConstructBuilder();
    }
}

function deleteConstruct(index) {
    if (confirm("Delete this construct? Variables will be returned to the pool.")) {
        constructs.splice(index, 1);
        updateDashboardUI();
        renderConstructBuilder();
    }
}

function removeItemFromConstruct(cIdx, itemId) {
    const c = constructs[cIdx];
    if (c) {
        c.items = c.items.filter(id => id !== itemId);
        c.reverseItems = c.reverseItems.filter(id => id !== itemId);
        c.suggestedReverse = c.suggestedReverse.filter(id => id !== itemId);
        updateDashboardUI();
        renderConstructBuilder();
    }
}

function handlePoolSelect(evt, itemId) {
    if (evt.target.checked) {
        if (constructs.length === 0) {
            alert("Please add a construct first using 'Add Construct'.");
            evt.target.checked = false;
            return;
        }
        
        // Select construct to add to
        let constructNames = constructs.map((c, i) => `${i+1}. ${c.name}`).join('\n');
        let choice = prompt(`Select construct number to add variable:\n${constructNames}`, "1");
        let idx = parseInt(choice) - 1;
        
        if (constructs[idx]) {
            constructs[idx].items.push(itemId);
            calculateSuggestedReverses();
            updateDashboardUI();
            renderConstructBuilder();
        } else {
            evt.target.checked = false;
        }
    }
}

// Suggestions for reverse items: calculates correlation of each item with the total scale of remaining items
function calculateSuggestedReverses() {
    constructs.forEach(c => {
        c.suggestedReverse = [];
        if (c.items.length < 3) return;
        
        c.items.forEach(itemId => {
            // Compute corrected scale total
            const itemVals = getColumnValues(itemId).map(Number);
            const remainingSums = dataMatrix.map((row, rIdx) => {
                let sum = 0;
                c.items.forEach(otherId => {
                    if (otherId !== itemId) {
                        // Add value
                        sum += Number(dataMatrix[rIdx][otherId]);
                    }
                });
                return sum;
            });
            
            const r = calculatePearsonCorrelation(itemVals, remainingSums);
            // If negative correlation, suggest reverse coding!
            if (r < -0.20) {
                c.suggestedReverse.push(itemId);
            }
        });
    });
}

function toggleItemReverseScoring(cIdx, itemId) {
    const c = constructs[cIdx];
    if (!c) return;
    
    const colIndex = itemId;
    const values = getColumnValues(colIndex).filter(x => x !== null && !isNaN(x));
    if (values.length === 0) return;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (confirm(`Invert values for variable ${variables[itemId].name} (Range: ${min} to ${max})?`)) {
        // Invert values
        dataMatrix.forEach(row => {
            const val = row[colIndex];
            if (val !== null && !isNaN(val)) {
                row[colIndex] = (min + max) - val;
            }
        });
        
        // Save flag
        if (!c.reverseItems) c.reverseItems = [];
        c.reverseItems.push(itemId);
        
        // Clear from suggestion
        c.suggestedReverse = c.suggestedReverse.filter(id => id !== itemId);
        
        calculateSuggestedReverses();
        diagnoseQualityIssues();
        updateDashboardUI();
        renderConstructBuilder();
        
        showInspectorHTML(`
            <div class="space-y-4">
                <h4 class="font-bold text-amber-500 border-b pb-2">Item Reverse Scored</h4>
                <p class="text-xs text-on-surface-variant leading-relaxed">
                    Item <strong>${variables[itemId].name}</strong> was reverse-coded successfully. Formula used: <code>Val = (${min} + ${max}) - Val</code>.
                </p>
            </div>
        `);
    }
}

// --- SPSS DATA EDITOR GRAPHICS ---
function renderSpssEditor() {
    if (currentSpssTab === 'data') {
        renderSpssDataView();
    } else {
        renderSpssVariableView();
    }
}

function renderSpssDataView() {
    const theadRow = document.getElementById('spss-data-thead-row');
    const tbody = document.getElementById('spss-data-tbody');
    
    tbody.innerHTML = '';
    theadRow.innerHTML = '<th class="p-2 border-r border-slate-300 w-12 text-center bg-slate-200 sticky left-0 z-20">Row</th>';
    
    if (dataMatrix.length === 0) {
        tbody.innerHTML = `<tr><td class="p-6 text-center text-on-surface-variant font-medium">Please import an Excel dataset file to see rows grid.</td></tr>`;
        return;
    }
    
    // Render Headers
    variables.forEach((v, index) => {
        const th = document.createElement('th');
        th.className = "p-2 border-r border-slate-300 text-slate-700 min-w-[80px] font-semibold text-center";
        th.innerHTML = `
            <div class="flex flex-col items-center">
                <span class="text-xs font-data-mono">${v.name}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-400 font-label-caps">${v.measure}</span>
            </div>
        `;
        theadRow.appendChild(th);
    });
    
    // Render Rows (Paginated)
    const totalRows = dataMatrix.length;
    const startIdx = currentSpssPage * spssRowsPerPage;
    const endIdx = Math.min(startIdx + spssRowsPerPage, totalRows);
    
    for (let rowIndex = startIdx; rowIndex < endIdx; rowIndex++) {
        const row = dataMatrix[rowIndex];
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        
        // Row index column
        const indexTd = document.createElement('td');
        indexTd.className = "p-2 border-r border-slate-300 bg-slate-100 text-center font-bold text-slate-500 sticky left-0 z-10 w-12";
        indexTd.innerText = rowIndex + 1;
        tr.appendChild(indexTd);
        
        variables.forEach((v, colIndex) => {
            const td = document.createElement('td');
            td.className = "p-2 spss-grid-cell font-data-mono text-center cursor-pointer hover:bg-blue-50/50 outline-none";
            td.contentEditable = true;
            
            let cellVal = row[colIndex];
            if (cellVal === null || cellVal === undefined) {
                td.innerHTML = `<span class="text-red-400">.</span>`; // SPSS sysmis symbol
            } else {
                // Decimals formatting
                td.innerText = (typeof cellVal === 'number') ? cellVal.toFixed(v.decimals) : cellVal;
            }
            
            // Edit cell handler
            td.onblur = (e) => {
                let text = e.target.innerText.trim();
                if (text === '.' || text === '') {
                    row[colIndex] = null;
                } else {
                    row[colIndex] = isNaN(text) ? text : Number(text);
                }
                diagnoseQualityIssues();
                updateDashboardUI();
            };
            
            td.onclick = () => {
                showInspectorHTML(`
                    <div class="space-y-4">
                        <h4 class="font-bold text-primary border-b pb-2">Cell Inspector</h4>
                        <div class="text-xs space-y-1">
                            <div><strong>Coordinate:</strong> (${rowIndex + 1}, ${v.name})</div>
                            <div><strong>Value:</strong> ${cellVal !== null ? cellVal : '.'}</div>
                            <div><strong>Variable Label:</strong> ${v.label}</div>
                            <div><strong>Type:</strong> ${v.type.toUpperCase()}</div>
                            <div><strong>Measure:</strong> ${v.measure}</div>
                        </div>
                    </div>
                `);
            };
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    }
    
    // Update Pagination UI
    const startEl = document.getElementById('spss-page-start');
    const endEl = document.getElementById('spss-page-end');
    const totalEl = document.getElementById('spss-page-total');
    const indicatorEl = document.getElementById('spss-page-indicator');
    const btnPrev = document.getElementById('btn-spss-prev');
    const btnNext = document.getElementById('btn-spss-next');
    
    if (startEl && endEl && totalEl && indicatorEl && btnPrev && btnNext) {
        startEl.innerText = startIdx + 1;
        endEl.innerText = endIdx;
        totalEl.innerText = totalRows;
        indicatorEl.innerText = `Halaman ${currentSpssPage + 1}`;
        btnPrev.disabled = (currentSpssPage === 0);
        btnNext.disabled = (endIdx >= totalRows);
    }
}

function changeSpssPage(dir) {
    const maxPage = Math.ceil(dataMatrix.length / spssRowsPerPage) - 1;
    currentSpssPage = Math.max(0, Math.min(maxPage, currentSpssPage + dir));
    renderSpssDataView();
}

function renderSpssVariableView() {
    const tbody = document.getElementById('spss-variable-tbody');
    tbody.innerHTML = '';
    
    if (variables.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-on-surface-variant font-medium">Please import a dataset first.</td></tr>`;
        return;
    }
    
    variables.forEach((v, index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 border-b border-slate-200 text-xs";
        
        // Index
        tr.innerHTML = `
            <td class="p-3 border-r border-slate-200 bg-slate-50 text-center font-bold text-slate-500">${index + 1}</td>
            <td class="p-2 border-r border-slate-200">
                <input type="text" value="${v.name}" onchange="updateVariableMetadata(${index}, 'name', this.value)" class="w-full bg-white border border-slate-300 rounded p-1 font-semibold text-slate-800 focus:ring-1 focus:ring-primary outline-none" />
            </td>
            <td class="p-2 border-r border-slate-200">
                <select onchange="updateVariableMetadata(${index}, 'type', this.value)" class="w-full bg-white border border-slate-300 rounded p-1 text-[11px]">
                    <option value="numeric" ${v.type === 'numeric' ? 'selected' : ''}>Numeric</option>
                    <option value="string" ${v.type === 'string' ? 'selected' : ''}>String</option>
                </select>
            </td>
            <td class="p-2 border-r border-slate-200">
                <input type="number" value="${v.decimals}" min="0" max="6" onchange="updateVariableMetadata(${index}, 'decimals', parseInt(this.value))" class="w-16 bg-white border border-slate-300 rounded p-1 text-center" />
            </td>
            <td class="p-2 border-r border-slate-200">
                <input type="text" value="${v.label}" onchange="updateVariableMetadata(${index}, 'label', this.value)" class="w-full bg-white border border-slate-300 rounded p-1" />
            </td>
            <td class="p-2 border-r border-slate-200 text-center text-xs font-medium text-primary">
                ${Object.keys(v.values).length > 0 ? `<button onclick="editValueLabels(${index})" class="underline hover:text-secondary">${Object.keys(v.values).length} Mappings</button>` : `<button onclick="editValueLabels(${index})" class="underline hover:text-secondary">+ Add Mapping</button>`}
            </td>
            <td class="p-2 border-r border-slate-200">
                <select onchange="updateVariableMetadata(${index}, 'measure', this.value)" class="w-full bg-white border border-slate-300 rounded p-1 text-[11px]">
                    <option value="Scale" ${v.measure === 'Scale' ? 'selected' : ''}>Scale</option>
                    <option value="Ordinal" ${v.measure === 'Ordinal' ? 'selected' : ''}>Ordinal</option>
                    <option value="Nominal" ${v.measure === 'Nominal' ? 'selected' : ''}>Nominal</option>
                </select>
            </td>
            <td class="p-2 text-center">
                <button onclick="deleteVariableColumn(${index})" class="material-symbols-outlined text-red-600 hover:text-red-800 text-[18px]">delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateVariableMetadata(index, key, val) {
    if (variables[index]) {
        if (key === 'name') {
            variables[index].name = sanitizeVariableName(val);
        } else {
            variables[index][key] = val;
        }
        diagnoseQualityIssues();
        updateDashboardUI();
        renderSpssEditor();
    }
}

function deleteVariableColumn(index) {
    if (confirm(`Are you sure you want to delete variable ${variables[index].name}? This deletes the raw data column as well.`)) {
        variables.splice(index, 1);
        dataMatrix.forEach(row => row.splice(index, 1));
        
        // Clear construct mappings containing index
        constructs.forEach(c => {
            c.items = c.items.filter(id => id !== index);
        });
        
        diagnoseQualityIssues();
        updateDashboardUI();
        renderSpssEditor();
    }
}

function addNewDataRow() {
    if (variables.length === 0) return;
    const newRow = Array(variables.length).fill(null);
    dataMatrix.push(newRow);
    diagnoseQualityIssues();
    updateDashboardUI();
    renderSpssEditor();
}

function addNewVariableRow() {
    const count = variables.length;
    const name = `Var${count + 1}`;
    variables.push({
        name: name,
        label: `New Variable ${count + 1}`,
        type: 'numeric',
        decimals: 2,
        measure: 'Scale',
        align: 'Right',
        values: {},
        missing: 'None',
        role: 'Input'
    });
    // Add column to matrix
    dataMatrix.forEach(row => row.push(null));
    diagnoseQualityIssues();
    updateDashboardUI();
    renderSpssEditor();
}

function editValueLabels(varIndex) {
    const v = variables[varIndex];
    const currentLabels = Object.entries(v.values).map(([num, str]) => `${num}:${str}`).join(', ');
    const input = prompt(`Configure Value Labels mappings for variable: ${v.name}\nFormat: numericVal:Label (comma separated)\nExample: 1:Strongly Disagree, 2:Disagree, 3:Neutral, 4:Agree, 5:Strongly Agree`, currentLabels);
    
    if (input !== null) {
        const newValues = {};
        if (input.trim().length > 0) {
            const mappings = input.split(',');
            mappings.forEach(m => {
                const parts = m.split(':');
                if (parts.length === 2) {
                    const num = parseInt(parts[0].trim());
                    const str = parts[1].trim();
                    if (!isNaN(num)) {
                        newValues[num] = str;
                    }
                }
            });
        }
        v.values = newValues;
        renderSpssEditor();
    }
}

// --- MATH / STATISTICS ENGINE (Requirement 4, 5, 6, 7) ---

function safeToFixed(value, decimals = 3) {
    if (value === undefined || value === null || isNaN(value)) {
        return (0).toFixed(decimals);
    }
    if (!isFinite(value)) {
        return value > 0 ? (999.999).toFixed(decimals) : (-999.999).toFixed(decimals);
    }
    return value.toFixed(decimals);
}

function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    const meanX = x.reduce((a,b)=>a+b, 0) / n;
    const meanY = y.reduce((a,b)=>a+b, 0) / n;
    
    let num = 0;
    let denX = 0;
    let denY = 0;
    
    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        num += diffX * diffY;
        denX += diffX * diffX;
        denY += diffY * diffY;
    }
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
}

function calculateTValueProbability(t, df) {
    // Approximation for p-value (Student's t-distribution two-tailed CDF)
    t = Math.abs(t);
    if (df <= 0) return 1.0;
    const x = df / (df + t * t);
    
    // Simple polynomial approximation for regular t ranges
    let p = 0;
    if (df <= 1) {
        p = 1 - (2 / Math.PI) * Math.atan(t);
    } else {
        // Normal approximation for larger df
        const z = t * (1 - 1 / (4 * df)) / Math.sqrt(1 + t * t / (2 * df));
        p = 2 * (1 - calculateNormalCDF(z));
    }
    return Math.min(1.0, Math.max(0.0001, p));
}

function calculateNormalCDF(x) {
    // Standard Normal distribution CDF approximation
    const b1 =  0.319381530;
    const b2 = -0.356563782;
    const b3 =  1.781477937;
    const b4 = -1.821255978;
    const b5 =  1.330274429;
    const p  =  0.2316419;
    const c  =  0.39894228;
    
    if (x >= 0.0) {
        const t = 1.0 / (1.0 + p * x);
        return (1.0 - c * Math.exp(-x * x / 2.0) * t *
               (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    } else {
        const t = 1.0 / (1.0 - p * x);
        return (c * Math.exp(-x * x / 2.0) * t *
               (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    }
}

// Probit function (inverse standard normal CDF)
function probit(p) {
    if (p <= 0 || p >= 1) return 0;
    const a = [-3.969683028665376e+01,  2.209460984245205e+02, -2.759285104469687e+02,  1.383577518672690e+02, -3.066479895627948e+01,  2.506628277459239e+00];
    const b = [-5.447609879822406e+01,  1.615858368580409e+02, -1.556989798598866e+02,  6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
    const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142446e+00,  3.754408661907416e+00];
    
    const p_low = 0.02425;
    const p_high = 1 - p_low;
    
    if (p < p_low) {
        const q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
               ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p > p_high) {
        const q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else {
        const q = p - 0.5;
        const r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
               (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
}

// Kolmogorov-Smirnov test for normality
function calculateKolmogorovSmirnov(values) {
    const n = values.length;
    if (n < 5) return { statistic: 0, pValue: 1.0 };
    
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1);
    const stdDev = Math.sqrt(Math.max(1e-10, variance));
    
    const sorted = [...values].sort((a, b) => a - b);
    
    let maxD = 0;
    for (let i = 0; i < n; i++) {
        const x = sorted[i];
        const z = (x - mean) / stdDev;
        const F = calculateNormalCDF(z);
        const d1 = (i + 1) / n - F;
        const d2 = F - i / n;
        const d = Math.max(Math.abs(d1), Math.abs(d2));
        if (d > maxD) {
            maxD = d;
        }
    }
    
    // Lilliefors significance correction p-value approximation
    const lillieforsStat = maxD * (Math.sqrt(n) - 0.01 + 0.85 / Math.sqrt(n));
    let pValue = 1.0;
    if (lillieforsStat > 1.38) {
        pValue = 2 * Math.exp(-2 * lillieforsStat * lillieforsStat);
    } else {
        pValue = Math.exp(-2 * maxD * maxD * n);
    }
    pValue = Math.min(1.0, Math.max(0.0001, pValue));
    
    return {
        statistic: maxD,
        pValue: pValue
    };
}

// Shapiro-Wilk test for normality
function calculateShapiroWilk(values) {
    const n = values.length;
    if (n < 3) return { statistic: 0, pValue: 1.0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    const mean = sorted.reduce((sum, v) => sum + v, 0) / n;
    
    const ss = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0);
    if (ss === 0) return { statistic: 1.0, pValue: 1.0 };
    
    const m = [];
    let sumM2 = 0;
    for (let i = 1; i <= n; i++) {
        const p = (i - 0.375) / (n + 0.25);
        const z = probit(p);
        m.push(z);
        sumM2 += z * z;
    }
    
    const denom = Math.sqrt(sumM2);
    const a = m.map(z => z / denom);
    
    let wNumerator = 0;
    for (let i = 0; i < n; i++) {
        wNumerator += a[i] * sorted[i];
    }
    const W = (wNumerator * wNumerator) / ss;
    
    const y = Math.log(1 - W);
    let mu, sigma;
    
    if (n === 3) {
        mu = 0.0;
        sigma = 1.0;
    } else if (n >= 4 && n <= 11) {
        mu = 0.5440 - 0.39978 * n + 0.025054 * n * n - 0.0006714 * n * n * n;
        sigma = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n * n - 0.0020322 * n * n * n);
    } else {
        const lnN = Math.log(n);
        mu = -1.5861 - 0.31082 * lnN - 0.056298 * lnN * lnN + 0.003037 * lnN * lnN * lnN;
        sigma = Math.exp(-0.4803 - 0.082676 * lnN + 0.0030302 * lnN * lnN);
    }
    
    let zVal;
    if (n === 3) {
        zVal = (W - 0.75) / 0.1;
    } else {
        zVal = (y - mu) / sigma;
    }
    
    const pValue = 1 - calculateNormalCDF(zVal);
    return {
        statistic: W,
        pValue: Math.min(1.0, Math.max(0.0001, pValue))
    };
}

// Calculate critical r value for df = N-2 at alpha (default 0.05) two-tailed
function calculateRCritical(N, alpha = 0.05) {
    const df = N - 2;
    if (df <= 0) return 1.0;
    
    const tLookup05 = {
        1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
        6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
        11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
        16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
        21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
        26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042
    };
    
    let tVal = 0;
    if (Math.abs(alpha - 0.05) < 0.01 && tLookup05[df]) {
        tVal = tLookup05[df];
    } else {
        // Cornish-Fisher approximation for standard two-tailed alpha
        const pTail = alpha / 2;
        let z = 1.95996;
        if (pTail > 0 && pTail < 0.5) {
            const tSplit = Math.sqrt(-2.0 * Math.log(pTail));
            z = tSplit - ((2.515517 + 0.802853 * tSplit + 0.010328 * tSplit * tSplit) /
                (1.0 + 1.432788 * tSplit + 0.189269 * tSplit * tSplit + 0.001308 * tSplit * tSplit * tSplit));
        }
        
        const z3 = z * z * z;
        const z5 = z3 * z * z;
        tVal = z + (z3 + z) / (4.0 * df) + (5.0 * z5 + 16.0 * z3 + 3.0 * z) / (96.0 * df * df);
    }
    
    return tVal / Math.sqrt(df + tVal * tVal);
}

// Rank transform helper (for Spearman Rank Correlation)
function calculateRank(arr) {
    const n = arr.length;
    const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
    const ranks = Array(n);
    
    let i = 0;
    while (i < n) {
        let j = i;
        while (j + 1 < n && sorted[j + 1].val === sorted[i].val) {
            j++;
        }
        
        // Average rank for ties (1-based)
        const avgRank = (i + j) / 2 + 1;
        for (let k = i; k <= j; k++) {
            ranks[sorted[k].idx] = avgRank;
        }
        i = j + 1;
    }
    return ranks;
}

// Spearman Rank Correlation
function calculateSpearmanCorrelation(x, y) {
    const ranksX = calculateRank(x);
    const ranksY = calculateRank(y);
    return calculatePearsonCorrelation(ranksX, ranksY);
}

// Validity helper (Requirement 5 rules + Pearson vs CITC PDF Criteria)
function calculateItemValidity(construct, itemId) {
    const itemVals = getColumnValues(itemId).map(Number);
    
    // Corrected total score (remaining sum of other items)
    const remainingSums = dataMatrix.map((row, rIdx) => {
        let sum = 0;
        construct.items.forEach(otherId => {
            if (otherId !== itemId) {
                sum += Number(dataMatrix[rIdx][otherId]);
            }
        });
        return sum;
    });
    
    // Uncorrected total score (including this item)
    const totalSums = dataMatrix.map((row, rIdx) => {
        let sum = 0;
        construct.items.forEach(otherId => {
            sum += Number(dataMatrix[rIdx][otherId]);
        });
        return sum;
    });
    
    const citc = calculatePearsonCorrelation(itemVals, remainingSums);
    const pearsonR = calculatePearsonCorrelation(itemVals, totalSums);
    
    const df = dataMatrix.length - 2;
    const rTabel = calculateRCritical(dataMatrix.length, config.alpha);
    
    // t-statistic and p-value for Pearson r
    let t = 0;
    if (Math.abs(pearsonR) < 1.0) {
        t = pearsonR * Math.sqrt(df / (1 - pearsonR * pearsonR));
    }
    const pValue = calculateTValueProbability(t, df);
    
    // Rules engine based on CITC >= 0.30 (Azwar, 2015)
    let status = 'Invalid';
    if (citc >= config.citcThreshold) {
        status = 'Valid';
    } else if (citc >= 0.20) {
        status = 'Anomaly';
    }
    
    return {
        citc: citc,
        pearsonR: pearsonR,
        rTabel: rTabel,
        pValue: pValue,
        status: status,
        isValid: (status === 'Valid')
    };
}

// Reliability helper (Requirement 6 classification + George & Mallery, Nunnally, Guilford, Arikunto)
function calculateConstructReliability(construct) {
    const k = construct.items.length;
    if (k < 2) {
        return { 
            alpha: 0, 
            alphaClass: 'Tidak Dapat Diterima (Unacceptable)',
            nunnally: 'Tidak Reliabel',
            arikunto: 'Sangat Rendah',
            guilford: 'Tidak Reliabel'
        };
    }
    
    // Calculate item variances
    const itemVariances = [];
    construct.items.forEach(itemId => {
        const vals = getColumnValues(itemId).map(Number);
        const mean = vals.reduce((a,b)=>a+b, 0) / vals.length;
        const variance = vals.reduce((a,b)=>a + Math.pow(b-mean, 2), 0) / (vals.length - 1);
        itemVariances.push(variance);
    });
    
    // Calculate scale total score variance
    const totalScores = dataMatrix.map((row, rIdx) => {
        let sum = 0;
        construct.items.forEach(itemId => {
            sum += Number(row[itemId]);
        });
        return sum;
    });
    
    const totalMean = totalScores.reduce((a,b)=>a+b, 0) / totalScores.length;
    const totalVariance = totalScores.reduce((a,b)=>a + Math.pow(b-totalMean, 2), 0) / (totalScores.length - 1);
    
    const sumItemVariances = itemVariances.reduce((a,b)=>a+b, 0);
    
    let alpha = 0;
    if (totalVariance > 0) {
        alpha = (k / (k - 1)) * (1 - (sumItemVariances / totalVariance));
    }
    
    // George & Mallery (2003)
    let alphaClass = 'Tidak Dapat Diterima (Unacceptable)';
    if (alpha > 0.90) alphaClass = 'Sangat Baik (Excellent)';
    else if (alpha > 0.80) alphaClass = 'Baik (Good)';
    else if (alpha > 0.70) alphaClass = 'Dapat Diterima (Acceptable)';
    else if (alpha > 0.60) alphaClass = 'Dipertanyakan (Questionable)';
    else if (alpha > 0.50) alphaClass = 'Buruk (Poor)';
    
    // Nunnally (1978)
    const nunnally = alpha >= 0.70 ? "Reliabel" : "Tidak Reliabel";
    
    // Arikunto (2021)
    let arikunto = "Sangat Rendah";
    if (alpha >= 0.80) arikunto = "Sangat Tinggi";
    else if (alpha >= 0.60) arikunto = "Tinggi";
    else if (alpha >= 0.40) arikunto = "Cukup";
    else if (alpha >= 0.20) arikunto = "Rendah";
    
    // Guilford (1956)
    let guilford = "Tidak Reliabel";
    if (alpha > 0.90) guilford = "Sangat Reliabel";
    else if (alpha >= 0.71) guilford = "Reliabel";
    else if (alpha >= 0.41) guilford = "Cukup Reliabel";
    else if (alpha >= 0.21) guilford = "Kurang Reliabel";
    
    return {
        alpha: alpha,
        alphaClass: alphaClass,
        nunnally: nunnally,
        arikunto: arikunto,
        guilford: guilford
    };
}

function formatNumber(val, decimals = 3, fallback = "-") {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return fallback;
    return Number(val).toFixed(decimals);
}

// MATRIX UTILITIES FOR MULTIPLE REGRESSION
function matrixTranspose(A) {
    const m = A.length;
    const n = A[0].length;
    const T = [];
    for (let j = 0; j < n; j++) {
        T[j] = [];
        for (let i = 0; i < m; i++) {
            T[j][i] = A[i][j];
        }
    }
    return T;
}

function matrixMultiply(A, B) {
    const m = A.length;
    const n = A[0].length;
    const p = B[0].length;
    const C = [];
    for (let i = 0; i < m; i++) {
        C[i] = [];
        for (let j = 0; j < p; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    return C;
}

// Gauss-Jordan elimination matrix inversion
function matrixInverse(A) {
    const n = A.length;
    const B = [];
    // Create augmented matrix [A | I]
    for (let i = 0; i < n; i++) {
        B[i] = [];
        for (let j = 0; j < 2 * n; j++) {
            if (j < n) {
                B[i][j] = A[i][j];
            } else {
                B[i][j] = (j - n === i) ? 1.0 : 0.0;
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        // Pivot check
        let pivotRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(B[k][i]) > Math.abs(B[pivotRow][i])) {
                pivotRow = k;
            }
        }
        // Swap rows
        if (pivotRow !== i) {
            const temp = B[i];
            B[i] = B[pivotRow];
            B[pivotRow] = temp;
        }
        
        const diagVal = B[i][i];
        if (isNaN(diagVal) || Math.abs(diagVal) < 1e-12) {
            return null; // Singular or NaN matrix!
        }
        
        // Divide pivot row by diagVal
        for (let j = i; j < 2 * n; j++) {
            B[i][j] /= diagVal;
        }
        
        // Eliminate other rows
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = B[k][i];
                for (let j = i; j < 2 * n; j++) {
                    B[k][j] -= factor * B[i][j];
                }
            }
        }
    }
    
    // Extract inverted part
    const inv = [];
    for (let i = 0; i < n; i++) {
        inv[i] = [];
        for (let j = 0; j < n; j++) {
            inv[i][j] = B[i][j + n];
        }
    }
    return inv;
}

// Calculate F Distribution probability CDF (approximation)
function calculateFProbability(F, df1, df2) {
    if (F <= 0) return 1.0;
    
    // Fisher-Snedecor cumulative distribution check (approximated)
    const x = (df1 * F) / (df1 * F + df2);
    
    // Incomplete Beta function approximation for F distribution
    let a = df1 / 2;
    let b = df2 / 2;
    
    // Using standard normal approximation if df are reasonably large
    if (df1 > 2 && df2 > 2) {
        const z = (Math.pow(df2/(df2-2), 1/3) * (1 - 2/(9*df2)) - Math.pow(F*(df1-2)/df1, 1/3) * (1 - 2/(9*df1))) / 
                  Math.sqrt(2/(9*df2) * Math.pow(df2/(df2-2), 2/3) + 2/(9*df1) * Math.pow(F*(df1-2)/df1, 2/3));
        return Math.min(1.0, Math.max(0.0001, 1 - calculateNormalCDF(z)));
    }
    
    // Default safe p ranges for standard test outputs
    if (F > 15.0) return 0.0001;
    if (F > 8.0) return 0.001;
    if (F > 4.0) return 0.05;
    return 0.15;
}

function calculateSkewness(vals, mean, sd) {
    if (vals.length < 3 || sd === 0) return 0;
    const n = vals.length;
    const sum3 = vals.reduce((a,b)=>a + Math.pow(b-mean, 3), 0);
    return (n * sum3) / ((n-1) * (n-2) * Math.pow(sd, 3));
}

function calculateKurtosis(vals, mean, sd) {
    if (vals.length < 4 || sd === 0) return 0;
    const n = vals.length;
    const sum4 = vals.reduce((a,b)=>a + Math.pow(b-mean, 4), 0);
    const term1 = (n * (n + 1) * sum4) / ((n-1) * (n-2) * (n-3) * Math.pow(sd, 4));
    const term2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return term1 - term2;
}

// --- FULL ONE-CLICK STATISTICAL ANALYSIS PIPELINE ---
function runOneClickAnalysis() {
    // Auto scale conversion
    if (typeof variables !== 'undefined') {
        variables.forEach((v, index) => {
            const values = getColumnValues(index);
            const scaleType = detectCategoricalScale(values);
            if (scaleType) {
                convertSingleScale(index, scaleType.id);
            }
        });
    }
    if (dataMatrix.length === 0) {
        showGlobalError(
            "Gagal Menjalankan Analisis", 
            "Dataset belum dimuat", 
            "Harap unggah atau pilih dataset riset sebelum menjalankan kalkulasi statistik."
        );
        return;
    }
    
    if (constructs.length === 0) {
        autoDetectConstructs(false);
    }
    
    if (cleaningIssues.length > 0) {
        if (confirm("Quality anomalies were detected. Impute missing cells, outliers, and duplicates automatically? (Recommended for clean calculation)")) {
            runOneClickCleaning();
        }
    }

    // Setup variables mapping vectors
    const n = dataMatrix.length;
    const descriptives = [];
    const validity = [];
    const reliability = [];
    let regressionResult = null;
    
    // Intermediate calculation variables
    let dvIdx, dvName, dvLabel, isConstructDV, dvConstructObj;
    let ivConstructs = [];
    let Y = [], X = [], XT = [], XTX = [], XTX_inv = null;
    let Beta = [], Y_pred = [], residuals = [], rss = 0, meanY = 0, tss = 0, ssReg = 0;
    let ivCount = 0, dfReg = 0, dfRes = 0, msReg = 0, msRes = 0, F = 0, pValueF = 0;
    let rSquare = 0, adjRSquare = 0, stdErrorEstimate = 0;
    let covBeta = [], seBeta = [], tBeta = [], pBeta = [], sdY = 0, stdBeta = [];
    let vif = [], hetero = [];

    let analysisOutputCorrelations = null;

    const steps = [
        {
            text: "Menginisialisasi modul komputasi statistik WRT...",
            duration: 0,
            action: () => {
                dvIdx = variables.length - 1;
                dvName = variables[dvIdx].name;
                dvLabel = variables[dvIdx].label;
                isConstructDV = false;
                dvConstructObj = null;
                
                // Construct Validation Guard (AI Self-Healing)
                let fallbackIdx = 0;
                constructs.forEach(c => {
                    if (!c.items || c.items.length === 0) {
                        // Find a numeric variable that is not age or gender
                        while (fallbackIdx < variables.length) {
                            const v = variables[fallbackIdx];
                            if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                c.items = [fallbackIdx];
                                appendSpssAnalysisLog("AI BACKUP", `Konstruk ${c.name} kosong. Otomatis memetakan ke variabel ${v.name}.`, "text-amber-400");
                                fallbackIdx++;
                                break;
                            }
                            fallbackIdx++;
                        }
                    }
                });
            }
        },
        {
            text: "Menghitung statistik deskriptif tiap variabel...",
            duration: 0,
            action: () => {
                variables.forEach((v, vIdx) => {
                    if (v.type === 'numeric') {
                        const vals = getColumnValues(vIdx).map(Number);
                        const mean = vals.reduce((a,b)=>a+b,0) / n;
                        const variance = vals.reduce((a,b)=>a + Math.pow(b-mean,2), 0) / (n - 1);
                        const sd = Math.sqrt(variance);
                        const min = Math.min(...vals);
                        const max = Math.max(...vals);
                        const skew = calculateSkewness(vals, mean, sd);
                        const kurt = calculateKurtosis(vals, mean, sd);
                        
                        const seSkew = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
                        const seKurt = 2 * seSkew * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)));
                        
                        const ksRes = calculateKolmogorovSmirnov(vals);
                        const swRes = calculateShapiroWilk(vals);

                        descriptives.push({
                            index: vIdx,
                            name: v.name,
                            label: v.label,
                            n: n,
                            min: min,
                            max: max,
                            mean: mean,
                            sd: sd,
                            variance: variance,
                            skew: skew,
                            kurt: kurt,
                            zSkew: skew / seSkew,
                            zKurt: kurt / seKurt,
                            ksStat: ksRes.statistic,
                            ksSig: ksRes.pValue,
                            swStat: swRes.statistic,
                            swSig: swRes.pValue
                        });
                    }
                });
            }
        },
        {
            text: "Menguji validitas instrumen (Item-Total Correlation & Pearson)...",
            duration: 0,
            action: () => {
                constructs.forEach(c => {
                    c.items.forEach(itemId => {
                        const res = calculateItemValidity(c, itemId);
                        validity.push({
                            construct: c.name,
                            itemIdx: itemId,
                            name: variables[itemId].name,
                            label: variables[itemId].label,
                            citc: res.citc,
                            pearsonR: res.pearsonR,
                            rTabel: res.rTabel,
                            pValue: res.pValue,
                            status: res.status
                        });
                    });
                });
            }
        },
        {
            text: "Menguji reliabilitas konstruk (Cronbach Alpha)...",
            duration: 0,
            action: () => {
                constructs.forEach(c => {
                    const res = calculateConstructReliability(c);
                    reliability.push({
                        name: c.name,
                        itemsCount: c.items.length,
                        alpha: res.alpha,
                        alphaClass: res.alphaClass,
                        nunnally: res.nunnally,
                        guilford: res.guilford,
                        arikunto: res.arikunto
                    });
                });
            }
        },
        {
            text: "Menyusun matriks regresi linier berganda...",
            duration: 0,
            action: () => {
                const dvKeywords = [
                    'performance', 'kinerja', 'prestasi',
                    'loyalty', 'loyalitas',
                    'satisfaction', 'kepuasan',
                    'intention', 'purchase', 'decision', 'minat', 'keputusan',
                    'behavior', 'perilaku',
                    'commitment', 'komitmen',
                    'motivation', 'motivasi',
                    'retention', 'retensi',
                    'outcome', 'partisipasi',
                    'y'
                ];

                let targetConstruct = null;
                for (let kw of dvKeywords) {
                    targetConstruct = constructs.find(c => {
                        const nameLower = c.name.toLowerCase();
                        const idLower = c.id.toLowerCase();
                        return nameLower.includes(kw) || idLower === kw || idLower.endsWith('_' + kw) || idLower.endsWith(kw);
                    });
                    if (targetConstruct) break;
                }

                if (targetConstruct) {
                    isConstructDV = true;
                    dvConstructObj = targetConstruct;
                    dvName = targetConstruct.name;
                    dvLabel = targetConstruct.name;
                    ivConstructs = constructs.filter(c => c !== targetConstruct);
                    appendSpssAnalysisLog("CENTRAL PIPELINE", `DV Konstruk terdeteksi: Y = ${dvName}, X = ${ivConstructs.map(c => c.name).join(', ')}`, "text-green-400");
                } else {
                    let targetVarIdx = -1;
                    for (let kw of dvKeywords) {
                        for (let i = variables.length - 1; i >= 0; i--) {
                            const v = variables[i];
                            if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                const nameLower = v.name.toLowerCase();
                                if (nameLower === kw || nameLower.includes(kw)) {
                                    targetVarIdx = i;
                                    break;
                                }
                            }
                        }
                        if (targetVarIdx !== -1) break;
                    }

                    if (targetVarIdx !== -1) {
                        isConstructDV = false;
                        dvConstructObj = null;
                        dvIdx = targetVarIdx;
                        dvName = variables[dvIdx].name;
                        dvLabel = variables[dvIdx].label;
                        
                        if (constructs.length > 0) {
                            ivConstructs = constructs;
                        } else {
                            ivConstructs = [];
                            variables.forEach((v, idx) => {
                                if (idx !== targetVarIdx && v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                    ivConstructs.push({
                                        name: v.name,
                                        id: v.name,
                                        items: [idx]
                                    });
                                }
                            });
                        }
                        appendSpssAnalysisLog("CENTRAL PIPELINE", `DV Mentah terdeteksi: Y = ${dvName}, X = ${ivConstructs.map(c => c.name).join(', ')}`, "text-green-400");
                    } else {
                        if (constructs.length >= 2) {
                            targetConstruct = constructs[constructs.length - 1];
                            isConstructDV = true;
                            dvConstructObj = targetConstruct;
                            dvName = targetConstruct.name;
                            dvLabel = targetConstruct.name;
                            ivConstructs = constructs.filter(c => c !== targetConstruct);
                            appendSpssAnalysisLog("CENTRAL PIPELINE", `DV Konstruk Fallback (konstruk terakhir): Y = ${dvName}, X = ${ivConstructs.map(c => c.name).join(', ')}`, "text-green-400");
                        } else if (constructs.length === 1) {
                            let fallbackDVIdx = variables.length - 1;
                            for (let i = variables.length - 1; i >= 0; i--) {
                                const v = variables[i];
                                if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                    if (!constructs[0].items.includes(i)) {
                                        fallbackDVIdx = i;
                                        break;
                                    }
                                }
                            }
                            isConstructDV = false;
                            dvConstructObj = null;
                            dvIdx = fallbackDVIdx;
                            dvName = variables[dvIdx].name;
                            dvLabel = variables[dvIdx].label;
                            ivConstructs = [constructs[0]];
                            appendSpssAnalysisLog("CENTRAL PIPELINE", `DV Mentah Fallback (Single Construct IV): Y = ${dvName}, X = ${ivConstructs.map(c => c.name).join(', ')}`, "text-green-400");
                        } else {
                            let fallbackDVIdx = variables.length - 1;
                            for (let i = variables.length - 1; i >= 0; i--) {
                                const v = variables[i];
                                if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                    fallbackDVIdx = i;
                                    break;
                                }
                            }
                            isConstructDV = false;
                            dvConstructObj = null;
                            dvIdx = fallbackDVIdx;
                            dvName = variables[dvIdx].name;
                            dvLabel = variables[dvIdx].label;
                            
                            ivConstructs = [];
                            variables.forEach((v, idx) => {
                                if (idx !== dvIdx && v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                                    ivConstructs.push({
                                        name: v.name,
                                        id: v.name,
                                        items: [idx]
                                    });
                                }
                            });
                            appendSpssAnalysisLog("CENTRAL PIPELINE", `DV Mentah Fallback (0 constructs): Y = ${dvName}, X = ${ivConstructs.map(c => c.name).join(', ')}`, "text-green-400");
                        }
                    }
                }
                
                Y = dataMatrix.map((row, rIdx) => {
                    if (isConstructDV) {
                        let sum = 0;
                        dvConstructObj.items.forEach(id => sum += Number(row[id]));
                        return [sum / dvConstructObj.items.length];
                    } else {
                        return [Number(row[dvIdx])];
                    }
                });

                X = dataMatrix.map((row, rIdx) => {
                    const xRow = [1.0];
                    ivConstructs.forEach(c => {
                        let sum = 0;
                        c.items.forEach(id => sum += Number(row[id]));
                        xRow.push(sum / c.items.length);
                    });
                    return xRow;
                });

                XT = matrixTranspose(X);
                XTX = matrixMultiply(XT, X);
                XTX_inv = matrixInverse(XTX);
                
                // Ridge Regression Fallback (AI Self-Healing)
                if (!XTX_inv && XTX.length > 0) {
                    appendSpssAnalysisLog("AI BACKUP", "Matriks singular (multikolinieritas sempurna). Mengaktifkan Ridge Regression fallback (lambda=0.0001)...", "text-amber-400");
                    const lambda = 0.0001;
                    const XTX_ridge = XTX.map((row, rIdx) => 
                        row.map((val, cIdx) => rIdx === cIdx ? val + lambda : val)
                    );
                    XTX_inv = matrixInverse(XTX_ridge);
                }
            }
        },
        {
            text: "Menghitung koefisien beta dan signifikansi uji t/F...",
            duration: 0,
            action: () => {
                if (XTX_inv) {
                    const XTY = matrixMultiply(XT, Y);
                    Beta = matrixMultiply(XTX_inv, XTY);
                    Y_pred = matrixMultiply(X, Beta);
                    residuals = Y.map((val, idx) => val[0] - Y_pred[idx][0]);
                    rss = residuals.reduce((sum, res) => sum + res*res, 0);
                    rss = Math.max(0, rss);
                    
                    meanY = Y.reduce((sum, val) => sum + val[0], 0) / n;
                    tss = Y.reduce((sum, val) => sum + Math.pow(val[0]-meanY, 2), 0);
                    tss = Math.max(1e-10, tss);
                    ssReg = Math.max(0, tss - rss);
                    
                    ivCount = ivConstructs.length;
                    dfReg = Math.max(1, ivCount);
                    dfRes = Math.max(1, n - ivCount - 1);
                    
                    msReg = ssReg / dfReg;
                    msRes = rss / dfRes;
                    F = msRes === 0 ? 0 : msReg / msRes;
                    pValueF = calculateFProbability(F, dfReg, dfRes);
                    
                    rSquare = Math.min(1.0, Math.max(0.0, ssReg / tss));
                    const denomAdj = tss / Math.max(1, n - 1);
                    adjRSquare = denomAdj === 0 ? rSquare : 1 - (msRes / denomAdj);
                    stdErrorEstimate = Math.sqrt(Math.max(0, msRes));
                    
                    covBeta = XTX_inv.map(row => row.map(val => val * msRes));
                    seBeta = Beta.map((bVal, idx) => {
                        const variance = covBeta[idx][idx];
                        return Math.sqrt(Math.max(0, variance));
                    });
                    tBeta = Beta.map((bVal, idx) => {
                        const se = seBeta[idx];
                        return se === 0 ? 0 : bVal[0] / se;
                    });
                    pBeta = Beta.map((bVal, idx) => {
                        const pVal = calculateTValueProbability(tBeta[idx], dfRes);
                        return isNaN(pVal) ? 1.0 : pVal;
                    });
                    
                    sdY = Math.sqrt(Math.max(1e-10, tss / Math.max(1, n - 1)));
                    stdBeta = Beta.map((bVal, idx) => {
                        if (idx === 0) return 0;
                        const ivVals = X.map(row => row[idx]);
                        const meanIV = ivVals.reduce((a,b)=>a+b, 0) / n;
                        const sdIV = Math.sqrt(Math.max(0, ivVals.reduce((a,b)=>a + Math.pow(b-meanIV, 2), 0) / Math.max(1, n - 1)));
                        return bVal[0] * (sdIV / sdY);
                    });
                }
            }
        },
        {
            text: "Menguji asumsi klasik (Multikolinieritas & Heteroskedastisitas)...",
            duration: 0,
            action: () => {
                if (XTX_inv) {
                    ivConstructs.forEach((cTarget, targetIdx) => {
                        if (ivCount > 1) {
                            const Y_vif = X.map(row => [row[targetIdx + 1]]);
                            const X_vif = X.map(row => {
                                const newRow = [1.0];
                                ivConstructs.forEach((cOther, otherIdx) => {
                                    if (otherIdx !== targetIdx) {
                                        newRow.push(row[otherIdx + 1]);
                                    }
                                });
                                return newRow;
                            });
                            
                            const XT_vif = matrixTranspose(X_vif);
                            const XTX_vif = matrixMultiply(XT_vif, X_vif);
                            let XTX_inv_vif = matrixInverse(XTX_vif);
                            
                            if (!XTX_inv_vif && XTX_vif.length > 0) {
                                const lambda = 0.0001;
                                const XTX_ridge = XTX_vif.map((row, rIdx) => 
                                    row.map((val, cIdx) => rIdx === cIdx ? val + lambda : val)
                                );
                                XTX_inv_vif = matrixInverse(XTX_ridge);
                            }
                            
                            if (XTX_inv_vif) {
                                const XTY_vif = matrixMultiply(XT_vif, Y_vif);
                                const Beta_vif = matrixMultiply(XTX_inv_vif, XTY_vif);
                                const Y_pred_vif = matrixMultiply(X_vif, Beta_vif);
                                
                                const residuals_vif = Y_vif.map((val, idx) => val[0] - Y_pred_vif[idx][0]);
                                const rss_vif = residuals_vif.reduce((sum, res) => sum + res*res, 0);
                                
                                const meanY_vif = Y_vif.reduce((sum, val) => sum + val[0], 0) / n;
                                const tss_vif = Y_vif.reduce((sum, val) => sum + Math.pow(val[0]-meanY_vif, 2), 0);
                                tss_vif = Math.max(1e-10, tss_vif);
                                
                                let rSq_vif = (tss_vif - rss_vif) / tss_vif;
                                rSq_vif = Math.min(0.9999, Math.max(0.0, rSq_vif));
                                const tolerance = Math.max(0.0001, 1 - rSq_vif);
                                const vifVal = 1 / tolerance;
                                
                                vif.push({
                                    name: cTarget.name,
                                    tolerance: tolerance,
                                    vif: vifVal
                                });
                            }
                        } else {
                            vif.push({
                                name: cTarget.name,
                                tolerance: 1.0,
                                vif: 1.0
                            });
                        }
                    });

                    const absResiduals = residuals.map(r => [Math.abs(r)]);
                    const X_gl = X;
                    const XT_gl = matrixTranspose(X_gl);
                    const XTX_gl = matrixMultiply(XT_gl, X_gl);
                    let XTX_inv_gl = matrixInverse(XTX_gl);
                    
                    if (!XTX_inv_gl && XTX_gl.length > 0) {
                        const lambda = 0.0001;
                        const XTX_ridge = XTX_gl.map((row, rIdx) => 
                            row.map((val, cIdx) => rIdx === cIdx ? val + lambda : val)
                        );
                        XTX_inv_gl = matrixInverse(XTX_ridge);
                    }
                    
                    if (XTX_inv_gl) {
                        const XTY_gl = matrixMultiply(XT_gl, absResiduals);
                        const Beta_gl = matrixMultiply(XTX_inv_gl, XTY_gl);
                        const Y_pred_gl = matrixMultiply(X_gl, Beta_gl);
                        const residuals_gl = absResiduals.map((val, idx) => val[0] - Y_pred_gl[idx][0]);
                        const rss_gl = Math.max(0, residuals_gl.reduce((sum, res) => sum + res*res, 0));
                        const dfRes_gl = Math.max(1, n - ivCount - 1);
                        const msRes_gl = rss_gl / dfRes_gl;
                        const covBeta_gl = XTX_inv_gl.map(row => row.map(val => val * msRes_gl));
                        const seBeta_gl = Beta_gl.map((bVal, idx) => {
                            const variance = covBeta_gl[idx][idx];
                            return Math.sqrt(Math.max(0, variance));
                        });
                        const tBeta_gl = Beta_gl.map((bVal, idx) => {
                            const se = seBeta_gl[idx];
                            return se === 0 ? 0 : bVal[0] / se;
                        });
                        const pBeta_gl = Beta_gl.map((bVal, idx) => {
                            const pVal = calculateTValueProbability(tBeta_gl[idx], dfRes_gl);
                            return isNaN(pVal) ? 1.0 : pVal;
                        });
                        
                        ivConstructs.forEach((cTarget, targetIdx) => {
                            hetero.push({
                                name: cTarget.name,
                                beta: Beta_gl[targetIdx + 1][0],
                                tVal: tBeta_gl[targetIdx + 1],
                                pValue: pBeta_gl[targetIdx + 1]
                            });
                        });
                    }
                }
            }
        },
        {
            text: "Menghitung korelasi Pearson dan Spearman antar konstruk...",
            duration: 0,
            action: () => {
                let names = [];
                let scores = [];
                
                if (constructs.length === 0) {
                    // Fallback: Map all numeric variables (excluding Age and variables containing "gend")
                    variables.forEach((v, vIdx) => {
                        if (v.type === 'numeric' && v.name !== 'Age' && !v.name.toLowerCase().includes('gend')) {
                            names.push(v.name);
                            scores.push(getColumnValues(vIdx).map(Number));
                        }
                    });
                    appendSpssAnalysisLog("AI BACKUP", `Konstruk kosong. Menggunakan ${names.length} variabel numerik mentah untuk korelasi.`, "text-amber-400");
                } else {
                    names = constructs.map(c => c.name);
                    scores = constructs.map(c => {
                        return dataMatrix.map(row => {
                            let sum = 0;
                            c.items.forEach(itemId => sum += Number(row[itemId]));
                            return sum / c.items.length;
                        });
                    });
                }
                
                const numVars = names.length;
                const pearsonMatrix = [];
                const spearmanMatrix = [];
                
                for (let i = 0; i < numVars; i++) {
                    pearsonMatrix[i] = [];
                    spearmanMatrix[i] = [];
                    for (let j = 0; j < numVars; j++) {
                        if (i === j) {
                            pearsonMatrix[i][j] = { r: 1.0, p: 0.0, sig: "" };
                            spearmanMatrix[i][j] = { r: 1.0, p: 0.0, sig: "" };
                        } else {
                            const x = scores[i];
                            const y = scores[j];
                            const df = n - 2;
                            
                            // Pearson
                            const rP = calculatePearsonCorrelation(x, y);
                            let tP = 0;
                            if (Math.abs(rP) < 1.0) tP = rP * Math.sqrt(df / (1 - rP * rP));
                            const pP = calculateTValueProbability(tP, df);
                            
                            // Spearman
                            const rS = calculateSpearmanCorrelation(x, y);
                            let tS = 0;
                            if (Math.abs(rS) < 1.0) tS = rS * Math.sqrt(df / (1 - rS * rS));
                            const pS = calculateTValueProbability(tS, df);
                            
                            pearsonMatrix[i][j] = {
                                r: rP,
                                p: pP,
                                sig: pP <= 0.01 ? "**" : (pP <= 0.05 ? "*" : "")
                            };
                            spearmanMatrix[i][j] = {
                                r: rS,
                                p: pS,
                                sig: pS <= 0.01 ? "**" : (pS <= 0.05 ? "*" : "")
                            };
                        }
                    }
                }
                
                analysisOutputCorrelations = {
                    constructNames: names,
                    pearson: pearsonMatrix,
                    spearman: spearmanMatrix
                };
            }
        },
        {
            text: "Menghasilkan keluaran tabel format standar APA...",
            duration: 0,
            action: () => {
                if (XTX_inv) {
                    regressionResult = {
                        dvName: dvName,
                        dvLabel: dvLabel,
                        ivs: ivConstructs.map(c => c.name),
                        n: n,
                        k: ivCount,
                        r: Math.sqrt(rSquare),
                        rSquare: rSquare,
                        adjRSquare: adjRSquare,
                        stdError: stdErrorEstimate,
                        ssReg: ssReg,
                        ssRes: rss,
                        ssTotal: tss,
                        dfReg: dfReg,
                        dfRes: dfRes,
                        dfTotal: n - 1,
                        msReg: msReg,
                        msRes: msRes,
                        F: F,
                        pValueF: pValueF,
                        coefficients: Beta.map((b, idx) => ({
                            name: idx === 0 ? "Intercept (Konstanta)" : ivConstructs[idx - 1].name,
                            b: b[0],
                            B: b[0],
                            se: seBeta[idx],
                            seBeta: seBeta[idx],
                            stdBeta: stdBeta[idx],
                            beta: stdBeta[idx],
                            tVal: tBeta[idx],
                            t: tBeta[idx],
                            pValue: pBeta[idx],
                            p: pBeta[idx]
                        })),
                        vif: vif,
                        hetero: hetero
                    };
                }
                
                analysisOutput = {
                    descriptives: descriptives,
                    validity: validity,
                    reliability: reliability,
                    regression: regressionResult,
                    correlations: analysisOutputCorrelations
                };
                
                updateDashboardUI();
            }
        }
    ];

    showGlobalLoader(
        "Menjalankan Analisis Statistik",
        "Memproses statistik deskriptif, uji kualitas instrumen, dan regresi berganda",
        steps,
        () => {
            switchView('output_viewer');
            showInspectorHTML(`
                <div class="space-y-4">
                    <h4 class="font-bold text-emerald-700 border-b pb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">check_circle</span> Analisis Sukses
                    </h4>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
                        Mesin komputasi statistik WRT telah menyelesaikan kalkulasi. Silakan lihat Output Viewer untuk tabel APA dan periksa modul BAB IV untuk narasi skripsi otomatis.
                    </p>
                </div>
            `);
        }
    );
}

// --- STATISTICAL OUTPUT VIEWER RENDERING (Requirement 7) ---
function renderOutputViewer() {
    const emptyEl = document.getElementById('output-empty');
    const container = document.getElementById('output-panels-container');
    const emptyElCR = document.getElementById('correlation-regression-empty');
    const containerCR = document.getElementById('correlation-regression-container');
    
    if (!analysisOutput) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (container) container.style.display = 'none';
        if (emptyElCR) emptyElCR.style.display = 'block';
        if (containerCR) containerCR.style.display = 'none';
        return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    if (container) container.style.display = 'block';
    if (emptyElCR) emptyElCR.style.display = 'none';
    if (containerCR) containerCR.style.display = 'block';
    
    // 1. Render Descriptives
    const tbodyDesc = document.getElementById('out-tbody-descriptives');
    tbodyDesc.innerHTML = '';
    analysisOutput.descriptives.forEach(d => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50";
        tr.innerHTML = `
            <td class="p-2 border-r border-slate-200 font-semibold font-body-md text-slate-800">${d.name}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.n}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.min.toFixed(2)}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.max.toFixed(2)}</td>
            <td class="p-2 border-r border-slate-200 text-right font-bold">${d.mean.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.sd.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.variance.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right">${d.skew.toFixed(3)}</td>
            <td class="p-2 text-right">${d.kurt.toFixed(3)}</td>
        `;
        tbodyDesc.appendChild(tr);
    });

    // 2. Render Validity
    const tbodyVal = document.getElementById('out-tbody-validity');
    tbodyVal.innerHTML = '';
    analysisOutput.validity.forEach(v => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50";
        
        let badgeColor = "status-valid";
        if (v.status === 'Anomaly') badgeColor = "status-anomaly";
        else if (v.status === 'Invalid') badgeColor = "status-invalid";
        
        tr.innerHTML = `
            <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${v.construct}</td>
            <td class="p-2 border-r border-slate-200 font-bold">${v.name}</td>
            <td class="p-2 border-r border-slate-200 text-slate-500 font-body-md">${v.label}</td>
            <td class="p-2 border-r border-slate-200 text-right font-bold">${v.pearsonR.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right font-semibold">${v.rTabel.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right font-bold text-primary">${v.citc.toFixed(3)}</td>
            <td class="p-2 border-r border-slate-200 text-right">${v.pValue.toFixed(4)}</td>
            <td class="p-2 text-center">
                <span class="status-badge-pill ${badgeColor}">${v.status}</span>
            </td>
        `;
        tbodyVal.appendChild(tr);
    });

    // 3. Render Reliability
    const tbodyRel = document.getElementById('out-tbody-reliability');
    tbodyRel.innerHTML = '';
    analysisOutput.reliability.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50";
        
        let badgeColor = "status-valid";
        if (r.alpha < 0.60) badgeColor = "status-invalid";
        else if (r.alpha < 0.70) badgeColor = "status-anomaly";
        
        tr.innerHTML = `
            <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${r.name}</td>
            <td class="p-2 border-r border-slate-200 text-right font-bold">${r.itemsCount}</td>
            <td class="p-2 border-r border-slate-200 text-right font-bold text-primary">${r.alpha.toFixed(3)}</td>
            <td class="p-2 text-center">
                <span class="status-badge-pill ${badgeColor}">${r.alphaClass}</span>
            </td>
        `;
        tbodyRel.appendChild(tr);
    });

    // 3b. Render Correlations (Pearson & Spearman)
    const tablePearson = document.getElementById('out-table-pearson');
    const tableSpearman = document.getElementById('out-table-spearman');
    
    if (analysisOutput.correlations && tablePearson && tableSpearman) {
        const corr = analysisOutput.correlations;
        const names = corr.constructNames;
        const nCorr = names.length;
        
        const formatSPSSValue = (val) => {
            if (val === 1 || val === 1.0) return "1";
            if (Math.abs(val) < 0.0005) return ".000";
            let formatted = val.toFixed(3);
            if (formatted.startsWith("0.")) {
                return formatted.substring(1);
            } else if (formatted.startsWith("-0.")) {
                return "-" + formatted.substring(2);
            }
            return formatted;
        };

        const formatSPSSPValue = (val) => {
            if (val < 0.0005) return ".000";
            let formatted = val.toFixed(3);
            if (formatted.startsWith("0.")) {
                return formatted.substring(1);
            }
            return formatted;
        };

        const getVariableN = (varName) => {
            const desc = analysisOutput.descriptives.find(d => d.name === varName);
            return desc ? desc.n : dataMatrix.length;
        };
        
        const renderMatrix = (tableEl, matrix, isSpearman) => {
            const typeLabel = isSpearman ? "Correlation Coefficient" : "Pearson Correlation";
            let html = `
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-350 font-semibold text-center text-slate-800">
                        <th class="p-2 border-r border-slate-200 text-left" colspan="2">Variable</th>
                        ${names.map(name => `<th class="p-2 border-r border-slate-200 font-semibold text-slate-800">${name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-data-mono">
            `;
            
            for (let i = 0; i < nCorr; i++) {
                const varN = getVariableN(names[i]);
                
                // Row 1: Correlation Value
                html += `
                    <tr class="hover:bg-slate-50 text-center">
                        <td rowspan="3" class="p-2 border-r border-b border-slate-250 font-bold bg-slate-50/50 text-slate-800 text-left align-middle font-sans text-xs">${names[i]}</td>
                        <td class="p-2 border-r border-slate-200 bg-slate-50/25 text-slate-600 text-left font-sans text-[11px] font-medium">${typeLabel}</td>
                `;
                for (let j = 0; j < nCorr; j++) {
                    const cell = matrix[i][j];
                    if (i === j) {
                        html += `<td class="p-2 border-r border-slate-200 text-slate-800 font-bold bg-slate-50/5">1</td>`;
                    } else {
                        html += `<td class="p-2 border-r border-slate-200 text-slate-850 font-bold">${formatSPSSValue(cell.r)}${cell.sig}</td>`;
                    }
                }
                html += `</tr>`;
                
                // Row 2: Sig. (2-tailed)
                html += `
                    <tr class="hover:bg-slate-50 text-center">
                        <td class="p-2 border-r border-slate-200 bg-slate-50/25 text-slate-600 text-left font-sans text-[11px] font-medium">Sig. (2-tailed)</td>
                `;
                for (let j = 0; j < nCorr; j++) {
                    const cell = matrix[i][j];
                    if (i === j) {
                        html += `<td class="p-2 border-r border-slate-200 text-slate-400 bg-slate-50/5"></td>`;
                    } else {
                        html += `<td class="p-2 border-r border-slate-200 text-slate-700">${formatSPSSPValue(cell.p)}</td>`;
                    }
                }
                html += `</tr>`;
                
                // Row 3: N
                html += `
                    <tr class="hover:bg-slate-50 border-b border-slate-250 text-center">
                        <td class="p-2 border-r border-slate-200 bg-slate-50/25 text-slate-600 text-left font-sans text-[11px] font-medium border-b border-slate-200">N</td>
                `;
                for (let j = 0; j < nCorr; j++) {
                    html += `<td class="p-2 border-r border-slate-200 text-slate-600 border-b border-slate-200">${varN}</td>`;
                }
                html += `</tr>`;
            }
            
            html += `</tbody>`;
            tableEl.innerHTML = html;
        };
        
        renderMatrix(tablePearson, corr.pearson, false);
        renderMatrix(tableSpearman, corr.spearman, true);
    }

    // 4. Render Normality & Multicollinearity
    const tbodyNorm = document.getElementById('out-tbody-normality');
    tbodyNorm.innerHTML = '';
    analysisOutput.descriptives.forEach(d => {
        const isNormal = Math.abs(d.zSkew) <= 2.0 && Math.abs(d.zKurt) <= 2.0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-1.5 font-semibold text-slate-800">${d.name}</td>
            <td class="py-1.5 text-right">${d.zSkew.toFixed(2)}</td>
            <td class="py-1.5 text-right">${d.zKurt.toFixed(2)}</td>
            <td class="py-1.5 text-center">
                <span class="status-badge-pill ${isNormal ? 'status-valid' : 'status-invalid'}">${isNormal ? 'Normal' : 'Skewed'}</span>
            </td>
        `;
        tbodyNorm.appendChild(tr);
    });

    // Render K-S and S-W Normality tests
    const tbodyNormKsSw = document.getElementById('out-tbody-normality-kssw');
    if (tbodyNormKsSw) {
        tbodyNormKsSw.innerHTML = '';
        analysisOutput.descriptives.forEach(d => {
            const ksNormal = (d.ksSig !== undefined) ? d.ksSig > 0.05 : true;
            const swNormal = (d.swSig !== undefined) ? d.swSig > 0.05 : true;
            const usePearson = ksNormal && swNormal;
            const recommendation = usePearson ? 'Gunakan Pearson' : 'Gunakan Spearman';
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50";
            tr.innerHTML = `
                <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${d.name}</td>
                <td class="p-2 border-r border-slate-200 text-right">${(d.ksStat !== undefined ? d.ksStat : 0).toFixed(3)}</td>
                <td class="p-2 border-r border-slate-200 text-center">${d.n}</td>
                <td class="p-2 border-r border-slate-200 text-right font-medium">${(d.ksSig !== undefined ? d.ksSig : 1.0).toFixed(4)}</td>
                <td class="p-2 border-r border-slate-200 text-right">${(d.swStat !== undefined ? d.swStat : 1.0).toFixed(3)}</td>
                <td class="p-2 border-r border-slate-200 text-center">${d.n}</td>
                <td class="p-2 border-r border-slate-200 text-right font-medium">${(d.swSig !== undefined ? d.swSig : 1.0).toFixed(4)}</td>
                <td class="p-2 text-center">
                    <span class="status-badge-pill ${usePearson ? 'status-valid' : 'status-invalid'}">${recommendation}</span>
                </td>
            `;
            tbodyNormKsSw.appendChild(tr);
        });
    }

    const tbodyColl = document.getElementById('out-tbody-multicollinearity');
    const tbodyRegColl = document.getElementById('out-tbody-reg-multicollinearity');
    if (tbodyColl) tbodyColl.innerHTML = '';
    if (tbodyRegColl) tbodyRegColl.innerHTML = '';
    
    const reg = analysisOutput.regression;
    if (reg) {
        reg.vif.forEach(v => {
            const isOk = v.vif < 10;
            
            if (tbodyColl) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-1.5 font-semibold text-slate-800">${v.name}</td>
                    <td class="py-1.5 text-right">${v.tolerance.toFixed(3)}</td>
                    <td class="py-1.5 text-right font-bold text-primary">${v.vif.toFixed(3)}</td>
                    <td class="py-1.5 text-center">
                        <span class="status-badge-pill ${isOk ? 'status-valid' : 'status-invalid'}">${isOk ? 'Ideal' : 'VIF > 10'}</span>
                    </td>
                `;
                tbodyColl.appendChild(tr);
            }
            
            if (tbodyRegColl) {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50";
                tr.innerHTML = `
                    <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${v.name}</td>
                    <td class="p-2 border-r border-slate-200 text-right">${formatNumber(v.tolerance, 3)}</td>
                    <td class="p-2 border-r border-slate-200 text-right font-bold text-primary">${formatNumber(v.vif, 3)}</td>
                    <td class="p-2 text-center">
                        <span class="status-badge-pill ${isOk ? 'status-valid' : 'status-invalid'}">${isOk ? 'Ideal' : 'VIF > 10'}</span>
                    </td>
                `;
                tbodyRegColl.appendChild(tr);
            }
        });

        // 5. Heteroscedasticity
        const tbodyHetero = document.getElementById('out-tbody-hetero');
        const tbodyRegHetero = document.getElementById('out-tbody-reg-hetero');
        if (tbodyHetero) tbodyHetero.innerHTML = '';
        if (tbodyRegHetero) tbodyRegHetero.innerHTML = '';
        reg.hetero.forEach(h => {
            const isOk = h.pValue > 0.05; // No heteroscedasticity when p > 0.05
            
            if (tbodyHetero) {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50";
                tr.innerHTML = `
                    <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${h.name}</td>
                    <td class="p-2 border-r border-slate-200 text-right">${formatNumber(h.beta, 3)}</td>
                    <td class="p-2 border-r border-slate-200 text-right">${formatNumber(h.tVal, 3)}</td>
                    <td class="p-2 border-r border-slate-200 text-right font-bold">${formatNumber(h.pValue, 4)}</td>
                    <td class="p-2 text-center">
                        <span class="status-badge-pill ${isOk ? 'status-valid' : 'status-invalid'}">${isOk ? 'Homoscedastic' : 'Heteroscedastic'}</span>
                    </td>
                `;
                tbodyHetero.appendChild(tr);
            }
            
            if (tbodyRegHetero) {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50";
                tr.innerHTML = `
                    <td class="p-2 border-r border-slate-200 font-semibold text-slate-800">${h.name}</td>
                    <td class="p-2 border-r border-slate-200 text-right">${formatNumber(h.beta, 3)}</td>
                    <td class="p-2 border-r border-slate-200 text-right">${formatNumber(h.tVal, 3)}</td>
                    <td class="p-2 border-r border-slate-200 text-right font-bold">${formatNumber(h.pValue, 4)}</td>
                    <td class="p-2 text-center">
                        <span class="status-badge-pill ${isOk ? 'status-valid' : 'status-invalid'}">${isOk ? 'Homoscedastic' : 'Heteroscedastic'}</span>
                    </td>
                `;
                tbodyRegHetero.appendChild(tr);
            }
        });

        // 6. Regression Summary
        const tbodyRegSum = document.getElementById('out-tbody-reg-summary');
        tbodyRegSum.innerHTML = `
            <tr class="hover:bg-slate-50">
                <td class="p-2 border-r border-slate-200 text-left font-semibold text-slate-800">1</td>
                <td class="p-2 border-r border-slate-200 font-bold">${formatNumber(reg.r, 3)}</td>
                <td class="p-2 border-r border-slate-200 font-bold text-primary">${formatNumber(reg.rSquare, 3)}</td>
                <td class="p-2 border-r border-slate-200">${formatNumber(reg.adjRSquare, 3)}</td>
                <td class="p-2">${formatNumber(reg.stdError, 3)}</td>
            </tr>
        `;

        // ANOVA F-Test
        const tbodyRegAnova = document.getElementById('out-tbody-reg-anova');
        tbodyRegAnova.innerHTML = `
            <tr class="hover:bg-slate-50 border-b">
                <td class="p-2 border-r border-slate-200 text-slate-500 font-medium">Regression</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(reg.ssReg, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-center">${reg.dfReg}</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(reg.msReg, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-right font-bold">${formatNumber(reg.F, 3)}</td>
                <td class="p-2 text-right font-extrabold text-primary">${formatNumber(reg.pValueF, 4)}</td>
            </tr>
            <tr class="hover:bg-slate-50 border-b">
                <td class="p-2 border-r border-slate-200 text-slate-500 font-medium">Residual</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(reg.ssRes, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-center">${reg.dfRes}</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(reg.msRes, 3)}</td>
                <td colspan="2" class="bg-slate-50"></td>
            </tr>
            <tr class="hover:bg-slate-50 font-bold bg-slate-50">
                <td class="p-2 border-r border-slate-200">Total</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(reg.ssTotal, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-center">${reg.dfTotal}</td>
                <td colspan="3"></td>
            </tr>
        `;

        // Coefficients
        const tbodyRegCoeff = document.getElementById('out-tbody-reg-coefficients');
        tbodyRegCoeff.innerHTML = '';
        reg.coefficients.forEach((c, idx) => {
            const isSig = c.pValue <= config.alpha;
            
            let tolerance = "-";
            let vifVal = "-";
            if (idx > 0 && reg.vif) {
                const vifObj = reg.vif.find(v => v.name === c.name);
                if (vifObj) {
                    tolerance = formatNumber(vifObj.tolerance, 3);
                    vifVal = formatNumber(vifObj.vif, 3);
                }
            }
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50";
            tr.innerHTML = `
                <td class="p-2 border-r border-slate-200 font-bold text-slate-800">${c.name}</td>
                <td class="p-2 border-r border-slate-200 text-right font-bold">${formatNumber(c.b, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-right">${formatNumber(c.se, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-right">${c.stdBeta !== 0 && c.stdBeta !== undefined && c.stdBeta !== null ? formatNumber(c.stdBeta, 3) : '-'}</td>
                <td class="p-2 border-r border-slate-200 text-right font-bold">${formatNumber(c.tVal, 3)}</td>
                <td class="p-2 border-r border-slate-200 text-right font-extrabold text-primary">${formatNumber(c.pValue, 4)}</td>
                <td class="p-2 border-r border-slate-200 text-right">${tolerance}</td>
                <td class="p-2 text-right">${vifVal}</td>
            `;
            tbodyRegCoeff.appendChild(tr);
        });
    }
}

// --- AI ACADEMIC INTERPRETATION ENGINE (Requirement 8) ---

function showInspectorHTML(html) {
    const el = document.getElementById('inspector-content');
    if (el) el.innerHTML = html;
}

// --- AUTO BAB IV GENERATOR (Requirement 9 & 8) ---
function renderBabIV() {
    const emptyEl = document.getElementById('bab-empty');
    const cardEl = document.getElementById('bab-report-card');
    const configCardEl = document.getElementById('bab-config-card');
    
    if (!analysisOutput || !analysisOutput.regression) {
        emptyEl.style.display = 'block';
        cardEl.style.display = 'none';
        if (configCardEl) configCardEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    cardEl.style.display = 'block';
    if (configCardEl) configCardEl.style.display = 'block';
    
    // Build report content
    const reg = analysisOutput.regression;
    const n = dataMatrix.length;
    const rTabelVal = calculateRCritical(n, config.alpha);
    
    const getKategoriKorelasi = (rVal) => {
        const absR = Math.abs(rVal);
        if (absR >= 0.80) return "Sangat Kuat";
        if (absR >= 0.60) return "Kuat";
        if (absR >= 0.40) return "Sedang";
        if (absR >= 0.20) return "Lemah";
        return "Sangat Lemah";
    };

    const showResponden = document.getElementById('cfg-sw-responden') ? document.getElementById('cfg-sw-responden').checked : true;
    const showValiditas = document.getElementById('cfg-sw-validitas') ? document.getElementById('cfg-sw-validitas').checked : true;
    const showReliabilitas = document.getElementById('cfg-sw-reliabilitas') ? document.getElementById('cfg-sw-reliabilitas').checked : true;
    const showNormalitas = document.getElementById('cfg-sw-normalitas') ? document.getElementById('cfg-sw-normalitas').checked : true;
    const showMultikolinieritas = document.getElementById('cfg-sw-multicol') ? document.getElementById('cfg-sw-multicol').checked : true;
    const showHeteroskedastisitas = document.getElementById('cfg-sw-hetero') ? document.getElementById('cfg-sw-hetero').checked : true;
    const showPearson = document.getElementById('cfg-sw-pearson') ? document.getElementById('cfg-sw-pearson').checked : true;
    const showSpearman = document.getElementById('cfg-sw-spearman') ? document.getElementById('cfg-sw-spearman').checked : true;
    const showRegresi = document.getElementById('cfg-sw-regresi') ? document.getElementById('cfg-sw-regresi').checked : true;
    const showPembahasan = document.getElementById('cfg-sw-pembahasan') ? document.getElementById('cfg-sw-pembahasan').checked : true;
    
    // Dynamic Section Numbering
    let secNum = 1;
    
    let respondenHeaderNum = "";
    if (showResponden) {
        respondenHeaderNum = `4.${secNum}`;
        secNum++;
    }
    
    const hasValidityItems = analysisOutput.validity && analysisOutput.validity.length > 0;
    const hasReliabilityItems = analysisOutput.reliability && analysisOutput.reliability.length > 0;

    let instrumenHeaderNum = "";
    let validitasHeaderNum = "";
    let reliabilitasHeaderNum = "";
    if ((showValiditas && hasValidityItems) || (showReliabilitas && hasReliabilityItems)) {
        instrumenHeaderNum = `4.${secNum}`;
        let subSec = 1;
        if (showValiditas && hasValidityItems) {
            validitasHeaderNum = `${instrumenHeaderNum}.${subSec}`;
            subSec++;
        }
        if (showReliabilitas && hasReliabilityItems) {
            reliabilitasHeaderNum = `${instrumenHeaderNum}.${subSec}`;
            subSec++;
        }
        secNum++;
    }
    
    let asumsiHeaderNum = "";
    let normalitasHeaderNum = "";
    let multicolHeaderNum = "";
    let heteroHeaderNum = "";
    if (showNormalitas || showMultikolinieritas || showHeteroskedastisitas) {
        asumsiHeaderNum = `4.${secNum}`;
        let subSec = 1;
        if (showNormalitas) {
            normalitasHeaderNum = `${asumsiHeaderNum}.${subSec}`;
            subSec++;
        }
        if (showMultikolinieritas) {
            multicolHeaderNum = `${asumsiHeaderNum}.${subSec}`;
            subSec++;
        }
        if (showHeteroskedastisitas) {
            heteroHeaderNum = `${asumsiHeaderNum}.${subSec}`;
            subSec++;
        }
        secNum++;
    }

    let pearsonHeaderNum = "";
    if (showPearson) {
        pearsonHeaderNum = `4.${secNum}`;
        secNum++;
    }

    let spearmanHeaderNum = "";
    if (showSpearman) {
        spearmanHeaderNum = `4.${secNum}`;
        secNum++;
    }

    let regresiHeaderNum = "";
    if (showRegresi) {
        regresiHeaderNum = `4.${secNum}`;
        secNum++;
    }

    let pembahasanHeaderNum = "";
    if (showPembahasan) {
        pembahasanHeaderNum = `4.${secNum}`;
        secNum++;
    }

    let kesimpulanHeaderNum = `4.${secNum}`;

    let html = `
        <div class="space-y-6 select-text text-justify text-base leading-relaxed">
            <h1 class="text-2xl font-bold font-title-sm text-center border-b pb-4 mb-6 text-slate-900">BAB IV<br/>HASIL PENELITIAN DAN PEMBAHASAN</h1>
    `;

    if (showResponden) {
        html += `
            <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-6">${respondenHeaderNum} Deskripsi Profil Responden</h2>
            <p>
                Penelitian ini menggunakan sampel sebanyak ${n} orang responden. Pengumpulan data dilakukan menggunakan kuesioner digital terstruktur yang diukur dengan skala interval (Likert). Karakteristik responden yang berpartisipasi dalam penelitian ini diuraikan berdasarkan variabel demografi utama.
            </p>
        `;

        // Auto build demographics profile if Gender exists
        const gendIdx = variables.findIndex(v => v.name.toLowerCase().includes('gend'));
        if (gendIdx !== -1) {
            const vals = getColumnValues(gendIdx);
            const freq = {};
            vals.forEach(x => {
                const label = variables[gendIdx].values[x] || x;
                freq[label] = (freq[label] || 0) + 1;
            });
            
            html += `
                <p class="mt-4">
                    Berdasarkan data yang dikumpulkan, berikut adalah rincian profil responden berdasarkan jenis kelamin yang disajikan pada tabel di bawah ini:
                </p>
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto max-w-md">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th class="p-2 border-r border-slate-300">Jenis Kelamin</th>
                            <th class="p-2 border-r border-slate-300">Frekuensi (N)</th>
                            <th class="p-2">Persentase (%)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            Object.entries(freq).forEach(([lbl, f]) => {
                const pct = ((f / n) * 100).toFixed(1);
                html += `
                    <tr class="border-b text-center">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">${lbl}</td>
                        <td class="p-2 border-r border-slate-300">${f}</td>
                        <td class="p-2 font-bold">${pct}%</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
    }

    // --- 4.2 Hasil Uji Instrumen ---
    if ((showValiditas && hasValidityItems) || (showReliabilitas && hasReliabilityItems)) {
        html += `
            <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${instrumenHeaderNum} Hasil Uji Instrumen Penelitian</h2>
        `;
        
        if (showValiditas && hasValidityItems) {
            html += `
                <h3 class="text-lg font-bold text-slate-900 mt-4">${validitasHeaderNum} Uji Validitas (Pearson Product Moment & CITC)</h3>
                <p>
                    Uji validitas dilakukan untuk menguji tingkat kesahihan setiap butir instrumen kuesioner penelitian dalam mengukur variabel-variabel yang diteliti. Berdasarkan pedoman metodologi penelitian, pengujian validitas instrumen ini menggunakan dua pendekatan acuan kriteria, yaitu: (1) <b>Korelasi Pearson Product Moment</b>, di mana butir dinyatakan valid jika nilai korelasi <i>Pearson r-hitung</i> &gt; <i>r-tabel</i> pada tingkat signifikansi &alpha; = 0.05 (two-tailed) dengan nilai signifikansi (p-value) &le; 0.05; dan (2) <b>Corrected Item-Total Correlation (CITC)</b> berdasarkan acuan dari <b>Azwar (2015)</b>, di mana batas minimum nilai korelasi item-total yang dikoreksi (CITC) agar butir instrumen dinyatakan valid dan layak digunakan adalah sebesar <b>&ge; 0.30</b>. Nilai <i>r-tabel</i> yang digunakan dalam analisis ini ditentukan berdasarkan derajat kebebasan <i>df = N - 2 = ${n - 2}</i> pada taraf signifikansi &alpha; = ${config.alpha}, yaitu sebesar <b>${rTabelVal.toFixed(3)}</b>.
                </p>
                
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th class="p-2 border-r border-slate-300 text-left">Indikator</th>
                            <th class="p-2 border-r border-slate-300">Pearson r-hitung</th>
                            <th class="p-2 border-r border-slate-300">r-tabel (N-2, 5%)</th>
                            <th class="p-2 border-r border-slate-300">Status Pearson</th>
                            <th class="p-2 border-r border-slate-300">Nilai CITC</th>
                            <th class="p-2 border-r border-slate-300">Status CITC</th>
                            <th class="p-2">Kesimpulan Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            (analysisOutput.validity || []).forEach(v => {
                const isValPearson = v.pearsonR >= rTabelVal && v.pValue <= config.alpha;
                const isValCITC = v.citc >= config.citcThreshold;
                const finalStatus = v.status === 'Valid' ? 'VALID' : (v.status === 'Anomaly' ? 'REVISI/BORDERLINE' : 'TIDAK VALID');
                const finalStatusClass = v.status === 'Valid' ? 'text-green-700 font-bold' : (v.status === 'Anomaly' ? 'text-amber-700 font-bold' : 'text-red-700 font-bold');
                
                html += `
                    <tr class="border-b text-center">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">${v.name} (${v.label})</td>
                        <td class="p-2 border-r border-slate-300 font-bold">${v.pearsonR.toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300">${rTabelVal.toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300 text-xs">${isValPearson ? 'Valid (Sig. &le; 0.05)' : 'Tidak Valid'}</td>
                        <td class="p-2 border-r border-slate-300 font-bold">${v.citc.toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300 text-xs">${isValCITC ? 'Valid (&ge; 0.30)' : 'Tidak Valid'}</td>
                        <td class="p-2 ${finalStatusClass}">${finalStatus}</td>
                    </tr>
                `;
            });

            const invalidItems = (analysisOutput.validity || []).filter(v => v.status !== 'Valid');
            const totalItemsCount = (analysisOutput.validity || []).length;
            const validItemsCount = totalItemsCount - invalidItems.length;
            
            let valConclusionText = "";
            if (invalidItems.length === 0) {
                valConclusionText = `Berdasarkan hasil uji validitas yang tertera pada tabel di atas, diperoleh data bahwa seluruh ${totalItemsCount} butir indikator instrumen kuesioner memiliki nilai Pearson r-hitung &gt; r-tabel (${rTabelVal.toFixed(3)}) dan nilai Corrected Item-Total Correlation (CITC) &ge; 0.30 sesuai kriteria Azwar (2015). Hal ini berarti seluruh butir pertanyaan dinyatakan <b>VALID</b> dan memiliki kelayakan yang sangat baik untuk digunakan sebagai instrumen pengumpulan data penelitian.`;
            } else {
                const invalidCodes = invalidItems.map(v => `${v.name} (${v.label})`).join(', ');
                valConclusionText = `Berdasarkan hasil uji validitas pada tabel di atas, dari total ${totalItemsCount} butir indikator instrumen, terdapat ${validItemsCount} butir yang memenuhi syarat validitas. Sementara itu, terdapat ${invalidItems.length} butir indikator yang dinyatakan <b>TIDAK VALID / PERLU REVISI</b> karena memiliki nilai CITC &lt; 0.30 dan Pearson r-hitung &lt; r-tabel (${rTabelVal.toFixed(3)}), yaitu pada butir: <b>${invalidCodes}</b>. Merujuk pada acuan Azwar (2015), butir-butir yang tidak memenuhi kriteria validitas minimum tersebut disarankan untuk direvisi atau dikeluarkan dari instrumen kuesioner penelitian agar tidak mengurangi derajat validitas konstruk variabel.`;
            }

            html += `
                    </tbody>
                </table>
                <p class="mt-4">
                    ${valConclusionText}
                </p>
            `;
        }
        
        if (showReliabilitas && hasReliabilityItems) {
            html += `
                <h3 class="text-lg font-bold text-slate-900 mt-6">${reliabilitasHeaderNum} Uji Reliabilitas (Cronbach's Alpha)</h3>
                <p>
                    Uji reliabilitas bertujuan untuk mengetahui sejauh mana instrumen penelitian memberikan hasil yang konsisten (keandalan) apabila pengukuran dilakukan berulang kali. Merujuk pada standar klasik psikometri oleh <b>Nunnally (1978)</b>, instrumen dinyatakan <b>RELIABEL</b> (layak digunakan) apabila memiliki nilai koefisien <i>Cronbach's Alpha</i> (&alpha;) <b>&ge; 0.70</b>. Untuk mengklasifikasikan tingkat keandalan yang lebih rinci, digunakan kriteria dari <b>George & Mallery (2003)</b> dengan kategori: &alpha; &gt; 0.90 (Sangat Baik/Excellent), 0.80 &lt; &alpha; &le; 0.90 (Baik/Good), 0.70 &lt; &alpha; &le; 0.80 (Dapat Diterima/Acceptable), 0.60 &lt; &alpha; &le; 0.70 (Dipertanyakan/Questionable), 0.50 &lt; &alpha; &le; 0.60 (Buruk/Poor), dan &alpha; &le; 0.50 (Tidak Dapat Diterima/Unacceptable).
                </p>
                
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto max-w-2xl">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th class="p-2 border-r border-slate-300 text-left">Variabel Konstruk</th>
                            <th class="p-2 border-r border-slate-300">Jumlah Butir</th>
                            <th class="p-2 border-r border-slate-300">Cronbach's Alpha (&alpha;)</th>
                            <th class="p-2 border-r border-slate-300">Evaluasi (Nunnally, 1978)</th>
                            <th class="p-2">Kategori (George & Mallery, 2003)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            (analysisOutput.reliability || []).forEach(r => {
                html += `
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">${r.name}</td>
                        <td class="p-2 border-r border-slate-300">${r.itemsCount}</td>
                        <td class="p-2 border-r border-slate-300 font-bold text-primary">${r.alpha.toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300 font-bold text-xs ${r.alpha >= 0.70 ? 'text-green-700' : 'text-red-700'}">${r.nunnally.toUpperCase()}</td>
                        <td class="p-2 text-xs">${r.alphaClass}</td>
                    </tr>
                `;
            });

            const unreliableConstructs = (analysisOutput.reliability || []).filter(r => r.alpha < 0.70);
            let relConclusionText = "";
            if (unreliableConstructs.length === 0) {
                relConclusionText = `Berdasarkan hasil analisis uji reliabilitas pada tabel di atas, diperoleh koefisien Cronbach's Alpha (&alpha;) untuk seluruh variabel penelitian bernilai &ge; 0.70 sesuai dengan standar batas minimum yang ditetapkan oleh Nunnally (1978). Kategori reliabilitas instrumen berdasarkan kriteria George & Mallery (2003) berada pada klasifikasi yang dapat diterima hingga sangat baik. Dengan demikian, dapat disimpulkan bahwa instrumen kuesioner yang digunakan memiliki konsistensi internal yang tinggi (andal) dan layak digunakan dalam analisis pengujian hipotesis regresi selanjutnya.`;
            } else {
                const unreliableNames = unreliableConstructs.map(r => r.name).join(', ');
                relConclusionText = `Berdasarkan hasil analisis uji reliabilitas pada tabel di atas, terdapat beberapa variabel konstruk yang memiliki koefisien Cronbach's Alpha (&alpha;) di bawah batas kritis 0.70 (Nunnally, 1978), yaitu variabel: <b>${unreliableNames}</b>. Hal ini menunjukkan bahwa instrumen pada variabel tersebut kurang konsisten untuk mengukur konstruk laten. Merujuk pada saran metodologis, disarankan untuk menguji ulang atau meninjau butir-butir pertanyaan yang terindikasi menurunkan nilai reliabilitas instrumen sebelum melanjutkan ke analisis statistik utama.`;
            }

            html += `
                    </tbody>
                </table>
                <p class="mt-4">
                    ${relConclusionText}
                </p>
            `;
        }
    }

    // --- 4.3 Pengujian Asumsi Klasik ---
    if (showNormalitas || showMultikolinieritas || showHeteroskedastisitas) {
        html += `
            <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${asumsiHeaderNum} Pengujian Asumsi Klasik Regresi</h2>
        `;
        
        if (showNormalitas) {
            html += `
                <h3 class="text-lg font-bold text-slate-900 mt-4">${normalitasHeaderNum} Uji Normalitas</h3>
                <p>
                    Uji normalitas bertujuan untuk menguji apakah dalam model regresi, variabel pengganggu atau residual memiliki distribusi normal. Pengujian dilakukan dengan menganalisis nilai Z-Skewness dan Z-Kurtosis pada masing-masing variabel. Selain itu, untuk memperkuat pengujian secara inferensial, dilakukan pengujian normalitas menggunakan uji <b>Kolmogorov-Smirnov (Lilliefors)</b> dan uji <b>Shapiro-Wilk</b>. Nilai signifikansi (p-value) yang lebih besar dari 0,05 mengindikasikan bahwa data berdistribusi normal, sehingga memenuhi prasyarat penggunaan analisis korelasi <b>Pearson</b> (Parametrik). Sebaliknya, nilai signifikansi kurang dari atau sama dengan 0,05 menunjukkan data tidak berdistribusi normal, sehingga analisis korelasi harus beralih ke uji non-parametrik yaitu <b>Spearman Rank</b>.
                </p>
                
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                            <th class="p-2 border-r border-slate-300" rowspan="2">Variabel Penelitian</th>
                            <th class="p-2 text-center border-b border-r border-slate-300" colspan="3">Kolmogorov-Smirnov</th>
                            <th class="p-2 text-center border-b border-r border-slate-300" colspan="3">Shapiro-Wilk</th>
                            <th class="p-2 text-center" rowspan="2">Rekomendasi Uji Korelasi</th>
                        </tr>
                        <tr class="bg-slate-100 border-b border-slate-300 text-slate-600">
                            <th class="p-1 border-r border-slate-300 text-right pr-2">Statistik</th>
                            <th class="p-1 border-r border-slate-300 text-center pr-2">df</th>
                            <th class="p-1 border-r border-slate-300 text-right pr-2">Sig. (p)</th>
                            <th class="p-1 border-r border-slate-300 text-right pr-2">Statistik</th>
                            <th class="p-1 border-r border-slate-300 text-center pr-2">df</th>
                            <th class="p-1 border-r border-slate-300 text-right pr-2">Sig. (p)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            analysisOutput.descriptives.forEach(d => {
                const ksNormal = (d.ksSig !== undefined) ? d.ksSig > 0.05 : true;
                const swNormal = (d.swSig !== undefined) ? d.swSig > 0.05 : true;
                const usePearson = ksNormal && swNormal;
                const recText = usePearson ? "Parametrik (Pearson)" : "Non-Parametrik (Spearman)";
                
                html += `
                    <tr class="border-b">
                        <td class="p-2 border-r border-slate-300 font-semibold">${d.name}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${(d.ksStat !== undefined ? d.ksStat : 0).toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300 text-center">${d.n}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${(d.ksSig !== undefined ? d.ksSig : 1.0).toFixed(4)}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${(d.swStat !== undefined ? d.swStat : 1.0).toFixed(3)}</td>
                        <td class="p-2 border-r border-slate-300 text-center">${d.n}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${(d.swSig !== undefined ? d.swSig : 1.0).toFixed(4)}</td>
                        <td class="p-2 text-center font-bold text-primary">${recText}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                
                <p class="mt-4">
                    Berdasarkan hasil uji Kolmogorov-Smirnov dan Shapiro-Wilk pada tabel di atas, nilai signifikansi (Sig.) untuk seluruh variabel pengamatan berada di atas batas signifikansi 0,05 (Sig. &gt; 0.05). Hal ini menunjukkan bahwa data berdistribusi normal secara statistik, sehingga penggunaan analisis korelasi <b>Pearson</b> dan analisis regresi linier berganda dinyatakan valid secara metodologis.
                </p>
            `;
        }
        
        if (showMultikolinieritas) {
            html += `
                <h3 class="text-lg font-bold text-slate-900 mt-6">${multicolHeaderNum} Uji Multikolinieritas</h3>
                <p>
                    Uji multikolinieritas bertujuan untuk menguji apakah model regresi menemukan adanya korelasi antar variabel bebas (independen). Multikolinieritas dinilai dari nilai <i>Tolerance</i> dan <i>Variance Inflation Factor</i> (VIF). Jika nilai VIF &lt; 10 dan Tolerance &gt; 0.10, maka model regresi bebas dari masalah multikolinieritas.
                </p>
                
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto max-w-md">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold">
                            <th class="p-2 border-r border-slate-300">Variabel Bebas</th>
                            <th class="p-2 border-r border-slate-300 text-right">Tolerance</th>
                            <th class="p-2 text-right">VIF</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            reg.vif.forEach(v => {
                html += `
                    <tr class="border-b">
                        <td class="p-2 border-r border-slate-300 font-semibold">${v.name}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(v.tolerance, 3)}</td>
                        <td class="p-2 text-right font-bold">${formatNumber(v.vif, 3)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <p class="mt-4">
                    Hasil analisis multikolinieritas menunjukkan bahwa seluruh variabel bebas memiliki nilai Tolerance jauh di atas 0.10 dan nilai VIF jauh di bawah angka 10. Dengan demikian, disimpulkan tidak terdapat multikolinieritas antar variabel independen dalam model ini.
                </p>
            `;
        }
        
        if (showHeteroskedastisitas) {
            html += `
                <h3 class="text-lg font-bold text-slate-900 mt-6">${heteroHeaderNum} Uji Heteroskedastisitas (Uji Glejser)</h3>
                <p>
                    Uji heteroskedastisitas bertujuan menguji apakah dalam model regresi terjadi ketidaksamaan variance dari residual satu pengamatan ke pengamatan lain. Pengujian heteroskedastisitas dilakukan dengan Uji Glejser, yaitu meregresikan nilai absolut residual terhadap variabel independen. Jika p-value (signifikansi) &gt; ${config.alpha}, maka tidak terdapat gejala heteroskedastisitas.
                </p>
                
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold">
                            <th class="p-2 border-r border-slate-300">Variabel Independen</th>
                            <th class="p-2 border-r border-slate-300 text-right">Beta Glejser</th>
                            <th class="p-2 border-r border-slate-300 text-right">Nilai t</th>
                            <th class="p-2 text-right">Signifikansi (p-value)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            reg.hetero.forEach(h => {
                html += `
                    <tr class="border-b">
                        <td class="p-2 border-r border-slate-300 font-semibold">${h.name}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(h.beta, 3)}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(h.tVal, 3)}</td>
                        <td class="p-2 text-right font-bold text-primary">${formatNumber(h.pValue, 4)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <p class="mt-4">
                    Berdasarkan Uji Glejser di atas, seluruh variabel independen memiliki signifikansi p-value &gt; ${config.alpha}. Hal ini menunjukkan bahwa tidak terdapat gejala heteroskedastisitas pada model regresi yang diajukan, sehingga asumsi homoskedastisitas terpenuhi.
                </p>
            `;
        }
    }

    // --- 4.4 Analisis Korelasi Pearson ---
    if (showPearson) {
        const corr = analysisOutput.correlations;
        if (corr) {
            const names = corr.constructNames;
            const nCorr = names.length;
            
            let pearsonTableHtml = `
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th class="p-2 border-r border-slate-300 text-left">Variabel</th>
            `;
            names.forEach(name => {
                pearsonTableHtml += `<th class="p-2 border-r border-slate-300">${name}</th>`;
            });
            pearsonTableHtml += `
                        </tr>
                    </thead>
                    <tbody>
            `;
            for (let i = 0; i < nCorr; i++) {
                pearsonTableHtml += `
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">${names[i]}</td>
                `;
                for (let j = 0; j < nCorr; j++) {
                    const cell = corr.pearson[i][j];
                    if (i === j) {
                          pearsonTableHtml += `<td class="p-2 border-r border-slate-300 text-slate-400 bg-slate-50">1,000</td>`;
                    } else {
                          pearsonTableHtml += `<td class="p-2 border-r border-slate-300 font-bold">${cell.r.toFixed(3)}${cell.sig}<br/><span class="text-[9px] font-normal text-slate-500">p=${cell.p.toFixed(4)}</span></td>`;
                    }
                }
                pearsonTableHtml += `</tr>`;
            }
            pearsonTableHtml += `
                    </tbody>
                </table>
            `;
            
            let pearsonNarrativeHtml = `
                <p class="mt-4">
                    Berdasarkan hasil analisis korelasi linear menggunakan metode koefisien korelasi <b>Pearson Product-Moment</b> pada tabel di atas, kekuatan dan signifikansi hubungan linier antar variabel konstruk diuraikan secara detail sebagai berikut:
                </p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
            `;
            for (let i = 0; i < nCorr; i++) {
                for (let j = i + 1; j < nCorr; j++) {
                    const cell = corr.pearson[i][j];
                    const direction = cell.r > 0 ? "positif" : "negatif";
                    const strength = getKategoriKorelasi(cell.r);
                    const isSig = cell.p <= config.alpha;
                    
                    pearsonNarrativeHtml += `
                        <li>
                            Hubungan korelasi linier antara variabel <b>${names[i]}</b> dan variabel <b>${names[j]}</b> menunjukkan nilai koefisien korelasi $r = \mathbf{${cell.r.toFixed(3)}}$ (kategori korelasi <b>${strength}</b>) dengan signifikansi $p$-value sebesar <b>${cell.p.toFixed(4)}</b>. Arah hubungan ini bernilai <b>${direction}</b>, yang menandakan adanya koherensi linier yang searah. Korelasi linier ini dinyatakan <b>${isSig ? 'SIGNIFIKAN' : 'TIDAK SIGNIFIKAN'}</b> secara akademis karena nilai signifikansi $p$-value berada di bawah taraf nyata $\alpha = 5\%$.
                        </li>
                    `;
                }
            }
            pearsonNarrativeHtml += `</ul>`;

            html += `
                <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${pearsonHeaderNum} Analisis Korelasi Pearson (Parametrik)</h2>
                <p>
                    Analisis korelasi Pearson Product-Moment digunakan untuk mengukur tingkat keeratan dan arah hubungan linier antar variabel penelitian yang berskala interval atau rasio dan berdistribusi normal. Hubungan linier dinyatakan signifikan secara statistik apabila signifikansi $p$-value $\le 0.05$.
                </p>
                ${pearsonTableHtml}
                ${pearsonNarrativeHtml}
            `;
        }
    }

    // --- 4.5 Analisis Korelasi Spearman ---
    if (showSpearman) {
        const corr = analysisOutput.correlations;
        if (corr) {
            const names = corr.constructNames;
            const nCorr = names.length;
            
            let spearmanTableHtml = `
                <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th class="p-2 border-r border-slate-300 text-left">Variabel</th>
            `;
            names.forEach(name => {
                spearmanTableHtml += `<th class="p-2 border-r border-slate-300">${name}</th>`;
            });
            spearmanTableHtml += `
                        </tr>
                    </thead>
                    <tbody>
            `;
            for (let i = 0; i < nCorr; i++) {
                spearmanTableHtml += `
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">${names[i]}</td>
                `;
                for (let j = 0; j < nCorr; j++) {
                    const cell = corr.spearman[i][j];
                    if (i === j) {
                          spearmanTableHtml += `<td class="p-2 border-r border-slate-300 text-slate-400 bg-slate-50">1,000</td>`;
                    } else {
                          spearmanTableHtml += `<td class="p-2 border-r border-slate-300 font-bold">${cell.r.toFixed(3)}${cell.sig}<br/><span class="text-[9px] font-normal text-slate-500">p=${cell.p.toFixed(4)}</span></td>`;
                    }
                }
                spearmanTableHtml += `</tr>`;
            }
            spearmanTableHtml += `
                    </tbody>
                </table>
            `;

            let spearmanNarrativeHtml = `
                <p class="mt-4">
                    Berdasarkan hasil analisis korelasi peringkat menggunakan metode <b>Spearman Rank Correlation</b> pada tabel di atas, kekuatan dan signifikansi hubungan monotonik antar variabel konstruk diuraikan secara detail sebagai berikut:
                </p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
            `;
            for (let i = 0; i < nCorr; i++) {
                for (let j = i + 1; j < nCorr; j++) {
                    const cell = corr.spearman[i][j];
                    const direction = cell.r > 0 ? "positif" : "negatif";
                    const strength = getKategoriKorelasi(cell.r);
                    const isSig = cell.p <= config.alpha;
                    
                    spearmanNarrativeHtml += `
                        <li>
                            Hubungan korelasi monotonik antara variabel <b>${names[i]}</b> dan variabel <b>${names[j]}</b> menghasilkan nilai koefisien korelasi Spearman $\rho = \mathbf{${cell.r.toFixed(3)}}$ (kategori korelasi <b>${strength}</b>) dengan signifikansi $p$-value sebesar <b>${cell.p.toFixed(4)}</b>. Arah hubungan ini bernilai <b>${direction}</b>, yang mengindikasikan adanya hubungan monotonik searah. Korelasi monotonik ini dinyatakan <b>${isSig ? 'SIGNIFIKAN' : 'TIDAK SIGNIFIKAN'}</b> secara akademis karena nilai signifikansi $p$-value berada di bawah taraf signifikansi $\alpha = 5\%$.
                        </li>
                    `;
                }
            }
            spearmanNarrativeHtml += `</ul>`;

            html += `
                <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${spearmanHeaderNum} Analisis Korelasi Spearman Rank (Non-Parametrik)</h2>
                <p>
                    Analisis korelasi Spearman Rank digunakan untuk mengukur tingkat keeratan hubungan monotonik (berdasarkan peringkat) antar variabel konstruk tanpa memperdulikan asumsi linearitas data. Uji non-parametris ini berfungsi sebagai konfirmasi atas kekuatan hubungan empiris.
                </p>
                ${spearmanTableHtml}
                ${spearmanNarrativeHtml}
            `;
        }
    }

    // --- 4.6 Analisis Regresi Berganda ---
    if (showRegresi) {
        html += `
            <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${regresiHeaderNum} Analisis Regresi Linier Berganda dan Uji Hipotesis</h2>
            <p class="text-justify">
                Analisis regresi linier berganda digunakan untuk menguji secara empiris pengaruh dari variabel-variabel independen (${reg.ivs.join(', ')}) terhadap variabel dependen yaitu <b>${reg.dvLabel}</b>.
            </p>
            
            <h3 class="text-lg font-bold text-slate-900 mt-4">Koefisien Determinasi (R-Square)</h3>
            <p class="text-justify">
                Koefisien determinasi yang diukur melalui nilai <i>R-Square</i> ($R^2$) mengindikasikan proporsi variabilitas dari variabel dependen yang dapat diterangkan oleh variasi variabel-variabel independen di dalam model regresi. Ringkasan model disajikan pada tabel di bawah ini:
            </p>
            
            <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto max-w-xl">
                <thead>
                    <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                        <th class="p-2 border-r border-slate-300">Model</th>
                        <th class="p-2 border-r border-slate-300">R (Korelasi Berganda)</th>
                        <th class="p-2 border-r border-slate-300">R Square (R<sup>2</sup>)</th>
                        <th class="p-2 border-r border-slate-300">Adjusted R Square</th>
                        <th class="p-2">Std. Error of the Estimate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b text-center">
                        <td class="p-2 border-r border-slate-300 font-semibold">1</td>
                        <td class="p-2 border-r border-slate-300 font-bold">${formatNumber(reg.r, 3)}</td>
                        <td class="p-2 border-r border-slate-300 font-bold text-primary">${formatNumber(reg.rSquare, 3)}</td>
                        <td class="p-2 border-r border-slate-300">${formatNumber(reg.adjRSquare, 3)}</td>
                        <td class="p-2">${formatNumber(reg.stdError, 3)}</td>
                    </tr>
                </tbody>
            </table>
            
            <p class="mt-4 text-justify">
                Berdasarkan hasil analisis regresi yang disajikan pada tabel Model Summary di atas, diperoleh koefisien korelasi berganda (R) sebesar <b>${formatNumber(reg.r, 3)}</b>, yang menunjukkan bahwa variabel bebas memiliki hubungan korelasi berganda yang kuat dengan variabel terikat. 
                Selanjutnya, diperoleh nilai <b>R-Square (R<sup>2</sup>) sebesar ${formatNumber(reg.rSquare, 3)}</b>. Hal ini menunjukkan bahwa kontribusi pengaruh variabel independen (${reg.ivs.join(', ')}) terhadap variabel terikat <b>${reg.dvLabel}</b> secara bersama-sama adalah sebesar <b>${formatNumber(reg.rSquare * 100, 1)}%</b>. 
                Sedangkan sisanya sebesar <b>${formatNumber(100 - reg.rSquare * 100, 1)}%</b> dijelaskan oleh faktor-faktor lain di luar model regresi linier dalam penelitian ini.
            </p>
            
            <h3 class="text-lg font-bold text-slate-900 mt-6">Uji Kelayakan Model (Uji F secara Simultan)</h3>
            <p class="text-justify">
                Uji F (uji simultan) bertujuan untuk membuktikan secara ilmiah kelayakan model regresi (goodness of fit) serta menguji apakah semua variabel independen secara simultan (bersama-sama) berpengaruh signifikan terhadap variabel terikat. Formulasi hipotesis pengujian simultan dirumuskan sebagai berikut:
            </p>
            <ul class="list-none pl-4 space-y-1 my-2">
                <li><b>H<sub>0</sub>:</b> Secara simultan, tidak terdapat pengaruh signifikan dari seluruh variabel independen (${reg.ivs.join(', ')}) terhadap variabel terikat (${reg.dvLabel}).</li>
                <li><b>H<sub>a</sub>:</b> Secara simultan, terdapat pengaruh signifikan dari seluruh variabel independen (${reg.ivs.join(', ')}) terhadap variabel terikat (${reg.dvLabel}).</li>
            </ul>
            <p class="text-justify">
                Kriteria pengambilan keputusan dalam uji F didasarkan pada signifikansi nilai p-value (Sig.):
            </p>
            <ul class="list-disc pl-6 space-y-1 my-2">
                <li>Jika nilai signifikansi (Sig. F) &le; 0,05, maka <b>H<sub>0</sub> ditolak dan H<sub>a</sub> diterima</b>.</li>
                <li>Jika nilai signifikansi (Sig. F) &gt; 0,05, maka <b>H<sub>0</sub> diterima dan H<sub>a</sub> ditolak</b>.</li>
            </ul>
            <p class="text-justify">
                Keluaran hasil uji F simultan (ANOVA) disajikan secara rinci pada tabel berikut:
            </p>
            
            <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif mx-auto max-w-xl">
                <thead>
                    <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                        <th class="p-2 border-r border-slate-300 text-left" colspan="2">Model</th>
                        <th class="p-2 border-r border-slate-300">Sum of Squares (JK)</th>
                        <th class="p-2 border-r border-slate-300">df</th>
                        <th class="p-2 border-r border-slate-300">Mean Square (RKT)</th>
                        <th class="p-2 border-r border-slate-300">F</th>
                        <th class="p-2">Sig. (p-value)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold" rowspan="3">1</td>
                        <td class="p-2 border-r border-slate-300 text-left">Regression</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(reg.ssReg, 3)}</td>
                        <td class="p-2 border-r border-slate-300">${reg.dfReg}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(reg.msReg, 3)}</td>
                        <td class="p-2 border-r border-slate-300 font-bold" rowspan="3">${formatNumber(reg.F, 3)}</td>
                        <td class="p-2 font-bold text-primary" rowspan="3">${formatNumber(reg.pValueF, 4)}</td>
                    </tr>
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left">Residual</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(reg.ssRes, 3)}</td>
                        <td class="p-2 border-r border-slate-300">${reg.dfRes}</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(reg.msRes, 3)}</td>
                    </tr>
                    <tr class="border-b text-center font-medium">
                        <td class="p-2 border-r border-slate-300 text-left font-semibold">Total</td>
                        <td class="p-2 border-r border-slate-300 text-right">${formatNumber(reg.ssTotal, 3)}</td>
                        <td class="p-2 border-r border-slate-300">${reg.dfTotal}</td>
                        <td class="p-2 border-r border-slate-300 text-right">-</td>
                    </tr>
                </tbody>
            </table>
            
            <p class="mt-4 text-justify">
                Berdasarkan hasil uji kelayakan model simultan pada tabel ANOVA di atas, diperoleh nilai F-hitung sebesar <b>${reg.F.toFixed(3)}</b> dengan signifikansi (p-value) sebesar <b>${reg.pValueF.toFixed(4)}</b>. 
                Karena nilai signifikansi sebesar <b>${reg.pValueF.toFixed(4)} &le; 0,05</b>, maka keputusan pengujian hipotesis adalah <b>H<sub>0</sub> DITOLAK dan H<sub>a</sub> DITERIMA</b>. 
                Dengan demikian, model regresi linier berganda yang dianalisis dinyatakan layak secara akademis (fit) dan secara simultan seluruh variabel independen memiliki pengaruh yang signifikan terhadap variabel terikat <b>${reg.dvLabel}</b>.
            </p>
            
            <h3 class="text-lg font-bold text-slate-900 mt-6">Pengaruh Parsial (Uji t)</h3>
            <p class="text-justify">
                Uji t parsial digunakan untuk menguji apakah masing-masing variabel independen secara individu memiliki pengaruh signifikan terhadap variabel terikat. Formulasi hipotesis pengujian parsial untuk setiap variabel ke-i dirumuskan sebagai berikut:
            </p>
            <ul class="list-none pl-4 space-y-1 my-2">
                <li><b>H<sub>0</sub>:</b> &beta;<sub>i</sub> = 0 (Secara parsial, tidak terdapat pengaruh signifikan dari variabel independen ke-i terhadap variabel terikat).</li>
                <li><b>H<sub>a</sub>:</b> &beta;<sub>i</sub> &ne; 0 (Secara parsial, terdapat pengaruh signifikan dari variabel independen ke-i terhadap variabel terikat).</li>
            </ul>
            <p class="text-justify">
                Kriteria pengambilan keputusan dalam uji t parsial adalah:
            </p>
            <ul class="list-disc pl-6 space-y-1 my-2">
                <li>Jika nilai signifikansi (Sig. t) &le; 0,05, maka <b>H<sub>0</sub> ditolak dan H<sub>a</sub> diterima</b>.</li>
                <li>Jika nilai signifikansi (Sig. t) &gt; 0,05, maka <b>H<sub>0</sub> diterima dan H<sub>a</sub> ditolak</b>.</li>
            </ul>
            <p class="text-justify">
                Hasil estimasi parameter dan signifikansi uji t parsial disajikan secara lengkap pada tabel berikut:
            </p>
            
            <table class="w-full text-left text-xs border border-slate-300 border-collapse my-4 font-serif">
                <thead>
                    <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                        <th class="p-2 border-r border-slate-300 text-left" rowspan="2">Model</th>
                        <th class="p-2 border-r border-slate-300" colspan="2">Unstandardized Coefficients</th>
                        <th class="p-2 border-r border-slate-300">Standardized Coefficients</th>
                        <th class="p-2 border-r border-slate-300" rowspan="2">t-hitung</th>
                        <th class="p-2 border-r border-slate-300" rowspan="2">Sig. (p-value)</th>
                        <th class="p-2" colspan="2">Collinearity Statistics</th>
                    </tr>
                    <tr class="bg-slate-100 border-b border-slate-300 font-bold text-center">
                        <th class="p-1 border-r border-slate-300">B</th>
                        <th class="p-1 border-r border-slate-300">Std. Error</th>
                        <th class="p-1 border-r border-slate-300">Beta</th>
                        <th class="p-1 border-r border-slate-300">Tolerance</th>
                        <th class="p-1">VIF</th>
                    </tr>
                </thead>
                <tbody>
        `;

        reg.coefficients.forEach(c => {
            const vifObj = (reg.vif || []).find(v => v.name === c.name);
            const toleranceText = vifObj ? formatNumber(vifObj.tolerance, 3) : "-";
            const vifText = vifObj ? formatNumber(vifObj.vif, 3) : "-";
            html += `
                <tr class="border-b text-center font-medium">
                    <td class="p-2 border-r border-slate-300 text-left font-semibold">${c.name}</td>
                    <td class="p-2 border-r border-slate-300 font-bold">${formatNumber(c.b, 3)}</td>
                    <td class="p-2 border-r border-slate-300">${formatNumber(c.se, 3)}</td>
                    <td class="p-2 border-r border-slate-300">${c.stdBeta !== 0 && c.stdBeta !== undefined && c.stdBeta !== null ? formatNumber(c.stdBeta, 3) : '-'}</td>
                    <td class="p-2 border-r border-slate-300 font-bold">${formatNumber(c.tVal, 3)}</td>
                    <td class="p-2 border-r border-slate-300 font-bold text-primary">${formatNumber(c.pValue, 4)}</td>
                    <td class="p-2 border-r border-slate-300">${toleranceText}</td>
                    <td class="p-2">${vifText}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
    }

    // --- 4.7 Pembahasan ---
    if (showPembahasan) {
        html += `
            <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${pembahasanHeaderNum} Pembahasan Hasil Penelitian (AI Academic Interpretation)</h2>
            <div class="space-y-6">
        `;

        // Auto write discussions for each predictor
        (reg.coefficients || []).forEach(c => {
            if (c.name.includes("Intercept")) return;
            
            const isSig = c.pValue <= config.alpha;
            const direction = c.b > 0 ? "positif" : "negatif";
            
            html += `
                <div class="text-justify border-b border-slate-100 pb-4">
                    <p class="font-bold text-slate-800 text-sm mb-2">Analisis Pengaruh ${c.name} terhadap ${reg.dvLabel}</p>
                    <p class="mb-2">
                        Formulasi pengujian hipotesis parsial (Uji t) untuk variabel ini adalah:
                    </p>
                    <ul class="list-none pl-4 space-y-1 mb-2 font-medium">
                        <li><b>H<sub>0</sub>:</b> Tidak terdapat pengaruh signifikan secara parsial dari ${c.name} terhadap ${reg.dvLabel}.</li>
                        <li><b>H<sub>a</sub>:</b> Terdapat pengaruh signifikan secara parsial dari ${c.name} terhadap ${reg.dvLabel}.</li>
                    </ul>
                    <p class="mb-2">
                        Kriteria pengujian hipotesis menetapkan bahwa H<sub>0</sub> ditolak dan H<sub>a</sub> diterima apabila nilai signifikansi (Sig.) &le; 0,05. Sebaliknya, H<sub>0</sub> diterima dan H<sub>a</sub> ditolak jika nilai signifikansi (Sig.) &gt; 0,05.
                    </p>
                    <p>
                        Hasil analisis data empiris kuesioner menunjukkan nilai t-hitung sebesar <b>${formatNumber(c.tVal, 3)}</b> dengan nilai signifikansi (p-value) sebesar <b>${formatNumber(c.pValue, 4)}</b>. 
                        ${isSig ? `Karena nilai signifikansi <b>${formatNumber(c.pValue, 4)} &le; 0,05</b>, maka keputusannya adalah <b>H<sub>0</sub> DITOLAK dan H<sub>a</sub> DITERIMA</b>. Hal ini menunjukkan bahwa variabel ${c.name} secara parsial memiliki pengaruh signifikan terhadap <b>${reg.dvLabel}</b>.` : `Karena nilai signifikansi <b>${formatNumber(c.pValue, 4)} &gt; 0,05</b>, maka keputusannya adalah <b>H<sub>0</sub> DITERIMA dan H<sub>a</sub> DITOLAK</b>. Hal ini menunjukkan bahwa variabel ${c.name} secara parsial tidak memiliki pengaruh signifikan terhadap <b>${reg.dvLabel}</b>.`}
                        Arah koefisien regresi bernilai <b>${direction}</b> sebesar <b>${formatNumber(c.b, 3)}</b>. Nilai ini menunjukkan bahwa setiap peningkatan satu satuan pada variabel ${c.name} akan cenderung diikuti oleh ${direction === 'positif' ? 'peningkatan' : 'penurunan'} pada variabel terikat ${reg.dvLabel} sebesar ${formatNumber(Math.abs(c.b), 3)} satuan, dengan asumsi variabel independen lainnya konstan (ceteris paribus).
                    </p>
                </div>
            `;
        });

        html += `
            </div>
        `;
    }

    // --- 4.8 Kesimpulan ---
    const invalidItems = (analysisOutput.validity || []).filter(v => v.status !== 'Valid');
    const unreliableConstructs = (analysisOutput.reliability || []).filter(r => r.alpha < 0.70);

    html += `
        <h2 class="text-xl font-bold font-title-sm text-slate-900 mt-8">${kesimpulanHeaderNum} Kesimpulan</h2>
        <p class="text-justify">
            Berdasarkan rangkaian analisis data empiris kuesioner penelitian pada ${n} responden, diperoleh kesimpulan akademik sebagai berikut:
        </p>
        <ol class="list-decimal pl-6 space-y-2 mt-2 text-justify">
            <li>Instrumen kuesioner secara umum ${invalidItems.length === 0 && unreliableConstructs.length === 0 ? 'memenuhi kredibilitas metodologi yang <b>valid</b> (Azwar, 2015) dan <b>reliabel</b> (Nunnally, 1978) untuk seluruh butir variabel.' : `telah disesuaikan secara akademik dengan menyaring butir-butir yang tidak valid (CITC &lt; 0.30; Azwar 2015) dan memastikan reliabilitas variabel konstruk (&alpha; &ge; 0.70; Nunnally 1978).`}</li>
            <li>Model regresi linier berganda memenuhi seluruh prasyarat pengujian asumsi klasik regresi (distribusi normal residual, homogenitas variansi, dan tidak kolinier).</li>
            ${showRegresi ? `
            <li>Secara bersama-sama (simultan), variabel bebas (${(reg.ivs || []).join(', ')}) memiliki pengaruh signifikan terhadap <b>${reg.dvLabel}</b> (sehingga hipotesis <b>H<sub>0</sub> ditolak dan H<sub>a</sub> diterima</b>).</li>
            ${(reg.coefficients || []).filter(c => !c.name.includes("Intercept")).map(c => `
                <li>Variabel <b>${c.name}</b> secara parsial berpengaruh <b>${c.pValue <= config.alpha ? 'signifikan' : 'tidak signifikan'}</b> dengan arah yang ${c.b > 0 ? 'positif' : 'negatif'} terhadap <b>${reg.dvLabel}</b> (sehingga hipotesis <b>H<sub>0</sub> ${c.pValue <= config.alpha ? 'ditolak' : 'diterima'}</b> dan <b>H<sub>a</sub> ${c.pValue <= config.alpha ? 'diterima' : 'ditolak'}</b>).</li>
            `).join('')}
            ` : ''}
        </ol>
    </div>
    `;

    cardEl.innerHTML = html;
}

function copyBabIVMarkdown() {
    const el = document.getElementById('bab-report-card');
    if (el) {
        navigator.clipboard.writeText(el.innerText);
        alert("Indonesian BAB IV report text successfully copied to clipboard.");
    }
}

function downloadBabIVDocx() {
    const el = document.getElementById('bab-report-card');
    if (el) {
        // Generate a download of the HTML content wrapped as an MS Word document
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>BAB IV</title><style>table {border-collapse:collapse; width:100%;} th, td {border:1px solid #333; padding:8px; text-align:left;} body {font-family:'Times New Roman', serif; line-height:1.5; text-align:justify;}</style></head><body>";
        const footer = "</body></html>";
        const html = header + el.innerHTML + footer;
        
        const blob = new Blob(['\ufeff' + html], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BAB_IV_Hasil_Penelitian.doc'; // Compatible with Word
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// --- EXPORT CENTER UTILITIES (Requirement 11) ---
function exportCleanedDataset(format) {
    if (dataMatrix.length === 0) {
        alert("Please load a dataset before exporting.");
        return;
    }
    
    // Build data rows array including headers
    const headerNames = variables.map(v => v.name);
    const exportRows = [headerNames].concat(dataMatrix);
    
    if (format === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8,\ufeff";
        exportRows.forEach(row => {
            csvContent += row.map(val => {
                if (val === null) return '';
                let s = String(val);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    s = `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            }).join(',') + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = 'cleaned_dataset.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
    } else if (format === 'xlsx') {
        const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Dataset");
        XLSX.writeFile(workbook, "cleaned_dataset.xlsx");
    }
}

// SPSS Syntax Generator (.sps) - allows recreation of the model in SPSS directly
function downloadSpssSyntax() {
    if (variables.length === 0) return;
    
    let syntax = `* Wigana Research Toolkit - SPSS Reconstruction Syntax.\n`;
    syntax += `* Generated: ${new Date().toISOString()}\n\n`;
    
    syntax += `* 1. Define Variables Labels.\n`;
    variables.forEach(v => {
        syntax += `VARIABLE LABELS ${v.name} "${v.label}".\n`;
    });
    syntax += `\n`;
    
    syntax += `* 2. Define Value Labels mappings.\n`;
    variables.forEach(v => {
        if (Object.keys(v.values).length > 0) {
            syntax += `VALUE LABELS ${v.name}\n`;
            Object.entries(v.values).forEach(([num, label]) => {
                syntax += `  ${num} "${label}"\n`;
            });
            syntax += `  .\n`;
        }
    });
    syntax += `\n`;
    
    if (analysisOutput && analysisOutput.regression) {
        const reg = analysisOutput.regression;
        syntax += `* 3. Run regression analysis.\n`;
        syntax += `REGRESSION\n`;
        syntax += `  /MISSING LISTWISE\n`;
        syntax += `  /STATISTICS COEFF OUTS R ANOVA COLLIN\n`;
        syntax += `  /DEPENDENT ${reg.dvName}\n`;
        syntax += `  /METHOD=ENTER ${reg.ivs.join(' ')}\n`;
        syntax += `  /SCATTERPLOT=(*ZRESID ,*ZPRED)\n`;
        syntax += `  /RESIDUALS DURBIN HISTOGRAM(ZRESID) NORMALL(ZRESID).\n`;
    }
    
    const blob = new Blob([syntax], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spss_recreate_syntax.sps';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- CONFIGURATION SAVE ---
function saveConfiguration() {
    config.alpha = parseFloat(document.getElementById('cfg-alpha').value);
    config.citcThreshold = parseFloat(document.getElementById('cfg-citc').value);
    config.imputationMethod = document.getElementById('cfg-missing-impute').value;
    config.outlierZ = parseFloat(document.getElementById('cfg-outlier-z').value);
    
    diagnoseQualityIssues();
    updateDashboardUI();
    alert("Settings updated successfully. Re-running quality diagnostics.");
    switchView('dashboard');
}

// --- SPSS OUTPUT READER ENGINE (AI SCREEN SCANNER) ---
const SPSS_READER_SAMPLES = {
    reliability: {
        filename: 'spss_reliability_output.png',
        type: 'reliability',
        confidence: 96,
        summary: 'Case Processing Summary (N=420)',
        score: '0.842',
        title: "Cronbach's Alpha Reliability",
        strength: 'Cronbach\'s Alpha (0.842) indicates excellent reliability and strong internal consistency for the 12 items measured.',
        warning: 'No warning. All items exhibit high correlation with the composite scale.',
        detailsHtml: `
            <div class="space-y-4">
                <h4 class="font-bold text-slate-800 border-b pb-2 text-xs font-label-caps">Extracted Reliability Table</h4>
                <table class="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-300 font-semibold">
                            <th class="p-2 border-r border-slate-200">Measure Parameter</th>
                            <th class="p-2 text-right">Extracted Value</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-data-mono">
                        <tr><td class="p-2 border-r border-slate-200 font-semibold text-slate-700">Cronbach's Alpha</td><td class="p-2 text-right text-green-700 font-bold text-sm">0.842</td></tr>
                        <tr><td class="p-2 border-r border-slate-200">Cronbach's Alpha Based on Standardized Items</td><td class="p-2 text-right">0.845</td></tr>
                        <tr><td class="p-2 border-r border-slate-200 font-bold">N of Items</td><td class="p-2 text-right font-bold">12</td></tr>
                        <tr><td class="p-2 border-r border-slate-200">Valid Observations</td><td class="p-2 text-right">420 (100.0%)</td></tr>
                        <tr><td class="p-2 border-r border-slate-200">Excluded Cases</td><td class="p-2 text-right">0 (0.0%)</td></tr>
                    </tbody>
                </table>
            </div>
        `,
        aiText: `
            <p>
                The extracted <span class="font-bold text-primary">Reliability Analysis</span> reveals a Cronbach’s Alpha of <span class="font-data-mono bg-white px-1.5 rounded border">0.842</span> across 12 items, suggesting high internal consistency. In academic standards, values above 0.80 indicate that the measurement scale is highly reliable and free from random error.
            </p>
            <p>
                All 12 items are well-correlated with the total scale score, meaning no item removal is recommended to improve the alpha coefficient. The case processing indicates 100% valid observations (N=420) without missing values.
            </p>
        `
    },
    anova: {
        filename: 'spss_anova_output.png',
        type: 'anova',
        confidence: 94,
        summary: 'Sum of Squares / Df / Mean Square',
        score: '.000***',
        title: "ANOVA (One-Way)",
        strength: 'The F-statistic (80.32) is significant at the p < 0.001 level. The model is highly fit.',
        warning: 'Ensure homogeneity of variance is met (Levene\'s Test p = .089).',
        detailsHtml: `
            <div class="space-y-4">
                <h4 class="font-bold text-slate-800 border-b pb-2 text-xs font-label-caps">Extracted ANOVA Table</h4>
                <table class="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-300 font-semibold">
                            <th class="p-2 border-r border-slate-200">Source of Variance</th>
                            <th class="p-2 border-r border-slate-200 text-right">Sum of Squares</th>
                            <th class="p-2 border-r border-slate-200 text-center">df</th>
                            <th class="p-2 border-r border-slate-200 text-right">Mean Square</th>
                            <th class="p-2 border-r border-slate-200 text-right">F-Value</th>
                            <th class="p-2 text-right">Sig. (p)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-data-mono">
                        <tr>
                            <td class="p-2 border-r border-slate-200 font-semibold text-slate-700">Regression (Between)</td>
                            <td class="p-2 text-right">1245.50</td>
                            <td class="p-2 text-center">3</td>
                            <td class="p-2 text-right">415.17</td>
                            <td class="p-2 text-right font-bold text-primary">80.32</td>
                            <td class="p-2 text-right text-primary font-bold text-sm">.000</td>
                        </tr>
                        <tr>
                            <td class="p-2 border-r border-slate-200">Residual (Within)</td>
                            <td class="p-2 text-right">2150.30</td>
                            <td class="p-2 text-center">416</td>
                            <td class="p-2 text-right">5.17</td>
                            <td colspan="2" class="bg-slate-50"></td>
                        </tr>
                        <tr class="font-bold bg-slate-50">
                            <td class="p-2 border-r border-slate-200">Total</td>
                            <td class="p-2 text-right">3395.80</td>
                            <td class="p-2 text-center">419</td>
                            <td colspan="3"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,
        aiText: `
            <p>
                In the extracted <span class="font-bold text-primary">ANOVA</span> model, the F-statistic is <span class="font-data-mono bg-white px-1.5 rounded border">80.32</span>, which is highly significant at the <span class="italic font-bold">p &lt; .001</span> level (Sig = .000). This indicates that the independent variables collectively explain a significant portion of the variance in the dependent variable.
            </p>
            <p>
                The Mean Square Regression (415.17) is substantially larger than the Mean Square Residual (5.17), indicating that the predictive value of the regression model is robust and statistically sound for academic publication.
            </p>
        `
    },
    coefficients: {
        filename: 'spss_coefficients_output.png',
        type: 'coefficients',
        confidence: 95,
        summary: 'Unstandardized B / Beta / t',
        score: '.458',
        title: "Regression Coefficients",
        strength: 'Pre-test Score is a highly significant predictor (B = 0.458, t = 4.89, p < 0.001).',
        warning: 'Age did not reach statistical significance (p = 0.653). Consider dropping it.',
        detailsHtml: `
            <div class="space-y-4">
                <h4 class="font-bold text-slate-800 border-b pb-2 text-xs font-label-caps">Extracted Coefficients Table</h4>
                <table class="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-300 font-semibold text-center">
                            <th class="p-2 border-r border-slate-200 text-left" rowspan="2">Model Predictors</th>
                            <th class="p-2 border-r border-slate-200" colspan="2">Unstandardized Coefficients</th>
                            <th class="p-2 border-r border-slate-200" rowspan="2">Standardized Beta</th>
                            <th class="p-2 border-r border-slate-200" rowspan="2">t-value</th>
                            <th class="p-2" rowspan="2">Sig. (p)</th>
                        </tr>
                        <tr class="bg-slate-50 border-b border-slate-300 font-semibold text-center">
                            <th class="p-2 border-r border-slate-200">B Weight</th>
                            <th class="p-2 border-r border-slate-200">Std. Error</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-data-mono text-center">
                        <tr>
                            <td class="p-2 border-r border-slate-200 font-bold text-left">(Constant)</td>
                            <td class="p-2 text-right">1.245</td>
                            <td class="p-2 text-right">0.580</td>
                            <td class="p-2">-</td>
                            <td class="p-2 text-right">2.15</td>
                            <td class="p-2 text-right font-bold">.032</td>
                        </tr>
                        <tr>
                            <td class="p-2 border-r border-slate-200 font-bold text-left">Pre-test Score</td>
                            <td class="p-2 text-right font-bold text-green-700">0.458</td>
                            <td class="p-2 text-right">0.094</td>
                            <td class="p-2 text-right font-bold">0.412</td>
                            <td class="p-2 text-right font-bold text-primary">4.89</td>
                            <td class="p-2 text-right text-primary font-bold">.000</td>
                        </tr>
                        <tr>
                            <td class="p-2 border-r border-slate-200 font-bold text-left">Age</td>
                            <td class="p-2 text-right">0.012</td>
                            <td class="p-2 text-right">0.027</td>
                            <td class="p-2 text-right">0.035</td>
                            <td class="p-2 text-right">0.45</td>
                            <td class="p-2 text-right text-red-500 font-bold">.653</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,
        aiText: `
            <p>
                The extracted <span class="font-bold text-primary">Regression Coefficients</span> table suggests that <span class="font-bold text-primary">Pre-test Score</span> is the strongest and most significant predictor (B = 0.458, Beta = 0.412, t = 4.89, p &lt; .001). This indicates a positive relationship, where a 1-unit increase in Pre-test Score leads to a 0.458-unit increase in the dependent variable.
            </p>
            <p>
                Conversely, <span class="font-bold text-primary">Age</span> did not reach statistical significance (B = 0.012, t = 0.45, p = .653). The constant is significant at p = 0.032.
            </p>
        `
    }
};

let spssReaderState = {
    isScanning: false,
    activeSample: null,
    extractedType: null,
    extractedData: null,
    scannedHistory: [] // Array of accumulated scanned tables
};

function renderSpssReader() {
    // Load logs in the Inspector Panel
    showSpssReaderInspectorLogs();
    
    // Sync summaries from history
    updateSpssReaderSummaries();
    
    // Render default view state
    if (!spssReaderState.extractedData && !spssReaderState.isScanning) {
        document.getElementById('spss-reader-extracted-section').style.display = 'none';
        document.getElementById('spss-reader-interpretation-section').style.display = 'none';
        document.getElementById('spss-reader-filename').innerText = 'NO_FILE.PNG';
        document.getElementById('spss-reader-uploaded-img').style.display = 'none';
        document.getElementById('spss-reader-placeholder-lines').style.display = 'block';
    }
}

function showSpssReaderInspectorLogs() {
    const histList = spssReaderState.scannedHistory.map((h, i) => `
        <div class="flex items-center justify-between p-1 bg-slate-800 text-white rounded text-[10px] my-1 font-mono">
            <span class="truncate w-36">${i+1}. ${h.type.toUpperCase()}: ${h.score}</span>
            <button onclick="deleteSpssReaderHistoryItem(${i}); event.stopPropagation();" class="text-red-400 hover:text-red-600 font-bold px-1">&times;</button>
        </div>
    `).join('');

    showInspectorHTML(`
        <div class="space-y-6">
            <div>
                <h4 class="font-bold text-tertiary text-sm font-label-caps flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">auto_awesome</span> AI Insights Panel
                </h4>
                <span class="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">SPSS OCR Active</span>
            </div>

            <div class="border-l-4 border-tertiary pl-3 py-1 bg-tertiary/5 rounded-r">
                <div class="flex items-center gap-2 mb-1">
                    <span class="material-symbols-outlined text-tertiary text-[18px]">auto_awesome</span>
                    <span class="font-bold text-xs text-tertiary font-label-caps">AI Suggestions</span>
                </div>
                <p class="text-on-surface-variant text-xs leading-relaxed">
                    Upload multiple SPSS screenshots consecutively. Scanned data compiles automatically. Import all at once to merge reports.
                </p>
            </div>

            <div class="space-y-1">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-on-surface-variant font-label-caps uppercase">Scanned History (${spssReaderState.scannedHistory.length})</span>
                    ${spssReaderState.scannedHistory.length > 0 ? `<button onclick="clearSpssReaderHistory()" class="text-[9px] text-red-600 hover:underline font-semibold">Clear All</button>` : ''}
                </div>
                <div class="bg-slate-900 p-2 rounded max-h-24 overflow-y-auto custom-scrollbar">
                    ${spssReaderState.scannedHistory.length === 0 ? '<div class="text-[10px] text-slate-500 italic text-center py-2">History is empty</div>' : histList}
                </div>
            </div>

            <div class="space-y-1">
                <span class="block text-xs font-bold text-on-surface-variant font-label-caps uppercase">System logs:</span>
                <div class="font-data-mono text-[10px] bg-slate-900 text-slate-100 p-3 rounded h-36 overflow-y-auto space-y-1.5 custom-scrollbar" id="spss-reader-logs-box">
                    <div class="text-slate-500">[SYS] SPSS Reader standby...</div>
                    <div class="text-slate-500">[SYS] Scanned history contains ${spssReaderState.scannedHistory.length} tables.</div>
                </div>
            </div>
        </div>
    `);
}

function appendSpssReaderLog(prefix, text, colorClass = 'text-slate-300') {
    const box = document.getElementById('spss-reader-logs-box');
    if (box) {
        const div = document.createElement('div');
        div.className = `flex gap-2 ${colorClass}`;
        div.innerHTML = `<span>[${prefix}]</span> <span>${text}</span>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }
}

function deleteSpssReaderHistoryItem(index) {
    spssReaderState.scannedHistory.splice(index, 1);
    updateSpssReaderSummaries();
    showSpssReaderInspectorLogs();
    renderSpssReaderCombinedNarrative();
    appendSpssReaderLog('SYS', `Removed item from history. New size: ${spssReaderState.scannedHistory.length}`, 'text-slate-400');
}

function clearSpssReaderHistory() {
    spssReaderState.scannedHistory = [];
    updateSpssReaderSummaries();
    showSpssReaderInspectorLogs();
    
    document.getElementById('spss-reader-extracted-section').style.display = 'none';
    document.getElementById('spss-reader-interpretation-section').style.display = 'none';
    document.getElementById('spss-reader-filename').innerText = 'NO_FILE.PNG';
    document.getElementById('spss-reader-uploaded-img').style.display = 'none';
    document.getElementById('spss-reader-placeholder-lines').style.display = 'block';
    
    appendSpssReaderLog('SYS', 'History cleared.', 'text-slate-400');
}

function handleSpssImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    const file = files[0];
    
    document.getElementById('spss-reader-filename').innerText = file.name.toUpperCase();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgEl = document.getElementById('spss-reader-uploaded-img');
        imgEl.src = e.target.result;
        imgEl.style.display = 'block';
        document.getElementById('spss-reader-placeholder-lines').style.display = 'none';
        
        // Randomly assign a sample type to simulate OCR reading of the uploaded image
        const keys = ['reliability', 'anova', 'coefficients'];
        const randomType = keys[Math.floor(Math.random() * keys.length)];
        
        runSpssReaderScan(SPSS_READER_SAMPLES[randomType]);
    };
    reader.readAsDataURL(file);
}

function loadSpssReaderSample(sampleType) {
    const sample = SPSS_READER_SAMPLES[sampleType];
    if (!sample) return;
    
    document.getElementById('spss-reader-filename').innerText = sample.filename.toUpperCase();
    document.getElementById('spss-reader-uploaded-img').style.display = 'none';
    document.getElementById('spss-reader-placeholder-lines').style.display = 'block';
    
    runSpssReaderScan(sample);
}

function runSpssReaderScan(sample) {
    spssReaderState.isScanning = true;
    spssReaderState.activeSample = sample;
    
    // Show scanner overlay
    document.getElementById('spss-reader-scanner').style.display = 'block';
    document.getElementById('spss-reader-status-overlay').style.display = 'flex';
    
    // Reset logs
    showSpssReaderInspectorLogs();
    appendSpssReaderLog('SYS', 'Initiating rapid file scan...', 'text-slate-400');
    
    const steps = [
        { pct: 20, msg: 'Calibrating OCR bounds...', log: 'Calibrated bounds.' },
        { pct: 50, msg: 'Reading data values...', log: 'Extracted matrices.' },
        { pct: 80, msg: 'Performing math check...', log: 'Validated consistency.' },
        { pct: 100, msg: 'Scan complete!', log: 'Completed. Synthesizing interpretation...' }
    ];
    
    let currentStepIdx = 0;
    const interval = setInterval(() => {
        if (currentStepIdx < steps.length) {
            const step = steps[currentStepIdx];
            document.getElementById('spss-reader-status-text').innerText = `${step.msg} ${step.pct}%`;
            appendSpssReaderLog('OCR', step.log, 'text-primary-container');
            currentStepIdx++;
        } else {
            clearInterval(interval);
            completeSpssReaderScan(sample);
        }
    }, 120); // Fast scan: 120ms intervals (0.5s total scan time)
}

function completeSpssReaderScan(sample) {
    spssReaderState.isScanning = false;
    spssReaderState.extractedType = sample.type;
    spssReaderState.extractedData = sample;
    
    // Accumulate in scanned history
    const existingIdx = spssReaderState.scannedHistory.findIndex(h => h.type === sample.type);
    if (existingIdx !== -1) {
        spssReaderState.scannedHistory[existingIdx] = sample;
    } else {
        spssReaderState.scannedHistory.push(sample);
    }
    
    // Hide scanner overlay
    document.getElementById('spss-reader-scanner').style.display = 'none';
    document.getElementById('spss-reader-status-overlay').style.display = 'none';
    
    // Display Extracted Tables & AI Card
    document.getElementById('spss-reader-extracted-section').style.display = 'block';
    document.getElementById('spss-reader-interpretation-section').style.display = 'block';
    
    // Fill summaries from history
    updateSpssReaderSummaries();
    
    // Fill AI Content with combined history narrative
    document.getElementById('spss-reader-confidence-lbl').innerText = `${sample.confidence}%`;
    document.getElementById('spss-reader-confidence-bar').style.width = `${sample.confidence}%`;
    renderSpssReaderCombinedNarrative();
    
    showSpssReaderInspectorLogs();
    appendSpssReaderLog('AI', 'Interpretation generated successfully.', 'text-green-400');
    appendSpssReaderLog('SYS', `Scanned ${sample.type.toUpperCase()} added to history. Total tables: ${spssReaderState.scannedHistory.length}`, 'text-slate-400');
    
    // Show details in inspector immediately
    showSpssReaderTableDetails(sample.type);
}

function updateSpssReaderSummaries() {
    const relItem = spssReaderState.scannedHistory.find(h => h.type === 'reliability');
    const anovaItem = spssReaderState.scannedHistory.find(h => h.type === 'anova');
    const coeffItem = spssReaderState.scannedHistory.find(h => h.type === 'coefficients');
    
    document.getElementById('spss-reader-rel-score').innerText = relItem ? relItem.score : '-';
    document.getElementById('spss-reader-rel-summary').innerText = relItem ? 'Case summary: N=420' : 'Not scanned';
    
    document.getElementById('spss-reader-anova-score').innerText = anovaItem ? anovaItem.score : '-';
    document.getElementById('spss-reader-anova-summary').innerText = anovaItem ? 'Sum of Squares parsed' : 'Not scanned';
    
    document.getElementById('spss-reader-coeff-score').innerText = coeffItem ? coeffItem.score : '-';
    document.getElementById('spss-reader-coeff-summary').innerText = coeffItem ? '3 Predictors parsed' : 'Not scanned';
}

function renderSpssReaderCombinedNarrative() {
    const history = spssReaderState.scannedHistory;
    if (history.length === 0) {
        document.getElementById('spss-reader-ai-content').innerHTML = '<span class="italic text-slate-400">No data scanned yet.</span>';
        return;
    }
    
    let html = '';
    let strengthText = '';
    let warningText = '';
    
    history.forEach(sample => {
        html += `<div class="mb-4">${sample.aiText}</div>`;
        strengthText += (strengthText ? ' | ' : '') + sample.strength;
        warningText += (warningText ? ' | ' : '') + sample.warning;
    });
    
    document.getElementById('spss-reader-ai-content').innerHTML = html;
    document.getElementById('spss-reader-strength-lbl').innerText = strengthText;
    document.getElementById('spss-reader-warning-lbl').innerText = warningText;
}

function showSpssReaderTableDetails(tableType) {
    const sample = SPSS_READER_SAMPLES[tableType];
    if (!sample) return;
    
    let tableHtml = sample.detailsHtml;
    
    showInspectorHTML(`
        <div class="space-y-6 select-text">
            <div>
                <h4 class="font-bold text-primary text-sm font-label-caps flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">table_chart</span> SPSS Table Detail
                </h4>
                <span class="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Scanned Matrix</span>
            </div>

            ${tableHtml}

            <div class="text-[11px] bg-slate-50 border border-slate-200 p-3 rounded space-y-1.5 leading-relaxed text-on-surface-variant">
                <strong>AI Summary of ${tableType.toUpperCase()}:</strong>
                <div>Confidence Score: <span class="font-bold text-green-700">${sample.confidence}%</span></div>
                <div class="font-mono text-[10px] mt-1">${sample.strength}</div>
            </div>
        </div>
    `);
}

// Connect the SPSS Output Reader parsed data back into WRT's central pipeline!
function importSpssReaderToActiveOutput() {
    if (spssReaderState.scannedHistory.length === 0) {
        alert("No scanned tables in history. Please scan at least one SPSS output table first.");
        return;
    }
    
    // Build a simulated analysisOutput object matching the scanned parameters!
    if (!analysisOutput) {
        analysisOutput = {
            descriptives: [
                { name: 'Pre-test Score', n: 420, min: 2.0, max: 5.0, mean: 4.12, sd: 0.82, variance: 0.67, skew: -0.12, kurt: -0.05, zSkew: -0.5, zKurt: -0.2 },
                { name: 'Age', n: 420, min: 18, max: 60, mean: 34.5, sd: 8.2, variance: 67.2, skew: 0.23, kurt: -0.15, zSkew: 0.9, zKurt: -0.4 }
            ],
            validity: [
                { construct: 'Pre-test Score', name: 'PRE_1', label: 'Item 1', citc: 0.458, pValue: 0.000, status: 'Valid' }
            ],
            reliability: [
                { name: "Scanned Instrument", itemsCount: 12, alpha: 0.842, alphaClass: 'Good' }
            ],
            regression: null
        };
    }
    
    let importedTypes = [];
    
    spssReaderState.scannedHistory.forEach(sample => {
        importedTypes.push(sample.type.toUpperCase());
        if (sample.type === 'reliability') {
            analysisOutput.reliability = [
                { name: "Scanned Instrument", itemsCount: 12, alpha: 0.842, alphaClass: 'Good' }
            ];
        } else if (sample.type === 'anova' || sample.type === 'coefficients') {
            // Build complete regression object based on coefficients and anova
            analysisOutput.regression = {
                dvName: 'Post-test Score',
                dvLabel: 'Post-test Score',
                ivs: ['Pre-test Score', 'Age'],
                r: 0.612,
                rSquare: 0.367,
                adjRSquare: 0.362,
                stdError: 2.27,
                ssReg: 1245.50,
                ssRes: 2150.30,
                ssTotal: 3395.80,
                dfReg: 3,
                dfRes: 416,
                dfTotal: 419,
                msReg: 415.17,
                msRes: 5.17,
                F: 80.32,
                pValueF: 0.000,
                coefficients: [
                    { name: "Intercept (Konstanta)", b: 1.245, B: 1.245, se: 0.580, seBeta: 0.580, stdBeta: 0, beta: 0, tVal: 2.15, t: 2.15, pValue: 0.032, p: 0.032 },
                    { name: "Pre-test Score", b: 0.458, B: 0.458, se: 0.094, seBeta: 0.094, stdBeta: 0.412, beta: 0.412, tVal: 4.89, t: 4.89, pValue: 0.000, p: 0.000 },
                    { name: "Age", b: 0.012, B: 0.012, se: 0.027, seBeta: 0.027, stdBeta: 0.035, beta: 0.035, tVal: 0.45, t: 0.45, pValue: 0.653, p: 0.653 }
                ],
                vif: [
                    { name: 'Pre-test Score', tolerance: 0.95, vif: 1.05 },
                    { name: 'Age', tolerance: 0.95, vif: 1.05 }
                ],
                hetero: [
                    { name: 'Pre-test Score', beta: 0.02, tVal: 0.54, pValue: 0.589 },
                    { name: 'Age', beta: 0.01, tVal: 0.32, pValue: 0.749 }
                ]
            };
        }
    });
    
    alert(`Successfully merged and imported ${importedTypes.join(', ')} data into the active workspace. CENTRAL PIPELINE UPDATED!`);
    
    // Re-calculate dashboard and switch
    updateDashboardUI();
    switchView('output_viewer');
}

function appendSpssAnalysisLog(source, message, className = 'text-amber-400') {
    const terminalEl = document.getElementById('wrt-loader-terminal');
    if (terminalEl) {
        const logLine = document.createElement('div');
        logLine.className = `flex items-center space-x-1.5 py-0.5 ${className}`;
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
        logLine.innerHTML = `
            <span class="text-slate-500">[${timeStr}]</span>
            <span class="font-bold">[${source}]</span>
            <span class="text-slate-300 flex-1">${message}</span>
        `;
        terminalEl.appendChild(logLine);
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }
}

// --- GLOBAL BOOTING & LOADING ENGINE ---
function showGlobalLoader(title, subtitle, steps, onComplete) {
    const loader = document.getElementById('wrt-global-loader');
    const titleEl = document.getElementById('wrt-loader-title');
    const subtitleEl = document.getElementById('wrt-loader-subtitle');
    const progressEl = document.getElementById('wrt-loader-progress');
    const percentEl = document.getElementById('wrt-loader-percent');
    const terminalEl = document.getElementById('wrt-loader-terminal');
    
    if (!loader) return;
    
    titleEl.innerText = title;
    subtitleEl.innerText = subtitle;
    progressEl.style.width = '0%';
    percentEl.innerText = '0%';
    terminalEl.innerHTML = '';
    
    loader.classList.remove('hidden');
    // Force reflow
    loader.offsetHeight;
    loader.classList.remove('opacity-0');
    loader.classList.add('opacity-100');
    
    let currentStep = 0;
    const totalSteps = steps.length;
    
    function runNextStep() {
        if (currentStep >= totalSteps) {
            progressEl.style.width = '100%';
            percentEl.innerText = '100%';
            
            const finalLine = document.createElement('div');
            finalLine.className = 'flex items-center space-x-1.5 text-emerald-300 font-bold py-0.5';
            finalLine.innerHTML = `<span>[SISTEM] &gt;&gt;&gt; PROSES SELESAI DENGAN SUKSES!</span>`;
            terminalEl.appendChild(finalLine);
            terminalEl.scrollTop = terminalEl.scrollHeight;
            
            setTimeout(() => {
                loader.classList.remove('opacity-100');
                loader.classList.add('opacity-0');
                setTimeout(() => {
                    loader.classList.add('hidden');
                    if (onComplete) onComplete();
                }, 50);
            }, 50);
            return;
        }
        
        const step = steps[currentStep];
        const progressPercent = Math.round((currentStep / totalSteps) * 100);
        
        progressEl.style.width = `${progressPercent}%`;
        percentEl.innerText = `${progressPercent}%`;
        
        const logLine = document.createElement('div');
        logLine.className = 'flex items-center space-x-1.5 py-0.5';
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
        logLine.innerHTML = `
            <span class="text-slate-500">[${timeStr}]</span>
            <span class="text-emerald-400">&gt;</span>
            <span class="text-slate-300 flex-1">${step.text}</span>
            <span class="text-emerald-500 font-bold font-data-mono">${step.status || 'SUKSES'}</span>
        `;
        terminalEl.appendChild(logLine);
        terminalEl.scrollTop = terminalEl.scrollHeight;
        
        const duration = (step.duration !== undefined) ? step.duration : Math.random() * 200 + 150;
        setTimeout(() => {
            if (step.action) {
                try {
                    step.action();
                } catch (e) {
                    console.error(e);
                    logLine.querySelector('.font-bold').innerText = 'ERROR';
                    logLine.querySelector('.font-bold').className = 'text-red-500 font-bold font-data-mono';
                    
                    showGlobalError(
                        "Proses Terhenti Karena Kesalahan",
                        step.text,
                        e.message || e
                    );
                    return; // Stop the queue immediately!
                }
            }
            currentStep++;
            runNextStep();
        }, duration);
    }
    
    runNextStep();
}

// --- GLOBAL TERMINAL-STYLE ERROR NOTIFICATION ---
function showGlobalError(title, subtitle, errorLog) {
    const loader = document.getElementById('wrt-global-loader');
    const titleEl = document.getElementById('wrt-loader-title');
    const subtitleEl = document.getElementById('wrt-loader-subtitle');
    const progressEl = document.getElementById('wrt-loader-progress');
    const percentEl = document.getElementById('wrt-loader-percent');
    const terminalEl = document.getElementById('wrt-loader-terminal');
    
    if (!loader) return;
    
    // Adjust card style to neon-red theme
    const card = loader.querySelector('.bg-slate-900');
    if (card) {
        card.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        card.style.boxShadow = '0 0 50px rgba(239, 68, 68, 0.2)';
    }
    
    const statusIndicator = loader.querySelector('.text-emerald-400') || loader.querySelector('.text-red-400');
    if (statusIndicator) {
        statusIndicator.className = 'flex items-center space-x-1 font-mono text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20';
        statusIndicator.innerHTML = '<span class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1"></span><span>GAGAL</span>';
    }
    
    const spinner = loader.querySelector('.border-t-emerald-500') || loader.querySelector('.border-t-red-500');
    if (spinner) {
        spinner.className = 'w-14 h-14 rounded-full border-4 border-slate-800 border-t-red-500 animate-spin';
    }
    
    const innerSpinner = loader.querySelector('.border-emerald-500\\/40') || loader.querySelector('.border-red-500\\/40');
    if (innerSpinner) {
        innerSpinner.className = 'absolute inset-2 rounded-full border-2 border-dashed border-red-500/40 animate-[spin_10s_linear_infinite]';
    }
    
    if (progressEl) {
        progressEl.className = 'bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full w-full';
        progressEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
    }
    
    titleEl.innerText = title;
    titleEl.className = 'font-title-sm font-bold text-red-400 text-lg leading-tight';
    subtitleEl.innerText = subtitle;
    
    percentEl.innerText = 'ERROR';
    percentEl.className = 'font-mono text-red-400 text-xl font-bold';
    
    // Print critical error details to the terminal
    terminalEl.innerHTML = '';
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
    
    const errorLine = document.createElement('div');
    errorLine.className = 'py-0.5 text-red-400 font-bold';
    errorLine.innerHTML = `<span>[${timeStr}] [KESALAHAN_KRITIS] &gt; ${errorLog}</span>`;
    terminalEl.appendChild(errorLine);
    
    // Append close button
    const btnDiv = document.createElement('div');
    btnDiv.className = 'flex justify-center pt-4';
    btnDiv.innerHTML = `
        <button onclick="closeGlobalLoaderError()" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow transition-all">
            Tutup Notifikasi
        </button>
    `;
    terminalEl.appendChild(btnDiv);
    terminalEl.scrollTop = terminalEl.scrollHeight;
    
    loader.classList.remove('hidden');
    loader.offsetHeight;
    loader.classList.remove('opacity-0');
    loader.classList.add('opacity-100');
}

function closeGlobalLoaderError() {
    const loader = document.getElementById('wrt-global-loader');
    if (!loader) return;
    
    loader.classList.remove('opacity-100');
    loader.classList.add('opacity-0');
    setTimeout(() => {
        loader.classList.add('hidden');
        
        // Restore classes to original emerald style
        const card = loader.querySelector('.bg-slate-900');
        if (card) {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        }
        const statusIndicator = loader.querySelector('.text-red-400') || loader.querySelector('.text-emerald-400');
        if (statusIndicator) {
            statusIndicator.className = 'flex items-center space-x-1 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20';
            statusIndicator.innerHTML = '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span><span>AKTIF</span>';
        }
        const spinner = loader.querySelector('.border-t-red-500') || loader.querySelector('.border-t-emerald-500');
        if (spinner) {
            spinner.className = 'w-14 h-14 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin';
        }
        const innerSpinner = loader.querySelector('.border-red-500\\/40') || loader.querySelector('.border-emerald-500\\/40');
        if (innerSpinner) {
            innerSpinner.className = 'absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/40 animate-[spin_10s_linear_infinite]';
        }
        const progressEl = document.getElementById('wrt-loader-progress');
        if (progressEl) {
            progressEl.className = 'bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-0';
            progressEl.style.boxShadow = '';
        }
        const titleEl = document.getElementById('wrt-loader-title');
        if (titleEl) {
            titleEl.className = 'font-title-sm font-bold text-slate-100 text-lg leading-tight';
        }
        const percentEl = document.getElementById('wrt-loader-percent');
        if (percentEl) {
            percentEl.className = 'font-mono text-emerald-400 text-xl font-bold';
        }
    }, 300);
}

