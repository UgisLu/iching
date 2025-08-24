/* ============================================================================
   COINS.JS - I CHING MONĒTU METODES SIMULĀCIJAS MODULIS
   ATJAUNINĀTĀ VERSIJA AR UZLABOTO ERROR HANDLING - 2025
   ============================================================================ */

'use strict';

/* ============================================================================
   GLOBAL STATE MANAGEMENT
   ============================================================================ */

let coinsState = {
    currentRound: 1,
    maxRounds: 6,
    hexagramLines: [],
    changingLines: [],
    currentThrow: {
        coins: [null, null, null],
        values: [null, null, null],
        sum: null,
        lineValue: null
    },
    phase: 'ready',
    isAnimating: false,
    throwInProgress: false,
    autoAdvance: true,
    primaryHexagram: null,
    secondaryHexagram: null,
    hasChangingLines: false,
    startTime: null,
    throwTimes: [],
    totalTime: null,
    coinStyle: 'traditional',
    soundEnabled: false,
    animationSpeed: 'normal',
    showMath: false,
    currentQuestion: '',
    questionCategory: null,
    analytics: {
        totalThrows: 0,
        changingLinesCount: 0,
        averageThrowTime: 0,
        coinDistribution: { heads: 0, tails: 0 },
        lineDistribution: { 6: 0, 7: 0, 8: 0, 9: 0 }
    },
    // UZLABOJUMS: Initialization tracking
    initializationStatus: {
        attempts: 0,
        lastError: null,
        isInitialized: false,
        domElementsFound: 0,
        eventListenersAttached: 0
    }
};

/* ============================================================================
   COINS CONFIGURATION
   ============================================================================ */

const coinsConfig = {
    coins: {
        count: 3,
        values: {
            heads: 3,
            tails: 2
        },
        symbols: {
            heads: '☯',
            tails: '☰'
        }
    },

    lineValues: {
        6: {
            type: 'changing_yin',
            name: 'Mainīga Yin',
            symbol: '⚋',
            description: 'Pārtraukta līnija, kas mainīsies uz nepārtrauktu',
            changeTo: 'yang',
            probability: 0.125
        },
        7: {
            type: 'young_yang',
            name: 'Jauna Yang',
            symbol: '⚊',
            description: 'Nepārtraukta līnija, stabila',
            changeTo: null,
            probability: 0.375
        },
        8: {
            type: 'young_yin',
            name: 'Jauna Yin',
            symbol: '⚋',
            description: 'Pārtraukta līnija, stabila',
            changeTo: null,
            probability: 0.375
        },
        9: {
            type: 'changing_yang',
            name: 'Mainīga Yang',
            symbol: '⚊',
            description: 'Nepārtraukta līnija, kas mainīsies uz pārtrauktu',
            changeTo: 'yin',
            probability: 0.125
        }
    },

    animations: {
        coinFlip: {
            duration: 800,
            rotations: 3,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        },
        coinLand: {
            duration: 300,
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        lineAppear: {
            duration: 500,
            delay: 200
        },
        resultReveal: {
            duration: 1000,
            stagger: 100
        }
    },

    timing: {
        throwInterval: 1200,
        roundInterval: 800,
        completionDelay: 2000,
        autoAdvanceDelay: 1500
    },

    styles: {
        traditional: {
            coinSize: '60px',
            coinColor: '#DAA520',
            shadowColor: 'rgba(218, 165, 32, 0.4)',
            textColor: '#2C1810'
        },
        modern: {
            coinSize: '70px',
            coinColor: 'linear-gradient(45deg, #FFD700, #FFA500)',
            shadowColor: 'rgba(255, 215, 0, 0.6)',
            textColor: '#1a1a2e'
        },
        animated: {
            coinSize: '65px',
            coinColor: '#FFD700',
            shadowColor: 'rgba(255, 215, 0, 0.8)',
            textColor: '#000000'
        }
    },

    messages: {
        ready: 'Koncentrējieties uz savu jautājumu un nospiediet "Met Monētas"',
        throwing: 'Monētas griežas gaisā...',
        calculating: 'Aprēķina līnijas vērtību...',
        lineComplete: 'Līnija pabeigta! Turpinām ar nākamo.',
        changingLineFound: 'Atrasta mainīga līnija! Jūs saņemsiet divus heksagramus.',
        allComplete: 'Visas līnijas pabeigtas! Sagatavojiet rezultātus...',

        instructions: {
            1: 'Pirmā līnija (pamats): Situācijas sākums un pamatojums',
            2: 'Otrā līnija (attīstība): Iekšējā sagatavošanās un izaugsme',
            3: 'Trešā līnija (pāreja): Pāreja no iekšējā uz ārējo',
            4: 'Ceturtā līnija (darbība): Ārējā aktivitāte un iniciatīva',
            5: 'Piektā līnija (vadība): Atbildība un ietekme',
            6: 'Sestā līnija (kulminācija): Rezultāts un transformācija'
        }
    },

    // UZLABOJUMS: Enhanced configuration
    debug: {
        enabled: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        showTimings: true,
        trackEvents: true
    },

    retry: {
        maxAttempts: 3,
        delay: 500,
        timeout: 5000
    },

    fallback: {
        enableMinimalMode: true,
        showErrorMessages: true,
        allowManualRecovery: true
    }
};

/* ============================================================================
   DOM ELEMENT REFERENCES
   ============================================================================ */

let coinsElements = {
    container: null,
    coinsArea: null,
    controlPanel: null,
    resultsPanel: null,
    coin1: null,
    coin2: null,
    coin3: null,
    allCoins: [],
    throwButton: null,
    autoButton: null,
    resetButton: null,
    speedControl: null,
    styleControl: null,
    roundIndicator: null,
    instructionText: null,
    currentSum: null,
    currentLineValue: null,
    lineDescription: null,
    linePreview: null,
    hexagramDisplay: null,
    changingLinesDisplay: null,
    primaryHexagramDisplay: null,
    secondaryHexagramDisplay: null,
    completionMessage: null,
    mathDetails: null,
    soundToggle: null,
    liveRegion: null,
    statusDisplay: null,
    // UZLABOJUMS: Error display elements
    errorContainer: null,
    debugPanel: null
};

/* ============================================================================
   DEPENDENCY CHECKING
   ============================================================================ */

function checkDependencies() {
    const missing = [];

    if (typeof window === 'undefined' || !window.IChingHexagrams) {
        missing.push('hexagrams.js (window.IChingHexagrams)');
    }

    if (typeof getHexagramByLines !== 'function' &&
        (!window.IChingHexagrams || !window.IChingHexagrams.getHexagramByLines)) {
        missing.push('getHexagramByLines function');
    }

    if (typeof HEXAGRAMS === 'undefined' &&
        (!window.IChingHexagrams || !window.IChingHexagrams.HEXAGRAMS)) {
        missing.push('HEXAGRAMS data array');
    }

    return {
        isReady: missing.length === 0,
        missing: missing
    };
}

function waitForDependencies(maxWaitTime = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function checkAgain() {
            const depCheck = checkDependencies();

            if (depCheck.isReady) {
                debugLog('✅ All dependencies loaded for coins module');
                resolve();
                return;
            }

            if (Date.now() - startTime > maxWaitTime) {
                reject(new Error('Dependencies not loaded: ' + depCheck.missing.join(', ')));
                return;
            }

            setTimeout(checkAgain, 100);
        }

        checkAgain();
    });
}

/* ============================================================================
   UZLABOTĀS DOM WAITING FUNCTIONS
   ============================================================================ */

function waitForDOMElements(elementIds, maxWait = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function checkElements() {
            const missing = elementIds.filter(id => !document.getElementById(id));

            if (missing.length === 0) {
                debugLog('✅ All required DOM elements found');
                resolve({ success: true, missing: [] });
                return;
            }

            if (Date.now() - startTime > maxWait) {
                debugLog('⏰ Timeout waiting for DOM elements: ' + missing.join(', '));
                resolve({ success: false, missing: missing });
                return;
            }

            setTimeout(checkElements, 100);
        }

        checkElements();
    });
}

function waitForPageReady(maxWait = 3000) {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve(true);
            return;
        }

        let timeoutId;
        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            document.removeEventListener('DOMContentLoaded', onReady);
            window.removeEventListener('load', onReady);
        };

        const onReady = () => {
            cleanup();
            resolve(true);
        };

        document.addEventListener('DOMContentLoaded', onReady);
        window.addEventListener('load', onReady);

        timeoutId = setTimeout(() => {
            cleanup();
            resolve(false);
        }, maxWait);
    });
}

/* ============================================================================
   UZLABOTĀS INITIALIZATION FUNCTIONS
   ============================================================================ */

