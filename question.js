/*    
===========================================================================    
                        QUESTION.JS v6.1 - OPTIMIZED & BUG-FIXED    
                          I Ching Question Module    
                     ✅ FIXED: Persistence bug & performance optimized  
===========================================================================    
*/

// =============================================================================    
// 1. GLOBAL VARIABLES & CONFIGURATION    
// =============================================================================

let questionData = {    
    text: '',    
    category: 'general',    
    qualityScore: 0,    
    timestamp: null,
    isCleared: false  // NEW: Track if question was manually cleared
};

const CONFIG = {    
    MIN_LENGTH: 10,    
    MAX_LENGTH: 500,    
    DEBOUNCE_DELAY: 300,    
    QUALITY_WEIGHTS: {    
        length: 0.2,    
        words: 0.25,    
        specificity: 0.25,    
        structure: 0.15,    
        clarity: 0.15    
    }    
};

let debounceTimer = null;
let elements = {}; // Cache DOM elements for performance

// =============================================================================    
// 2. INITIALIZATION & EVENT SETUP    
// =============================================================================

function initializeQuestionModule() {    
    console.log('🎯 Initializing Question Module v6.0 - OPTIMIZED...');    
        
    // Wait for DOM    
    if (document.readyState === 'loading') {    
        document.addEventListener('DOMContentLoaded', setupEventListeners);    
    } else {    
        setupEventListeners();    
    }    
        
    // Load saved question (with clear check)
    loadSavedQuestion();  
      
    // App integration check
    setTimeout(function() {  
        if (window.IChingApp) {  
            console.log('✅ IChingApp detected - integration ready');  
        } else {  
            console.warn('⚠️ IChingApp not found - may cause sync issues');  
        }  
    }, 1000);  
}

function setupEventListeners() {    
    console.log('🔧 Setting up optimized event listeners...');    
    
    // Cache DOM elements for performance
    cacheElements();
        
    // Input field events    
    if (elements.input) {    
        console.log('✅ Question input found');    
            
        // Main input handler    
        elements.input.addEventListener('input', function(event) {    
            handleInputChange(event.target.value);    
        });    
            
        // OPTIMIZED: Only save on explicit actions, not blur
        elements.input.addEventListener('focus', function() {    
            console.log('📝 Input focused');    
        });    
            
    } else {    
        console.error('❌ Question input not found');    
    }    
        
    // Clear button    
    if (elements.clearBtn) {    
        console.log('✅ Clear button found');    
        elements.clearBtn.addEventListener('click', function() {    
            clearQuestion();    
        });    
    } else {    
        console.error('❌ Clear button not found');    
    }    
        
    // Continue button    
    if (elements.continueBtn) {    
        console.log('✅ Continue button found');    
        elements.continueBtn.addEventListener('click', function() {    
            handleContinue();    
        });    
    } else {    
        console.error('❌ Continue button not found');    
    }    
        
    // Keyboard shortcuts    
    document.addEventListener('keydown', function(event) {    
        // Ctrl+Enter = Continue    
        if (event.ctrlKey && event.key === 'Enter') {    
            event.preventDefault();    
            handleContinue();    
        }    
            
        // Escape = Clear    
        if (event.key === 'Escape') {    
            event.preventDefault();    
            clearQuestion();    
        }    
    });    
        
    console.log('✅ All optimized event listeners set up successfully');    
}

// PERFORMANCE: Cache DOM elements to avoid repeated queries
function cacheElements() {
    elements = {
        input: document.getElementById('questionInput'),
        clearBtn: document.getElementById('questionClearBtn'),
        continueBtn: document.getElementById('questionContinueBtn'),
        charCounter: document.getElementById('questionCharCounter'),
        qualityScore: document.getElementById('questionQualityScore'),
        feedback: document.getElementById('questionFeedback'),
        category: document.getElementById('questionCategory'),
        suggestions: document.getElementById('questionFeedbackList'), // ✅ Fixed ID!
        examples: document.getElementById('questionExamples'),
        qualityIndicator: document.getElementById('questionQualityIndicator') // ✅ Added!
    };
}

// =============================================================================    
// 3. MAIN EVENT HANDLERS - OPTIMIZED   
// =============================================================================

