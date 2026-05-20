// ============================================================================
// POST /api/send-lead-notification
// Sends a "you have a new lead!" email to the cleaning company (tenant) when a
// customer submits a quote on their slug.mybidquick.com page.
//
// This is the TENANT-FACING email — internal, so unlike the customer
// confirmation we DO show the full price breakdown: per-service prices, tier
// selected, selected extras, and the Standard/Premium/Platinum comparison.
// (Per project rule, formulas/rates are only hidden from CUSTOMERS — tenants
// need to see every number so they can sell from it.)
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'

const ALLOWED_ORIGINS = [
  'https://www.mybidquick.com',
  'https://mybidquick.com',
  'http://localhost:5173',
  'http://localhost:5174',
]

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(
    (o) => origin === o || (origin && origin.endsWith('.mybidquick.com'))
  )
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const cors = getCorsHeaders(origin)
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lead, tenant_id } = req.body
    if (!lead || !tenant_id) {
      return res.status(400).json({ error: 'Missing lead or tenant_id' })
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('business_name, email, phone, slug, primary_color, config')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant lookup failed:', tenantError)
      return res.status(404).json({ error: 'Tenant not found' })
    }

    const recipient = tenant.config?.leadEmail || tenant.email
    if (!recipient) {
      return res.status(200).json({ skipped: true, reason: 'No leadEmail configured for tenant' })
    }

    const html = buildLeadNotificationEmail(lead, tenant)
    const subject = buildSubject(lead, tenant)

    const platformBcc = process.env.LEAD_NOTIFICATION_BCC || 'tim@mybidquick.com'
    const bccList = platformBcc && platformBcc.toLowerCase() !== recipient.toLowerCase()
      ? [platformBcc] : undefined

    await sendEmail({
      to: recipient,
      bcc: bccList,
      subject,
      html,
      replyTo: lead.email || undefined,
    })

    return res.status(200).json({ sent: true, to: recipient, bcc: bccList })
  } catch (err) {
    console.error('Lead notification email failed:', err)
    return res.status(500).json({ error: 'Email send failed', detail: err.message })
  }
}

async function sendEmail({ to, bcc, subject, html, replyTo }) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api_key
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

  const payload = {
    from: 'MyBidQuick Leads <leads@send.mybidquick.com>',
    to, subject, html,
  }
  if (bcc && bcc.length) payload.bcc = bcc
  if (replyTo) payload.reply_to = replyTo

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }
  return response.json()
}

function buildSubject(lead, tenant) {
  const total = formatMoney(lead.total)
  const name = lead.name || 'Customer'
  const tierLabel = packageLabel(lead.package || lead.selectedPackage)
  const services = serviceNamesList(lead, tenant)
  const shortServices = services.length > 2
    ? services.slice(0, 2).join(' + ') + ' +' + (services.length - 2)
    : services.join(' + ')
  const bits = []
  if (tierLabel) bits.push(tierLabel)
  if (shortServices) bits.push(shortServices)
  const tail = bits.length ? ' (' + bits.join(' • ') + ')' : ''
  return total
    ? 'New Lead — ' + name + ' — ' + total + tail
    : 'New Lead — ' + name + tail
}

