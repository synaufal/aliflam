// https://www.w3.org/TR/alreq/
// https://docs.microsoft.com/en-us/typography/script-development/arabic
// https://jrgraphix.net/r/Unicode/0600-06FF
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
// https://en.wikipedia.org/wiki/Arabic_alphabet#Ligatures

let latinText = '';  // per kata
let arabicText = ''; // semuanya

document.getElementById('editor').addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if ([' ', 'Backspace', 'Shift'].includes(event.key)) {
    switch (event.key) {
      case ' ':
        arabicText = addWhitespace(arabicText, latinText);
        latinText = '';
        document.getElementById('editor').value = arabicText;
        document.getElementById('latinDisplay').innerHTML = latinText;
        return;
      case 'Backspace':
        // to do
      case 'Shift':
        // to do
        return event.preventDefault();
    }
  }
  
  const char = event.key;
  const lastChar = latinText ? latinText.slice(-1) : '';
  latinText += char;

  // check compound except 'ain, ex: sy, sh, kh
  if (!vocal.includes(lastChar) && lastChar + char in compound) {
    arabicText = arabicText.slice(0, -1)
    arabicText = appendText(arabicText, lastChar + char);
    document.getElementById('editor').value = arabicText;
    return event.preventDefault();
  }

  // if (isSukun(lastChar, char)) {
  //   arabicText += String.fromCharCode(mark['o'])
  //   arabicText += String.fromCharCode(dict[char])
  //   return event.preventDefault()
  // }

  // // handle special cases
  // if (char in consonant) {
  //   const twoLastChar = latinText.slice(-3, -2)
  //   const fourLastChar = latinText.slice(-4, -3)

  //   // Check tasydid (i.e. double letters). Example: minna, umma, jaddati
  //   if (lastChar in consonant && lastChar === char) {
  //     arabicText += String.fromCharCode(0x0651)
  //     return event.preventDefault()
  //   }

  //   // if previously lam + mim exist, prevent that from joining
  //   if (twoLastChar === 'm' && fourLastChar === 'l') {
  //     const pre = arabicText.slice(0, -2)
  //     const post = arabicText.slice(-2)
  //     arabicText = pre + String.fromCharCode(0x0640) + post + String.fromCharCode(dict[char])
  //     return event.preventDefault()
  //   }
  // }

  // if (char in mark) {
  //   // mark in the beginning, example: itsnaini, arba'atun
  //   if (latinText === char) {
  //     switch (char) {
  //       case 'o':
  //         break
  //       case 'a':
  //         arabicText += String.fromCharCode(0x0623)
  //         arabicText += String.fromCharCode(dict[char])
  //         break
  //       case 'i':
  //         arabicText += String.fromCharCode(0x0625)
  //         arabicText += String.fromCharCode(dict[char])
  //         break
  //       case 'u':
  //         arabicText += String.fromCharCode(0x0623)
  //         arabicText += String.fromCharCode(dict[char])
  //         break
  //     }
  //     return event.preventDefault()
  //   }

  //   // mad, example: itsnaani
  //   const lastChar = latinText.slice(-2, -1)
  //   const lastTwoChar = latinText.slice(-3, -2)
  //   if (lastChar === char) {
  //     switch (char) {
  //       case 'a':
  //         // ligature alif lam
  //         if (lastTwoChar === 'l') {
  //           if (latinText === 'laa' || noMiddle.includes(latinText.slice(-5, -4))) {
  //             arabicText = arabicText.slice(0, -2)
  //             arabicText += String.fromCharCode(0xFEFB)
  //           } else {
  //             arabicText = arabicText.slice(0, -2)
  //             arabicText += String.fromCharCode(0x200D)
  //             arabicText += String.fromCharCode(0xFEFC)
  //           }
  //           arabicText += String.fromCharCode(mark[char])
  //         } else {
  //           arabicText += String.fromCharCode(noMiddle.includes(lastTwoChar) ? 0x061C : 0x0640)
  //           arabicText += String.fromCharCode(0x200D)
  //           arabicText += String.fromCharCode(0x0627)
  //         }
  //         break
  //       case 'i':
  //         arabicText = arabicText.slice(0, -1)
  //         arabicText += String.fromCharCode(0x0656)
  //         break
  //       case 'u':
  //         arabicText += String.fromCharCode(dict['w'])
  //         break
  //     }
  //     return event.preventDefault()
  //   }
  // }

  // Joining enforcement for alif in the final position
  if (char === 'A' && latinText !== 'A') {
    arabicText += String.fromCharCode(0x0640)
    arabicText += String.fromCharCode(0x200D)
  }

  // Normal single char/harakat
  if (char in dict) {
    arabicText = appendText(arabicText, char);
  }

  document.getElementById('editor').value = arabicText;
  document.getElementById('latinDisplay').innerHTML = latinText;
  event.preventDefault();
});

const appendText = (arabicText, char) => {
  return arabicText += String.fromCharCode(dict[char]);
}

const isSukun = (lastChar, char = ' ') => {
  return (!vocal.includes(char) && !vocal.includes(lastChar) && latinText.length > 1 && !(lastChar + char in compound) && lastChar !== char)
}

const isTanwin = (char, lastChar) => {
  return char === 'n' && lastChar in mark;
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

  const lastChar = latinText.slice(-1);
  
  if (latinText.length > 3) {
    const lastTwoChar = latinText.slice(-2, -1);
    if (isTanwin(latinText, lastChar, lastTwoChar)) {
      arabicText = processTanwin(arabicText, lastTwoChar);
    }
  }

  if (isSukun(lastChar, ' ')) {
    arabicText += String.fromCharCode(mark['o'])
  }

  arabicText += ' ';
  return arabicText;
}