import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function markActiveLink(block) {
  const currentPath = window.location.pathname.replace(/\.html$/, '') || '/';
  block.querySelectorAll('a[href]').forEach((link) => {
    const destination = new URL(link.href, window.location);
    const linkPath = destination.pathname.replace(/\.html$/, '') || '/';
    const matchesHash = !destination.hash || destination.hash === window.location.hash;
    if (linkPath === currentPath && matchesHash) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function addPageNavigation(block) {
  if (block.querySelector('a[href]')) return;
  const label = document.createElement('p');
  label.textContent = 'Creative workspace';
  const list = document.createElement('ul');
  document.querySelectorAll('main h1, main h2').forEach((heading) => {
    if (!heading.textContent.trim() || heading.closest('dialog')) return;
    if (!heading.id) {
      heading.id = heading.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    item.append(link);
    list.append(item);
  });
  if (!list.children.length) {
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'asset-library';
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${main?.id || 'asset-library'}`;
    link.textContent = 'Asset library';
    item.append(link);
    list.append(item);
  }
  block.append(label, list);
}

/**
 * Loads the shared, authored sidebar fragment and decorates the app navigation.
 * @param {Element} block The sidebar block element
 */
export default async function decorate(block) {
  const sidebarMeta = getMetadata('sidebar');
  const sidebarPath = sidebarMeta ? new URL(sidebarMeta, window.location).pathname : '/sidebar';
  const fragment = await loadFragment(sidebarPath);

  block.textContent = '';
  if (fragment) block.append(...fragment.childNodes);

  addPageNavigation(block);
  markActiveLink(block);

  const toggle = document.createElement('button');
  toggle.className = 'site-sidebar-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'site-sidebar');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open workspace navigation');
  toggle.title = 'Open workspace navigation';
  const image = document.createElement('img');
  image.src = `${window.hlx?.codeBasePath || ''}/icons/menu.svg`;
  image.alt = '';
  toggle.append(image);
  const sidebar = block.closest('.site-sidebar');
  const desktop = window.matchMedia('(min-width: 900px)');
  const setExpanded = (expanded) => {
    document.body.classList.toggle('sidebar-open', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Close' : 'Open'} workspace navigation`);
    toggle.title = toggle.getAttribute('aria-label');
    if (sidebar) sidebar.inert = !desktop.matches && !expanded;
  };
  toggle.addEventListener('click', () => {
    const expanded = !document.body.classList.contains('sidebar-open');
    setExpanded(expanded);
    if (expanded) block.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      setExpanded(false);
      toggle.focus();
    }
  });

  block.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    block.querySelectorAll('a').forEach((entry) => {
      entry.classList.remove('active');
      entry.removeAttribute('aria-current');
    });
    link.classList.add('active');
    link.setAttribute('aria-current', 'location');
    setExpanded(false);
  }));

  desktop.addEventListener('change', () => setExpanded(false));
  setExpanded(false);
  sidebar?.before(toggle);
}
