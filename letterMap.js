const consonant = {
  'b': 0x0628, // ب
  't': 0x062A, // ت
  'j': 0x062C, // ج
  'h': 0x062D, // ح
  'd': 0x062F, // د
  'r': 0x0631, // ر
  'Z': 0x0632, // ز
  's': 0x0633, // س
  'f': 0x0641, // ف
  'q': 0x0642, // ق
  'k': 0x0643, // ك
  'l': 0x0644, // ل
  'm': 0x0645, // م
  'n': 0x0646, // ن
  'w': 0x0648, // و
  'H': 0x0647, // ه
  'y': 0x064A, // ي
  '\'': 0x0639, // ع
  'T': 0x0629, // ة
};

const alif = {
  'A': 0x0627, // ا
};

const compound = {
  'ts': 0x062B, // ث
  'dz': 0x0630, // ذ
  'kh': 0x062E, // خ
  'sy': 0x0634, // ش
  'sh': 0x0635, // ص
  'dh': 0x0636, // ض
  'th': 0x0637, // ط
  'zh': 0x0638, // ظ
  'gh': 0x063A, // غ
};

const harakat = {
  'a': 0x064E, //  َ
  'i': 0x0650, //  ِ
  'u': 0x064F, //  ُ
  'o': 0x0652, //  ْ
};


const number = {
  '0': 0x0660, // ٠
  '1': 0x0661, // ١
  '2': 0x0662, // ٢
  '3': 0x0663, // ٣
  '4': 0x0664, // ٤
  '5': 0x0665, // ٥
  '6': 0x0666, // ٦
  '7': 0x0667, // ٧
  '8': 0x0668, // ٨
  '9': 0x0669, // ٩
};

const punctuation = {
  '?': 0x061F, // ؟
};

const vocal = ['a', 'i', 'u', 'e', 'o'];
const noMiddle = ['d', 'z', 'r', 'Z', 'w'];

const letterMap = Object.assign({}, consonant, compound, harakat, alif, number, punctuation);