async function initializeCoins() {
    coinsState.initializationStatus.attempts++;
    const attempt = coinsState.initializationStatus.attempts;

    try {
        debugLog('🪙 Starting coins module initialization attempt ' + attempt + '...');

        // Step 1: Wait for page readiness
        const pageReady = await waitForPageReady();
        if (!pageReady) {
            debugLog('⚠️ Page not fully ready, proceeding anyway...');
        }

        // Step 2: Check if we're on the right page
        const coinsPage = document.getElementById('coinsPage');
        if (!coinsPage) {
            throw new Error('Coins page not found - may not be active');
        }

        // Step 3: Wait for essential DOM elements
        const essentialElements = ['coinsPage', 'coin1', 'coin2', 'coin3'];
        const domResult = await waitForDOMElements(essentialElements, 3000);

        if (!domResult.success && domResult.missing.length > 0) {
            debugLog('⚠️ Some essential elements missing: ' + domResult.missing.join(', '));

            // Try with reduced requirements
            const minimalElements = ['coinsPage'];
            const minimalResult = await waitForDOMElements(minimalElements, 1000);

            if (!minimalResult.success) {
                throw new Error('Cannot find coins page container');
            }
        }

        // Step 4: Wait for dependencies
        await waitForDependencies(3000);

        // Step 5: Load context
        loadDivinationContext();

        // Step 6: Cache DOM elements with enhanced error handling
        const cachingResult = cacheCoinsDOMElements();
        if (!cachingResult.success) {
            debugLog('⚠️ DOM caching issues: ' + cachingResult.errors.join(', '));

            // Continue with available elements
            if (cachingResult.criticalMissing) {
                throw new Error('Critical DOM elements missing: ' + cachingResult.criticalMissing.join(', '));
            }
        }

        // Step 7: Load preferences
        loadCoinsPreferences();

        // Step 8: Setup coins
        setupInitialCoins();

        // Step 9: Setup events with validation
        const eventResult = setupCoinsEventListenersWithValidation();
        if (!eventResult.success) {
            debugLog('⚠️ Some event listeners failed: ' + eventResult.warnings.join(', '));
        }

        // Step 10: Reset state
        resetCoinsState();

        // Step 11: Setup accessibility
        setupCoinsAccessibility();

        // Step 12: Final setup
        coinsState.startTime = Date.now();
        coinsState.initializationStatus.isInitialized = true;
        coinsState.initializationStatus.lastError = null;

        debugLog('🌟 Coins module initialized successfully on attempt ' + attempt);
        debugLog('📊 Initialization stats: ' +
            coinsState.initializationStatus.domElementsFound + ' DOM elements, ' +
            coinsState.initializationStatus.eventListenersAttached + ' event listeners');

        return { success: true, attempt: attempt };

    } catch (error) {
        debugLog('❌ Initialization attempt ' + attempt + ' failed: ' + error.message);
        coinsState.initializationStatus.lastError = error;

        if (attempt < coinsConfig.retry.maxAttempts) {
            debugLog('🔄 Retrying initialization in ' + (coinsConfig.retry.delay * attempt) + 'ms...');

            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, coinsConfig.retry.delay * attempt));
            return initializeCoins();
        } else {
            debugLog('💥 All initialization attempts failed');
            coinsState.initializationStatus.isInitialized = false;

            // Setup fallback functionality
            if (coinsConfig.fallback.enableMinimalMode) {
                setupMinimalCoins();
            }

            if (coinsConfig.fallback.showErrorMessages) {
                showCoinsError('Monētu moduļa inicializācija neizdevās pēc ' + attempt + ' mēģinājumiem. ' +
                    'Pārlādējiet lapu vai izmantojiet Yarrow metodi.');
            }

            return { success: false, error: error, attempt: attempt };
        }
    }
}

function cacheCoinsDOMElements() {
    const errors = [];
    const warnings = [];
    const criticalMissing = [];
    let elementsFound = 0;

    // Core containers
    coinsElements.container = document.getElementById('coinsPage');
    coinsElements.coinsArea = document.getElementById('coinsArea');
    coinsElements.controlPanel = document.getElementById('coinsControlPanel');
    coinsElements.resultsPanel = document.getElementById('coinsResultsPanel');

    if (!coinsElements.container) {
        criticalMissing.push('coinsPage');
        errors.push('coinsPage container not found');
    } else {
        elementsFound++;
    }

    // Essential coin elements
    coinsElements.coin1 = document.getElementById('coin1');
    coinsElements.coin2 = document.getElementById('coin2');
    coinsElements.coin3 = document.getElementById('coin3');
    coinsElements.allCoins = [coinsElements.coin1, coinsElements.coin2, coinsElements.coin3];

    const missingCoins = coinsElements.allCoins
        .map((coin, index) => coin ? null : 'coin' + (index + 1))
        .filter(Boolean);

    if (missingCoins.length > 0) {
        if (missingCoins.length === 3) {
            criticalMissing.push('all coin elements');
            errors.push('No coin elements found');
        } else {
            warnings.push('Missing coin elements: ' + missingCoins.join(', '));
        }
    }

    elementsFound += (3 - missingCoins.length);

    // Control elements (important but not critical)
    const controlElements = {
        throwButton: 'coinsThrowButton',
        autoButton: 'coinsAutoButton',
        resetButton: 'coinsResetButton',
        speedControl: 'coinsSpeedControl',
        styleControl: 'coinsStyleControl'
    };

    Object.keys(controlElements).forEach(key => {
        const element = document.getElementById(controlElements[key]);
        coinsElements[key] = element;
        if (element) {
            elementsFound++;
        } else {
            if (key === 'throwButton') {
                criticalMissing.push(controlElements[key]);
                errors.push('Throw button not found');
            } else {
                warnings.push(controlElements[key] + ' not found');
            }
        }
    });

    // UI elements (optional)
    const uiElements = {
        roundIndicator: 'coinsRoundIndicator',
        instructionText: 'coinsInstructionText',
        currentSum: 'coinsCurrentSum',
        currentLineValue: 'coinsCurrentLineValue',
        lineDescription: 'coinsLineDescription'
    };

    Object.keys(uiElements).forEach(key => {
        const element = document.getElementById(uiElements[key]);
        coinsElements[key] = element;
        if (element) {
            elementsFound++;
        }
    });

    // Display elements (optional)
    const displayElements = {
        linePreview: 'coinsLinePreview',
        hexagramDisplay: 'coinsHexagramDisplay',
        changingLinesDisplay: 'coinsChangingLinesDisplay'
    };

    Object.keys(displayElements).forEach(key => {
        const element = document.getElementById(displayElements[key]);
        coinsElements[key] = element;
        if (element) {
            elementsFound++;
        }
    });

    // Results elements (optional)
    const resultElements = {
        primaryHexagramDisplay: 'coinsPrimaryHexagram',
        secondaryHexagramDisplay: 'coinsSecondaryHexagram',
        completionMessage: 'coinsCompletionMessage'
    };

    Object.keys(resultElements).forEach(key => {
        const element = document.getElementById(resultElements[key]);
        coinsElements[key] = element;
        if (element) {
            elementsFound++;
        }
    });

    // Advanced elements (optional)
    const advancedElements = {
        mathDetails: 'coinsMathDetails',
        soundToggle: 'coinsSoundToggle',
        liveRegion: 'coinsAriaLive',
        statusDisplay: 'coinsStatus',
        errorContainer: 'coinsError'
    };

    Object.keys(advancedElements).forEach(key => {
        const element = document.getElementById(advancedElements[key]);
        coinsElements[key] = element;
        if (element) {
            elementsFound++;
        }
    });

    // Update statistics
    coinsState.initializationStatus.domElementsFound = elementsFound;

    // Report results
    if (errors.length > 0 || warnings.length > 0) {
        debugLog('📋 DOM caching results:', {
            found: elementsFound,
            errors: errors.length,
            warnings: warnings.length,
            critical: criticalMissing.length
        });

        if (errors.length > 0) {
            debugLog('❌ DOM errors: ' + errors.join(', '));
        }
        if (warnings.length > 0) {
            debugLog('⚠️ DOM warnings: ' + warnings.join(', '));
        }
    } else {
        debugLog('✅ All DOM elements cached successfully (' + elementsFound + ' elements)');
    }

    return {
        success: criticalMissing.length === 0,
        errors: errors,
        warnings: warnings,
        criticalMissing: criticalMissing,
        elementsFound: elementsFound
    };
}

function loadDivinationContext() {
    if (typeof window !== 'undefined' && window.currentQuestion) {
        coinsState.currentQuestion = window.currentQuestion;
        coinsState.questionCategory = window.currentQuestionCategory;
        debugLog('🎯 Loaded question: ' + coinsState.currentQuestion.substring(0, 50) + '...');
    }

    if (typeof window !== 'undefined' && window.selectedDivinationMethod) {
        debugLog('🪙 Loaded divination method: ' + window.selectedDivinationMethod);
    }
}

function setupInitialCoins() {
    let setupCount = 0;

    coinsElements.allCoins.forEach((coin, index) => {
        if (!coin) {
            debugLog('⚠️ Coin ' + (index + 1) + ' element not available for setup');
            return;
        }

        const coinId = index + 1;

        coin.className = 'coin coin-neutral';
        coin.setAttribute('data-coin-id', coinId);
        coin.setAttribute('data-state', 'neutral');
        coin.setAttribute('role', 'img');
        coin.setAttribute('aria-label', 'Monēta ' + (index + 1) + ': Gatava metīšanai');

        coin.innerHTML = '<div class="coin-face">' +
            '<span class="coin-symbol">🪙</span>' +
            '</div>';

        applyCoinStyle(coin);
        setupCount++;
    });

    debugLog('🪙 Setup ' + setupCount + ' coins out of 3');
}

function applyCoinStyle(coin) {
    if (!coin) return;

    const style = coinsConfig.styles[coinsState.coinStyle];
    coin.style.width = style.coinSize;
    coin.style.height = style.coinSize;
    coin.style.background = style.coinColor;
    coin.style.boxShadow = '0 4px 12px ' + style.shadowColor;
    coin.style.color = style.textColor;
}

