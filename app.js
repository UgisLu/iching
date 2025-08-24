/* ============================================================================
   APP.JS - I CHING LIETOTNES GALVENAIS KOORDINATORS (LABOTS)
   ============================================================================ */

'use strict';

/* ============================================================================
   ERROR HANDLING UN LOGGING SYSTEM
   ============================================================================ */

const AppLogger = {
    debug: (message, ...args) => {
        console.log('🔍 DEBUG:', message, ...args);
    },
    info: (message, ...args) => {
        console.log('ℹ️ INFO:', message, ...args);
    },
    warn: (message, ...args) => {
        console.warn('⚠️ WARN:', message, ...args);
    },
    error: (message, error = null, ...args) => {
        console.error('❌ ERROR:', message, ...args);
        if (error) {
            console.error('Stack trace:', error);
        }
    },
    success: (message, ...args) => {
        console.log('✅ SUCCESS:', message, ...args);
    }
};

// Globālā kļūdu apstrāde
window.addEventListener('error', (event) => {
    AppLogger.error('Global error caught:', event.error);
    showError('Radās neparedzēta kļūda aplikācijā');
});

window.addEventListener('unhandledrejection', (event) => {
    AppLogger.error('Unhandled promise rejection:', event.reason);
    showError('Radās asinhrona kļūda aplikācijā');
});

/* ============================================================================
   SAFE DOM UTILITIES
   ============================================================================ */

const SafeDOM = {
    getElementById: (id) => {
        try {
            const element = document.getElementById(id);
            if (!element) {
                AppLogger.warn(`Element not found: ${id}`);
            }
            return element;
        } catch (error) {
            AppLogger.error(`Error getting element ${id}:`, error);
            return null;
        }
    },
    
    querySelectorAll: (selector) => {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            AppLogger.error(`Error querying selector ${selector}:`, error);
            return [];
        }
    },
    
    querySelector: (selector) => {
        try {
            return document.querySelector(selector);
        } catch (error) {
            AppLogger.error(`Error querying selector ${selector}:`, error);
            return null;
        }
    },
    
    setContent: (elementId, content) => {
        try {
            const element = SafeDOM.getElementById(elementId);
            if (element) {
                element.textContent = content;
                return true;
            }
            return false;
        } catch (error) {
            AppLogger.error(`Error setting content for ${elementId}:`, error);
            return false;
        }
    },
    
    setHTML: (elementId, html) => {
        try {
            const element = SafeDOM.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                return true;
            }
            return false;
        } catch (error) {
            AppLogger.error(`Error setting HTML for ${elementId}:`, error);
            return false;
        }
    }
};

/* ============================================================================
   ENHANCED STATE MANAGEMENT
   ============================================================================ */

const initialAppState = {
    currentPage: 'methodSelection',
    selectedMethod: null,
    currentQuestion: '',
    currentQuestionCategory: null,
    progress: {
        step: 1,
        totalSteps: 4
    },
    isInitialized: false,
    modules: {
        hexagrams: false,
        methods: false,
        question: false,
        yarrow: false,
        coins: false,
        results: false
    },
    divinationResults: null,
    settings: {
        theme: 'dark',
        language: 'lv',
        accessibility: true,
        animations: true,
        sound: false
    },
    errors: []
};

let appState = { ...initialAppState };

// Safe state updates
function updateAppState(updates, source = 'unknown') {
    try {
        const prevState = { ...appState };
        appState = { ...appState, ...updates };
        
        AppLogger.debug(`State updated by ${source}:`, updates);
        
        // Validate critical state
        if (appState.progress.step < 1 || appState.progress.step > 4) {
            AppLogger.warn('Invalid progress step detected, resetting to 1');
            appState.progress.step = 1;
        }
        
        return true;
    } catch (error) {
        AppLogger.error('State update failed:', error);
        appState = prevState; // Rollback
        return false;
    }
}

/* ============================================================================
   SAFE MODULE CHECKING
   ============================================================================ */

const ModuleChecker = {
    isAvailable: (moduleName) => {
        try {
            const moduleMap = {
                'hexagrams': 'IChingHexagrams',
                'methods': 'MethodsModule',
                'question': 'QuestionModule',
                'yarrow': 'YarrowModule',
                'coins': 'CoinsModule',
                'results': 'ResultsModule'
            };
            
            const windowProp = moduleMap[moduleName];
            return windowProp && typeof window !== 'undefined' && window[windowProp];
        } catch (error) {
            AppLogger.error(`Error checking module ${moduleName}:`, error);
            return false;
        }
    },
    
    callMethod: (moduleName, methodName, ...args) => {
        try {
            const moduleMap = {
                'hexagrams': 'IChingHexagrams',
                'methods': 'MethodsModule',
                'question': 'QuestionModule',
                'yarrow': 'YarrowModule',
                'coins': 'CoinsModule',
                'results': 'ResultsModule'
            };
            
            const windowProp = moduleMap[moduleName];
            
            if (!windowProp || !window[windowProp]) {
                AppLogger.warn(`Module ${moduleName} not available`);
                return false;
            }
            
            const method = window[windowProp][methodName];
            if (typeof method !== 'function') {
                AppLogger.warn(`Method ${methodName} not found in module ${moduleName}`);
                return false;
            }
            
            const result = method(...args);
            AppLogger.debug(`Called ${moduleName}.${methodName}`, args);
            return result;
        } catch (error) {
            AppLogger.error(`Error calling ${moduleName}.${methodName}:`, error);
            return false;
        }
    }
};