function handleInputChange(value) {    
    console.log('📝 Input changed, length: ' + value.length);    
        
    // Clear previous debounce    
    if (debounceTimer) {    
        clearTimeout(debounceTimer);    
    }    
        
    // Update immediately    
    updateCharacterCounter(value.length);    
    questionData.text = value;    
    questionData.isCleared = false; // Reset cleared flag when typing
        
    // Debounced updates    
    debounceTimer = setTimeout(function() {    
        updateQualityScore(value);    
        updateContinueButton(value);    
        detectAndShowCategory(value);  
    }, CONFIG.DEBOUNCE_DELAY);    
}

function clearQuestion() {    
    console.log('🧹 Clearing question...');    
        
    if (elements.input) {    
        elements.input.value = '';    
        elements.input.focus();    
            
        // Reset data with cleared flag
        questionData = {    
            text: '',    
            category: 'general',    
            qualityScore: 0,    
            timestamp: null,
            isCleared: true  // CRITICAL: Mark as manually cleared
        };    
            
        // Update UI    
        updateCharacterCounter(0);    
        updateQualityScore('');    
        updateContinueButton('');    
        clearCategory();    
            
        // FIXED: Clear ALL storage types
        localStorage.removeItem('ichingQuestion');    
        sessionStorage.removeItem('ichingQuestion');
        localStorage.removeItem('ichingQuestionData'); // Extra safety
            
        // Hide suggestions and examples
        hideElement('questionSuggestions');
        hideElement('questionExamples');  
            
        console.log('✅ Question cleared completely from all storage');    
    }    
}

// OPTIMIZED: Simplified handleContinue without unnecessary saves
function handleContinue() {    
    console.log('➡️ Continue clicked from question.js');    
        
    if (!elements.input) {    
        console.error('❌ Input not found');    
        return false;    
    }    
        
    const question = elements.input.value.trim();    
    console.log('📝 Question text:', question);  
    console.log('📊 Question length:', question.length);  
    console.log('📊 Quality score:', questionData.qualityScore);  
        
    // Validation
    if (question.length < CONFIG.MIN_LENGTH) {    
        console.warn('⚠️ Question too short:', question.length, '< required:', CONFIG.MIN_LENGTH);  
        showFeedback('Jautājums ir pārāk īss. Vismaz ' + CONFIG.MIN_LENGTH + ' rakstzīmes.', 'warning');    
        elements.input.focus();    
        return false;    
    }    
        
    if (questionData.qualityScore < 20) {    
        console.warn('⚠️ Question quality too low:', questionData.qualityScore);  
        showFeedback('Lūdzu, uzlabojiet jautājuma kvalitāti - esiet specifiskāks.', 'warning');    
        elements.input.focus();    
        return false;    
    }    
        
    // Update final data
    questionData.text = question;    
    questionData.timestamp = Date.now();
    questionData.isCleared = false;
        
    // CRITICAL: Pass to app.js (PRIMARY mechanism)
    if (window.IChingApp && typeof window.IChingApp.setCurrentQuestion === 'function') {  
        console.log('✅ Setting question via app.js setCurrentQuestion()');  
        window.IChingApp.setCurrentQuestion(question, questionData.category);  
    } else {  
        console.warn('⚠️ IChingApp.setCurrentQuestion not found, using fallback');  
        // Fallback mechanism
        if (window.appState) {  
            window.appState.currentQuestion = question;  
            window.appState.currentQuestionCategory = questionData.category;  
        }  
        window.currentQuestion = question;  
        window.currentQuestionData = questionData;  
    }  
        
    // REMOVED: saveQuestion() call that caused persistence bug
    // App.js handles the data now
        
    console.log('✅ Question validated and passed to app.js');  
        
    // Navigate to next step
    if (window.IChingApp && typeof window.IChingApp.proceedToDivination === 'function') {    
        console.log('🎯 Using app.proceedToDivination()');    
        window.IChingApp.proceedToDivination();    
    } else {    
        console.log('📝 Question ready, no app navigation function found');    
        showFeedback('Jautājums saglabāts! Turpiniet ar nākamo soli.', 'success');    
    }  
      
    return true;  
}

