import * as fs from "fs"

const LOG_FILE_PATH = "debug_log.txt"

export function log(line: string) {
  const formattedLine = format(line)
  const logFile = fs.openSync(LOG_FILE_PATH, "a")
  const lineCharCodes = []
  for (let i = 0; i < formattedLine.length; i++) {
    lineCharCodes[i] = formattedLine.charCodeAt(i)
  }
  fs.writeSync(logFile, new Uint8Array(lineCharCodes))
  fs.closeSync(logFile)
}

function format(line: string) {
  return `${new Date().toISOString()}: ${line}\n`
}

export function outputLog() {
  if (fs.existsSync(LOG_FILE_PATH)) {
    const logFile = fs.openSync(LOG_FILE_PATH, "r")

    const buffer = new ArrayBuffer(100)
    let position = 0
    let readRemainder = ""

    while (fs.readSync(logFile, buffer, 0, 100, position)) {
      const readString = String.fromCharCode.apply(
        null,
        new Uint8Array(buffer)
      ) as string

      const lines = readString.split("\n")
      if (lines.length > 0) {
        if (readRemainder) {
          lines[0] = readRemainder + lines[0]
        }
        const lastLine = lines[lines.length - 1]
        if (lastLine.charAt(lastLine.length - 1) !== "\n") {
          readRemainder = lines.pop()
        }

        lines.forEach(line => console.log(line)) // eslint-disable-line no-console
      }

      position += 100
    }
    fs.closeSync(logFile)
  } else {
    console.log("Log does not exist yet.") // eslint-disable-line no-console
  }
}
