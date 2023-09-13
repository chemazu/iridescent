"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subdomainSiteUrl = exports.siteUrl = void 0;
const siteUrl = process.env.NODE_ENV === "production" ? "https://www.tuturly.com" : "http://localhost:3000";
exports.siteUrl = siteUrl;

const subdomainSiteUrl = schoolname => {
  return process.env.NODE_ENV === "production" ? `https://${schoolname}.tuturly.com` : `http://${schoolname}.localhost:3000`;
};

exports.subdomainSiteUrl = subdomainSiteUrl;