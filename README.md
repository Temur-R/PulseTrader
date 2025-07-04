# PulseTrader 

> **Stay ahead of the market in a single glance.** PulseTrader lets busy professionals browse, track, and receive timely alerts on thousands of NASDAQ‑listed companies—without surprise fees or complex plans. Pulsetrader was made for the **Permissionless IV hackathon.**

---

## Table of Contents

1. [Features](#features)
2. [Live Demo](#live-demo)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Plans & Pricing](#plans--pricing)
6. [Roadmap](#roadmap)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

* **Massive Coverage** – Browse and track **thousands of NASDAQ stocks** with real‑time price updates.
* **Intelligent Alerts** – Opt‑in to notifications when a company:

  * Wins or loses a **lawsuit**
  * Announces **mergers, acquisitions, or divestitures**
  * Faces **regulatory actions** or other critical events likely to affect the stock price
* **Clean Pricing** – Clear, transparent plans—**no hidden “gotcha” fees or surprise renewals**.
* **Mobile‑First UI** – Snappy, responsive design built with React and Tailwind.
* **Secure Auth** – OAuth 2.0 and optional 2‑FA keep your account safe.

---

## Live Demo

https://youtu.be/IebCFwhdtFA

---

## Getting Started

These instructions will get a copy of the project running locally.

### Prerequisites

* **Node.js ≥ 20**
* **npm ≥ 10** (or **pnpm / yarn**)
* A free account at [Polygon.io](https://polygon.io/) *or* your preferred market‑data provider
* A Firebase project if you plan to use push notifications

### Installation

```bash
# 1. Clone the repo
$ git clone https://github.com/<your‑org>/pulsetrader.git
$ cd pulsetrader

# 2. Install dependencies
$ npm ci

# 3. Copy environment variables
$ cp .env.example .env
#   └─ Fill in API keys for market data, Firebase, etc.

# 4. Start the development server
$ npm run dev
```

The app will be running at **[http://localhost:5173](http://localhost:5173)**.

---

## Usage

1. **Search** for a NASDAQ symbol (e.g., `AAPL`).
2. Click **Track** to add it to your watchlist.
3. Receive push/email notifications whenever a qualifying event is detected.

> **How do alerts work?**
> ‑ Newscraper trusted news sources and court dockets every 15 minutes.
> ‑ OpenAI performs sentiment analysis on returned sources from newscraper
> ‑ Notifications upon OpenAI's analysis

---


## Roadmap

* [ ] Frontend & backend Flask configuration to implement newscraper

Feel free to suggest features by opening an issue!

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Local Dev Tips

* Use `npm run lint` and `npm run test` before pushing.
* Follow the Conventional Commits standard for commit messages.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
