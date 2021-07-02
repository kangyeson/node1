const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');
const sanitizeHtml = require('sanitize-html');
const template = require('./lib/template');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.get('*', function(req,res, next){
    fs.readdir('data/', function(err, data){
        req.filelist = data;
        next();
    });
});

app.get('/', function(req, res) {
    // fs.readdir('data/', function (err, data) {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(req.filelist);
    const html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
    );
    res.send(html);
    // });
});

app.get('/page/:pageId', function (req, res) {
    // fs.readdir('data/', function (err, data) {
    const list = template.list(req.filelist);
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8',
        function (err, description) {
            const title = req.params.pageId;
            const sanitizedTitle = sanitizeHtml(title);
            const sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
            });
            const html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            res.send(html);
        });
    // });
});

app.get('/create', function (req, res){
    // fs.readdir('./data', function (error, filelist) {
    const title = 'WEB - create';
    const list = template.list(req.filelist);
    const html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
    res.send(html);
    // });
});

app.post('/create_process', function (req, res) {
    const reqBody = req.body;
    const title = reqBody.title;
    const description = reqBody.description;

    fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
        res.redirect(`/page/${title}`);
    });
});

app.get('/update/:pageId', function(req, res){
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        const title = req.params.pageId;
        const list = template.list(req.filelist);
        const html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`,
        );
        res.send(html);
    });
    // });
});

app.post('/update_process', function (req, res) {
    const reqBody = req.body;
    const id = reqBody.id;
    const title = reqBody.title;
    const description = reqBody.description;

    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            res.redirect(`/page/${title}`)
        })
    })
});

app.post('/delete_process', function (req, res) {
    const reqBody = req.body;
    const id = reqBody.id;
    const filteredId = path.parse(id).base;

    fs.unlink(`data/${filteredId}`, function (error) {
        res.redirect(`/`);
    });
});


app.listen(3000);