// =============================================================================    
// 4. UI UPDATE FUNCTIONS - OPTIMIZED   
// =============================================================================

function updateCharacterCounter(length) {    
    if (!elements.charCounter) return;
    
    elements.charCounter.textContent = length + '/' + CONFIG.MAX_LENGTH;    
        
    // Color coding    
    if (length === 0) {    
        elements.charCounter.className = 'char-count';    
    } else if (length < CONFIG.MIN_LENGTH) {    
        elements.charCounter.className = 'char-count char-warning';    
    } else if (length > CONFIG.MAX_LENGTH * 0.9) {    
        elements.charCounter.className = 'char-count char-danger';    
    } else {    
        elements.charCounter.className = 'char-count char-success';    
    }    
}

function updateQualityScore(question) {    
    if (!question || question.trim().length === 0) {    
        showQualityScore(0, 'Ierakstiet jautājumu lai sāktu...');
        // Clear quality indicator when empty
        if (elements.qualityIndicator) {
            elements.qualityIndicator.innerHTML = '<div class="no-question">Ierakstiet jautājumu lai redzētu analīzi</div>';
        }
        return;    
    }    
        
    const score = calculateQualityScore(question);    
    questionData.qualityScore = score;    
    
    // Calculate component breakdown for visualization
    const breakdown = calculateQualityBreakdown(question);
        
    let feedback = '';    
    if (score < 20) {    
        feedback = 'Pārāk īss jautājums';    
    } else if (score < 40) {    
        feedback = 'Varētu būt specifiskāks';    
    } else if (score < 60) {    
        feedback = 'Labs jautājums';    
    } else if (score < 80) {    
        feedback = 'Ļoti labs jautājums';    
    } else {    
        feedback = 'Izcils jautājums!';    
    }    
        
    showQualityScore(score, feedback);
    updateQualityIndicator(score, breakdown); // ✅ NEW: Populate indicator!
      
    // Show suggestions if quality is low  
    if (score < 50) {  
        showSuggestions(question);  
    } else {  
        if (elements.suggestions) {
            elements.suggestions.innerHTML = ''; // Clear suggestions
        }
    }  
}

function showQualityScore(score, feedback) {    
    if (elements.qualityScore) {    
        elements.qualityScore.textContent = Math.round(score);    
    }    
        
    if (elements.feedback) {    
        elements.feedback.textContent = feedback;    
            
        // Color coding    
        elements.feedback.className = 'feedback ';    
        if (score < 30) {    
            elements.feedback.className += 'feedback-warning';    
        } else if (score < 60) {    
            elements.feedback.className += 'feedback-info';    
        } else {    
            elements.feedback.className += 'feedback-success';    
        }    
    }    
}

function updateContinueButton(question) {    
    if (!elements.continueBtn) return;    
        
    const hasMinLength = question.trim().length >= CONFIG.MIN_LENGTH;  
    const hasDecentQuality = questionData.qualityScore >= 20;
    const isValid = hasMinLength && hasDecentQuality;  
        
    elements.continueBtn.disabled = !isValid;    
    elements.continueBtn.className = 'btn ' + (isValid ? 'btn-primary' : 'btn-secondary');    
        
    if (isValid) {    
        elements.continueBtn.textContent = 'Turpināt →';  
        hideElement('questionSuggestions');  
        showExamples();    
    } else {    
        elements.continueBtn.textContent = 'Uzlabojiet jautājumu';  
        showSuggestions(question);  
        showExamples();  
    }    
}

function detectAndShowCategory(question) {    
    if (!question || question.trim().length < 10) {    
        clearCategory();    
        return;    
    }    
        
    const category = detectQuestionCategory(question);    
    questionData.category = category;    
    showCategory(category);  
      
    if (category && category !== 'general') {  
        showExamples(category);  
    } else if (question.trim().length >= 15) {  
        showExamples('general');  
    }  
}

