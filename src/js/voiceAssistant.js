// Lingua Voice Assistant Overlay & Conversational Logic

import { speechEngine } from './speechEngine.js';
import { translateText } from './translationService.js';
import { dictionaryData } from './dictionaryData.js';

class VoiceAssistant {
  constructor() {
    this.chatContainer = null;
    this.isListening = false;
  }

  init() {
    this.chatContainer = document.getElementById('assistant-chat-container');
    this.setupEvents();
  }

  setupEvents() {
    const heroBtn = document.getElementById('hero-assistant-btn');
    const assistantMicBtn = document.getElementById('assistant-mic-btn');
    const assistantSendBtn = document.getElementById('assistant-send-btn');
    const assistantInput = document.getElementById('assistant-text-input');

    // Hero launcher button -> switches tab to Assistant & triggers mic
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        const assistantTab = document.querySelector('.nav-tab[data-tab="assistant"]');
        if (assistantTab) assistantTab.click();
        this.triggerVoiceInput();
      });
    }

    // Push to Speak button inside Assistant tab
    if (assistantMicBtn) {
      assistantMicBtn.addEventListener('click', () => {
        this.toggleVoiceInput();
      });
    }

    // Send text input
    if (assistantSendBtn && assistantInput) {
      const handleSend = () => {
        const query = assistantInput.value.trim();
        if (query) {
          this.processQuery(query);
          assistantInput.value = '';
        }
      };

      assistantSendBtn.addEventListener('click', handleSend);
      assistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Suggested prompt buttons delegation
    document.addEventListener('click', (e) => {
      const promptBtn = e.target.closest('.prompt-btn');
      if (promptBtn && promptBtn.dataset.ask) {
        this.processQuery(promptBtn.dataset.ask);
      }
    });
  }

  toggleVoiceInput() {
    if (this.isListening) {
      this.stopVoiceInput();
    } else {
      this.triggerVoiceInput();
    }
  }

  triggerVoiceInput() {
    const micBtn = document.getElementById('assistant-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = `<i class="fa-solid fa-microphone-lines fa-beat"></i> <span>Listening...</span>`;
      micBtn.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
    }
    this.isListening = true;

    speechEngine.startListening('tanglish', 
      (transcript, isFinal) => {
        if (isFinal && transcript) {
          this.stopVoiceInput();
          this.processQuery(transcript);
        }
      },
      (err) => {
        this.stopVoiceInput();
        this.addMessage("bot", `Sorry, I couldn't hear that. Please try again or type your question.`);
      },
      () => {
        this.stopVoiceInput();
      }
    );
  }

  stopVoiceInput() {
    this.isListening = false;
    speechEngine.stopListening();
    const micBtn = document.getElementById('assistant-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>Push to Speak</span>`;
      micBtn.style.background = '';
    }
  }

  async processQuery(query) {
    this.addMessage("user", query);

    // Show bot typing indicator
    const typingId = this.addTypingIndicator();

    const lower = query.toLowerCase();
    let reply = "";

    // 1. Check if user asks for word definition / meaning
    if (lower.includes("what does") || lower.includes("meaning of") || lower.includes("mean")) {
      const matchedDict = dictionaryData.find(d => lower.includes(d.word.toLowerCase()));
      if (matchedDict) {
        reply = `**${matchedDict.word}** (${matchedDict.tamil}) means: *"${matchedDict.meaning}"*. Example usage: "${matchedDict.example}"`;
      }
    }

    // 2. Default AI Assistant translation router
    if (!reply) {
      // Clean query text for translation extraction
      let textToTranslate = query;
      textToTranslate = textToTranslate.replace(/translate/gi, '')
                                       .replace(/to english/gi, '')
                                       .replace(/to tanglish/gi, '')
                                       .replace(/how do you say/gi, '')
                                       .replace(/in tanglish/gi, '')
                                       .replace(/what does/gi, '')
                                       .replace(/mean/gi, '')
                                       .replace(/['"]/g, '')
                                       .trim();

      if (!textToTranslate) textToTranslate = query;

      let targetLang = 'en';
      if (lower.includes("tanglish")) targetLang = 'tanglish';
      if (lower.includes("tamil")) targetLang = 'ta';

      const result = await translateText(textToTranslate, 'auto', targetLang);
      
      if (result.translatedText) {
        reply = `Here is your translation:\n\n**"${result.translatedText}"**`;
        if (result.secondaryScript) {
          reply += `\n*(Tamil Script: ${result.secondaryScript})*`;
        }
      } else {
        reply = `I can translate any Tanglish or English text for you. Try asking me "Translate 'Vanakkam bro' to English".`;
      }
    }

    this.removeTypingIndicator(typingId);
    this.addMessage("bot", reply);

    // Speak assistant response out loud
    const speakableText = reply.replace(/[*#]/g, '');
    speechEngine.speakText(speakableText, 'en');
  }

  addMessage(sender, text) {
    if (!this.chatContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}-bubble`;

    const avatarIcon = sender === 'bot' ? 'fa-robot' : 'fa-user';
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\n/g, '<br>');

    bubble.innerHTML = `
      <div class="bubble-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
      <div class="bubble-content">
        <p>${formattedText}</p>
      </div>
    `;

    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot-bubble';
    bubble.id = id;
    bubble.innerHTML = `
      <div class="bubble-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="bubble-content">
        <p><i class="fa-solid fa-ellipsis fa-beat"></i> Thinking...</p>
      </div>
    `;
    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

export const voiceAssistant = new VoiceAssistant();
