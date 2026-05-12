# MyBidQuick Welcome Email Sequence

**Sender:** tim@mybidquick.com (Tim Sullivan)
**Sequence type:** Onboarding
**Goal:** Get new tenants from signup → branded page live → first leads → credit purchase
**Trigger:** New account creation at mybidquick.com/#/signup

---

## Sequence Overview

| # | Subject Line | Purpose | Timing | Primary CTA |
|---|-------------|---------|--------|-------------|
| 1 | Welcome to MyBidQuick — your quote page is live | Confirm signup, link to their page, set expectations | Immediately (Day 0) | Visit your quote page |
| 2 | 3 things to do in your first 10 minutes | Drive dashboard setup (logo, colors, pricing) | Day 1 | Open your dashboard |
| 3 | Your secret weapon: the upsell cascade | Teach the value of tiered packages + upsell flow | Day 3 | Preview your quote flow |
| 4 | How to get your first leads this week | Actionable marketing tactics (embed, QR, social) | Day 5 | Grab your embed code |
| 5 | Your 3 free credits are waiting — here's what comes next | Nudge toward first real use + credit purchase | Day 7 | Buy your first credit pack |

---

## Sequence Flow

```
[Signup] --> Email 1 (Day 0, immediate)
                |
                v
          Email 2 (Day 1)
                |
          Opened? ──No──> Resend Email 2 with new subject (Day 2)
                |
               Yes
                |
                v
          Email 3 (Day 3)
                |
                v
          Email 4 (Day 5)
                |
                v
          Email 5 (Day 7)
                |
          [EXIT: Sequence complete]

EXIT EARLY: If tenant purchases credits at any point → skip remaining emails, move to "Active Tenant" list
```

---

## Email 1: Welcome (Day 0 — Immediate)

**Subject line options:**
1. Welcome to MyBidQuick — your quote page is live
2. You're in. Your branded quote page is ready.
3. Your quoting page is live — take a look

**Preview text:** Your customers can start getting instant quotes right now.

**Purpose:** Confirm signup worked, show them their live page, build excitement.

**Body:**

Hey {{first_name}},

Welcome to MyBidQuick — you just set up the fastest way for your customers to get cleaning quotes.

Your branded quote page is already live:

**→ {{slug}}.mybidquick.com**

That's your page. Your company name, your services, your pricing rules. When a customer fills out a quote, you get their name, email, phone, address, and exactly what they need — delivered straight to your dashboard.

You're starting with **3 free credits**, which means your first 3 leads are on us.

Here's what to do next:

1. **Visit your dashboard** to upload your logo and set your brand colors
2. **Review your pricing** to make sure the tiers match your market
3. **Share your link** — text it to a friend and watch a test quote come through

If you have any questions, just reply to this email. I read every one.

Talk soon,
Tim Sullivan
MyBidQuick

**CTA button:** Open Your Dashboard → https://www.mybidquick.com/#/login

---

## Email 2: Quick Setup Wins (Day 1)

**Subject line options:**
1. 3 things to do in your first 10 minutes
2. Make your quote page look like YOU
3. Quick wins: logo, colors, and your first test quote

**Preview text:** Upload your logo, set your colors, run a test quote — takes 10 minutes.

**Purpose:** Drive dashboard engagement and branding setup so the page feels like theirs.

**Body:**

Hey {{first_name}},

Most cleaning companies that get results with MyBidQuick do three things on day one. Takes about 10 minutes:

**1. Upload your logo**
Head to your dashboard → Settings → Brand. Upload your company logo and it shows up on your quote page instantly.

**2. Pick your brand colors**
Choose your primary and accent colors so your quote page matches your website, truck wraps, and business cards.

**3. Run a test quote**
Open {{slug}}.mybidquick.com on your phone and fill it out like a customer would. See exactly what they see. Check that the pricing feels right for your market.

That's it. Once those three things are done, your page is ready to send to real customers.

Quick tip: your quote page works great on mobile — most of your customers will use it from their phone after seeing your yard sign, business card, or social media post.

— Tim

**CTA button:** Open Your Dashboard → https://www.mybidquick.com/#/login

---

## Email 3: The Upsell Advantage (Day 3)

**Subject line options:**
1. Your secret weapon: the upsell cascade
2. How to grow every ticket without saying a word
3. The feature that's worth more than the rest combined

**Preview text:** House wash customer? They probably need windows and gutters too.

**Purpose:** Teach the upsell cascade — this is what makes MBQ different and drives higher revenue.

**Body:**

Hey {{first_name}},

Here's the thing about cleaning customers: they almost never buy just one service.

The person who needs their house washed? Their windows are dirty too. And their gutters haven't been cleaned in two years.

MyBidQuick has a built-in upsell cascade that handles this automatically:

