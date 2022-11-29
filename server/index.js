const http = require("http");
const { readFileSync, existsSync } = require("fs");

const generateCanvas = require("./generateCanvas");
const extractImageFromGoogleSearchQuery = require("./extractImageFromSearch");

const PORT = process.env.PORT || 8080;

class Params {
  constructor(query, prompt, pos) {
    this.prompt = prompt;
    this.query = query;
    this.pos = pos;
  }
}

const mimes = {
  css: "text/css",
  html: "text/html",
  json: "application/json",
  js: "text/javascript"
};

function sendJsonErr(json, res, code) {
  res.writeHead(code, { "Content-Type": mimes.json });
  res.end( JSON.stringify({ error: json }), "utf8");
}

function paramsIfParamsValid(url) {
  const req_params = new URLSearchParams(url.split("?").pop());
  const query = [
    req_params.get("query"),
    req_params.get("prompt"),
    req_params.get("pos"),
  ]
  const isValid = query.every((e) => e ?? false);

  return isValid ? new Params(...query) : false;
}

const server = http.createServer((req, res) => {
    const mime = mimes[req.url.split(".").pop()];

    if (mime) {
      res.writeHead(200, { "Content-Type": mime });
      const pubFilePath = `./public/${req.url.split("/").pop()}`;

      if (existsSync(pubFilePath)) {
        res.end(readFileSync(pubFilePath), "utf8");
      } else {
        res.statusCode = 404;
        res.end(readFileSync("./views/404.html"), "utf8");
      }
    } else if (req.url === "/" || req.url === "/index.html" || req.url === "/index") {
      res.end(readFileSync("./views/index.html"), "utf8");
    } else if (req.url.startsWith("/new")) {
      const params = paramsIfParamsValid(req.url);

      if (!params) {
        sendJsonErr({"error": "invalid or insufficient params!"}, res, 400)
      } else {
        extractImageFromGoogleSearchQuery(params.query, {})
          .then(async (imageLink) => {
            const canvas = await generateCanvas(params, imageLink);
            const img_buffer = canvas.toBuffer("image/png");
            res.writeHead(200, { "Content-Type": "image/png"});
            res.end(img_buffer, "binary");
          })
          .catch((_) => {
            sendJsonErr({ error: "image could not be extracted" }, res, 502)
          });
      }
   } else {
      res.statusCode = 404;
      res.end(readFileSync("./views/404.html"), "utf8");
   }
  })

server.listen(PORT);

console.log("Server listening on port", PORT);
