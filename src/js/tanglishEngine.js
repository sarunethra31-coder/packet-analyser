// Tanglish NLP, Transliteration, and Translation Engine

// Comprehensive Tanglish -> English Word & Phrase Dictionary
const tanglishDict = {
  // Greetings & Courtesies
  "vanakkam": "hello",
  "vanakam": "hello",
  "nandri": "thank you",
  "romba nandri": "thank you very much",
  "poitu varren": "goodbye",
  "poitu varen": "goodbye",
  "seri": "okay",
  "sari": "okay",
  "kandipa": "definitely",
  "kandippa": "definitely",
  "aama": "yes",
  "aamaa": "yes",
  "illa": "no",
  "illai": "no",
  "theriyadhu": "don't know",
  "theriyum": "know",
  "puriyala": "don't understand",
  "purinjidhu": "understood",

  // Pronouns & Titles
  "naan": "I",
  "en": "my",
  "enaku": "I",
  "enakku": "I",
  "unaku": "you",
  "unakku": "you",
  "ennudaiya": "my",
  "ennoda": "my",
  "unnoda": "your",
  "avanoda": "his",
  "avaloda": "her",
  "neenga": "you",
  "nee": "you",
  "unga": "your",
  "ungal": "your",
  "un": "your",
  "avan": "he",
  "aval": "she",
  "idhu": "this",
  "adhu": "that",
  "edhu": "which",
  "namma": "our",
  "machi": "bro / buddy",
  "mache": "buddy",
  "bro": "brother",
  "dude": "friend",

  // Emotional Feelings & States
  "bore adikuthu": "feel bored",
  "bore adikkudhu": "feel bored",
  "romba bore": "very bored",
  "pasi edukuthu": "feel hungry",
  "pasi edukkudhu": "feel hungry",
  "thookam varuthu": "feel sleepy",
  "thookam varudhu": "feel sleepy",
  "thalai valikuthu": "have a headache",
  "bayama irukku": "feel scared",
  "santhosama irukku": "feel happy",
  "kastama irukku": "feel difficult",

  // Common Verbs & States
  "irukken": "am fine",
  "irukkenaa": "am fine",
  "irukkinam": "are present",
  "irukkinga": "are you",
  "irukinga": "are you",
  "irukku": "is there / is fine",
  "irukkanga": "they are fine",
  "varren": "am coming",
  "varveendga": "will come",
  "varviya": "will you come",
  "poreen": "am going",
  "porean": "am going",
  "poreenga": "are going",
  "panren": "am doing",
  "panreenga": "are doing",
  "panraan": "is doing",
  "panraanga": "they are doing",
  "saptingala": "did you eat",
  "sapda": "to eat",
  "sapadu": "food / meal",
  "sapadu aachaa": "have you eaten",
  "aachaa": "is it completed / done",
  "aachu": "completed / happened",
  "pessalaam": "let's talk",
  "pessu": "talk",
  "pesren": "will talk",
  "kaatnaan": "showing",
  "kattraan": "showing off",
  "mudiyum": "can do",
  "mudiyadhu": "cannot do",
  "kelamburen": "am leaving",
  "sollunga": "please tell",
  "solli": "tell",
  "sollu": "tell",

  // Question Words & Time
  "epdi": "how",
  "eppadi": "how",
  "enna": "what",
  "enga": "where",
  "engae": "where",
  "eppo": "when",
  "eppodhu": "when",
  "yaaru": "who",
  "yen": "why",
  "edhukku": "why",
  "ethukku": "why",
  "evlo": "how much",
  "evvalavu": "how much",
  "ethanai": "how many",
  "inniku": "today",
  "nalaki": "tomorrow",
  "naalaikku": "tomorrow",
  "ippo": "now",
  "nethu": "yesterday",
  "mani": "time",
  "neram": "time",

  // Adjectives, Slang & Modifiers
  "nalla": "good / well",
  "nallaa": "good / well",
  "sema": "awesome",
  "semmaya": "awesome",
  "mass": "superb / awesome",
  "gethu": "swag / attitude",
  "vera level": "next level",
  "romba": "very / a lot",
  "konjam": "a little",
  "periya": "big",
  "chinna": "small",
  "dhaan": "only",
  "than": "only",
  "veedu": "home / house",
  "idham": "place",
  "idathukku": "place",
  "kavalai padadhinga": "don't worry",
  "kavalai": "worry"
};

