import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react'

const POSTS = {
  'instant-quoting-for-cleaning-companies': {
    title: "Why Every Cleaning Company Needs an Instant Online Quoting Tool in 2026",
    date: "March 28, 2026",
    readTime: "5 min read",
    author: "Tim Sullivan",
    metaDescription: "Learn why cleaning companies that offer instant online quotes close 3x more jobs. Discover how to automate your quoting process and win more customers.",
    heroEmoji: "â¡",
    sections: [
      {
        heading: "The Quoting Problem Every Cleaning Company Faces",
        content: `If you run an exterior cleaning business â pressure washing, window cleaning, gutter cleaning, house washing â you know the drill. A potential customer reaches out, you drive to their property, measure everything, go home, build a quote in a spreadsheet, email it over, and then... crickets.

By the time you send that quote, your competitor already gave them a price. The customer moved on.

Here's the reality: 78% of customers choose the first company that gives them a price. Speed wins. And in 2026, "speed" means giving customers an instant quote right from their phone.`
      },
      {
        heading: "What Is an Instant Quoting Tool?",
        content: `An instant quoting tool is a widget that lives on your website. When a customer visits your site, they enter their address, select the services they need (house wash, window cleaning, gutter cleaning, etc.), and get a professional quote in under 60 seconds.

No phone calls. No site visits. No waiting. The customer gets a price, and you get their contact information as a lead â automatically.

The best quoting tools also show a satellite image of the customer's property (using Google Maps), compare your prices to national averages, and let customers customize packages with add-ons like deck washing or driveway cleaning.`
      },
      {
        heading: "How Instant Quotes Help You Close More Jobs",
        content: `Cleaning companies using instant quoting tools report closing 2-3x more jobs. Here's why:

First, you capture leads 24/7. Your quoting tool works while you sleep. A homeowner browsing at 10pm on a Sunday can get a quote and book you before Monday morning.

Second, you eliminate the back-and-forth. No more phone tag, no more "I'll get back to you with a price." The customer gets exactly what they need in one visit.

Third, you look more professional than your competition. A branded quoting tool with satellite property views and transparent pricing tells customers you're a serious, tech-savvy operation â not a guy with a pressure washer and a pickup truck.

Fourth, you capture every lead. Even if the customer doesn't book right away, you have their name, email, phone number, and address. You can follow up. Without a quoting tool, that customer just calls your competitor instead.`
      },
      {
        heading: "What to Look for in a Quoting Tool",
        content: `Not all quoting tools are built the same. Here's what matters for cleaning companies:

White-labeling is essential. The tool should show YOUR logo, YOUR colors, YOUR business name. Customers should never know they're using a third-party tool.

Industry-specific pricing matters. Generic quoting tools don't understand house washing vs. gutter cleaning vs. window cleaning. You need a tool built for exterior cleaning services with tiered packages (Standard, Premium, Platinum) and smart upsells.

Mobile-first design is non-negotiable. Over 70% of your customers will get a quote from their phone. If your quoting tool doesn't look perfect on mobile, you're losing jobs.

Lead capture and notifications keep you in the loop. You should get an instant notification every time someone requests a quote â with their full contact info and what services they need.`
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
    heroEmoji: "ð°",
    sections: [
      {
        heading: "Pricing Is the #1 Challenge for Cleaning Companies",
        content: `Ask any exterior cleaning business owner what keeps them up at night, and the answer is almost always pricing. Price too high and you lose the job. Price too low and you're working for free.

The truth is, most cleaning companies are guessing on price. They look at what their neighbor charges, add a little, and hope for the best. That's not a pricing strategy â that's a coin flip.

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
        content: `The most successful cleaning companies don't just quote a single price â they offer tiered packages. This strategy is proven to increase your average ticket size by 30-50%.

Here's how it works:

Your Standard package includes the core service the customer asked about. For example, just a house wash.

Your Premium package bundles the core service with one popular add-on. House wash plus gutter cleaning, for example. Price this at 20-30% more than Standard.

Your Platinum package is the works â house wash, gutter cleaning, window cleaning, and driveway. Price this at 40-60% more than Standard, but make sure the customer can see they're getting a deal compared to buying each service separately.

Most customers pick Premium. They don't want the cheapest option (feels risky), and the most expensive feels like too much. Premium is the sweet spot â and it's exactly where you want them.`
      },
      {
        heading: "How to Present Your Prices Professionally",
        content: `How you present your pricing matters almost as much as the actual price. Here's what separates the cleaning companies closing 80% of quotes from those closing 20%:

Speed is everything. The first company to provide a quote wins the job most of the time. If you can give customers an instant price online, you're ahead of 95% of your competition.

Show the value. Don't just list a number â show what's included. Break it down by service. Show before/after expectations. Include a property satellite view so the customer knows you're quoting THEIR house, not a generic price.

Compare to national averages. When customers see that your price is at or below the national average, their hesitation disappears. "Our house wash at $350 is 15% below the national average of $410" is a powerful closing statement.

Make it easy to say yes. Don't make customers call you, email you, or fill out a 20-field form. One-click booking or a simple "Accept Quote" button converts browsers into buyers.`
      },
      {
        heading: "Automate Your Pricing With the Right Tools",
        content: `Manually building quotes for every lead is a time killer. The average cleaning company owner spends 5-10 hours per week on quoting alone. That's time you could spend on jobs that pay.

Modern quoting tools let you set your prices once and let the software do the math. Customers enter their address, select their services, and get an instant professional quote â 24/7, even while you're on a job or asleep.

MyBidQuick was built specifically for exterior cleaning companies. You set your per-square-foot rates, your package tiers, and your add-on prices. The tool handles the rest â instant quotes, lead capture, and professional presentation with your brand.`
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
    metaDescription: "Stop chasing leads. Learn 5 proven strategies cleaning companies use to close more jobs online â from instant quoting to automated follow-ups and smart upsells.",
    heroEmoji: "ð",
    sections: [
      {
        heading: "Cold Calling Is Dead. Online Closing Is King.",
        content: `Let's be real â nobody answers their phone anymore. Especially not from unknown numbers. If your sales strategy for your cleaning business is still "call every lead until they pick up," you're fighting a losing battle.

The cleaning companies growing fastest in 2026 are the ones that let customers buy on their own terms â online, at their own pace, without being pressured by a salesperson.

Here are five strategies that are working right now for exterior cleaning companies across the country.`
      },
      {
        heading: "1. Offer Instant Quotes on Your Website",
        content: `This is the single biggest thing you can do. Put a quoting tool on your website that gives customers a real price in under 60 seconds.

Think about it from the customer's perspective. They've got dirty gutters. They Google "gutter cleaning near me." They find your website. If they have to call you, leave a voicemail, and wait for a callback â they're going to click the next result instead.

But if they can type in their address and get a quote instantly? Now you've got their attention AND their contact info.

Companies using instant quoting tools see 2-3x more leads than those relying on "call for a free estimate" buttons. The math speaks for itself.`
      },
      {
        heading: "2. Use Tiered Packages With Smart Upsells",
        content: `Don't just quote one price. Offer three packages: Standard, Premium, and Platinum.

When a customer asks for a house wash, show them that for just a little more they could also get their gutters cleaned. And for the best value, throw in window cleaning too.

This is called a cascade upsell â you start with what they asked for, then show the next logical service, then the full package. It works because customers can see the value stepping up.

On average, tiered pricing increases your ticket size by 30-50%. That means on a $400 house wash lead, you're now closing $520-$600 jobs instead. Over a full season, that's tens of thousands in extra revenue.`
      },
      {
        heading: "3. Follow Up Automatically",
        content: `Here's a stat that should make you cringe: 48% of cleaning companies never follow up with a lead after the first contact. Almost half.

The money is in the follow-up. A customer who got a quote but didn't book isn't a lost cause â they're busy, distracted, or comparing prices. A simple follow-up email or text 24 hours later can close 20-30% of those "dead" leads.

Set up automatic follow-ups. When someone gets a quote on your site, they should automatically receive a confirmation email with their quote details and a link to book. Then a follow-up 24 hours later. Then another at 72 hours if they haven't booked.

You don't need to manually send these. The right quoting tool handles it for you.`
      },
      {
        heading: "4. Show Social Proof and Reviews",
        content: `Customers trust other customers more than they trust you. That's not an insult â it's human nature.

Put your Google reviews front and center on your website and your quoting page. If you have before/after photos, show them. If you have video testimonials, even better.

The goal is to answer the customer's unspoken question: "Can I trust these guys with my house?" Five-star reviews and visual proof answer that question without you saying a word.

If you don't have many reviews yet, start asking every happy customer to leave one. A simple text after each completed job â "Hey, thanks for choosing us! Would you mind leaving us a quick Google review?" â works surprisingly well.`
      },
      {
        heading: "5. Make Booking as Easy as Ordering a Pizza",
        content: `The final step where most cleaning companies lose jobs is the booking process itself. The customer wants to hire you, but the process is confusing, slow, or requires too many steps.

Your booking flow should be as simple as: get a quote, click "Book Now," pick a date. That's it. No phone calls required. No "we'll get back to you within 24-48 hours."

In 2026, customers expect the same convenience from their cleaning company that they get from Amazon or DoorDash. The companies that deliver that convenience win. The companies that make customers jump through hoops lose.

MyBidQuick handles all five of these strategies â instant quoting, tiered packages, lead capture, professional presentation, and simple booking â in one tool built specifically for cleaning companies.`
      }
    ],
    cta: "Ready to close more jobs online?",
    ctaButton: "Get Started Free",
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
