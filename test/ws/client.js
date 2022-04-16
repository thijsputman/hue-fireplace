var exampleSocket = new WebSocket("ws://localhost:8099");

document.body.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    exampleSocket.close();
  }
});

document.getElementById("controls").addEventListener("click", e => {
  if (e.target.tagName == "BUTTON") {
    let request;
    switch (e.target.id) {
      case "stop":
        request = new Request("http://localhost:9000/hue-fireplace/stop");
        break;
      case "start":
        request = new Request("http://localhost:9000/hue-fireplace/start");
        break;
      case "abort":
        exampleSocket.close();
        break;
    }
    if (request) {
      fetch(request);
    }
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
