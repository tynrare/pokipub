import Events from "./events.js";
import pkg from '@poki/netlib';
const { Network: Netlib } = pkg;

const npts = 4;
const npds = 256;
const fill = new Uint8Array(Array(npds).fill(42));

class NetPacket {
  constructor() {
    this.buffer = new ArrayBuffer(npts + npds);
    this._vtype = new Uint8Array(this.buffer, 0, npts);
    this._vdata = new Uint8Array(this.buffer, npts, npds);
    this._vdata16 = new Uint16Array(this.buffer, npts, npds / 2);
    this._len = new Uint8Array(this.buffer, 0, npts + npds);
  }

  set_content(data) {
    const b = new Uint8Array(data.buffer ?? buffer, data.byteOffset ?? 0).slice(0, this._vdata.byteLength);
    this._vdata.set(new Uint8Array(b));
  }

  cleanup(len) {
    this._vdata16.set(fill.slice(0, npds / 2 - len / 2), len / 2);
  }

  copy(data) {
    this._len.set(new Uint8Array(data));
  }

  get type() {
    return this._vtype[0];
  }

  set type(val) {
    return (this._vtype[0] = val);
  }

  get guid() {
    return this._vtype[1];
  }

  set guid(val) {
    return (this._vtype[1] = val);
  }
  
  get flip() {
    return this._vtype[2];
  }

  set flip(val) {
    return (this._vtype[2] = val);
  }

  get len() {
    return this._vtype[3];
  }

  set len(val) {
    return (this._vtype[3] = val);
  }
}

class Network {
  constructor(uuid) {
    /** @type {Netlib} */
    this.netlib = null;
    this.uuid = uuid ?? "c222666d-335e-4f8a-b688-2fa204520dba";
    this.packet = new NetPacket();
    /** @type {function(string, number, Uint8Array): void} */
    this.recieve = null;
    /** @type {function(string): Uint8Array} */
    this.greet = null;
    /** @type {Events} */
    this.events = null;

    this.max_peers = 4;
    this.count_peers = 0;

    this.guids = 0;
  }

  /**
   * @param {number} type
   * @param {string|ArrayBuffer|Uint16Array|Uint8Array} data
   * @param {string?} [to]
   */
  send(type, data, to, flip = false, guid = null) {
    this.packet.set_content(data);
    this.packet.len = data.byteLength;
    this.packet.cleanup(this.packet.len);
    this.packet.type = type;
    this.packet.flip = flip ? 1 : 0;
    let _guid = guid;
    if(!_guid) {
      _guid = this.guids;
      this.guids = (this.guids + 1) % 255;
    }
    this.packet.guid = _guid;

    const buffer = this.packet.buffer.slice();

    console.log("send");
    if (to) {
      this.netlib.send("reliable", to, buffer);
    } else {
      this.netlib.broadcast("reliable", buffer);
    }
  }

  /**
   * @param {Peer} peer .
   * @param {string} channel .
   * @param {string} data .
   * @emits Network#recieve
   */
  _on_message(peer, channel, data) {
    this.packet.copy(new Uint8Array(data));

    /**
     * @event Network#recieve
     * @type {object}
     * @property {string} id peer id
     * @property {number} type packet type
     * @property {Uint8Array} data packet data
     * @property {boolean} flip 
     */
    console.log("got");
    this.events.emit("recieve", {
      id: peer.id,
      packet: this.packet,
    })
    if (this.packet.flip) {
      return;
    }
    setTimeout(() => this.send(this.packet.type, this.packet._vdata, null, true, this.packet.guid), 0);
  }

  // ===
  // ===
  // ===

  /**
   * @returns {Network} this
   */
  init() {
    this.events = new Events();
    this.events.init();

    this.netlib = new Netlib(this.uuid);

    this._beforeunload_listener = this.dispose.bind(this);
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this._beforeunload_listener);
    }

    return this;
  }

  run(callback) {
    this.netlib.on("signalingerror", console.error.bind(console));
    this.netlib.on("rtcerror", console.error.bind(console));

    this.netlib.on("ready", () => {
      this.netlib.list().then((lobbies) => {
        // join available
        for (const i in lobbies) {
          const l = lobbies[i];
          if (l.playerCount < l.maxPlayers) {
            this.netlib.once("lobby", (code) => {
              console.log(`Network: connected to lobby: ${code}`);
            });
            this.netlib.join(l.code);
            return;
          }
        }

        // or create new one
        this._create_lobby();
      });

      this.netlib.on("message", this._on_message.bind(this));
      this.netlib.on("connected", (peer) => {
        console.log(`Network: new peer connected: ${peer.id}`);
        this._on_connected(peer.id);
      });
      this.netlib.on("disconnected", (peer, lobby) => {
        console.log(
          `Network: ${peer.id} disconnected, their latency was ${peer.latency.average}`
        );
        this._on_disconnected(peer.id);
      });
      this.netlib.on("lobby", (code, lobby) => {
        this._on_lobby(code, lobby);
        this.count_peers += 1;
        if (callback) {
          callback(this.netlib.currentLeader == this.netlib.id, lobby);
        }
      });
    });

    return this;
  }

  _on_lobby(code, lobby) {
    if (lobby.leader != this.netlib.id) {
      return;
    }
  }

  _create_lobby() {
    console.log(`Network: creating new lobby..`);
    this.netlib.once("lobby", (code) => {
      console.log(`Network: lobby was created: ${code}`);
    });
    this.netlib.create({ maxPlayers: 8, public: true, codeFormat: 'short' });
  }

  /**
   * @param {string} id .
   * @emits Network#bye
   */
  _on_disconnected(id) {
    this.count_peers -= 1;
     /**
     * @event Network#bye
     * @type {object}
     * @property {string} id peer id
     */
     this.events.emit("bye", { id })
  }

  /**
   * @param {string} peerid .
   * @emits Network#greet
   */
  _on_connected(peerid) {
    this.count_peers += 1;
    /**
     * @event Network#greet
     * @type {object}
     * @property {string} id peer id
     */
    this.events.emit("greet", { id: peerid })
  }

  dispose() {
    this.netlib?.close();
    this.netlib = null;
    this.events?.dispose();
    this.events = null;
  }
}

export default Network;
export { NetPacket, Network };
