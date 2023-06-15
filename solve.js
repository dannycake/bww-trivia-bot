/**
 * Written by Danny
 * Free to use without credit or permission
 *
 * https://github.com/mxmmxx
 * https://danny.ink/
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const COOKIE_PATH = './cookies.json';
const BROWSER_CONFIG = {
    headless: false,
    defaultViewport: {width: 428, height: 926},
    devtools: true,
    args: [
        '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        '--window-size=428,926',
        '--window-position=0,0',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    ignoreHTTPSErrors: true,
};

/**
 * Sets up a browser and page with the cookies from the provided cookies.json file
 * @return {Promise<{browser: Browser, page: Page}>}
 */
const setupBrowser = async () => {
    const browser = await puppeteer.launch(BROWSER_CONFIG);
    const page = await browser.newPage();

    const cookies = fs.readFileSync(COOKIE_PATH).toString();
    for (const cookie of Object.values(JSON.parse(cookies))) {
        await page.setCookie(cookie);
    }

    return {browser, page};
};

/**
 * Fetches the HTML of a google search for the given query
 * @param {string} query search term
 * @return {Promise<string>} HTML of the google search
 */
const fetchGoogleResults = async (query) => {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error(error);
        return '';
    }
};

/**
 * Counts the number of times the answer appears in the text
 * @param {string} text text to search
 * @param {string} answer answer to look for
 * @return {number} number of times the answer appears in the text
 */
const countAnswersInText = (text, answer) => {
    const cleanRegex = isNaN(Number(answer)) ? /[^a-zA-Z0-9]/g : /[^0-9 ]/g;
    const cleanedText = text.toLowerCase().replace(cleanRegex, '');
    const cleanedAnswer = answer.toLowerCase().replace(cleanRegex, '');
    return cleanedText.split(cleanedAnswer).length - 1;
};

/**
 * Gets the correct answer for the given question and answers
 * @param {string} question question to search for
 * @param {string[]} answers answers to search for
 * @return {Promise<number>} index of the correct answer
 */
const getCorrectAnswer = async (question, answers) => {
    const googleResults = await fetchGoogleResults(question);
    const answerCounts = answers.map((answer) => countAnswersInText(googleResults, answer));

    const correctIndex = answerCounts.indexOf(Math.max(...answerCounts));
    const correctAnswer = answers[correctIndex];

    console.log(
        '=================================',
        `\nQuestion: ${question}`,
        `\nAnswers: ${answers.map((answer) => `\n\t${answer} - ${answerCounts[answers.indexOf(answer)]}`)}`,
        `\nCorrect Answer: ${correctAnswer}`,
    );

    return correctIndex;
};

const autoAnswerTrivia = async (page) => {
    for (; ;) {
        // find question / answer elements
        const questionElement = await page.$('.sc-llYSUQ');
        const answersElement = await page.$('.sc-iJKOTD');

        if (!questionElement || !answersElement) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
        }

        // get the question and answers and use google to find the correct answer
        const question = await page.evaluate(() => document.getElementsByClassName('sc-llYSUQ')[0].innerText);
        const answers = await page.evaluate(() => document.getElementsByClassName('sc-iJKOTD')[0].innerText);
        const answersArray = answers.split('\n').filter((_, index) => index % 2 !== 0);

        const correctAnswerIndex = await getCorrectAnswer(question, answersArray);

        // click the correct answer
        await page.evaluate((index) => document.getElementsByClassName('sc-iJKOTD')[0].children[index].click(), correctAnswerIndex);

        // wait 30 seconds before attempting to answer another question
        await new Promise((resolve) => setTimeout(resolve, 1000 * 30));
    }
};

/**
 * Writes the cookies to the cookies.json file periodically
 * @param {Page} page page to get cookies from
 */
const writeCookiesPeriodically = (page) => {
    setInterval(async () => {
        const cookies = await page.cookies();
        fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
    }, 1000 * 20);
};

const main = async () => {
    const {page} = await setupBrowser();

    await page.goto('https://play.buffalowildwings.com/always-on-trivia/');

    writeCookiesPeriodically(page);

    return autoAnswerTrivia(page);
};

main();
