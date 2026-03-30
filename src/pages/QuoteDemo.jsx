import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Droplets, Check, Tag, X, Waves } from 'lucide-react'

/*
  QuoteDemo - A working demo of the customer-facing quoting experience,
  showing the smart cascade upsell flow:
    House Washing quote -> Window Cleaning upsell -> Gutter Cleaning upsell

  Smart cascade logic:
  - After house wash quote, show window cleaning upsell
  - Whether they accept OR decline windows, offer gutter cleaning next
  - Gutter linear footage is auto-estimated from house square footage

  This is a preview/demo so Tim can see the full flow.
  The real quoting engine lives in the mybidquick-engine repo.
*/

const WINDOW_TYPES = [
  { id: 'single_hung', name: 'Single-Hung', description: 'One movable sash', priceMultiplier: 1.0 },
  { id: 'double_hung', name: 'Double-Hung', description: 'Both sashes move', priceMultiplier: 1.15 },
  { id: 'casement', name: 'Casement', description: 'Hinged, crank open', priceMultiplier: 1.25 },
  { id: 'sliding', name: 'Sliding', description: 'Slides horizontally', priceMultiplier: 1.1 },
  { id: 'bay_bow', name: 'Bay / Bow', description: 'Multi-panel, angled', priceMultiplier: 1.5 },
]

const SQ_FT_OPTIONS = [
  { label: 'Under 1,500 sq ft', value: 1200, tier: 'small' },
  { label: '1,500 - 2,500 sq ft', value: 2000, tier: 'medium' },
  { label: '2,500 - 3,500 sq ft', value: 3000, tier: 'large' },
  { label: '3,500+ sq ft', value: 4000, tier: 'xlarge' },
]

// Demo config - in production this comes from the tenant's MyBidQuick config
const DEMO_CONFIG = {
  businessName: 'Cloute Cleaning',
  primaryColor: '#2563eb',
  secondaryColor: '#60a5fa',
  houseWashBasePrice: 350,
  windowBasePrice: 250,
  gutterBasePrice: 125,
  gutterPerLinFt: 1.50,
  upsellDiscountPercent: 20,
}

function calculateHouseWashPrice(sqft) {
  // Simple pricing: base price scaled by square footage
  const base = DEMO_CONFIG.houseWashBasePrice
  if (sqft <= 1500) return base
  if (sqft <= 2500) return Math.round(base * 1.4)
  if (sqft <= 3500) return Math.round(base * 1.8)
  return Math.round(base * 2.2)
}

function calculateWindowPrice(sqft, windowType, discountPercent) {
  const base = DEMO_CONFIG.windowBasePrice
  const typeMultiplier = WINDOW_TYPES.find(w => w.id === windowType)?.priceMultiplier || 1
  let sizeMultiplier = 1
  if (sqft <= 1500) sizeMultiplier = 0.8
  else if (sqft <= 2500) sizeMultiplier = 1.0
  else if (sqft <= 3500) sizeMultiplier = 1.3
  else sizeMultiplier = 1.6

  const fullPrice = Math.round(base * typeMultiplier * sizeMultiplier)
  const discountedPrice = Math.round(fullPrice * (1 - discountPercent / 100))
  return { fullPrice, discountedPrice, savings: fullPrice - discountedPrice }
}

// Estimate gutter linear footage from house square footage
// Industry standard: perimeter ~= 4 * sqrt(sqft), gutters run ~1.1x perimeter
function estimateGutterLinearFt(sqft) {
  return Math.round(1.1 * Math.sqrt(sqft) * 4)
}

function calculateGutterPrice(sqft, discountPercent) {
  const linearFt = estimateGutterLinearFt(sqft)
  const base = DEMO_CONFIG.gutterBasePrice
  const perFt = DEMO_CONFIG.gutterPerLinFt
  const fullPrice = Math.round(base + (linearFt * perFt))
  const discountedPrice = Math.round(fullPrice * (1 - discountPercent / 100))
  return {
    linearFt,
    fullPrice,
    discountedPrice,
    savings: fullPrice - discountedPrice,
  }
}