// Common Full Phrase Direct Translations
const exactPhrasesMap = {
  "enaku romba bore adikuthu": "I feel very bored",
  "enakku romba bore adikuthu": "I feel very bored",
  "enaku bore adikuthu": "I feel bored",
  "enakku bore adikuthu": "I feel bored",
  "enaku pasi edukuthu": "I feel hungry",
  "enakku pasi edukuthu": "I feel hungry",
  "enaku thookam varuthu": "I feel sleepy",
  "enakku thookam varuthu": "I feel sleepy",
  "enaku thalai valikuthu": "I have a headache",
  "enaku puriyala": "I don't understand",
  "unaku purinjidha": "Did you understand?",
  "unaku purinjidha?": "Did you understand?",
  "vanakkam bro, epdi irukinga?": "Hello bro, how are you?",
  "vanakkam, epdi irukinga?": "Hello, how are you?",
  "naan nalla irukken, romba nandri": "I am fine, thank you very much",
  "naan nalla irukken": "I am fine",
  "sapadu aachaa? enna panreenga?": "Have you eaten? What are you doing?",
  "sapadu aachaa?": "Have you eaten?",
  "enna panreenga ippo?": "What are you doing now?",
  "enna panreenga?": "What are you doing?",
  "nalaki office varviya machi?": "Will you come to office tomorrow buddy?",
  "idhu vera level, sema gethu!": "This is next level, awesome swag!",
  "idhu evlo aagum?": "How much will this cost?",
  "ungal per enna?": "What is your name?",
  "un per enna?": "What is your name?",
  "intha idham enga irukku?": "Where is this place located?",
  "mani enna aachu?": "What time is it?",
  "poitu varren!": "Goodbye! See you again.",
  "kavalai padadhinga, ellam seri aagum.": "Don't worry, everything will be fine.",
  "naan aprom pesren": "I will talk later",
  "seri naan kelamburen": "Okay, I am leaving",
  "konjam chek panni sollunga": "Please check and tell me",
  "ennala mudiyadhu": "I cannot do it",
  "ennala mudiyum": "I can do it"
};

// English -> Tanglish mapping for reverse translation
const englishToTanglishMap = {
  "hello": "Vanakkam",
  "how are you": "Epdi irukinga",
  "how are you?": "Epdi irukinga?",
  "i am fine": "Naan nalla irukken",
  "i feel bored": "Enaku bore adikuthu",
  "i feel very bored": "Enaku romba bore adikuthu",
  "i am bored": "Enaku bore adikuthu",
  "thank you": "Romba nandri",
  "thank you very much": "Romba nandri",
  "what are you doing": "Enna panreenga",
  "have you eaten": "Sapadu aachaa",
  "what is your name": "Ungal per enna",
  "where are you": "Enga irukinga",
  "goodbye": "Poitu varren",
  "brother": "Bro / Machi",
  "friend": "Machi",
  "good": "Nalla",
  "awesome": "Sema",
  "very good": "Romba nalla",
  "don't worry": "Kavalai padadhinga",
  "tomorrow": "Nalaki",
  "today": "Inniku",
  "now": "Ippo",
  "yes": "Aama",
  "no": "Illa"
};

// Phonetic Tanglish to Tamil Script Map
const tanglishToTamilPhonetic = [
  { p: "vanakkam", t: "வணக்கம்" },
  { p: "vanakam", t: "வணக்கம்" },
  { p: "enaku", t: "எனக்கு" },
  { p: "enakku", t: "எனக்கு" },
  { p: "romba", t: "ரொம்ப" },
  { p: "bore", t: "போர்" },
  { p: "adikuthu", t: "அடிக்குது" },
  { p: "adikkudhu", t: "அடிக்குது" },
  { p: "nandri", t: "நன்றி" },
  { p: "epdi", t: "எப்படி" },
  { p: "eppadi", t: "எப்படி" },
  { p: "irukinga", t: "இருக்கீங்க" },
  { p: "irukken", t: "இருக்கேன்" },
  { p: "naan", t: "நான்" },
  { p: "nalla", t: "நல்லா" },
  { p: "sapadu", t: "சாப்பாடு" },
  { p: "aachaa", t: "ஆச்சா" },
  { p: "enna", t: "என்ன" },
  { p: "panreenga", t: "பண்றீங்க" },
  { p: "machi", t: "மச்சி" },
  { p: "nalaki", t: "நாளைக்கு" },
  { p: "inniku", t: "இன்னைக்கு" },
  { p: "ippo", t: "இப்போ" },
  { p: "enga", t: "எங்க" },
  { p: "per", t: "பெயர்" },
  { p: "evlo", t: "எவ்ளோ" },
  { p: "mani", t: "மணி" },
  { p: "gethu", t: "கெத்து" },
  { p: "sema", t: "செம்ம" },
  { p: "vera", t: "வேற" },
  { p: "level", t: "லெவல்" },
  { p: "kandipa", t: "கண்டிப்பா" },
  { p: "aama", t: "ஆமா" },
  { p: "illa", t: "இல்ல" }
];

/**
 * Check if the given string resembles Tanglish text
 */
export function isTanglish(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  
  // Tanglish keyword signatures
  const tanglishKeywords = [
    "vanakkam", "epdi", "eppadi", "irukinga", "irukken", "nalla", "romba", "nandri",
    "sapadu", "aachaa", "panreenga", "machi", "nalaki", "inniku", "ippo", "enga",
    "enna", "evlo", "gethu", "sema", "kandipa", "poitu", "varren", "varveendga",
    "theriyum", "puriyala", "kavalai", "aama", "illa", "enaku", "enakku", "adikuthu", "bore"
  ];

  let matches = 0;
  for (const kw of tanglishKeywords) {
    if (lower.includes(kw)) matches++;
  }

  return matches >= 1 || (lower.includes("bro") && lower.includes("pan"));
}

