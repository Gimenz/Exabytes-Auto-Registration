const { default: axios } = require('axios')
const { JSDOM } = require('jsdom')
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fsa = require("async-file");
const fs = require('fs');

async function randomName() {
    try {
        const { data } = await axios.get('https://fauxid.com/fake-name-generator/indonesia?age=18-24');
        let dom = new JSDOM(data).window.document;
        let address = dom.getElementsByClassName('can-copy not-bottom-spaced left-spaced')[0].innerHTML.split(',');
        let card = [...dom.querySelectorAll('div.card.top-spaced')];
        nama = dom.getElementsByClassName('id_name can-copy')[0].innerHTML;
        birth = card[1].querySelectorAll('span.can-copy.left-spaced')[0].innerHTML;
        return {
            status: true,
            result: {
                name: {
                    first: nama.split(' ')[0],
                    last: nama.split(' ')[1]
                },
                address: {
                    street: address[0].trim(),
                    state: address[1].trim().split(/\s+/g).slice(0, -1).join(' '),
                    postal: address[1].split(/\s+/g)[address[1].split(/\s+/g).length - 1]
                },
                birth: {
                    date: birth.split(/\s+/)[1].replace(/\D/g, ''),
                    month: birth.split(/\s+/)[0],
                    year: birth.split(/\s+/)[2],
                }
            }
        }
    } catch (error) {
        return {
            status: false,
            result: 'IP BANNED BY CLOUDFLARE!!'
        }
    }
}


async function getToken() {
    const { data } = await axios.get('https://billing.exabytes.my/mypanel/register.php');
    return /<input.+name="token".+value="(.*?)".+>/g.exec(data)[1];
}



(async() => {
    try {
        //const tanyaRandom = readlineSync.question(chalk.blue("Random Data : [y/n]"));
        let nganu = fs.readFileSync('./email.txt', 'utf-8').split(/\r?\n/);
        let nomer = 1;
        for (let email of nganu) {
            console.clear()
            console.log(chalk.cyan('[*] EXABYTES AUTO REGISTER'));
            console.log(chalk.cyan('[*] Created by masgimenz'));
            console.log('----------------------------------------');
            console.log(chalk.cyan(`[*] Email No : ${nomer++} | ${email}`));
            console.log('----------------------------------------');
            console.log(chalk.yellow('[*] Getting random data...'));
            const random = await randomName();
            if (!random.status) console.log(chalk.red('[*] IP BANNED BY CLOUDFLARE, CHANGE YOUR IP OR FILL DATA MANUAL'));
            const firstName = random.status ? random.result.name.first : readlineSync.question(chalk.blue("[*] First name : "));
            const lastName = random.status ? random.result.name.last : readlineSync.question(chalk.blue("[*] Last name : "));
            const address1 = random.status ? random.result.address.street : readlineSync.question(chalk.blue("[*] Address 1 : "));
            const city = random.status ? random.result.address.state : readlineSync.question(chalk.blue("[*] City : "));
            const state = random.status ? random.result.address.state : readlineSync.question(chalk.blue("[*] State : "));
            const postCOde = random.status ? random.result.address.postal : readlineSync.question(chalk.blue("[*] Postal Code : "));
            const nohape = '628523619' + Math.ceil(Math.random()*9999);
            const pw = 'gh0stP0W3R!';
            //const token = await getToken();
            console.log(chalk.yellow('[*] OK, data collected. Processing request...'));
            console.log('----------------------------------------');
            console.log(chalk.green('[*] Launching browser'));
            try {
                const browser = await puppeteer.launch({
                    headless: false,
                    ignoreHTTPSErrors: true,
                    slowMo: 0,
                    args: ['--window-size=1400,900',
                        '--disable-gpu'
                    ]
                })
                console.log(chalk.green('[*] Browser Launched'));
                const page = await browser.newPage();
                await page.goto('https://billing.exabytes.my/mypanel/register.php', {
                    waitUntil: 'load',
                    // Remove the timeout
                    timeout: 0
                });
        
                await page.waitForTimeout(5000);
        
                await page.setViewport({ width: 1366, height: 695 });
                console.log("[*] Trying to Fill Identity");
        
                await page.waitForSelector('#inputFirstName')
                    .then(async() => {
                        await page.click('#inputFirstName');
                        await page.type('#inputFirstName', `${firstName}`);
                        await page.type('#inputLastName', `${lastName}`);
                        await page.type('#inputEmail', `${email}`);
                        await page.type('#inputPhone', `${nohape}`);
                
                        let finishTime = new Date().getTime() + (10 * 1000);
                
                        await autoScroll(page, finishTime);
                
                        await page.type('#inputAddress1', `${address1}`);
                        await page.type('#inputAddress2', `${address1}`);
                        await page.type('#inputCity', `${city}`);
                        await page.type('#stateinput', `${state}`);
                        await page.type('#inputPostcode', `${postCOde}`);
                
                        await page.type('#customfield7349', `${nohape}`);
                        await page.type('#inputNewPassword1', `${pw}`);
                        await page.type('#inputNewPassword2', `${pw}`);
                        await page.select('#inputSecurityQId', '1');
                        await page.type('#inputSecurityQAns', 'green');
                        await page.evaluate(() => {
                            document.querySelector("input.accepttos").parentElement.click();
                        });
                        console.log(chalk.green('[*] Sukses input form'));
                        await page.click('input.btn.btn-large.btn-primary'); 
                        console.log(chalk.green('[*] Proses Registrasi'));
                        await page.waitForSelector('a.btn.btn-register')
                            .then(() => {
                                console.log(chalk.green(`[*] Success: ${email}|${pw} (Check your email & verify registration)`));
                                fsa.appendFile("result.txt", `${email} | ${pw}\n`, { encoding: 'utf8' });
                                browser.close();
                            }).catch(() => {
                                console.log(chalk.red('[*] Error while Register, maybe email has ben already used'));
                                browser.close();
                            })
                    })
                    .catch(() => {
                        console.log(chalk.red('[*] Error, Try again'));
                        browser.close();
                    })
            } catch (error) {
                console.log(chalk.yellow('[*] Error, Try again'));
            }
        }
    } catch (error) {
        console.log(error);
        
    }
})();

async function autoScroll(page, finishTime) {
    await page.evaluate(async (finishTime) => {

        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 1;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || new Date().getTime() > finishTime) {

                    clearInterval(timer);
                    resolve();
                }

            }, 120);
        });
    }, finishTime);
}