function buildLeadNotificationEmail(lead, tenant) {
  const businessName = tenant.business_name || 'Your Cleaning Company'
  const brandColor = tenant.primary_color || '#2563eb'
  const brandColorDark = darkenHex(brandColor, 0.15)
  const slug = tenant.slug || ''

  const customerName = lead.name || 'Unnamed customer'
  const customerEmail = lead.email || ''
  const customerPhone = lead.phone || ''
  const customerAddress = lead.address || ''
  const projectType = lead.projectType || lead.project_type || ''
  const leadSource = lead.leadSource || lead.lead_source || ''
  const notes = lead.notes || ''
  const allPhotos = Array.isArray(lead.photos) ? lead.photos : []
  const photoCount = allPhotos.length
  const photosWithUrls = allPhotos.filter((p) => p && typeof p.url === 'string' && p.url)
  const preferredDays = lead.preferredDays || lead.preferred_days || ''
  const preferredTime = lead.preferredTime || lead.preferred_time || ''

  const chosenTier = (lead.package || lead.selectedPackage || '').toLowerCase()
  const chosenTierLabel = packageLabel(chosenTier)
  const packagePrices = lead.packagePrices || lead.package_prices || {}
  const servicePrices = lead.servicePrices || lead.service_prices || {}
  const selectedExtras = lead.selectedExtras || lead.selected_extras || {}
  const total = formatMoney(lead.total)

  const services = buildServiceRows(lead, tenant, servicePrices, chosenTier)
  const extrasRows = buildExtrasRows(selectedExtras, tenant)
  const tierComparisonRows = buildTierComparisonRows(packagePrices, chosenTier)

  const dashboardUrl = 'https://www.mybidquick.com/#/dashboard'
  const slugUrl = slug ? 'https://' + slug + '.mybidquick.com' : ''

  const contactRows = [
    customerEmail
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;width:90px;">Email:</td><td style="padding:4px 0;color:#1e3a5f;"><a href="mailto:' + escapeHtml(customerEmail) + '" style="color:' + brandColor + ';text-decoration:none;">' + escapeHtml(customerEmail) + '</a></td></tr>'
      : '',
    customerPhone
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;">Phone:</td><td style="padding:4px 0;color:#1e3a5f;"><a href="tel:' + escapeHtml(customerPhone) + '" style="color:' + brandColor + ';text-decoration:none;">' + escapeHtml(customerPhone) + '</a></td></tr>'
      : '',
    customerAddress
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;">Address:</td><td style="padding:4px 0;color:#1e3a5f;">' + escapeHtml(customerAddress) + '</td></tr>'
      : '',
    projectType
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;">Type:</td><td style="padding:4px 0;color:#1e3a5f;">' + escapeHtml(projectType) + '</td></tr>'
      : '',
    leadSource
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;">Source:</td><td style="padding:4px 0;color:#1e3a5f;">' + escapeHtml(leadSource) + '</td></tr>'
      : '',
    (preferredDays || preferredTime)
      ? '<tr><td style="padding:4px 0;color:#7a9bbc;">Prefers:</td><td style="padding:4px 0;color:#1e3a5f;">' + escapeHtml([preferredDays, preferredTime].filter(Boolean).join(' • ')) + '</td></tr>'
      : '',
  ].filter(Boolean).join('')

  const headerTierLine = chosenTierLabel
    ? '<p style="margin:6px 0 0;color:rgba(255,255,255,0.95);font-size:13px;font-weight:600;">Package: ' + escapeHtml(chosenTierLabel) + '</p>'
    : ''

  const servicesSection = services.rows
    ? '<h3 style="margin:0 0 8px;color:#1e3a5f;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">Services + Pricing Breakdown</h3>'
      + '<p style="margin:0 0 12px;color:#7a9bbc;font-size:12px;">Each service shown at the <strong>' + escapeHtml(chosenTierLabel || 'selected') + '</strong> tier the customer chose.</p>'
      + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:8px;margin-bottom:16px;overflow:hidden;border:1px solid #eef2f7;">'
      + '<thead><tr>'
      + '<th align="left" style="padding:10px 16px;background:#eef4fb;color:#1e3a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Service</th>'
      + '<th align="left" style="padding:10px 16px;background:#eef4fb;color:#1e3a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Tier Includes</th>'
      + '<th align="right" style="padding:10px 16px;background:#eef4fb;color:#1e3a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>'
      + '</tr></thead><tbody>' + services.rows + '</tbody></table>'
    : ''

  const extrasSection = extrasRows
    ? '<h3 style="margin:0 0 12px;color:#1e3a5f;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">Add-Ons Selected</h3>'
      + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffdf5;border-radius:8px;margin-bottom:20px;overflow:hidden;border:1px solid #f5e9c8;">'
      + extrasRows + '</table>'
    : ''

  const totalSection = total
    ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>'
      + '<td style="padding:14px 16px;background:#f0fdf4;border-radius:8px;color:#166534;">'
      + '<span style="font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Quote Total</span>'
      + '<span style="float:right;font-weight:800;font-size:22px;">' + total + '</span>'
      + '</td></tr></table>'
    : ''

  const tierSection = tierComparisonRows
    ? '<h3 style="margin:0 0 8px;color:#1e3a5f;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">Tier Comparison — This Same Bundle</h3>'
      + '<p style="margin:0 0 12px;color:#7a9bbc;font-size:12px;">Use these numbers when you call back if they want to step up or down a tier.</p>'
      + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:8px;overflow:hidden;border:1px solid #eef2f7;">'
      + tierComparisonRows + '</table>'
    : ''

  const notesSection = notes
    ? '<div style="padding:14px 16px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px;margin-bottom:24px;">'
      + '<p style="margin:0 0 4px;color:#92400e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Customer notes</p>'
      + '<p style="margin:0;color:#1e3a5f;font-size:14px;line-height:1.5;white-space:pre-wrap;">' + escapeHtml(notes) + '</p>'
      + '</div>'
    : ''

  let photosSection = ''
  if (photosWithUrls.length) {
    const photoCells = photosWithUrls.map((p) =>
      '<td style="padding:0;"><a href="' + escapeHtml(p.url) + '" target="_blank" style="display:inline-block;text-decoration:none;">'
      + '<img src="' + escapeHtml(p.url) + '" alt="' + escapeHtml(p.name || 'Customer photo') + '" width="140" height="140" style="display:block;width:140px;height:140px;object-fit:cover;border-radius:8px;border:1px solid #e2ecf5;" />'
      + '</a></td>'
    ).join('')
    photosSection =
      '<h3 style="margin:0 0 12px;color:#1e3a5f;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">📷 Customer Photos (' + photosWithUrls.length + ')</h3>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:8px;"><tr>' + photoCells + '</tr></table>'
      + '<p style="margin:-16px 0 24px;color:#7a9bbc;font-size:12px;">Click any photo to view full size.</p>'
  } else if (photoCount) {
    photosSection = '<p style="margin:0 0 24px;color:#b45309;font-size:13px;padding:12px 14px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:4px;">⚠️ Customer attempted to attach ' + photoCount + ' photo' + (photoCount === 1 ? '' : 's') + ", but the upload didn't complete. Ask them to re-send via text or email.</p>"
  }

  const callBtn = customerPhone
    ? '<td align="center" style="padding:4px;"><a href="tel:' + escapeHtml(customerPhone) + '" style="display:inline-block;padding:12px 24px;background:' + brandColor + ';color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">📞 Call now</a></td>'
    : ''
  const emailBtn = customerEmail
    ? '<td align="center" style="padding:4px;"><a href="mailto:' + escapeHtml(customerEmail) + '" style="display:inline-block;padding:12px 24px;background:#ffffff;color:' + brandColor + ';text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;border:2px solid ' + brandColor + ';">✉️ Email customer</a></td>'
    : ''

  const slugLink = slugUrl
    ? ' &nbsp;·&nbsp; <a href="' + slugUrl + '" style="color:' + brandColor + ';text-decoration:none;font-weight:600;">view your quote page</a>'
    : ''

  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Lead</title></head>',
    '<body style="margin:0;padding:0;background-color:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f8;"><tr><td align="center" style="padding:32px 16px;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">',
    '<tr><td style="background:linear-gradient(135deg,' + brandColor + ' 0%,' + brandColorDark + ' 100%);padding:24px 32px;text-align:center;">',
    '<p style="margin:0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">' + escapeHtml(businessName) + '</p>',
    '<h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">💼 New Lead' + (total ? ' — ' + total : '') + '</h1>',
    headerTierLine,
    '</td></tr>',
    '<tr><td style="padding:28px 32px;">',
    '<h2 style="margin:0 0 6px;color:#1e3a5f;font-size:20px;font-weight:700;">' + escapeHtml(customerName) + '</h2>',
    '<p style="margin:0 0 20px;color:#7a9bbc;font-size:13px;">Submitted just now via your quoting page</p>',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:24px;">' + contactRows + '</table>',
    servicesSection,
    extrasSection,
    totalSection,
    tierSection,
    notesSection,
    photosSection,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr>' + callBtn + emailBtn + '</tr></table>',
    '<p style="margin:16px 0 0;color:#7a9bbc;font-size:13px;">💡 <strong>Tip:</strong> Just hit Reply — your message goes straight to the customer.</p>',
    '<hr style="border:none;border-top:1px solid #e2ecf5;margin:24px 0;">',
    '<p style="margin:0;color:#7a9bbc;font-size:13px;line-height:1.6;">Manage all your leads in your <a href="' + dashboardUrl + '" style="color:' + brandColor + ';text-decoration:none;font-weight:600;">MyBidQuick dashboard</a>' + slugLink + '</p>',
    '</td></tr>',
    '<tr><td style="padding:16px 32px;text-align:center;background:#f0f0f0;"><p style="margin:0;color:#999;font-size:12px;">Powered by <a href="https://www.mybidquick.com" style="color:#2563eb;text-decoration:none;">MyBidQuick</a></p></td></tr>',
    '</table></td></tr></table></body></html>',
  ].join('')
}