/* ============================================================================
   UZLABOTIE EVENT HANDLERS
   ============================================================================ */

function setupCoinsEventListenersWithValidation() {
    const warnings = [];
    let successCount = 0;

    // Essential button events
    if (coinsElements.throwButton) {
        coinsElements.throwButton.addEventListener('click', handleThrowCoins);
        successCount++;
        debugLog('✅ Throw button event listener attached');
    } else {
        warnings.push('throwButton not found - primary functionality unavailable');
        debugLog('❌ Throw button not found');
    }

    if (coinsElements.autoButton) {
        coinsElements.autoButton.addEventListener('click', handleAutoToggle);
        successCount++;
    } else {
        warnings.push('autoButton not found - auto advance unavailable');
    }

    if (coinsElements.resetButton) {
        coinsElements.resetButton.addEventListener('click', handleCoinsReset);
        successCount++;
    } else {
        warnings.push('resetButton not found - manual reset unavailable');
    }

    // Control events
    if (coinsElements.speedControl) {
        coinsElements.speedControl.addEventListener('change', handleSpeedChange);
        successCount++;
    } else {
        warnings.push('speedControl not found - speed adjustment unavailable');
    }

    if (coinsElements.styleControl) {
        coinsElements.styleControl.addEventListener('change', handleStyleChange);
        successCount++;
    } else {
        warnings.push('styleControl not found - style switching unavailable');
    }

    if (coinsElements.soundToggle) {
        coinsElements.soundToggle.addEventListener('change', handleSoundToggle);
        successCount++;
    } else {
        warnings.push('soundToggle not found - sound control unavailable');
    }

    // Coin click events
    let coinEventsAttached = 0;
    coinsElements.allCoins.forEach((coin, index) => {
        if (coin) {
            coin.addEventListener('click', () => handleCoinClick(index));
            successCount++;
            coinEventsAttached++;
        } else {
            warnings.push('coin' + (index + 1) + ' not found - click interaction unavailable');
        }
    });

    // Global events (always available)
    try {
        document.addEventListener('keydown', handleCoinsKeyboard);
        window.addEventListener('beforeunload', saveCoinsProgress);
        successCount += 2;
        debugLog('✅ Global event listeners attached');
    } catch (error) {
        warnings.push('Failed to attach global event listeners: ' + error.message);
    }

    // Update statistics
    coinsState.initializationStatus.eventListenersAttached = successCount;

    debugLog('📡 Event listeners setup complete:', {
        success: successCount,
        warnings: warnings.length,
        coinEvents: coinEventsAttached + '/3'
    });

    return {
        success: warnings.length === 0,
        successCount: successCount,
        warnings: warnings
    };
}

function handleThrowCoins() {
    if (coinsState.isAnimating || coinsState.throwInProgress) {
        debugLog('🛑 Throw coins blocked - animation or throw in progress');
        return;
    }

    if (coinsState.phase === 'completed') {
        debugLog('🎯 Proceeding to results page');
        proceedToResults();
        return;
    }

    debugLog('🎲 Starting coin throw for round ' + coinsState.currentRound);
    performCoinThrow();
}

function handleAutoToggle() {
    coinsState.autoAdvance = !coinsState.autoAdvance;
    debugLog('⚡ Auto advance toggled: ' + (coinsState.autoAdvance ? 'ON' : 'OFF'));
    updateAutoButton();
    saveCoinsPreferences();
}

function handleCoinsReset() {
    if (confirm('Vai tiešām vēlaties sākt no jauna? Viss progress tiks zaudēts.')) {
        debugLog('🔄 Resetting coins state');
        resetCoinsState();
        setupInitialCoins();
        updateCoinsUI();
    }
}

function handleSpeedChange(event) {
    coinsState.animationSpeed = event.target.value;
    debugLog('🏃 Animation speed changed to: ' + coinsState.animationSpeed);
    updateAnimationSpeeds();
    saveCoinsPreferences();
}

function handleStyleChange(event) {
    coinsState.coinStyle = event.target.value;
    debugLog('🎨 Coin style changed to: ' + coinsState.coinStyle);
    coinsElements.allCoins.forEach(coin => applyCoinStyle(coin));
    saveCoinsPreferences();
}

function handleSoundToggle(event) {
    coinsState.soundEnabled = event.target.checked;
    debugLog('🔊 Sound ' + (coinsState.soundEnabled ? 'enabled' : 'disabled'));
    saveCoinsPreferences();
}

function handleCoinClick(coinIndex) {
    if (coinsState.throwInProgress) return;
    debugLog('🪙 Coin ' + (coinIndex + 1) + ' clicked');

    // UZLABOJUMS: Enhanced coin interaction
    if (coinsState.phase === 'ready' && !coinsState.isAnimating) {
        const coin = coinsElements.allCoins[coinIndex];
        if (coin) {
            // Visual feedback for coin click
            coin.style.transform = 'scale(1.1)';
            setTimeout(() => {
                coin.style.transform = '';
            }, 150);
        }
    }
}

function handleCoinsKeyboard(event) {
    if (coinsElements.container?.style.display !== 'block') return;

    switch (event.key) {
        case ' ':
        case 'Enter':
            event.preventDefault();
            handleThrowCoins();
            break;
        case 'a':
        case 'A':
            handleAutoToggle();
            break;
        case 'r':
        case 'R':
            if (event.ctrlKey) {
                event.preventDefault();
                handleCoinsReset();
            }
            break;
        case '1':
        case '2':
        case '3':
            const speeds = ['slow', 'normal', 'fast'];
            const speedIndex = parseInt(event.key) - 1;
            if (speeds[speedIndex]) {
                coinsState.animationSpeed = speeds[speedIndex];
                if (coinsElements.speedControl) {
                    coinsElements.speedControl.value = speeds[speedIndex];
                }
                updateAnimationSpeeds();
                debugLog('⌨️ Speed changed via keyboard: ' + speeds[speedIndex]);
            }
            break;
        case 'd':
        case 'D':
            if (event.ctrlKey && coinsConfig.debug.enabled) {
                event.preventDefault();
                debugCoinsState();
            }
            break;
    }
}

/* ============================================================================
   CORE COIN THROWING LOGIC - ENHANCED
   ============================================================================ */

async function performCoinThrow() {
    try {
        coinsState.throwInProgress = true;
        coinsState.phase = 'throwing';

        debugLog('🎯 Performing coin throw for round ' + coinsState.currentRound);

        updateThrowButton();
        updateStatusDisplay('Monētas griežas gaisā...');

        const throwStartTime = Date.now();

        // Check if coins are available for animation
        const availableCoins = coinsElements.allCoins.filter(coin => coin !== null);
        if (availableCoins.length === 0) {
            debugLog('⚠️ No coin elements available, using calculation-only mode');
        } else {
            await animateCoinThrows();
        }

        const throwResult = calculateThrowResult();
        debugLog('📊 Throw result: ' + JSON.stringify({
            coins: throwResult.coins,
            values: throwResult.values,
            sum: throwResult.sum,
            lineValue: throwResult.lineValue
        }));

        updateCoinDisplays(throwResult);

        if (coinsState.showMath) {
            showMathDetails(throwResult);
        }

        updateLineInformation(throwResult);
        addLineToHexagramDisplay(throwResult.lineValue);

        if (throwResult.lineValue === 6 || throwResult.lineValue === 9) {
            coinsState.changingLines.push(coinsState.currentRound);
            coinsState.hasChangingLines = true;
            announceChangingLine();
            debugLog('🔄 Changing line found in round ' + coinsState.currentRound);
        }

        coinsState.hexagramLines.push(throwResult.lineValue);
        coinsState.currentThrow = throwResult;

        coinsState.throwTimes.push(Date.now() - throwStartTime);

        updateCoinsAnalytics(throwResult);

        if (coinsState.currentRound < coinsState.maxRounds) {
            coinsState.phase = 'ready';

            if (coinsState.autoAdvance) {
                debugLog('⚡ Auto-advancing to next round in ' + coinsConfig.timing.autoAdvanceDelay + 'ms');
                setTimeout(() => {
                    startNextRound();
                }, coinsConfig.timing.autoAdvanceDelay);
            } else {
                startNextRound();
            }
        } else {
            debugLog('🎉 All rounds completed, finalizing...');
            completeCoinsGivination();
        }

    } catch (error) {
        debugLog('❌ Error performing coin throw: ' + error.message);
        console.error('❌ Error performing coin throw:', error);
        showCoinsError('Kļūda monētu metīšanas procesā. Lūdzu mēģiniet vēlreiz.');
    } finally {
        coinsState.throwInProgress = false;
    }
}

function generateRandomCoinThrow() {
    const coinResults = [];
    const values = [];

    for (let i = 0; i < 3; i++) {
        const isHeads = Math.random() < 0.5;
        coinResults.push(isHeads ? 'heads' : 'tails');
        values.push(isHeads ? coinsConfig.coins.values.heads : coinsConfig.coins.values.tails);
    }

    return { coins: coinResults, values: values };
}

function calculateThrowResult() {
    const { coins, values } = generateRandomCoinThrow();
    const sum = values.reduce((total, value) => total + value, 0);
    const lineValue = sum;

    return {
        coins: coins,
        values: values,
        sum: sum,
        lineValue: lineValue,
        lineConfig: coinsConfig.lineValues[lineValue]
    };
}

