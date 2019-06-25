const puppeteer = require('puppeteer')
let dateFormat = require('date-and-time');
const fs = require("fs")
const globalInstruction = JSON.parse(fs.readFileSync("instruction.json"));
response = { 'status': 'OK' }

const browseInstruction = async (instruction, element, responseObject, responseKey, repeat) => {
    // let res = {}
    // if ("repeat" in instruction){

    // }else{

    // }
    instruction = Object.assign({}, instruction)
    console.log('repeat at ' + responseKey + ': ' + repeat);


    let res = {}
    let mergerepeatedNeeded = false
    let endSubRepeat = false
    if ("__repeat" in instruction) {
        if (!repeat) { repeat = [] }
        delete instruction.__repeat
        repeat[repeat.length] = 1
        while (repeat.length > 0) {
            await browseInstruction(instruction, element, responseObject, responseKey, repeat)
        }
    } else {
        for (let key in instruction) {
            if (key == "__condition") {
                let {__rule, __name, __content} = instruction[key]
                if (JSON.stringify(repeat) == "[4,1]") {
                    if (Array.isArray(__content)) { 
                        res[__name] = [] 
                        __content = __content[0] 
                    }
                    // await browseInstruction(instruction[key][0], element, res[key], 0, repeat ? Array.from(repeat) : undefined)
                    await browseInstruction(__content, element, res[__name], __name, repeat ? Array.from(repeat) : undefined)
                }
            } else if ("xpath" in instruction[key]) {
                // res[key] = await searchWithInstruction(instruction[key], element, repeat)
                let searchedSubElement = await searchWithInstruction(instruction[key], element, repeat)
                if (!searchedSubElement.length > 0) {
                    endSubRepeat = true
                } else {
                    res[key] = await treatSearchedElement(searchedSubElement, instruction[key],repeat)
                }
                // if ("repeatedIn" in instruction[key]) { mergerepeatedNeeded = true }
            } else {
                if (Array.isArray(instruction[key])) {
                    if (!res[key]) { res[key] = [] }
                    await browseInstruction(instruction[key][0], element, res[key], 0, repeat ? Array.from(repeat) : undefined)
                }
                else {
                    await browseInstruction(instruction[key], element, res, key, repeat)
                }
            }
        }
        if (repeat) {
            let length = repeat.length
            if (endSubRepeat) {
                repeat.pop()
            } else {
                repeat[repeat.length - 1]++
                console.log(res)
                Array.isArray(responseObject) ? responseObject.push(res) : responseObject[responseKey] = res
                console.log('----')
            }
        } else {
            // responseObject[responseKey] = res
            console.log(res)
            // if(mergerepeatedNeeded) {res = objectOfArrayToArrayOfObject(res)}
            Array.isArray(responseObject) ? responseObject.push(res) : responseObject[responseKey] = res
            console.log('----')
        }
    }


}
const searchWithInstruction = async (subInstruction, element, repeat) => {
    if (subInstruction.repeatedIn) {
        return await searchWhenMultipleTarget(subInstruction, element, repeat)
    } else {
        // return await searchWhenSingleTarget (subInstruction, element)
        return await element.$x(subInstruction.xpath)
    }

}
const searchWhenMultipleTarget = async (subInstruction, element, repeat) => {

    let { repeatedIn, xpath } = subInstruction
    let repeatedSequence = ''
    for (i in repeatedIn) {
        repeatedSequence = '(' + repeatedSequence + repeatedIn[i] + '[' + repeat[i] + '])'
    }
    let newXpath = repeatedSequence + xpath
    console.log(newXpath);
    // return await element.$x(newXpath)
    let res =  await element.$x(newXpath)
    return res

}
const treatSearchedElement = async (searchedElement, subInstruction, repeat) => {
    let searchedText = await (await searchedElement[0].getProperty('textContent')).jsonValue()
    if ("treatment" in subInstruction) {
        let pattern = new RegExp(subInstruction.treatment[0],'g')
        let treatEval = eval(subInstruction.treatment[1]) //it's a very bad pattern, refactor it once able to perform concat on xpath with the dom handler 
        searchedText = searchedText.match(pattern)[treatEval]
    }
    if ("replace" in subInstruction) {
        for (let replace of subInstruction.replace) {
            let pattern = new RegExp(replace[0],'g')
            searchedText = searchedText.replace( pattern, replace[1])
        }
    }
    searchedText = searchedText.trim()
    if ("dateReformat" in subInstruction) {
        let format = subInstruction.dateReformat
        let date = dateFormat.parse(searchedText,format.from)
        searchedText = dateFormat.format(date,format.to)
    }
    return searchedText
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
    await browseInstruction(globalInstruction, page, response, "result")
    await browser.close()


    // } catch (error) {
    //     await browser.close()
    //     response = { 'status': 'ERR', "error": error.stack }
    // }
    await console.log(JSON.stringify(response))
    // await console.log(JSON.stringify(response.result.trips[0].details.roundTrips))
}

main()




// added to instr 
// "repeatedElements":[
//     "//table[descendant::td[contains(@class,\"product-travel-date\")]] [not(descendant::h1) ]",
//     "//table[contains(@class,\"product-details\")]",
//     "//table[contains(@class,\"passengers\")]"
// ],