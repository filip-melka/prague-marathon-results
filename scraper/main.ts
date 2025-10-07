import puppeteer from "puppeteer"
import { runCzechScraper } from "./runczech-scraper"
import { saveRaceResultsAsCSV } from "./save-results"

/* 
  Marathon results 1995 - 2025
  Years 2020 and 2021 are missing, as the Prague Marathon was cancelled due to Coronavirus
*/
const urls = [
  "https://www.runczech.com/en/results/orlen-prague-marathon-2025",
  "https://www.runczech.com/en/results/maratonsky-vikend-4-kvetna-5-kvetna-2024-2",
  "https://www.runczech.com/en/results/maratonsky-vikend-6-kvetna-7-kvetna-2023-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-7-kvetna-8-kvetna-2022-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-4-5-kvetna-2019-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-5-6-kvetna-2018-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-5-7-kvetna-2017-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-6-8-kvetna-2016-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-2-3-kvetna-2015-2",
  "https://www.runczech.com/en/results/volkswagen-maratonsky-vikend-10-11-kvetna-2014-2",
  "https://www.runczech.com/en/results/volkswagen-maraton-praha-4",
  "https://www.runczech.com/en/results/volkswagen-maraton-praha-3",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2011-2",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2010-2",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2009-2",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2008-2",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2007-2",
  "https://www.runczech.com/en/results/volkswagen-prague-marathon-2006-2",
  "https://www.runczech.com/en/results/prague-international-marathon-17",
  "https://www.runczech.com/en/results/prague-international-marathon-16",
  "https://www.runczech.com/en/results/prague-international-marathon-15",
  "https://www.runczech.com/en/results/prague-international-marathon-14",
  "https://www.runczech.com/en/results/prague-international-marathon-13",
  "https://www.runczech.com/en/results/prague-international-marathon-12",
  "https://www.runczech.com/en/results/prague-international-marathon-18",
  "https://www.runczech.com/en/results/prague-international-marathon-19",
  "https://www.runczech.com/en/results/prague-international-marathon-20",
  "https://www.runczech.com/en/results/prague-international-marathon-21",
  "https://www.runczech.com/en/results/prague-international-marathon-22",
]

async function run() {
  let browser
  let page
  try {
    browser = await puppeteer.launch()
    page = await browser.newPage()

    for (const url of urls) {
      try {
        const { results, year } = await runCzechScraper(url, page)
        const saved = saveRaceResultsAsCSV(
          results,
          "datasets",
          `marathon_results_${year}.csv`
        )
        if (!saved) {
          console.error(`❌ Failed to save results for year ${year}`)
        }
      } catch (err) {
        console.error(`❌ Error processing URL: ${url}`)
        console.error(err)
        // Continue to next URL
      }
    }
  } finally {
    if (page) {
      try {
        await page.close()
      } catch (err) {
        console.error("Error closing page:", err)
      }
    }
    if (browser) {
      try {
        await browser.close()
      } catch (err) {
        console.error("Error closing browser:", err)
      }
    }
  }
}

run().catch(console.error)
