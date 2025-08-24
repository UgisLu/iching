/* ============================================================================
   METHODS.JS - I CHING METOŽU IZVĒLES MODULIS
   ============================================================================
   
   Atbildīgs par:
   - Metožu prezentāciju un izvēli
   - Method card interakcijām
   - Metodes validāciju
   - Pāreju uz nākamo soli
   - Local storage metožu preferences (ja nepieciešams)
   
   Atkarības: hexagrams.js (METHODS konstantes)
   ============================================================================ */

'use strict';

/* ============================================================================
   GLOBAL STATE MANAGEMENT
   ============================================================================ */

let methodsState = {
    selectedMethod: null,
    isAnimating: false,
    preferences: {
        rememberChoice: false,
        defaultMethod: null,
        showAnimations: true
    },
    analytics: {
        yarrowSelections: 0,
        coinSelections: 0,
        totalSelections: 0
    }
};

/* ============================================================================
   DOM ELEMENT REFERENCES
   ============================================================================ */

let methodElements = {
    container: null,
    yarrowCard: null,
    coinCard: null,
    cards: [],
    continueButton: null,
    backButton: null,
    loadingSpinner: null,
    errorMessage: null
};

/* ============================================================================
   METHOD CONFIGURATION DATA
   ============================================================================ */

const methodConfigs = {
    yarrow: {
        id: 'yarrow',
        name: 'Milleņu Stiebru Metode',
        nameOriginal: '蓍草法',
        icon: '🌾',
        iconAlt: 'Yarrow stalks',
        description: 'Tradicionālā, meditatīvā pieeja, ko izmantoja senie ķīniešu gudrie. Sakrāla ceremonija ar dziļu koncentrēšanos uz jūsu jautājumu.',
        features: {
            duration: '5-8 min',
            atmosphere: 'Meditatīva',
            experience: 'Sakrāla',
            complexity: 'Sarežģīta',
            tradition: 'Senākā (3000+ gadi)',
            accuracy: 'Augstākā filozofiskā precizitāte'
        },
        advantages: [
            'Dziļa meditativa pieredze',
            'Tradicionālā I Ching metode',
            'Matemātiski precīzākas varbūtības',
            'Spiritual connection ar senčiem',
            'Laiks kontemplācijai'
        ],
        disadvantages: [
            'Prasa vairāk laika',
            'Sarežģītāks process',
            'Nepieciešama pacietība',
            'Var šķist lēns mūsdienās'
        ],
        bestFor: [
            'Svarīgi dzīves lēmumi',
            'Garīgā attīstība',
            'Meditatīvā prakse',
            'Tradīciju cienītāji',
            'Dziļa pašizpēte'
        ],
        process: {
            steps: 6,
            stepsDescription: '6 līnijas, pa vienai',
            timePerStep: '45-90 sekundes',
            totalStalks: 49,
            method: 'Dalīšana un skaitīšana'
        }
    },

    coins: {
        id: 'coins',
        name: 'Monētu Metode',
        nameOriginal: '投錢法',
        icon: '🪙',
        iconAlt: 'Three coins',
        description: 'Mūsdienu praktiskā pieeja I Ching gudrībai. Ātra un ērta metode, kas ļauj iegūt rezultātu jebkurā vietā.',
        features: {
            duration: '2-3 min',
            atmosphere: 'Praktiska',
            experience: 'Interaktīva',
            complexity: 'Vienkārša',
            tradition: 'Jaunāka (500+ gadi)',
            accuracy: 'Laba praktiskā precizitāte'
        },
        advantages: [
            'Ātrs un vienkāršs',
            'Jebkur un jebkurā laikā',
            'Viegli saprotams',
            'Interaktīvs process',
            'Mūsdienīga pieeja'
        ],
        disadvantages: [
            'Mazāk meditatīvs',
            'Var šķist pārāk vienkāršs',
            'Mazāka filozofiskā dziļumu',
            'Nav tradicionālais rituals'
        ],
        bestFor: [
            'Ātri jautājumi',
            'Ikdienas padomi',
            'Sākēji I Ching',
            'Praktiska izvēle',
            'Mūsdienu dzīvesveids'
        ],
        process: {
            steps: 6,
            stepsDescription: '6 līnijas ar 3 monētām',
            timePerStep: '15-30 sekundes',
            totalCoins: 3,
            method: 'Monētu mešana'
        },
        changingLines: {
            enabled: true,
            description: 'Monētu metode ļauj iegūt "mainīgās līnijas" (6 un 9), kas rada otro heksagrammu - situācijas attīstības prognoze.'
        }
    }
};

