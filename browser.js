const textParser = require('./textParser')


const browseInstruction = async (instruction, element, responseObject, responseKey, repeat) => {
    instruction = Object.assign({}, instruction)
    const res = {}
    let endSubRepeat = false
    if ("__repeat" in instruction) {
        if (!repeat) { repeat = [] }
        delete instruction.__repeat
        repeat[repeat.length] = 1
        while (repeat.length > 0) {
            await browseInstruction(instruction, element, responseObject, responseKey, repeat)
        }
    } else {
        for (const key in instruction) {
            if (key == "__condition") {
                let { __rule, __name, __content } = instruction[key]
                if (__rule[0] == "repeat" && JSON.stringify(repeat) == __rule[1]) {
                    if (Array.isArray(__content)) {
                        res[__name] = []
                        __content = __content[0]
                    }
                    await browseInstruction(__content, element, res[__name], __name, repeat ? Array.from(repeat) : undefined)
                }
            } else if ("xpath" in instruction[key]) {
                const searchedSubElement = await searchWithInstruction(instruction[key], element, repeat)
                if (!searchedSubElement.length > 0) {
                    endSubRepeat = true
                } else {
                    res[key] = await treatSearchedElement(searchedSubElement, instruction[key], repeat)
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
            const length = repeat.length
            if (endSubRepeat) {
                repeat.pop()
            } else {
                repeat[repeat.length - 1]++
                Array.isArray(responseObject) ? responseObject.push(res) : responseObject[responseKey] = res
            }
        } else {
            Array.isArray(responseObject) ? responseObject.push(res) : responseObject[responseKey] = res
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
    const { repeatedIn, xpath } = subInstruction
    let repeatedSequence = ''
    for (i in repeatedIn) {
        repeatedSequence = '(' + repeatedSequence + repeatedIn[i] + '[' + repeat[i] + '])'
    }
    const newXpath = repeatedSequence + xpath
    const res = await element.$x(newXpath)
    return res

}
const treatSearchedElement = async (searchedElement, subInstruction, repeat) => {
    let searchedText = await (await searchedElement[0].getProperty('textContent')).jsonValue()
    searchedText = await textParser.handleTreatment(subInstruction, searchedText, repeat)
    searchedText = await textParser.handleReplace(subInstruction, searchedText)
    searchedText = await textParser.handleDateFormat(subInstruction, searchedText)
    searchedText = await textParser.handleContentCondition(subInstruction, searchedText)
    searchedText = searchedText.trim()
    searchedText = await textParser.handleType(subInstruction, searchedText)
    return await searchedText
}

module.exports = {browseInstruction}
