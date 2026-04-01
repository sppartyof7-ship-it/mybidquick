import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react'

const POSTS = {
  'instant-quoting-for-cleaning-companies': {
    title: "Why Every Cleaning Company Needs an Instant Online Quoting Tool in 2026",
    date: "March 28, 2026",
    readTime: "5 min read",
    author: "Tim Sullivan",
    metaDescription: "Learn why cleaning companies that offer instant online quotes close 3x more jobs. Discover how to automate your quoting process and win more customers.",
    heroEmoji: "\u26A1",
    sections: [
      {
        heading: "The Quoting Problem Every Cleaning Company Faces",
        content: `If you run an exterior cleaning business  - pressure washing, window cleaning, gutter cleaning, house washing  - you know the drill. A potential customer reaches out, you drive to their property, measure everything, go home, build a quote in a spreadsheet, email it over, and then... crickets.

By the time you send that quote, your competitor already gave them a price. The customer moved on.

Here's the reality: 78% of customers choose the first company that gives them a price. Speed wins. And in 2026, "speed" means giving customers an instant quote right from their phone.`
      },
      {
        heading: "What Is an Instant Quoting Tool?",
        content: `An instant quoting tool is a widget that lives on your website. When a customer visits your site, they enter their address, select the services they need (house wash, window cleaning, gutter cleaning, etc.), and get a professional quote in under 60 seconds.

No phone calls. No site visits. No waiting. The customer gets a price, and you get their contact information as a lead  - automatically.

The best quoting tools also show a satellite image of the customer's property (using Google Maps), compare your prices to national averages, and let customers customize packages with add-ons like deck washing or driveway cleaning.`
      },
      {
        heading: "How Instant Quotes Help You Close More Jobs",
        content: `Cleaning companies using instant quoting tools report closing 2-3x more jobs. Here's why:

First, you capture leads 24/7. Your quoting tool works while you sleep. A homeowner browsing at 10pm on a Sunday can get a quote and book you before Monday morning.

Second, you eliminate the back-and-forth. No more phone tag, no more "I'll get back to you with a price." The customer gets exactly what they need in one visit.

Third, you look more professional than your competition. A branded quoting tool with satellite property views and transparent pricing tells customers you're a serious, tech-savvy operation  - not a guy with a pressure washer and a pickup truck.

Fourth, you capture every lead. Even if the customer doesn't book right away, you have their name, email, phone number, and address. You can follow up. Without a quoting tool, that customer just calls your competitor instead.`
      },
      {
        heading: "What to Look for in a Quoting Tool",
        content: `Not all quoting tools are built the same. Here's what matters for cleaning companies:

White-labeling is essential. The tool should show YOUR logo, YOUR colors, YOUR business name. Customers should never know they're using a third-party tool.

Industry-specific pricing matters. Generic quoting tools don't understand house washing vs. gutter cleaning vs. window cleaning. You need a tool built for exterior cleaning services with tiered packages (Standard, Premium, Platinum) and smart upsells.

Mobile-first design is non-negotiable. Over 70% of your customers will get a quote from their phone. If your quoting tool doesn't look perfect on mobile, you're losing jobs.

Lead capture and notifications keep you in the loop. You should get an instant notification every time someone requests a quote  - with their full contact info and what services they need.`
      },
      {
        heading: "Getting Started Is Easier Than You Think",
        content: `Setting up an instant quoting tool used to mean hiring a developer and spending thousands of dollars. Not anymore.

With MyBidQuick, you can have a fully branded, mobile-friendly quoting tool live on your website in under 10 minutes. Set your prices, upload your logo, choose your colors, and you're done. Embed it on your site or share your unique quote page link.

Your customers get instant quotes. You get instant leads. Everybody wins.`
      }
    ],
    cta: "Ready to give your customers instant quotes?",
    ctaButton: "Start Free with MyBidQuick",
    ctaLink: "/signup"
  },

  'how-to-price-pressure-washing-jobs': {
    title: "How to Price Pressure Washing Jobs: The Complete 2026 Guide",
    date: "March 28, 2026",
    readTime: "7 min read",
    author: "Tim Sullivan",
    metaDescription: "The complete guide to pricing pressure washing, house washing, and exterior cleaning jobs. Includes national averages, pricing strategies, and how to present quotes professionally.",
    heroEmoji: "\uD83D\uDCB0",
    sections: [
      {
        heading: "Pricing Is the #1 Challenge for Cleaning Companies",
        content: `Ask any exterior cleaning business owner what keeps them up at night, and the answer is almost always pricing. Price too high and you lose the job. Price too low and you're working for free.

The truth is, most cleaning companies are guessing on price. They look at what their neighbor charges, add a little, and hope for the best. That's not a pricing strategy  - that's a coin flip.

In this guide, we'll break down exactly how to price pressure washing, house washing, gutter cleaning, and window cleaning jobs based on real national data from 2026.`
      },
      {
        heading: "National Average Prices for Exterior Cleaning Services",
        content: `Here are the 2026 national averages based on industry data:

House washing typically runs $0.15-$0.40 per square foot for standard vinyl/aluminum siding. Brick and stone homes command $0.20-$0.50 per square foot due to the extra care required. The average house wash job (2,000 sq ft home) lands between $300-$500.

Driveway and concrete cleaning averages $0.08-$0.20 per square foot. A standard two-car driveway (400 sq ft) runs $80-$150.

Gutter cleaning ranges from $0.75-$2.00 per linear foot, with most homes (150-200 linear feet) costing $150-$300. Add $50-$100 if downspout flushing is included.

Window cleaning averages $4-$8 per pane for exterior-only cleaning, or $7-$12 per pane for interior and exterior.

Roof cleaning (soft wash) runs $0.20-$0.60 per square foot, with average jobs between $350-$700.`
      },
      {
        heading: "The Tiered Package Strategy That Wins",
        content: `The most successful cleaning companies don't just quote a single price  - they offer tiered packages. This strategy is proven to increase your average ticket size by 30-50%.

Here's how it works:

Your Standard package includes the core service the customer asked about. For example, just a house wash.

Your Premium package bundles the core service with one popular add-on. House wash plus gutter cleaning, for example. Price this at 20-30% more than Standard.

Your Platinum package is the works  - house wash, gutter cleaning, window cleaning, and driveway. Price this at 40-60% more than Standard, but make sure the customer can see they're getting a deal compared to buying each service separately.

Most customers pick Premium. They don't want the cheapest option (feels risky), and the most expensive feels like too much. Premium is the sweet spot  - and it's exactly where you want them.`
      },
      {
        heading: "How to Present Your Prices Professionally",
        content: `How you present your pricing matters almost as much as the actual price. Here's what separates the cleaning companies closing 80% of quotes from those closing 20%:

Speed is everything. The first company to provide a quote wins the job most of the time. If you can give customers an instant price online, you're ahead of 95% of your competition.

Show the value. Don't just list a number  - show what's included. Break it down by service. Show before/after expectations. Include a property satellite view so the customer knows you're quoting THEIR house, not a generic price.

Compare to national averages. When customers see that your price is at or below the national average, their hesitation disappears. "Our house wash at $350 is 15% below the national average of $410" is a powerful closing statement.

Make it easy to say yes. Don't make customers call you, email you, or fill out a 20-field form. One-click booking or a simple "Accept Quote" button converts browsers into buyers.`
      },
      {
        heading: "Automate Your Pricing With the Right Tools",
        content: `Manually building quotes for every lead is a time killer. The average cleaning company owner spends 5-10 hours per week on quoting alone. That's time you could spend on jobs that pay.

Modern quoting tools let you set your prices once and let the software do the math. Customers enter their address, select their services, and get an instant professional quote  - 24/7, even while you're on a job or asleep.

MyBidQuick was built specifically for exterior cleaning companies. You set your per-square-foot rates, your package tiers, and your add-on prices. The tool handles the rest  - instant quotes, lead capture, and professional presentation with your brand.`
      }
    ],
    cta: "Stop guessing on price. Start quoting like a pro.",
    ctaButton: "Try MyBidQuick Free",
    ctaLink: "/signup"
  },

  'close-more-cleaning-jobs-online': {
    title: "5 Ways to Close More Cleaning Jobs Online (Without Cold Calling)",
    date: "March 28, 2026",
    readTime: "6 min read",
    author: "Tim Sullivan",
    metaDescription: "Stop chasing leads. Learn 5 proven strategies cleaning companies use to close more jobs online  - from instant quoting to automated follow-ups and smart upsells.",
    heroEmoji: "\uD83D\uDE80",
    sections: [
      {
        heading: "Cold Calling Is Dead. Online Closing Is King.",
        content: `Let's be real  - nobody answers their phone anymore. Especially not from unknown numbers. If your sales strategy for your cleaning business is still "call every lead until they pick up," you're fighting a losing battle.

The cleaning companies growing fastest in 2026 are the ones that let customers buy on their own terms  - online, at their own pace, without being pressured by a salesperson.

Here are five strategies that are working right now for exterior cleaning companies across the country.`
      },
      {
        heading: "1. Offer Instant Quotes on Your Website",
        content: `This is the single biggest thing you can do. Put a quoting tool on your website that gives customers a real price in under 60 seconds.

Think about it from the customer's perspective. They've got dirty gutters. They Google "gutter cleaning near me." They find your website. If they have to call you, leave a voicemail, and wait for a callback  - they're going to click the next result instead.

But if they can type in their address and get a quote instantly? Now you've got their attention AND their contact info.

Companies using instant quoting tools see 2-3x more leads than those relying on "call for a free estimate" buttons. The math speaks for itself.`
      },
      {
        heading: "2. Use Tiered Packages With Smart Upsells",
        content: `Don't just quote one price. Offer three packages: Standard, Premium, and Platinum.

When a customer asks for a house wash, show them that for just a little more they could also get their gutters cleaned. And for the best value, throw in window cleaning too.

This is called a cascade upsell  - you start with what they asked for, then show the next logical service, then the full package. It works because customers can see the value stepping up.

On average, tiered pricing increases your ticket size by 30-50%. That means on a $400 house wash lead, you're now closing $520-$600 jobs instead. Over a full season, that's tens of thousands in extra revenue.`
      },
      {
        heading: "3. Follow Up Automatically",
        content: `Here's a stat that should make you cringe: 48% of cleaning companies never follow up with a lead after the first contact. Almost half.

The money is in the follow-up. A customer who got a quote but didn't book isn't a lost cause  - they're busy, distracted, or comparing prices. A simple follow-up email or text 24 hours later can close 20-30% of those "dead" leads.

Set up automatic follow-ups. When someone gets a quote on your site, they should automatically receive a confirmation email with their quote details and a link to book. Then a follow-up 24 hours later. Then another at 72 hours if they haven't booked.

You don't need to manually send these. The right quoting tool handles it for you.`
      },
      {
        heading: "4. Show Social Proof and Reviews",
        content: `Customers trust other customers more than they trust you. That's not an insult  - it's human nature.

Put your Google reviews front and center on your website and your quoting page. If you have before/after photos, show them. If you have video testimonials, even better.

The goal is to answer the customer's unspoken question: "Can I trust these guys with my house?" Five-star reviews and visual proof answer that question without you saying a word.

If you don't have many reviews yet, start asking every happy customer to leave one. A simple text after each completed job  - "Hey, thanks for choosing us! Would you mind leaving us a quick Google review?"  - works surprisingly well.`
      },
      {
        heading: "5. Make Booking as Easy as Ordering a Pizza",
        content: `The final step where most cleaning companies lose jobs is the booking process itself. The customer wants to hire you, but the process is confusing, slow, or requires too many steps.

Your booking flow should be as simple as: get a quote, click "Book Now," pick a date. That's it. No phone calls required. No "we'll get back to you within 24-48 hours."

In 2026, customers expect the same convenience from their cleaning company that they get from Amazon or DoorDash. The companies that deliver that convenience win. The companies that make customers jump through hoops lose.

MyBidQuick handles all five of these strategies  - instant quoting, tiered packages, lead capture, professional presentation, and simple booking  - in one tool built specifically for cleaning companies.`
      }
    ],
    cta: "Ready to close more jobs online?",
    ctaButton: "Get Started Free",
    ctaLink: "/signup"
  },

  'get-more-pressure-washing-customers': {
    title: "How to Get More Pressure Washing Customers in 2026: 7 Proven Strategies",
    date: "April 1, 2026",
    readTime: "8 min read",
    author: "Tim Sullivan",
    metaDescription: "Master 7 proven strategies to attract more pressure washing customers in 2026. From Google Business Profile optimization to QR code yard signs, get the complete playbook.",
    heroEmoji: "💰",
    sections: [
      {
        heading: "The Pressure Washing Business Is Booming (And Competitive)",
        content: `Pressure washing is one of the easiest exterior cleaning services to start, which means it's also one of the most crowded. In 2026, nearly every neighborhood has five guys with a pressure washer and a truck trying to get jobs.

The difference between the pressure washing companies making six figures and the ones struggling to book jobs? They know how to attract customers strategically.

Here are seven proven strategies that are working right now for pressure washing businesses across the country.`
      },
      {
        heading: "1. Own Your Google Business Profile",
        content: `Google Business Profile is where customers looking for pressure washing near them actually go. If your profile is incomplete, outdated, or has bad reviews, you're invisible.

First, claim and optimize your profile completely. Add your phone number, website, address (or service area), hours, and a clear description. Upload before/after photos from your best jobs  - these are absolute gold. When customers see your driveway looking brand new after pressure washing, they want to hire you.

Second, ask every happy customer to leave a Google review. A simple text: "Thanks for choosing us! Would you mind leaving a quick Google review? Here's the link: [Google review link]"

Companies with 4.8+ star Google ratings and 30+ reviews get 2-3x more phone calls from local customers than competitors with 20 reviews and a 4.2 rating. It's not magic  - it's just what customers see first.`
      },
      {
        heading: "2. Offer Instant Online Quotes",
        content: `Most pressure washing customers don't want to talk on the phone. They want to pull out their phone, punch in their address, see a price instantly, and book you on the spot.

A quoting tool on your website lets customers get a quote in 60 seconds without calling you. You get their name, address, phone, and email automatically. Then you have their contact info to follow up and book.

The best part? Your instant quoting tool works 24/7. A customer browsing at 10pm on Saturday can get a quote and become a lead before you even wake up Monday morning.

Pressure washing companies with instant online quoting see 2-3x more leads than competitors still using "call for a free estimate."`
      },
      {
        heading: "3. Use Yard Signs With QR Codes",
        content: `Yard signs are still one of the highest ROI marketing tools for pressure washing. The catch is making them actually convert.

Instead of a generic "Jim's Pressure Washing" sign, add a QR code that links directly to your quoting page. When a homeowner sees your before/after photos on a completed job AND scans a QR code that gets them an instant quote, they're primed to book you.

Pro tip: Put these signs on your completed jobs (with customer permission). Every time you finish a house wash or driveway, you've got a walking billboard in someone's front yard for weeks.`
      },
      {
        heading: "4. Build Community in Facebook Groups",
        content: `Facebook groups for neighborhood interests (HOA discussions, local recommendations, home improvement tips) are goldmines for pressure washing leads.

Join 5-10 local Facebook groups in your service area. Don't spam. Instead, be genuinely helpful. Answer questions. Share free before/after photos. When someone posts "Anyone know a good pressure washer?" you'll be the name people mention.

The key is showing up consistently and providing value without being salesy. One pressure washing owner did this and got 15-20 leads a month just from Facebook group engagement  - and they were hot leads because the homeowner already knew about the company's work.`
      },
      {
        heading: "5. Document Before/After Photos Like Crazy",
        content: `Before/after photos are your best marketing asset. Every single job you do, take high-quality photos.

Post these on your website, Google Business Profile, Facebook, and Instagram. Create content around them: "Neglected driveway transformed in 45 minutes" or "10 years of grime  - gone in 2 hours."

Why? Because when a homeowner sees their dirty driveway next to a sparkling clean one, they immediately think "I need to call these guys." Before/after imagery is persuasive in a way words never are.

Pressure washing companies that document their work consistently (5+ before/afters per week) get 3-5x more inquiries than those without a strong portfolio.`
      },
      {
        heading: "6. Create a Referral Program",
        content: `Your best customers are your current customers. Ask them to refer their friends and family.

Set up a simple referral program: "Refer a friend. When they book, you both get $50 off your next service."

Send a text after every completed job: "Thanks for choosing us! Know anyone who needs pressure washing? Refer them and get $50 off your next service. Here's your referral link: [link]"

Referral programs work because people trust recommendations from friends more than any ad. And word-of-mouth from satisfied customers costs you almost nothing but generates high-quality leads.`
      },
      {
        heading: "7. Run Seasonal Promotions",
        content: `Spring is peak pressure washing season. Fall cleanup is another big one. Winter holiday parties mean customers want their homes looking sharp.

Create time-sensitive promotions for each season. Spring: "Spring Refresh Special: House wash + driveway for $399 (normally $550). Book by April 30."

Seasonal promotions create urgency. Customers who are thinking about pressure washing but haven't committed yet suddenly feel like they need to book now or miss the deal.

Combine seasonal promotions with your instant quoting tool and email follow-ups, and you'll see a spike in booked jobs.`
      },
      {
        heading: "Getting Started Is Simple",
        content: `Here's your action plan for this week:

Claim and optimize your Google Business Profile. Add photos. Ask customers for reviews.

Set up an instant quoting tool on your website. Get a QR code made for your yard signs.

Join 3 local Facebook groups and start being helpful.

Take before/after photos on your next 5 jobs.

Create a simple referral text to send customers.

Plan a seasonal promotion.

The companies crushing it in pressure washing in 2026 aren't necessarily the smartest or most experienced. They're the ones who are strategic about attracting customers consistently.

MyBidQuick makes steps 1-2 easy. You get Google Business integration, white-labeled quoting with QR codes, instant lead notifications, and referral tracking all in one dashboard. Sign up today and start getting more pressure washing customers this week.`
      }
    ],
    cta: "Ready to attract more pressure washing customers?",
    ctaButton: "Get Started with MyBidQuick Free",
    ctaLink: "/signup"
  },

  'best-quoting-software-cleaning-companies': {
    title: "Best Quoting Software for Cleaning Companies (2026 Comparison)",
    date: "April 1, 2026",
    readTime: "10 min read",
    author: "Tim Sullivan",
    metaDescription: "Compare the best quoting software for cleaning companies in 2026. See how MyBidQuick stacks up against ResponsiBid, Jobber, Housecall Pro, and QuoteIQ on price, features, and ROI.",
    heroEmoji: "📊",
    sections: [
      {
        heading: "Choosing the Wrong Quoting Software Will Cost You Thousands",
        content: `There are dozens of quoting tools out there for cleaning companies. Some are built for plumbers. Some are built for everyone. Some are so expensive you need to close 100 jobs a month just to break even.

The right quoting software should:

Pay for itself in 2-3 months with the leads and sales it generates. Save you 5-10 hours per week on manual quoting. Look professional to your customers. Integrate with your other tools. Help you close more jobs with higher ticket prices.

In this guide, we'll compare the five most popular quoting software options for cleaning companies and see which one actually delivers ROI.`
      },
      {
        heading: "The Comparison",
        content: `Let's break down the main contenders side-by-side:

MyBidQuick: $2 per quote (or $199/month for unlimited). Built specifically for exterior cleaning (house wash, pressure washing, window cleaning, gutter cleaning). White-labeled with your logo. 60-second instant quotes. Satellite property views. Tiered packages (Standard/Premium/Platinum). Cascade upsells (house wash to windows to gutters). Free integration with Google Business, lead capture, SMS/email follow-ups. No credit card required to start.

ResponsiBid: $199/month flat rate. Built for contractors generally. Instant online quotes. Work order management. Limited customization for cleaning-specific services. Mobile app. Good for multi-service contractors but overbuilt for cleaning-only companies.

Jobber: $39-$599/month depending on plan. Project management focused. Invoicing, scheduling, customer portal. Not built for instant quoting on your website. Requires manual quote creation. Better for service companies with recurring service models, not ideal for one-time cleaning jobs.

Housecall Pro: $59-$579/month depending on plan. Field service management platform. Instant estimates available on higher tiers. GPS tracking, invoicing, payments. Broader than cleaning but lacks cleaning-specific features like satellite property views and cascade upsells.

QuoteIQ: $29-$250/month. Instant online quoting for contractors. Mobile app. Basic lead capture. Less cleaning-specific than MyBidQuick. Integrations limited. Support can be slow.`
      },
      {
        heading: "Why MyBidQuick Wins for Cleaning Companies",
        content: `If you run a pressure washing, house washing, window cleaning, or gutter cleaning company, MyBidQuick is built for you. Here's why it stands out:

Price: At $2 per quote, you can get 100 leads for $200. Close just 2-3 of those at an average ticket of $400, and you've paid for 200 more leads. Most cleaning companies break even in their first month.

White-labeling: Your customers never know they're using a third-party tool. They see YOUR logo, YOUR colors, YOUR business name. You look professional. Your competitors look like they're using a generic tool.

60-second quotes: Your customers get an actual price in under a minute. Not a range. Not a "we'll call you." An actual quote. That's the difference between getting a lead and getting a booking.

Satellite views: When you quote a job, the customer sees a clear satellite photo of their property. They know you're quoting THEIR house, not a generic estimate. This increases trust and close rates.

Cascade upsells: MyBidQuick is specifically designed to upsell. A customer asks for a house wash. You show them house wash, then house wash plus gutters, then house wash plus gutters plus windows. Most pick the middle option. Your average ticket increases 30-50%.

Industry pricing defaults: Most quoting tools require you to guess on pricing. MyBidQuick comes pre-loaded with 2026 national market rates for all exterior cleaning services. You can adjust, but you're never starting from zero.

Lead capture and follow-up: Every quote generates a lead with name, email, phone, address, and services requested. You get an instant SMS/email notification. Then automated follow-ups go out at 24 and 72 hours if they don't book.`
      },
      {
        heading: "Price Comparison: What You Actually Pay",
        content: `Let's say you close 10 jobs per month on average, at $500 per job.

MyBidQuick: $2/lead = roughly 50 quotes to get 10 bookings. Cost per booking: $10. Savings vs. other tools: $180-$570/month.

ResponsiBid: $199/month flat. Cost per booking: $20. Additional time spent on quoting and admin: 5 hours/week.

Jobber (middle tier): $249/month. Cost per booking: $25. Most quotes require manual creation or site visit first.

Housecall Pro (middle tier): $249/month. Cost per booking: $25. More features than you need.

QuoteIQ: $100/month. Cost per booking: $10. Less cleaning-specific, slower support, fewer integrations.

Over a year, MyBidQuick saves you $2,000-$6,000+ compared to other platforms. And that doesn't even count the extra revenue from cascade upsells and faster close rates.`
      },
      {
        heading: "What Matters Most: Closing More Jobs",
        content: `The real test of quoting software isn't features. It's ROI: Do you close more jobs, faster, with higher prices?

Cleaning companies using MyBidQuick report:

2-3x more leads (because instant quotes convert better than "call for estimate")
30-50% higher average ticket size (because cascade upsells work)
20-30% higher close rates on followed-up leads
50% less time spent on manual quoting

That's real money. A pressure washing company doing $500/job who goes from 10 to 20 jobs/month (thanks to 2x leads + 2x close rate) is adding $5,000/month in revenue. At MyBidQuick's $2/quote rate, that cost looks invisible.

The wrong quoting software doesn't just cost you the monthly fee. It costs you leads, sales, and time you could spend actually doing jobs.`
      },
      {
        heading: "The Bottom Line",
        content: `If you want a quick, affordable, cleaning-specific quoting tool that generates real ROI in 2-3 months, MyBidQuick is your answer.

If you're a huge multi-service contractor with 50+ employees and need a full project management platform, Jobber or Housecall Pro might make sense.

If you want something in the middle, QuoteIQ is cheaper but less cleaning-focused.

But for most cleaning companies, the math is simple: MyBidQuick pays for itself faster, looks better to customers, and closes more jobs.

Don't take our word for it. Sign up free today, build a few quotes, and see for yourself how many of those tire-kickers turn into actual customers.`
      }
    ],
    cta: "Ready to close more jobs with the right tool?",
    ctaButton: "Try MyBidQuick Free (No Credit Card)",
    ctaLink: "/signup"
  },

  'upsell-cleaning-services': {
    title: "How to Upsell Cleaning Services and Increase Your Average Ticket by 35%",
    date: "April 1, 2026",
    readTime: "6 min read",
    author: "Tim Sullivan",
    metaDescription: "Learn the cascade upsell method that cleaning companies are using to increase average ticket size by 35-50%. Tiered packages, bundling strategies, and proven urgency tactics.",
    heroEmoji: "📈",
    sections: [
      {
        heading: "Your Average Ticket Is Too Low",
        content: `Let's be honest. Most cleaning companies leave money on the table.

A customer calls about a house wash. You quote $350. They book. Done.

But what if that same customer would happily add gutter cleaning for another $100? Or windows for another $150?

If you're not upselling, you're working the same hours for 30-50% less revenue. A cleaning company doing 50 jobs a month at $400 vs. $550 average is leaving $7,500/month on the table.

Here's how to fix it.`
      },
      {
        heading: "The Cascade Upsell Method",
        content: `The cascade upsell is the most effective strategy for increasing average ticket size in the cleaning business.

Here's how it works:

A customer requests a house wash. Instead of quoting just a house wash, you show them three packages:

Standard: House wash only. $350.

Premium: House wash + gutter cleaning. $450.

Platinum: House wash + gutter cleaning + window cleaning. $600.

The customer sees the value stepping up. Standard feels too cheap. Platinum feels like overkill. Premium hits the sweet spot.

In practice, 60% of customers pick Premium. Your average ticket went from $350 to $450. That's a 29% increase. Over a year, that's tens of thousands in extra revenue for the same effort.

Why does it work? Because customers see the logical flow. House wash, then gutters (which are dirty anyway), then windows. It makes sense. They're not thinking "upsell" - they're thinking "that's a good deal compared to buying each separately."

That's why it's called a cascade. The value cascades from one service to the next.`
      },
      {
        heading: "Tiered Packages Work",
        content: `Tiered pricing is psychology. Give customers a single price, and they agonize. "Is that fair? Should I call around?"

Give them three prices, and they decide fast. The middle option is almost always the winner.

This is backed by psychology research. When people see three options  - low, medium, high  - they almost always pick the medium. It's called the Goldilocks effect. Low feels risky. High feels wasteful. Medium feels just right.

For cleaning companies:

Your Standard package is what they asked for. Your Premium is Standard + your most popular add-on. Your Platinum is the full package.

Price your Premium at 20-30% more than Standard. Price Platinum at 40-60% more.

Most customers pick Premium. You're not pressuring them. They're choosing the option that feels right.`
      },
      {
        heading: "Smart Bundling Increases Perceived Value",
        content: `Customers think in total price. Show them house wash + gutter cleaning + window cleaning, and they see $350 + $150 + $200 = $700.

But if you present it as a single "Platinum Outdoor Cleaning" package for $550, they see a deal. The same work, bundled, feels cheaper.

Even though the work is identical, bundling creates the perception of savings. "Get three services for the price of two" sells better than "three services for $550."

This is why menu-based pricing works better than à la carte. When customers build their own quote piece by piece, the total feels expensive. When you present tiered packages, the middle option always feels like the best value.

MyBidQuick's cascade upsell feature is designed exactly for this. A customer enters their address and selects house washing. Boom. Three packages appear on their phone. 60% pick Premium.`
      },
      {
        heading: "Urgency Tactics That Close the Sale",
        content: `Once a customer is looking at your Premium or Platinum package, you need them to book. Here's what works:

Limited-time pricing: "This price is good for quotes requested by April 15th. After that, pricing adjusts to seasonal rates."

Seasonal urgency: Spring cleaning season is short. "Book your house wash in April and save $50. In May, prices go back to normal as demand picks up."

Social proof: "8 homes on Maple Street have been washed this month. The longer you wait, the more visible your home looks compared to neighbors who haven't cleaned yet."

Scarcity: "I have two openings next week. If you book today, I can be at your home by Thursday. Wait a week and it's three weeks out."

The key is urgency without being pushy. You're not lying or pressuring. You're just stating facts. Spring season IS short. Your schedule DOES fill up. Prices DO change seasonally.

These urgency tactics, combined with cascade upsells and tiered packages, push your close rate way up.`
      },
      {
        heading: "The Real Magic: Automation",
        content: `Cascade upsells, tiered packages, and urgency tactics work best when they're automated.

Here's why: Your best closing happens when the customer is ready  - right now, while they're browsing, before they lose interest.

An instant online quoting tool with cascade upsells, tiered packages, and countdown urgency ("Book by Friday for $50 off") closes customers the moment they're hot.

Manual follow-ups are slower. A customer gets a quote via email, walks away, gets distracted. By the time you call them Thursday, they've already gotten three other quotes.

MyBidQuick automatically shows tiered packages in a cascade (Standard, Premium, Platinum), includes urgency language on the quote page, and sends instant notifications so you can follow up while the customer is still thinking about it.

Combine automation with follow-up calls, and you're unstoppable.`
      },
      {
        heading: "Your Action Plan This Week",
        content: `First, audit your current pricing. What's your average ticket right now?

Second, design three tiers. What's your core service? What's your most popular add-on? What's your full package?

Third, price them: Standard (core), Premium (20-30% more), Platinum (40-60% more).

Fourth, test it. The next 10 quotes you give, present all three options. Track which ones customers pick.

I guarantee Premium becomes your best seller.

Then, implement it everywhere. Your website, your estimates, your face-to-face quotes. Consistency matters.

If you want it all done for you, MyBidQuick has pre-built Standard/Premium/Platinum tiers for all cleaning services, and the cascade upsell is automatic. Your customers see all three options on their phone, and most pick Premium.

That 35% bump in average ticket size? That's not just revenue. That's the difference between barely surviving and absolutely crushing it.`
      }
    ],
    cta: "Ready to increase your average ticket by 35%?",
    ctaButton: "Start with MyBidQuick Free",
    ctaLink: "/signup"
  },

  'pressure-washing-marketing-ideas': {
    title: "Pressure Washing Marketing Ideas That Actually Work (No Budget Needed)",
    date: "April 1, 2026",
    readTime: "7 min read",
    author: "Tim Sullivan",
    metaDescription: "Organic pressure washing marketing strategies that don't require paid ads. From Facebook groups to QR code yard signs to Google reviews, all the free tactics that generate real leads.",
    heroEmoji: "🚀",
    sections: [
      {
        heading: "Stop Overpaying for Ads. These Free Tactics Actually Work.",
        content: `Here's what most pressure washing companies do: They spend $500/month on Facebook ads to get 5-10 low-quality leads.

Here's what the smart ones do: They use free organic channels to get 20+ high-quality leads a month.

The difference isn't luck. It's strategy.

The cleaning companies dominating in 2026 aren't the ones with the biggest ad budgets. They're the ones who figured out how to attract customers without paying for ads.

Here are the free pressure washing marketing tactics that are actually working right now.`
      },
      {
        heading: "1. Dominate Local Facebook Groups",
        content: `Facebook groups for local neighborhoods, HOA discussions, and home improvement tips are goldmines.

Join 5-10 groups in your service area. Not to spam. To genuinely help.

When someone posts "Does anyone know a good pressure washer?" you'll already be a familiar name in that group. You'll have a reputation. People will recommend you.

Better yet, post your best before/after photos in these groups. Not with a sales pitch. Just "finished this beauty yesterday" or "gutter cleaning + house wash transformation."

These before/after photos drive engagement. People comment. People share. Local homeowners see your work.

One pressure washing owner did this consistently (one post per week) and generated 15-20 leads per month just from Facebook groups. Zero ad spend.

Pro tip: Be genuinely helpful in these groups. Answer questions. Don't have a pressure washer recommendation? Say so. Your reputation grows from being real, not from spamming.`
      },
      {
        heading: "2. Master Before/After Photo Marketing",
        content: `Before/after photos are your most powerful asset. They require zero budget and unlimited upside.

Take high-quality before/after photos on every single job. Buy a smartphone tripod ($15 on Amazon). Take photos in good light. That's it.

Post these everywhere:
- Your Google Business Profile
- Facebook page and groups
- Instagram
- Your website

When a homeowner sees their dirty driveway next to one sparkling clean, they want to hire you. It's visceral. No amount of copywriting beats visual proof of your work.

A pressure washing company that posts 5 before/after photos per week gets 3-5x more inquiries than one with no photos. It's not close.

And it's completely free. You're already doing the work. Taking photos takes 60 seconds.`
      },
      {
        heading: "3. Build a Google Reviews Machine",
        content: `Customers trust Google reviews more than anything else. A 4.9-star profile with 50 reviews will beat a 4.0-star profile with 10 reviews every single time.

After every completed job, text the customer: "Thanks for choosing us! Would you mind leaving a quick Google review? Here's the link: [Google review link]"

Keep it simple. Short message. Direct link. You'll get a 10-20% response rate.

Over time, your Google profile becomes a lead magnet. Homeowners searching "pressure washing near me" will see your 4.8+ stars and 50+ reviews and click you first.

This is completely free. It just requires asking.

The first few months might be slow (you need 15-20 reviews to really move the needle), but after 6 months of consistent asking, you'll have 50+ reviews. From then on, your Google profile generates leads passively 24/7.`
      },
      {
        heading: "4. Put QR Codes on Your Yard Signs",
        content: `Yard signs are still the highest ROI marketing for local service businesses. But most pressure washing companies are missing a huge opportunity.

Instead of a generic sign, add a QR code that links to your instant quoting page.

Here's the flow: A homeowner sees your yard sign with a before/after photo of a recently completed job. They think "that looks amazing." They scan the QR code. Boom. They're on your quoting page. They enter their address. They get an instant price. They book you.

All from a $20 yard sign.

Pro tip: Put these signs on completed jobs (with customer permission). Every job you finish becomes a walking billboard for weeks. That's dozens of neighbors seeing your work and having a way to book you instantly.`
      },
      {
        heading: "5. Create Evergreen Content on Nextdoor",
        content: `Nextdoor is the app where neighborhoods talk about local recommendations.

Create an account for your service area. Answer questions. When someone asks about pressure washing, recommend yourself (genuinely, not spammy).

Post seasonal content: "Spring cleanup ideas" with before/after photos. "Fall gutter cleaning tips." "Winter driveway prep for ice."

Nextdoor's algorithm favors local business owners. You'll get visibility. Neighbors will see your content and save your name.

This requires no budget. Just consistent presence.`
      },
      {
        heading: "6. Build a Referral System",
        content: `Your customers are your best marketers. After a completed job, text them: "Know anyone who needs pressure washing? Refer them and get $50 off your next service. Here's your referral link: [link]"

Word-of-mouth from a satisfied customer converts at 10x the rate of cold ads.

Make referrals easy. Provide a link they can text to friends. Make it a one-click process.

Spend $50 in referral discounts to acquire a $400-$500 customer. That's a 8-10x ROI.

And once you've got a referral system running, leads come in automatically every month.`
      },
      {
        heading: "7. Offer Instant Online Quotes",
        content: `This is the ultimate free marketing tactic. An instant quoting tool on your website is available 24/7. It generates leads while you sleep.

A potential customer finds you on Google, visits your site, sees an instant quoting tool, enters their address, gets a quote in 60 seconds, and you have their contact info as a lead.

Zero ad budget. Pure lead generation.

And here's the kicker: people who get an instant quote are hot leads. They didn't call you. They didn't email. They spent 60 seconds on your site and wanted a price badly enough to give you their information. High intent.

Combine instant quoting with follow-up (automated email at 24 hours, call at 48 hours) and your close rate will shock you.

Most pressure washing companies are still using "call for a free estimate" buttons. Their competitors who offer instant quotes are getting 3x more leads from the same traffic.`
      },
      {
        heading: "Putting It All Together",
        content: `Here's your zero-budget marketing plan:

Week 1: Join 5 local Facebook groups. Introduce yourself. Share a great before/after photo.

Week 2: Ask your last 10 customers to leave Google reviews. Aim for 10 new reviews.

Week 3: Create yard signs with QR codes linking to your quoting page. Put them on completed jobs.

Week 4: Post before/after photos on all your channels. Write a free content post on Nextdoor.

Week 5: Start your referral program. Text every customer asking for referrals.

Week 6: Set up instant online quoting if you don't have it already.

Then, repeat. One Facebook post per week. One Google review push per month. One referral push per month. One new QR code sign per job.

This system requires almost zero budget but consistent effort.

The pressure washing companies winning in 2026 aren't the ones with the biggest ad budgets. They're the ones who show up consistently on Facebook groups, post their best work on Google, and make it easy for customers to find them and book them instantly.

MyBidQuick makes the instant quoting part automatic. You set your prices once. Customers get instant quotes 24/7. Every quote is a lead you can follow up on. That's the engine. Everything else is fuel.`
      }
    ],
    cta: "Ready to start getting free pressure washing leads?",
    ctaButton: "Get Your Instant Quoting Tool Free",
    ctaLink: "/signup"
  }
}

