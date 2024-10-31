
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
 * 
 * @param {string} str 
 * @returns 
 */
export function str2byte(str) {
  var enc = new TextEncoder();
  return enc.encode(enc);
	const data = new Uint16Array(str.length);
	for(let i = 0; i < str.length; i++) {
		const l = str.charCodeAt(i);
		data[i] = l;
	}

	return data;
}

export function byte2str(data) {
	var enc = new TextDecoder("utf-8");
  return enc.decode(data);
}
