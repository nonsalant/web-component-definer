const file = new URL(import.meta.url).searchParams.get("file");
const modulePath = `./${file}.js`;

const definedName = new URL(import.meta.url).searchParams.get("define");
const webComponentClassName = toPascalCase(file);

import(modulePath).then((module) => {
    // Dynamically access the class using the webComponentClassName variable
    const WebComponentClass = module[webComponentClassName];

    // Modified from: https://til.jakelazaroff.com/html/define-a-custom-element/
    class WebComponent extends WebComponentClass {
        static tag = file;
        
        static {
            const tag = definedName || this.tag;
            if (tag !== "false") this.define(tag);
        }

        static define(tag = this.tag) {
            this.tag = tag;

            const name = customElements.getName(this);
            if (name) return console.warn(`${this.name} already defined as <${name}>!`);

            const ce = customElements.get(tag);
            if (Boolean(ce) && ce !== this) return console.warn(`<${tag}> already defined as ${ce.name}!`);

            customElements.define(tag, this);
        }
    }
}).catch(err => { console.error('Failed to load module:', err); });

function toPascalCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}