/**
 * Translate Tanglish text into English
 */
export function translateTanglishToEnglish(input) {
  if (!input || !input.trim()) return "";
  
  const cleanInput = input.trim();
  const lowerInput = cleanInput.toLowerCase().replace(/[.,!?]/g, "");

  // 1. Check exact phrase match first
  if (exactPhrasesMap[lowerInput]) {
    return exactPhrasesMap[lowerInput];
  }

  // Check case-insensitive exact phrase match with punctuation preserved
  for (const [key, val] of Object.entries(exactPhrasesMap)) {
    if (key === lowerInput || key === lowerInput.trim()) {
      return val;
    }
  }

  // 2. Tokenize and map n-grams (4-gram -> 3-gram -> 2-gram -> 1-gram)
  const words = cleanInput.split(/\s+/);
  const translatedWords = [];

  let i = 0;
  while (i < words.length) {
    const rawWord = words[i];
    const cleanWord = rawWord.toLowerCase().replace(/[.,!?]/g, "");
    
    // Check 4-gram
    if (i < words.length - 3) {
      const w2 = words[i + 1].toLowerCase().replace(/[.,!?]/g, "");
      const w3 = words[i + 2].toLowerCase().replace(/[.,!?]/g, "");
      const w4 = words[i + 3].toLowerCase().replace(/[.,!?]/g, "");
      const quad = `${cleanWord} ${w2} ${w3} ${w4}`;
      if (tanglishDict[quad]) {
        translatedWords.push(tanglishDict[quad]);
        i += 4;
        continue;
      }
    }

    // Check 3-gram (trigram)
    if (i < words.length - 2) {
      const w2 = words[i + 1].toLowerCase().replace(/[.,!?]/g, "");
      const w3 = words[i + 2].toLowerCase().replace(/[.,!?]/g, "");
      const tri = `${cleanWord} ${w2} ${w3}`;
      if (tanglishDict[tri]) {
        translatedWords.push(tanglishDict[tri]);
        i += 3;
        continue;
      }
    }

    // Check 2-gram (bigram)
    if (i < words.length - 1) {
      const w2 = words[i + 1].toLowerCase().replace(/[.,!?]/g, "");
      const bi = `${cleanWord} ${w2}`;
      if (tanglishDict[bi]) {
        translatedWords.push(tanglishDict[bi]);
        i += 2;
        continue;
      }
    }

    // Check single word
    if (tanglishDict[cleanWord]) {
      translatedWords.push(tanglishDict[cleanWord]);
    } else {
      // Keep word as is (names, English words mixed in Tanglish)
      translatedWords.push(rawWord);
    }
    i++;
  }

  // Reconstruct English sentence
  let result = translatedWords.join(" ");

  // Post-processing grammar fixes for Tanglish sentence order
  result = postProcessTanglishEnglish(result);

  return result;
}

/**
 * Perform grammar smoothing for raw translated Tanglish words
 */
function postProcessTanglishEnglish(str) {
  let s = str;
  s = s.replace(/\bI very feel bored\b/gi, "I feel very bored");
  s = s.replace(/\bI feel bored\b/gi, "I feel bored");
  s = s.replace(/\bhello bro how are present\b/gi, "Hello bro, how are you?");
  s = s.replace(/\bI good am fine\b/gi, "I am fine");
  s = s.replace(/\bhow are present\b/gi, "how are you");
  s = s.replace(/\bwhat are doing now\b/gi, "what are you doing right now");
  s = s.replace(/\bfood completed\b/gi, "Have you eaten your meal?");
  s = s.replace(/\bwhere is present\b/gi, "where is it");

  // Capitalize first letter
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

/**
 * Transliterate Tanglish text into Tamil script (Unicode)
 */
export function transliterateTanglishToTamil(input) {
  if (!input || !input.trim()) return "";
  
  let result = input;
  tanglishToTamilPhonetic.forEach(({ p, t }) => {
    const regex = new RegExp(`\\b${p}\\b`, 'gi');
    result = result.replace(regex, t);
  });

  return result;
}

/**
 * Translate English text into natural Tanglish
 */
export function translateEnglishToTanglish(input) {
  if (!input || !input.trim()) return "";

  const clean = input.trim().toLowerCase().replace(/[.,!?]/g, "");

  // Direct lookup
  if (englishToTanglishMap[clean]) {
    return englishToTanglishMap[clean];
  }

  // Word-by-word fallback
  const words = input.split(/\s+/);
  const result = words.map(w => {
    const cleanW = w.toLowerCase().replace(/[.,!?]/g, "");
    return englishToTanglishMap[cleanW] || w;
  });

  return result.join(" ");
}
