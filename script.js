// https://www.w3.org/TR/alreq/
// https://docs.microsoft.com/en-us/typography/script-development/arabic
// https://jrgraphix.net/r/Unicode/0600-06FF
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
// https://en.wikipedia.org/wiki/Arabic_alphabet#Ligatures

let latinText = '';  // per kata
let arabicText = ''; // semuanya

let autoSukun = true;

document.getElementById('autoSukunBtn').addEventListener('click', event => {
  autoSukun = !autoSukun;
  document.getElementById('autoSukun').checked = autoSukun;
  document.getElementById('editor').focus();
});

document.getElementById('autoSukun').addEventListener('change', event => {
  autoSukun = event.target.checked;
  document.getElementById('editor').focus();
});

document.getElementById('editor').addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  let letter = event.key || String.fromCharCode(event.which || event.code);
  
  if (letter in punctuation) {
    arabicText += letter;
    latinText += letter;
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  if (['Enter', ' ', 'Backspace', 'Shift'].includes(letter)) {
    switch (letter) {
      case 'Enter':
        arabicText += '\n';
        latinText = '';
        updateDisplay(arabicText, latinText);
        return event.preventDefault();
      case ' ':
        arabicText = addWhitespace(arabicText, latinText);
        latinText = '';
        updateDisplay(arabicText, latinText);
        return;
      case 'Backspace':
        let lastLetters = arabicMap[arabicText.charCodeAt(arabicText.length-1)];
        if (lastLetters === sukun) {
          arabicText = arabicText.slice(0, -1);
        } else if (lastLetters.length === 1) {
          arabicText = arabicText.slice(0, -1);
          latinText = latinText.slice(0, -1);
        } else if (lastLetters.length === 2 && lastLetters.charAt(0) in letterMap) {
          arabicText = arabicText.slice(0, -1) + String.fromCharCode(letterMap[lastLetters.charAt(0)]);
          latinText = latinText.slice(0, -1);
        } else {
          arabicText = arabicText.slice(0, -1);
          latinText = latinText.slice(0, -1*lastLetters.length);
        }
        
        updateDisplay(arabicText, latinText);
        return event.preventDefault();
      case 'Shift':
        // to do
        return event.preventDefault();
    }
  }
  
  // check illegal input
  if (!letter.match(/[0-9btjhdrzsfqklmnwHy\'TgAaiuN\?\-]/)) {
    return event.preventDefault();
  }

  const lastLetter = getLastLetter(latinText);
  const lastTwoLetter = getLastTwoLetter(latinText);

  // ignore '-' (will be checked on the next letter)
  if (letter === '-') {
    if (latinText.length > 1 && !(lastLetter in harakat)) latinText += letter;
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  latinText += letter;

  // check compound except 'ain, ex: sy, sh, kh
  if (!(lastLetter in harakat) && lastLetter + letter in compound) {
    const lastThreeLetter = latinText.length > 2 ? latinText.slice(-4, -3) : '';
    const lastFourLetter = latinText.length > 3 ? latinText.slice(-5, -4) : '';
    if (lastLetter in consonant) arabicText = arabicText.slice(0, -1);
    if (lastThreeLetter + lastTwoLetter === lastLetter + letter) { // compound tasydid, ex: ba(sysy)iriyna
      if (lastFourLetter === 'A') {
        // alif lam syamsiyah
        arabicText = arabicText.slice(0, -2) + String.fromCharCode(letterMap['l']) + arabicText.slice(-2, -1);
      }
      arabicText += String.fromCharCode(0x0651);
    } else {
      arabicText = appendText(arabicText, lastLetter + letter);
    }
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  if (isSukun(letter, lastLetter, lastTwoLetter)) {
    arabicText += String.fromCharCode(harakat[sukun]);
    if (letter != '-') arabicText += String.fromCharCode(letterMap[letter]);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // Check tasydid (i.e. double letters). Example: minna, umma, jaddati
  if (isTasydid(letter, lastLetter, lastTwoLetter)) {
    if (lastTwoLetter === 'A') {
      // alif lam syamsiyah
      arabicText = arabicText.slice(0, -1) + String.fromCharCode(letterMap['l']) + arabicText.slice(-1);
    }
    arabicText += String.fromCharCode(0x0651);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  if (isTanwin(letter, lastLetter, lastTwoLetter)) {
    arabicText = processTanwin(arabicText, lastLetter, lastTwoLetter);
  }


  // // handle special cases
  // if (char in consonant) {
  //   const twolastLetter = latinText.slice(-3, -2)
  //   const fourlastLetter = latinText.slice(-4, -3)

  //   // if previously lam + mim exist, prevent that from joining
  //   if (twolastLetter === 'm' && fourlastLetter === 'l') {
  //     const pre = arabicText.slice(0, -2)
  //     const post = arabicText.slice(-2)
  //     arabicText = pre + String.fromCharCode(0x0640) + post + String.fromCharCode(letterMap[char])
  //     return event.preventDefault()
  //   }
  // }

  // harakat in the beginning, example: (i)tsnaini, (a)rba'atun, (u)swatun
  if (letter in harakat && latinText === letter) {
    switch (letter) {
      case sukun:
        break
      case 'a':
        arabicText += String.fromCharCode(0x0623);
        arabicText += String.fromCharCode(letterMap[letter]);
        break
      case 'i':
        arabicText += String.fromCharCode(0x0625);
        arabicText += String.fromCharCode(letterMap[letter]);
        break
      case 'u':
        arabicText += String.fromCharCode(0x0623);
        arabicText += String.fromCharCode(letterMap[letter]);
        break
    }
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // double harakat in the middle: mad, example: itsn(aa)ni, b(aa)bun, (laa)
  if (letter in harakat && lastLetter === letter) {
    switch (letter) {
      case 'a':
        // ligature alif lam
        if (lastTwoLetter === 'l') {
          if (latinText === 'laa' || noMiddle.includes(latinText.slice(-5, -4))) {
            arabicText = arabicText.slice(0, -2)
            arabicText += String.fromCharCode(0xFEFB)
          } else {
            arabicText = arabicText.slice(0, -2)
            arabicText += String.fromCharCode(0x200D)
            arabicText += String.fromCharCode(0xFEFC)
          }
          arabicText += String.fromCharCode(harakat[letter])
        } else {
          if (noMiddle.includes(lastTwoLetter)) {
            arabicText += String.fromCharCode(0x0627);
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
        arabicText += String.fromCharCode(letterMap['w']);
        break;
    }
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // Joining enforcement for alif in the final position
  if (letter === 'A' && latinText !== 'A') {
    arabicText += String.fromCharCode(0x0640);
    arabicText += String.fromCharCode(0x200D);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // al-ummah, al-akbar
  if (letter in harakat && lastLetter === '-' && lastTwoLetter === 'l') {
    arabicText = arabicText.slice(0, -2);
    arabicText += String.fromCharCode(0xFEFB);
    arabicText = appendText(arabicText, letter);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // Normal single letter/harakat
  if (letter in letterMap) {
    arabicText = appendText(arabicText, letter);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  updateDisplay(arabicText, latinText);
  return event.preventDefault();
});

const appendText = (arabicText, letter) => {
  return arabicText += String.fromCharCode(letterMap[letter]);
}

const isSukun = (letter, lastLetter, lastTwoLetter) => {
  if (!autoSukun) return false;

  // not harakat, tanwin, or punctuation
  if (lastLetter in punctuation || letter === 'N' || lastLetter === 'N' || letter in harakat || lastLetter in harakat) return false;

  // first alif
  if (lastLetter === 'A') return false;
  
  // at least 2 letters
  if (latinText.length < 2) return false;
  
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

const getLastLetter = (text) => {
  return text.length > 0 ? text.slice(-1) : ''
}

const getLastTwoLetter = (text) => {
  return text.length > 1 ? text.slice(-2, -1) : '';
}

const isTasydid = (letter, lastLetter, lastTwoLetter) => {
  return lastLetter in consonant && lastLetter === letter && (lastTwoLetter in harakat || lastTwoLetter === 'A');
}

const processTanwin = (arabicText, harakat, lastTwoLetter) => {
  // Process tanwin (i.e. an, in, un). Example: ghafuuran, binashrin, qalamun (in the end of a word?)
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
      arabicText += String.fromCharCode(0x064D)
      break
    case 'u':
      arabicText = arabicText.slice(0, -1)
      arabicText += String.fromCharCode(0x064C)
      break
  }
  return arabicText
}

const addWhitespace = (arabicText, latinText) => {
  // when whitespace is added:
  // 1. check tanwin and sukun
  // 2. reset latin text

  const lastLetter = getLastLetter(latinText);
  const lastTwoLetter = getLastTwoLetter(latinText);
  
  if (isSukun(' ', lastLetter, lastTwoLetter)) {
    arabicText += String.fromCharCode(harakat[sukun])
  }

  if (lastLetter === 'w' || lastLetter === 'u' && lastTwoLetter === 'u') {
    arabicText += String.fromCharCode(0x0627);    
  }

  arabicText += ' ';
  return arabicText;
}

const updateDisplay = (arabicText, latinText) => {
  document.getElementById('editor').value = arabicText;
  document.getElementById('latinDisplay').innerHTML = latinText;
}