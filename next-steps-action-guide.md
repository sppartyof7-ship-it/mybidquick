# MyBidQuick — What Tim Needs To Do Next

These are the 3 remaining tasks that require YOUR hands because they involve creating accounts or security settings that I can't do for you.

---

## 1. Submit to Capterra (covers GetApp + Software Advice too)

Capterra, GetApp, and Software Advice are all owned by Gartner Digital Markets. One submission = listed on all three.

**You already started this** — the Gartner confirmation page is open in your browser showing your submission was received (request ID: 0a8c9922-8789-46be-a789-ccaa903ca4d1).

**What to watch for:**
- Check your email (tim@mybidquick.com → forwards to Gmail) for a confirmation or next-steps email from Gartner Digital Markets
- They may ask you to verify your identity or provide additional product details
- Use the content from `docs/directory-listings.md` (already committed to GitHub) for any fields they ask you to fill in
- Upload screenshots when prompted — you can take them yourself by visiting mybidquick.com and scrolling through

**Timeline:** Gartner reviews typically take 1-2 weeks before your listing goes live.

---

## 2. Submit to G2

The G2 profile creation page is open in your browser at https://sell.g2.com/create-a-profile

**Steps:**
1. Click "Create a Profile" on the G2 page
2. Sign up with tim@mybidquick.com
3. Fill in the product details — copy/paste from `docs/directory-listings.md` in your GitHub repo
4. Key fields to fill:
   - **Product Name:** MyBidQuick
   - **Website:** https://www.mybidquick.com
   - **Category:** Quoting Software, Field Service Management
   - **Description:** Use the full description from directory-listings.md
   - **Pricing:** Pay-per-lead, starting at $2.50/quote (Starter: $25/10 credits)
5. Upload screenshots when prompted
6. Submit for review

**Timeline:** G2 reviews typically take 1-3 weeks.

---

## 3. Set Up Gmail "Send As" for tim@mybidquick.com

This lets you send emails FROM tim@mybidquick.com using your Gmail inbox, so replies to welcome emails come from the right address.

**IMPORTANT: Wait for Resend domain verification first!** Check https://resend.com/domains — mybidquick.com status must show "Verified" (green) before this will work. DNS records have been added and are propagating now.

**Steps:**
1. In Gmail Settings → Accounts, find "Send mail as"
2. Click "Add another email address"
3. Enter:
   - **Name:** Tim Sullivan
   - **Email:** tim@mybidquick.com
   - Check "Treat as an alias"
4. Click "Next Step"
5. **CRITICAL — Select "Send through SMTP" and enter these settings:**
   - **SMTP Server:** smtp.resend.com
   - **Port:** 587 (TLS) ← NOT 465/SSL, which fails with Resend
   - **Username:** resend
   - **Password:** Your Resend API key (find it at https://resend.com/api-keys)
6. Click "Add Account"
7. Gmail will send a verification code to tim@mybidquick.com
8. Since that forwards to your Gmail, check your inbox for the code
9. Enter the verification code
10. Done! Now when composing emails, you can choose to send as tim@mybidquick.com

**Optional but recommended:** After adding it, click "make default" next to tim@mybidquick.com so all MyBidQuick-related replies go out from the right address.

---

## What's Already Done (This Session)

- compare.html competitor page committed + deployed + added to sitemap
- Resend domain swapped: send.mybidquick.com → mybidquick.com (root domain)
- DNS records added to Vercel: DKIM, SPF (MX + TXT), DMARC — propagating now
- Resend API key saved to Supabase Edge Function Secrets
- Welcome email Edge Function updated to send from tim@mybidquick.com (v4 deployed)
- docs/resend-setup.md committed to GitHub
- docs/directory-listings.md committed to GitHub (copy-paste content for directories)
- Gartner Digital Markets submission started (confirmation received)
- Screenshots taken: homepage hero, branded tenant quote page

---

## After These 3 Tasks — What's Next

Once these are done, your launch blockers are almost clear:

1. ~~**Change admin123 password**~~ — ✅ DONE 2026-04-05. Strong password set via Vercel env var `VITE_ADMIN_PASSWORD`, redeployed.
2. **Tenant usage analytics tab** — I can build this (conversion rates, quote volume, ROI)
3. **Welcome email testing** — Send a test email via the Edge Function to verify the full pipeline works

Want me to start on the analytics tab or test the email pipeline next session?
