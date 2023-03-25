import { Encoder, ErrorCorrectionLevel } from "@nuintun/qrcode"
import { writeFileSync } from "fs"
import { totpUriExamples } from "./totpUriExamples.mjs"

const RELATIVE_OUTPUT_PATH = "./test/qr_codes/generated"

for (const { name, url } of totpUriExamples) {
  const qrCode = createQrCode(url)
  const dataUrl = qrCode.toDataURL(5, 10)
  const base64ImageData = dataUrl.substring(dataUrl.indexOf(","))
  const imageData = Buffer.from(base64ImageData, "base64")
  writeFileSync(`${RELATIVE_OUTPUT_PATH}/${name}.gif`, imageData)
}

function createQrCode(url) {
  const qrCode = new Encoder()

  qrCode.setEncodingHint(true)
  qrCode.setVersion(0)
  qrCode.setErrorCorrectionLevel(ErrorCorrectionLevel.H)
  qrCode.write(url)
  qrCode.make()

  return qrCode
}