function showCategory(category) {    
    if (!elements.category) return;    
        
    const categories = {    
        love: { text: '💕 Mīlestība un attiecības', class: 'category-love' },    
        career: { text: '💼 Karjera un darbs', class: 'category-career' },    
        finance: { text: '💰 Finanses', class: 'category-finance' },    
        health: { text: '🌱 Veselība', class: 'category-health' },    
        family: { text: '👨‍👩‍👧‍👦 Ģimene', class: 'category-family' },    
        spiritual: { text: '🧘 Garīgums', class: 'category-spiritual' },    
        general: { text: '🎯 Vispārīgs', class: 'category-general' }    
    };    
        
    const cat = categories[category] || categories.general;    
    elements.category.textContent = cat.text;    
    elements.category.className = 'category ' + cat.class;    
    elements.category.style.display = 'block';    
}

function clearCategory() {    
    if (elements.category) {    
        elements.category.style.display = 'none';    
    }    
}

function showFeedback(message, type) {    
    if (elements.feedback) {    
        elements.feedback.textContent = message;    
        elements.feedback.className = 'feedback feedback-' + type;    
        elements.feedback.style.display = 'block';    
            
        // Auto-hide after 4 seconds    
        setTimeout(function() {    
            elements.feedback.style.display = 'none';    
        }, 4000);    
    }    
        
    console.log('📢 Feedback (' + type + '): ' + message);    
}

// =============================================================================    
// 5. QUALITY SCORING ALGORITHM (UNCHANGED - WORKING)   
// =============================================================================

function calculateQualityScore(question) {    
    if (!question || question.trim().length === 0) {    
        return 0;    
    }    
        
    const text = question.trim();    
    let totalScore = 0;    
        
    // Length score (20%)    
    const lengthScore = Math.min(100, (text.length / 100) * 100);    
    totalScore += lengthScore * CONFIG.QUALITY_WEIGHTS.length;    
        
    // Word count score (25%)    
    const words = text.split(/\s+/).filter(word => word.length > 0);    
    const wordScore = Math.min(100, (words.length / 15) * 100);    
    totalScore += wordScore * CONFIG.QUALITY_WEIGHTS.words;    
        
    // Specificity score (25%)    
    const specificityScore = calculateSpecificityScore(text);    
    totalScore += specificityScore * CONFIG.QUALITY_WEIGHTS.specificity;    
        
    // Structure score (15%)    
    const structureScore = calculateStructureScore(text);    
    totalScore += structureScore * CONFIG.QUALITY_WEIGHTS.structure;    
        
    // Clarity score (15%)    
    const clarityScore = calculateClarityScore(text);    
    totalScore += clarityScore * CONFIG.QUALITY_WEIGHTS.clarity;    
        
    return Math.min(100, Math.max(0, totalScore));    
}

function calculateSpecificityScore(text) {    
    let score = 0;    
    const lowerText = text.toLowerCase();    
        
    // Question words (+10 each)    
    const questionWords = ['kā', 'kāpēc', 'kad', 'kur', 'kas', 'vai', 'kāds', 'cik'];    
    questionWords.forEach(word => {    
        if (lowerText.includes(word)) score += 10;    
    });    
        
    // Specific domains (+15 each)    
    const domains = ['darbs', 'attiecības', 'mīlestība', 'karjera', 'ģimene', 'finanses', 'veselība'];    
    domains.forEach(domain => {    
        if (lowerText.includes(domain)) score += 15;    
    });    
        
    // Personal pronouns (+5 each)    
    const pronouns = ['man', 'mana', 'mans', 'mani', 'mums', 'mūsu'];    
    pronouns.forEach(pronoun => {    
        if (lowerText.includes(pronoun)) score += 5;    
    });    
        
    return Math.min(100, score);    
}

function calculateStructureScore(text) {    
    let score = 50; // Base score    
        
    // Has question mark    
    if (text.includes('?')) score += 20;    
        
    // Proper capitalization    
    if (/^[A-ZĀČĒĢĪĶĻŅŠŪŽ]/.test(text)) score += 15;    
        
    // No excessive punctuation    
    if (!/[!]{2,}/.test(text) && !/[?]{2,}/.test(text)) score += 15;    
        
    return Math.min(100, score);    
}

function calculateClarityScore(text) {    
    let score = 50; // Base score    
        
    // Not too many complex words    
    const words = text.split(/\s+/);    
    const longWords = words.filter(word => word.length > 10).length;    
    if (longWords / words.length < 0.3) score += 25;    
        
    // Good sentence structure    
    if (text.split('.').length <= 3) score += 25;    
        
    return Math.min(100, score);    
}

