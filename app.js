import PokiWrap from "./pokiwrap.js";
import Network from "./network.js";
import Chat from "./chat.js";
import Avessy from "./avessy.js";
import CommandLine from "./cmd.js";
class App {
	constructor() {
		/** @type {HTMLElement} */
		this.container = null;
		/** @type {PokiWrap} */
		this.pokiwrap = null;
		/** @type {Network} */
		this.network = null;
		/** @type {Chat} */
		this.chat = null;
		/** @type {Avessy} */
		this.avessy = null;
		/** @type {CommandLine} */
		this.cmd = null;
	}
	init(container) {
		this.container = container;
		this.pokiwrap = new PokiWrap();
		this.network = new Network();
		this.chat = new Chat();
		this.avessy = new Avessy("bb#avessychat");
		this.cmd = new CommandLine();

		return this;
	}

	async load() {
		this.page("loading");
		//await this.pokiwrap.load();
		//this.pokiwrap.confirm_loading();
		this.page("greet");

		return this;
	}

	run() {
		this.network.init().run((leader, lobby) => {
			log("Poki netlib connected to lobby");
			this.chat.onlobby(lobby);
			this.page("chat");
		});

		this.chat.init(this.container.querySelector("#chat"), this.network);
		this.chat.run();
		this.avessy.events.on("commit", ({ text }) => {
			log("[stash]/app.js]:", `Sending msg:\n"${text}"`);
			this.chat.send(text);
		});
		this.avessy.events.on("command", ({ text }) => {
			log("", "[stash]/app.js]:", `cmd-in]: "${text}"`);
			this.chat.print("$ > " + text, ["smaller", "faded", "gapped"]);
			let cmd = text;
			while(cmd && cmd != "xxx") {
				cmd = this.cmd.command(cmd);
				log("", "[stash]/app.js]:", `cmd-out]: "${cmd}"`);
				this.chat.cmd(cmd, ["smaller", "faded"]);
			}
		});
		const command = (cmd, text) => {
			switch(cmd) {
				case "send":
					this.chat.send(text.slice(text.indexOf(".$>")));
					return "yyy"
			}

			return "xxx";
		}
		this.chat.events.on("cmd", ({ text }) => {
			log("", "[stash]/app.js]:", `chat cmd]: "${text}"`);
			const cmd = text.slice(3, text.indexOf(".$>"));
			if (this.cmd.command(text) === cmd) {
				log("", "[stash]/app.js]:", `chat cmd passed]: "${cmd}", "${text}"`);
				this.chat.cmd(command(cmd, text), ["smaller", "faded"]);
			}
		});

		return this;
	}

	page(id) {
		const activepage = this.container.querySelector("bb.page.active");
		if (activepage) {
			activepage.classList.remove("active", "fullscreen");
		}

		const page = this.container.querySelector(`bb#${id}.page`);
		if (page) {
			page.classList.add("active");
		}
	}

	fullscreen() {
		if (window.location.hash.includes("fullscreen")) {
			const activepage = this.container.querySelector("bb.page.active");
			activepage?.classList.add("fullscreen");
		}
	}
}

function log(...msg) {
	console.log(...msg);
}

export default App;
