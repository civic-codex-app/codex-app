#!/bin/bash
# Open each page in Chrome and take a screenshot using the macOS screencapture tool
DIR="$(dirname "$0")/screenshots"
mkdir -p "$DIR"

pages=(
  "http://localhost:3000|01-homepage"
  "http://localhost:3000/politicians/donald-trump|02-politician-profile"
  "http://localhost:3000/compare?a=bernie-sanders&b=ted-cruz|03-compare"
  "http://localhost:3000/match|04-voter-match"
  "http://localhost:3000/issues|05-issues"
  "http://localhost:3000/issues/map|06-issue-map"
  "http://localhost:3000/elections|07-elections"
  "http://localhost:3000/bills|08-bills"
  "http://localhost:3000/report-cards|09-civic-profiles"
  "http://localhost:3000/insights|10-insights"
  "http://localhost:3000/insights/money-map|11-money-map"
  "http://localhost:3000/directory?state=TX|12-directory"
  "http://localhost:3000/dashboard|13-dashboard"
  "http://localhost:3000/account|14-account"
)

echo "Open each URL in your browser and press Enter to screenshot:"
for entry in "${pages[@]}"; do
  IFS='|' read -r url name <<< "$entry"
  echo ""
  echo ">>> $name: $url"
  open "$url"
  read -p "Press Enter when page is loaded to capture screenshot..."
  screencapture -x "$DIR/$name.png"
  echo "Saved: $DIR/$name.png"
done

echo ""
echo "All screenshots captured. Creating zip..."
cd "$DIR/.."
zip -r design-audit-screenshots.zip screenshots/ DESIGN_AUDIT.md
echo "Done! Zip at: $(pwd)/design-audit-screenshots.zip"
