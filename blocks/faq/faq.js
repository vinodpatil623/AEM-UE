import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [questionCell, answerCell] = [...row.children];
    if (!questionCell || !questionCell.textContent.trim()) return;
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    moveInstrumentation(row, details);
    moveInstrumentation(questionCell, summary);
    const question = questionCell.children.length === 1 && questionCell.firstElementChild.tagName === 'P'
      ? questionCell.firstElementChild : questionCell;
    if (question !== questionCell) moveInstrumentation(question, summary);
    summary.append(...question.childNodes);
    details.append(summary);
    if (answerCell) {
      answerCell.classList.add('faq-answer');
      details.append(answerCell);
    }
    row.replaceWith(details);
  });
}
