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
      this.voices = this.synthesis.getVoices();
      // Prefer Tamil, English, or Hindi voices if available
      this.selectedVoice = this.voices.find(v => v.lang.includes('ta') || v.lang.includes('en-IN') || v.lang.includes('en-US')) || this.voices[0];
    };

    updateVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }
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

    // Map language selection to Web Speech API lang code
    let speechLang = 'en-US';
    if (lang === 'tanglish' || lang === 'en') speechLang = 'en-IN'; // English (India) works great for Tanglish accent
    else if (lang === 'ta') speechLang = 'ta-IN';
    else if (lang === 'hi') speechLang = 'hi-IN';
    else if (lang === 'te') speechLang = 'te-IN';
    else if (lang === 'ml') speechLang = 'ml-IN';
    else if (lang === 'kn') speechLang = 'kn-IN';
    else if (lang === 'es') speechLang = 'es-ES';
    else if (lang === 'fr') speechLang = 'fr-FR';
    else if (lang === 'de') speechLang = 'de-DE';
    else if (lang === 'ja') speechLang = 'ja-JP';

    this.recognition.lang = speechLang;

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
   * Speak Text via Text-To-Speech (TTS) with Tamil Audio Stream Fallback
   */
  speakText(text, lang = 'en', onStart, onEnd) {
    if (!text || !text.trim()) return;

    const cleanText = text.trim();

    // Map language selection code
    let langCode = 'en-US';
    let ttsLang = lang;
    if (lang === 'ta' || lang === 'tanglish') {
      langCode = 'ta-IN';
      ttsLang = 'ta';
    } else if (lang === 'hi') langCode = 'hi-IN';
    else if (lang === 'te') langCode = 'te-IN';
    else if (lang === 'ml') langCode = 'ml-IN';
    else if (lang === 'kn') langCode = 'kn-IN';
    else if (lang === 'es') langCode = 'es-ES';
    else if (lang === 'fr') langCode = 'fr-FR';
    else if (lang === 'de') langCode = 'de-DE';
    else if (lang === 'ja') langCode = 'ja-JP';

    // 1. Check if browser has native Web Speech API voice for Tamil / target lang
    const nativeVoice = this.voices.find(v => 
      v.lang.toLowerCase().includes(lang.toLowerCase()) || 
      v.lang.toLowerCase().includes(langCode.toLowerCase())
    );

    // 2. For Tamil (ta) OR if browser lacks native voice: Use reliable high-quality TTS Audio Stream
    if (ttsLang === 'ta' || !nativeVoice) {
      if (this.synthesis) this.synthesis.cancel();

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${ttsLang}&client=tw-ob`;
      const audio = new Audio(ttsUrl);

      if (onStart) audio.onplay = onStart;
      if (onEnd) {
        audio.onended = onEnd;
        audio.onerror = onEnd;
      }

      audio.play().then(() => {
        if (onStart) onStart();
      }).catch(err => {
        console.warn("Audio element fallback failed, attempting Web Speech Synthesis:", err);
        this.fallbackSynthesisSpeak(cleanText, langCode, nativeVoice, onStart, onEnd);
      });
      return;
    }

    this.fallbackSynthesisSpeak(cleanText, langCode, nativeVoice, onStart, onEnd);
  }

  /**
   * Browser SpeechSynthesis Fallback
   */
  fallbackSynthesisSpeak(text, langCode, nativeVoice, onStart, onEnd) {
    if (!this.synthesis) return;
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    if (nativeVoice) {
      utterance.voice = nativeVoice;
    } else if (this.voices.length > 0) {
      utterance.voice = this.voices[0];
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synthesis.speak(utterance);
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
