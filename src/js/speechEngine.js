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
   * Speak Text via Text-To-Speech (TTS)
   */
  speakText(text, lang = 'en', onStart, onEnd) {
    if (!this.synthesis || !text) return;

    // Cancel active speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Select suitable voice for language
    if (this.voices.length > 0) {
      let voiceMatch = null;
      if (lang === 'ta') voiceMatch = this.voices.find(v => v.lang.includes('ta'));
      else if (lang === 'hi') voiceMatch = this.voices.find(v => v.lang.includes('hi'));
      else if (lang === 'es') voiceMatch = this.voices.find(v => v.lang.includes('es'));
      else if (lang === 'fr') voiceMatch = this.voices.find(v => v.lang.includes('fr'));
      else if (lang === 'de') voiceMatch = this.voices.find(v => v.lang.includes('de'));
      else if (lang === 'ja') voiceMatch = this.voices.find(v => v.lang.includes('ja'));

      if (!voiceMatch) {
        voiceMatch = this.voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US')) || this.voices[0];
      }

      if (voiceMatch) utterance.voice = voiceMatch;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

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
