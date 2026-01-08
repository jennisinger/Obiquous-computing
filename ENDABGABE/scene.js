const marker = document.querySelector("#marker");
const arBtn = document.querySelector("#ar-button");

let buttonVisible = false;


marker.addEventListener("markerFound", () => {
  arBtn.style.display = "block";
  buttonVisible = true;
});


marker.addEventListener("markerLost", () => {
  arBtn.style.display = "none";
  buttonVisible = false;
});


arBtn.addEventListener("click", () => {
  if (!buttonVisible) return;
  alert("🎉 Start gedrückt!");
});

arBtn.addEventListener("touchstart", () => {
  if (!buttonVisible) return;
  alert("🎉 Start gedrückt!");
});

