import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function markActiveLink(block) {
  const currentPath = window.location.pathname.replace(/\.html$/, '') || '/';
  block.querySelectorAll('a[href]').forEach((link) => {
    const linkPath = new URL(link.href, window.location).pathname.replace(/\.html$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
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

  markActiveLink(block);

  const toggle = document.createElement('button');
  toggle.className = 'sidebar-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'site-sidebar');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open workspace navigation');
  toggle.textContent = 'Menu';
  toggle.addEventListener('click', () => {
    const expanded = document.body.classList.toggle('sidebar-open');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Close' : 'Open'} workspace navigation`);
  });

  block.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  block.prepend(toggle);
}
