const puppeteer = require('puppeteer')
const fs = require("fs")
const instructonBrowser = require('./browser')


const globalInstruction = JSON.parse(fs.readFileSync("instruction.json"))
response = { 'status': 'ok' }

const main = async () => {
    const browser = await puppeteer.launch()
    try {
        const page = await browser.newPage()
        await page.goto('file:///' + process.cwd() + '/test.html')
        response.result = { 'trips': {}, 'custom': {} }

        await instructonBrowser.browseInstruction(globalInstruction, page, response, "result")


        await browser.close()
    } catch (error) {
        await browser.close()
        response = { 'status': 'ERR', "error": error.stack }
    }
    const humanReadableResult = JSON.stringify(response, null, 2)
    await console.log(humanReadableResult)
    fs.writeFile("response.json", humanReadableResult, function (err) {
        if (err) {
            return console.log(err)
        }
        console.log("The result was stored in response.json file !")
    })
}

main()