function updateCoinDisplays(throwResult) {
    throwResult.coins.forEach((coinResult, index) => {
        const coin = coinsElements.allCoins[index];
        if (!coin) {
            debugLog('⚠️ Coin ' + (index + 1) + ' element not available for display update');
            return;
        }

        const isHeads = coinResult === 'heads';
        const symbol = isHeads ? coinsConfig.coins.symbols.heads : coinsConfig.coins.symbols.tails;
        const value = throwResult.values[index];

        coin.className = 'coin coin-' + coinResult;
        coin.setAttribute('data-state', coinResult);
        const coinType = isHeads ? 'Galva' : 'Aste';
        const coinLabel = 'Monēta ' + (index + 1) + ': ' + coinType + ' (' + value + ')';
        coin.setAttribute('aria-label', coinLabel);

        coin.innerHTML = '<div class="coin-face">' +
            '<span class="coin-symbol">' + symbol + '</span>' +
            '</div>';

        setTimeout(() => {
            coin.classList.add('coin-result');
        }, index * 100);
    });
}

function updateLineInformation(throwResult) {
    const { sum, lineValue, lineConfig } = throwResult;

    if (coinsElements.currentSum) {
        coinsElements.currentSum.textContent = sum;
    }

    if (coinsElements.currentLineValue) {
        coinsElements.currentLineValue.innerHTML =
            '<span class="line-number">' + lineValue + '</span>' +
            '<span class="line-symbol">' + lineConfig.symbol + '</span>';
    }

    if (coinsElements.lineDescription) {
        coinsElements.lineDescription.innerHTML =
            '<h4>' + lineConfig.name + '</h4>' +
            '<p>' + lineConfig.description + '</p>' +
            (lineConfig.changeTo ? '<p class="change-info">🔄 Mainīsies uz ' + lineConfig.changeTo + '</p>' : '');
    }
}

function addLineToHexagramDisplay(lineValue) {
    if (!coinsElements.hexagramDisplay) {
        debugLog('⚠️ Hexagram display element not available');
        return;
    }

    const lineConfig = coinsConfig.lineValues[lineValue];
    const lineElement = document.createElement('div');

    lineElement.className = 'hexagram-line ' + getLineVisualType(lineValue);
    lineElement.setAttribute('data-value', lineValue);
    lineElement.setAttribute('data-round', coinsState.currentRound);
    lineElement.setAttribute('title', lineConfig.name + ' (' + lineValue + ')');

    if (lineValue === 6 || lineValue === 9) {
        lineElement.classList.add('changing-line');
    }

    coinsElements.hexagramDisplay.insertBefore(lineElement, coinsElements.hexagramDisplay.firstChild);

    setTimeout(() => {
        lineElement.classList.add('line-appear');
    }, coinsConfig.animations.lineAppear.delay);
}

function getLineVisualType(lineValue) {
    if (lineValue === 6 || lineValue === 8) return 'yin';
    if (lineValue === 7 || lineValue === 9) return 'yang';
    return 'unknown';
}

/* ============================================================================
   ROUND MANAGEMENT
   ============================================================================ */

function startNextRound() {
    if (coinsState.currentRound >= coinsState.maxRounds) {
        completeCoinsGivination();
        return;
    }

    coinsState.currentRound++;
    coinsState.phase = 'ready';

    debugLog('🔄 Starting round ' + coinsState.currentRound + '/' + coinsState.maxRounds);

    coinsState.currentThrow = {
        coins: [null, null, null],
        values: [null, null, null],
        sum: null,
        lineValue: null
    };

    setupInitialCoins();

    updateRoundIndicator();
    updateInstructionText();
    updateThrowButton();
    updateLinePreview();

    clearCurrentResults();
    announceRoundStart();
}

function completeCoinsGivination() {
    coinsState.phase = 'completed';
    coinsState.totalTime = Date.now() - coinsState.startTime;

    debugLog('🎯 Completing coins divination', {
        totalTime: coinsState.totalTime,
        changingLines: coinsState.changingLines.length,
        hexagramLines: coinsState.hexagramLines
    });

    calculateFinalHexagrams();
    showCompletionResults();
    saveCoinsResults();

    updateThrowButton();
    announceCompletion();
    // Labojuma sākums 27.07.2025 11:48
    //debug izdrukas, lai izsekotu līniju stāvokli
    debugLog('🧪 Final hexagramLines:', coinsState.hexagramLines);
    debugLog('🧪 Final changingLines:', coinsState.changingLines);
    // 💾 Sagatavo rezultātu objektu
    const completionResults = {
        primary: coinsState.primaryHexagram,
        secondary: coinsState.secondaryHexagram,
        changingLines: coinsState.changingLines,
        hexagramLines: coinsState.hexagramLines,
        question: coinsState.currentQuestion || window.currentQuestion || 'Nav norādīts',
        questionCategory: coinsState.questionCategory || window.currentQuestionCategory,
        method: 'coins',
        timestamp: new Date().toISOString(),
        totalTime: coinsState.totalTime,
        rounds: coinsState.maxRounds
    };

    // 💾 Rezultāti pieejami globāli (fallbackiem)
    window.divinationResults = completionResults;

    // 🪙 Ievieto pogu, lai lietotājs pats pārslēdzas uz resultPage
    if (coinsElements.completionMessage) {
        const button = document.createElement('button');
        button.textContent = 'Skatīt rezultātu';
        button.className = 'coins-continue-button';
        button.style.marginTop = '20px';
        button.onclick = () => {
            if (typeof window.IChingApp?.handleDivinationComplete === 'function') {
                debugLog('✅ User-triggered: IChingApp.handleDivinationComplete');
                window.IChingApp.handleDivinationComplete(completionResults);
            } else if (typeof window.goToResultPage === 'function') {
                debugLog('✅ User-triggered: window.goToResultPage');
                window.goToResultPage();
            } else if (typeof window.showPage === 'function') {
                debugLog('✅ User-triggered: window.showPage("resultPage")');
                window.showPage('resultPage');
            } else {
                debugLog('❌ No method found for user-triggered result page navigation');
            }
        };
        coinsElements.completionMessage.appendChild(button);

        // ✅ Atbloķē jau esošu pogu (ja tā bija deaktivēta)
        const realContinueBtn = document.querySelector('.coins-throw-btn.success');
        if (realContinueBtn) {
            realContinueBtn.removeAttribute('disabled');
            realContinueBtn.style.pointerEvents = 'auto';
            realContinueBtn.style.opacity = '1'; // ja dizains to aizēnoja
            debugLog('🔓 Skatīt Rezultātu poga atbloķēta');
        }
    }
    // Labojuma beigas 27.07.2025 11:48
    // Labojuma sākums 27.07.2025 12:18
    // 🛠️ Pārņem jau esošo HTML pogu (gadījumā, ja poga renderējas no HTML)
    setTimeout(() => {
        const existingButton = document.querySelector('.coins-continue-button, .btn-primary.green');
        if (existingButton) {
            debugLog('🟢 Found existing button, binding user-click event');
            existingButton.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (typeof window.IChingApp?.handleDivinationComplete === 'function') {
                    debugLog('✅ User-triggered (existing button): IChingApp.handleDivinationComplete');
                    window.IChingApp.handleDivinationComplete(window.divinationResults);
                } else if (typeof window.goToResultPage === 'function') {
                    debugLog('✅ User-triggered: window.goToResultPage');
                    window.goToResultPage();
                } else if (typeof window.showPage === 'function') {
                    debugLog('✅ User-triggered: window.showPage("resultPage")');
                    window.showPage('resultPage');
                } else {
                    debugLog('❌ No method found for user-triggered result page navigation');
                }
            };
        } else {
            debugLog('⚠️ Continue button not found in DOM');
        }
    }, 500);
    // Labojuma beigas 27.07.2025 12:18

}

function calculateFinalHexagrams() {
    const primaryLines = coinsState.hexagramLines.map(value => {
        return (value === 7 || value === 9) ? 1 : 0;
    });

    coinsState.primaryHexagram = findHexagramFromLines(primaryLines);
    debugLog('📜 Primary hexagram: #' + (coinsState.primaryHexagram?.number || '?') + ' ' +
        (coinsState.primaryHexagram?.chinese || '?'));

    if (coinsState.hasChangingLines) {
        const secondaryLines = coinsState.hexagramLines.map(value => {
            if (value === 6) return 1;
            if (value === 9) return 0;
            return (value === 7 || value === 9) ? 1 : 0;
        });

        coinsState.secondaryHexagram = findHexagramFromLines(secondaryLines);
        debugLog('🔄 Secondary hexagram: #' + (coinsState.secondaryHexagram?.number || '?') + ' ' +
            (coinsState.secondaryHexagram?.chinese || '?'));
    }
}

/* ============================================================================
   UI UPDATE FUNCTIONS
   ============================================================================ */

function updateCoinsUI() {
    updateRoundIndicator();
    updateInstructionText();
    updateThrowButton();
    updateAutoButton();
    updateLinePreview();
    updateStatusDisplay();
}

