// Web Speech API - Speech Recognition (STT) & Speech Synthesis (TTS) Engine

class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.animationId = null;
    this.voices = [];
    
    // Voice settings defaults
    this.rate = 1.0;
    this.pitch = 1.0;
    this.selectedVoice = null;

    this.initRecognition();
    this.loadVoices();
  }

  /**
   * Initialize Web Speech Recognition
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    } else {
      console.warn("Web SpeechRecognition API is not supported in this browser.");
    }
  }

  /**
   * Load available browser voices for Text-To-Speech
   */
  loadVoices() {
    if (!this.synthesis) return;
    
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices() || [];
    };

    updateVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }
  }

  /**
   * Get Web Speech BCP-47 language tag
   */
  getLangCode(lang) {
    const langMap = {
      'tanglish': 'ta-IN',
      'ta': 'ta-IN',
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ml': 'ml-IN',
      'kn': 'kn-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'ru': 'ru-RU',
      'ko': 'ko-KR',
      'it': 'it-IT'
    };

    return langMap[lang] || (lang && lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`);
  }

  /**
   * Start Microphone Recording
   */
  startListening(lang = 'en-US', onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = this.getLangCode(lang);

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript, event.results[0].isFinal);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error("Error starting recognition:", e);
      if (onError) onError(e.message);
    }
  }

  /**
   * Stop Microphone Recording
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speak Text via Text-To-Speech (TTS) with Multi-Language Support & Audio Fallback
   */
  speakText(text, lang = 'en', onStart, onEnd) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const langCode = this.getLangCode(lang);
    const shortLang = langCode.split('-')[0].toLowerCase();

    // Ensure voices are updated
    if (this.synthesis && this.voices.length === 0) {
      this.voices = this.synthesis.getVoices() || [];
    }

    // Check if browser has a matching voice for target language
    const targetVoice = this.voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(shortLang) || vLang.includes(langCode.toLowerCase());
    });

    // 1. If Web Speech Synthesis supports target language with native voice
    if (this.synthesis && targetVoice) {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode;
      utterance.voice = targetVoice;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis error, playing fallback audio stream:", e);
          this.playAudioStreamFallback(cleanText, shortLang, onStart, onEnd);
        };
      }

      this.synthesis.speak(utterance);
      return;
    }

    // 2. If Web Speech Synthesis is available without a specific voice, try setting utterance.lang directly
    if (this.synthesis && 'SpeechSynthesisUtterance' in window) {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      let started = false;
      if (onStart) {
        utterance.onstart = () => {
          started = true;
          onStart();
        };
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis utterance error, falling back to audio stream:", e);
          this.playAudioStreamFallback(cleanText, shortLang, onStart, onEnd);
        };
      }

      // Safeguard: if utterance doesn't start in 1 second, use audio stream fallback
      setTimeout(() => {
        if (!started && this.synthesis.speaking === false) {
          this.playAudioStreamFallback(cleanText, shortLang, onStart, onEnd);
        }
      }, 800);

      this.synthesis.speak(utterance);
      return;
    }

    // 3. Fallback: High Quality Online Audio TTS Stream
    this.playAudioStreamFallback(cleanText, shortLang, onStart, onEnd);
  }

  /**
   * Audio Stream Fallback for browsers lacking TTS voices
   */
  playAudioStreamFallback(text, lang, onStart, onEnd) {
    if (this.synthesis) this.synthesis.cancel();

    // Use Google Translate audio endpoint
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const audio = new Audio(ttsUrl);

    if (onStart) audio.onplay = onStart;
    if (onEnd) {
      audio.onended = onEnd;
      audio.onerror = onEnd;
    }

    audio.play().then(() => {
      if (onStart) onStart();
    }).catch(err => {
      console.warn("Audio stream playback failed:", err);
      if (onEnd) onEnd();
    });
  }

  /**
   * Render Canvas Animated Waveform for Voice Input
   */
  startWaveformAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let step = 0;

    const draw = () => {
      if (!this.isListening) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 30;
      const barWidth = 6;
      const gap = 4;
      const startX = (canvas.width - (numBars * (barWidth + gap))) / 2;

      for (let i = 0; i < numBars; i++) {
        const height = Math.sin(step + i * 0.3) * 20 + Math.random() * 25 + 5;
        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(1, '#8a2be2');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 3);
        ctx.fill();
      }

      step += 0.15;
      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }

  stopWaveformAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

export const speechEngine = new SpeechEngine();
