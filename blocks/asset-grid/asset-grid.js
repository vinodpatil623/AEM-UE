/**
 * Adds stable styling hooks to the authored asset-card rows.
 * @param {Element} block The asset grid block element
 */
export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('asset-card');
    const [media, content, action] = card.children;
    media?.classList.add('asset-card-media');
    content?.classList.add('asset-card-content');
    action?.classList.add('asset-card-action');
  });
}
