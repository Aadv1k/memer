const https = require("https");
const http = require("http");
const { readFileSync } = require("fs");

const generateCanvas = require("./generateCanvas");
const extractImageFromGoogleSearchQuery = require("./extractImageFromGoogleSearchQuery");

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

http
  .createServer((req, res) => {
    const mime = mimes[req.url.split(".").pop()];

    if (mime) {
      res.writeHead(200, { "Content-Type": mime });
      res.end(readFileSync(`./public/${req.url.split("/").pop()}`), "utf8");
    } else if (req.url == "/") {
      res.end(readFileSync("./views/index.html"), "utf8");
    } else if (req.url.startsWith("/new")) {
      const req_params = new URLSearchParams(req.url.split("?").pop());
      const query = [
        req_params.get("query"),
        req_params.get("prompt"),
        req_params.get("pos"),
      ];

      if (!query.every((e) => e ?? false)) {
        res.writeHead(400, { "Content-Type": mimes.json });
        res.end(
          JSON.stringify({ error: "invalid or insufficient params!" }),
          "utf8"
        );
      } else {
        const params = new Params(...query);

        extractImageFromGoogleSearchQuery(params.query, {})
          .then(async (imageLink) => {
            const canvas = await generateCanvas(params, imageLink);
            const img_buffer = canvas.toBuffer("image/png");
            console.log(imageLink);
            res.writeHead(200, { "Content-Type": "image/png"});
            res.end(img_buffer, "binary");
          })
          .catch((_) => {
            res.end(
              JSON.stringify({ error: "image could not be extracted" }),
              "utf8"
            );
          });
      }
    } else {
      //res.end(readFileSync('./pages/404.html'), "utf8");
    }
  })
  .listen(process.env.PORT || 8080);

console.log("Server listening on port", process.env.PORT || 8080);
