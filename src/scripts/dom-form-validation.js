export default function validate(form) {
  form
    .querySelectorAll('.error')
    .forEach((errorDiv) => errorDiv.classList.add('hidden'));
  form.querySelectorAll('input').forEach((input) => {
    if (!input.checkValidity()) {
      const errorDiv = form.querySelector(`#${input.id}+.error`);
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = input.validationMessage;
    }
  });
  return form.checkValidity();
}
