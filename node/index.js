const express = require("express");
const mysql = require("mysql2");
const http = require("http");
const path = require("path");

const app = express();

const PORT = process.env.MYSQL_PORT || 8000;

// Transform an ipv4 address to its integer representation.
// Source: https://gist.github.com/jppommet/5708697.
function ip2int(ip) {
  return (
    ip.split(".").reduce(function(ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}

// Returns true if the given string is an ip address.
function isIpAddress(str) {
  const regex = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/gi;
  return regex.test(str);
}

const sql_connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "password",
  database: process.env.DATABASE || "main",
});

// For testing: Get some ip addresses from our Ip Table API.
app.get("/api/ips", (req, res) => {
  sql_connection.query("SELECT * FROM IpTable LIMIT 10", (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

// A route that returns the longitude and latitude of a given ip.
app.get("/api/ipLocation/:ip", (req, res) => {
  const ip = req.params["ip"];

  // Validate the given ip address.
  if (!isIpAddress(ip)) {
    res.json({
      success: false,
      err: "The given IP address is not supported.",
    });
    return;
  }

  const ip_int = ip2int(ip);
  const query = `SELECT longitude, latitude, network FROM IpTable WHERE start_ip <= ${ip_int} and ${ip_int} <= end_ip LIMIT 1`;

  sql_connection.query(query, (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else if (rows.length == 0) {
      res.json({
        success: false,
        err: "Given IP address does not match any ranges.",
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

// Create a route that points to a built Angular App.
app.use(express.static(__dirname + "/frontend/dist/frontend"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname)));

const server = http.createServer(app);

server.listen(PORT, () => console.log(`Listining on port ${PORT}`));
