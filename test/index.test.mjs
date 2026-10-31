import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, click } from './helpers.mjs';
import { ImageViewer, validateImageSource } from '../dist/index.js';
let ui;
beforeEach(async () => {
  ui = await setup();
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(async () => ui.cleanup());
test('unsafe image schemes are rejected and gallery controls update the real image', async () => {
  assert.throws(() => validateImageSource('javascript:alert(1)'));
  assert.throws(() => validateImageSource('data:image/svg+xml;base64,abc'));
  await ui.render(
    createElement(ImageViewer, {
      defaultOpen: true,
      images: [
        { src: 'https://example.test/a.png', alt: 'First' },
        { src: 'https://example.test/b.png', alt: 'Second' },
      ],
    }),
  );
  assert.equal(ui.container.querySelector('img').alt, 'First');
  await click(ui.container.querySelector('[aria-label="Next image"]'));
  assert.equal(ui.container.querySelector('img').alt, 'Second');
  await click(ui.container.querySelector('[aria-label="Zoom in"]'));
  assert.match(ui.container.querySelector('img').style.transform, /scale\(1.25\)/);
});
