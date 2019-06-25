// const puppeteer = require('puppeteer')
const fs = require("fs")

const xpath = require('xpath')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const data = fs.readFileSync("test.html", "utf8")
const page = new JSDOM(data)
const globalInstruction = JSON.parse(fs.readFileSync("instruction.json"));
response = { 'status': 'OK' };

const select = xpath.select

const browseInstruction = async (instruction, element, responseObject, responseKey) => {
    let res = {}
    for (var key in instruction){
        // if ("repeat" in instruction[key]){

        // }
        if ("xpath" in instruction[key]) {
            res[key] = await searchWithInstruction(instruction[key], element)
        } else {
            if (Array.isArray(instruction[key])){
                res[key] = []
                await browseInstruction ( instruction[key][0], element, res[key], 0 )
            } else {
                await browseInstruction ( instruction[key], element, res, key )
            }
        }
    }
    responseKey==0? responseObject.push(res) : responseObject[responseKey] = res
}
const searchWithInstruction = async (subInstruction, element) => {
    let searchedSubElement = await select(subInstruction.xpath, element)
    // let searchedSubElement = await element.$x(subInstruction.xpath)
    let searchedText = await (await searchedSubElement[0].getProperty('textContent')).jsonValue()
    if ("replace" in subInstruction){
        for ( let replace of subInstruction.replace){
            searchedText = searchedText.replace(replace[0],replace[1])
        }
    }
    return await searchedText.trim()
} 

const selectAfter = (xpath) => {
    let previousSibling = '( (' + xpath + ') /preceding-sibling :: *)'  
    let selectAfter =  '(' + previousSibling + ')/sibling::*'
    // return selectAfter
    return previousSibling
}

const main = async () => {
    // try {
        // const browser = await puppeteer.launch()
        // const page = await browser.newPage()
        // await page.goto('file:///' + process.cwd() + '/test.html')
        response.result = { 'trips': {}, 'custom': {} }
        
        let first = '//table[descendant::td[contains(@class,"product-travel-date")]] [not(descendant::h1) ]'
        // let first = '((//*[contains(@class,"product-travel-date")])[last()]/ancestor::table)[last()]'
        let last = '((//table[contains(@class,"passengers")]))'
        let code = await select((first), page)
        // let code = await page.$x(selectAfter(first))

        code = await (await code[0].getProperty('textContent')).jsonValue()
        console.log(await code.trim())
        
        await browseInstruction (globalInstruction, page, response, "result")
        // await console.log(response.result.code)
        await browser.close()


    // } catch (error) {
        // response = { 'status': 'ERR', error: error }
    // }
    await console.log(JSON.stringify(response))
    await console.log(globalInstruction)
}

main()