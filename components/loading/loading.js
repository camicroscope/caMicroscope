class Loading {
  static #instance = null;
  static #textElement = null;
  static #previousParentPosition = '';

  static open(parentNode, text = 'Loading...', zIndex = 999) {
    if (!Loading.#instance) Loading.#instance = Loading.#createInstance();
    if (parentNode !== Loading.#instance.parentNode) Loading.close();
    Loading.#instance.style.zIndex = zIndex;
    Loading.#textElement.textContent = text;
    Loading.#previousParentPosition = parentNode.style.position;
    parentNode.style.position = 'absolute';
    parentNode.appendChild(Loading.#instance);
  }

  static #createInstance() {
    const cover = document.createElement('div');
    cover.classList.add('cover');

    const block = document.createElement('div');
    block.classList.add('block');

    const text = document.createElement('span');
    Loading.#textElement = text;

    const bar = document.createElement('div');
    bar.classList.add('bar');

    block.appendChild(text);
    block.appendChild(bar);
    cover.appendChild(block);

    return cover;
  }

  static close() {
    if (!Loading.#instance || !Loading.#instance.parentNode) return;
    Loading.#instance.parentNode.style.position = Loading.#previousParentPosition;
    Loading.#instance.parentNode.removeChild(Loading.#instance);
  }
}
