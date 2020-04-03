// https://www.w3.org/TR/alreq/
// https://docs.microsoft.com/en-us/typography/script-development/arabic
// https://jrgraphix.net/r/Unicode/0600-06FF
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
// https://en.wikipedia.org/wiki/Arabic_alphabet#Ligatures

let latinText = '';  // per kata
let arabicText = ''; // semuanya

document.getElementById('editor').addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  let letter = event.key || String.fromCharCode(event.which || event.code);
  
  if ([' ', 'Backspace', 'Shift'].includes(letter)) {
    switch (letter) {
      case ' ':
        arabicText = addWhitespace(arabicText, latinText);
        latinText = '';
        updateDisplay(arabicText, latinText);
        return;
      case 'Backspace':
        let lastLetters = arabicMap[arabicText.charCodeAt(arabicText.length-1)];
        if (lastLetters === "o") {
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
  
  console.log('ya')
  const lastLetter = latinText ? latinText.slice(-1) : '';
  const lastTwoLetter = latinText.length > 1 ? latinText.slice(-2, -1) : '';
  latinText += letter;

  // check compound except 'ain, ex: sy, sh, kh
  if (!vocal.includes(lastLetter) && lastLetter + letter in compound) {
    arabicText = arabicText.slice(0, -1);
    arabicText = appendText(arabicText, lastLetter + letter);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  if (isSukun(lastLetter, letter)) {
    arabicText += String.fromCharCode(harakat['o']);
    arabicText += String.fromCharCode(letterMap[letter]);
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
  }

  // Check tasydid (i.e. double letters). Example: minna, umma, jaddati
  if (lastLetter in consonant && lastLetter === letter) {
    arabicText += String.fromCharCode(0x0651);
    // to do: tasydid followed by harakat uses a single code, not tasyid + harakat code 
    updateDisplay(arabicText, latinText);
    return event.preventDefault();
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
      case 'o':
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
  if (lastLetter === letter) {
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
          arabicText += String.fromCharCode(noMiddle.includes(lastTwoLetter) ? 0x061C : 0x0640)
          arabicText += String.fromCharCode(0x200D)
          arabicText += String.fromCharCode(0x0627)
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
    arabicText += String.fromCharCode(0x0640)
    arabicText += String.fromCharCode(0x200D)
  }

  // Normal single letter/harakat
  if (letter in letterMap) {
    arabicText = appendText(arabicText, letter);
  }

  updateDisplay(arabicText, latinText);
  event.preventDefault();
});

const appendText = (arabicText, letter) => {
  return arabicText += String.fromCharCode(letterMap[letter]);
}

const isSukun = (lastLetter, letter = ' ') => {
  return (!vocal.includes(letter) && !vocal.includes(lastLetter) && latinText.length > 1 && !(lastLetter + letter in compound) && lastLetter !== letter)
}

const isTanwin = (letter, lastLetter) => {
  return letter === 'n' && lastLetter in harakat;
}

const processTanwin = (arabicText, harakat) => {
  // Process tanwin (i.e. an, in, un). Example: ghafuuran, binashrin, qalamun (in the end of a word?)
  switch (harakat) {
    case 'a':
      arabicText = arabicText.slice(0, -2)
      arabicText += String.fromCharCode(0x064B)
      arabicText += String.fromCharCode(0x200D)
      arabicText += String.fromCharCode(0x0627)
      break
    case 'i':
      arabicText = arabicText.slice(0, -2)
      arabicText += String.fromCharCode(0x064D)
      break
    case 'u':
      arabicText = arabicText.slice(0, -2)
      arabicText += String.fromCharCode(0x064C)
      break
  }
  return arabicText
}

const addWhitespace = (arabicText, latinText) => {
  // when whitespace is added:
  // 1. check tanwin and sukun
  // 2. reset latin text

  const lastLetter = latinText.slice(-1);
  
  if (latinText.length > 3) {
    const lastTwoLetter = latinText.slice(-2, -1);
    if (isTanwin(latinText, lastLetter, lastTwoLetter)) {
      arabicText = processTanwin(arabicText, lastTwoLetter);
    }
  }

  if (isSukun(lastLetter, ' ')) {
    arabicText += String.fromCharCode(harakat['o'])
  }

  arabicText += ' ';
  return arabicText;
}

const updateDisplay = (arabicText, latinText) => {
  document.getElementById('editor').value = arabicText;
  document.getElementById('latinDisplay').innerHTML = latinText;
}