/* ============================================================================
   INITIALIZATION FUNCTIONS
   ============================================================================ */

function initializeMethods() {
    try {
        // Cache DOM elements
        cacheDOMElements();
        
        // Load user preferences
        loadMethodPreferences();
        
        // Setup event listeners
        setupMethodEventListeners();
        
        // Render method cards
        renderMethodCards();
        
        // Setup accessibility
        setupAccessibility();
        
        // Load analytics if available
        loadMethodAnalytics();
        
        console.log('🌟 Methods module initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize methods module:', error);
        showMethodError('Metožu moduļa inicializācija neizdevās. Lūdzu pārlādējiet lapu.');
    }
}

function cacheDOMElements() {
    methodElements.container = document.getElementById('methodSelection');
    methodElements.yarrowCard = document.querySelector('[data-method="yarrow"]');
    methodElements.coinCard = document.querySelector('[data-method="coins"]');
    methodElements.cards = document.querySelectorAll('.method-card');
    methodElements.continueButton = document.getElementById('methodContinueBtn');
    methodElements.backButton = document.getElementById('methodBackBtn');
    methodElements.loadingSpinner = document.getElementById('methodLoadingSpinner');
    methodElements.errorMessage = document.getElementById('methodErrorMessage');
    
    // Validate critical elements exist
    if (!methodElements.container) {
        throw new Error('Method selection container not found');
    }
    
    if (methodElements.cards.length === 0) {
        throw new Error('No method cards found');
    }
}

/* ============================================================================
   EVENT HANDLERS
   ============================================================================ */

function setupMethodEventListeners() {
    // Method card clicks
    methodElements.cards.forEach(card => {
        card.addEventListener('click', handleMethodCardClick);
        card.addEventListener('keydown', handleMethodCardKeydown);
        
        // Hover effects (if animations enabled)
        if (methodsState.preferences.showAnimations) {
            card.addEventListener('mouseenter', handleMethodCardHover);
            card.addEventListener('mouseleave', handleMethodCardLeave);
        }
    });
    
    // Continue button
    if (methodElements.continueButton) {
        methodElements.continueButton.addEventListener('click', handleContinueClick);
    }
    
    // Back button
    if (methodElements.backButton) {
        methodElements.backButton.addEventListener('click', handleBackClick);
    }
    
    // Escape key to cancel selection
    document.addEventListener('keydown', handleMethodKeyboardShortcuts);
    
    // Window resize for responsive adjustments
    window.addEventListener('resize', handleMethodResize);
}

function handleMethodCardClick(event) {
    event.preventDefault();
    
    if (methodsState.isAnimating) return;
    
    const card = event.currentTarget;
    const method = card.dataset.method;
    
    if (!method || !methodConfigs[method]) {
        console.error('Invalid method:', method);
        return;
    }
    
    selectMethod(method, card);
}

function handleMethodCardKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleMethodCardClick(event);
    }
    
    // Arrow key navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        navigateMethodCards(event.key === 'ArrowRight' ? 1 : -1);
    }
}

function handleMethodCardHover(event) {
    if (methodsState.isAnimating) return;
    
    const card = event.currentTarget;
    const method = card.dataset.method;
    
    // Add hover state
    card.classList.add('method-card-hover');
    
    // Show preview information (optional)
    showMethodPreview(method);
}

function handleMethodCardLeave(event) {
    const card = event.currentTarget;
    card.classList.remove('method-card-hover');
    
    // Hide preview information
    hideMethodPreview();
}

function handleContinueClick(event) {
    event.preventDefault();
    
    if (!methodsState.selectedMethod) {
        showMethodError('Lūdzu izvēlieties metodi pirms turpināšanas.');
        return;
    }
    
    proceedWithSelectedMethod();
}

function handleBackClick(event) {
    event.preventDefault();
    
    if (typeof goBackToHome === 'function') {
        goBackToHome();
    } else {
        console.warn('goBackToHome function not available');
    }
}

