const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');


const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/makeRequest', (req, res) => {
  const url = req.query['url'];
  request({ url: url }, (error, response, body) => {
    const dom = htmlparser2.parseDOM(body);
    const $ = cheerio.load(dom);
    const mainPage = { id: 'Main', title: $('title').text(), rootLink: url, links: [] };

    const baseUrl = $('base')[0] ? $('base')[0].attribs['href'] : '';
    for (let i = 0; i < $('a').length; i++) {
      mainPage.links.push(`${baseUrl}${$('a')[i].attribs['href']}`);
    }

    let filteredLinks = new Set(
      mainPage.links.filter(link => {
        return (
          link.startsWith(`${url}`) &&
          link.search('.pdf') == -1 &&
          link.search('#') == -1 &&
          link.search('tel:') == -1 &&
          link.search('mailto:') == -1 &&
          link.search('/http:') == -1 &&
          link.search('/https:') == -1 &&
          link.search('/index') == -1
        );
      })
    );

    mainPage.links = [...filteredLinks];
    res.send(JSON.stringify(mainPage));
  });
});
app.get('/getChildLinks', (req, res) => {
  const url = req.query['url'];
  request({ url: url }, (error, response, body) => {
    const dom = htmlparser2.parseDOM(body);
    const $ = cheerio.load(dom);
    const childPage = { id: $('title').text(), title: $('title').text(), rootLink: url, links: [] };
    const baseUrl = $('base')[0] ? $('base')[0].attribs['href'] : '';
    for (let i = 0; i < $('a').length; i++) {
      childPage.links.push(`${baseUrl}${$('a')[i].attribs['href']}`);
    }

    let filteredLinks = new Set(
      childPage.links.filter(link => {
        return (
          link.search('.pdf') == -1 &&
          link.search('#') == -1 &&
          link.search('tel:') == -1 &&
          link.search('mailto:') == -1 &&
          link.search('/http:') == -1 &&
          link.search('/https:') == -1
        );
      })
    );

    console.log(filteredLinks);
    childPage.links = [...filteredLinks];
    res.send(JSON.stringify(childPage));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
