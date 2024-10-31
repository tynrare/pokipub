import Network from "./network.js";

main();

function main() {
    const network = new Network();
    network.init().run((leader, lobby) => {
        log("Poki netlib connected to lobby");
    });
}


function log(...msg) {
    console.log(...msg)
}