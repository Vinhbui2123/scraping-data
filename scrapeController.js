const scrapers = require("./scraper")
const fs = require("fs")

const scrapeController = async (browserInstance) => {
  const url = "https://digital-world-2.myshopify.com/"
  try {
    let browser = await browserInstance
    // gọi hàm cạo ở file s scrape
    const categories = await scrapers.scrapeCategory(browser, url)
    const catePromise = []
    for (let category of categories)
      catePromise.push(scrapers.scrapeItems(browser, category.link))
    const itemLinks = await Promise.all(catePromise)
    const productPromise = []
    for (let item of itemLinks) {
      for (let link of item) {
        productPromise.push(await scrapers.scraper(browser, link))
      }
    }
    const rs = await Promise.all(productPromise)
    fs.writeFile("ecommerce.json", JSON.stringify(rs), (err) => {
      if (err) console.log("Ghi data vô file json thất bại: " + err)
      console.log("Thêm data thanh công !.")
    })
    await browser.close()
  } catch (e) {
    console.log("Lỗi ở scrape controller: " + e)
  }
}

module.exports = scrapeController