/* ============================================================================
   PAPILDINĀJUMS - IChingApp INICIALIZĀCIJA
   ============================================================================ */

if (!window.IChingApp) window.IChingApp = {};

window.IChingApp.setCurrentQuestion = setCurrentQuestion;
window.IChingApp.proceedToDivination = proceedToDivination;

/* ============================================================================
   PAGE MANAGEMENT AR ERROR HANDLING
   ============================================================================ */

const pages = {
    methodSelection: {
        id: 'methodSelection',
        step: 1,
        title: 'Metožu izvēle',
        next: 'questionPage',
        prev: null
    },
    questionPage: {
        id: 'questionPage',
        step: 2,
        title: 'Jautājuma formulēšana',
        next: null,
        prev: 'methodSelection'
    },
    yarrowPage: {
        id: 'yarrowPage',
        step: 3,
        title: 'Milleņu process',
        next: 'resultPage',
        prev: 'questionPage'
    },
    coinsPage: {
        id: 'coinsPage',
        step: 3,
        title: 'Monētu metīšana',
        next: 'resultPage',
        prev: 'questionPage'
    },
    resultPage: {
        id: 'resultPage',
        step: 4,
        title: 'Rezultātu interpretācija',
        next: null,
        prev: null
    }
};

/* ============================================================================
   INITIALIZATION AR PILNU ERROR HANDLING
   ============================================================================ */

async function initializeApp() {
    try {
        AppLogger.info('Initializing I Ching Application...');

        // 1. Gaidīt DOM ready
        await waitForDOMReady();
        AppLogger.debug('DOM ready');

        // 2. Setup error container pirmais
        createErrorContainer();
        AppLogger.debug('Error container created');

        // 3. Load settings (ar error handling)
        await loadSettings();
        AppLogger.debug('Settings loaded');

        // 4. Initialize modules (ar error handling)
        await initializeModules();
        AppLogger.debug('Modules initialized');

        // 5. Setup event listeners (ar error handling)
        setupEventListeners();
        AppLogger.debug('Event listeners setup');

        // 6. Setup navigation
        setupProgressNavigation();
        AppLogger.debug('Progress navigation setup');

        // 7. Setup accessibility
        setupAccessibility();
        AppLogger.debug('Accessibility setup');

        // 8. Show initial page
        showPage('methodSelection');
        updateProgress(1);

        // 9. Mark as initialized
        updateAppState({ isInitialized: true }, 'initializeApp');
        
        AppLogger.success('I Ching Application initialized successfully');

    } catch (error) {
        AppLogger.error('Failed to initialize app:', error);
        showCriticalError('Lietotnes inicializācija neizdevās. Lūdzu pārlādējiet lapu.');
    }
}

function waitForDOMReady() {
    return new Promise(resolve => {
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        } catch (error) {
            AppLogger.error('DOM ready check failed:', error);
            resolve(); // Continue anyway
        }
    });
}

