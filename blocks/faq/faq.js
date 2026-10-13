function toggleItem(question, answer, forceExpanded) {
  const expanded = forceExpanded ?? question.getAttribute('aria-expanded') !== 'true';
  question.setAttribute('aria-expanded', String(expanded));
  answer.hidden = !expanded;
}

/**
 * Turns authored FAQ rows into accessible disclosure widgets.
 * @param {Element} block The FAQ block element
 */
export default function decorate(block) {
  [...block.children].forEach((item, index) => {
    item.classList.add('faq-item');
    const [question, answer] = item.children;
    if (!question || !answer) return;

    const answerId = `faq-answer-${index + 1}`;
    question.classList.add('faq-question');
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-controls', answerId);

    answer.id = answerId;
    answer.classList.add('faq-answer');
    toggleItem(question, answer, false);

    question.addEventListener('click', () => toggleItem(question, answer));
    question.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleItem(question, answer);
      }
    });
  });
}