function updateRoundIndicator() {
    if (!coinsElements.roundIndicator) return;

    coinsElements.roundIndicator.innerHTML =
        '<span class="round-number">' + coinsState.currentRound + '</span>' +
        '<span class="round-total">/ ' + coinsState.maxRounds + '</span>' +
        '<span class="round-label">līnija</span>';
}

function updateInstructionText() {
    if (!coinsElements.instructionText) return;

    const instruction = coinsConfig.messages.instructions[coinsState.currentRound];
    coinsElements.instructionText.textContent = instruction || coinsConfig.messages.ready;
}

function updateThrowButton() {
    if (!coinsElements.throwButton) return;

    const button = coinsElements.throwButton;
    button.disabled = coinsState.isAnimating || coinsState.throwInProgress;

    switch (coinsState.phase) {
        case 'ready':
            button.textContent = '🎲 Met Monētas';
            button.className = 'coins-throw-btn primary';
            break;
        case 'throwing':
            button.textContent = '⏳ Griežas...';
            button.className = 'coins-throw-btn disabled';
            break;
        case 'calculating':
            button.textContent = '🔢 Aprēķina...';
            button.className = 'coins-throw-btn disabled';
            break;
        case 'completed':
            button.textContent = '✨ Skatīt Rezultātus';
            button.className = 'coins-throw-btn success';
            break;
        default:
            button.textContent = '🎲 Met Monētas';
            button.className = 'coins-throw-btn primary';
            break;
    }
}

function updateAutoButton() {
    if (!coinsElements.autoButton) return;

    const button = coinsElements.autoButton;
    button.className = coinsState.autoAdvance ? 'auto-btn active' : 'auto-btn inactive';
    button.textContent = coinsState.autoAdvance ? '⚡ Auto: ON' : '⏸️ Auto: OFF';
    button.setAttribute('aria-pressed', coinsState.autoAdvance.toString());
}

function updateLinePreview() {
    if (!coinsElements.linePreview) return;

    const preview = coinsElements.linePreview;
    preview.innerHTML = '';

    coinsState.hexagramLines.forEach((lineValue, index) => {
        const lineEl = document.createElement('div');
        lineEl.className = 'preview-line ' + getLineVisualType(lineValue);

        if (lineValue === 6 || lineValue === 9) {
            lineEl.classList.add('changing');
        }

        lineEl.setAttribute('title', 'Līnija ' + (index + 1) + ': ' + coinsConfig.lineValues[lineValue].name);
        preview.appendChild(lineEl);
    });

    for (let i = coinsState.hexagramLines.length; i < 6; i++) {
        const lineEl = document.createElement('div');
        lineEl.className = 'preview-line empty';
        lineEl.setAttribute('title', 'Līnija ' + (i + 1) + ': Nav noteikta');
        preview.appendChild(lineEl);
    }
}

function updateStatusDisplay(message = null) {
    if (!coinsElements.statusDisplay) return;

    if (message) {
        coinsElements.statusDisplay.textContent = message;
        return;
    }

    const phase = coinsState.phase;
    const round = coinsState.currentRound;
    const total = coinsState.maxRounds;

    let status = '';
    switch (phase) {
        case 'ready':
            status = 'Gatavs ' + round + '. līnijai (' + round + '/' + total + ')';
            break;
        case 'throwing':
            status = 'Met ' + round + '. līniju...';
            break;
        case 'calculating':
            status = 'Aprēķina ' + round + '. līnijas rezultātu...';
            break;
        case 'completed':
            status = 'Visi metieni pabeigti!';
            break;
    }

    coinsElements.statusDisplay.textContent = status;
}

function clearCurrentResults() {
    if (coinsElements.currentSum) {
        coinsElements.currentSum.textContent = '';
    }

    if (coinsElements.currentLineValue) {
        coinsElements.currentLineValue.innerHTML = '';
    }

    if (coinsElements.lineDescription) {
        coinsElements.lineDescription.innerHTML = '';
    }

    if (coinsElements.mathDetails) {
        coinsElements.mathDetails.innerHTML = '';
    }
}

function showMathDetails(throwResult) {
    if (!coinsElements.mathDetails) return;

    const { coins, values, sum, lineValue } = throwResult;

    coinsElements.mathDetails.innerHTML =
        '<div class="math-breakdown">' +
        '<h4>📊 Aprēķina Detaļas</h4>' +
        '<div class="coin-values">' +
        coins.map((coin, i) =>
            '<span class="coin-math">' + (coin === 'heads' ? 'G' : 'A') + ': ' + values[i] + '</span>'
        ).join(' + ') +
        '</div>' +
        '<div class="sum-calculation">' +
        '<strong>Summa: ' + values.join(' + ') + ' = ' + sum + '</strong>' +
        '</div>' +
        '<div class="line-result">' +
        '<strong>Līnijas vērtība: ' + lineValue + '</strong>' +
        '</div>' +
        '<div class="probability">' +
        'Varbūtība: ' + (coinsConfig.lineValues[lineValue].probability * 100).toFixed(1) + '%' +
        '</div>' +
        '</div>';
}

/* ============================================================================
   ANIMATION FUNCTIONS
   ============================================================================ */

async function animateCoinThrows() {
    coinsState.isAnimating = true;

    try {
        const speedMultiplier = getAnimationSpeedMultiplier();
        const flipDuration = coinsConfig.animations.coinFlip.duration * speedMultiplier;

        debugLog('🎬 Starting coin animations with speed multiplier: ' + speedMultiplier);

        const availableCoins = coinsElements.allCoins.filter(coin => coin !== null);
        for (let i = 0; i < availableCoins.length; i++) {
            const coin = availableCoins[i];
            if (!coin) continue;

            await animateSingleCoinFlip(coin, i, flipDuration);

            if (i < availableCoins.length - 1) {
                await sleep(100 * speedMultiplier);
            }
        }

        await animateCoinsLanding(speedMultiplier);

    } finally {
        coinsState.isAnimating = false;
    }
}

async function animateSingleCoinFlip(coin, index, duration) {
    return new Promise(resolve => {
        coin.classList.add('coin-flipping');
        coin.style.animationDuration = duration + 'ms';

        if (coinsState.soundEnabled) {
            playCoinSound('flip');
        }

        announceForScreenReader('Met monētu ' + (index + 1));

        setTimeout(resolve, duration);
    });
}

async function animateCoinsLanding(speedMultiplier) {
    const landDuration = coinsConfig.animations.coinLand.duration * speedMultiplier;

    return new Promise(resolve => {
        const availableCoins = coinsElements.allCoins.filter(coin => coin !== null);
        availableCoins.forEach((coin, index) => {
            if (!coin) return;

            setTimeout(() => {
                coin.classList.remove('coin-flipping');
                coin.classList.add('coin-landing');

                if (coinsState.soundEnabled) {
                    playCoinSound('land');
                }
            }, index * 50);
        });

        setTimeout(() => {
            availableCoins.forEach(coin => {
                if (coin) coin.classList.remove('coin-landing');
            });
            resolve();
        }, landDuration);
    });
}

function getAnimationSpeedMultiplier() {
    switch (coinsState.animationSpeed) {
        case 'slow': return 2.0;
        case 'fast': return 0.5;
        default: return 1.0;
    }
}

function updateAnimationSpeeds() {
    const multiplier = getAnimationSpeedMultiplier();
    document.documentElement.style.setProperty('--coins-speed-multiplier', multiplier);
}

/* ============================================================================
   HELPER FUNCTIONS
   ============================================================================ */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function findHexagramFromLines(lines) {
    try {
        if (typeof getHexagramByLines === 'function') {
            return getHexagramByLines(lines);
        }

        if (typeof window !== 'undefined' && window.IChingHexagrams && window.IChingHexagrams.getHexagramByLines) {
            return window.IChingHexagrams.getHexagramByLines(lines);
        }

        let hexagramsArray = null;
        if (typeof HEXAGRAMS !== 'undefined') {
            hexagramsArray = HEXAGRAMS;
        } else if (typeof window !== 'undefined' && window.IChingHexagrams && window.IChingHexagrams.HEXAGRAMS) {
            hexagramsArray = window.IChingHexagrams.HEXAGRAMS;
        }

        if (hexagramsArray) {
            return hexagramsArray.find(hex =>
                hex.lines && arraysEqual(hex.lines, lines)
            ) || hexagramsArray[0];
        }

        return {
            number: 1,
            chinese: '乾',
            latvian: 'Radošā Spēka',
            lines: lines
        };

    } catch (error) {
        debugLog('⚠️ Error finding hexagram from lines: ' + error.message);
        return {
            number: 1,
            chinese: '乾',
            latvian: 'Radošā Spēka',
            lines: lines
        };
    }
}

function arraysEqual(a, b) {
    return Array.isArray(a) && Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, i) => val === b[i]);
}

function resetCoinsState() {
    coinsState.currentRound = 1;
    coinsState.hexagramLines = [];
    coinsState.changingLines = [];
    coinsState.currentThrow = {
        coins: [null, null, null],
        values: [null, null, null],
        sum: null,
        lineValue: null
    };
    coinsState.phase = 'ready';
    coinsState.isAnimating = false;
    coinsState.throwInProgress = false;
    coinsState.primaryHexagram = null;
    coinsState.secondaryHexagram = null;
    coinsState.hasChangingLines = false;
    coinsState.startTime = Date.now();
    coinsState.throwTimes = [];
    coinsState.totalTime = null;

    debugLog('🔄 Coins state reset');
}

