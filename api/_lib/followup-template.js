// ============================================================================
// api/_lib/followup-template.js
// Substitutes the human-readable placeholders tenants put in their follow-up
// subject/body templates with real lead + tenant data.
//
// Tenant-facing syntax (what they type in the Follow-Up tab):
//   [Customer Name]   → first name from lead.name
//   [Your Business]   → tenant.business_name
//   [Quote Total]     → formatted dollar amount from lead.total
//   [Services]        → comma-separated friendly service names
//
// Legacy mustache syntax also supported (so tenants who copy/pasted older
// {{name}}, {{business}}, {{total}}, {{services}} from docs still work):
//   {{name}}, {{business}}, {{total}}, {{services}}
// ============================================================================

/**
 * @param {string} text         The raw subject or body string from config.followUp
 * @param {object} args
 * @param {object} args.lead    Row from `leads` table
 * @param {object} args.tenant  Row from `tenants` table (must include business_name + config)
 * @returns {string}            Substituted text, ready to email
 */
export function substituteTemplate(text, { lead, tenant }) {
  if (!text || typeof text !== 'string') return ''
  const values = buildSubstitutionValues({ lead, tenant })

  return text
    // Bracket syntax (new, tenant-facing).
    .replace(/\[Customer Name\]/gi, values.customerName)
    .replace(/\[Your Business\]/gi, values.businessName)
    .replace(/\[Quote Total\]/gi, values.quoteTotal)
    .replace(/\[Services\]/gi, values.services)
    // Mustache syntax (legacy — keep working for tenants who already edited them).
    .replace(/\{\{\s*name\s*\}\}/gi, values.customerName)
    .replace(/\{\{\s*business\s*\}\}/gi, values.businessName)
    .replace(/\{\{\s*total\s*\}\}/gi, values.quoteTotal)
    .replace(/\{\{\s*services\s*\}\}/gi, values.services)
}

function buildSubstitutionValues({ lead, tenant }) {
  // Customer name: prefer first name only (warmer, less robotic).
  const fullName = (lead && lead.name ? String(lead.name).trim() : '')
  const customerName = fullName ? fullName.split(/\s+/)[0] : 'there'

  const businessName = (tenant && tenant.business_name ? String(tenant.business_name).trim() : 'Our team')

  const quoteTotal = formatMoney(lead && lead.total) || 'your quote'

  const services = formatServices(lead, tenant) || 'cleaning service'

  return { customerName, businessName, quoteTotal, services }
}

function formatMoney(v) {
  if (v == null) return null
  const n = Number(v)
  if (!isFinite(n)) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

// Turn lead.services (mix of strings or {id,name,...} objects) into a
// friendly, customer-facing comma list. Looks up names from tenant.config.services
// so we say "House Washing" not "house_washing".
function formatServices(lead, tenant) {
  const services = lead && Array.isArray(lead.services) ? lead.services : []
  if (!services.length) return ''

  const tenantServices = (tenant && tenant.config && Array.isArray(tenant.config.services))
    ? tenant.config.services
    : []

  const names = services.map((entry) => {
    let id = null
    let inlineName = ''
    if (typeof entry === 'string') id = entry
    else if (entry && typeof entry === 'object') {
      id = entry.id || null
      inlineName = entry.name || entry.service || ''
    }
    if (inlineName) return inlineName
    if (id) {
      const match = tenantServices.find((s) => s.id === id)
      if (match && match.name) return match.name
      return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return null
  }).filter(Boolean)

  if (!names.length) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return names[0] + ' and ' + names[1]
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1]
}
