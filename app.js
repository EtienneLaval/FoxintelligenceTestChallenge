const puppeteer = require('puppeteer')
let dateFormat = require('date-and-time')
const fs = require("fs")
const globalInstruction = JSON.parse(fs.readFileSync("instruction.json"))
response = { 'status': 'ok' }

const browseInstruction = async (instruction, element, responseObject, responseKey, repeat) => {
    instruction = Object.assign({}, instruction)
    console.log('repeat at ' + responseKey + ': ' + repeat)


    let res = {}
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
                    await browseInstruction(__content, element, res[__name], __name, repeat ? Array.from(repeat) : undefined)
                }
            } else if ("xpath" in instruction[key]) {
                let searchedSubElement = await searchWithInstruction(instruction[key], element, repeat)
                if (!searchedSubElement.length > 0) {
                    endSubRepeat = true
                } else {
                    res[key] = await treatSearchedElement(searchedSubElement, instruction[key],repeat)
                }
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
            console.log(res)
            Array.isArray(responseObject) ? responseObject.push(res) : responseObject[responseKey] = res
            console.log('----')
        }
    }


}
const searchWithInstruction = async (subInstruction, element, repeat) => {
    if (subInstruction.repeatedIn) {
        return await searchWhenMultipleTarget(subInstruction, element, repeat)
    } else {
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
    console.log(newXpath)
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
    if ("type" in subInstruction && subInstruction.type == "float") {
        searchedText = parseFloat(searchedText)
    }
    if ("contentCondition" in subInstruction) {
        const contentCondition = subInstruction.contentCondition
        searchedText = searchedText.includes(contentCondition[0])?contentCondition[1]:contentCondition[2]
    }
    return searchedText
}

const main = async () => {
    const browser = await puppeteer.launch()

    try {
    const page = await browser.newPage()
    await page.goto('file:///' + process.cwd() + '/test.html')
    response.result = { 'trips': {}, 'custom': {} }
    await browseInstruction(globalInstruction, page, response, "result")
    await browser.close()


    } catch (error) {
        await browser.close()
        response = { 'status': 'ERR', "error": error.stack }
    }
    const humanReadableResult = JSON.stringify(response, null, 2)
    await console.log(humanReadableResult)
    fs.writeFile("response.json", humanReadableResult, function(err) {
        if(err) {
            return console.log(err)
        }
        console.log("The result was stored in response.json file !")
    })
}

main()