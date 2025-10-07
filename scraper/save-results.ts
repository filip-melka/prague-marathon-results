import { RaceResult } from "./types"
import fs, { existsSync, mkdirSync } from "fs"
import path from "path"

export function saveRaceResultsAsCSV(
  results: RaceResult[],
  dir: string,
  fileName: string
) {
  const headers = [
    "ID",
    "DAY",
    "MONTH",
    "YEAR",
    "NAME",
    "OFFICIAL TIME",
    "OFFICIAL TIME IN SECONDS",
    "CHIP TIME",
    "CHIP TIME IN SECONDS",
    "NATIONALITY",
    "SEX",
    "START NUMBER",
  ]

  const rows = results.map((r, i) => [
    i + 1,
    r.day,
    r.month,
    r.year,
    r.name,
    r.officialTime,
    r.officialTimeInSeconds,
    r.chipTime,
    r.chipTimeInSeconds,
    r.nationality,
    r.sex,
    r.startNumber,
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) =>
          typeof value === "number"
            ? value
            : `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    ),
  ].join("\n")

  const resolvedDir = path.resolve(dir)

  const safeFileName = path.basename(fileName)

  if (safeFileName !== fileName) {
    throw new Error("Invalid fileName: path separators are not allowed.")
  }

  const fullPath = path.join(resolvedDir, safeFileName)

  const rel = path.relative(resolvedDir, path.resolve(fullPath))
  if (rel.split(path.sep)[0] === "..") {
    throw new Error(
      "Path traversal detected: file would be created outside the target directory."
    )
  }
  try {
    if (!existsSync(resolvedDir)) {
      mkdirSync(resolvedDir, { recursive: true })
    }

    fs.writeFileSync(fullPath, csv, "utf8")
    console.log(`✅ CSV file created: ${fullPath}`)

    return true
  } catch (error) {
    console.error(error)

    return false
  }
}