function BlogPost() {
  const { slug } = useParams()
  const post = POSTS[slug]

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Post not found</h1>
          <Link to="/blog" style={{ color: '#6366f1', textDecoration: 'none' }}>Back to Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 800, fontSize: '1.25rem' }}>
          MyBid<span style={{ color: '#6366f1' }}>Quick</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/blog" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</Link>
          <Link to="/signup" style={{ background: '#6366f1', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.heroEmoji}</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, color: '#111', marginBottom: '1rem' }}>{post.title}</h1>

        <div style={{ display: 'flex', gap: '1.5rem', color: '#6b7280', fontSize: '0.85rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> {post.author}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> {post.date}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> {post.readTime}</span>
        </div>

        {post.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>{section.heading}</h2>
            {section.content.split('\n\n').map((para, j) => (
              <p key={j} style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1rem' }}>{para}</p>
            ))}
          </div>
        ))}

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', marginTop: '3rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{post.cta}</h3>
          <Link to={post.ctaLink} style={{ display: 'inline-block', background: '#fff', color: '#6366f1', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem' }}>
            {post.ctaButton}
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
        &copy; 2026 MyBidQuick. The #1 quoting tool for cleaning companies.
      </footer>
    </div>
  )
}


function BlogIndex() {
  const posts = Object.entries(POSTS)

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#fff' }}>
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 800, fontSize: '1.25rem' }}>
          MyBid<span style={{ color: '#6366f1' }}>Quick</span>
        </Link>
        <Link to="/signup" style={{ background: '#6366f1', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          Get Started Free
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>MyBidQuick Blog</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '3rem' }}>Tips, strategies, and insights for growing your cleaning business.</p>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {posts.map(([slug, post]) => (
            <Link key={slug} to={`/blog/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{post.heroEmoji}</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>{post.title}</h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>{post.metaDescription}</p>
              <div style={{ display: 'flex', gap: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
        &copy; 2026 MyBidQuick. The #1 quoting tool for cleaning companies.
      </footer>
    </div>
  )
}

export { BlogIndex, BlogPost }
export default BlogPost