/* ============================================================================
   PERSISTENCE FUNCTIONS
   ============================================================================ */

function loadCoinsPreferences() {
    try {
        const saved = localStorage.getItem('ichingCoinsPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);

            coinsState.coinStyle = preferences.coinStyle || coinsState.coinStyle;
            coinsState.soundEnabled = preferences.soundEnabled || coinsState.soundEnabled;
            coinsState.animationSpeed = preferences.animationSpeed || coinsState.animationSpeed;
            coinsState.autoAdvance = preferences.autoAdvance !== undefined ? preferences.autoAdvance : coinsState.autoAdvance;
            coinsState.showMath = preferences.showMath || coinsState.showMath;

            if (coinsElements.speedControl) coinsElements.speedControl.value = coinsState.animationSpeed;
            if (coinsElements.styleControl) coinsElements.styleControl.value = coinsState.coinStyle;
            if (coinsElements.soundToggle) coinsElements.soundToggle.checked = coinsState.soundEnabled;

            debugLog('⚙️ Preferences loaded');
        }
    } catch (error) {
        debugLog('⚠️ Could not load coins preferences: ' + error.message);
    }
}

function saveCoinsPreferences() {
    try {
        const preferences = {
            coinStyle: coinsState.coinStyle,
            soundEnabled: coinsState.soundEnabled,
            animationSpeed: coinsState.animationSpeed,
            autoAdvance: coinsState.autoAdvance,
            showMath: coinsState.showMath
        };

        localStorage.setItem('ichingCoinsPreferences', JSON.stringify(preferences));
    } catch (error) {
        debugLog('⚠️ Could not save coins preferences: ' + error.message);
    }
}

function saveCoinsProgress() {
    try {
        const progressData = {
            currentRound: coinsState.currentRound,
            hexagramLines: coinsState.hexagramLines,
            changingLines: coinsState.changingLines,
            phase: coinsState.phase,
            question: coinsState.currentQuestion,
            timestamp: Date.now()
        };

        localStorage.setItem('ichingCoinsProgress', JSON.stringify(progressData));
    } catch (error) {
        debugLog('⚠️ Could not save coins progress: ' + error.message);
    }
}

/* ============================================================================
   ANALYTICS FUNCTIONS
   ============================================================================ */

function updateCoinsAnalytics(throwResult) {
    const analytics = coinsState.analytics;

    analytics.totalThrows++;

    if (throwResult.lineValue === 6 || throwResult.lineValue === 9) {
        analytics.changingLinesCount++;
    }

    throwResult.coins.forEach(coin => {
        analytics.coinDistribution[coin]++;
    });

    analytics.lineDistribution[throwResult.lineValue]++;

    const currentThrowTime = coinsState.throwTimes[coinsState.throwTimes.length - 1];
    analytics.averageThrowTime = (analytics.averageThrowTime * (analytics.totalThrows - 1) + currentThrowTime) / analytics.totalThrows;
}

/* ============================================================================
   ACCESSIBILITY FUNCTIONS
   ============================================================================ */

function setupCoinsAccessibility() {
    if (!coinsElements.liveRegion) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'coinsAriaLive';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'false');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);
        coinsElements.liveRegion = liveRegion;
    }

    if (coinsElements.throwButton) {
        coinsElements.throwButton.setAttribute('aria-describedby', 'coinsInstructionText');
    }

    announceForScreenReader('Monētu metīšanas modulis gatavs. Nospiediet Enter vai atstarpi, lai sāktu.');
}

function announceForScreenReader(message) {
    if (coinsElements.liveRegion) {
        coinsElements.liveRegion.textContent = message;
    }
}

function announceRoundStart() {
    const message = 'Sākas ' + coinsState.currentRound + '. līnija no ' + coinsState.maxRounds + '. ' + coinsConfig.messages.instructions[coinsState.currentRound];
    announceForScreenReader(message);
}

function announceChangingLine() {
    announceForScreenReader('Atrasta mainīga līnija ' + coinsState.currentRound + '! Jūs saņemsiet divus heksagramus.');
}

function announceCompletion() {
    const changingCount = coinsState.changingLines.length;
    let message = 'Visas līnijas pabeigtas! ';

    if (changingCount > 0) {
        message += 'Atrastas ' + changingCount + ' mainīgas līnijas. Jūs saņemsiet divus heksagramus.';
    } else {
        message += 'Neviens mainīgas līnijas nav atrastas.';
    }

    announceForScreenReader(message);
}

/* ============================================================================
   ERROR HANDLING - ENHANCED
   ============================================================================ */

function showCoinsError(message) {
    debugLog('❌ Showing error: ' + message);

    // Try multiple error display methods
    let errorShown = false;

    // Method 1: Dedicated error container
    const errorContainer = document.getElementById('coinsError');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorShown = true;

        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    // Method 2: Create temporary error display
    if (!errorShown && coinsElements.container) {
        const tempError = document.createElement('div');
        tempError.className = 'coins-error-message';
        tempError.style.cssText = 'background: #ff4444; color: white; padding: 1rem; margin: 1rem; border-radius: 8px; text-align: center;';
        tempError.textContent = message;

        coinsElements.container.insertBefore(tempError, coinsElements.container.firstChild);
        errorShown = true;

        setTimeout(() => {
            if (tempError.parentNode) {
                tempError.parentNode.removeChild(tempError);
            }
        }, 5000);
    }

    // Method 3: Fallback to alert
    if (!errorShown) {
        alert(message);
    }

    announceForScreenReader('Kļūda: ' + message);
}

/* ============================================================================
   SOUND EFFECTS
   ============================================================================ */

function playCoinSound(type) {
    if (!coinsState.soundEnabled) return;

    try {
        debugLog('🔊 Playing ' + type + ' sound');
        // Sound implementation would go here
    } catch (error) {
        debugLog('⚠️ Could not play sound: ' + error.message);
    }
}

/* ============================================================================
   COMPLETION AND RESULTS FUNCTIONS
   ============================================================================ */

function showCompletionResults() {
    if (!coinsElements.completionMessage) {
        debugLog('⚠️ Completion message element not available');
        return;
    }

    const completionTime = coinsState.totalTime;
    const minutes = Math.floor(completionTime / 60000);
    const seconds = Math.floor((completionTime % 60000) / 1000);
    const changingCount = coinsState.changingLines.length;

    coinsElements.completionMessage.innerHTML =
        '<div class="completion-ceremony">' +
        '<h2>🎯 Monētu Metīšana Pabeigta!</h2>' +

        '<div class="completion-stats">' +
        '<div class="stat-group">' +
        '<div class="stat-item">' +
        '<span class="stat-label">Laiks:</span>' +
        '<span class="stat-value">' + minutes + ':' + seconds.toString().padStart(2, '0') + '</span>' +
        '</div>' +
        '<div class="stat-item">' +
        '<span class="stat-label">Metieni:</span>' +
        '<span class="stat-value">' + coinsState.analytics.totalThrows + '</span>' +
        '</div>' +
        '<div class="stat-item">' +
        '<span class="stat-label">Mainīgās līnijas:</span>' +
        '<span class="stat-value">' + changingCount + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="hexagram-results">' +
        '<div class="primary-hexagram-result">' +
        '<h3>📜 Galvenā Heksagramma</h3>' +
        '<div class="hexagram-card">' +
        '<div class="hexagram-number">#' + (coinsState.primaryHexagram?.number || '?') + '</div>' +
        '<div class="hexagram-chinese">' + (coinsState.primaryHexagram?.chinese || '?') + '</div>' +
        '<div class="hexagram-name">' + (coinsState.primaryHexagram?.latvian || 'Nezināms') + '</div>' +
        '</div>' +
        '</div>' +

        (coinsState.hasChangingLines ?
            '<div class="secondary-hexagram-result">' +
            '<h3>🔄 Attīstības Heksagramma</h3>' +
            '<div class="hexagram-card secondary">' +
            '<div class="hexagram-number">#' + (coinsState.secondaryHexagram?.number || '?') + '</div>' +
            '<div class="hexagram-chinese">' + (coinsState.secondaryHexagram?.chinese || '?') + '</div>' +
            '<div class="hexagram-name">' + (coinsState.secondaryHexagram?.latvian || 'Nezināms') + '</div>' +
            '<div class="changing-lines-indicator">' +
            'Mainīgās līnijas: ' + coinsState.changingLines.join(', ') +
            '</div>' +
            '</div>' +
            '</div>'
            : '') +
        '</div>' +

        '<div class="completion-message">' +
        '<p>' +
        (coinsState.hasChangingLines
            ? 'Jūs saņēmāt divus heksagramus! Pirmais parāda pašreizējo situāciju, otrais - attīstības virzienu.'
            : 'Jūs saņēmāt vienu stabilu heksagrammu, kas atspoguļo situācijas būtību.'
        ) +
        '</p>' +
        '<p class="ceremony-closing">' +
        '🌟 Modernā gudrība ir runājusi caur monētām. Sagatavojieties interpretācijai...' +
        '</p>' +
        '</div>' +
        '</div>';

    coinsElements.completionMessage.classList.add('show');
}

