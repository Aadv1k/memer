# Memer

A (simple) RESTful to generates memes using google image search

## Try it out

[ memer ](https://memer-production.up.railway.app/) deployed using [railway.app](https://railway.app/);

## How it works

```
/new?query=futurama+doubt+meme+template&text=seems+sus+ngl&pos=bottom
```

- `query` the query is looked up on google image search, here the first result link is extracted, this link is then scraped using search keywords in the query, and the URL to find the actual image link. If it fails to find such a link, it will instead return the `gstatic` google image (which is highly compressed, hence low quality)
- `text` the text is then broken up into chunks of 8 to properly wrap it and prevent overflow, then using `node-canvas` this text is placed.
- `pos` A Y coordinate is calculated based the text height `FNT_SIZE * Math.floor(text.length / 8)`, and some padding. The text horizontally centered by default
