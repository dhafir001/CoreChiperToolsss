document.querySelectorAll(".tool-card").forEach((card, index) => {
  card.style.animation = `rise 500ms ease ${index * 70}ms both`;
});
