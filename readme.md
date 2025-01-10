# Web Component Definer

## Live test
https://web-component-definer.netlify.app/

## Usage

Include the `web-component.js` script with a `?file=` query string parameter for the web component filename (without the js extension) you wish to define.

```html
<script src="./web-component.js?file=my-component" type="module"></script>
```

The example above will load the `<my-component>` from the `my-component.js` file and define it.

The example above assumes the `my-component.js` file exports a `MyComponent` class.

```javascript
export class MyComponent extends HTMLElement { ... }
```

There's no need to do this anymore:

```javascript
customElements.define('my-component', MyComponent);
```

You can also rename the web component tag name by adding a `?define=` query string parameter:

```html
<script src="./web-component.js?file=my-component&define=renamed-component" type="module"></script>
```

The example above will load the component from the `my-component.js` file and define it as `<renamed-component>`

## Example with multiple components

```html
<script src="./web-component.js?file=my-component" type="module"></script>
<script src="./web-component.js?file=my-other-component" type="module"></script>
<script src="./web-component.js?define=renamed-component&file=my-component" type="module"></script>

<my-component></my-component>
<my-other-component></my-other-component>
<renamed-component></renamed-component>
```

## Credits
Based on: https://til.jakelazaroff.com/html/define-a-custom-element/ by [Jake Lazaroff](https://bsky.app/profile/jakelazaroff.com)