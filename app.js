document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const playButton = document.getElementById("playButton");
  const resetButton = document.getElementById("resetButton");
  const addButton = document.getElementById("addButton");
  const terrainButton = document.getElementById("terrainButton");

  function showMessage(message) {
    status.textContent = message;
    status.style.color = "#c6d37a";
  }

  if (playButton) {
    playButton.addEventListener("click", () => {
      showMessage("PLAY BUTTON WORKS");
      playButton.textContent = "CLICKED";
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      showMessage("RESET BUTTON WORKS");
    });
  }

  if (addButton) {
    addButton.addEventListener("click", () => {
      showMessage("ADD SEDIMENT WORKS");
    });
  }

  if (terrainButton) {
    terrainButton.addEventListener("click", () => {
      showMessage("NEW TERRAIN WORKS");
    });
  }

  showMessage("JAVASCRIPT LOADED");
});