function saveCoinsResults() {
    try {
        const results = {
            method: 'coins',
            question: coinsState.currentQuestion,
            questionCategory: coinsState.questionCategory,

            primaryHexagram: coinsState.primaryHexagram,
            secondaryHexagram: coinsState.secondaryHexagram,
            hasChangingLines: coinsState.hasChangingLines,
            changingLines: coinsState.changingLines,

            hexagramLines: coinsState.hexagramLines,
            coinSequence: coinsState.throwTimes.map((time, index) => ({
                round: index + 1,
                lineValue: coinsState.hexagramLines[index],
                throwTime: time
            })),

            totalDuration: coinsState.totalTime,
            averageThrowTime: coinsState.analytics.averageThrowTime,

            analytics: { ...coinsState.analytics },

            timestamp: Date.now(),
            preferences: {
                coinStyle: coinsState.coinStyle,
                animationSpeed: coinsState.animationSpeed,
                autoAdvance: coinsState.autoAdvance
            }
        };

        if (typeof window !== 'undefined') {
            window.divinationResults = results;
            window.resultsState = results; // ✅ tas ir nepieciešams results.js pareizai darbībai
        }

        localStorage.setItem('ichingLastDivination', JSON.stringify(results));
        localStorage.removeItem('ichingCoinsProgress');

        debugLog('💾 Coins results saved successfully');

    } catch (error) {
        debugLog('❌ Error saving coins results: ' + error.message);
        console.error('❌ Error saving coins results:', error);
        showCoinsError('Kļūda saglabājot rezultātus. Rezultāti var būt nepieejami.');
    }
}

function proceedToResults() {
    saveCoinsResults();

    if (typeof goToResultPage === 'function') {
        goToResultPage();
    } else if (typeof showPage === 'function') {
        showPage('resultPage');
    } else {
        debugLog('❌ Result navigation functions not available');
        showCoinsError('Rezultātu lapa nav pieejama. Rezultāti ir saglabāti.');
    }
}

/* ============================================================================
   FALLBACK AND MINIMAL FUNCTIONALITY
   ============================================================================ */

function setupMinimalCoins() {
    debugLog('⚡ Setting up minimal coins functionality...');

    const coinsContainer = document.getElementById('coinsPage');
    if (coinsContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'coins-error-state';
        errorDiv.style.cssText = 'background: rgba(255, 68, 68, 0.1); border: 2px solid #ff4444; border-radius: 15px; padding: 2rem; margin: 2rem; text-align: center;';
        errorDiv.innerHTML =
            '<div>' +
            '<h3 style="color: #ff4444; margin-bottom: 1rem;">🪙 Monētu Moduļa Problēma</h3>' +
            '<p style="margin-bottom: 1rem;">Daži elementi nav pieejami. Mēģiniet:</p>' +
            '<ul style="text-align: left; display: inline-block; margin-bottom: 1rem;">' +
            '<li>Pārlādēt lapu (F5)</li>' +
            '<li>Pārbaudīt interneta savienojumu</li>' +
            '<li>Izmantot Yarrow metodi</li>' +
            '<li>Pārbaudīt console (F12) debugiem</li>' +
            '</ul>' +
            '<div>' +
            '<button onclick="location.reload()" style="margin: 0.5rem; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">' +
            '🔄 Pārlādēt Lapu' +
            '</button>' +
            '<button onclick="window.CoinsDebug && window.CoinsDebug.manualCoinsRecovery()" style="margin: 0.5rem; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">' +
            '🛠️ Manuālā Atjaunošana' +
            '</button>' +
            '</div>' +
            '</div>';

        // Clear existing content and add error state
        coinsContainer.innerHTML = '';
        coinsContainer.appendChild(errorDiv);

        debugLog('⚡ Minimal coins interface created');
    } else {
        debugLog('❌ Cannot create minimal interface - container not found');
    }
}

/* ============================================================================
   DEBUG AND RECOVERY FUNCTIONS
   ============================================================================ */

function debugLog(message, data = null) {
    if (!coinsConfig.debug.enabled) return;

    const timestamp = new Date().toISOString().substr(11, 12);
    const logMessage = '[COINS ' + timestamp + '] ' + message;

    console.log(logMessage, data || '');
}

function debugCoinsState() {
    console.log('🔍 COINS DEBUG INFORMATION:');
    console.log('📄 DOM Elements Status:', {
        container: !!document.getElementById('coinsPage'),
        coin1: !!document.getElementById('coin1'),
        coin2: !!document.getElementById('coin2'),
        coin3: !!document.getElementById('coin3'),
        throwButton: !!document.getElementById('coinsThrowButton'),
        autoButton: !!document.getElementById('coinsAutoButton'),
        resetButton: !!document.getElementById('coinsResetButton')
    });

    console.log('🧠 Module State:', {
        currentRound: coinsState.currentRound,
        phase: coinsState.phase,
        isAnimating: coinsState.isAnimating,
        throwInProgress: coinsState.throwInProgress,
        hexagramLines: coinsState.hexagramLines,
        initializationStatus: coinsState.initializationStatus
    });

    console.log('🔗 Dependencies:', {
        hexagrams: !!window.IChingHexagrams,
        windowCoinsModule: !!window.CoinsModule,
        getHexagramByLines: typeof getHexagramByLines === 'function' ||
            (window.IChingHexagrams && typeof window.IChingHexagrams.getHexagramByLines === 'function')
    });

    console.log('⚙️ Configuration:', {
        debug: coinsConfig.debug,
        retry: coinsConfig.retry,
        fallback: coinsConfig.fallback
    });
}

function manualCoinsRecovery() {
    debugLog('🛠️ Attempting manual coins recovery...');

    try {
        // Clear any existing state
        if (window.CoinsModule) {
            window.CoinsModule.resetCoinsState();
        }

        // Clear initialization status
        coinsState.initializationStatus = {
            attempts: 0,
            lastError: null,
            isInitialized: false,
            domElementsFound: 0,
            eventListenersAttached: 0
        };

        // Re-initialize
        setTimeout(() => {
            initializeCoins();
        }, 500);

        debugLog('✅ Manual recovery initiated');
        return true;

    } catch (error) {
        debugLog('❌ Manual recovery failed: ' + error.message);
        return false;
    }
}

/* ============================================================================
   CSS INJECTION
   ============================================================================ */

