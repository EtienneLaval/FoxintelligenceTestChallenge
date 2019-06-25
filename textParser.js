const dateFormat = require('date-and-time')

const handleTreatment = async (instruction, searchedText, repeat) => {
    return new Promise((resolve, reject) => {
        if ("treatment" in instruction) {
            const pattern = new RegExp(instruction.treatment[0], 'g')
            const treatEval = eval(instruction.treatment[1]) //it's a very bad pattern, refactor it once able to perform concat on xpath with the dom handler 
            searchedText = searchedText.match(pattern)[treatEval]
        }
        resolve (searchedText)
    })
}
const handleReplace = async (instruction, searchedText) => {
    return new Promise((resolve, reject) => {
        if ("replace" in instruction) {
            for (const replace of instruction.replace) {
                const pattern = new RegExp(replace[0], 'g')
                searchedText = searchedText.replace(pattern, replace[1])
            }
        }
        resolve (searchedText)
    })
}
const handleDateFormat = async (instruction, searchedText) => {
    return new Promise((resolve, reject) => {
        if ("dateReformat" in instruction) {
            searchedText = searchedText.trim()
            const format = instruction.dateReformat
            const date = dateFormat.parse(searchedText, format.from)
            searchedText = dateFormat.format(date, format.to)
        }
        resolve (searchedText)
    })
}
const handleContentCondition = async (instruction, searchedText) => {
    return new Promise((resolve, reject) => {
        if ("contentCondition" in instruction) {
            const contentCondition = instruction.contentCondition
            searchedText = searchedText.includes(contentCondition[0]) ? contentCondition[1] : contentCondition[2]
        }
        resolve (searchedText)
    })
}

const handleType = async (instruction, searchedText) => {
    return new Promise((resolve, reject) => {
        if ("type" in instruction && instruction.type == "float") {
            searchedText = parseFloat(searchedText)
        }
        resolve (searchedText)
    })
}

module.exports = {handleTreatment, handleReplace, handleDateFormat, handleContentCondition, handleType}