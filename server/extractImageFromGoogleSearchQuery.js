const https = require("https");

const GSTATIC_URL_START = 32;
const GSTATIC_URL_END = 147;

const config = require("./config.js");

const defaultSearchOpts = {
  allowedExtensions: ["png", "jpeg", "jpg"],
  barredSites: [
    "imgflip", // images embedded within canvas elements
    "boredpanda", // loads on the client 
    "generator",
    "create",
    "kapwing",
    "twitter", // too messy
    "reddit",// too messy
    "google",// too messy
    "meme-creator", // links load through javascript
  ],
  keywordGenerics: ["to", "and", "a", "i", "the", "not", "if", "meme", "photo"]
};


function extractImageUrlFromPage(
  pageUrl,
  query,
  keywords
) {

  const allowedExtensions = config?.imgSeachOpts?.searchExtensions ?? defaultSearchOpts.allowedExtensions;
  const generics = config?.imgSearchOpts?.searchKeywordGenerics ?? defaultSearchOpts.keywordGenerics;
  const target = new URL(pageUrl);

  keywords = [
    ...keywords.filter(e => !generics.includes(e.toLowerCase())),
    ...query.split(' ').filter(e => !generics.includes(e.toLowerCase()))
  ]

  console.log(keywords);

  const options = {
    hostname: target.hostname,
    path: target.pathname,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56",
    },
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let rawHtml = "";

      res.on("data", (chunk) => (rawHtml += chunk));
      res.on("error", (err) => reject(err));

      res.on("end", () => {
        let result = rawHtml.split(">").find((htmlElement) => {
          if (
            htmlElement.includes("img") &&
            htmlElement.includes("src") &&
            allowedExtensions.some((ext) => htmlElement.includes(ext))
          ) {
            let kwMatchCount = 0;

            keywords.forEach((kw) => {
              if (htmlElement.toLowerCase().includes(kw.toLowerCase()))
                kwMatchCount++;
            });

            return kwMatchCount >= 2;
          }
        });

        // Strange regex magic; stolen from here
        // https://stackoverflow.com/questions/1028362/how-do-i-extract-html-img-sources-with-a-regular-expression
        let imageLink = result?.match(/<img[^>]+src="([^">]+)"/)?.[1];

        if (imageLink) {
          let imageUrl = new URL(imageLink);
          let parsedImageUrl = `${imageUrl.protocol}//${imageUrl.hostname}${imageUrl.pathname}`
          resolve(
            parsedImageUrl
          );
        }
        reject("No image was found");
      });
    });
  });
}

function extractImageFromGoogleSearchQuery(query) {
  const gquery = `https://www.google.com/search?q=${query
    .toLowerCase()
    .replaceAll(" ", "+")}&tbm=isch`;

  let barredSites = config?.imgSearchOpts?.searchAvoid ?? defaultSearchOpts.barredSites;

  return new Promise((resolve, reject) => {
    https.get(gquery, (resp) => {
      let rawHtml = "";

      resp.on("data", (chunk) => (rawHtml += chunk));
      resp.on("error", (err) => reject(err));

      resp.on("end", () => {
        htmlArr = rawHtml.split(">");

        let imageLink = htmlArr.find(
          (htmlLink) =>
            htmlLink.match("a href=") &&
            !barredSites.some((kw) => htmlLink.includes(kw))
        );

        imageLink = imageLink.substring(16, imageLink.indexOf("&"));

        let backupImageLink = htmlArr
          .find((e) => e.match('img class="yWs4tf"'))
          .substring(GSTATIC_URL_START, GSTATIC_URL_END);

        const keywords = imageLink.endsWith("/")
          ? imageLink.split("/").at(-2).split(/\_|\-/)
          : imageLink.split("/").pop().split(/\_|\-/);

        extractImageUrlFromPage(imageLink, query, keywords)
          .then((imageLink) => {
            resolve(imageLink);
          })
          .catch((_) => {
            resolve(backupImageLink);
          });
      });
    });
  });
}

module.exports = extractImageFromGoogleSearchQuery;

//extractImageFromGoogleSearchQuery("surprised pikachu meme template", {})
