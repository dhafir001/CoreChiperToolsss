const placeholderBoxes = document.querySelectorAll(".placeholder-box");

placeholderBoxes.forEach((box, index) => {
  box.style.animation = `rise 450ms ease ${index * 100}ms both`;
});