function buildServiceRows(lead, tenant, servicePrices, chosenTier) {
  const ids = Array.isArray(lead.services) ? lead.services : []
  if (!ids.length) return { rows: '' }

  const tenantServices = (tenant.config && Array.isArray(tenant.config.services)) ? tenant.config.services : []

  const rows = ids.map((entry) => {
    let id = null
    let name = ''
    let inlinePrice = null
    let inlineTier = ''

    if (typeof entry === 'string') {
      id = entry
    } else if (entry && typeof entry === 'object') {
      id = entry.id || null
      name = entry.name || ''
      inlinePrice = entry.price != null ? entry.price : null
      inlineTier = entry.tier || ''
    }

    const match = id ? tenantServices.find((s) => s.id === id) : null
    if (!name) {
      name = (match && match.name)
        || (id ? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Service')
    }

    const tierKey = (inlineTier || chosenTier || '').toLowerCase()
    const tierFeatures = match && match.tierFeatures ? match.tierFeatures : null
    let tierIncludes = tierFeatures && tierKey && tierFeatures[tierKey] ? tierFeatures[tierKey] : ''
    if (!tierIncludes && tierKey) tierIncludes = packageLabel(tierKey) + ' package'

    let priceVal = inlinePrice
    if (priceVal == null && id && servicePrices && servicePrices[id] != null) {
      priceVal = servicePrices[id]
    }
    const priceStr = priceVal != null ? formatMoney(priceVal) : null

    const priceCell = priceStr
      ? '<td style="padding:12px 16px;border-top:1px solid #eef2f7;text-align:right;color:#1e3a5f;font-weight:700;white-space:nowrap;">' + priceStr + '</td>'
      : '<td style="padding:12px 16px;border-top:1px solid #eef2f7;text-align:right;color:#b6c2d3;font-style:italic;font-size:13px;">—</td>'

    return '<tr>'
      + '<td style="padding:12px 16px;border-top:1px solid #eef2f7;color:#1e3a5f;font-weight:600;vertical-align:top;width:32%;">' + escapeHtml(name) + '</td>'
      + '<td style="padding:12px 16px;border-top:1px solid #eef2f7;color:#555;font-size:13px;vertical-align:top;">' + escapeHtml(tierIncludes) + '</td>'
      + priceCell
      + '</tr>'
  }).join('')

  return { rows }
}

function buildExtrasRows(selectedExtras, tenant) {
  const items = []
  const tenantServices = (tenant.config && Array.isArray(tenant.config.services)) ? tenant.config.services : []

  function lookupExtra(serviceId, extraId) {
    const svc = serviceId ? tenantServices.find((s) => s.id === serviceId) : null
    if (svc && Array.isArray(svc.extras)) {
      return svc.extras.find((e) => e.id === extraId) || null
    }
    return null
  }

  if (Array.isArray(selectedExtras)) {
    selectedExtras.forEach((e) => {
      if (!e) return
      const meta = lookupExtra(e.serviceId, e.id) || {}
      items.push({
        label: e.label || meta.label || e.id || 'Add-on',
        price: e.price != null ? e.price : meta.price,
        parent: e.serviceId || '',
      })
    })
  } else if (selectedExtras && typeof selectedExtras === 'object') {
    Object.entries(selectedExtras).forEach(([serviceId, extras]) => {
      if (!Array.isArray(extras)) return
      const svc = tenantServices.find((s) => s.id === serviceId)
      const parentName = (svc && svc.name) || serviceId
      extras.forEach((e) => {
        let id, label, price
        if (typeof e === 'string') {
          id = e
        } else if (e && typeof e === 'object') {
          id = e.id
          label = e.label
          price = e.price
        }
        const meta = lookupExtra(serviceId, id) || {}
        items.push({
          label: label || meta.label || id || 'Add-on',
          price: price != null ? price : meta.price,
          parent: parentName,
        })
      })
    })
  }

  if (!items.length) return ''

  return items.map((it) => {
    const priceStr = it.price != null ? formatMoney(it.price) : '—'
    const parentPart = it.parent ? '<span style="color:#92400e;font-size:12px;"> · ' + escapeHtml(it.parent) + '</span>' : ''
    return '<tr>'
      + '<td style="padding:10px 16px;border-bottom:1px solid #f5e9c8;color:#1e3a5f;"><strong>' + escapeHtml(it.label) + '</strong>' + parentPart + '</td>'
      + '<td style="padding:10px 16px;border-bottom:1px solid #f5e9c8;text-align:right;color:#92400e;font-weight:700;white-space:nowrap;">' + priceStr + '</td>'
      + '</tr>'
  }).join('')
}

function buildTierComparisonRows(packagePrices, chosenTier) {
  if (!packagePrices || typeof packagePrices !== 'object') return ''
  const known = ['standard', 'premium', 'elite', 'platinum']
  const present = known.filter((k) => packagePrices[k] != null)
  if (!present.length) return ''

  return present.map((key) => {
    const isSelected = key === (chosenTier || '').toLowerCase()
    const label = packageLabel(key)
    const price = formatMoney(packagePrices[key]) || '—'
    const bg = isSelected ? '#f0fdf4' : '#ffffff'
    const labelColor = isSelected ? '#166534' : '#1e3a5f'
    const priceColor = isSelected ? '#166534' : '#1e3a5f'
    const weight = isSelected ? '800' : '600'
    const tag = isSelected
      ? '<span style="display:inline-block;margin-left:8px;padding:2px 8px;background:#166534;color:#fff;border-radius:999px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Chosen</span>'
      : ''
    return '<tr>'
      + '<td style="padding:12px 16px;border-top:1px solid #eef2f7;background:' + bg + ';color:' + labelColor + ';font-weight:' + weight + ';">' + escapeHtml(label) + tag + '</td>'
      + '<td style="padding:12px 16px;border-top:1px solid #eef2f7;background:' + bg + ';color:' + priceColor + ';font-weight:' + weight + ';text-align:right;">' + price + '</td>'
      + '</tr>'
  }).join('')
}

function packageLabel(key) {
  if (!key) return ''
  const k = String(key).toLowerCase()
  if (k === 'standard') return 'Standard'
  if (k === 'premium') return 'Premium'
  if (k === 'elite' || k === 'platinum') return 'Platinum'
  return k.charAt(0).toUpperCase() + k.slice(1)
}

function serviceNamesList(lead, tenant) {
  const ids = Array.isArray(lead.services) ? lead.services : []
  if (!ids.length) return []
  const services = (tenant.config && Array.isArray(tenant.config.services)) ? tenant.config.services : []
  return ids.map((id) => {
    if (typeof id === 'string') {
      const svc = services.find((s) => s.id === id)
      if (svc && svc.name) return svc.name
      return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
    if (id && typeof id === 'object') return id.name || id.service || 'Service'
    return 'Service'
  })
}

function formatMoney(v) {
  if (v == null) return null
  const n = Number(v)
  if (!isFinite(n)) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')
}

function darkenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
