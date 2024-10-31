
import App from "./app.js";

addEventListener("load", main);

/**
 * @deprecated
 */
async function load() {
    const flip = document.querySelector("bb#flip");
    const source = document.querySelector("db#source");
    const link = source.innerHTML + `?t=${Math.random()}`;
    const content = await fetch(link);
    flip.innerHTML = await content.text();
}

async function main() {
    const container = document.querySelector("bb#app");
    const app = new App();
    app.init(container).load().then(() => app.run());
}