function handleMethodKeyboardShortcuts(event) {
    // Only handle shortcuts when on methods page
    if (!methodElements.container?.style.display === 'block') return;
    
    switch(event.key) {
        case 'Escape':
            clearMethodSelection();
            break;
        case '1':
            selectMethod('yarrow');
            break;
        case '2':
            selectMethod('coins');
            break;
        case 'Enter':
            if (methodsState.selectedMethod && event.ctrlKey) {
                proceedWithSelectedMethod();
            }
            break;
    }
}

function handleMethodResize() {
    // Responsive adjustments if needed
    adjustMethodLayoutForViewport();
}

/* ============================================================================
   CORE METHOD SELECTION LOGIC
   ============================================================================ */

function selectMethod(methodId, cardElement = null) {
    try {
        // Validate method
        if (!methodConfigs[methodId]) {
            throw new Error(`Unknown method: ${methodId}`);
        }
        
        // Prevent multiple rapid selections
        if (methodsState.isAnimating) return;
        
        methodsState.isAnimating = true;
        
        // Clear previous selection
        clearMethodSelection(false);
        
        // Set new selection
        methodsState.selectedMethod = methodId;
        
        // Find card element if not provided
        if (!cardElement) {
            cardElement = document.querySelector(`[data-method="${methodId}"]`);
        }
        
        if (cardElement) {
            // Visual selection feedback
            cardElement.classList.add('method-card-selected');
            cardElement.setAttribute('aria-selected', 'true');
            
            // Animation sequence
            animateMethodSelection(cardElement, methodId);
        }
        
        // Update analytics
        updateMethodAnalytics(methodId);
        
        // Save preference if enabled
        if (methodsState.preferences.rememberChoice) {
            saveMethodPreference(methodId);
        }
        
        // Show continue button
        showContinueButton();
        
        // Accessibility announcement
        announceMethodSelection(methodId);
        
        console.log(`✅ Method selected: ${methodId}`);
        
    } catch (error) {
        console.error('❌ Error selecting method:', error);
        showMethodError('Metodes izvēlē radās kļūda. Lūdzu mēģiniet vēlreiz.');
    } finally {
        // Reset animation flag after delay
        setTimeout(() => {
            methodsState.isAnimating = false;
        }, 1000);
    }
}

function clearMethodSelection(animated = true) {
    // Clear visual selection
    methodElements.cards.forEach(card => {
        card.classList.remove('method-card-selected', 'method-card-hover');
        card.setAttribute('aria-selected', 'false');
    });
    
    // Reset state
    methodsState.selectedMethod = null;
    
    // Hide continue button
    hideContinueButton(animated);
    
    // Clear any preview
    hideMethodPreview();
}

function animateMethodSelection(cardElement, methodId) {
    if (!methodsState.preferences.showAnimations) {
        return;
    }
    
    // Selection animation sequence
    const config = methodConfigs[methodId];
    
    // Glowing effect
    cardElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    cardElement.style.transform = 'scale(1.05)';
    cardElement.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
    
    // Icon animation
    const icon = cardElement.querySelector('.method-icon');
    if (icon) {
        icon.style.transition = 'transform 0.6s ease';
        icon.style.transform = 'scale(1.2) rotate(5deg)';
        
        setTimeout(() => {
            icon.style.transform = 'scale(1.1)';
        }, 600);
    }
    
    // Sparkle effect (optional)
    if (config.id === 'yarrow') {
        createSparkleEffect(cardElement, '#DAA520');
    } else {
        createSparkleEffect(cardElement, '#FFD700');
    }
    
    // Reset animations after selection
    setTimeout(() => {
        cardElement.style.transform = 'scale(1.02)';
    }, 400);
}

function createSparkleEffect(element, color) {
    const sparkleCount = 8;
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'method-sparkle';
        sparkle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            animation: methodSparkle 1s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        // Clean up sparkle
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }
}

/* ============================================================================
   UI UPDATE FUNCTIONS
   ============================================================================ */

function renderMethodCards() {
    // This function would enhance existing HTML cards with dynamic content
    // if needed, but primarily works with static HTML structure
    
    methodElements.cards.forEach(card => {
        const method = card.dataset.method;
        const config = methodConfigs[method];
        
        if (!config) return;
        
        // Enhance cards with additional data attributes
        card.setAttribute('data-duration', config.features.duration);
        card.setAttribute('data-complexity', config.features.complexity);
        card.setAttribute('data-tradition', config.features.tradition);
        
        // Add ARIA labels
        card.setAttribute('aria-label', 
            `${config.name}. ${config.description}. Ilgums: ${config.features.duration}. ${config.features.atmosphere} pieredze.`
        );
        
        // Add keyboard hints
        card.setAttribute('title', `Spiediet Enter vai atstarpi, lai izvēlētos ${config.name}`);
    });
}

