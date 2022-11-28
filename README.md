# Memer

A (simple) RESTful to generates memes using google image search

## Try it out

*TBD - The API including the site coming soon!* 

## How it works

```
/new?query=futurama+doubt+meme+template&text=seems+sus+ngl&pos=bottom
```

- `query` the query is looked up on google image search, here the first result link is extracted, this link is then scraped using search keywords in the query, and the URL to find the actual image link. If it fails to find such a link, it will instead return the `gstatic` google image (which is highly compressed, hence low quality)
- `text` the text is then broken up into chunks of 8 to properly wrap it and prevent overflow, then using `node-canvas` this text is placed.  

- `pos` A Y coordinate is calculated based the text height `FNT_SIZE * Math.floor(text.length / 8)`, and some padding. The text horizontally centered by default


## config

Some additional config can be setup on the server; here is the config used by default. Note that the json is parsed via [ json5 ]( https://json5.org/ )

```json5
{
  "imgSearchOpts": {
    "searchExtensions": ["png", "jpeg", "jpg"], // extensions to avoid when searching image on the page
    "searchAvoid": [ // urls to avoid when searching on google
      "imgflip",
      "boredpanda",
      "generator",
      "create",
      "kapwing",
      "twitter",
      "reddit",
      "google",
      "meme-creator"
    ],
    "searchKeywordGenerics": [ "to", "and", "a", "i", "the", "not", "if", "meme", "photo" ] // keywords NOT to search the site based on
  },

  "imgFontSize": 25  // specifies the font size
}
```
