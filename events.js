/**
 * @typedef {EventListenerDetails}
 * @property {function(any): void} callback .
 * @property {string} name .
 * @property {HTMLElement} node .
 */

class Events {
    constructor() {
        /** @type {HTMLElement} */
        this.core = null;
        this.guids = 0;
        this.list = {};
        this.clist = {};
    }

    init() {
        
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {function(any): void} callback 
     * @param {any?} bind 
     * @returns {number} event id
     */
    on(name, callback, bind) {
        const guid = this.guids++;
        let _callback = null;
        if (bind) {
            _callback = ((detail) => callback(detail).bind(bind));
        } else {
            _callback = ((detail) => callback(detail));
        }
        const event =  { callback: _callback, name, guid };

        let list = this.list[name];
        if (!list) {
            list = this.list[name] = {};
        }
        list[guid] = event;
        this.clist[guid] = event;

        return guid;
    }

    /**
     * 
     * @param {string} id event id
     */
    off(id) {
        const event = this.clist[id];
        if (!event) {
            return;
        }

        delete list[event.name][id];
        delete this.clist[id]
    }

    /**
     * 
     * @param {string} name 
     * @param {any?} detail 
     */
    emit(name, detail) {
        const list = this.list[name];
        if (!list) {
            throw new Error("No listeners for this event.");
        }

        for(const id in list) {
            const event = list[id];
            event.callback(detail);
        }
        this.core.dispatchEvent(new CustomEvent(name, { detail }));
    }

    dispose() {
        for(const guid in this.clist) {
            this.off(guid);
        }
    }
}

export default Events;