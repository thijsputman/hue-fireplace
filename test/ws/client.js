var exampleSocket = new WebSocket("ws://localhost:8099");

document.body.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    exampleSocket.close();
  }
});

var reader = new FileReader();
reader.addEventListener("loadend", function() {
  const colours = new Uint8Array(reader.result);

  const frame = document.getElementById("colourFrame");

  frame.style.backgroundColor =
    "rgb(" + colours[0] + "," + colours[1] + "," + colours[2] + ")";
});

exampleSocket.onmessage = event => {
  reader.readAsArrayBuffer(event.data);
};