export default function QuoteDemo() {
  const navigate = useNavigate()
  // Phases: select_size -> show_quote -> upsell_windows -> upsell_gutters -> final
  const [phase, setPhase] = useState('select_size')
  const [selectedSqft, setSelectedSqft] = useState(null)
  const [houseWashPrice, setHouseWashPrice] = useState(0)

  // Window upsell state
  const [showWindowUpsell, setShowWindowUpsell] = useState(false)
  const [selectedWindowType, setSelectedWindowType] = useState(null)
  const [windowUpsellAccepted, setWindowUpsellAccepted] = useState(false)
  const [windowPricing, setWindowPricing] = useState(null)

  // Gutter upsell state
  const [showGutterUpsell, setShowGutterUpsell] = useState(false)
  const [gutterUpsellAccepted, setGutterUpsellAccepted] = useState(false)
  const [gutterPricing, setGutterPricing] = useState(null)

  const handleSqftSelect = (option) => {
    setSelectedSqft(option)
    const price = calculateHouseWashPrice(option.value)
    setHouseWashPrice(price)
    setPhase('show_quote')
    // After a small delay, show the window upsell
    setTimeout(() => setShowWindowUpsell(true), 1200)
  }

  const handleWindowTypeSelect = (type) => {
    setSelectedWindowType(type.id)
    const pricing = calculateWindowPrice(selectedSqft.value, type.id, DEMO_CONFIG.upsellDiscountPercent)
    setWindowPricing(pricing)
  }

  // Smart cascade: after window decision, always show gutter upsell
  const handleAcceptWindowUpsell = () => {
    setWindowUpsellAccepted(true)
    setShowWindowUpsell(false)
    // Pre-calculate gutter pricing for this house size
    const gPricing = calculateGutterPrice(selectedSqft.value, DEMO_CONFIG.upsellDiscountPercent)
    setGutterPricing(gPricing)
    setPhase('upsell_gutters')
    setTimeout(() => setShowGutterUpsell(true), 600)
  }

  const handleDeclineWindowUpsell = () => {
    setShowWindowUpsell(false)
    // Still offer gutters even if they declined windows
    const gPricing = calculateGutterPrice(selectedSqft.value, DEMO_CONFIG.upsellDiscountPercent)
    setGutterPricing(gPricing)
    setPhase('upsell_gutters')
    setTimeout(() => setShowGutterUpsell(true), 600)
  }

  const handleAcceptGutterUpsell = () => {
    setGutterUpsellAccepted(true)
    setShowGutterUpsell(false)
    setPhase('final')
  }

  const handleDeclineGutterUpsell = () => {
    setShowGutterUpsell(false)
    setPhase('final')
  }

  // Calculate totals for summary
  const totalPrice = houseWashPrice
    + (windowUpsellAccepted && windowPricing ? windowPricing.discountedPrice : 0)
    + (gutterUpsellAccepted && gutterPricing ? gutterPricing.discountedPrice : 0)
  const totalSavings =
    (windowUpsellAccepted && windowPricing ? windowPricing.savings : 0)
    + (gutterUpsellAccepted && gutterPricing ? gutterPricing.savings : 0)

  const primaryColor = DEMO_CONFIG.primaryColor

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Demo banner */}
      <div style={{
        background: '#fef3c7', padding: '10px 24px', textAlign: 'center',
        fontSize: 13, fontWeight: 600, color: '#92400e',
        borderBottom: '1px solid #fde68a',
      }}>
        Demo Preview - This is what your customers will see on your quoting page
      </div>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${DEMO_CONFIG.secondaryColor})`,
        padding: '32px 24px', textAlign: 'center', color: 'white',
      }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{DEMO_CONFIG.businessName}</div>
        <div style={{ fontSize: 15, opacity: 0.9, marginTop: 4 }}>Get Your Instant Quote</div>
      </div>

      <div style={{ maxWidth: 560, margin: '32px auto', padding: '0 24px' }}>

        {/* ============================================ */}
        {/* STEP 1: Select home size                     */}
        {/* ============================================ */}
        {phase === 'select_size' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Home size={32} color={primaryColor} />
              <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>How big is your home?</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Select your home's approximate square footage</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SQ_FT_OPTIONS.map(opt => (
                <button
                  key={opt.tier}
                  onClick={() => handleSqftSelect(opt)}
                  style={{
                    padding: '18px 20px', borderRadius: 12,
                    border: '2px solid #e2e8f0', background: 'white',
                    cursor: 'pointer', fontSize: 16, fontWeight: 600,
                    textAlign: 'left', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.background = `${primaryColor}08` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white' }}
                >
                  <span>{opt.label}</span>
                  <span style={{ color: primaryColor, fontSize: 14 }}>Select {'->'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 2: Show house wash quote + window upsell */}
        {/* ============================================ */}
        {phase === 'show_quote' && (
          <div>
            <div style={{
              background: 'white', borderRadius: 16, padding: 32,
              border: '1px solid #e2e8f0', textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <Droplets size={32} color={primaryColor} />
              <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 8, marginBottom: 4 }}>House Washing</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{selectedSqft.label}</p>
              <div style={{
                fontSize: 48, fontWeight: 900, color: primaryColor,
                lineHeight: 1,
              }}>
                ${houseWashPrice}
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>Estimated quote for your home</p>
            </div>

            {/* Window upsell popup */}
            {showWindowUpsell && (
              <div style={{
                marginTop: 20,
                animation: 'slideUp 0.4s ease-out',
              }}>
                <div style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  border: '2px solid #059669',
                  boxShadow: '0 8px 32px rgba(5, 150, 105, 0.15)',
                }}>
                  {/* Upsell header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    padding: '16px 20px', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={18} />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>
                        Save {DEMO_CONFIG.upsellDiscountPercent}% on Window Cleaning!
                      </span>
                    </div>
                    <button
                      onClick={handleDeclineWindowUpsell}
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                      Since we're already at your home, get your windows done at a special bundled rate.
                      Just pick your window type:
                    </p>

                    {/* Window type selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {WINDOW_TYPES.map(type => {
                        const isSelected = selectedWindowType === type.id
                        return (
                          <button
                            key={type.id}
                            onClick={() => handleWindowTypeSelect(type)}
                            style={{
                              padding: '12px 16px', borderRadius: 10,
                              border: isSelected ? `2px solid #059669` : '2px solid #e2e8f0',
                              background: isSelected ? '#f0fdf4' : 'white',
                              cursor: 'pointer', textAlign: 'left',
                              transition: 'all 0.2s',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{type.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{type.description}</div>
                            </div>
                            {isSelected && <Check size={18} color="#059669" />}
                          </button>
                        )
                      })}
                    </div>

                    {/* Show pricing when type is selected */}
                    {windowPricing && (
                      <div style={{
                        background: '#f0fdf4', borderRadius: 10, padding: 16,
                        marginBottom: 16, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                          <span style={{ textDecoration: 'line-through' }}>${windowPricing.fullPrice}</span>
                          {' \u2192 '}Bundle price:
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#059669' }}>
                          ${windowPricing.discountedPrice}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                          You save ${windowPricing.savings}!
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={handleAcceptWindowUpsell}
                        disabled={!selectedWindowType}
                        style={{
                          flex: 1, padding: '14px 20px', borderRadius: 10,
                          background: selectedWindowType ? '#059669' : '#94a3b8',
                          color: 'white', border: 'none', cursor: selectedWindowType ? 'pointer' : 'not-allowed',
                          fontWeight: 800, fontSize: 15, transition: 'background 0.2s',
                        }}
                      >
                        Yes, Add Windows!
                      </button>
                      <button
                        onClick={handleDeclineWindowUpsell}
                        style={{
                          padding: '14px 20px', borderRadius: 10,
                          background: 'transparent', color: '#64748b',
                          border: '1px solid #e2e8f0', cursor: 'pointer',
                          fontWeight: 600, fontSize: 14,
                        }}
                      >
                        No thanks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 3: Gutter Cleaning upsell               */}
        {/* ============================================ */}
        {phase === 'upsell_gutters' && (
          <div>
            {/* Recap what they have so far */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 24,
              border: '1px solid #e2e8f0', marginBottom: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your quote so far
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#059669" />
                  <span style={{ fontWeight: 600, fontSize: 15 }}>House Washing</span>
                </div>
                <span style={{ fontWeight: 800, color: primaryColor }}>${houseWashPrice}</span>
              </div>
              {windowUpsellAccepted && windowPricing && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="#059669" />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Window Cleaning</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 8,
                      background: '#f0fdf4', color: '#059669',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {DEMO_CONFIG.upsellDiscountPercent}% OFF
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#059669' }}>${windowPricing.discountedPrice}</span>
                </div>
              )}
            </div>

            {/* Gutter upsell card */}
            {showGutterUpsell && gutterPricing && (
              <div style={{ animation: 'slideUp 0.4s ease-out' }}>
                <div style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  border: '2px solid #7c3aed',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
                }}>
                  {/* Gutter upsell header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    padding: '16px 20px', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Waves size={18} />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>
                        Add Gutter Cleaning - Save {DEMO_CONFIG.upsellDiscountPercent}%!
                      </span>
                    </div>
                    <button
                      onClick={handleDeclineGutterUpsell}
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                      While we're at your home, we can clean your gutters too!
                      Based on your home size, we've estimated your gutter length automatically.
                    </p>

                    {/* Gutter estimate info */}
                    <div style={{
                      background: '#f5f3ff', borderRadius: 10, padding: 16,
                      marginBottom: 16,
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 12,
                      }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>Estimated gutter length</span>
                        <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 16 }}>
                          ~{gutterPricing.linearFt} linear ft
                        </span>
                      </div>
                      <div style={{
                        fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
                        borderTop: '1px solid #e9e5f5', paddingTop: 8,
                      }}>
                        Based on industry averages for a {selectedSqft.label.toLowerCase()} home
                      </div>
                    </div>

                    {/* Gutter pricing */}
                    <div style={{
                      background: '#f5f3ff', borderRadius: 10, padding: 16,
                      marginBottom: 16, textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                        <span style={{ textDecoration: 'line-through' }}>${gutterPricing.fullPrice}</span>
                        {' \u2192 '}Bundle price:
                      </div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed' }}>
                        ${gutterPricing.discountedPrice}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                        You save ${gutterPricing.savings}!
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={handleAcceptGutterUpsell}
                        style={{
                          flex: 1, padding: '14px 20px', borderRadius: 10,
                          background: '#7c3aed',
                          color: 'white', border: 'none', cursor: 'pointer',
                          fontWeight: 800, fontSize: 15, transition: 'background 0.2s',
                        }}
                      >
                        Yes, Add Gutters!
                      </button>
                      <button
                        onClick={handleDeclineGutterUpsell}
                        style={{
                          padding: '14px 20px', borderRadius: 10,
                          background: 'transparent', color: '#64748b',
                          border: '1px solid #e2e8f0', cursor: 'pointer',
                          fontWeight: 600, fontSize: 14,
                        }}
                      >
                        No thanks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 4: Final summary                        */}
        {/* ============================================ */}
        {phase === 'final' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#f0fdf4', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <Check size={28} color="#059669" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Your Quote Summary</h2>
            </div>

            {/* Line items */}
            <div style={{ borderTop: '1px solid #e2e8f0' }}>
              {/* House Washing - always shown */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '16px 0', borderBottom: '1px solid #f1f5f9',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>House Washing</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selectedSqft?.label}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: primaryColor }}>${houseWashPrice}</div>
              </div>

              {/* Window Cleaning - if accepted */}
              {windowUpsellAccepted && windowPricing && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '16px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      Window Cleaning
                      <span style={{
                        marginLeft: 8, padding: '2px 8px', borderRadius: 10,
                        background: '#f0fdf4', color: '#059669',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {DEMO_CONFIG.upsellDiscountPercent}% OFF
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {WINDOW_TYPES.find(w => w.id === selectedWindowType)?.name} windows
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#059669' }}>${windowPricing.discountedPrice}</div>
                    <div style={{ fontSize: 12, color: '#64748b', textDecoration: 'line-through' }}>${windowPricing.fullPrice}</div>
                  </div>
                </div>
              )}

              {/* Gutter Cleaning - if accepted */}
              {gutterUpsellAccepted && gutterPricing && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '16px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      Gutter Cleaning
                      <span style={{
                        marginLeft: 8, padding: '2px 8px', borderRadius: 10,
                        background: '#f5f3ff', color: '#7c3aed',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {DEMO_CONFIG.upsellDiscountPercent}% OFF
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      ~{gutterPricing.linearFt} linear ft estimated
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#7c3aed' }}>${gutterPricing.discountedPrice}</div>
                    <div style={{ fontSize: 12, color: '#64748b', textDecoration: 'line-through' }}>${gutterPricing.fullPrice}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '20px 0 0', marginTop: 4,
            }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Total Estimate</div>
              <div style={{ fontWeight: 900, fontSize: 24, color: primaryColor }}>
                ${totalPrice}
              </div>
            </div>

            {/* Savings banner */}
            {totalSavings > 0 && (
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 8,
                background: 'linear-gradient(135deg, #f0fdf4, #f5f3ff)', textAlign: 'center',
                fontSize: 13, fontWeight: 700, color: '#059669',
              }}>
                You're saving ${totalSavings} by bundling!
              </div>
            )}

            <button style={{
              width: '100%', padding: '16px 24px', borderRadius: 12,
              background: primaryColor, color: 'white', border: 'none',
              cursor: 'pointer', fontWeight: 800, fontSize: 16,
              marginTop: 24,
            }}>
              Book Now
            </button>
          </div>
        )}

        {/* Back to MyBidQuick */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            margin: '32px auto', padding: '10px 20px', borderRadius: 8,
            background: 'transparent', border: '1px solid #e2e8f0',
            color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          <ArrowLeft size={14} /> Back to MyBidQuick
        </button>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
