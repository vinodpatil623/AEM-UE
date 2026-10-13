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

  const filterAssets = () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll('.asset-grid .asset-card').forEach((card) => {
      card.hidden = Boolean(query) && !card.textContent.toLowerCase().includes(query);
    });
  };

  input.addEventListener('input', filterAssets);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filterAssets();
  });

  form.append(input, button);
  block.prepend(form);
}