// =============================================================================    
// 6. CATEGORY DETECTION (UNCHANGED - WORKING)   
// =============================================================================

function detectQuestionCategory(question) {    
    const text = question.toLowerCase();    
        
    // Love & Relationships    
    const loveWords = ['mīlestība', 'attiecības', 'partneris', 'partnere', 'romantika', 'laulība', 'precības', 'iemīlēšana'];    
    if (loveWords.some(word => text.includes(word))) return 'love';    
        
    // Career & Work    
    const careerWords = ['darbs', 'karjera', 'profesija', 'amats', 'kolēģi', 'vadītājs', 'alga', 'bizness'];    
    if (careerWords.some(word => text.includes(word))) return 'career';    
        
    // Finance    
    const financeWords = ['nauda', 'finanses', 'investīcijas', 'aizdevums', 'ieguldījums', 'izmaksas', 'ieņēmumi'];    
    if (financeWords.some(word => text.includes(word))) return 'finance';    
        
    // Health    
    const healthWords = ['veselība', 'slimība', 'ārsts', 'ārstēšana', 'medicīna', 'simptomi'];    
    if (healthWords.some(word => text.includes(word))) return 'health';    
        
    // Family    
    const familyWords = ['ģimene', 'bērni', 'vecāki', 'māte', 'tēvs', 'brālis', 'māsa', 'omes', 'tantes'];    
    if (familyWords.some(word => text.includes(word))) return 'family';    
        
    // Spiritual    
    const spiritualWords = ['garīgums', 'dvēsele', 'meditācija', 'lūgšana', 'karma', 'enerģija'];    
    if (spiritualWords.some(word => text.includes(word))) return 'spiritual';    
        
    return 'general';    
}

// =============================================================================    
// 7. SUGGESTIONS & EXAMPLES (OPTIMIZED)   
// =============================================================================

function showSuggestions(question) {  
    const suggestions = generateSuggestions(question);  
      
    if (!elements.suggestions || !suggestions.length) {  
        if (elements.suggestions) {
            elements.suggestions.innerHTML = ''; // Clear instead of hide
        }
        return;  
    }  
      
    // Create HTML for existing structure - simple list items
    let html = '';  
      
    suggestions.forEach(function(suggestion) {  
        html += '<li class="feedback-item">' + suggestion + '</li>';  
    });  
      
    elements.suggestions.innerHTML = html;  
      
    console.log('💡 Showing ' + suggestions.length + ' suggestions in feedback list');  
}

function generateSuggestions(question) {  
    const suggestions = [];  
    const text = question.trim().toLowerCase();  
      
    if (question.length < 15) {  
        suggestions.push('Paplašiniet jautājumu ar vairāk detaļām');  
    }  
      
    if (!question.includes('?')) {  
        suggestions.push('Pievienojiet jautājuma zīmi (?) jautājuma beigās');  
    }  
      
    const questionWords = ['kā', 'kāpēc', 'kad', 'kur', 'kas', 'vai', 'kāds', 'cik'];  
    if (!questionWords.some(word => text.includes(word))) {  
        suggestions.push('Izmantojiet specifiskus jautājuma vārdus (kā, kāpēc, kad, utt.)');  
    }  
      
    const personalWords = ['man', 'mana', 'mans', 'mani', 'es'];  
    if (!personalWords.some(word => text.includes(word))) {  
        suggestions.push('Padariet jautājumu personiskāku, izmantojot "es", "man", "mana"');  
    }  
      
    if (questionData.category === 'general') {  
        suggestions.push('Norādiet konkrētu dzīves sfēru (darbs, attiecības, veselība, utt.)');  
    }  
      
    if (text.includes('vai') && (text.includes('jā') || text.includes('nē'))) {  
        suggestions.push('I Ching sniedz dziļākas atbildes - jautājiet "kā" vai "kāpēc" nevis "vai"');  
    }  
      
    return suggestions;  
}

