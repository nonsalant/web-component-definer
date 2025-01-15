const load = new URL(import.meta.url).searchParams.get("load");
const items = load.split(',').filter(Boolean); // allow trailing commas

items.forEach((item) => {
    item = item.trim(); // allow spaces or newlines after commas
    const [modulePath, definedName] = item.split(':');
    const filename = extractFilename(modulePath);
    const webComponentClassName = toPascalCase(filename);

    const isExternal = modulePath.startsWith('http://') || modulePath.startsWith('https://');
    const importPath = isExternal ? modulePath : new URL(modulePath, import.meta.url).href;

    import(importPath).then((module) => {
        // Dynamically access the class using the webComponentClassName variable
        const WebComponentClass = module[webComponentClassName];

        // Modified from: https://til.jakelazaroff.com/html/define-a-custom-element/
        class WebComponent extends WebComponentClass {
            static tag = filename;

            static {
                const tag = definedName || this.tag;
                if (tag !== "false") this.define(tag);
            }

            static define(tag = this.tag) {
                this.tag = tag;

                const name = customElements.getName(this);
                if (name) return console.warn(`${this.name} already defined as <${name}>!`);

                const ce = customElements.get(tag);
                if (Boolean(ce) && ce !== this) return console.warn(`<${tag}> already defined!`);

                customElements.define(tag, this);
            }
        }
    }).catch(err => { console.error(err); });

});

// utils

function toPascalCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function extractFilename(filePath) {
    const withExtension = filePath.split('/').pop();
    return withExtension.replace('.js', '');
}