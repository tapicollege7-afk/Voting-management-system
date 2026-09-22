/**
 * Smart Enter-Key Form Field Navigator
 * When the user presses Enter in any input field:
 * - Automatically moves focus to the next visible, editable field.
 * - If on the last field, triggers form submission.
 * - Adds a smooth glowing ripple/pulse to the newly focused field.
 */
export function handleEnterKeyNavigation(e) {
  if (e.key !== 'Enter') return;
  
  // Do not intercept if Shift+Enter is pressed (e.g. for multi-line textareas)
  if (e.shiftKey) return;

  const target = e.target;
  if (!target || target.tagName === 'BUTTON' || target.type === 'submit') return;

  const form = target.closest('form');
  if (!form) return;

  // Retrieve all valid, enabled, visible interactive input controls
  const focusable = Array.from(
    form.querySelectorAll(
      'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])'
    )
  ).filter(el => {
    return el.offsetParent !== null && window.getComputedStyle(el).display !== 'none';
  });

  const currentIndex = focusable.indexOf(target);

  if (currentIndex > -1 && currentIndex < focusable.length - 1) {
    e.preventDefault();
    const nextEl = focusable[currentIndex + 1];
    nextEl.focus();
    if (typeof nextEl.select === 'function' && nextEl.type !== 'date') {
      nextEl.select();
    }
    // Add visual glowing focus cue
    nextEl.classList.add('input-enter-highlight');
    setTimeout(() => {
      nextEl.classList.remove('input-enter-highlight');
    }, 600);
  }
  // If currentIndex === focusable.length - 1, we allow default behavior so the form naturally submits!
}
