#!/bin/bash
# Background tarot card downloader
# Run with: bash download_cards.sh
# Will download remaining cards with 30s delays to avoid Wikipedia rate limiting

CARDS_DIR="$(dirname "$0")/cards"
API_URL="http://localhost:3005/api/cards"
DELAY=30  # seconds between downloads

mkdir -p "$CARDS_DIR"

echo "Fetching card URLs..."
CARDS_JSON=$(curl -s "$API_URL")
TOTAL=$(echo "$CARDS_JSON" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))")
echo "Total cards: $TOTAL"

echo "$CARDS_JSON" | python3 -c "
import sys,json,time,os,subprocess,urllib.request

data = json.load(sys.stdin)
cards = data['data']
cards_dir = '$CARDS_DIR'
delay = $DELAY

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://upload.wikimedia.org/',
}

downloaded = 0
failed = []

for card in cards:
    cid = card['id']
    url = card.get('img', '')
    if not url:
        print(f'Skip {cid}: no URL')
        continue
    
    fpath = os.path.join(cards_dir, f'card_{cid:02d}.jpg')
    if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
        print(f'Skip {cid}: already exists')
        downloaded += 1
        continue
    
    print(f'Downloading {cid}: {card.get(\"name_cn\",\"?\")}...', end='', flush=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as r:
            content = r.read()
            if len(content) > 5000:
                with open(fpath, 'wb') as f:
                    f.write(content)
                print(f' OK ({len(content)//1024}KB)')
                downloaded += 1
            else:
                print(f' FAIL: too small')
                failed.append(cid)
    except Exception as e:
        print(f' FAIL: {e}')
        failed.append(cid)
    
    time.sleep(delay)

print(f'\\nDone! Downloaded: {downloaded}, Failed: {len(failed)}')
if failed:
    print(f'Failed IDs: {failed}')
" 2>&1

echo "Run again later to continue downloading failed cards."
