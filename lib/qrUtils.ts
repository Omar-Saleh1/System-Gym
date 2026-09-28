// Arabic keyboard map to English QWERTY (used when scanner is in Arabic input mode)
const ARABIC_KEY_MAP: Record<string, string> = {
  'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p', 'ج': '[', 'د': ']',
  'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l', 'ك': ';', 'ط': "'",
  'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'لا': 'b', 'ى': 'n', 'ة': 'm', 'و': ',', 'ز': '.', 'ظ': '/',
};

/**
 * Cleans a raw QR scan value:
 * - Strips full URLs (e.g. https://domain.com/member/qr/TOKEN → TOKEN)
 * - Converts Arabic keyboard characters to their English equivalents
 */
export const cleanScanCode = (code: string): string => {
  let str = code.trim();
  // Strip URL if scanner read full URL
  if (str.includes('/qr/')) {
    const after = str.split('/qr/').pop() || '';
    str = after.split('?')[0].split('#')[0].trim();
  } else if (str.startsWith('http://') || str.startsWith('https://')) {
    str = str.split('/').pop()?.split('?')[0].split('#')[0].trim() || str;
  }
  // Convert Arabic letters to English equivalents
  let converted = '';
  for (const ch of str) {
    converted += ARABIC_KEY_MAP[ch] || ch;
  }
  return converted.trim() || str;
};
