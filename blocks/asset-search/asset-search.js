/**
 * Builds a client-side search control for asset cards on the current page.
 * @param {Element} block The asset search block element
 */
export default function decorate(block) {
  const configRows = [...block.children];
  const placeholder = configRows[0]?.textContent.trim() || 'Search assets';
  const buttonLabel = configRows[1]?.textContent.trim() || 'Search';
  configRows.forEach((row) => { row.hidden = true; });

  const form = document.createElement('form');
  form.className = 'asset-search-form';
  form.setAttribute('role', 'search');

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'assets';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = buttonLabel;

  const controls = document.createElement('div');
  controls.className = 'asset-search-controls';
  const category = document.createElement('select');
  category.setAttribute('aria-label', 'Filter by asset type');
  const sort = document.createElement('select');
  sort.setAttribute('aria-label', 'Sort assets');
  [['original', 'Original order'], ['name', 'Name A-Z']].forEach(([value, text]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    sort.append(option);
  });
  const savedLabel = document.createElement('label');
  savedLabel.className = 'asset-search-saved';
  const saved = document.createElement('input');
  saved.type = 'checkbox';
  savedLabel.append(saved, 'Saved assets only');
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'asset-search-reset';
  reset.setAttribute('aria-label', 'Clear search and filters');
  reset.title = 'Clear search and filters';
  const resetIcon = document.createElement('img');
  resetIcon.src = `${window.hlx?.codeBasePath || ''}/icons/x.svg`;
  resetIcon.alt = '';
  reset.append(resetIcon);
  controls.append(category, sort, savedLabel, reset);

  const status = document.createElement('p');
  status.className = 'asset-search-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const filterAssets = () => {
    if (!block.isConnected) return;
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;
    const cards = [...document.querySelectorAll('.asset-grid .asset-card')];
    const types = [...new Set(cards.map((card) => card.dataset.assetCategory || 'Uncategorized'))].sort();
    const selection = category.value;
    if (category.dataset.types !== JSON.stringify(types)) {
      category.replaceChildren();
      ['', ...types].forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value || 'All asset types';
        category.append(option);
      });
      category.value = types.includes(selection) ? selection : '';
      category.dataset.types = JSON.stringify(types);
    }
    const ordered = sort.value === 'name'
      ? [...cards].sort((first, second) => (
        first.dataset.assetTitle.localeCompare(second.dataset.assetTitle)
      ))
      : cards;
    cards.forEach((card) => {
      const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
      const matchesType = !category.value || card.dataset.assetCategory === category.value;
      const matchesSaved = !saved.checked || card.dataset.saved === 'true';
      card.hidden = !matchesQuery || !matchesType || !matchesSaved;
      card.style.order = ordered.indexOf(card);
      if (!card.hidden) visibleCount += 1;
    });
    status.textContent = visibleCount
      ? `${visibleCount} asset${visibleCount === 1 ? '' : 's'}${query ? ` matching "${input.value.trim()}"` : ''}`
      : 'No matching assets. Try another search or clear the filters.';
  };

  input.addEventListener('input', filterAssets);
  category.addEventListener('change', filterAssets);
  sort.addEventListener('change', filterAssets);
  saved.addEventListener('change', filterAssets);
  reset.addEventListener('click', () => {
    input.value = '';
    category.value = '';
    sort.value = 'original';
    saved.checked = false;
    filterAssets();
    input.focus();
  });
  document.querySelector('main')?.addEventListener('assets:updated', filterAssets);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filterAssets();
  });

  form.append(input, button);
  block.prepend(form);
  form.after(controls, status);
  filterAssets();
}
