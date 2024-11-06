import Events from "./events.js"

const PALETTE_USE = false;

var palette = null;
var textarea = null;
let textinput = "";

/** @type {Events} */
let events = null;

function warn(...args) {
  console.warn(...args)
}

export default function main_avessy(input = "bb#main text") {
  window.addEventListener("keydown", (ev)=> {
    try {
      onkeypress(ev);
    } catch(err) {
      warn(err);
    }
  });
  window.addEventListener("click", (ev)=> {
    try {
      _onclick(ev);
    } catch(err) {
      warn(err);
    }
  });
  window.addEventListener("paste", (ev)=> {
    try {
      _onpaste(ev);
    } catch(err) {
      warn(err);
    }
  });
  textarea = document.querySelector(input);
  events = new Events();
  this.events = events;
}

function onkeypress(keyboardEvent) {
  switch (keyboardEvent.key) {
    case "Enter":
      if (keyboardEvent.ctrlKey) {
        resetInput();
      }

      if (keyboardEvent.shiftKey) {
        muteText();
      }

      /** @type {string} */
      const text = textinput;
      if (text.startsWith(".?")) {
        events.emit("command", { text })
      } else if (text.startsWith(".$")) {
        events.emit("command", { text })
      } else {
        events.emit("commit", { text })
      }
      insertNewLine();
      randomizePallete();
      break;
    case "Backspace":
      if (keyboardEvent.ctrlKey) {
        resetInput();
      } else {
        removeLetter();
      }
      break;
    default:
      if (keyboardEvent.key.length == 1) {
        insertText(keyboardEvent.key);
      }
      break;
  }
}

function removeLetter() {
  textinput = textinput.slice(0, -1);
  const input = getActiveInput();
  input.innerHTML = textinput;
}

function getActiveInput() {
  return textarea;
}

function insertText(text) {
  textinput += text;
  getActiveInput().innerHTML = textinput;
}

function muteText() {
  getActiveInput().classList.add("mute");
}

function insertNewLine() {
  var active = getActiveInput();
  var li = textinput.lastIndexOf(":");
  if (li > -1) {
    textinput = textinput.slice(0, li + 1);
  } else {
    textinput = "";
  }

  active.innerHTML = textinput;
}

function _insertNewLine() {
  var active = getActiveInput();

  if (active) {
    active.innerHTML = md.render(active.innerHTML);
  }

  var el = document.createElement("p");
  textarea.appendChild(el);
  var bar = textarea.querySelector("b");

  if (bar) {
    bar.parentElement.removeChild(bar);
    textarea.appendChild(bar);
  } else {
    textarea.innerHTML += "<b>▮</b>";
  }
}

function resetInput() {
  textarea.innerHTML = "";
}


function _onpaste(event) {
  var paste = (event.clipboardData || window.clipboardData).getData("text");

  if (!paste.length) {
    insertText("🍍");
    return;
  }

  insertText(paste);
}

function _onclick() {
  randomizePallete();
}

function _loadPalette() {
  palette = document.querySelector("db#palette").innerHTML;
  palette = palette.split(" "); // Array[32]. Palette from https://lospec.com/palette-list/pineapple-32
}

function randomizePallete() {
  if (!PALETTE_USE) {
    return;
  }
  if (!palette) {
    _loadPalette();
  }

  var colors = palette.length;
  var colorA = Math.round(Math.random() * colors);
  var colorB = Math.round(Math.random() * colors);

  if (colorA == colorB) {
    randomizePallete();
    return;
  }

  document.body.style.setProperty("--color-a", "#" + palette[colorA]);
  document.body.style.setProperty("--color-b", "#" + palette[colorB]);
}
