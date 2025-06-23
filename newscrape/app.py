from flask import Flask, request
from datetime import datetime, timedelta, timezone
import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

# === Firebase Initialization ===
cred = credentials.Certificate("keys\pulsetrader-3505c-firebase-adminsdk-fbsvc-fc6207ef3d.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

import os
from dotenv import load_dotenv
 # Load environment variables from .env file
load_dotenv()

EVENT_API_KEY = os.environ.get('api_key')
EVENT_API_URL = "https://eventregistry.org/api/v1/article/getArticles"

# === Helper: Scrape full body from article URL ===
def scrape_article_body(url):
    try:
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs)
        return text.strip()
    except Exception as e:
        print(f"[!] Failed to scrape body for {url}: {e}")
        return ""

# === Main Route ===
@app.route("/", methods=["GET"])
def run_news_pipeline():
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    one_hour_ago = now - timedelta(hours=24)

    users_ref = db.collection("Users")
    users = users_ref.stream()

    count = 0  # how many articles queued

    for user_doc in users:
        user_data = user_doc.to_dict()
        email = user_data.get("Email")
        print(email)
        companies = user_data.get("Company", {})  # dict of {company_name: [conditions]}
        print(companies)
        for company, conditions in companies.items():
            payload = {
                "apiKey": EVENT_API_KEY,
                "keyword": company,
                "lang": "eng",
                "sortBy": "date",
                "action": "getArticles",
                "dateStart": one_hour_ago.strftime('%Y-%m-%d'),
                "dateEnd": now.strftime('%Y-%m-%d')
            }

            res = requests.post(EVENT_API_URL, json=payload)
            if res.status_code != 200:
                print(f"[!] Error querying for '{company}': {res.status_code}")
                continue

            articles = res.json().get("articles", {}).get("results", [])
            for article in articles:
                url = article.get("url")
                if not url:
                    continue

                body_text = scrape_article_body(url)

                result = {
                    "title": article.get("title"),
                    "body": body_text,
                    "published": article.get("dateTimePub"),
                    "email": email,
                    "company": company,
                    "conditions": conditions,
                    "queuedAt": firestore.SERVER_TIMESTAMP
                }

                db.collection("QueuedArticles").add(result)
                count += 1

    return {"queued_count": count}, 200

# === Run Locally ===
if __name__ == "__main__":
    app.run(port=5000)
