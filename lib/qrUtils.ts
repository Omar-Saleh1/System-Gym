/**
 * Returns today's date as YYYY-MM-DD in the LOCAL browser timezone.
 * ⚠️ Do NOT use new Date().toISOString().split('T')[0] — that returns UTC date
 * which can be ±1 day off from the local date (e.g. Egypt UTC+2, US UTC-7).
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const ARABIC_KEY_MAP: Record<string, string> = {
  'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p', 'ج': '[', 'د': ']',
  'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l', 'ك': ';', 'ط': "'",
  'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'لا': 'b', 'ى': 'n', 'ة': 'm', 'و': ',', 'ز': '.', 'ظ': '/',
};

/**
 * Cleans a raw QR scan value:
 * - Strips full URLs (e.g. https://domain.com/member/qr/TOKEN → TOKEN)
 * - Decodes numeric ASCII character sequences sent by hardware scanners (e.g. 068098077... → DbMIIHWxrBDp)
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

  // Convert numeric ASCII sequence if sent by hardware scanner
  if (/^(\d{3})+$/.test(str) && str.length >= 12 && str.length % 3 === 0) {
    let decoded = '';
    for (let i = 0; i < str.length; i += 3) {
      const charCode = parseInt(str.substring(i, i + 3), 10);
      if (charCode >= 32 && charCode <= 126) {
        decoded += String.fromCharCode(charCode);
      } else {
        decoded = '';
        break;
      }
    }
    if (decoded) str = decoded;
  }

  // Convert Arabic letters to English equivalents
  let converted = '';
  for (const ch of str) {
    converted += ARABIC_KEY_MAP[ch] || ch;
  }
  return converted.trim() || str;
};
