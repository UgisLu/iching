/* ============================================================================ 
   YARROW.JS - I CHING MILLEŅU STIEBRU SIMULĀCIJAS MODULIS - SALABOTS
   ============================================================================ */

'use strict';

/* ============================================================================ 
   GLOBAL STATE MANAGEMENT 
   ============================================================================ */

let state = {
    currentRound: 1,
    maxRounds: 6,
    hexagramLines: [],
    currentLineValue: null,
    phase: 'initial',
    isAnimating: false,
    isPaused: false,
    totalStalks: 49,
    usedStalk: 1,
    workingStalks: 48,
    leftPile: [],
    rightPile: [],
    remainders: [],
    animationSpeed: 'normal',
    showInstructions: true,
    enableSound: false,
    startTime: null,
    roundTimes: [],
    preferences: {
        showMeditation: true,
        autoAdvance: false,
        skipAnimations: false,
        showMathDetails: false
    }
};

/* ============================================================================ 
   YARROW CONFIGURATION 
   ============================================================================ */

const YARROW_CONFIG = {
    stalks: {
        total: 49,
        working: 48,
        reserved: 1,
        divisionBase: 4
    },

    lineValues: {
        6: {
            type: 'changing_yin',
            display: '⚋',
            name: 'Veca Yin',
            changes_to: 'yang'
        },
        7: {
            type: 'young_yang',
            display: '⚊',
            name: 'Jauns Yang',
            changes_to: null
        },
        8: {
            type: 'young_yin',
            display: '⚋',
            name: 'Jauns Yin',
            changes_to: null
        },
        9: {
            type: 'changing_yang',
            display: '⚊',
            name: 'Vecs Yang',
            changes_to: 'yin'
        }
    },

    phases: {
        initial: {
            name: 'Sagatavošanās',
            description: 'Sajauciet 49 stiebrus un koncentrējieties uz savu jautājumu',
            duration: 3000
        },
        shuffling: {
            name: 'Jaukšana',
            description: 'Stiebi tiek sajaukti ar meditatīvu uzmanību',
            duration: 2000
        },
        dividing: {
            name: 'Dalīšana',
            description: 'Nejauši sadaliet stiebrus divās kaudzēs',
            duration: 1500
        },
        counting: {
            name: 'Skaitīšana',
            description: 'Skaitiet stiebrus pa četriem un noteiciet atlikumu',
            duration: 2500
        },
        completed: {
            name: 'Pabeigts',
            description: 'Līnija ir noteikta, gatavs nākamajai',
            duration: 1000
        }
    },

    animations: {
        stalkMovement: 300,
        shuffleDuration: 1500,
        divideDuration: 1000,
        countingSpeed: 150,
        lineAppearance: 800,
        hexagramBuild: 500,
        speed: 'normal'
    }
};

/* ============================================================================ 
   DOM ELEMENT REFERENCES 
   ============================================================================ */

function getElements() {
    return {
        mainPile: document.querySelector('#mainPile'),
        leftPile: document.querySelector('#leftPile'),
        rightPile: document.querySelector('#rightPile'),
        actionButton: document.querySelector('#yarrowActionButton'),
        phaseText: document.querySelector('#operationTitle'),
        roundText: document.querySelector('#yarrowRoundIndicator'),
        linePreview: document.querySelector('#yarrowHexagramPreview'),
        instructionText: document.querySelector('#yarrowRoundInstruction'),
        lineResult: document.querySelector('#completedLines'),
        sticksContainer: document.querySelector('#mainPileSticks'),
        leftSticksContainer: document.querySelector('#leftPileSticks'),
        rightSticksContainer: document.querySelector('#rightPileSticks')
    };
}

/* ============================================================================ 
   YARROW ALGORITMS - PAREIZS TRADICIONĀLAIS 
   ============================================================================ */

