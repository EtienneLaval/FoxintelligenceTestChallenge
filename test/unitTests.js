const chai = require('chai')
const should = chai.should()
// const puppeteer = require('puppeteer')
// const fs = require("fs")
const instructonBrowser = require('../browser')
const textParser = require('../textParser')

// const global = {}

describe('textParsers', async () => {
	describe('handleTreatment', async () => {
		it('should process regexp using last param', async () => {
			const instruction = { "treatment": ["(\\d){2}\/(\\d){2}\/(\\d){4}", "(repeat[repeat.length-1]-1)%2"] }
			const text = " PARIS  <>  LYON  -  les 02/09/2016 et 04/09/2016 "
			const repeat = [3]
			res = await (textParser.handleTreatment(instruction, text, repeat))
			res.should.equal("02/09/2016")
		})
		it('should leave unchanged if no treatment', async () => {
			const instruction = { "foo": "bar" }
			const text = "baz"
			const repeat = [3]
			res = await (textParser.handleTreatment(instruction, text, repeat))
			res.should.equal(text)
		})
	})
	describe('handleReplace', async () => {
		it('should leave unchanged if no replace', async () => {
			const instruction = { "foo": "bar" }
			const text = "baz"
			res = await (textParser.handleReplace(instruction, text))
			res.should.equal(text)
		})
		it('should replace when one row instruction', async () => {
			const instruction = { "replace": [[",", "."]] }
			const text = "1,0,1"
			res = await (textParser.handleReplace(instruction, text))
			res.should.equal("1.0.1")
		})
		it('should replace when n row instruction', async () => {
			const instruction = { "replace": [[",*0{1,2}.€", ""], [",", "."]] }
			const text = "25,50 €"
			res = await (textParser.handleReplace(instruction, text))
			res.should.equal("25.5")
		})

	})
	describe('handleDateFormat', async () => {
		it('should leave unchanged if no dateReformat', async () => {
			const instruction = { "foo": "bar" }
			const text = "baz"
			res = await (textParser.handleDateFormat(instruction, text))
			res.should.equal(text)
		})
		it('should change date format as desired', async () => {
			const instruction = { "dateReformat": { "from": "DD/MM/YYYY", "to": "YYYY-MM-DD HH:mm:ss.mmm[Z]" } }
			const text = "02/09/2016"
			res = await (textParser.handleDateFormat(instruction, text))
			res.should.equal("2016-09-02 00:00:00.000Z")
		})
	})
	describe('handleContentCondition', async () => {
		it('should leave unchanged if no contentCondition', async () => {
			const instruction = { "foo": "bar" }
			const text = "baz"
			res = await (textParser.handleContentCondition(instruction, text))
			res.should.equal(text)
		})
		it('should return option 1 if present', async () => {
			const instruction = { "contentCondition": ["Billet échangeable", "échangeable", "non échangeable"] }
			const text = "Billet échangeable et ..."
			res = await (textParser.handleContentCondition(instruction, text))
			res.should.equal("échangeable")
		})
		it('should return option 2 if not present', async () => {
			const instruction = { "contentCondition": ["Billet échangeable", "échangeable", "non échangeable"] }
			const text = "Billet non échangeable ..."
			res = await (textParser.handleContentCondition(instruction, text))
			res.should.equal("non échangeable")
		})
	})
	describe('handleType', async () => {
		it('should leave unchanged if no type', async () => {
			const instruction = { "foo": "bar" }
			const text = "baz"
			res = await (textParser.handleType(instruction, text))
			res.should.equal(text)
		})
		it('should parse float as desired', async () => {
			const instruction = { "type": "float" }
			const text = "125.2"
			res = await (textParser.handleType(instruction, text))
			res.should.equal(125.2)
		})
	})

})
describe('browser', async () => {
	// before (async ()=>{
	//     global.browser = await puppeteer.launch()
	// 	global.page = await global.browser.newPage()
	// 	console.log(process.cwd());

	//     await global.page.goto('file:///' + process.cwd() + '/test/test.html')
	// })
	// after (async() => {
	//     global.browser.close()
	// })
	// describe('handleTreatment', async () => {

	// 	it('should process regexp using last param', async () => {
	// 	})
	// })
})
