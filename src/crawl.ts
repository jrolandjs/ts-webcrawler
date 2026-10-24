import { JSDOM } from "jsdom";

//////////////////////////////////////////////////////////////////

export function normalizeURL(url: string): string {
  const myURL = new URL(url);
  let normalizedURL = myURL.hostname + myURL.pathname;
  if (normalizedURL.slice(-1) === "/") {
    normalizedURL = normalizedURL.slice(0,-1);
  }
  return normalizedURL;
}

//////////////////////////////////////////////////////////////////

export function getHeadingFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const h1 = doc.querySelector("h1") ?? doc.querySelector("h2");
    return (h1?.textContent ?? "").trim();
  } catch {
    return "";
  }
}

//////////////////////////////////////////////////////////////////

export function getFirstParagraphFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const main = doc.querySelector("main");
    const p = main?.querySelector("p") ?? doc.querySelector("p");
    return (p?.textContent ?? "").trim();
  } catch {
    return "";
  }
}

//////////////////////////////////////////////////////////////////

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const anchors = doc.querySelectorAll("a");

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href) return;

      try {
        const absoluteURL = new URL(href, baseURL).toString();
        urls.push(absoluteURL);
      } catch (err) {
        console.error(`invalid href '${href}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse HTML:", err);
  }
  return urls;
}

//////////////////////////////////////////////////////////////////

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const imgs: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const images = doc.querySelectorAll("img");

    images.forEach((image) => {
      const src = image.getAttribute("src");
      if (!src) return;

      try {
        const absoluteURL = new URL(src, baseURL).toString();
        imgs.push(absoluteURL);
      } catch (err) {
        console.error(`invalid href '${src}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse HTML:", err);
  }
  return imgs;
}

//////////////////////////////////////////////////////////////////


type ExtractedPageData = {
  url: string,
  heading: string,
  first_paragraph: string,
  outgoing_links: string[],
  image_urls: string[]
}

export function extractPageData(
  html: string,
  pageURL: string
): ExtractedPageData {
  const pageData: ExtractedPageData = {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL)
  }
  return pageData;
}
