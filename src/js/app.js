// LinguaVoice AI - Main Application Coordinator

import { translateText } from './translationService.js';
import { speechEngine } from './speechEngine.js';
import { voiceAssistant } from './voiceAssistant.js';
import { phrasesData } from './phrasesData.js';
import { dictionaryData } from './dictionaryData.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  let translationDebounceTimer = null;
  let currentHistory = JSON.parse(localStorage.getItem('lingua_history') || '[]');
  let activeTab = 'translator';

  // 2. DOM Elements
  const sourceText = document.getElementById('source-text');
  const targetText = document.getElementById('target-text');
  const sourceLangSelect = document.getElementById('source-lang-select');
  const targetLangSelect = document.getElementById('target-lang-select');
  const detectedLangBadge = document.getElementById('detected-lang-badge');
  const loader = document.getElementById('translation-loader');
  const secondaryScriptBox = document.getElementById('secondary-script-box');
  const secondaryScriptText = document.getElementById('secondary-script-text');
  const charCount = document.getElementById('char-count');
  
  const micBtn = document.getElementById('mic-btn');
  const micWaveContainer = document.getElementById('mic-wave-container');
  const clearTextBtn = document.getElementById('clear-text-btn');
  const swapLangBtn = document.getElementById('swap-lang-btn');
  const sourceTtsBtn = document.getElementById('source-tts-btn');
  const targetTtsBtn = document.getElementById('target-tts-btn');
  const copyTargetBtn = document.getElementById('copy-target-btn');
  const favBtn = document.getElementById('fav-btn');
  const shareBtn = document.getElementById('share-btn');
  const tamilScriptToggle = document.getElementById('tamil-script-toggle');

  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Initializations
  voiceAssistant.init();
  renderPhrases('all');
  renderDictionary();
  renderHistory();
  updateHistoryBadge();
  initVoiceSettings();

  // -------------------------------------------------------------
  // TAB NAVIGATION
  // -------------------------------------------------------------
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      activeTab = targetTab;

      navTabs.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(`tab-${targetTab}`);
      if (panel) panel.classList.add('active');
    });
  });

  // -------------------------------------------------------------
  // REAL-TIME TRANSLATION LOGIC
  // -------------------------------------------------------------
  const performTranslation = async () => {
    const text = sourceText.value.trim();
    if (!text) {
      targetText.value = '';
      secondaryScriptBox.classList.add('hidden');
      detectedLangBadge.classList.add('hidden');
      charCount.textContent = '0 / 2000';
      return;
    }

    charCount.textContent = `${text.length} / 2000`;
    loader.classList.remove('hidden');

    const srcLang = sourceLangSelect.value;
    const tgtLang = targetLangSelect.value;

    try {
      const result = await translateText(text, srcLang, tgtLang);
      
      targetText.value = result.translatedText;

      // Handle detected language badge
      if (result.detectedLang) {
        detectedLangBadge.textContent = `Detected: ${result.detectedLang}`;
        detectedLangBadge.classList.remove('hidden');
      } else {
        detectedLangBadge.classList.add('hidden');
      }

      // Handle secondary Tamil script transliteration
      if (result.secondaryScript) {
        secondaryScriptText.textContent = result.secondaryScript;
        secondaryScriptBox.classList.remove('hidden');
      } else {
        secondaryScriptBox.classList.add('hidden');
      }

      // Save to history log
      saveHistoryItem(text, result.translatedText, srcLang, tgtLang);

    } catch (err) {
      console.error("Translation error:", err);
      targetText.value = "Translation error. Please check your network or try again.";
    } finally {
      loader.classList.add('hidden');
    }
  };

  // Debounced input handler
  sourceText.addEventListener('input', () => {
    charCount.textContent = `${sourceText.value.length} / 2000`;
    clearTimeout(translationDebounceTimer);
    translationDebounceTimer = setTimeout(performTranslation, 350);
  });

  sourceLangSelect.addEventListener('change', performTranslation);
  targetLangSelect.addEventListener('change', performTranslation);

  // -------------------------------------------------------------
  // SWAP LANGUAGES BUTTON
  // -------------------------------------------------------------
  swapLangBtn.addEventListener('click', () => {
    const srcVal = sourceLangSelect.value;
    const tgtVal = targetLangSelect.value;

    if (srcVal === 'auto') {
      sourceLangSelect.value = 'tanglish';
      targetLangSelect.value = 'en';
    } else {
      sourceLangSelect.value = tgtVal;
      targetLangSelect.value = srcVal;
    }

    const currentSourceText = sourceText.value;
    const currentTargetText = targetText.value;

    sourceText.value = currentTargetText;
    targetText.value = currentSourceText;

    performTranslation();
    showToast("Languages swapped!");
  });

  // -------------------------------------------------------------
  // CLEAR BUTTON
  // -------------------------------------------------------------
  clearTextBtn.addEventListener('click', () => {
    sourceText.value = '';
    targetText.value = '';
    secondaryScriptBox.classList.add('hidden');
    detectedLangBadge.classList.add('hidden');
    charCount.textContent = '0 / 2000';
    sourceText.focus();
  });

  // -------------------------------------------------------------
  // VOICE INPUT (SPEECH-TO-TEXT) & AUDIO WAVEFORM
  // -------------------------------------------------------------
  micBtn.addEventListener('click', () => {
    if (speechEngine.isListening) {
      speechEngine.stopListening();
      micWaveContainer.classList.add('hidden');
      micBtn.classList.remove('recording');
      speechEngine.stopWaveformAnimation();
    } else {
      micWaveContainer.classList.remove('hidden');
      micBtn.classList.add('recording');
      speechEngine.startWaveformAnimation('mic-canvas');

      const srcLang = sourceLangSelect.value;
      speechEngine.startListening(srcLang,
        (transcript, isFinal) => {
          sourceText.value = transcript;
          performTranslation();
        },
        (err) => {
          showToast(`Microphone error: ${err}`);
          micWaveContainer.classList.add('hidden');
          micBtn.classList.remove('recording');
          speechEngine.stopWaveformAnimation();
        },
        () => {
          micWaveContainer.classList.add('hidden');
          micBtn.classList.remove('recording');
          speechEngine.stopWaveformAnimation();
        }
      );
    }
  });

  // -------------------------------------------------------------
  // TEXT-TO-SPEECH (PLAYBACK)
  // -------------------------------------------------------------
  sourceTtsBtn.addEventListener('click', () => {
    const text = sourceText.value;
    if (text) {
      speechEngine.speakText(text, sourceLangSelect.value);
    }
  });

  targetTtsBtn.addEventListener('click', () => {
    const text = targetText.value;
    if (text) {
      speechEngine.speakText(text, targetLangSelect.value);
    }
  });

  // -------------------------------------------------------------
  // COPY TO CLIPBOARD & FAVORITES
  // -------------------------------------------------------------
  copyTargetBtn.addEventListener('click', () => {
    const text = targetText.value;
    if (text) {
      navigator.clipboard.writeText(text);
      showToast("Translation copied to clipboard!");
    }
  });

  favBtn.addEventListener('click', () => {
    const src = sourceText.value.trim();
    const tgt = targetText.value.trim();
    if (src && tgt) {
      favBtn.classList.toggle('active');
      const icon = favBtn.querySelector('i');
      if (favBtn.classList.contains('active')) {
        icon.className = 'fa-solid fa-star';
        icon.style.color = '#eab308';
        showToast("Saved to Favorites!");
      } else {
        icon.className = 'fa-regular fa-star';
        icon.style.color = '';
      }
    }
  });

  shareBtn.addEventListener('click', () => {
    const text = targetText.value;
    if (text && navigator.share) {
      navigator.share({
        title: 'LinguaVoice Translation',
        text: `${sourceText.value} -> ${text}`
      }).catch(e => console.log('Share error:', e));
    } else if (text) {
      navigator.clipboard.writeText(`${sourceText.value} -> ${text}`);
      showToast("Copied translation share link!");
    }
  });

  // -------------------------------------------------------------
  // QUICK TRY CHIPS
  // -------------------------------------------------------------
  document.querySelectorAll('.quick-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const phraseText = chip.dataset.text;
      sourceText.value = phraseText;
      sourceLangSelect.value = 'tanglish';
      targetLangSelect.value = 'en';
      performTranslation();
    });
  });

  // -------------------------------------------------------------
  // QUICK PHRASES RENDERER & FILTERS
  // -------------------------------------------------------------
  function renderPhrases(category = 'all') {
    const grid = document.getElementById('phrases-grid');
    if (!grid) return;

    const filtered = category === 'all' 
      ? phrasesData 
      : phrasesData.filter(p => p.category === category);

    grid.innerHTML = filtered.map(p => `
      <div class="card phrase-card" data-tanglish="${p.tanglish}" data-english="${p.english}">
        <div>
          <div class="phrase-tanglish">"${p.tanglish}"</div>
          <div class="phrase-english">${p.english}</div>
          <div class="phrase-tamil">${p.tamil}</div>
        </div>
        <div class="phrase-card-footer">
          <span class="phrase-tag">${p.tag}</span>
          <div class="footer-left">
            <button class="action-btn play-phrase-btn" title="Listen"><i class="fa-solid fa-volume-high"></i></button>
            <button class="action-btn send-phrase-btn" title="Send to Translator"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    grid.querySelectorAll('.phrase-card').forEach(card => {
      const playBtn = card.querySelector('.play-phrase-btn');
      const sendBtn = card.querySelector('.send-phrase-btn');
      const tanglish = card.dataset.tanglish;
      const english = card.dataset.english;

      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speechEngine.speakText(tanglish, 'en');
      });

      sendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sourceText.value = tanglish;
        sourceLangSelect.value = 'tanglish';
        targetLangSelect.value = 'en';
        document.querySelector('.nav-tab[data-tab="translator"]').click();
        performTranslation();
      });
    });
  }

  document.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPhrases(btn.dataset.cat);
    });
  });

  // -------------------------------------------------------------
  // DICTIONARY RENDERER & LIVE SEARCH
  // -------------------------------------------------------------
  function renderDictionary(filter = '') {
    const list = document.getElementById('dictionary-list');
    if (!list) return;

    const lowerFilter = filter.toLowerCase();
    const filtered = dictionaryData.filter(d => 
      d.word.toLowerCase().includes(lowerFilter) ||
      d.meaning.toLowerCase().includes(lowerFilter) ||
      d.tamil.includes(filter)
    );

    list.innerHTML = filtered.map(d => `
      <div class="dict-item">
        <div class="dict-word-row">
          <span class="dict-word">${d.word}</span>
          <span class="dict-type">${d.type}</span>
        </div>
        <div class="dict-meaning">${d.meaning}</div>
        <div class="dict-example">Tamil: ${d.tamil} | Ex: "${d.example}"</div>
      </div>
    `).join('');
  }

  const dictSearchInput = document.getElementById('dict-search-input');
  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', (e) => {
      renderDictionary(e.target.value.trim());
    });
  }

  // -------------------------------------------------------------
  // HISTORY & FAVORITES LOGIC
  // -------------------------------------------------------------
  function saveHistoryItem(src, tgt, srcLang, tgtLang) {
    if (!src || !tgt) return;
    
    // Avoid duplicate top item
    if (currentHistory.length > 0 && currentHistory[0].src === src) return;

    const newItem = {
      id: Date.now(),
      src,
      tgt,
      srcLang,
      tgtLang,
      fav: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    currentHistory.unshift(newItem);
    if (currentHistory.length > 50) currentHistory.pop(); // Keep last 50

    localStorage.setItem('lingua_history', JSON.stringify(currentHistory));
    renderHistory();
    updateHistoryBadge();
  }

  function renderHistory(favOnly = false) {
    const list = document.getElementById('history-list');
    if (!list) return;

    const items = favOnly ? currentHistory.filter(h => h.fav) : currentHistory;

    if (items.length === 0) {
      list.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No translation history yet.</p>`;
      return;
    }

    list.innerHTML = items.map(h => `
      <div class="history-card" data-id="${h.id}">
        <div class="history-details">
          <span class="history-langs">${h.srcLang} &rarr; ${h.tgtLang} &bull; ${h.timestamp}</span>
          <div class="history-src"><strong>Source:</strong> "${h.src}"</div>
          <div class="history-tgt"><strong>Translation:</strong> "${h.tgt}"</div>
        </div>
        <div class="footer-left">
          <button class="action-btn load-hist-btn" title="Load into translator"><i class="fa-solid fa-rotate-left"></i></button>
          <button class="action-btn del-hist-btn danger" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.history-card').forEach(card => {
      const id = parseInt(card.dataset.id);
      card.querySelector('.load-hist-btn').addEventListener('click', () => {
        const item = currentHistory.find(h => h.id === id);
        if (item) {
          sourceText.value = item.src;
          sourceLangSelect.value = item.srcLang;
          targetLangSelect.value = item.tgtLang;
          document.querySelector('.nav-tab[data-tab="translator"]').click();
          performTranslation();
        }
      });

      card.querySelector('.del-hist-btn').addEventListener('click', () => {
        currentHistory = currentHistory.filter(h => h.id !== id);
        localStorage.setItem('lingua_history', JSON.stringify(currentHistory));
        renderHistory(favOnly);
        updateHistoryBadge();
      });
    });
  }

  function updateHistoryBadge() {
    const badge = document.getElementById('history-badge');
    if (badge) badge.textContent = currentHistory.length;
  }

  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      currentHistory = [];
      localStorage.removeItem('lingua_history');
      renderHistory();
      updateHistoryBadge();
      showToast("History cleared!");
    });
  }

  const filterFavsBtn = document.getElementById('filter-favs-btn');
  if (filterFavsBtn) {
    let favFilterActive = false;
    filterFavsBtn.addEventListener('click', () => {
      favFilterActive = !favFilterActive;
      filterFavsBtn.classList.toggle('active', favFilterActive);
      renderHistory(favFilterActive);
    });
  }

  // -------------------------------------------------------------
  // SETTINGS MODAL & VOICE CONTROLS
  // -------------------------------------------------------------
  function initVoiceSettings() {
    const modal = document.getElementById('voice-settings-modal');
    const openBtn = document.getElementById('voice-settings-btn');
    const closeBtn = modal ? modal.querySelector('.modal-close-btn') : null;
    const voiceSelect = document.getElementById('voice-select');
    const voiceRate = document.getElementById('voice-rate');
    const voicePitch = document.getElementById('voice-pitch');
    const rateVal = document.getElementById('rate-val');
    const pitchVal = document.getElementById('pitch-val');
    const testBtn = document.getElementById('test-voice-btn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        populateVoiceSelect(voiceSelect);
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (voiceRate) {
      voiceRate.addEventListener('input', (e) => {
        speechEngine.rate = parseFloat(e.target.value);
        if (rateVal) rateVal.textContent = e.target.value;
      });
    }

    if (voicePitch) {
      voicePitch.addEventListener('input', (e) => {
        speechEngine.pitch = parseFloat(e.target.value);
        if (pitchVal) pitchVal.textContent = e.target.value;
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        speechEngine.speakText("Vanakkam! Testing LinguaVoice speech engine.", 'en');
      });
    }
  }

  function populateVoiceSelect(selectEl) {
    if (!selectEl) return;
    const voices = speechEngine.voices;
    selectEl.innerHTML = voices.map((v, i) => `
      <option value="${i}">${v.name} (${v.lang})</option>
    `).join('');
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary-cyan)"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
});