function injectCoinsAnimationCSS() {
    if (document.getElementById('coinsAnimationStyles')) return;

    const style = document.createElement('style');
    style.id = 'coinsAnimationStyles';
    style.textContent =
        '.coin {' +
        'position: relative;' +
        'border-radius: 50%;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'cursor: pointer;' +
        'transition: all var(--transition-medium, 0.3s ease);' +
        'transform-style: preserve-3d;' +
        '}' +

        '.coin-face {' +
        'display: flex;' +
        'flex-direction: column;' +
        'align-items: center;' +
        'justify-content: center;' +
        'width: 100%;' +
        'height: 100%;' +
        '}' +

        '.coin-symbol {' +
        'font-size: 1.5em;' +
        'line-height: 1;' +
        '}' +

        '.coin-value {' +
        'font-size: 0.8em;' +
        'font-weight: bold;' +
        'margin-top: 2px;' +
        '}' +

        '.coin-neutral {' +
        'background: linear-gradient(45deg, #DAA520, #B8860B);' +
        'color: #2C1810;' +
        'box-shadow: 0 4px 12px rgba(218, 165, 32, 0.4);' +
        '}' +

        '.coin-heads {' +
        'background: linear-gradient(45deg, #FFD700, #FFA500);' +
        'color: #1a1a2e;' +
        'box-shadow: 0 6px 16px rgba(255, 215, 0, 0.6);' +
        '}' +

        '.coin-tails {' +
        'background: linear-gradient(45deg, #C0C0C0, #808080);' +
        'color: #000;' +
        'box-shadow: 0 6px 16px rgba(192, 192, 192, 0.5);' +
        '}' +

        '.coin-flipping {' +
        'animation: coinFlipGeneric 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);' +
        '}' +

        '@keyframes coinFlipGeneric {' +
        '0% { transform: rotateY(0deg) scale(1); }' +
        '50% { transform: rotateY(180deg) scale(1.2); }' +
        '100% { transform: rotateY(360deg) scale(1); }' +
        '}' +

        '.coin-landing {' +
        'animation: coinLand 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);' +
        '}' +

        '@keyframes coinLand {' +
        '0% { transform: translateY(-10px) scale(1.1); }' +
        '50% { transform: translateY(5px) scale(0.9); }' +
        '100% { transform: translateY(0) scale(1); }' +
        '}' +

        '.coin-result {' +
        'animation: coinResult 0.5s ease-out;' +
        '}' +

        '@keyframes coinResult {' +
        '0% {' +
        'opacity: 0;' +
        'transform: scale(0.8) rotate(-10deg);' +
        '}' +
        '50% {' +
        'opacity: 1;' +
        'transform: scale(1.1) rotate(5deg);' +
        '}' +
        '100% {' +
        'opacity: 1;' +
        'transform: scale(1) rotate(0deg);' +
        '}' +
        '}' +

        '.hexagram-line {' +
        'position: relative;' +
        'height: 8px;' +
        'margin: 4px 0;' +
        'border-radius: 4px;' +
        'transition: all 0.3s ease;' +
        '}' +

        '.hexagram-line.yang {' +
        'background: linear-gradient(90deg, #FFD700, #FFED4E);' +
        'box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);' +
        '}' +

        '.hexagram-line.yin {' +
        'background: linear-gradient(90deg, #FFD700 0%, #FFD700 30%, transparent 30%, transparent 70%, #FFD700 70%, #FFD700 100%);' +
        '}' +

        '.hexagram-line.yin::before {' +
        'content: "";' +
        'position: absolute;' +
        'left: 0;' +
        'top: 0;' +
        'width: 30%;' +
        'height: 100%;' +
        'background: linear-gradient(90deg, #FFD700, #FFED4E);' +
        'border-radius: 4px 0 0 4px;' +
        'box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' +
        '}' +

        '.hexagram-line.yin::after {' +
        'content: "";' +
        'position: absolute;' +
        'right: 0;' +
        'top: 0;' +
        'width: 30%;' +
        'height: 100%;' +
        'background: linear-gradient(90deg, #FFD700, #FFED4E);' +
        'border-radius: 0 4px 4px 0;' +
        'box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' +
        '}' +

        '.hexagram-line.changing-line {' +
        'animation: changingLinePulse 2s ease-in-out infinite;' +
        '}' +

        '@keyframes changingLinePulse {' +
        '0%, 100% {' +
        'box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);' +
        '}' +
        '50% {' +
        'box-shadow: 0 0 20px rgba(255, 100, 0, 0.8);' +
        'transform: scale(1.05);' +
        '}' +
        '}' +

        '.line-appear {' +
        'animation: lineAppear 0.5s ease-out;' +
        '}' +

        '@keyframes lineAppear {' +
        '0% {' +
        'opacity: 0;' +
        'transform: translateX(-20px) scale(0.8);' +
        '}' +
        '100% {' +
        'opacity: 1;' +
        'transform: translateX(0) scale(1);' +
        '}' +
        '}' +

        '.coins-throw-btn {' +
        'padding: 15px 30px;' +
        'border: none;' +
        'border-radius: 25px;' +
        'font-size: 1.1em;' +
        'font-weight: bold;' +
        'cursor: pointer;' +
        'transition: all 0.3s ease;' +
        'position: relative;' +
        'overflow: hidden;' +
        '}' +

        '.coins-throw-btn.primary {' +
        'background: linear-gradient(45deg, #667eea, #764ba2);' +
        'color: white;' +
        'box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);' +
        '}' +

        '.coins-throw-btn.primary:hover {' +
        'transform: translateY(-2px);' +
        'box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);' +
        '}' +

        '.coins-throw-btn.success {' +
        'background: linear-gradient(45deg, #4CAF50, #45a049);' +
        'color: white;' +
        'box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);' +
        '}' +

        '.coins-throw-btn.disabled {' +
        'background: rgba(255, 255, 255, 0.2);' +
        'color: rgba(255, 255, 255, 0.5);' +
        'cursor: not-allowed;' +
        'transform: none;' +
        'box-shadow: none;' +
        '}' +

        '.auto-btn {' +
        'padding: 8px 16px;' +
        'border: 2px solid;' +
        'border-radius: 20px;' +
        'font-size: 0.9em;' +
        'font-weight: bold;' +
        'cursor: pointer;' +
        'transition: all 0.3s ease;' +
        '}' +

        '.auto-btn.active {' +
        'background: #4CAF50;' +
        'color: white;' +
        'border-color: #4CAF50;' +
        '}' +

        '.auto-btn.inactive {' +
        'background: transparent;' +
        'color: #ccc;' +
        'border-color: #ccc;' +
        '}' +

        '.preview-line {' +
        'width: 30px;' +
        'height: 6px;' +
        'margin: 2px;' +
        'border-radius: 3px;' +
        'background: rgba(255, 215, 0, 0.3);' +
        'transition: all 0.3s ease;' +
        '}' +

        '.preview-line.yang {' +
        'background: linear-gradient(90deg, #FFD700, #FFED4E);' +
        '}' +

        '.preview-line.yin {' +
        'background: linear-gradient(90deg, #FFD700 0%, #FFD700 30%, transparent 30%, transparent 70%, #FFD700 70%, #FFD700 100%);' +
        '}' +

        '.preview-line.changing {' +
        'animation: previewChanging 1s ease-in-out infinite alternate;' +
        '}' +

        '@keyframes previewChanging {' +
        '0% { opacity: 0.6; }' +
        '100% { opacity: 1; }' +
        '}' +

        '.preview-line.empty {' +
        'background: rgba(255, 255, 255, 0.2);' +
        '}' +

        '.completion-ceremony {' +
        'text-align: center;' +
        'padding: 2rem;' +
        '}' +

        '.completion-ceremony h2 {' +
        'color: #FFD700;' +
        'margin-bottom: 2rem;' +
        'font-size: 2rem;' +
        '}' +

        '.completion-stats {' +
        'margin: 2rem 0;' +
        '}' +

        '.stat-group {' +
        'display: flex;' +
        'justify-content: space-around;' +
        'flex-wrap: wrap;' +
        'gap: 1rem;' +
        '}' +

        '.stat-item {' +
        'display: flex;' +
        'flex-direction: column;' +
        'align-items: center;' +
        'min-width: 120px;' +
        '}' +

        '.stat-label {' +
        'font-size: 0.9em;' +
        'color: #ccc;' +
        'margin-bottom: 0.5rem;' +
        '}' +

        '.stat-value {' +
        'font-size: 1.2em;' +
        'font-weight: bold;' +
        'color: #FFD700;' +
        '}' +

        '.hexagram-results {' +
        'display: flex;' +
        'justify-content: center;' +
        'gap: 2rem;' +
        'margin: 2rem 0;' +
        'flex-wrap: wrap;' +
        '}' +

        '.hexagram-card {' +
        'background: rgba(255, 215, 0, 0.1);' +
        'border: 2px solid rgba(255, 215, 0, 0.3);' +
        'border-radius: 15px;' +
        'padding: 1.5rem;' +
        'text-align: center;' +
        'min-width: 200px;' +
        '}' +

        '.hexagram-card.secondary {' +
        'border-color: rgba(255, 100, 0, 0.5);' +
        'background: rgba(255, 100, 0, 0.1);' +
        '}' +

        '.hexagram-number {' +
        'font-size: 1.2em;' +
        'color: #FFD700;' +
        'margin-bottom: 0.5rem;' +
        '}' +

        '.hexagram-chinese {' +
        'font-size: 2.5em;' +
        'color: #FFD700;' +
        'margin: 0.5rem 0;' +
        '}' +

        '.hexagram-name {' +
        'font-size: 1.1em;' +
        'color: #fff;' +
        'margin-bottom: 1rem;' +
        '}' +

        '.changing-lines-indicator {' +
        'font-size: 0.9em;' +
        'color: #FFA500;' +
        'font-style: italic;' +
        '}' +

        '@media (max-width: 768px) {' +
        '.coin {' +
        'width: 50px !important;' +
        'height: 50px !important;' +
        '}' +

        '.hexagram-results {' +
        'flex-direction: column;' +
        'align-items: center;' +
        '}' +

        '.stat-group {' +
        'flex-direction: column;' +
        'align-items: center;' +
        '}' +
        '}' +

        '@media (prefers-reduced-motion: reduce) {' +
        '.coin,' +
        '.hexagram-line,' +
        '.preview-line,' +
        '.coins-throw-btn {' +
        'animation: none !important;' +
        'transition: none !important;' +
        '}' +
        '}';

    document.head.appendChild(style);
}

/* ============================================================================
   MODULE INITIALIZATION AND EXPORTS
   ============================================================================ */

// Enhanced initialization with better timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCoins, 200); // Slightly longer delay
    });
} else {
    setTimeout(initializeCoins, 200);
}

// Inject CSS immediately
injectCoinsAnimationCSS();

// Enhanced window exports
if (typeof window !== 'undefined') {
    window.CoinsModule = {
        initializeCoins,
        handleThrowCoins,
        resetCoinsState,

        getCoinsState: () => ({ ...coinsState }),
        getCurrentRound: () => coinsState.currentRound,
        getHexagramLines: () => [...coinsState.hexagramLines],
        getChangingLines: () => [...coinsState.changingLines],

        updateAnimationSpeeds,
        playCoinSound,

        calculateFinalHexagrams,
        saveCoinsResults,
        proceedToResults,

        checkDependencies,
        waitForDependencies,

        coinsConfig,

        // UZLABOJUMS: Enhanced exports
        getInitializationStatus: () => ({ ...coinsState.initializationStatus }),
        isInitialized: () => coinsState.initializationStatus.isInitialized,

        // Enhanced functions
        cacheCoinsDOMElements,
        setupCoinsEventListenersWithValidation,
        waitForDOMElements,
        waitForPageReady,
        setupMinimalCoins
    };

    // Debug interface
    window.CoinsDebug = {
        debugCoinsState,
        manualCoinsRecovery,
        setupMinimalCoins,
        debugLog,
        getState: () => coinsState,
        getElements: () => coinsElements,
        getConfig: () => coinsConfig
    };
}

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        coinsConfig,
        initializeCoins,
        calculateFinalHexagrams,
        findHexagramFromLines,
        arraysEqual,
        checkDependencies,
        waitForDependencies,
        debugCoinsState,
        manualCoinsRecovery,
        setupMinimalCoins
    };
}

/* ============================================================================
   COINS.JS PILNĪBĀ PABEIGTS - MONĒTU SIMULĀCIJA AR UZLABOTO ERROR HANDLING GATAVA!
   ============================================================================ */