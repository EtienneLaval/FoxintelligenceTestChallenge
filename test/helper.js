class FakeDom {
	constructor() {
		this.structure = [1, 1, 1, 1, 1, 1, 1, 1, 0]
		this.loopLength = this.structure.length,
			this.index = 0,
			this.$x = async (query) => {
				let response
				if (this.structure[this.index % this.loopLength]) {
					response = [
						{
							getProperty: async () => {
								return {
									jsonValue: async () => {
										return query
									}
								}
							}
						}
					]
				} else {
					response = []
				}
				this.index++
				return response

			}
	}

}
const instructions = {
	"a": [{
		"b": { "xpath": "b" },
		"c": {
			"d": { "xpath": "d", },
			"e": [{
				"__repeat": true,
				"f": { "repeatedIn": ["f"], "xpath": "f" },
				"__condition": {
					"__rule": ["repeat", "[4]"],
					"__name": "g",
					"__content": [
						{
							"g": { "repeatedIn": ["g"], "xpath": "g", }
						}
					]
				}
			}]
		}
	}]
}
module.exports = {FakeDom,instructions}