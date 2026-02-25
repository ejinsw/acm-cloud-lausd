function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[&<>"']/g, match => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[match];
  });
}

module.exports = {
  sanitizeInput,
};
