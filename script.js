// https://www.w3.org/TR/alreq/
// https://docs.microsoft.com/en-us/typography/script-development/arabic
// https://jrgraphix.net/r/Unicode/0600-06FF
// https://en.wikipedia.org/wiki/Arabic_alphabet#Ligatures

let currentWord = ''; // latin word in active typingb
let latinText = '';   // all latin words
let arabicText = '';  // all arabic words
let autoSukun = true; // automatically add sukun if applicable


// Settings

document.getElementById('autoSukunBtn').addEventListener('click', event => {
  autoSukun = !autoSukun;
  document.getElementById('autoSukun').checked = autoSukun;
  document.getElementById('editor').focus();
});

document.getElementById('autoSukun').addEventListener('change', event => {
  autoSukun = event.target.checked;
  document.getElementById('editor').focus();
});


// Main

document.getElementById('editor').addEventListener('keydown', event => {
  // Get pressed key
  // To do: fix "unidentified" key on mobile browsers
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  let letter = event.key || String.fromCharCode(event.which || event.code);

  switch (true) {
    case (letter === 'Enter'):
      [arabicText, currentWord, latinText] = handleEnter(arabicText, currentWord, latinText);
      updateDisplay(arabicText, currentWord);
      return event.preventDefault();

    case (letter === 'Backspace'):
      [arabicText, currentWord, latinText] = handleBackspace(arabicText, currentWord, latinText);
      updateDisplay(arabicText, currentWord);
      return event.preventDefault();
    
    case (letter === 'Shift'):
      return event.preventDefault();

    case (letter === ' '):
      [arabicText, currentWord, latinText] = handleWhitespace(arabicText, currentWord, latinText);
      updateDisplay(arabicText, currentWord);
      return event.preventDefault();

    case (letter in punctuation):
      [arabicText, currentWord, latinText] = handlePunctuation(arabicText, currentWord, latinText, letter);
      updateDisplay(arabicText, currentWord);
      return event.preventDefault();

    case (!isInputAllowed(currentWord, letter)):
      return event.preventDefault();

    case (letter === '-'):
      currentWord += letter;
      updateDisplay(arabicText, currentWord);
      return event.preventDefault();    
  }

  const lastLetter = getLastLetter(currentWord);
  const lastTwoLetter = getLastTwoLetter(currentWord);

  currentWord += letter;
  latinText += letter;

  // check compound except 'ain, ex: sy, sh, kh
  if (isCompound(letter, lastLetter)) {
    const compound = lastLetter + letter;
    const lastThreeLetter = currentWord.length > 2 ? currentWord.slice(-4, -3) : '';
    const lastFourLetter = currentWord.length > 3 ? currentWord.slice(-5, -4) : '';
    
    // remove last letter if already written (all except 'g'). ex: ash (remove 's' add 'sh')
    if (lastLetter in consonant) arabicText = arabicText.slice(0, -1);
    
    // compound tasydid, ex: ba(sysy)iriyna
    if (lastThreeLetter + lastTwoLetter === compound) {
      if (isSyamsiyah(lastFourLetter, compound)) {
        arabicText = arabicText.slice(0, -2) + arabicLetter('l') + arabicText.slice(-2, -1);
      }
      arabicText += arabicSymbol('tasydid');
    } else {
      arabicText += arabicLetter(compound);
    }
    
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  if (isSukun(currentWord, letter, lastLetter, lastTwoLetter)) {
    arabicText = addSukun(arabicText, letter)
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // Check tasydid (i.e. double letters). Example: minna, umma, jaddati
  if (isTasydid(letter, lastLetter, lastTwoLetter)) {
    arabicText = addTasydid(arabicText, lastLetter, lastTwoLetter)
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  if (isTanwin(letter, lastLetter, lastTwoLetter)) {
    arabicText = addTanwin(arabicText, lastLetter, lastTwoLetter);
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // harakat in the beginning, example: (i)tsnaini, (a)rba'atun, (u)swatun
  if (currentWord.length === 1 && letter in harakat) {
    switch (letter) {
      case 'a':
        arabicText += arabicSymbol('upper alif');
        arabicText += arabicLetter(letter);
        break
      case 'i':
        arabicText += arabicSymbol('lower alif');
        arabicText += arabicLetter(letter);
        break
      case 'u':
        arabicText += arabicSymbol('upper alif');
        arabicText += arabicLetter(letter);
        break
    }
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // double harakat in the beginning. example: aamanu
  if (currentWord.length === 2 && letter in harakat && lastLetter == letter) {
    switch (letter) {
      case 'a':
        arabicText = arabicText.slice(0, -2)
        arabicText += String.fromCharCode(0x0622);
      case 'i':
        currentWord = currentWord.slice(0, -1);
        latinText = latinText.slice(0, -1);
      case 'u':
        currentWord = currentWord.slice(0, -1);
        latinText = latinText.slice(0, -1);
      default:
        updateDisplay(arabicText, currentWord);
        return event.preventDefault();
    }
  }

  // double harakat in the middle: mad, example: itsn(aa)ni, b(aa)bun, (laa)
  if (currentWord.length > 2 && letter in harakat && lastLetter === letter) {
    switch (letter) {
      case 'a':
        // ligature alif lam
        if (lastTwoLetter === 'l') {
          const fourthLastLetter = currentWord.length > 2 ? currentWord.slice(-4, -3) : '';
          const fifthLastLetter = currentWord.length > 3 ? currentWord.slice(-5, -4) : '';
          if ((currentWord === 'laa' && fourthLastLetter != 'l') || noMiddle.includes(fifthLastLetter)) {
            arabicText = arabicText.slice(0, -2)
            arabicText += String.fromCharCode(0xFEFB)
          } else {
            arabicText = arabicText.slice(0, -2)
            arabicText += String.fromCharCode(0x200D)
            arabicText += String.fromCharCode(0xFEFC)
          }
          arabicText += arabicLetter(letter)
        } else {
          if (noMiddle.includes(lastTwoLetter)) {
            arabicText += arabicLetter('A');
          } else {
            arabicText += String.fromCharCode(0x0640)
            arabicText += String.fromCharCode(0x200D)
            arabicText += String.fromCharCode(0x0627)
          }
        }
        break
      case 'i':
        arabicText = arabicText.slice(0, -1);
        arabicText += String.fromCharCode(0x0656);
        break;
      case 'u':
        arabicText += arabicLetter('w');
        break;
    }
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // Joining enforcement for alif in the final position
  if (letter === 'A' && currentWord !== 'A') {
    arabicText += String.fromCharCode(0x0640);
    arabicText += String.fromCharCode(0x200D);
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // al-ummah, al-akbar
  if (letter in harakat && lastLetter === '-' && lastTwoLetter === 'l') {
    arabicText = arabicText.slice(0, -2);
    arabicText += String.fromCharCode(0xFEFB);
    arabicText += arabicLetter(letter);
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  // Allah
  if (currentWord == 'AllaaH') {
    arabicText = arabicText.slice(0, -3) + arabicLetter('l') + arabicSymbol('tasydid') + String.fromCharCode(0x0670) + arabicText.slice(-3, -2);
  } else if (currentWord == 'lillaaH') {
    arabicText = arabicText.slice(0, -4) + arabicLetter('l') + arabicSymbol('tasydid') + String.fromCharCode(0x0670) + arabicText.slice(-3, -2);
  }

  // Normal single letter/harakat
  if (letter in letterMap) {
    // hamzah, example: Assamaa-u
    if (lastLetter === '-') arabicText += String.fromCharCode(0x0621)
    arabicText += arabicLetter(letter);
    updateDisplay(arabicText, currentWord);
    return event.preventDefault();
  }

  updateDisplay(arabicText, currentWord);
  return event.preventDefault();
});


// Helper Functions

const arabicLetter = (letter) => {
  return String.fromCharCode(letterMap[letter]);
};


const arabicSymbol = (s) => {
  return String.fromCharCode(symbol[s]);
};

const isSukun = (currentWord, letter, lastLetter, lastTwoLetter) => {
  if (!autoSukun) return false;

  // not harakat, tanwin, or punctuation
  if (lastLetter in punctuation || letter === 'N' || lastLetter === 'N' || letter in harakat || lastLetter in harakat) return false;

  // first alif
  if (lastLetter === 'A') return false;
  
  // at least 2 letters
  if (currentWord.length < 2) return false;
  
  // not a compound
  if (lastLetter + letter in compound) return false;
  
  // example: ash-hab
  if (lastLetter === '-') return true;

  // example: ashhab
  if ((lastTwoLetter + lastLetter in compound) && lastLetter === letter) return true;
  
  if (lastLetter === letter) return false;

  return true;
}

const isTanwin = (letter, lastLetter, lastTwoLetter) => {
  return letter === 'N' && lastLetter in harakat && lastLetter !== lastTwoLetter;
}

const isCompound = (letter, lastLetter) => {
  return !(lastLetter in harakat) && lastLetter + letter in compound
};

const getLastLetter = (text) => {
  return text.length > 0 ? text.slice(-1) : ''
}

const getLastTwoLetter = (text) => {
  return text.length > 1 ? text.slice(-2, -1) : '';
}

const isTasydid = (letter, lastLetter, lastTwoLetter) => {
  return lastLetter in consonant && lastLetter === letter && (lastTwoLetter in harakat || lastTwoLetter === 'A');
}

const addTanwin = (arabicText, harakat, lastTwoLetter) => {
  // Add tanwin (i.e. an, in, un). Example: ghafuuran, binashrin, qalamun (in the end of a word?)
  switch (harakat) {
    case 'a':
      arabicText = arabicText.slice(0, -1)
      arabicText += String.fromCharCode(0x064B)
      if (noMiddle.includes(lastTwoLetter)) {
        arabicText += String.fromCharCode(0x0627);
      } else {
        arabicText += String.fromCharCode(0x0640);
        arabicText += String.fromCharCode(0x200D);
        arabicText += String.fromCharCode(0x0627);
      }
      break
    case 'i':
      arabicText = arabicText.slice(0, -1)
      arabicText += arabicLetter('iN')
      break
    case 'u':
      arabicText = arabicText.slice(0, -1)
      arabicText += arabicLetter('uN')
      break
  }
  return arabicText
}

const updateDisplay = (arabicText, currentWord) => {
  document.getElementById('editor').value = arabicText;
  document.getElementById('latinDisplay').innerHTML = currentWord;
}

const handlePunctuation = (arabicText, currentWord, latinText, letter) => {
  arabicText += getAdditionalSukunAndMad(currentWord)
  arabicText += punctuation[letter] !== false ? arabicLetter(letter) : letter;
  currentWord = '';
  latinText += letter;
  return [arabicText, currentWord, latinText]; 
};

const handleEnter = (arabicText, currentWord, latinText) => {
  arabicText += '\n';
  currentWord = '';
  latinText += '\n';
  return [arabicText, currentWord, latinText];
};

const handleWhitespace = (arabicText, currentWord, latinText) => {
  arabicText += getAdditionalSukunAndMad(currentWord)
  arabicText += ' ';
  currentWord = '';
  latinText += ' ';
  return [arabicText, currentWord, latinText];
};

const handleBackspace = (arabicText, currentWord, latinText) => {
  // latin text of last arabic character
  let lastArabic = arabicText.charCodeAt(arabicText.length-1);
  let lastLetters = arabicMap[lastArabic];
  
  if (lastLetters in symbol) {
    if (lastLetters === 'space') {
      arabicText = arabicText.slice(0, -1);
      latinText = latinText.slice(0, -1);
      textSplits = latinText.split(' ');
      currentWord = textSplits[textSplits.length-1];
    } else if (lastLetters === 'sukun') {
      arabicText = arabicText.slice(0, -1);
    } else if (lastLetters === 'tasydid') {
      arabicText = arabicText.slice(0, -1);
      currentWord = currentWord.slice(0, -1);
      latinText = latinText.slice(0, -1);  
    }
  } else if (lastLetters.length === 1) {
    arabicText = arabicText.slice(0, -1);
    currentWord = currentWord.slice(0, -1);
    latinText = latinText.slice(0, -1);
  } else if (lastLetters.length === 2 && lastLetters.charAt(0) in letterMap) {
    arabicText = arabicText.slice(0, -1) + arabicLetter(lastLetters.charAt(0));
    currentWord = currentWord.slice(0, -1);
    latinText = latinText.slice(0, -1);
  } else {
    arabicText = arabicText.slice(0, -1);
    currentWord = currentWord.slice(0, -1*lastLetters.length);
    latinText = latinText.slice(0, -1*lastLetters.length);
  }

  return [arabicText, currentWord, latinText];
}

const isInputAllowed = (currentWord, letter) => {
  return letter.match(/[0-9btjhdrzsfqklmnwHy\'TgAaiuN\?\-]/) && !(letter === '-' && currentWord < 2);
};

const getAdditionalSukunAndMad = (currentWord) => {
  const lastLetter = getLastLetter(currentWord);
  const lastTwoLetter = getLastTwoLetter(currentWord);
  
  if (isSukun(currentWord, ' ', lastLetter, lastTwoLetter)) {
    return arabicSymbol('sukun')
  }
  if (lastLetter === 'w' || lastLetter === 'u' && lastTwoLetter === 'u') {
    return arabicLetter('A');
  }

  return '';
};

const addSukun = (arabicText, letter) => {
  arabicText += arabicSymbol('sukun');
  if (letter != '-') arabicText += arabicLetter(letter);
  return arabicText;
};

const addTasydid = (arabicText, lastLetter, lastTwoLetter) => {
  if (isSyamsiyah(lastTwoLetter, lastLetter)) {
    let additionalLam = lastLetter !== 'l' ? arabicLetter('l') : '';
    arabicText = arabicText.slice(0, -1) + additionalLam + arabicText.slice(-1);
  }
  arabicText += arabicSymbol('tasydid');
  return arabicText;
};

const isSyamsiyah = (lastTwoLetter, lastLetter) => {
  return lastTwoLetter === 'A' && lastLetter in syamsiyah;
};