**House Wash → Window Cleaning → Gutter Cleaning**

After a customer selects their house wash package, the quote flow suggests window cleaning. After that, gutter cleaning. Each service offers three tiers — Standard, Premium, and Platinum — so customers can choose their comfort level.

The result? Your average ticket goes up by 40-60% without you lifting a finger or making a single phone call.

And here's the best part — the customer chose to add those services themselves. No awkward upselling, no pressure. Just a smooth flow that makes it easy to say yes.

Go check it out: open {{slug}}.mybidquick.com and walk through the full flow.

— Tim

**CTA button:** Preview Your Quote Flow → https://{{slug}}.mybidquick.com

---

## Email 4: Get Your First Leads (Day 5)

**Subject line options:**
1. How to get your first leads this week
2. 5 places to put your quote link today
3. Your quote page is live — now get it in front of people

**Preview text:** Five free ways to start driving traffic to your quote page.

**Purpose:** Give concrete, actionable marketing tactics so they actually use the tool.

**Body:**

Hey {{first_name}},

Your quote page is set up, your branding looks good — now let's get some customers to it.

Here are 5 things you can do today (all free) to start generating leads:

**1. Add it to your Google Business Profile**
Go to your GBP → Edit → Website. Paste your MyBidQuick URL. Every person who finds you on Google Maps now has a one-click path to a quote.

**2. Put it in your social media bio**
Instagram, Facebook, TikTok — update your bio link to {{slug}}.mybidquick.com. Every follower is now one tap from a quote.

**3. Embed it on your website**
Go to Dashboard → Embed Code. Copy the snippet and paste it into your website. Three options: full embed, popup button, or simple link.

**4. Print QR codes on everything**
Dashboard → QR Code. Download it and put it on your business cards, door hangers, yard signs, flyers, and truck magnets. Customers scan with their phone and land right on your quote page.

**5. Text it to past customers**
Got a list of past customers? Send them a text: "Hey! We just launched instant online quotes. Get yours in 60 seconds: {{slug}}.mybidquick.com"

Start with just one of these today. The leads will follow.

— Tim

**CTA button:** Get Your Embed Code → https://www.mybidquick.com/#/login

---

## Email 5: Free Credits + Next Steps (Day 7)

**Subject line options:**
1. Your 3 free credits are waiting
2. One week in — here's what's next
3. Ready to start closing leads?

**Preview text:** You've got 3 free credits. Here's how to put them to work.

**Purpose:** Nudge toward activation and first credit purchase. Create urgency.

**Body:**

Hey {{first_name}},

It's been a week since you signed up for MyBidQuick. Quick check-in:

**Your 3 free credits are still available.**

Each credit = one qualified lead. That means a customer's name, email, phone, address, and the exact services they want — delivered to your dashboard the second they submit.

If you haven't sent anyone to your quote page yet, now's the time. Pick one tactic from my last email and try it today.

And when those 3 free leads come through (and they will), here's what your credit packs look like:

- **Starter** — 10 credits for $25 ($2.50/lead)
- **Growth** — 25 credits for $50 ($2.00/lead)
- **Pro** — 50 credits for $85 ($1.70/lead)
- **Agency** — 100 credits for $150 ($1.50/lead)

For context: if your average cleaning job is $300 and you close even 30% of your leads, a $50 credit pack returns $2,250 in revenue. That's a 45x return.

No monthly fees. No contracts. Buy credits when you need them.

Reply to this email if you have any questions — I'm here to help you win.

— Tim

**CTA button:** Buy Credits → https://www.mybidquick.com/#/login

---

## Performance Benchmarks (Targets)

| Metric | Target | Good | Great |
|--------|--------|------|-------|
| Open rate | 50% | 60% | 70%+ |
| Click-through rate | 10% | 15% | 20%+ |
| Credits purchased (within 14 days) | 15% | 25% | 35%+ |
| Unsubscribe rate | <1% | <0.5% | <0.3% |

---

## A/B Test Suggestions

1. **Email 1 subject line:** "Welcome to MyBidQuick" (direct) vs "You're in. Your quote page is ready." (casual) — measure open rate
2. **Email 5 CTA:** "Buy Credits" (direct) vs "See Pricing" (softer) — measure click-through rate
3. **Email 4 timing:** Day 5 vs Day 4 — test if earlier marketing advice drives faster activation

---

## Setup Checklist (For Any Email Platform)

1. Create an automation triggered by new user signup
2. Set sender as tim@mybidquick.com with name "Tim from MyBidQuick"
3. Add each email with the specified delays (0, 1, 3, 5, 7 days)
4. Set exit condition: tenant purchases credits → remove from sequence
5. Use merge fields for {{first_name}} and {{slug}} from Supabase tenant data
6. Track opens, clicks, and unsubscribes per email
7. Review performance weekly for the first month
