const scrapeCategory = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage()
      console.log(">> Mở tab mới ...")
      await page.goto(url)
      console.log(">>Truy cập vào " + url)
      await page.waitForSelector("#shopify-section-all-collections")
      console.log(">> Website đã laod xong...")

      const dataCategory = await page.$$eval(
        "#shopify-section-all-collections > div.all-collections > div.sdcollections-content > ul.sdcollections-list > li",
        (els) => {
          dataCategory = els.map((el) => {
            return {
              category: el.querySelector("div.collection-name").innerText,
              link: el.querySelector("a").href,
            }
          })
          return dataCategory
        }
      )
      await page.close()
      console.log(">> Tab đã đóng.")
      resolve(dataCategory)
    } catch (error) {
      console.log("lỗi ở scrape category: " + error)
      reject(error)
    }
  })
const scrapeItems = (browser, url) =>
  new Promise(async (resolve, reject) => {
    let page = null
    try {
      page = await browser.newPage()
      console.log(">> Mở tab mới ...")
      await page.goto(url)
      console.log(">>Truy cập vào " + url)
      await page.waitForSelector("#collection_content")
      console.log(">> Website đã laod xong...")

      const items = await page.$$eval(
        "#collection-product-grid > div.grid-element",
        (els) => {
          return els.map((el) => {
            return el.querySelector("a.grid-view-item__link").href
          })
        }
      )

      await page.close()
      console.log(">> Tab đã đóng.")
      resolve(items)
    } catch (error) {
      console.log("lỗi ở scrape items: " + error)
      if (page) {
        try {
          await page.close()
          console.log(">> Tab đã đóng sau lỗi.")
        } catch (closeError) {
          console.log(">> Không thể đóng tab: " + closeError.message)
        }
      }
      reject(error)
    }
  })

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let newPage = await browser.newPage()
      console.log(">> Đã mở tab mới ...")
      await newPage.goto(url)
      console.log(">> Đã truy cập vào trang " + url)
      await newPage.waitForSelector("#PageContainer")
      console.log(">> Đã load xong tag main ...")

      const scrapeData = {}

      const category = await newPage.$$eval("nav.breadcrumb >a  ", (els) => {
        return els.map((el) => {
          return el.innerText
        }) // lấy tên danh mục
        return category
      })
      scrapeData.category = category

      // lấy tên sản phẩm
      const name = await newPage.$eval("header.section-header", (el) => {
        return el.querySelector("h3")?.innerText
      })
      scrapeData.name = name
      scrapeData.brand = name?.split(" ")[0] // Lấy tên thương hiệu từ tên sản phẩm

      // Lấy ảnh sp
      const thumb = await newPage.$eval("#ProductPhoto", (el) => {
        return el.querySelector("#ProductPhotoImg")?.src
      })
      scrapeData.thumb = thumb
      const images = await newPage.$$eval(
        "#ProductThumbs > div.owl-wrapper-outer > div.owl-wrapper > div.owl-item",
        (els) => {
          images = els.map((el) => {
            return el.querySelector("a.product-single__thumbnail").href
          })
          return images
        }
      )
      scrapeData.images = images

      // Lấy giá sp
      const price = await newPage.$eval("#ProductPrice", (el) => {
        return el.querySelector("span.money")?.innerText
      })
      scrapeData.price = price

      // Lấy mô tả sp
      const description = await newPage.$$eval(
        "div.product-single__description > ul > li",
        (els) => {
          description = els.map((el) => {
            return el?.innerText
          })
          return description
        }
      )
      scrapeData.description = description

      // lấy variants
      const variants = await newPage.$$eval(
        "form.product-single__form > div.product-form__item",
        (els) => {
          variants = els.map((el) => {
            const variants = el.querySelectorAll(
              "fieldset.single-option-radio > label"
            )
            const values = []
            for (let variant of variants) values.push(variant?.innerText)
            return {
              label: el.querySelector("label.single-option-radio__label")
                ?.innerText,
              variants: values,
            }
          })
          return variants
        }
      )
      scrapeData.variants = variants

      // Lấy thông tin sp
      const infomationTitles = await newPage.$$eval(
        "#tabs-information > ul > li",
        (els) => {
          infomationTitles = els.map((el) => {
            return el.querySelector("a")?.innerText
          })
          return infomationTitles
        }
      )
      const desc = await newPage.$eval("#desc", (el) => {
        return el?.textContent
      })
      const size = await newPage.$eval("#size", (el) => {
        return el?.innerText
      })
      const delivery = await newPage.$eval("#delivery", (el) => {
        return el?.textContent
      })
      const payment = await newPage.$eval("#payment", (el) => {
        return el?.innerText
      })
      scrapeData.infomations = {
        [infomationTitles[0]]: desc,
        [infomationTitles[1]]: size,
        [infomationTitles[2]]: delivery,
        [infomationTitles[3]]: payment,
      }

      console.log(">> Trình duyệt đã đóng.")
      resolve(scrapeData)
    } catch (error) {
      reject(error)
    }
  })
// Helper function to safely evaluate selectors that might not exist
const safeEval = async (
  page,
  selector,
  evaluationFunc,
  defaultValue = null
) => {
  try {
    const elementExists = await page.$(selector)
    if (elementExists) {
      return await page.$eval(selector, evaluationFunc)
    }
    return defaultValue
  } catch (error) {
    console.log(`Selector not found: ${selector}`)
    return defaultValue
  }
}

module.exports = {
  scrapeCategory,
  scraper,
  scrapeItems,
}
