const load = new URL(import.meta.url).searchParams.get('load');
const items = cleanItems(load.split(','));

items.forEach((item) => {

    let [modulePath, definedName] = item.split('|');
    modulePath = addBasePath(modulePath);
    modulePath = addJsExtension(modulePath);

    const filename = extractFilename(modulePath);
    const webComponentClassName = toPascalCase(filename);

    const isNotExternal = !modulePath.includes('://');

    if (isNotExternal) modulePath = processLocalPath(modulePath);

    import(modulePath).then((module) => {
        // Dynamically access the class using the webComponentClassName variable
        const WebComponentClass = module[webComponentClassName];

        // Modified from: https://til.jakelazaroff.com/html/define-a-custom-element/
        class WebComponent extends WebComponentClass {
            static tag = filename;

            static {
                const tag = definedName || this.tag;
                if (tag !== 'false') this.define(tag);
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

function cleanItems(arr) {
    return arr
        .map(item => item.trim()) // Trim each item
        .filter(item => item);    // Filter out empty strings
}

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

function addJsExtension(str) {
    return str.endsWith('.js') ? str : `${str}.js`;
}

function addBasePath(modulePath) {
    if (modulePath.includes('://')) {
        return modulePath; // don't add to external URLs
    }
    const basePath = new URL(import.meta.url).searchParams.get('base')?.trim();
    return basePath ? `${basePath}/${modulePath}` : modulePath;
}

// Function to compute the relative path between the current module and the page calling it
function processLocalPath(modulePath) {
    const moduleURL = new URL(import.meta.url);
    const currentPageURL = new URL(window.location.href);

    // Get the directory paths of both the current module and the current page
    const fromPath = moduleURL.pathname.split('/').slice(0, -1).join('/') || '/';
    const toPath = currentPageURL.pathname.split('/').slice(0, -1).join('/'); // Page's directory path

    const toParts = toPath.split('/'); // Normal directory split for the page

    // If the paths are the same (module and page are in the same directory)
    if (fromPath === toPath) {
        return `./${modulePath}`;
    }

    // Calculate how many levels to go up (if the module is deeper than the page)
    const relativePathParts = [];

    // Append the remaining path segments of the current page
    for (let j = 0; j < toParts.length; j++) {
        relativePathParts.push(toParts[j]);
    }

    // Return the final relative path by joining the parts with the modulePath
    return `${relativePathParts.join('/')}/${modulePath}`;
}
