
const letters = [
	"*",
  "а",
  "б",
  "в",
  "г",
  "д",
  "е",
  "ё",
  "ж",
  "з",
  "и",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ъ",
  "ы",
  "ь",
  "э",
  "ю",
  "я",
];

/**
 * @param {string} text 
 * @returns {Uint8Array}
 */
export function str2byte(text) {
  const str = new Uint16Array(text.length);
  for (const i in text) {
    const code = text.charCodeAt(i);
    str[i] = code;
  }

	return str;
}

/**
 * @param {Uint16Array} data 
 * @returns {string}
 */
export function byte2str(data, len) {
  var a = Array.from(data).slice(0, len);
  return String.fromCharCode(...a);
}
