import Network from "./network.js";
import { LobbyListEntry } from "@poki/netlib";
import { byte2str, str2byte } from "./crypt.js";

const MESSAGE_TYPES = {
    CHAT_MESSAGE: 0
}

class Chat {
  constructor() {
    /** @type {HTMLElement} */
    this.container = null;
    /** @type {HTMLElement} */
    this.stats = null;
    /** @type {HTMLElement} */
    this.messages = null;
    /** @type {Network} */
    this._network = null;
  }

  init(container, network) {
    this.container = container;
    this.stats = this.container.querySelector("#chatstats");
    this.messages = this.container.querySelector("#chatmessages");
    this._network = network;

    return this;
  }

  run() {
    this._network.events.on("recieve", this.recieve, this);
    this._network.events.on("greet", this.greet, this);
    this._network.events.on("bye", this.update_stats, this);
  }

  send(message) {
    const data = str2byte(message);
    this._network.send(MESSAGE_TYPES.CHAT_MESSAGE, data);
    this.print("." + message);
  }

  /**
   * @param {object} args
   * @param {string} args.id peer id
   * @param {number} args.type packet type
   * @param {Uint8Array} args.data packet data
   */
  recieve({ id, type, data, flip, guid }) {
    switch (type) {
        case MESSAGE_TYPES.CHAT_MESSAGE:
            if (flip) {
              console.log("flip:", guid );
            } else {
              const text = byte2str(data);
              console.log("got message:", id, guid, text );
              this.print("'" + text);
            }
            break;
    }
  }

  /**
   * @param {string} text 
   */
  print(text) {
    const ci = text.indexOf("*");
    let _text = text;
    if (ci > -1) {
      _text = text.slice(0, ci);
    }
    this.messages.innerHTML += `<b>${_text}</b>`;
  }

  /**
   * @param {object} args
   * @param {string} args.id peer id
   */
  greet({ id }) {
    this.update_stats();
  }

  onlobby(lobby) {
    this.update_stats();
  }

  /**
   * @returns
   */
  update_stats() {
    const lobby_id = this._network.netlib.currentLobby;
    if (!lobby_id) {
      this.stats.innerHTML = `Не подключен.`;
      return;
    }

    this.stats.innerHTML = `Lobby ${lobby_id}. ${this._network.count_peers}/${this._network.max_peers} online.`;
  }
}

export default Chat;
