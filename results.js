/* ============================================================================
   RESULTS.JS - PERMANENT FIKSĒJUMS 2025.08.17
   ============================================================================ */

'use strict';

console.log('🌟 Results.js - Permanent Fix loaded!');

/* ----------------------------------------------------------------------------
   ENTRYPOINT: ielāde + kļūdu apstrāde
---------------------------------------------------------------------------- */
function loadDivinationResults() {
    console.log('🔄 Sākam ielādēt rezultātus (Permanent Fix)...');

    try {
        if (!window.divinationResults) {
            throw new Error('Nav divinationResults datu');
        }

        console.log('📊 Rezultāti ielādēti no window.divinationResults');

        // ✅ FORCE INJECT rezultātus tieši Body
        setTimeout(() => {
            injectResultsDirectly();
        }, 100);

    } catch (error) {
        console.error('❌ Kļūda ielādējot rezultātus:', error);
        showResultsError('Neizdevās ielādēt rezultātus. Lūdzu mēģiniet vēlreiz.');
    }
}

/* ----------------------------------------------------------------------------
   GALVENĀ INJEKCIJA: veidojam visu skatījumu vienā šablonā
---------------------------------------------------------------------------- */
function injectResultsDirectly() {
    const data = window.divinationResults;
    const primary = data.primaryHexagram;
    const secondary = data.secondaryHexagram;
    const changingLines = data.changingLines || [];

    // ✅ Stabilizējam mainīgo līniju sarakstu (dedup + sort)
    const clist = Array.from(new Set(changingLines)).sort((a, b) => a - b);

    console.log('🎨 Injektējam rezultātus tieši...');

    // ✅ INJECT rezultātus tieši BODY (kā mēs testējām)
    document.body.innerHTML = `
<div style="
    width: 100vw; 
    height: 100vh; 
    background: white; 
    padding: 20px; 
    font-family: Georgia, serif; 
    overflow-y: auto;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999;
    line-height: 1.6;
">
    <div style="max-width: 800px; margin: 0 auto;">
        <!-- HEADER -->
        <h1 style="text-align: center; color: #DAA520; margin-bottom: 2rem;">
            🌟 I Ching Rezultāti
        </h1>
        
        <div style="text-align: center; border-bottom: 2px solid #DAA520; padding-bottom: 1rem; margin-bottom: 2rem;">
            <h2 style="font-style: italic; color: #2c3e50;">"${data.question || 'Nav norādīts jautājums'}"</h2>
            <p style="color: #666;">${data.method === 'yarrow' ? '🌾 Milleņu Stiebri' : '🪙 Monētas'}</p>
            <p style="color: #999; font-size: 0.9em;">Datums: ${new Date().toLocaleString('lv-LV')}</p>
        </div>

        <!-- ======================= PRIMARY HEXAGRAM CARD ======================= -->
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px; padding: 2rem; margin: 2rem 0; border: 2px solid rgba(218, 165, 32, 0.3); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
            <!-- Primary virsraksts: numurs, hanzi, lv nosaukums -->
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="color: #DAA520; font-weight: bold; font-size: 1.1em;">#${primary.number}</div>
                <div style="font-size: 3em; color: #DAA520; margin: 0.5rem 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);">${primary.chinese}</div>
                <div style="font-size: 1.4em; color: #2c3e50; font-weight: 600;">${primary.latvian || primary.name}</div>
            </div>
            
            <!-- Heksagrammas līnijas -->
            <div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0; gap: 6px;">
                ${generateHexagramLinesHTML(primary.lines, clist)}
            </div>

            <!-- BLOCK A: Primārās heksagrammas marķējums (esošā situācija) -->
            <div style="display:inline-block; background:#fff; border-left:4px solid #DAA520; padding:.5rem .75rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin-bottom:.75rem;">
                <strong>Primārā heksagramma — esošā situācija</strong>
                <ul style="margin:.35rem 0 0 1.1rem; padding:0; color:#2c3e50;">
                    <li>Esošās situācijas analīze</li>
                    <li>Iesaistīto spēku raksturojums</li>
                    <li>Galvenie izaicinājumi un iespējas</li>
                </ul>
            </div>

            <!-- Primary: Vispārējais skaidrojums -->
            ${primary.interpretation?.general ? `
                <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #DAA520; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                    <h3 style="color: #DAA520; margin-bottom: 1rem;">📖 Vispārējais Skaidrojums</h3>
                    <p style="margin: 0; line-height: 1.7; color: #2c3e50;">${primary.interpretation.general}</p>
                </div>
            ` : ''}

                        <!-- BLOCK B: Primārās "⚡ Enerģijas profils" (element/sezona/virziens/keywords) -->
            ${(primary.element || primary.season || primary.direction || (primary.keywords?.length)) ? `
              <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:.75rem;">⚡ Enerģijas profils</h3>

                <div style="display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:.25rem;">
                  ${primary.element ? `<span style="padding:.25rem .6rem; border:1px solid #e7c55a; border-radius:999px; color:#000;">Element: ${primary.element}</span>` : ''}
                  ${primary.season  ? `<span style="padding:.25rem .6rem; border:1px solid #e7c55a; border-radius:999px; color:#000;">Sezona: ${primary.season}</span>` : ''}
                  ${primary.direction ? `<span style="padding:.25rem .6rem; border:1px solid #e7c55a; border-radius:999px; color:#000;">Virziens: ${primary.direction}</span>` : ''}
                </div>

                ${primary.keywords?.length ? `
                  <div style="display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.25rem;">
                    ${primary.keywords.map(k => `
                      <span style="padding:.2rem .55rem; background:#fff9e6; border:1px solid #f1d98b; border-radius:999px; font-size:.95em; color:#000;">${k}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            <!-- /BLOCK B -->

        </div>
        <!-- ===================== /PRIMARY HEXAGRAM CARD END ===================== -->

        <!-- BLOCK C: Interpretācijas kategorijas (love/career/health/finance/spirituality) -->
        ${primary.interpretation?.love ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">💞 Mīlestība</h3>
                <p style="margin:0; line-height:1.7; color:#2c3e50;">${primary.interpretation.love}</p>
            </div>
        ` : ''}

        ${primary.interpretation?.career ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">💼 Karjera</h3>
                <p style="margin:0; line-height:1.7; color:#2c3e50;">${primary.interpretation.career}</p>
            </div>
        ` : ''}

        ${primary.interpretation?.health ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">🩺 Veselība</h3>
                <p style="margin:0; line-height:1.7; color:#2c3e50;">${primary.interpretation.health}</p>
            </div>
        ` : ''}

        ${primary.interpretation?.finance ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">💰 Finanses</h3>
                <p style="margin:0; line-height:1.7; color:#2c3e50;">${primary.interpretation.finance}</p>
            </div>
        ` : ''}

        ${primary.interpretation?.spirituality ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">🧘 Garīgums</h3>
                <p style="margin:0; line-height:1.7; color:#2c3e50;">${primary.interpretation.spirituality}</p>
            </div>
        ` : ''}

        <!-- BLOCK D: Padomi (do / don’t) -->
        ${(primary.advice?.do?.length || primary.advice?.dont?.length) ? `
            <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #DAA520; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#DAA520; margin-bottom:1rem;">🧭 Padomi</h3>
                ${primary.advice?.do?.length ? `
                    <h4 style="margin:.5rem 0; color:#2c3e50;">✅ Ko darīt</h4>
                    <ul style="margin:.25rem 0 1rem 1.2rem; color:#2c3e50;">
                        ${primary.advice.do.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                ` : ''}
                ${primary.advice?.dont?.length ? `
                    <h4 style="margin:.5rem 0; color:#2c3e50;">❌ Ko nedarīt</h4>
                    <ul style="margin:.25rem 0 0 1.2rem; color:#2c3e50;">
                        ${primary.advice.dont.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        ` : ''}

        <!-- =================== MAINĪGĀS LĪNIJAS + SEKUNDĀRĀ =================== -->
        ${(clist.length > 0 && secondary) ? `
            <!-- Mainīgo līniju galvene -->
            <div style="text-align: center; margin: 2rem 0; color: #666;">
                <div style="background: rgba(255, 107, 53, 0.1); padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem; color: #ff6b35; font-weight: bold;">
                    Mainīgās līnijas: ${clist.join(', ')}
                </div>
                <div style="font-size: 2em; margin: 0.5rem 0;">⬇️</div>
                <div style="color: #DAA520; font-weight: bold;">Attīstības virziens</div>

                <!-- BLOCK E: Mainīgo līniju teksti (no primary.changingLines) -->
                ${(primary.changingLines && clist.length) ? `
                    <div style="max-width:800px; margin:1rem auto 0; text-align:left;">
                        ${clist.map(pos => {
                            const t = primary.changingLines?.[pos];
                            return t ? `
                                <div style="background:#fff; padding:1rem; border-radius:8px; margin:.5rem 0; border-left:4px solid #ff6b35; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                                    <strong style="color:#ff6b35;">${pos}. līnija:</strong>
                                    <span style="color:#2c3e50; margin-left:.5rem;">${t}</span>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Sekundārās heksagrammas konteiners -->
            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); border-radius: 15px; padding: 2rem; margin: 2rem 0; border: 2px solid rgba(76, 175, 80, 0.3); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">

                <!-- BLOCK F: Sekundārās marķējums (attīstības virziens) -->
                <div style="display:inline-block; background:#fff; border-left:4px solid #4CAF50; padding:.5rem .75rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin-bottom:.75rem;">
                  <strong>Sekundārā heksagramma — attīstības virziens</strong>
                  <ul style="margin:.35rem 0 0 1.1rem; padding:0; color:#2c3e50;">
                    <li>Situācijas attīstības tendences</li>
                    <li>Iespējamie rezultāti</li>
                    <li>Nepieciešamā rīcība/attieksmes maiņa</li>
                  </ul>
                </div>

                <div style="text-align: center;">
                    <div style="color: #4CAF50; font-weight: bold; font-size: 1.1em;">#${secondary.number}</div>
                    <div style="font-size: 3em; color: #4CAF50; margin: 0.5rem 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);">${secondary.chinese}</div>
                    <div style="font-size: 1.4em; color: #2c3e50; font-weight: 600;">${secondary.latvian || secondary.name}</div>
                    
                    <div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0; gap: 6px;">
                        ${generateHexagramLinesHTML(secondary.lines, [])}
                    </div>
                    
                    <!-- Sekundārā: Vispārējais skaidrojums -->
                    ${secondary.interpretation?.general ? `
                        <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #4CAF50; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                            <h3 style="color: #4CAF50; margin-bottom: 1rem;">📖 Vispārējais Skaidrojums</h3>
                            <p style="margin: 0; line-height: 1.7; color: #2c3e50;">${secondary.interpretation.general}</p>
                        </div>
                    ` : ''}

                                <!-- BLOCK F: Sekundārās "🌱 Attīstības profils" (element/sezona/virziens/keywords) -->
            ${(secondary.element || secondary.season || secondary.direction || (secondary.keywords?.length)) ? `
              <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #4CAF50; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color:#4CAF50; margin-bottom:.75rem;">🌱 Attīstības profils</h3>

                <div style="display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:.25rem;">
                  ${secondary.element ? `<span style="padding:.25rem .6rem; border:1px solid #9cd3b0; border-radius:999px; background:#e9f7ed; color:#000;">Element: ${secondary.element}</span>` : ''}
                  ${secondary.season  ? `<span style="padding:.25rem .6rem; border:1px solid #9cd3b0; border-radius:999px; background:#e9f7ed; color:#000;">Sezona: ${secondary.season}</span>` : ''}
                  ${secondary.direction ? `<span style="padding:.25rem .6rem; border:1px solid #9cd3b0; border-radius:999px; background:#e9f7ed; color:#000;">Virziens: ${secondary.direction}</span>` : ''}
                </div>

                ${secondary.keywords?.length ? `
                  <div style="display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.25rem;">
                    ${secondary.keywords.map(k => `
                      <span style="padding:.2rem .55rem; background:#e9f7ed; border:1px solid #9cd3b0; border-radius:999px; font-size:.95em; color:#000;">${k}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            <!-- /BLOCK F -->


                    <!-- Sekundārās "➡️ Ieteikumi virzienam" (no secondary.advice.do) -->
                    ${secondary.advice?.do?.length ? `
                      <div style="background:#fff; padding:1.5rem; border-radius:10px; margin:1rem 0; border-left:4px solid #4CAF50; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                        <h3 style="color:#4CAF50; margin-bottom:.75rem;">➡️ Ieteikumi virzienam</h3>
                        <ul style="margin:.25rem 0 0 1.2rem; color:#2c3e50;">
                          ${secondary.advice.do.map(x => `<li>${x}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}

                </div>
            </div>
        ` : ''}

        <!-- ================== PĒC HEKSAGRAMMĀM: Jautājumi/Refleksijas ================== -->
        <!-- BLOCK H: Jautājums sev → Ceļa refleksija → Metafora → Filozofija -->
        ${primary.selfQuestion ? `
            <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #DAA520; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                <h3 style="color: #DAA520; margin-bottom: 1rem;">🔍 Jautājums sev</h3>
                <p style="margin: 0; line-height: 1.7; color: #2c3e50;">${primary.selfQuestion}</p>
            </div>
        ` : ''}

        ${primary.pathReflection ? `
            <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #DAA520; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                <h3 style="color: #DAA520; margin-bottom: 1rem;">🧭 Ceļa refleksija</h3>
                <p style="margin: 0; line-height: 1.7; color: #2c3e50;">${primary.pathReflection}</p>
            </div>
        ` : ''}

        ${primary.metaphor ? `
            <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #DAA520; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color: #DAA520; margin-bottom: 1rem;">🎨 Metafora</h3>
                <p style="margin: 0; line-height: 1.7; color: #2c3e50;"><strong>${primary.metaphor.text || ''}</strong></p>
                ${primary.metaphor.explanation ? `<p style="margin: .5rem 0 0 0; color: #2c3e50;">${primary.metaphor.explanation}</p>` : ''}
                ${primary.metaphor.source ? `<p style="margin: .5rem 0 0 0; font-style: italic; color: #2c3e50;">— ${primary.metaphor.source}</p>` : ''}
            </div>
        ` : ''}

        ${primary.philosophy ? `
            <div style="background: #fff; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0; border-left: 4px solid #DAA520; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                <h3 style="color: #DAA520; margin-bottom: 1rem;">📜 Filozofija</h3>
                <p style="margin: 0; line-height: 1.7; color: #2c3e50;">${primary.philosophy}</p>
            </div>
        ` : ''}

        <!-- Darbības (print/export/share/new) -->
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin: 3rem 0;">
            <button onclick="window.print()" style="padding: 0.8rem 1.5rem; border: none; border-radius: 25px; background: #f8f9fa; color: #2c3e50; border: 2px solid #DAA520; cursor: pointer; font-size: 1em; transition: all 0.3s ease;">
                🖨️ Drukāt
            </button>
            <button onclick="exportResults()" style="padding: 0.8rem 1.5rem; border: none; border-radius: 25px; background: #f8f9fa; color: #2c3e50; border: 2px solid #DAA520; cursor: pointer; font-size: 1em; transition: all 0.3s ease;">
                📄 Eksportēt
            </button>
            <button onclick="shareResults()" style="padding: 0.8rem 1.5rem; border: none; border-radius: 25px; background: #f8f9fa; color: #2c3e50; border: 2px solid #DAA520; cursor: pointer; font-size: 1em; transition: all 0.3s ease;">
                📤 Dalīties
            </button>
            <button onclick="window.location.reload()" style="padding: 0.8rem 1.5rem; border: none; border-radius: 25px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; cursor: pointer; font-size: 1em; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🔮 Jauns Lasījums
            </button>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
            <p style="margin: 0;">Izveidots ar I Ching digitālo sistēmu</p>
            <p style="margin: 0.5rem 0 0 0;">${new Date().toISOString().split('T')[0]}</p>
        </div>
    </div>
</div>
    `;

    console.log('✅ Rezultāti veiksmīgi injektēti!');
}

/* ----------------------------------------------------------------------------
   LĪNIJU ZĪMĒŠANA: yang / yin + ⚡ indikators mainīgajām
---------------------------------------------------------------------------- */
function generateHexagramLinesHTML(lines, changingLines = []) {
    if (!lines || !Array.isArray(lines)) {
        return '<div style="color: red;">Nav līniju datu</div>';
    }

    let html = '';
    
    // Renderē līnijas no augšas uz leju (6 -> 1)
    for (let i = lines.length - 1; i >= 0; i--) {
        const linePosition = i + 1;
        const isYang = lines[i] === 1;
        const isChanging = changingLines.includes(linePosition);
        
        const baseStyle = `
            width: 80px; 
            height: 8px; 
            border-radius: 4px; 
            position: relative; 
            transition: all 0.3s ease;
            margin: 2px 0;
        `;
        
        const yangStyle = `
            ${baseStyle}
            background: linear-gradient(90deg, #DAA520, #FFD700);
            box-shadow: 0 0 10px rgba(218, 165, 32, 0.3);
        `;
        
        const yinStyle = `
            ${baseStyle}
            background: linear-gradient(90deg, #DAA520 0%, #DAA520 35%, transparent 35%, transparent 65%, #DAA520 65%, #DAA520 100%);
        `;
        
        const changingIndicator = isChanging ? 
            '<span style="position: absolute; right: -25px; top: -5px; font-size: 1.2em; color: #ff6b35;">⚡</span>' : '';
        
        html += `
            <div style="${isYang ? yangStyle : yinStyle}${isChanging ? ' animation: changingPulse 2s ease-in-out infinite;' : ''}" 
                 title="${linePosition}. līnija: ${isYang ? 'Yang' : 'Yin'}${isChanging ? ' (mainīga)' : ''}">
                ${changingIndicator}
            </div>
        `;
    }
    
    return html;
}

/* ----------------------------------------------------------------------------
   UTILS: Eksports uz .txt
---------------------------------------------------------------------------- */
function exportResults() {
    const data = window.divinationResults;
    const primary = data.primaryHexagram;
    
    let content = '═══════════════════════════════════════\n';
    content += '           I CHING REZULTĀTI\n';
    content += '═══════════════════════════════════════\n\n';
    content += `Jautājums: "${data.question || 'Nav norādīts'}"\n`;
    content += `Metode: ${data.method === 'yarrow' ? 'Milleņu Stiebri' : 'Monētas'}\n`;
    content += `Datums: ${new Date().toLocaleString('lv-LV')}\n\n`;
    content += `Heksagramma: #${primary.number} ${primary.chinese} - ${primary.latvian}\n`;
    
    if (primary.interpretation?.general) {
        content += 'Skaidrojums:\n' + primary.interpretation.general + '\n\n';
    }
    
    content += '═══════════════════════════════════════\n';
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iching-results-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('📄 Fails eksportēts!');
}

/* ----------------------------------------------------------------------------
   UTILS: Dalīšanās
---------------------------------------------------------------------------- */
function shareResults() {
    const data = window.divinationResults;
    const primary = data.primaryHexagram;
    const shareData = {
        title: `I Ching Rezultāti - ${primary.latvian}`,
        text: `Es tikko saņēmu I Ching interpretāciju heksagrammai #${primary.number} "${primary.latvian}".`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).then(() => {
            showToast('📤 Veiksmīgi dalīts!');
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToast('📋 Saturs kopēts starpliktuvē!');
    }
}

/* ----------------------------------------------------------------------------
   UI: Toast helper
---------------------------------------------------------------------------- */
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

/* ----------------------------------------------------------------------------
   UI: Kļūdas ekrāns
---------------------------------------------------------------------------- */
function showResultsError(message) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f9fa; font-family: Georgia, serif;">
            <div style="text-align: center; padding: 3rem; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 10px; max-width: 500px;">
                <div style="font-size: 3em; margin-bottom: 1rem;">⚠️</div>
                <div style="font-size: 1.2em; color: #856404; margin-bottom: 2rem;">${message}</div>
                <button onclick="window.location.reload()" style="background: #DAA520; color: white; border: none; padding: 1rem 2rem; border-radius: 25px; cursor: pointer; font-size: 1.1em;">
                    🔄 Mēģināt Vēlreiz
                </button>
            </div>
        </div>
    `;
}

/* ----------------------------------------------------------------------------
   GLOBAL EXPORTS
---------------------------------------------------------------------------- */
if (typeof window !== 'undefined') {
    window.loadDivinationResults = loadDivinationResults;
    window.initializeResults = loadDivinationResults;
    window.exportResults = exportResults;
    window.shareResults = shareResults;
    
    console.log('✅ Results.js Permanent Fix functions exported');
}

console.log('🎯 Results.js Permanent Fix ready!');
