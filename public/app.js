console.log('hello biatch');

const form = document.getElementById('queryForm');

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => binary += String.fromCharCode(b));

  return window.btoa(binary);
};

function loadSpinner() {
  document.getElementById('tryItBlock').innerHTML = `<div id="loading"></div>`
}

function removeSpinner() {
  document.getElementById('tryItBlock').innerHTML = ``
}

function showCode(code) {
  document.getElementById('tryItBlock').innerHTML = '';
  const target = document.getElementById('tryItBlock')
  const ctx = document.createElement('code')
  ctx.classList.add('try-it__code');
  ctx.innerText = code;
  target.appendChild(ctx);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const pos = form.elements["frmPos"].value;
  const query = form.elements["frmQuery"].value;
  const text = form.elements["frmText"].value;

  loadSpinner();

  fetch(`/new?` + new URLSearchParams({
    query: query,
    prompt: text,
    pos: pos
  })).then(async (image) => {
    removeSpinner();
    const buffer = await image.arrayBuffer();
    var base64Flag = 'data:image/jpeg;base64,';
    var imageStr = arrayBufferToBase64(buffer);

    const img = document.createElement('img')
    img.src = base64Flag + imageStr;
    img.classList.add("try-it__image")
    document.getElementById('tryItBlock').appendChild(img);
  }).catch((err) => {
    console.log(err);
    showCode(err);
  });
})
