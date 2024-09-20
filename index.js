const puppeteer = require('puppeteer');;
const { exec } = require("node:child_process");
const { promisify } = require("node:util");

const config = {
    username: "Xraybombx",
    threads: 1, // 0 = max
    rigId: "None",
    keyInput: ""
}

async function main() {
    const browser = await startBrowser();
    const pages = await browser.pages();
    const page = pages[0];

    await page.goto(`https://server.duinocoin.com/webminer.html?username=${config.username}&threads=${config.threads || ""}&rigid=${config.rigId}&keyinput=${config.keyInput}`);

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const resourceType = request.resourceType();
        // Block images, fonts, stylesheets, and media to save resources
        if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
            request.abort();
        } else {
            request.continue();
        }
    });

    setInterval(async () => {
        try {
            const data = await page.evaluate(() => {
                const sharesElement = document.querySelector('#shares');
                const hashrateElement = document.querySelector('#hashrate');
                return {
                    shares: sharesElement ? sharesElement.innerText : 'N/A',
                    hashrate: hashrateElement ? hashrateElement.innerText : 'N/A',
                };
            });

            console.log(`Shares: ${data.shares}, Hashrate: ${data.hashrate}`);
        } catch (error) {
            console.log(error);
        }
    }, 5000);

    setInterval(() => {
        console.clear();
    }, 10 * 60 * 1000)
}

main();

async function startBrowser() {
    const { stdout: chromiumPath } = await promisify(exec)("which chromium");

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
        executablePath: chromiumPath.trim()
    });


    return browser;
}