const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require('path');

const config = require("./config.js");

const CANV_W = 640
const CANV_H = 360

module.exports = async function(params, url) {
  const cnv_img = await loadImage(url);

  registerFont("./impact.ttf", { family: "Impact" });

  // FIXME: Clean [and rename] this pile here
  const c_height = CANV_H;
  const c_width = CANV_W;

  const canvas = createCanvas(
    c_width, 
    c_height
  );

  const ctx = canvas.getContext("2d");

  const FNT_SIZE = config?.imgFontSize ?? 20;

  ctx.font = `bold ${FNT_SIZE}px Impact`;
  ctx.textBaseline = "middle";

  // Make the excess background black
  ctx.fillStyle = "#191919";
  ctx.fillRect(0, 0, c_width, c_height);

  ctx.drawImage(cnv_img, 
    cnv_img.naturalWidth > CANV_W ? 0 : c_width/2 - cnv_img.width/2,
    cnv_img.naturalHeight > CANV_H ? 0 : c_height/2 - cnv_img.height/2,
    cnv_img.naturalWidth > CANV_W ? CANV_W : cnv_img.naturalWidth,
    cnv_img.naturalHeight > CANV_H ? CANV_H : cnv_img.naturalHeight
  );

  ctx.textAlign = "center";

  let x_pos = c_width / 2;
  let y_pos = c_height;
  let t_padding = 10;

  let words = params.prompt.split(' ')
  let CHUNK_LENGTH = 8;
  let parsedText = "";

  for (let i = 0; i < words.length; i++) {
    parsedText += (i % CHUNK_LENGTH === 0 ? "\n" : " ") + words[i]
  }

  for (let p of params.pos.split(" ")) {
    switch (p) {
      case "center":
        y_pos = c_height / 2;
        ctx.textBaseline = "middle";
        break;
      case "top":
        y_pos = t_padding;
        break;
      case "bottom":
        y_pos = c_height - (FNT_SIZE * (Math.floor(words.length / CHUNK_LENGTH) + 2) + t_padding);
        break;
    }
  }

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.strokeText(parsedText, x_pos, y_pos);
  ctx.fillStyle = 'white';
  ctx.fillText(parsedText, x_pos, y_pos);

  return canvas;
}
