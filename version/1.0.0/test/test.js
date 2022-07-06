window.addEventListener("load", function() {
	const element = document.getElementById("test_md_tag")
	const btn = document.getElementById("start_btn")

	btn.addEventListener("click", function(event) {
		btn.disabled = true
		
		try {
			element.debugEnabled = false
			const xss_injector = new XSS()
			xss_injector.debugEnabled = false
			xss_injector.setInjector(async function(payload) { 
				await element.setInput(payload) 
				return (!this.stubs.modified.alert.called() && !this.stubs.modified.console.log.called())
			})
			xss_injector.startInjector({ logResume: true, export: { enabled: true, stringify: false } })

			btn.disabled = false
		} catch (e) {
			btn.disabled = false
		}
	})
})