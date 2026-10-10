export default function decorate(block) {
  const picture = block.querySelector('picture');
  block.classList.toggle('has-image', Boolean(picture));
  if (picture) picture.classList.add('hero-media');
  [...block.children].forEach((row) => {
    row.classList.add('hero-row');
    [...row.children].forEach((cell) => {
      cell.classList.add(cell.contains(picture) ? 'hero-media-cell' : 'hero-content');
      if (cell.contains(picture)
        && [...cell.children].some((child) => !child.contains(picture) && child !== picture)) {
        cell.classList.add('hero-content');
      }
    });
  });
}
