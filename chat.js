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
    this.input = this.container.querySelector("#chatinput");
    this._network = network;

    return this;
  }

  run() {
    this._network.events.on("recieve", this.recieve.bind(this));
    this._network.events.on("greet", this.greet.bind(this));

    this.input.addEventListener("change", (e) => this.send(this.input.value));
  }

  send(message) {
    const data = str2byte(message);
    this._network.send(MESSAGE_TYPES.CHAT_MESSAGE, data);
  }

  /**
   * @param {object} args
   * @param {string} args.id peer id
   * @param {number} args.type packet type
   * @param {Uint8Array} args.data packet data
   */
  recieve({ id, type, data }) {
    switch (type) {
        case MESSAGE_TYPES.CHAT_MESSAGE:
            const str = byte2str(data);
            console.log(str);
            break;
    }
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
