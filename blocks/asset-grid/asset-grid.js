const storageKey = 'eds-creative-hub-saved-v1';
let savedAssets = new Set();

function icon(name) {
  const image = document.createElement('img');
  image.src = `${window.hlx?.codeBasePath || ''}/icons/${name}.svg`;
  image.alt = '';
  image.width = 20;
  image.height = 20;
  return image;
}

function tool(label, name) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.append(icon(name));
  return button;
}

export default function decorate(block) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) savedAssets = new Set(stored.filter((value) => typeof value === 'string'));
  } catch { /* Saves remain available for this visit when storage is unavailable. */ }

  const dialog = document.createElement('dialog');
  dialog.className = 'asset-preview';
  dialog.setAttribute('aria-label', 'Asset preview');
  const close = tool('Close asset preview', 'x');
  close.className = 'asset-preview-close';
  close.addEventListener('click', () => dialog.close());
  const previewImage = document.createElement('img');
  previewImage.className = 'asset-preview-image';
  const previewTitle = document.createElement('h2');
  const previewDescription = document.createElement('p');
  const original = document.createElement('a');
  original.className = 'asset-original';
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  original.append('Open original', icon('arrow-up-right'));
  dialog.append(close, previewImage, previewTitle, previewDescription, original);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });

  const announce = () => block.dispatchEvent(new CustomEvent('assets:updated', { bubbles: true }));

  [...block.children].forEach((card) => {
    card.classList.add('asset-card');
    const [media, content, action] = card.children;
    media?.classList.add('asset-card-media');
    content?.classList.add('asset-card-content');
    action?.classList.add('asset-card-action');

    const image = media?.querySelector('img');
    const title = content?.firstElementChild?.textContent.trim() || image?.alt || 'Untitled asset';
    const description = content?.children[1]?.textContent.trim() || '';
    const category = content?.children[2]?.textContent.trim() || 'Uncategorized';
    const link = action?.querySelector('a[href]');
    const key = image?.getAttribute('src') || link?.getAttribute('href') || title;
    card.dataset.assetKey = key;
    card.dataset.assetTitle = title;
    card.dataset.assetCategory = category;
    card.dataset.saved = String(savedAssets.has(key));

    const actions = document.createElement('div');
    actions.className = 'asset-card-tools';
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'asset-preview-button';
    preview.textContent = 'Preview';
    preview.setAttribute('aria-label', `Preview ${title}`);
    preview.disabled = !image;
    preview.addEventListener('click', () => {
      previewImage.src = image.currentSrc || image.src;
      previewImage.alt = image.alt || title;
      previewTitle.textContent = title;
      previewDescription.textContent = description;
      const destination = new URL(link?.href || image.src, window.location);
      original.hidden = !['https:', 'http:'].includes(destination.protocol);
      if (!original.hidden) original.href = destination.href;
      dialog.showModal();
    });

    const save = tool(`Save ${title}`, 'star');
    save.className = 'asset-save';
    save.setAttribute('aria-pressed', card.dataset.saved);
    save.addEventListener('click', () => {
      if (savedAssets.has(key)) savedAssets.delete(key);
      else savedAssets.add(key);
      document.querySelectorAll('.asset-grid .asset-card').forEach((entry) => {
        entry.dataset.saved = String(savedAssets.has(entry.dataset.assetKey));
        entry.querySelector('.asset-save')?.setAttribute('aria-pressed', entry.dataset.saved);
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify([...savedAssets]));
      } catch { /* Private browsing may disallow persistent saves. */ }
      announce();
    });
    actions.append(preview, save);
    card.append(actions);
  });
  block.append(dialog);
  announce();
}