function performTraditionalYarrowDivision() {
    // Sāk ar 49 stiebru
    let stalks = 49;

    // Noņem 1 stiebru (Oracle stiebs - nekad netiek dalīts)
    stalks -= 1; // Paliek 48 stiebi

    const operations = [];

    // Veic 3 operācijas katrai līnijai
    for (let op = 0; op < 3; op++) {
        // 1. Nejauši sadala divās kaudzēs (var būt 0 vienā pusē)
        const leftPile = Math.floor(Math.random() * (stalks + 1));
        const rightPile = stalks - leftPile;

        // 2. Ņem 1 stiebru no labās kaudzītes (ja tā nav tukša) 
        let rightAfterTake = rightPile;
        if (rightPile > 0) {
            rightAfterTake = rightPile - 1;
        } else {
            // Ja labā puse tukša, ņem no kreisās
            rightAfterTake = leftPile - 1;
        }

        // 3. Skaitīt pa 4 un iegūt atlikumus
        const leftRemainder = leftPile % 4 || 4; // Ja 0, tad 4
        const rightRemainder = rightAfterTake % 4 || 4; // Ja 0, tad 4

        // 4. Kopējais noņemtais (atlikumi + 1 Oracle)
        const totalRemoved = leftRemainder + rightRemainder + 1;

        operations.push(totalRemoved);

        // 5. Nākamajā operācijā izmanto atlikušos stiebrus
        stalks = stalks - totalRemoved;
    }

    // Aprēķina līnijas vērtību no 3 operāciju rezultātiem
    const sum = operations.reduce((a, b) => a + b, 0);

    console.log(`[YARROW] ℹ️ Operations: ${operations.join(',')}, sum: ${sum}`);

    // Tradicionālā konversija: summa → līnijas vērtība
    let lineValue;
    if (sum === 9) lineValue = 6;       // Veca Yin (mainīgā) 
    else if (sum === 13) lineValue = 7; // Jauns Yang  
    else if (sum === 17) lineValue = 8; // Jauns Yin
    else if (sum === 21) lineValue = 9; // Vecs Yang (mainīgā)
    else {
        // Fallback - aprēķina pēc moduļa
        const modValue = sum % 4;
        if (modValue === 1) lineValue = 6;
        else if (modValue === 2) lineValue = 8;
        else if (modValue === 3) lineValue = 7;
        else lineValue = 9;

        console.warn(`[YARROW] ⚠️ Unexpected sum: ${sum}, using modulo: ${lineValue}`);
    }

    const lineConfig = YARROW_CONFIG.lineValues[lineValue];
    console.log(`[YARROW] ✅ Line result: ${lineValue} (${lineConfig.name})`);

    return {
        value: lineValue,
        operations: operations,
        sum: sum,
        config: lineConfig
    };
}

/* ============================================================================ 
   ANIMATION FUNCTIONS 
   ============================================================================ */

function createStalks(count) {
    const stalks = [];
    for (let i = 0; i < count; i++) {
        stalks.push({
            id: i,
            position: { x: 0, y: 0 },
            state: 'main'
        });
    }
    console.log(`[YARROW] ℹ️ Created ${count} stalks`);
    return stalks;
}

async function animateShuffling() {
    console.log(`[YARROW] ℹ️ Starting shuffle animation`);
    await sleep(YARROW_CONFIG.animations.shuffleDuration);
    console.log(`[YARROW] ✅ Shuffle completed`);
}

async function animateDividing() {
    console.log(`[YARROW] ℹ️ Starting divide animation`);

    // Simulē nejauši sadalīšanu
    const total = state.workingStalks;
    const left = Math.floor(Math.random() * (total + 1));
    const right = total - left;

    state.leftPile = createStalks(left);
    state.rightPile = createStalks(right);

    await sleep(YARROW_CONFIG.animations.divideDuration);
    console.log(`[YARROW] ✅ Divided into left: ${left}, right: ${right}`);
}

