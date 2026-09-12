// Translation Router and Multi-Language API Service

import {
  isTanglish,
  translateTanglishToEnglish,
  transliterateTanglishToTamil,
  translateEnglishToTanglish
} from './tanglishEngine.js';

// Cache for API responses to ensure fast offline / repeat queries
const translationCache = new Map();

/**
 * Main Translate Router Function
 * @param {string} text - Source text
 * @param {string} sourceLang - Source language code ('auto', 'tanglish', 'en', 'ta', 'hi', etc.)
 * @param {string} targetLang - Target language code ('en', 'tanglish', 'ta', 'hi', 'es', etc.)
 * @returns {Promise<{ translatedText: string, detectedLang?: string, secondaryScript?: string }>}
 */
export async function translateText(text, sourceLang = 'auto', targetLang = 'en') {
  if (!text || !text.trim()) {
    return { translatedText: '', secondaryScript: '' };
  }

  const cleanText = text.trim();

  // 1. Auto-Detect Tanglish if source is auto
  let actualSource = sourceLang;
  if (sourceLang === 'auto') {
    if (isTanglish(cleanText)) {
      actualSource = 'tanglish';
    } else {
      actualSource = 'en'; // default auto fallback
    }
  }

  // 2. CASE A: Translating FROM Tanglish
  if (actualSource === 'tanglish') {
    const englishTranslation = translateTanglishToEnglish(cleanText);
    const tamilScript = transliterateTanglishToTamil(cleanText);

    if (targetLang === 'en') {
      return {
        translatedText: englishTranslation,
        detectedLang: 'Tanglish',
        secondaryScript: tamilScript !== cleanText ? tamilScript : ''
      };
    }

    if (targetLang === 'ta') {
      return {
        translatedText: tamilScript,
        detectedLang: 'Tanglish',
        secondaryScript: englishTranslation
      };
    }

    // Translating Tanglish to another language (e.g. Hindi, Spanish, French, German, Telugu)
    // First convert Tanglish to English, then translate English to target lang via API
    try {
      const apiResult = await fetchExternalTranslation(englishTranslation, 'en', targetLang);
      return {
        translatedText: apiResult,
        detectedLang: 'Tanglish',
        secondaryScript: `English: ${englishTranslation}`
      };
    } catch (err) {
      console.warn("External translation failed, returning English:", err);
      return {
        translatedText: englishTranslation,
        detectedLang: 'Tanglish',
        secondaryScript: tamilScript
      };
    }
  }

  // 3. CASE B: Translating TO Tanglish
  if (targetLang === 'tanglish') {
    let englishText = cleanText;

    // If source is not English, first translate to English
    if (actualSource !== 'en') {
      try {
        englishText = await fetchExternalTranslation(cleanText, actualSource, 'en');
      } catch (e) {
        console.warn("Source to EN translation failed:", e);
      }
    }

    const tanglishResult = translateEnglishToTanglish(englishText);
    const tamilScript = transliterateTanglishToTamil(tanglishResult);

    return {
      translatedText: tanglishResult,
      detectedLang: actualSource.toUpperCase(),
      secondaryScript: tamilScript !== tanglishResult ? tamilScript : ''
    };
  }

  // 4. CASE C: Standard Language to Language Translation (e.g. English -> Hindi, French -> Tamil)
  if (actualSource === targetLang) {
    return { translatedText: cleanText, secondaryScript: '' };
  }

  try {
    const translated = await fetchExternalTranslation(cleanText, actualSource, targetLang);
    return {
      translatedText: translated,
      detectedLang: actualSource.toUpperCase(),
      secondaryScript: ''
    };
  } catch (err) {
    console.error("Translation API Error:", err);
    return {
      translatedText: cleanText,
      detectedLang: actualSource.toUpperCase(),
      secondaryScript: 'Offline fallback (Translation server busy)'
    };
  }
}

/**
 * Fetch translation from MyMemory API with local cache
 */
async function fetchExternalTranslation(text, fromLang, toLang) {
  const cacheKey = `${fromLang}_${toLang}_${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  if (data && data.responseData && data.responseData.translatedText) {
    const result = data.responseData.translatedText;
    translationCache.set(cacheKey, result);
    return result;
  }

  throw new Error("Invalid response format from API");
}
