import { getURLsFromHTML } from "./crawl";

const inputURL = "https://crawler-test.com";
const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

console.log(getURLsFromHTML(inputURL, inputBody));