function showExamples(category) {  
    const actualCategory = category || questionData.category || 'general';  
    const examples = getExamplesByCategory(actualCategory);  
      
    if (!elements.examples || !examples.length) {  
        hideElement('questionExamples');
        return;  
    }  
      
    let html = '<h4>📝 Piemēri jautājumiem (' + actualCategory + '):</h4>' +  
               '<p class="examples-help">Noklikšķiniet uz piemēru, lai to izmantotu</p>' +  
               '<ul class="examples-list">';  
      
    examples.forEach(function(example) {  
        html += '<li class="example-item" onclick="window.QuestionModule.useExample(\'' +   
                example.replace(/'/g, "\\'") + '\')" style="cursor: pointer; padding: 0.5rem; border: 1px solid #444; margin: 0.25rem 0; border-radius: 4px;">' +   
                example + '</li>';  
    });  
      
    html += '</ul>';  
      
    elements.examples.innerHTML = html;  
    elements.examples.style.display = 'block';  
      
    console.log('📝 Showing ' + examples.length + ' examples for category: ' + actualCategory);  
}

function getExamplesByCategory(category) {  
    const examples = {  
        love: [  
            'Kā man uzlabot attiecības ar savu partneri?',  
            'Vai man vajadzētu precēties šogad?',  
            'Kāpēc man ir grūti atrast īsto mīlestību?',  
            'Kā atrisināt konfliktu attiecībās?',  
            'Kāds ir mans ceļš uz mīlestību?'  
        ],  
        career: [  
            'Vai man vajadzētu mainīt darbu?',  
            'Kā man sasniegt karjeras mērķus?',  
            'Kāds ir mans īstais aicinājums?',  
            'Kā uzlabot attiecības ar kolēģiem?',  
            'Vai ir labs laiks karjeras maiņai?'  
        ],  
        finance: [  
            'Kā man uzlabot savu finansiālo stāvokli?',  
            'Vai ir labs laiks investīcijām?',  
            'Kāpēc man vienmēr trūkst naudas?',  
            'Kā sasniegt finansiālo stabilitāti?',  
            'Kāda ir mana attieksme pret naudu?'  
        ],  
        health: [  
            'Kā man uzlabot savu veselību?',  
            'Kāpēc man ir konstants stress?',  
            'Kā man atrast enerģiju ikdienai?',  
            'Kāds ir mans ceļš uz labsajūtu?',  
            'Kā sasniegt ķermeņa un prāta harmoniju?'  
        ],  
        family: [  
            'Kā man uzlabot attiecības ar vecākiem?',  
            'Kā mans lēmums ietekmēs ģimeni?',  
            'Kāds ir mans loma ģimenē?',  
            'Kā atrisināt ģimenes konfliktu?',  
            'Kā atrast laiku ģimenei?'  
        ],  
        spiritual: [  
            'Kāds ir mans garīgais ceļš?',  
            'Kā man atrast iekšējo mieru?',  
            'Kāda ir mana dzīves jēga?',  
            'Kā attīstīt savu intuīciju?',  
            'Kā sasniegt garīgo izaugsmi?'  
        ],  
        general: [  
            'Kāds ir mans nākamais solis dzīvē?',  
            'Kā man pieņemt šo grūto lēmumu?',  
            'Kas man tagad ir vissvarīgākais?',  
            'Kāda ir mana dzīves mācība?',  
            'Kā atrast savu ceļu?'  
        ]  
    };  
      
    return examples[category] || examples.general;  
}

function useExample(example) {  
    console.log('🔄 Using example:', example);  
      
    if (elements.input) {  
        elements.input.value = example;  
        elements.input.focus();  
          
        handleInputChange(example);  
          
        showFeedback('Piemērs ievietots!', 'success');  
          
        console.log('✅ Used example: ' + example);  
    }  
}

function hideElement(elementId) {  
    const element = document.getElementById(elementId);  
    if (element) {  
        element.style.display = 'none';  
    }  
}

// =============================================================================    
// 8. QUALITY INDICATOR VISUALIZATION - NEW!   
// =============================================================================

function updateQualityIndicator(score, breakdown) {
    if (!elements.qualityIndicator) return;
    
    // Create visual quality breakdown
    let html = '<div class="quality-breakdown">';
    
    // Overall progress bar
    html += '<div class="overall-progress">';
    html += '<div class="progress-label">Kopējā kvalitāte: ' + Math.round(score) + '%</div>';
    html += '<div class="progress-bar">';
    html += '<div class="progress-fill" style="width: ' + score + '%; background: ' + getScoreColor(score) + '"></div>';
    html += '</div>';
    html += '</div>';
    
    // Component breakdown if available
    if (breakdown) {
        html += '<div class="component-scores">';
        
        Object.keys(breakdown).forEach(function(key) {
            const value = breakdown[key];
            const label = getComponentLabel(key);
            html += '<div class="component-item">';
            html += '<span class="component-label">' + label + ':</span>';
            html += '<span class="component-value">' + Math.round(value) + '%</span>';
            html += '<div class="component-bar">';
            html += '<div class="component-fill" style="width: ' + value + '%; background: ' + getScoreColor(value) + '"></div>';
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    
    elements.qualityIndicator.innerHTML = html;
}

function getScoreColor(score) {
    if (score < 30) return '#dc3545'; // Red
    if (score < 60) return '#ffc107'; // Yellow  
    return '#28a745'; // Green
}

function getComponentLabel(key) {
    const labels = {
        length: 'Garums',
        words: 'Vārdu skaits', 
        specificity: 'Specifiskums',
        structure: 'Struktūra',
        clarity: 'Skaidrība'
    };
    return labels[key] || key;
}

function calculateQualityBreakdown(question) {
    const text = question.trim();
    
    return {
        length: Math.min(100, (text.length / 100) * 100),
        words: Math.min(100, (text.split(/\s+/).filter(word => word.length > 0).length / 15) * 100),
        specificity: calculateSpecificityScore(text),
        structure: calculateStructureScore(text),
        clarity: calculateClarityScore(text)
    };
}

// =============================================================================    
// 9. OPTIMIZED DATA PERSISTENCE    
// =============================================================================

// OPTIMIZED: Only save when explicitly needed, not on every action
function saveQuestion() {    
    // Don't save if manually cleared
    if (questionData.isCleared) {
        console.log('💾 Skipping save - question was cleared');
        return;
    }
    
    try {    
        const data = {    
            text: questionData.text,    
            category: questionData.category,    
            qualityScore: questionData.qualityScore,    
            timestamp: questionData.timestamp || Date.now(),
            isCleared: false
        };    
            
        localStorage.setItem('ichingQuestion', JSON.stringify(data));    
        console.log('💾 Question saved to localStorage');    
    } catch (error) {    
        console.error('❌ Error saving question:', error);    
    }    
}

// OPTIMIZED: Check cleared flag before loading
function loadSavedQuestion() {    
    try {    
        const saved = localStorage.getItem('ichingQuestion');    
        if (saved) {    
            const data = JSON.parse(saved);    
            
            // CRITICAL: Don't load if it was manually cleared
            if (data.isCleared) {
                console.log('📂 Skipping load - question was cleared');
                localStorage.removeItem('ichingQuestion');
                return;
            }
                
            // Load into input    
            if (elements.input && data.text) {    
                elements.input.value = data.text;    
                questionData = data;    
                    
                // Update UI    
                updateCharacterCounter(data.text.length);    
                updateQualityScore(data.text);    
                updateContinueButton(data.text);    
                detectAndShowCategory(data.text);    
                    
                console.log('📂 Question loaded from localStorage');    
            }    
        }    
    } catch (error) {    
        console.error('❌ Error loading question:', error);    
    }    
}

// =============================================================================    
// 10. PUBLIC API & INITIALIZATION    
// =============================================================================

// Public interface for other modules    
window.QuestionModule = {    
    initialize: function() {  
        console.log('🔄 QuestionModule.initialize() called from app.js');  
        initializeQuestionModule();  
        return true;  
    },  
      
    getQuestion: function() {    
        return questionData.text;    
    },    
        
    getCategory: function() {    
        return questionData.category;    
    },    
        
    getQualityScore: function() {    
        return questionData.qualityScore;    
    },    
        
    clearQuestion: clearQuestion,    
        
    isValid: function() {    
        return questionData.text.length >= CONFIG.MIN_LENGTH && questionData.qualityScore >= 20;
    },  
      
    showSuggestions: showSuggestions,  
    showExamples: showExamples,  
    useExample: useExample,  
      
    syncWithApp: function() {  
        const question = questionData.text;  
        const category = questionData.category;  
          
        console.log('🔄 Syncing question with app.js:', question);  
          
        if (window.IChingApp && typeof window.IChingApp.setCurrentQuestion === 'function') {  
            window.IChingApp.setCurrentQuestion(question, category);  
            return true;  
        }  
          
        return false;  
    },  
      
    getQuestionData: function() {  
        return {  
            text: questionData.text,  
            category: questionData.category,  
            quality: questionData.qualityScore,  
            timestamp: questionData.timestamp,  
            isValid: questionData.text.length >= CONFIG.MIN_LENGTH && questionData.qualityScore >= 20
        };  
    },

    // NEW: Manual save trigger for specific cases
    saveNow: function() {
        if (!questionData.isCleared && questionData.text.length > 0) {
            saveQuestion();
        }
    }
};

// Auto-initialize when script loads    
console.log('📝 Question.js v6.0 loaded - PERSISTENCE BUG FIXED!');    
initializeQuestionModule();

// Required CSS (with Quality Indicator styles)
(function addRequiredStyles() {  
    const style = document.createElement('style');  
    style.textContent =   
        '.suggestions-panel { background: rgba(255, 193, 7, 0.1) !important; border: 1px solid rgba(255, 193, 7, 0.3) !important; border-radius: 8px; padding: 1rem; margin: 1rem 0; display: block !important; } ' +  
        '.suggestions-title { color: #FFC107; margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: bold; } ' +  
        '.suggestions-list { list-style: none; padding: 0; margin: 0 0 1rem 0; } ' +  
        '.suggestion-item { background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 6px; padding: 0.75rem; margin: 0.5rem 0; color: #e0e0e0 !important; } ' +  
        '.feedback-item { background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 6px; padding: 0.75rem; margin: 0.5rem 0; color: #e0e0e0 !important; } ' +  
        '.examples-list { list-style: none; padding: 0; margin: 0; } ' +  
        '.example-item { background: rgba(76, 175, 80, 0.1) !important; border: 1px solid rgba(76, 175, 80, 0.3) !important; border-radius: 6px; padding: 0.75rem; margin: 0.5rem 0; color: #e0e0e0 !important; transition: all 0.3s ease; cursor: pointer !important; } ' +  
        '.example-item:hover { background: rgba(76, 175, 80, 0.2) !important; border-color: rgba(76, 175, 80, 0.5) !important; transform: translateX(2px); } ' +  
        '.examples-help { color: #888; font-size: 0.9rem; margin: 0.5rem 0; } ' +  
        '.hide-suggestions-btn { background: transparent; color: #FFC107; border: 1px solid #FFC107; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; } ' +  
        '.hide-suggestions-btn:hover { background: rgba(255, 193, 7, 0.1); } ' +  
        '.quality-breakdown { padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 8px; } ' +
        '.overall-progress { margin-bottom: 1rem; } ' +
        '.progress-label { color: #e0e0e0; font-weight: bold; margin-bottom: 0.5rem; } ' +
        '.progress-bar { width: 100%; height: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; } ' +
        '.progress-fill { height: 100%; border-radius: 10px; transition: width 0.3s ease; } ' +
        '.component-scores { margin-top: 1rem; } ' +
        '.component-item { display: flex; align-items: center; margin-bottom: 0.75rem; } ' +
        '.component-label { color: #cccccc; min-width: 100px; font-size: 0.9rem; } ' +
        '.component-value { color: #e0e0e0; min-width: 40px; text-align: right; margin-right: 0.75rem; font-weight: bold; } ' +
        '.component-bar { flex: 1; height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; } ' +
        '.component-fill { height: 100%; border-radius: 6px; transition: width 0.3s ease; } ' +
        '.no-question { color: #888; text-align: center; padding: 2rem; font-style: italic; } ' +
        '#questionSuggestions, #questionExamples { visibility: visible !important; opacity: 1 !important; }';  
    document.head.appendChild(style);  
    console.log('🎨 Required CSS styles added - including Quality Indicator');  
})();

// BLOCK 1 COMPLETED - OPTIMIZED QUESTION.JS v6.0