import { Page } from "puppeteer"
import { RaceResult } from "./types"

export async function runCzechScraper(url: string, page: Page) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
  await page.setViewport({ width: 1080, height: 1024 })
  await page.waitForSelector(".page-numbers")
  const pageLinks = await page.$$eval(".page-numbers a", (links) =>
    links.map((link) => link.innerText)
  )
  const noOfPages =
    pageLinks.length >= 2 ? Number(pageLinks[pageLinks.length - 2]) : 1

  let currentPage = 1

  let day: number, month: number, year: number
  try {
    ;[day, month, year] = await page.$eval(".fa-calendar + span", (el) =>
      el.innerText.replaceAll(" ", "").split(".").map(Number)
    )
  } catch (error) {
    throw new Error(`Failed to extract date from URL ${url}: ${error}`)
  }

  const results: RaceResult[] = []

  while (currentPage <= 2) {
    console.log(`Scraping page ${currentPage} out of ${noOfPages}`)

    await page.goto(`${url}?current_page=${currentPage}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    const tableData = await page.$$eval(
      "table#js-data-result-grid tbody tr",
      (rows) =>
        rows.map((row) =>
          Array.from(row.querySelectorAll("td")).map(
            (cell: HTMLTableCellElement) => cell.innerText.trim()
          )
        )
    )

    tableData.forEach((dataArr: string[]) => {
      results.push({
        day,
        month,
        year,
        name: dataArr[2],
        officialTime: dataArr[3],
        officialTimeInSeconds: timeToSeconds(dataArr[3]),
        chipTime: dataArr[4],
        chipTimeInSeconds: timeToSeconds(dataArr[4]),
        startNumber: dataArr[5],
        nationality: dataArr[6],
        sex: dataArr[5].startsWith("F") ? "F" : "M",
      })
    })

    currentPage++
  }

  return { results, year, month, day }
}

function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(":").map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0]
}