function showContinueButton() {
    if (!methodElements.continueButton) return;
    
    methodElements.continueButton.style.display = 'inline-flex';
    methodElements.continueButton.disabled = false;
    
    if (methodsState.preferences.showAnimations) {
        methodElements.continueButton.style.opacity = '0';
        methodElements.continueButton.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            methodElements.continueButton.style.transition = 'all 0.3s ease';
            methodElements.continueButton.style.opacity = '1';
            methodElements.continueButton.style.transform = 'translateY(0)';
        }, 100);
    }
}

function hideContinueButton(animated = true) {
    if (!methodElements.continueButton) return;
    
    if (animated && methodsState.preferences.showAnimations) {
        methodElements.continueButton.style.transition = 'all 0.3s ease';
        methodElements.continueButton.style.opacity = '0';
        methodElements.continueButton.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            methodElements.continueButton.style.display = 'none';
        }, 300);
    } else {
        methodElements.continueButton.style.display = 'none';
    }
}

function showMethodPreview(methodId) {
    // Optional: Show preview tooltip or sidebar with method details
    const config = methodConfigs[methodId];
    if (!config) return;
    
    // Implementation would depend on UI design
    // Could show floating tooltip with advantages/disadvantages
}

function hideMethodPreview() {
    // Hide any preview elements
}

function showMethodError(message) {
    if (methodElements.errorMessage) {
        methodElements.errorMessage.textContent = message;
        methodElements.errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (methodElements.errorMessage) {
                methodElements.errorMessage.style.display = 'none';
            }
        }, 5000);
    } else {
        // Fallback to alert if no error element
        alert(message);
    }
}

/* ============================================================================
   NAVIGATION AND FLOW CONTROL
   ============================================================================ */

function proceedWithSelectedMethod() {
    if (!methodsState.selectedMethod) {
        showMethodError('Nav izvēlēta metode.');
        return;
    }
    
    const config = methodConfigs[methodsState.selectedMethod];
    
    try {
        // Store selected method globally
        if (typeof window !== 'undefined') {
            window.selectedDivinationMethod = methodsState.selectedMethod;
            window.selectedMethodConfig = config;
        }
        
        // Call global navigation function
        if (typeof goToQuestionPage === 'function') {
            goToQuestionPage();
        } else {
            console.error('goToQuestionPage function not available');
            showMethodError('Navigācijas kļūda. Lūdzu pārlādējiet lapu.');
        }
        
        console.log(`🚀 Proceeding with method: ${methodsState.selectedMethod}`);
        
    } catch (error) {
        console.error('❌ Error proceeding with method:', error);
        showMethodError('Pārejas kļūda. Lūdzu mēģiniet vēlreiz.');
    }
}

function navigateMethodCards(direction) {
    const cards = Array.from(methodElements.cards);
    const currentIndex = cards.findIndex(card => 
        card === document.activeElement
    );
    
    let newIndex;
    if (currentIndex === -1) {
        newIndex = direction > 0 ? 0 : cards.length - 1;
    } else {
        newIndex = (currentIndex + direction + cards.length) % cards.length;
    }
    
    cards[newIndex].focus();
}

/* ============================================================================
   PERSISTENCE AND ANALYTICS
   ============================================================================ */

function loadMethodPreferences() {
    try {
        const saved = localStorage.getItem('ichingMethodPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            methodsState.preferences = { ...methodsState.preferences, ...preferences };
        }
    } catch (error) {
        console.warn('Could not load method preferences:', error);
    }
}

function saveMethodPreference(methodId) {
    try {
        methodsState.preferences.defaultMethod = methodId;
        localStorage.setItem('ichingMethodPreferences', 
            JSON.stringify(methodsState.preferences)
        );
    } catch (error) {
        console.warn('Could not save method preference:', error);
    }
}

function loadMethodAnalytics() {
    try {
        const saved = localStorage.getItem('ichingMethodAnalytics');
        if (saved) {
            const analytics = JSON.parse(saved);
            methodsState.analytics = { ...methodsState.analytics, ...analytics };
        }
    } catch (error) {
        console.warn('Could not load method analytics:', error);
    }
}

