#!/usr/bin/env sh

if [ -z "$#" ]; then
  echo "Usage: $(basename "$0")"
  exit 1
fi

readonly LICENSE_FILE="./settings/licenses.js"

printf "/* generate with npm run generate-licenses-data */\\n// prettier-ignore\\nexport default" > "${LICENSE_FILE}" \
  && npx license-checker-rseidelsohn --customPath .license-checker-format.json --json --production >> "${LICENSE_FILE}"
