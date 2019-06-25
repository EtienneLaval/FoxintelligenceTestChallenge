const puppeteer = require('puppeteer')
const fs = require("fs")
const globalInstruction = JSON.parse(fs.readFileSync("instruction.json"));
response = { 'status': 'OK' }

const browseInstruction = async (instruction, element, responseObject, responseKey) => {
    let res = {}
    let mergerepeatedNeeded = false
    if ("repeat" in instruction){
        delete instruction.repeat
    }
    for (let key in instruction) {
        if ("xpath" in instruction[key]) {
            res[key] = await searchWithInstruction(instruction[key], element)
            if("repeatedIn" in instruction[key]){mergerepeatedNeeded=true}
        } else {
            if (Array.isArray(instruction[key])) {
                res[key] = []
                await browseInstruction(instruction[key][0], element, res[key], 0)
            } else {
                await browseInstruction(instruction[key], element, res, key)
            }
        }
    }
    responseObject[responseKey] = res
    // responseObject[responseKey] = mergerepeatedNeeded? objectOfArrayToArrayOfObject(res) : res
}
const objectOfArrayToArrayOfObject = (objOfArr) => {
    let arrOfObj=[]
    let arrSize
    for (let key in objOfArr) {
        arrSize = arrSize? Math.min(objOfArr[key].length, arrSize) : objOfArr[key].length
        for (let index in objOfArr[key]) {
            if (!arrOfObj[index]){arrOfObj[index] = {}}
            arrOfObj[index][key] = objOfArr[key][index] 
        }
    }
    arrOfObj = arrOfObj.slice(0,arrSize)
    return arrOfObj
}
const searchWithInstruction = async (subInstruction, element) => {
    if (subInstruction.repeatedIn) {
        return await searchWhenMultipleTarget(subInstruction, element)
    } else {
        return await searchWhenSingleTarget (subInstruction, element)
    }

}
const searchWhenSingleTarget = async (subInstruction, element) => {
    let searchedSubElement = await element.$x(subInstruction.xpath)
    return await treatSearchedElement (searchedSubElement, subInstruction)
}
const searchWhenMultipleTarget = async (subInstruction, element) => {
    let result = []
    let {repeatedIn, xpath} = subInstruction
    for ( let i = 1; i>0; i++ ) {
            newXpath = '(' + repeatedIn+')['+i+']//'+xpath
            let searchedSubElement = await element.$x(newXpath)
            if (searchedSubElement.length>0){
                result.push(await treatSearchedElement (searchedSubElement, subInstruction))
            }else{ i = -1}
    }
    return result        
}
const treatSearchedElement = async (searchedElement, subInstruction) => {
    let searchedText = await (await searchedElement[0].getProperty('textContent')).jsonValue()
    if ("replace" in subInstruction) {
        for (let replace of subInstruction.replace) {
            searchedText = searchedText.replace(replace[0], replace[1])
        }
    }
    return searchedText.trim()
}
// const selectBetween = async (first, last, element) => {
//     let previousSibling = '( (' + first + ') /preceding-sibling :: *[1])[1]'
//     let selectAfter =  '(' + previousSibling + ')/sibling::*'
//     // return selectAfter
//     return await element.$x(last)
// }

const main = async () => {
    const browser = await puppeteer.launch()

    // try {
        const page = await browser.newPage()
        await page.goto('file:///' + process.cwd() + '/test.html')
        response.result = { 'trips': {}, 'custom': {} }

        // let first = '//table[descendant::td[contains(@class,"product-travel-date")]] [not(descendant::h1) ]'
        // let last = '((//table[contains(@class,"passengers")]))'
        let code = await page.$x("(//table[contains(@class,\"product-details\")])[1]//*[contains(@class,\"travel-way\")]")
        code = await (await code[0].getProperty('textContent')).jsonValue()
        console.log(await code.trim())

        await browseInstruction(globalInstruction, page, response, "result")
        // await console.log(response.result.code)
        await browser.close()


    // } catch (error) {
    //     await browser.close()
    //     response = { 'status': 'ERR', error: error }
    // }
    await console.log(JSON.stringify(response))
}

main()




// added to instr 
// "repeatedElements":[
//     "//table[descendant::td[contains(@class,\"product-travel-date\")]] [not(descendant::h1) ]",
//     "//table[contains(@class,\"product-details\")]",
//     "//table[contains(@class,\"passengers\")]"
// ],