function updateMethodAnalytics(methodId) {
    methodsState.analytics.totalSelections++;
    
    if (methodId === 'yarrow') {
        methodsState.analytics.yarrowSelections++;
    } else if (methodId === 'coins') {
        methodsState.analytics.coinSelections++;
    }
    
    try {
        localStorage.setItem('ichingMethodAnalytics', 
            JSON.stringify(methodsState.analytics)
        );
    } catch (error) {
        console.warn('Could not save method analytics:', error);
    }
}

/* ============================================================================
   ACCESSIBILITY FUNCTIONS
   ============================================================================ */

function setupAccessibility() {
    // Add ARIA attributes and keyboard navigation
    methodElements.cards.forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-selected', 'false');
        
        // Add position info for screen readers
        card.setAttribute('aria-posinset', index + 1);
        card.setAttribute('aria-setsize', methodElements.cards.length);
    });
    
    // Add live region for announcements
    if (!document.getElementById('methodAriaLive')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'methodAriaLive';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);
    }
}

function announceMethodSelection(methodId) {
    const liveRegion = document.getElementById('methodAriaLive');
    if (liveRegion) {
        const config = methodConfigs[methodId];
        liveRegion.textContent = `Izvēlēta ${config.name}. ${config.description}`;
    }
}

/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

function adjustMethodLayoutForViewport() {
    // Responsive layout adjustments
    const viewport = window.innerWidth;
    
    if (viewport < 768) {
        // Mobile adjustments
        methodElements.cards.forEach(card => {
            card.classList.add('method-card-mobile');
        });
    } else {
        // Desktop adjustments  
        methodElements.cards.forEach(card => {
            card.classList.remove('method-card-mobile');
        });
    }
}

function getSelectedMethodConfig() {
    return methodsState.selectedMethod ? methodConfigs[methodsState.selectedMethod] : null;
}

function getMethodAnalytics() {
    return { ...methodsState.analytics };
}

function resetMethodSelection() {
    clearMethodSelection();
    methodsState.selectedMethod = null;
}

/* ============================================================================
   CSS ANIMATION DEFINITIONS (Dynamic)
   ============================================================================ */

function injectMethodAnimationCSS() {
    if (document.getElementById('methodAnimationStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'methodAnimationStyles';
    style.textContent = `
        @keyframes methodSparkle {
            0% {
                opacity: 1;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) rotate(360deg);
            }
        }
        
        .method-card-hover {
            transform: translateY(-5px) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .method-card-selected {
            animation: methodSelectionPulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes methodSelectionPulse {
            0% {
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            }
            100% {
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.7);
            }
        }
        
        .method-card-mobile {
            margin-bottom: 1rem;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .method-card, .method-card-hover, .method-card-selected {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/* ============================================================================
   MODULE INITIALIZATION AND EXPORTS
   ============================================================================ */

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMethods);
} else {
    initializeMethods();
}

// Inject CSS animations
injectMethodAnimationCSS();

// Global exports
if (typeof window !== 'undefined') {
    window.MethodsModule = {
        // Core functions
        selectMethod,
        clearMethodSelection,
        proceedWithSelectedMethod,
        resetMethodSelection,
        
        // State access
        getSelectedMethod: () => methodsState.selectedMethod,
        getSelectedMethodConfig,
        getMethodAnalytics,
        
        // Configuration
        methodConfigs,
        
        // Utilities
        navigateMethodCards,
        adjustMethodLayoutForViewport
    };
}

// Node.js exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        methodConfigs,
        selectMethod,
        clearMethodSelection,
        getMethodAnalytics,
        initializeMethods
    };
}

/* ============================================================================
   METHODS.JS PABEIGTS - METOŽU IZVĒLES MODULIS GATAVS!
   ============================================================================
   
   🌟 FUNKCIONALITĀTE:
   - Interaktīva metožu prezentācija
   - Yarrow vs Coins salīdzinājums  
   - Animācijas un vizuālie efekti
   - Keyboard navigation un accessibility
   - Local storage preferences
   - Analytics tracking
   - Error handling
   - Responsive design
   
   🎯 INTEGRĀCIJA:
   - Savieno ar hexagrams.js (konstantes)
   - Gatavojas question.js (nākamais solis)
   - Global state management
   - Event-driven architecture
   
   ============================================================================ */