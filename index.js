/*
	You know... sometimes it's nice to keep things stupid simple...
*/

const micronDB = function () { return { db: [], hashTraverse: function (t, r) { if (this.db[t]) { for (var n = 0; n < this.db[t].length; ++n)if (this.db[t][n]) { var e = r(this.db[t][n]); if (e) return e } return !1 } return !1 }, calcIndex: function (t) { if (t) { for (var r = 0, n = 0; n < t.length; ++n)r += t.charCodeAt(n); return r % 50 } return -1 }, exists: function (t) { var r = this.calcIndex(t); return this.hashTraverse(r, function (r) { return r ? r.id == t : !1 }) }, makeID: function () { var t = new micronDB, r = 0, n = 8, e = function () { for (var t = "", r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = 0; n > e; ++e)t += r.charAt(Math.floor(Math.random() * r.length)); return t }, i = function (i) { var h = function () { for (var h = 62 * Math.pow(n, 2); t.exists(i) && h > r;)++r, i = e() }; return h(), t.exists(i) && (n = Math.round(n / 2 + n), h()), i }; return i(e()) }, hash: function (t) { if (t.id = void 0 === t.id ? this.makeID() : t.id, this.exists(t.id)) return !1; var r = this.calcIndex(t.id); return this.db[r] ? (this.db[r][this.db[r].length] = t, t) : (this.db[r] = [], this.db[r][this.db[r].length] = t, t) }, get: function (t) { var r = this.calcIndex(t); return this.hashTraverse(r, function (r) { return r.id == t ? r : void 0 }) }, remove: function (t) { var r = this.calcIndex(t); if (this.db[r]) for (var n = 0; n < this.db[r].length; ++n)if (this.db[r][n] && this.db[r][n] == this.get(t)) return this.db[r].splice(n, 1), !this.exists(t) }, match: { where: function (t, r) { for (var n in r) if ("undefined" != typeof t[n]) if ("function" == typeof t[n]) { if (t[n](r[n]) === !0) return r } else if (r[n] == t[n]) return r; return !1 } }, traverse: function (t, r, n) { var e = function (t, n) { for (var i = [], h = 0; h < n.length; ++h)if (Array.isArray(n[h])) { var f = e(t, n[h]); f.length > 0 && (Array.isArray(f) && f.length < 2 ? i[i.length] = f[0] : i[i.length] = f) } else r(t, n[h]) && (i[i.length] = r(t, n[h])); return i }, i = [], h = 0, f = function (t, r, n, f) { "undefined" != typeof n[f] && "number" != typeof f && (h ? i.length > 0 && (i = e(t, i)) : i = e(t, r)), ++h }, a = function (t, r, n, h) { if ("undefined" != typeof n[h] && "number" != typeof h) { var f = e(t, r); if (i.length > 0) for (var a = function (t, r) { for (var n = 0; n < r.length; ++n)if (r[n] == t) return !0; return !1 }, s = 0; s < f.length; ++s)a(f[s], i) || (i[i.length] = f[s]); else i = e(t, r) } }; for (var s in t) { "$and" == s && (h = 0); var o = {}; if (o[s] = t[s], "$or" == s || "$and" == s) for (var u in o[s]) { var d = {}; d[u] = o[s][u], "$or" == s ? a(d, n, o[s], u) : f(d, n, o[s], u) } else f(o, n, t, s) } return i }, insert: function (t) { return this.hash(t) }, query: function (t) { var r; for (var n in t) "undefined" != typeof this.match[n] && (r = void 0 === r ? this.traverse(t[n], this.match[n], this.db) : this.traverse(t[n], this.match[n], r)); return r } } };

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const Promise = require("promise");
const port = 1776;
const version = "0.01";
const dbURL = "http://localhost:1337";
const logo = require("./logo").logo(port, version);
const request = require("request");
const db = new micronDB();

console.log("running...");

const load = (url) => {
    console.log(logo);

    let indexQuery = {
        "where": {
            "modelNum": true,
            "brand": true,
        }
    }
    
    console.log(indexQuery);

    request({
        url: dbURL + "/index",
        method: "POST",
        json: true,
        body: indexQuery
    }, (err, res, body) => {
        console.log(body);
    });

};

load(dbURL);

const app = express();

const jsonParser = bodyParser.json();

app.get("/", (req, res) => {
    res.send(logo);
});

app.get("/stamps", jsonParser, (req, res) => {
    let indexQuery = {
        where: {
            modelNum: true,
        }
    };

    request({
        url: dbURL + "/index",
        method: "GET",
        json: true,
        body: indexQuery
    }, (err, response, body) => {
        res.send(body);
    });

});

app.get("/image/:id", jsonParser, (req, res) => {
    db.get(req.params.id);
    res.send(req.body);
});

app.listen(port, () => {
    console.log(logo);
});
