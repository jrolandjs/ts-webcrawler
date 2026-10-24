import { expect, test } from "vitest";
import {
  normalizeURL,
  getHeadingFromHTML,
  getFirstParagraphFromHTML,
  getURLsFromHTML,
  getImagesFromHTML,
  extractPageData
} from "./crawl";

//////////////////////////////////////////////////////////////////

test("normalizeURL slash", () => {
  const input: string = "https://www.boot.dev/blog/path/";
  const expected: string = "www.boot.dev/blog/path";
  const result: string = normalizeURL(input);
  expect(result).toBe(expected);
});

test("normalizeURL https", () => {
  const input: string = "https://www.boot.dev/blog/path";
  const expected: string = "www.boot.dev/blog/path";
  const result: string = normalizeURL(input);
  expect(result).toBe(expected);
});

test("normalizeURL http", () => {
  const input: string = "http://www.boot.dev/blog/path";
  const expected: string = "www.boot.dev/blog/path";
  const result: string = normalizeURL(input);
  expect(result).toBe(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

//////////////////////////////////////////////////////////////////

test("getHeadingFromHTML only <h1>", () => {
  const inputBody = `
    <html>
      <body>
        <h1>Test Title</h1>
      </body>
    </html>
  `;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML fallback <h2>", () => {
  const inputBody = `
    <html>
      <body>
        <h2>Test Title</h2>
      </body>
    </html>
  `;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML no heading", () => {
  const inputBody = `
    <html>
      <body>
        <p>Pretending to be a heading</p>
      </body>
    </html>
  `;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML <h1> & <h2>", () => {
  const inputBody = `
    <html>
      <body>
        <h1>Test Title of Heading 1</h1>
        <h2>Test Title of Heading 2</h2>
      </body>
    </html>
  `;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title of Heading 1";
  expect(actual).toEqual(expected);
});

//////////////////////////////////////////////////////////////////

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML fallback to first p", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <p>Outside paragraph2.</p>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no paragraph", () => {
  const inputBody = `
    <html><body>
      <h1>Outside paragraph.</h1>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

//////////////////////////////////////////////////////////////////

test("getURLsFromHTML to absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html>
      <body>
        <a href="/path/one">
          <span>Boot.dev</span>
        </a>
      </body>
    </html>
  `;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML several links", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html>
      <body>
        <a href="/path/one">
          <span>Boot.dev</span>
        </a>
        <a href="/path/two">
          <span>Boot.dev</span>
        </a>
        <a href="/path/three">
          <span>Boot.dev</span>
        </a>
      </body>
    </html>
  `;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/path/one",
    "https://crawler-test.com/path/two",
    "https://crawler-test.com/path/three"
  ];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="https://crawler-test.com"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML both absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<a href="/path/one"><span>Boot.dev</span></a>` +
    `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
    `</body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/path/one",
    "https://other.com/path/one",
  ];
  expect(actual).toEqual(expected);
});


test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="https://crawler-test.com/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<img src="/logo.png" alt="Logo">` +
    `<img src="https://cdn.boot.dev/banner.jpg">` +
    `</body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ];
  expect(actual).toEqual(expected);
});


test("extract_page_data basic", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extract_page_data main section priority", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <nav><p>Navigation paragraph</p></nav>
      <main>
        <h1>Main Title</h1>
        <p>Main paragraph content.</p>
      </main>
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  expect(actual.heading).toEqual("Main Title");
  expect(actual.first_paragraph).toEqual("Main paragraph content.");
});

test("extract_page_data missing elements", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><div>No h1, p, links, or images</div></body></html>`;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "",
    first_paragraph: "",
    outgoing_links: [],
    image_urls: [],
  };

  expect(actual).toEqual(expected);
});
