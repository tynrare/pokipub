
class CommandLine {
    command(text) {
        if (text.startsWith(".?")) {
            return this.command_help(text);
        } else if (text.startsWith(".$")) {
        } else {
            return "Incorrect command.";
        }

        return "Unknown command";
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