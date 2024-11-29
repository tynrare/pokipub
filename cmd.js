const __pass__ = 0xb00ba;	

class CommandLine {
	constructor() {
		this.__pass__ = __pass__;
	}

    command(text) {
        if (text.startsWith(".?")) {
            return this.command_help(text);
        } else if (text.startsWith(".$")) {
            return this.command_set(text);
        } else if (text.startsWith(":$>") && text.includes(`.$>${this.__pass__}`)) {
		return text.slice(3, text.indexOf(".$>"));
	} else {
	    //console.log("[stash]/cmd.js]:", "Unknown command.");
        }

	    console.log("[stash]/cmd.js]:", `Incorrect command.\n"${text}"`);
        return "xxx";
    }

    command_set(text) {
	    const t = `.$>${this.__pass__}`;
	    if (!text.startsWith(t)) {
		    return "Wrong pass";
	    }

	    const c = text.slice(t.length);

	    if (c.startsWith(":$>")) {
		    return c + t;
	    }

	    return "xxx";
    }

    command_help(text) {
        switch(text) {
            case ".?help":
                return "this is help command";
        }

        return "Type .?help for full list."
    }
}

export default CommandLine;
