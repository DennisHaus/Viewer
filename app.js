const message = document.createElement("div");

message.textContent = "JavaScript funktioniert.";

message.style.position = "fixed";
message.style.top = "20px";
message.style.right = "20px";
message.style.zIndex = "9999";
message.style.padding = "12px 16px";
message.style.background = "#c6d37a";
message.style.color = "#111";
message.style.fontFamily = "Arial, sans-serif";
message.style.fontSize = "14px";

document.body.appendChild(message);

const playButton = document.getElementById("playButton");

if (playButton) {
  playButton.addEventListener("click", () => {
    message.textContent = "Der PLAY-Button funktioniert.";
  });
}
