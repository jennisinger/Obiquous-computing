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
  window.location.href = "room.html";
});

arBtn.addEventListener("touchstart", () => {
  if (!buttonVisible) return;
  window.location.href = "room.html";
});