async function animateCounting() {
    console.log(`[YARROW] ℹ️ Starting count animation`);
    await sleep(YARROW_CONFIG.animations.countingSpeed * 10);

    // Aprēķina atlikumu
    const leftCount = state.leftPile.length;
    const rightCount = state.rightPile.length;
    const leftRemainder = leftCount % 4 || 4;
    const rightRemainder = rightCount % 4 || 4;
    const totalRemainder = leftRemainder + rightRemainder + 1;

    console.log(`[YARROW] ✅ Count completed. Remainder: ${totalRemainder}`);
    return totalRemainder;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================================================ 
   UI UPDATE FUNCTIONS 
   ============================================================================ */

function updateUI() {
    const elements = getElements();

    // Atjaunina round indicator
    if (elements.roundText) {
        elements.roundText.textContent = `Līnija ${state.currentRound}/6`;
    }

    // Atjaunina phase text
    if (elements.phaseText) {
        const phaseConfig = YARROW_CONFIG.phases[state.phase];
        elements.phaseText.textContent = phaseConfig ? phaseConfig.name : state.phase;
    }

    // Atjaunina instruction
    if (elements.instructionText) {
        const instructions = [
            'Pirmā līnija: Situācijas pamats',
            'Otrā līnija: Iekšējā sagatavošanās',
            'Trešā līnija: Pāreja uz darbību',
            'Ceturtā līnija: Ārējā aktivitāte',
            'Piektā līnija: Vadība un atbildība',
            'Sestā līnija: Kulminācija'
        ];
        elements.instructionText.textContent = instructions[state.currentRound - 1] || '';
    }

    // Atjaunina action button
    if (elements.actionButton) {
        if (state.isAnimating) {
            elements.actionButton.textContent = 'Notiek process...';
            elements.actionButton.disabled = true;
        } else if (state.currentRound > state.maxRounds) {
            elements.actionButton.textContent = 'Skatīt rezultātus';
            elements.actionButton.disabled = false;
        } else {
            elements.actionButton.textContent = 'Turpināt';
            elements.actionButton.disabled = false;
        }
    }

    // Atjaunina heksagrammas preview
    if (elements.linePreview) {
        let previewHTML = '';
        for (let i = 0; i < 6; i++) {
            const lineValue = state.hexagramLines[5 - i]; // Apgriezti (no augšas)
            if (lineValue) {
                const config = YARROW_CONFIG.lineValues[lineValue];
                const isChanging = lineValue === 6 || lineValue === 9;
                previewHTML += `<div class="hexagram-line ${config.type}${isChanging ? ' changing' : ''}">` +
                    `${config.display}</div>`;
            } else {
                previewHTML += '<div class="hexagram-line empty">—</div>';
            }
        }
        elements.linePreview.innerHTML = previewHTML;
    }
}

/* ============================================================================ 
   MAIN GAME LOOP 
   ============================================================================ */

async function handleAction() {
    if (state.isAnimating) return;

    if (state.currentRound > state.maxRounds) {
        completeHexagram();
        return;
    }

    state.isAnimating = true;
    state.phase = 'shuffling';
    updateUI();

    try {
        // 1. Sajauc stiebrus
        await animateShuffling();

        // 2. Sadala divās kaudzēs un skaitīt - 3 reizes
        state.phase = 'dividing';
        updateUI();

        const result = performTraditionalYarrowDivision();

        // Simulē vizuālās animācijas katrai operācijai
        for (let i = 0; i < 3; i++) {
            await animateDividing();
            await animateCounting();
        }

        console.log(`[YARROW] ℹ️ Line ${state.currentRound}: operations ${result.operations.join(',')} = sum ${result.sum} = value ${result.value}`);

        // 3. Pievieno līniju rezultātiem
        state.hexagramLines.push(result.value);
        state.currentLineValue = result;

        // 4. Sagatavo nākamajam roundam
        state.currentRound++;
        state.phase = 'initial';
        state.workingStalks = 48; // Reset stalks for next round

        // 5. Atjaunina UI
        updateUI();

    } catch (error) {
        console.error('[YARROW] ❌ Error in handleAction:', error);
    } finally {
        state.isAnimating = false;
        updateUI();
    }
}

function completeHexagram() {
    console.log(`[YARROW] ✅ Hexagram completed: ${JSON.stringify({
        method: 'yarrow',
        question: window.currentQuestion || 'Nav norādīts',
        questionCategory: window.currentQuestionCategory || 'general',
        primaryHexagram: calculatePrimaryHexagram(),
        secondaryHexagram: calculateSecondaryHexagram(),
        changingLines: getChangingLines(),
        hexagramLines: state.hexagramLines,
        timestamp: new Date().toISOString()
    })}`);

    // Saglabā rezultātus globāli
    window.divinationResults = {
        method: 'yarrow',
        question: window.currentQuestion || 'Nav norādīts',
        questionCategory: window.currentQuestionCategory || 'general',
        primaryHexagram: calculatePrimaryHexagram(),
        secondaryHexagram: calculateSecondaryHexagram(),
        changingLines: getChangingLines(),
        hexagramLines: state.hexagramLines,
        timestamp: new Date().toISOString()
    };

    // Pārslēdzas uz rezultātu lapu
    if (typeof window.goToResultPage === 'function') {
        window.goToResultPage();
    } else if (typeof window.showPage === 'function') {
        window.showPage('resultPage');
    }
}

function calculatePrimaryHexagram() {
    const lines = state.hexagramLines.map(value => {
        return (value === 7 || value === 9) ? 1 : 0; // Yang = 1, Yin = 0
    });

    return findHexagramFromLines(lines);
}

function calculateSecondaryHexagram() {
    const changingLines = getChangingLines();
    if (changingLines.length === 0) return null;

    const lines = state.hexagramLines.map(value => {
        if (value === 6) return 1; // Veca Yin → Yang
        if (value === 9) return 0; // Vecs Yang → Yin
        return (value === 7 || value === 9) ? 1 : 0; // Nemainīgie paliek
    });

    return findHexagramFromLines(lines);
}

function getChangingLines() {
    const changing = [];
    state.hexagramLines.forEach((value, index) => {
        if (value === 6 || value === 9) {
            changing.push(index + 1);
        }
    });
    return changing;
}

function findHexagramFromLines(lines) {
    try {
        if (typeof getHexagramByLines === 'function') {
            return getHexagramByLines(lines);
        }

        if (typeof window !== 'undefined' && window.IChingHexagrams && window.IChingHexagrams.getHexagramByLines) {
            return window.IChingHexagrams.getHexagramByLines(lines);
        }

        // Fallback
        return {
            number: 1,
            chinese: '乾',
            latvian: 'Radošā Spēka',
            lines: lines
        };

    } catch (error) {
        console.warn('[YARROW] ⚠️ Error finding hexagram:', error);
        return {
            number: 1,
            chinese: '乾',
            latvian: 'Radošā Spēka',
            lines: lines
        };
    }
}

/* ============================================================================ 
   INITIALIZATION 
   ============================================================================ */

function initYarrow() {
    console.log('[YARROW] ✅ Yarrow initialized and bound to index.html elements');

    // Reset state
    state.currentRound = 1;
    state.hexagramLines = [];
    state.isAnimating = false;
    state.phase = 'initial';
    state.workingStalks = 48;

    // Create initial stalks
    createStalks(49);

    // Update UI
    updateUI();

    // Bind button
    const elements = getElements();
    if (elements.actionButton) {
        elements.actionButton.onclick = handleAction;
    }
}

function resetYarrow() {
    state.currentRound = 1;
    state.hexagramLines = [];
    state.isAnimating = false;
    state.phase = 'initial';
    state.workingStalks = 48;
    updateUI();
}

/* ============================================================================ 
   MODULE EXPORTS 
   ============================================================================ */

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYarrow);
} else {
    // Check if yarrow page is visible
    const yarrowPage = document.getElementById('yarrowPage');
    if (yarrowPage && yarrowPage.style.display !== 'none') {
        initYarrow();
    }
}

// Window exports
window.YarrowModule = {
    init: initYarrow,
    handleAction: handleAction,
    getState: () => ({ ...state }),
    reset: resetYarrow,
    createStalks: createStalks,
    updateUI: updateUI,
    isAnimating: () => state.isAnimating,
    getCurrentRound: () => state.currentRound,
    getHexagramLines: () => [...state.hexagramLines]
};

console.log('🌾 Yarrow Module loaded and integrated with index.html!');