async function initializeModules() {
    try {
        const moduleNames = ['hexagrams', 'methods', 'question', 'yarrow', 'coins', 'results'];
        
        for (const moduleName of moduleNames) {
            try {
                if (ModuleChecker.isAvailable(moduleName)) {
                    // Special handling for modules that need initialization
                    if (moduleName === 'question') {
                        const success = ModuleChecker.callMethod('question', 'initialize');
                        if (success) {
                            updateAppState({ 
                                modules: { ...appState.modules, [moduleName]: true } 
                            }, `initialize-${moduleName}`);
                            AppLogger.success(`${moduleName} module ready`);
                        } else {
                            AppLogger.warn(`${moduleName} module initialization failed`);
                        }
                    } else {
                        updateAppState({ 
                            modules: { ...appState.modules, [moduleName]: true } 
                        }, `detect-${moduleName}`);
                        AppLogger.success(`${moduleName} module ready`);
                    }
                } else {
                    AppLogger.warn(`${moduleName} module not available`);
                }
            } catch (error) {
                AppLogger.error(`Error initializing module ${moduleName}:`, error);
            }
        }
        
        AppLogger.info(`Modules ready: ${Object.entries(appState.modules).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
        
    } catch (error) {
        AppLogger.error('Module initialization failed:', error);
        throw error;
    }
}

/* ============================================================================
   SAFE PAGE NAVIGATION
   ============================================================================ */

function showPage(pageId) {
    try {
        AppLogger.debug(`Attempting to show page: ${pageId}`);
        
        // Validate page ID
        if (!pages[pageId]) {
            AppLogger.error(`Invalid page ID: ${pageId}`);
            showError(`Nederīga lapa: ${pageId}`);
            return false;
        }
        
        // Hide all pages safely
        const allPages = SafeDOM.querySelectorAll('.page');
        allPages.forEach(page => {
            try {
                page.classList.remove('active');
                page.style.display = 'none';
            } catch (error) {
                AppLogger.warn('Error hiding page:', error);
            }
        });

        // Show target page
        const targetPage = SafeDOM.getElementById(pageId);
        if (!targetPage) {
            AppLogger.error(`Page element not found: ${pageId}`);
            showError(`Lapa nav atrasta: ${pageId}`);
            return false;
        }

        try {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            AppLogger.warn('Error showing page element:', error);
            // Try simpler approach
            targetPage.style.display = 'block';
        }

        // Update state
        updateAppState({ currentPage: pageId }, 'showPage');

        // Update progress and title
        const pageInfo = pages[pageId];
        if (pageInfo) {
            updateProgress(pageInfo.step);
            updatePageTitle(pageInfo.title);
        }

        // Announce to screen readers
        announcePageChange(pageId);

        // Page-specific setup
        if (pageId === 'coinsPage' || pageId === 'yarrowPage') {
            setupDivinationPage(pageId);
        } else if (pageId === 'resultPage') {
            setupResultsPage();
        }

        AppLogger.success(`Page shown: ${pageId}`);
        return true;
        
    } catch (error) {
        AppLogger.error(`Error showing page ${pageId}:`, error);
        showError(`Kļūda rādot lapu: ${pageId}`);
        return false;
    }
}

// LABOTA RESULTS PAGE SETUP
function setupResultsPage() {
    try {
        AppLogger.debug('Setting up results page');
        
        // Check if we have results
        if (!appState.divinationResults && !window.divinationResults) {
            AppLogger.warn('No divination results available');
            showError('Nav pieejami pareģošanas rezultāti');
            return false;
        }
        
        // Try to load results using available functions
        const resultMethods = [
            () => ModuleChecker.callMethod('results', 'initializeResults'),
            () => ModuleChecker.callMethod('results', 'loadResults'),
            () => typeof loadDivinationResults === 'function' && loadDivinationResults(),
            () => typeof initializeResults === 'function' && initializeResults(),
            () => displayBasicResults()
        ];
        
        let success = false;
        for (const method of resultMethods) {
            try {
                const result = method();
                if (result !== false && result !== null && result !== undefined) {
                    success = true;
                    break;
                }
            } catch (error) {
                AppLogger.warn('Result method failed:', error);
            }
        }
        
        if (!success) {
            AppLogger.warn('All result methods failed, showing basic results');
            displayBasicResults();
        }
        
        return true;
        
    } catch (error) {
        AppLogger.error('Error setting up results page:', error);
        showError('Kļūda ielādējot rezultātu lapu');
        return false;
    }
}

// Vienkārša rezultātu attēlošana, ja nav citu opciju
function displayBasicResults() {
    try {
        const results = appState.divinationResults || window.divinationResults;
        
        if (!results) {
            return false;
        }
        
        const resultContainer = SafeDOM.getElementById('resultContainer') || 
                               SafeDOM.getElementById('resultPage') ||
                               SafeDOM.querySelector('.result-content');
        
        if (!resultContainer) {
            AppLogger.warn('No result container found');
            return false;
        }
        
        const basicHTML = `
            <div class="basic-results">
                <h2>Pareģošanas Rezultāti</h2>
                <div class="result-info">
                    <p><strong>Metode:</strong> ${results.method || 'Nav norādīta'}</p>
                    <p><strong>Jautājums:</strong> ${results.question || appState.currentQuestion || 'Nav norādīts'}</p>
                    ${results.hexagram ? `<p><strong>Heksagramma:</strong> #${results.hexagram.number || 'Nav'}</p>` : ''}
                    ${results.changingLines && results.changingLines.length > 0 ? 
                        `<p><strong>Mainīgās līnijas:</strong> ${results.changingLines.join(', ')}</p>` : ''}
                </div>
                <p><em>Pilnīgi rezultāti tiks ielādēti, kad būs pieejams rezultātu modulis.</em></p>
            </div>
        `;
        
        SafeDOM.setHTML(resultContainer.id, basicHTML);
        AppLogger.info('Basic results displayed');
        return true;
        
    } catch (error) {
        AppLogger.error('Error displaying basic results:', error);
        return false;
    }
}

function goToNextPage() {
    try {
        const currentPageInfo = pages[appState.currentPage];
        if (currentPageInfo && currentPageInfo.next) {
            showPage(currentPageInfo.next);
        } else {
            AppLogger.warn('No next page available');
        }
    } catch (error) {
        AppLogger.error('Error going to next page:', error);
    }
}

function goToPrevPage() {
    try {
        const currentPageInfo = pages[appState.currentPage];
        if (currentPageInfo && currentPageInfo.prev) {
            showPage(currentPageInfo.prev);
        } else {
            AppLogger.warn('No previous page available');
        }
    } catch (error) {
        AppLogger.error('Error going to previous page:', error);
    }
}

function goToResultPage() {
    showPage('resultPage');
}

/* ============================================================================
   METHOD SELECTION AR ERROR HANDLING
   ============================================================================ */

function selectMethod(method) {
    try {
        if (!method || (method !== 'yarrow' && method !== 'coins')) {
            AppLogger.error('Invalid method selected:', method);
            showError('Nederīga metode izvēlēta');
            return false;
        }

        updateAppState({ selectedMethod: method }, 'selectMethod');
        window.selectedDivinationMethod = method;

        // Update UI safely
        const methodCards = SafeDOM.querySelectorAll('.method-card');
        methodCards.forEach(card => {
            try {
                card.classList.remove('selected');
            } catch (error) {
                AppLogger.warn('Error removing selected class:', error);
            }
        });

        const selectedCard = SafeDOM.querySelector(`[data-method="${method}"]`);
        if (selectedCard) {
            try {
                selectedCard.classList.add('selected');
            } catch (error) {
                AppLogger.warn('Error adding selected class:', error);
            }
        }

        AppLogger.success('Method selected:', method);

        // Navigate to question page
        setTimeout(() => {
            showPage('questionPage');
        }, 500);
        
        return true;
        
    } catch (error) {
        AppLogger.error('Error selecting method:', error);
        showError('Kļūda izvēloties metodi');
        return false;
    }
}

/* ============================================================================
   QUESTION HANDLING AR ERROR HANDLING
   ============================================================================ */

function setCurrentQuestion(question, category = null) {
    try {
        if (typeof question !== 'string') {
            AppLogger.warn('Invalid question type:', typeof question);
            question = String(question || '');
        }
        
        updateAppState({ 
            currentQuestion: question,
            currentQuestionCategory: category 
        }, 'setCurrentQuestion');

        window.currentQuestion = question;
        window.currentQuestionCategory = category;

        AppLogger.debug('Question set:', question);
        if (category) AppLogger.debug('Category:', category);
        
        return true;
        
    } catch (error) {
        AppLogger.error('Error setting question:', error);
        return false;
    }
}

function proceedToDivination() {
    try {
        if (!appState.selectedMethod) {
            showError('Vispirms izvēlieties metodi!');
            return false;
        }

        if (!appState.currentQuestion || appState.currentQuestion.trim().length < 10) {
            showError('Lūdzu ievadiet jautājumu (vismaz 10 simboli)!');
            return false;
        }

        const targetPage = appState.selectedMethod === 'yarrow' ? 'yarrowPage' : 'coinsPage';
        return showPage(targetPage);
        
    } catch (error) {
        AppLogger.error('Error proceeding to divination:', error);
        showError('Kļūda pārejot uz pareģošanu');
        return false;
    }
}

/* ============================================================================
   DIVINATION PAGE SETUP AR ERROR HANDLING
   ============================================================================ */

function setupDivinationPage(pageId) {
    try {
        AppLogger.debug(`Setting up divination page: ${pageId}`);
        
        if (pageId === 'coinsPage') {
            return setupCoinsPage();
        } else if (pageId === 'yarrowPage') {
            return setupYarrowPage();
        }
        
        return false;
        
    } catch (error) {
        AppLogger.error('Error setting up divination page:', error);
        showError('Kļūda ielādējot pareģošanas lapu');
        return false;
    }
}

function setupCoinsPage() {
    try {
        if (!ModuleChecker.isAvailable('coins')) {
            AppLogger.warn('CoinsModule not available');
            showError('Monētu modulis nav pieejams');
            return false;
        }
        
        const success = ModuleChecker.callMethod('coins', 'initializeCoins');
        if (!success) {
            AppLogger.warn('Failed to initialize coins module');
            showError('Neizdevās inicializēt monētu moduli');
            return false;
        }
        
        AppLogger.success('Coins page setup complete');
        return true;
        
    } catch (error) {
        AppLogger.error('Error setting up coins page:', error);
        showError('Kļūda uzstādot monētu lapu');
        return false;
    }
}

function setupYarrowPage() {
    try {
        if (!ModuleChecker.isAvailable('yarrow')) {
            AppLogger.warn('YarrowModule not available');
            showError('Milleņu modulis nav pieejams');
            return false;
        }
        
        const success = ModuleChecker.callMethod('yarrow', 'initializeYarrow');
        if (!success) {
            AppLogger.warn('Failed to initialize yarrow module');
            showError('Neizdevās inicializēt milleņu moduli');
            return false;
        }
        
        AppLogger.success('Yarrow page setup complete');
        return true;
        
    } catch (error) {
        AppLogger.error('Error setting up yarrow page:', error);
        showError('Kļūda uzstādot milleņu lapu');
        return false;
    }
}

/* ============================================================================
   PROGRESS MANAGEMENT AR ERROR HANDLING
   ============================================================================ */

function updateProgress(step) {
    try {
        if (!Number.isInteger(step) || step < 1 || step > 4) {
            AppLogger.warn('Invalid progress step:', step);
            return false;
        }
        
        const progressFill = SafeDOM.getElementById('progressFill');
        const steps = SafeDOM.querySelectorAll('.progress-steps .step');

        if (progressFill) {
            try {
                const percentage = (step / 4) * 100;
                progressFill.style.width = percentage + '%';
                progressFill.setAttribute('aria-valuenow', step);
            } catch (error) {
                AppLogger.warn('Error updating progress fill:', error);
            }
        }

        steps.forEach((stepEl, index) => {
            try {
                stepEl.classList.remove('active', 'completed');

                if (index + 1 < step) {
                    stepEl.classList.add('completed');
                } else if (index + 1 === step) {
                    stepEl.classList.add('active');
                }
            } catch (error) {
                AppLogger.warn('Error updating step element:', error);
            }
        });

        updateAppState({ 
            progress: { ...appState.progress, step } 
        }, 'updateProgress');
        
        AppLogger.debug('Progress updated to step:', step);
        return true;
        
    } catch (error) {
        AppLogger.error('Error updating progress:', error);
        return false;
    }
}

function setupProgressNavigation() {
    try {
        const steps = SafeDOM.querySelectorAll('.progress-steps .step');

        steps.forEach((step, index) => {
            try {
                step.addEventListener('click', () => {
                    try {
                        const stepNumber = index + 1;

                        if (stepNumber <= appState.progress.step) {
                            const pageIds = ['methodSelection', 'questionPage', getDivinationPageId(), 'resultPage'];
                            const targetPageId = pageIds[stepNumber - 1];

                            if (targetPageId) {
                                showPage(targetPageId);
                            }
                        }
                    } catch (error) {
                        AppLogger.error('Error in step click handler:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding step click listener:', error);
            }
        });
        
        AppLogger.debug('Progress navigation setup complete');
        
    } catch (error) {
        AppLogger.error('Error setting up progress navigation:', error);
    }
}

function getDivinationPageId() {
    try {
        return appState.selectedMethod === 'yarrow' ? 'yarrowPage' : 'coinsPage';
    } catch (error) {
        AppLogger.error('Error getting divination page ID:', error);
        return 'coinsPage'; // Default fallback
    }
}

/* ============================================================================
   EVENT LISTENERS AR ERROR HANDLING
   ============================================================================ */

function setupEventListeners() {
    try {
        setupMethodSelectionListeners();
        setupQuestionPageListeners();
        setupGlobalKeyboardShortcuts();
        setupNavigationListeners();
        
        AppLogger.debug('Event listeners setup complete');
        
    } catch (error) {
        AppLogger.error('Error setting up event listeners:', error);
    }
}

function setupMethodSelectionListeners() {
    try {
        const methodCards = SafeDOM.querySelectorAll('.method-card');

        methodCards.forEach(card => {
            try {
                card.addEventListener('click', () => {
                    try {
                        const method = card.getAttribute('data-method');
                        selectMethod(method);
                    } catch (error) {
                        AppLogger.error('Error in method card click:', error);
                    }
                });

                card.addEventListener('keydown', (event) => {
                    try {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            const method = card.getAttribute('data-method');
                            selectMethod(method);
                        }
                    } catch (error) {
                        AppLogger.error('Error in method card keydown:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding method card listeners:', error);
            }
        });
        
    } catch (error) {
        AppLogger.error('Error setting up method selection listeners:', error);
    }
}

function setupQuestionPageListeners() {
    try {
        const continueBtn = SafeDOM.getElementById('questionContinueBtn');
        const backBtn = SafeDOM.getElementById('questionBackBtn');

        if (continueBtn) {
            try {
                continueBtn.addEventListener('click', () => {
                    try {
                        proceedToDivination();
                    } catch (error) {
                        AppLogger.error('Error in continue button click:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding continue button listener:', error);
            }
        }

        if (backBtn) {
            try {
                backBtn.addEventListener('click', () => {
                    try {
                        showPage('methodSelection');
                    } catch (error) {
                        AppLogger.error('Error in back button click:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding back button listener:', error);
            }
        }
        
    } catch (error) {
        AppLogger.error('Error setting up question page listeners:', error);
    }
}

function setupNavigationListeners() {
    try {
        const backButtons = SafeDOM.querySelectorAll('[id$="BackBtn"]');
        const nextButtons = SafeDOM.querySelectorAll('[id$="NextBtn"]');

        backButtons.forEach(btn => {
            try {
                btn.addEventListener('click', () => {
                    try {
                        goToPrevPage();
                    } catch (error) {
                        AppLogger.error('Error in back button click:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding back button listener:', error);
            }
        });

        nextButtons.forEach(btn => {
            try {
                btn.addEventListener('click', () => {
                    try {
                        goToNextPage();
                    } catch (error) {
                        AppLogger.error('Error in next button click:', error);
                    }
                });
            } catch (error) {
                AppLogger.warn('Error adding next button listener:', error);
            }
        });
        
    } catch (error) {
        AppLogger.error('Error setting up navigation listeners:', error);
    }
}

function setupGlobalKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', (event) => {
            try {
                if (event.ctrlKey || event.metaKey) {
                    switch (event.key) {
                        case 'ArrowLeft':
                            event.preventDefault();
                            goToPrevPage();
                            break;
                        case 'ArrowRight':
                            event.preventDefault();
                            goToNextPage();
                            break;
                        case 'Home':
                            event.preventDefault();
                            showPage('methodSelection');
                            break;
                        case 'r':
                        case 'R':
                            if (appState.currentPage === 'coinsPage' || appState.currentPage === 'yarrowPage') {
                                event.preventDefault();
                                resetDivination();
                            }
                            break;
                    }
                }

                if (event.key === 'Escape') {
                    if (appState.currentPage !== 'methodSelection') {
                        showPage('methodSelection');
                    }
                }
            } catch (error) {
                AppLogger.error('Error in keyboard shortcut handler:', error);
            }
        });
        
    } catch (error) {
        AppLogger.error('Error setting up keyboard shortcuts:', error);
    }
}

/* ============================================================================
   RESULTS HANDLING AR ERROR HANDLING
   ============================================================================ */

function handleDivinationComplete(results) {
    try {
        updateAppState({ divinationResults: results }, 'handleDivinationComplete');
        window.divinationResults = results;

        AppLogger.success('Divination completed:', results);
        return true;
        
    } catch (error) {
        AppLogger.error('Error handling divination completion:', error);
        showError('Kļūda apstrādājot rezultātus');
        return false;
    }
}

function resetDivination() {
    try {
        const confirmed = confirm('Vai tiešām vēlaties sākt pareģošanu no jauna?');
        if (!confirmed) {
            return false;
        }
        
        updateAppState({ divinationResults: null }, 'resetDivination');
        window.divinationResults = null;

        if (appState.currentPage === 'coinsPage') {
            ModuleChecker.callMethod('coins', 'resetCoinsState');
        } else if (appState.currentPage === 'yarrowPage') {
            ModuleChecker.callMethod('yarrow', 'resetYarrowState');
        }

        AppLogger.info('Divination reset');
        return true;
        
    } catch (error) {
        AppLogger.error('Error resetting divination:', error);
        showError('Kļūda atiestatot pareģošanu');
        return false;
    }
}

/* ============================================================================
   SETTINGS MANAGEMENT AR ERROR HANDLING
   ============================================================================ */

async function loadSettings() {
    try {
        const saved = localStorage.getItem('ichingAppSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            updateAppState({ 
                settings: { ...appState.settings, ...settings } 
            }, 'loadSettings');
            applySettings();
        }
        return true;
        
    } catch (error) {
        AppLogger.warn('Could not load settings:', error);
        return false;
    }
}

function saveSettings() {
    try {
        localStorage.setItem('ichingAppSettings', JSON.stringify(appState.settings));
        return true;
    } catch (error) {
        AppLogger.warn('Could not save settings:', error);
        return false;
    }
}

function applySettings() {
    try {
        document.body.setAttribute('data-theme', appState.settings.theme);
        document.body.setAttribute('data-language', appState.settings.language);

        if (!appState.settings.animations) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }

        if (appState.settings.accessibility) {
            document.body.classList.add('accessibility-enhanced');
        } else {
            document.body.classList.remove('accessibility-enhanced');
        }
        
        return true;
        
    } catch (error) {
        AppLogger.error('Error applying settings:', error);
        return false;
    }
}

function updateSetting(key, value) {
    try {
        updateAppState({ 
            settings: { ...appState.settings, [key]: value } 
        }, `updateSetting-${key}`);
        
        applySettings();
        saveSettings();
        return true;
        
    } catch (error) {
        AppLogger.error('Error updating setting:', error);
        return false;
    }
}

/* ============================================================================
   ACCESSIBILITY AR ERROR HANDLING
   ============================================================================ */

function setupAccessibility() {
    try {
        setupSkipLink();
        setupScreenReaderAnnouncements();
        setupFocusManagement();
        
        AppLogger.debug('Accessibility setup complete');
        
    } catch (error) {
        AppLogger.error('Error setting up accessibility:', error);
    }
}

function setupSkipLink() {
    try {
        const skipLink = SafeDOM.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                try {
                    event.preventDefault();
                    const target = SafeDOM.getElementById('main-content');
                    if (target) {
                        target.focus();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                } catch (error) {
                    AppLogger.error('Error in skip link handler:', error);
                }
            });
        }
    } catch (error) {
        AppLogger.warn('Error setting up skip link:', error);
    }
}

function setupScreenReaderAnnouncements() {
    try {
        if (!SafeDOM.getElementById('globalAriaLive')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'globalAriaLive';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'false');
            liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            document.body.appendChild(liveRegion);
        }
    } catch (error) {
        AppLogger.error('Error setting up screen reader announcements:', error);
    }
}

function announceToScreenReader(message) {
    try {
        const liveRegion = SafeDOM.getElementById('globalAriaLive');
        if (liveRegion && typeof message === 'string') {
            liveRegion.textContent = message;
        }
    } catch (error) {
        AppLogger.warn('Error announcing to screen reader:', error);
    }
}

function announcePageChange(pageId) {
    try {
        const pageNames = {
            methodSelection: 'Metožu izvēles lapa',
            questionPage: 'Jautājuma ievades lapa',
            yarrowPage: 'Milleņu metodes lapa',
            coinsPage: 'Monētu metodes lapa',
            resultPage: 'Rezultātu lapa'
        };

        const pageName = pageNames[pageId] || pageId;
        announceToScreenReader('Atvērta ' + pageName);
    } catch (error) {
        AppLogger.warn('Error announcing page change:', error);
    }
}

function setupFocusManagement() {
    try {
        document.addEventListener('keydown', (event) => {
            try {
                if (event.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            } catch (error) {
                AppLogger.warn('Error in tab key handler:', error);
            }
        });

        document.addEventListener('mousedown', () => {
            try {
                document.body.classList.remove('keyboard-navigation');
            } catch (error) {
                AppLogger.warn('Error in mousedown handler:', error);
            }
        });
    } catch (error) {
        AppLogger.error('Error setting up focus management:', error);
    }
}

/* ============================================================================
   ERROR HANDLING AR UZLABOJUMIEM
   ============================================================================ */

function showError(message, type = 'error') {
    try {
        const errorContainer = SafeDOM.getElementById('globalErrorContainer') || createErrorContainer();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast ' + type;
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        errorContainer.appendChild(errorDiv);

        setTimeout(() => {
            try {
                errorDiv.classList.add('show');
            } catch (error) {
                AppLogger.warn('Error showing error toast:', error);
            }
        }, 100);

        setTimeout(() => {
            try {
                errorDiv.classList.remove('show');
                setTimeout(() => {
                    try {
                        if (errorDiv.parentNode) {
                            errorDiv.parentNode.removeChild(errorDiv);
                        }
                    } catch (error) {
                        AppLogger.warn('Error removing error toast:', error);
                    }
                }, 300);
            } catch (error) {
                AppLogger.warn('Error hiding error toast:', error);
            }
        }, 5000);

        announceToScreenReader('Kļūda: ' + message);
        AppLogger.error('Error shown to user:', message);
        
    } catch (error) {
        AppLogger.error('Error showing error message:', error);
        // Fallback to alert
        alert(message);
    }
}

function showCriticalError(message) {
    try {
        AppLogger.error('Critical error:', message);
        
        // Show immediate alert
        alert(message);
        
        // Try to show in container too
        showError(message, 'error');
        
        // Log to console
        console.error('💥 CRITICAL ERROR:', message);
        
    } catch (error) {
        console.error('Failed to show critical error:', error);
        alert('Kritiska kļūda: ' + message);
    }
}

function createErrorContainer() {
    try {
        if (SafeDOM.getElementById('globalErrorContainer')) {
            return SafeDOM.getElementById('globalErrorContainer');
        }
        
        const container = document.createElement('div');
        container.id = 'globalErrorContainer';
        container.className = 'error-container';
        container.style.cssText =
            'position: fixed; ' +
            'top: 20px; ' +
            'right: 20px; ' +
            'z-index: 10000; ' +
            'max-width: 400px;';
        document.body.appendChild(container);
        return container;
        
    } catch (error) {
        AppLogger.error('Error creating error container:', error);
        return null;
    }
}

function updatePageTitle(title) {
    try {
        document.title = title + ' | I Ching Pareģošana';
    } catch (error) {
        AppLogger.warn('Error updating page title:', error);
    }
}

/* ============================================================================
   UTILITY FUNCTIONS AR ERROR HANDLING
   ============================================================================ */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        try {
            const later = () => {
                try {
                    clearTimeout(timeout);
                    func(...args);
                } catch (error) {
                    AppLogger.error('Error in debounced function:', error);
                }
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        } catch (error) {
            AppLogger.error('Error in debounce:', error);
        }
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        try {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        } catch (error) {
            AppLogger.error('Error in throttle:', error);
        }
    };
}

function getAppState() {
    try {
        return { ...appState };
    } catch (error) {
        AppLogger.error('Error getting app state:', error);
        return {};
    }
}

function isModuleReady(moduleName) {
    try {
        return appState.modules[moduleName] === true;
    } catch (error) {
        AppLogger.error('Error checking module ready:', error);
        return false;
    }
}

/* ============================================================================
   ANALYTICS AR ERROR HANDLING
   ============================================================================ */

function trackEvent(category, action, label = null, value = null) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }

        AppLogger.info('Event tracked:', { category, action, label, value });
        
    } catch (error) {
        AppLogger.warn('Error tracking event:', error);
    }
}

/* ============================================================================
   GLOBAL EXPORTS AR ERROR HANDLING
   ============================================================================ */

if (typeof window !== 'undefined') {
    try {
        window.IChingApp = {
            initializeApp,
            showPage,
            selectMethod,
            setCurrentQuestion,
            proceedToDivination,
            goToResultPage,
            handleDivinationComplete,
            resetDivination,
            updateSetting,
            announceToScreenReader,
            showError,
            getAppState,
            isModuleReady,
            trackEvent,

            appState: () => ({ ...appState }),
            pages
        };

        window.selectMethod = selectMethod;
        window.showPage = showPage;
        window.goToResultPage = goToResultPage;
        window.handleCardKeydown = (event, method) => {
            try {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectMethod(method);
                }
            } catch (error) {
                AppLogger.error('Error in handleCardKeydown:', error);
            }
        };
        
        AppLogger.debug('Global exports set');
        
    } catch (error) {
        AppLogger.error('Error setting global exports:', error);
    }
}

/* ============================================================================
   AUTO-INITIALIZATION AR ERROR HANDLING
   ============================================================================ */

try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                initializeApp();
            } catch (error) {
                AppLogger.error('Error in DOMContentLoaded handler:', error);
                showCriticalError('Lietotnes ielāde neizdevās');
            }
        });
    } else {
        initializeApp();
    }
} catch (error) {
    AppLogger.error('Error setting up initialization:', error);
    showCriticalError('Kļūda uzstādot lietotni');
}

/* ============================================================================
   CSS STYLES AR ERROR HANDLING
   ============================================================================ */

try {
    const errorStyles = document.createElement('style');
    errorStyles.textContent = `
    .error-container {
        pointer-events: none;
    }

    .error-toast {
        background: rgba(244, 67, 54, 0.95);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border-left: 4px solid #f44336;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        font-weight: 600;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .error-toast.show {
        opacity: 1;
        transform: translateX(0);
    }

    .error-toast.warning {
        background: rgba(255, 193, 7, 0.95);
        color: #000;
        border-left-color: #ffc107;
    }

    .error-toast.success {
        background: rgba(76, 175, 80, 0.95);
        color: white;
        border-left-color: #4caf50;
    }

    .error-toast.info {
        background: rgba(33, 150, 243, 0.95);
        color: white;
        border-left-color: #2196f3;
    }

    @media (max-width: 768px) {
        .error-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        .error-toast {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
        }
    }

    .keyboard-navigation *:focus {
        outline: 2px solid #4CAF50 !important;
        outline-offset: 2px !important;
    }

    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .accessibility-enhanced {
        --transition-duration: 0.2s;
    }

    .accessibility-enhanced * {
        transition-duration: var(--transition-duration) !important;
    }
    `;

    document.head.appendChild(errorStyles);
    AppLogger.debug('Error styles injected');
    
} catch (error) {
    AppLogger.error('Error injecting styles:', error);
}

AppLogger.success('I Ching App.js loaded successfully!');

/* ============================================================================
   APP.JS PABEIGTS - LABOTS UN DROŠS GALVENAIS KOORDINATORS
   ============================================================================ */