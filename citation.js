(() => {
  const button = document.getElementById('copy-citation');
  const code = document.getElementById('citation-bibtex');
  const status = document.getElementById('citation-status');
  if (!button || !code || !status) return;

  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(code.textContent.trim());
      status.textContent = 'Copied to clipboard.';
    } catch {
      status.textContent = 'Please select and copy the citation below.';
    } finally {
      button.disabled = false;
    }
  });
})();
