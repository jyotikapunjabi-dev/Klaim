import { useState, useMemo } from 'react';
import { Sparkles, Upload, ArrowUpRight, Search, Loader2, Zap, X, Check, AlertTriangle, Clock, Mail } from 'lucide-react';

// Real voucher data extracted from Samvit's GPay Rewards + Swiggy Scratch & Win screenshots.
// Expiry dates: explicit where GPay/Swiggy showed badges ("6d left", "13d left", "1 day");
// estimated where GPay hides expiry behind individual taps (the structural product insight in v1 narrative).
// inrValue is direct ₹ savings where applicable; null for % or freebie deals.

const VOUCHERS = [
  { id: 1, brand: 'Zepto', source: 'GPay Rewards', label: '₹5–100 cashback', inrValue: 50, daysLeft: 6, daysExplicit: true, category: 'Food & Groceries', code: null, specialty: '10-min grocery delivery; ideal for top-up shops', tone: '#7C3AED' },
  { id: 2, brand: 'Meesho', source: 'GPay Rewards', label: '₹5–100 cashback', inrValue: 50, daysLeft: 6, daysExplicit: true, category: 'Fashion', code: null, specialty: 'Budget marketplace; tier-2/3 fashion, home essentials', tone: '#DB2777' },
  { id: 3, brand: 'Nykaa Fashion', source: 'GPay Rewards', label: '₹5–100 cashback', inrValue: 50, daysLeft: 6, daysExplicit: true, category: 'Fashion', code: null, specialty: 'Mid-premium fashion; separate platform from Nykaa Beauty', tone: '#BE185D' },
  { id: 4, brand: 'District', source: 'GPay Rewards', label: '₹5–100 cashback', inrValue: 50, daysLeft: 6, daysExplicit: true, category: 'Entertainment', code: null, specialty: 'Zomato-owned dining + movies + events bookings', tone: '#DC2626' },
  { id: 5, brand: 'McDelivery', source: 'GPay Rewards', label: 'Flat ₹100 off ₹249+', inrValue: 100, daysLeft: 3, daysExplicit: true, category: 'Food & Groceries', code: null, specialty: "McDonald's delivery in India", tone: '#DC2626' },
  { id: 6, brand: 'mCaffeine', source: 'GPay Rewards', label: 'Buy 2 Get 4 Free — bodywash, lotions, scrubs', inrValue: null, daysLeft: 13, daysExplicit: true, category: 'Beauty', code: null, specialty: 'D2C caffeine-based body care', tone: '#92400E' },
  { id: 7, brand: 'Cleartrip', source: 'GPay Rewards', label: '25% off hotel booking', inrValue: null, daysLeft: 30, daysExplicit: false, category: 'Travel', code: null, specialty: 'Travel: hotels and flights; value-focused vs MakeMyTrip', tone: '#EA580C' },
  { id: 8, brand: 'The Derma Co', source: 'GPay Rewards', label: '100% Cashback + 5% off prepaid sitewide', inrValue: null, daysLeft: 45, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C dermatology-led skincare (Honasa group)', tone: '#0891B2', isNew: true },
  { id: 9, brand: 'Clay Co', source: 'GPay Rewards', label: 'Flat 25% off + free moisturiser worth ₹399', inrValue: 399, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C skincare brand', tone: '#C2410C' },
  { id: 10, brand: 'Lenskart', source: 'GPay Rewards', label: 'Free Gold Max membership (1 year, ₹800)', inrValue: 800, daysLeft: 30, daysExplicit: false, category: 'Lifestyle', code: null, specialty: 'Eyewear: prescription glasses, sunglasses, contacts', tone: '#1D4ED8' },
  { id: 11, brand: "Re'equil", source: 'GPay Rewards', label: 'Flat ₹150 off above ₹600', inrValue: 150, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C dermatology skincare (sunscreens, moisturizers)', tone: '#15803D' },
  { id: 12, brand: 'Foxtale', source: 'GPay Rewards', label: 'Flat ₹400 off + 2 freebies worth ₹448', inrValue: 400, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C skincare (Vit C, brightening, sunscreens)', tone: '#9D174D' },
  { id: 13, brand: "Domino's", source: 'GPay Rewards', label: '8 slices of Large Pizza @ ₹499 + ₹50 cashback', inrValue: 50, daysLeft: 60, daysExplicit: false, category: 'Food & Groceries', code: null, specialty: 'Pizza delivery chain', tone: '#1E40AF' },
  { id: 14, brand: 'GIVA', source: 'GPay Rewards', label: 'Flat 20% off Fine Silver Jewellery', inrValue: null, daysLeft: 30, daysExplicit: false, category: 'Fashion', code: null, specialty: 'Silver jewellery brand (D2C)', tone: '#7F1D1D' },
  { id: 15, brand: 'Tira', source: 'GPay Rewards', label: '30% off above ₹1,999', inrValue: null, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'Reliance premium beauty retail; rival to Nykaa', tone: '#991B1B' },
  { id: 16, brand: 'Minimalist', source: 'GPay Rewards', label: 'Free Sunscreen on orders above ₹899', inrValue: null, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C science-backed skincare (now Be Minimalist)', tone: '#171717' },
  { id: 17, brand: 'BigBasket', source: 'GPay Rewards', label: '₹100 cashback on min ₹149 (new users only)', inrValue: 100, daysLeft: 30, daysExplicit: false, category: 'Food & Groceries', code: null, specialty: 'Largest online grocery; weekly grocery shop', tone: '#65A30D', caveat: 'New users only' },
  { id: 18, brand: 'Hyphen', source: 'GPay Rewards', label: 'Flat ₹200 off above ₹499 + 5% prepaid', inrValue: 200, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C skincare brand (Kriti Sanon-backed)', tone: '#CA8A04' },
  { id: 19, brand: 'Hyphen', source: 'GPay Rewards', label: 'Buy 3 @ ₹999 — serums, lip balms', inrValue: null, daysLeft: 21, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C skincare brand (Kriti Sanon-backed)', tone: '#CA8A04' },
  { id: 20, brand: 'RENEE Cosmetics', source: 'GPay Rewards', label: 'Buy any 2 @ special price', inrValue: null, daysLeft: 14, daysExplicit: false, category: 'Beauty', code: null, specialty: 'D2C makeup brand', tone: '#BE185D' },
  { id: 21, brand: 'Go', source: 'GPay Rewards', label: '15% off first domestic flight (max ₹1,500)', inrValue: 1500, daysLeft: 30, daysExplicit: false, category: 'Travel', code: null, specialty: 'Domestic flights', tone: '#EA580C' },
  { id: 22, brand: 'Puma', source: 'Swiggy Rewards', label: 'Extra 33% off', inrValue: null, daysLeft: 1, daysExplicit: true, category: 'Fashion', code: 'F4CBLNCGE6', specialty: 'Sportswear: shoes, apparel, accessories', tone: '#171717', urgent: true },
  { id: 23, brand: 'Toothsi', source: 'Swiggy Rewards', label: 'Flat ₹20,000 off aligners', inrValue: 20000, daysLeft: 30, daysExplicit: false, category: 'Lifestyle', code: 'TOOTHSI20KOFF', specialty: 'Dental aligners (Tata MakeO)', tone: '#DC2626' },

  // Email-sourced vouchers (extracted via Gmail OAuth)
  { id: 24, brand: 'StayVista', source: 'Email', label: '5% off villa stays', inrValue: null, daysLeft: 30, daysExplicit: false, category: 'Travel', code: 'STAYVISTA', specialty: 'Premium private villas across 80+ destinations in India', tone: '#0F766E', isNew: true },
  { id: 25, brand: 'IndiGo Sightseeing', source: 'Email', label: '50% off tours & activities', inrValue: null, daysLeft: 7, daysExplicit: false, category: 'Travel', code: 'SUMMER50', specialty: 'Tours, sightseeing & activities at travel destinations', tone: '#1E3A8A', isNew: true },
  { id: 26, brand: 'IndiGo Hotels', source: 'Email', label: 'Up to 40% off hotels', inrValue: null, daysLeft: 12, daysExplicit: false, category: 'Travel', code: '6EMEGA', specialty: 'Hotels via IndiGo Hello 6E (also code 6EHOLIDAY for 35%)', tone: '#1E40AF', isNew: true },
  { id: 27, brand: 'EaseMyTrip', source: 'Email', label: 'Up to 60% off flights & hotels', inrValue: null, daysLeft: 14, daysExplicit: false, category: 'Travel', code: null, specialty: 'Travel aggregator — flights, hotels, holiday packages', tone: '#EA580C', isNew: true },
  { id: 28, brand: 'AirIndia Maharaja Club', source: 'Email', label: 'Red Tier member benefits', inrValue: null, daysLeft: 60, daysExplicit: false, category: 'Travel', code: null, specialty: 'AirIndia frequent flyer — Red tier mileage redemptions, fare deals', tone: '#B91C1C' },
  { id: 29, brand: 'Qatar Airways Privilege Club', source: 'Email', label: 'Oneworld member fare deals', inrValue: null, daysLeft: 60, daysExplicit: false, category: 'Travel', code: null, specialty: 'Oneworld alliance — international fares from India to Europe/US', tone: '#7C2D12' },
  { id: 30, brand: 'Club ITC', source: 'Email', label: 'Member: complimentary night at Grand Resorts', inrValue: null, daysLeft: 45, daysExplicit: false, category: 'Travel', code: null, specialty: 'ITC Hotels loyalty — luxury hotel chain across India', tone: '#1E293B' },
  { id: 31, brand: 'The Hindu', source: 'Email', label: '40% off + ₹200 extra on subscription', inrValue: 200, daysLeft: 10, daysExplicit: false, category: 'Lifestyle', code: 'RENEW200', specialty: 'Newspaper subscription — long-form journalism', tone: '#374151', isNew: true },
];

// Recently expired — the missed-value pitch.
const EXPIRED = [
  { id: 'e1', brand: 'Nykaa', source: 'GPay Rewards', label: '₹5–100 cashback', estValue: 50, expiredAgo: 'last week', tone: '#BE185D' },
  { id: 'e2', brand: 'Blinkit', source: 'GPay Rewards', label: '₹5–100 cashback', estValue: 50, expiredAgo: 'last week', tone: '#FACC15' },
  { id: 'e3', brand: 'Google Pay', source: 'GPay Rewards', label: '5% cashback on gift cards', estValue: null, expiredAgo: '2 weeks ago', tone: '#4285F4' },
  { id: 'e4', brand: 'ACWO', source: 'GPay Rewards', label: 'Flat 65% off earbuds + power bank', estValue: 800, expiredAgo: '3 weeks ago', tone: '#171717' },
  { id: 'e5', brand: 'Uber Intercity', source: 'Swiggy Rewards', label: '20% off intercity ride', estValue: 200, expiredAgo: 'last week', tone: '#0A0A0A' },
  { id: 'e6', brand: 'Uber Intercity', source: 'Swiggy Rewards', label: '20% off intercity ride', estValue: 200, expiredAgo: 'last month', tone: '#0A0A0A' },
];

const CATEGORIES = ['All', 'Beauty', 'Fashion', 'Food & Groceries', 'Travel', 'Lifestyle', 'Entertainment'];

export default function KlaimDashboard() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorResponse, setAdvisorResponse] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [vouchers, setVouchers] = useState(VOUCHERS);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrFileName, setOcrFileName] = useState('');
  const [ocrPreview, setOcrPreview] = useState(null);
  const [gmailSyncing, setGmailSyncing] = useState(false);
  const [gmailPreview, setGmailPreview] = useState(null);
  const [gmailLastSync, setGmailLastSync] = useState('2 hours ago');

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? vouchers : vouchers.filter(v => v.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => v.brand.toLowerCase().includes(q) || v.label.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [activeCategory, search, vouchers]);

  const stats = useMemo(() => {
    const totalValue = vouchers.reduce((s, v) => s + (v.inrValue || 0), 0);
    const expiringSoon = vouchers.filter(v => v.daysLeft <= 7).length;
    const missedValue = EXPIRED.reduce((s, e) => s + (e.estValue || 0), 0);
    return { totalValue, expiringSoon, total: vouchers.length, missedValue };
  }, [vouchers]);

  async function handleScreenshotUpload(file) {
    if (!file) return;
    setOcrLoading(true);
    setOcrError('');
    setOcrSuccess(null);
    setOcrFileName(file.name);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mediaType = file.type || 'image/png';

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const text = (data.extractedText || '').trim();
      const jsonText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '');
      const extracted = JSON.parse(jsonText);

      if (!Array.isArray(extracted)) throw new Error('Unexpected response shape');

      const tonePalette = ['#7C3AED', '#DB2777', '#0891B2', '#15803D', '#CA8A04', '#9D174D', '#1E40AF', '#0F766E', '#B91C1C', '#7C2D12'];
      const now = Date.now();
      const previewItems = extracted
        .filter(v => !v.expired)
        .map((v, i) => ({
          id: `ocr-${now}-${i}`,
          brand: v.brand || 'Unknown',
          label: v.label || '',
          category: v.category || 'Lifestyle',
          code: v.code || null,
          daysLeft: typeof v.daysLeft === 'number' ? v.daysLeft : 30,
          daysExplicit: typeof v.daysLeft === 'number',
          inrValue: typeof v.inrValue === 'number' ? v.inrValue : null,
          specialty: v.specialty || '',
          source: 'Uploaded screenshot',
          tone: tonePalette[Math.floor(Math.random() * tonePalette.length)],
          isNew: true,
          included: true,
        }));

      if (previewItems.length === 0) {
        setOcrError("No active vouchers detected. Try a clearer image of a rewards page.");
        return;
      }

      setOcrPreview(previewItems);

    } catch (e) {
      setOcrError(`Couldn't read this screenshot. ${e.message || 'Try a clearer image.'}`);
    } finally {
      setOcrLoading(false);
    }
  }

  function toggleOcrItem(id) {
    setOcrPreview(prev => prev.map(p => p.id === id ? { ...p, included: !p.included } : p));
  }

  function confirmOcrAdd() {
    if (!ocrPreview) return;
    const toAdd = ocrPreview.filter(p => p.included).map(({ included, ...rest }) => rest);
    setVouchers(prev => [...toAdd, ...prev]);
    setOcrPreview(null);
    setOcrFileName('');
    setUploadOpen(false);
  }

  function resetOcr() {
    setOcrError('');
    setOcrFileName('');
    setOcrPreview(null);
  }

  async function syncGmail() {
    setGmailSyncing(true);
    setGmailPreview(null);

    // Realistic delay — feels like a real Gmail API roundtrip
    await new Promise(r => setTimeout(r, 2200));

    // Demo "new emails since last sync" — surfaced for user review
    const tonePalette = ['#7C3AED', '#0891B2', '#15803D', '#CA8A04', '#9D174D'];
    const now = Date.now();
    const fresh = [
      {
        id: `gmail-${now}-1`,
        brand: 'BoAt',
        source: 'Email',
        label: '20% off audio + free shipping',
        inrValue: null,
        daysLeft: 14,
        daysExplicit: false,
        category: 'Lifestyle',
        code: 'BOAT20',
        specialty: 'Audio: earbuds, headphones, speakers',
        tone: tonePalette[0],
        isNew: true,
        included: true,
        emailFrom: 'newsletter@imagineboat.com',
      },
      {
        id: `gmail-${now}-2`,
        brand: 'Sugar Cosmetics',
        source: 'Email',
        label: 'Flat ₹250 off above ₹999',
        inrValue: 250,
        daysLeft: 7,
        daysExplicit: false,
        category: 'Beauty',
        code: 'SUGAR250',
        specialty: 'Indian D2C makeup — lipsticks, kajal, eyeshadow',
        tone: tonePalette[3],
        isNew: true,
        included: true,
        emailFrom: 'hello@sugarcosmetics.com',
      },
      {
        id: `gmail-${now}-3`,
        brand: 'Yatra',
        source: 'Email',
        label: '10% off domestic flights, max ₹1,000',
        inrValue: 1000,
        daysLeft: 10,
        daysExplicit: false,
        category: 'Travel',
        code: 'FLY10',
        specialty: 'Travel aggregator — flights, hotels',
        tone: tonePalette[2],
        isNew: true,
        included: true,
        emailFrom: 'offers@yatra.com',
      },
      {
        id: `gmail-${now}-4`,
        brand: 'Manhattan Prep',
        source: 'Email',
        label: '15% off GMAT course bundle',
        inrValue: null,
        daysLeft: 5,
        daysExplicit: false,
        category: 'Lifestyle',
        code: 'GMAT15',
        specialty: 'GMAT/GRE prep courses — likely irrelevant for shopping',
        tone: '#6B7280',
        isNew: true,
        included: false, // Pre-unchecked — Klaim flags this as low-relevance
        emailFrom: 'newsletter@manhattanprep.com',
        lowRelevance: true,
      },
    ];

    setGmailPreview(fresh);
    setGmailSyncing(false);
  }

  function toggleGmailItem(id) {
    setGmailPreview(prev => prev.map(p => p.id === id ? { ...p, included: !p.included } : p));
  }

  function confirmGmailAdd() {
    if (!gmailPreview) return;
    const toAdd = gmailPreview
      .filter(p => p.included)
      .map(({ included, emailFrom, lowRelevance, ...rest }) => rest);
    setVouchers(prev => [...toAdd, ...prev]);
    setGmailPreview(null);
    setGmailLastSync('just now');
  }

  function dismissGmailPreview() {
    setGmailPreview(null);
  }

  async function askAdvisor() {
    if (!advisorQuery.trim()) return;
    setAdvisorLoading(true);
    setAdvisorResponse('');
    try {
      const portfolio = vouchers.map(v =>
        `- ${v.brand} (${v.specialty}): ${v.label}; ${v.daysLeft}d left${v.daysExplicit ? '' : ' (estimated)'}; via ${v.source}${v.code ? `; code ${v.code}` : ''}${v.caveat ? `; ${v.caveat}` : ''}`
      ).join('\n');

      const systemPrompt = `You are a sharp shopping advisor for an Indian consumer using Klaim, an app that aggregates voucher portfolios from GPay, Swiggy, and similar.

Their active rewards portfolio (each line includes the retailer's specialty):

${portfolio}

WHEN INPUT CONTAINS A URL OR SPECIFIC PRODUCT NAME — use the web_search tool to:
1. Identify the product CATEGORY/TYPE, not just the specific brand (e.g. "XERGY battery LED candle" → "home decor / battery candles"; "Mamaearth Onion Shampoo" → "anti-hairfall shampoo").
2. Treat the user as BRAND-FLEXIBLE unless they explicitly say otherwise. Search portfolio retailers for ALTERNATIVE products in the same category that may be cheaper or where vouchers apply (e.g. Meesho carries home decor; Tira carries premium beauty; D2C brand sites for skincare).
3. If you find a real alternative on a portfolio retailer, recommend it with concrete savings math (source price vs alternative price minus voucher discount).
4. INCLUDE A REAL URL from your web_search results when recommending an alternative — either a specific product page or, if unavailable, a category search page on that retailer (e.g. https://www.meesho.com/search?q=led+candle). NEVER fabricate or guess URLs. If web_search didn't surface a usable link, just name the retailer without a URL.
5. Only fall back to "buy direct on Amazon/source" if NO portfolio retailer carries the category at all.

REASONING APPROACH:
- Match shopping intent to retailer SPECIALTY (cameras → electronics, kurta → fashion, face wash → beauty/D2C skincare, candles → home decor like Meesho).
- Among matches, prioritize: closest expiry, highest direct savings, no caveats.
- If nothing in portfolio fits, say what kind of voucher would help.

OUTPUT FORMAT (STRICT):
- 2-3 SHORT sentences. Maximum 60 words. Be punchy.
- Use **bold** for: brand names, voucher codes, savings amounts (₹), urgency words like "expires today".
- Use *italic* for: caveats only (e.g. *new users only*, *expires soon*).
- NO bullet points, NO headers, NO line breaks within a paragraph.
- Write like a savvy friend texting fast, not a customer service bot.
- Mention specific vouchers and codes when relevant.`;

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userQuery: advisorQuery }),
      });
      const data = await res.json();
      const text = data.response || '';
      const cleaned = text
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
      setAdvisorResponse(cleaned || "Hmm, no response. Try again.");
    } catch (e) {
      setAdvisorResponse("Couldn't reach the advisor right now. Try again in a moment.");
    } finally {
      setAdvisorLoading(false);
    }
  }

  const urgencyTone = (days, explicit) => {
    if (days <= 3) return { bg: '#FEE2E2', fg: '#991B1B', label: `${days}d left` };
    if (days <= 7) return { bg: '#FEF3C7', fg: '#92400E', label: `${days}d left` };
    if (days <= 15) return { bg: '#ECFCCB', fg: '#3F6212', label: `${days}d left` };
    return { bg: '#EFEFEF', fg: '#6B6862', label: explicit ? `${days}d left` : `~${days}d left` };
  };

  return (
    <div className="min-h-screen w-full" style={{ background: '#FAFAFA', color: '#1A1815', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeUp 0.5s ease-out forwards; opacity: 0; }
        .serif { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-optical-sizing: auto; }
        .serif-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 500; }
        .grain { background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0); background-size: 24px 24px; }
        .tilt-1 { transform: rotate(-1.4deg); }
        .tilt-2 { transform: rotate(1.8deg); }
        .tilt-3 { transform: rotate(-0.8deg); }
        .tilt-4 { transform: rotate(2.1deg); }
        .tilt-5 { transform: rotate(-2deg); }
        .tilt-6 { transform: rotate(1.2deg); }
        .voucher-card { transition: transform 0.25s ease, box-shadow 0.25s ease; transform-origin: center; }
        .voucher-card:hover { transform: rotate(0deg) scale(1.02); box-shadow: 0 12px 28px rgba(26, 24, 21, 0.14); z-index: 5; position: relative; }
      `}</style>

      <header className="border-b" style={{ borderColor: '#E0E0E0' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#3B5C8A' }}>
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="serif text-2xl tracking-tight">Klaim</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: '#E0E0E0', color: '#6B6862' }}>beta</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: '#6B6862' }}>
            <span>Dashboard</span>
            <span>Discover</span>
            <span>Settings</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ background: '#3B5C8A' }}>S</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="fade-in mb-10" style={{ animationDelay: '0.05s' }}>
          <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B6862' }}>Your portfolio · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</div>
          <h1 className="serif text-3xl md:text-4xl leading-tight mb-2">
            You have <em className="serif-italic" style={{ color: '#3B5C8A' }}>₹{stats.totalValue.toLocaleString('en-IN')}+</em> sitting in vouchers.
          </h1>
          <p className="text-base" style={{ color: '#6B6862' }}>
            {stats.expiringSoon} expire in the next week. ₹{stats.missedValue.toLocaleString('en-IN')} already lost to expiry last month.
          </p>
        </section>

        {/* AI Advisor */}
        <section className="fade-in mb-10" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden" style={{ background: '#3B5C8A', color: '#FAFAFA' }}>
            <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: '#0F2547' }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: '#0F2547' }}>Klaim Advisor</span>
              </div>
              <h2 className="serif text-3xl md:text-4xl mb-5">What are you shopping for?</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={advisorQuery}
                  onChange={(e) => setAdvisorQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAdvisor()}
                  placeholder="e.g. sunscreen, silver earrings, or paste a Nykaa product link to compare with Tira..."
                  className="flex-1 px-4 py-3 rounded-lg outline-none text-base"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.15)' }}
                />
                <button
                  onClick={askAdvisor}
                  disabled={advisorLoading || !advisorQuery.trim()}
                  className="px-5 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                  style={{ background: '#0F2547', color: '#FAFAFA' }}
                >
                  {advisorLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {advisorLoading ? 'Thinking...' : 'Ask Klaim'}
                </button>
              </div>
              {advisorResponse && (
                <div className="mt-5 p-4 rounded-lg fade-in" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {(() => {
                      const pattern = /(\*\*[^*]+?\*\*)|(\*[^*\n]+?\*)|(https?:\/\/[^\s)]+)/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      let key = 0;
                      while ((match = pattern.exec(advisorResponse)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(<span key={key++}>{advisorResponse.slice(lastIndex, match.index)}</span>);
                        }
                        if (match[1]) {
                          parts.push(<strong key={key++} className="font-semibold" style={{ color: '#FAFAFA' }}>{match[1].slice(2, -2)}</strong>);
                        } else if (match[2]) {
                          parts.push(<em key={key++} style={{ opacity: 0.85 }}>{match[2].slice(1, -1)}</em>);
                        } else if (match[3]) {
                          const url = match[3];
                          parts.push(
                            <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 break-all" style={{ color: '#FAFAFA' }}>
                              {url.length > 55 ? url.substring(0, 52) + '...' : url}
                            </a>
                          );
                        }
                        lastIndex = pattern.lastIndex;
                      }
                      if (lastIndex < advisorResponse.length) {
                        parts.push(<span key={key++}>{advisorResponse.slice(lastIndex)}</span>);
                      }
                      return parts;
                    })()}
                  </div>
                </div>
              )}
              {!advisorResponse && !advisorLoading && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {['sunscreen for acne prone skin', 'silver earrings for gifting', 'hotel in Goa next month', 'pizza for tonight', 'camera under ₹50k'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setAdvisorQuery(s); }}
                      className="text-xs px-3 py-1.5 rounded-full transition hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="fade-in grid grid-cols-3 gap-3 md:gap-4 mb-10" style={{ animationDelay: '0.2s' }}>
          {[
            { label: 'Total value', val: `₹${stats.totalValue.toLocaleString('en-IN')}`, sub: `across ${stats.total} active vouchers` },
            { label: 'Expiring this week', val: stats.expiringSoon, sub: "don't lose these", urgent: true },
            { label: 'Missed last month', val: `₹${stats.missedValue.toLocaleString('en-IN')}`, sub: 'expired before use', muted: true },
          ].map((s, i) => (
            <div key={i} className="p-4 md:p-5 rounded-xl border min-w-0" style={{ borderColor: '#E0E0E0', background: 'white' }}>
              <div className="text-[10px] md:text-xs uppercase tracking-wider mb-2 leading-tight" style={{ color: '#6B6862' }}>{s.label}</div>
              <div className="serif text-xl md:text-2xl lg:text-3xl mb-1 leading-tight" style={{ color: s.urgent && stats.expiringSoon > 0 ? '#B45309' : s.muted ? '#92400E' : '#1A1815', wordBreak: 'break-word' }}>{s.val}</div>
              <div className="text-[10px] md:text-xs leading-tight" style={{ color: '#6B6862' }}>{s.sub}</div>
            </div>
          ))}
        </section>

        {/* Filters + actions */}
        <section className="fade-in mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className="text-sm px-3 py-1.5 rounded-full transition"
                style={{
                  background: activeCategory === c ? '#1A1815' : 'transparent',
                  color: activeCategory === c ? '#FAFAFA' : '#1A1815',
                  border: `1px solid ${activeCategory === c ? '#1A1815' : '#E0E0E0'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6862' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands"
                className="text-sm pl-9 pr-3 py-2 rounded-full outline-none"
                style={{ background: 'white', border: '1px solid #E0E0E0', color: '#1A1815' }}
              />
            </div>
            <button
              onClick={syncGmail}
              disabled={gmailSyncing}
              className="text-sm px-3 py-2 rounded-full flex items-center gap-2 transition disabled:opacity-60"
              style={{ background: 'white', color: '#1A1815', border: '1px solid #E0E0E0' }}
              title={`Last synced: ${gmailLastSync}`}
            >
              {gmailSyncing ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {gmailSyncing ? 'Syncing Gmail…' : 'Sync Gmail'}
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="text-sm px-3 py-2 rounded-full flex items-center gap-2 transition"
              style={{ background: '#1A1815', color: '#FAFAFA' }}
            >
              <Upload size={14} /> Add screenshots
            </button>
          </div>
        </section>

        {/* Voucher grid — sticker book treatment */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 py-2">
          {filtered.map((v, i) => {
            const u = urgencyTone(v.daysLeft, v.daysExplicit);
            const tiltClass = `tilt-${(i % 6) + 1}`;
            return (
              <div
                key={v.id}
                className={`voucher-card fade-in border p-5 group cursor-pointer relative overflow-hidden rounded-2xl ${tiltClass}`}
                style={{ background: 'white', borderColor: '#1A1815', borderWidth: '0.5px', animationDelay: `${0.3 + i * 0.025}s` }}
              >
                {/* Accent strip in brand colour */}
                <div className="absolute top-0 left-0 right-0" style={{ height: '4px', background: v.tone }} />
                <div className="flex items-start justify-between mb-4 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center text-white font-semibold text-sm" style={{ background: v.tone, borderRadius: '4px' }}>
                      {v.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-sm leading-tight flex items-center gap-1.5 uppercase tracking-wider" style={{ fontSize: '11px', color: '#1A1815' }}>
                        {v.brand}
                        {v.isNew && <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-wider" style={{ background: '#3B5C8A', color: '#0F2547', borderRadius: '2px' }}>NEW</span>}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#6B6862' }}>via {v.source}</div>
                    </div>
                  </div>
                  <div
                    className="text-xs px-2 py-1 font-medium whitespace-nowrap uppercase tracking-wider"
                    style={{ background: u.bg, color: u.fg, fontSize: '10px', borderRadius: '2px' }}
                  >
                    {u.label}
                  </div>
                </div>
                <div className="serif text-2xl mb-1 leading-snug">{v.label}</div>
                <div className="text-xs mb-3" style={{ color: '#6B6862', fontStyle: 'italic' }}>{v.category}</div>
                {v.caveat && (
                  <div className="text-xs flex items-center gap-1 mb-3" style={{ color: '#92400E' }}>
                    <AlertTriangle size={11} /> {v.caveat}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px dashed #C8BFA8' }}>
                  {v.code ? (
                    <div className="text-xs font-mono px-2 py-1 font-semibold" style={{ background: '#EFEFEF', color: '#3B5C8A', borderRadius: '2px' }}>{v.code}</div>
                  ) : (
                    <div className="text-xs italic" style={{ color: '#6B6862' }}>Use in {v.source.split(' ')[0]}</div>
                  )}
                  <button className="text-xs flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition uppercase tracking-wider" style={{ color: '#3B5C8A' }}>
                    Use now <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#6B6862' }}>
            <p>No vouchers match. Try a different category.</p>
          </div>
        )}

        {/* Recently expired — the missed value pitch */}
        <section className="mt-16 fade-in" style={{ animationDelay: '0.5s' }}>
          <div>
            <div className="text-xs tracking-widest uppercase mb-1" style={{ color: '#92400E' }}>Recently expired · what you missed</div>
            <h3 className="serif text-3xl">₹{stats.missedValue.toLocaleString('en-IN')} lost <em style={{ color: '#92400E' }}>in the last 30 days.</em></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {EXPIRED.map((e) => (
              <div key={e.id} className="rounded-lg border p-3 opacity-60 hover:opacity-100 transition" style={{ background: '#F4F4F4', borderColor: '#E0E0E0' }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold text-xs mb-2" style={{ background: e.tone }}>
                  {e.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="font-medium text-xs mb-1 line-clamp-1">{e.brand}</div>
                <div className="text-xs leading-tight mb-2" style={{ color: '#6B6862' }}>{e.label}</div>
                <div className="text-[10px] flex items-center gap-1" style={{ color: '#92400E' }}>
                  <Clock size={9} /> Expired {e.expiredAgo}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2" style={{ borderTop: '1px solid #E0E0E0', color: '#6B6862' }}>
          <div>Klaim · Your rewards, in one place. Built in Mumbai.</div>
          <div className="flex items-center gap-1">
            <Sparkles size={10} /> Powered by Claude · Real portfolio, real recommendations
          </div>
        </footer>
      </main>

      {/* Upload modal — Pattern B: review and confirm */}
      {uploadOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(26,24,21,0.5)' }} onClick={() => { setUploadOpen(false); resetOcr(); }}>
          <div className="rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#FAFAFA' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="serif text-2xl">
                {ocrPreview ? 'Review extracted vouchers' : ocrLoading ? 'Reading screenshot' : 'Add screenshots'}
              </h3>
              <button onClick={() => { setUploadOpen(false); resetOcr(); }} className="opacity-60 hover:opacity-100"><X size={18} /></button>
            </div>

            {!ocrLoading && !ocrError && !ocrPreview && (
              <>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleScreenshotUpload(e.target.files?.[0])}
                  />
                  <div className="rounded-xl border-2 border-dashed p-10 text-center mb-4 cursor-pointer hover:border-current transition" style={{ borderColor: '#C8C8C8' }}>
                    <Upload size={28} className="mx-auto mb-3" style={{ color: '#6B6862' }} />
                    <div className="text-sm mb-1 font-medium">Drop a screenshot from GPay, Swiggy, CRED, PhonePe</div>
                    <div className="text-xs" style={{ color: '#6B6862' }}>Click to choose · or drag & drop</div>
                  </div>
                </label>
                <div className="text-xs space-y-2" style={{ color: '#6B6862' }}>
                  <div className="flex items-center gap-2"><Check size={12} style={{ color: '#15803D' }} /> Brand, value, code — auto-detected via Claude Vision</div>
                  <div className="flex items-center gap-2"><Check size={12} style={{ color: '#15803D' }} /> Review every voucher before adding — you stay in control</div>
                </div>
              </>
            )}

            {ocrLoading && (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: '#E0E0E0', background: 'white' }}>
                <Loader2 size={28} className="animate-spin mx-auto mb-4" style={{ color: '#3B5C8A' }} />
                <div className="serif text-xl mb-2">Reading {ocrFileName || 'your screenshot'}…</div>
                <div className="text-xs" style={{ color: '#6B6862' }}>Claude Vision is identifying every voucher in the image. Usually takes 5-10 seconds.</div>
              </div>
            )}

            {ocrError && !ocrLoading && (
              <div className="rounded-xl border p-6" style={{ borderColor: '#FCA5A5', background: '#FEF2F2' }}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={18} style={{ color: '#991B1B' }} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm mb-1" style={{ color: '#991B1B' }}>Extraction failed</div>
                    <div className="text-xs" style={{ color: '#7F1D1D' }}>{ocrError}</div>
                  </div>
                </div>
                <button onClick={resetOcr} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: '#1A1815', color: '#FAFAFA' }}>
                  Try another screenshot
                </button>
              </div>
            )}

            {ocrPreview && !ocrLoading && (
              <>
                <div className="text-xs mb-3" style={{ color: '#6B6862' }}>
                  Found <strong style={{ color: '#1A1815' }}>{ocrPreview.length} voucher{ocrPreview.length === 1 ? '' : 's'}</strong> in {ocrFileName}. Uncheck anything you don't want.
                </div>
                <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
                  {ocrPreview.map((p) => (
                    <label key={p.id} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-white transition" style={{ borderColor: p.included ? '#3B5C8A' : '#E0E0E0', background: p.included ? 'white' : '#F4F4F4' }}>
                      <input
                        type="checkbox"
                        checked={p.included}
                        onChange={() => toggleOcrItem(p.id)}
                        className="mt-1 cursor-pointer"
                        style={{ accentColor: '#3B5C8A' }}
                      />
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0" style={{ background: p.tone, opacity: p.included ? 1 : 0.4 }}>
                        {p.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0" style={{ opacity: p.included ? 1 : 0.5 }}>
                        <div className="font-medium text-sm">{p.brand}</div>
                        <div className="serif text-base leading-tight mt-0.5">{p.label}</div>
                        <div className="text-xs mt-1 flex items-center gap-2 flex-wrap" style={{ color: '#6B6862' }}>
                          <span>{p.category}</span>
                          {p.daysExplicit && <span>· {p.daysLeft}d left</span>}
                          {p.code && <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: '#EFEFEF', color: '#1A1815' }}>{p.code}</span>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={resetOcr} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E0E0E0', color: '#1A1815' }}>
                    Upload another
                  </button>
                  <button
                    onClick={confirmOcrAdd}
                    disabled={!ocrPreview.some(p => p.included)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
                    style={{ background: '#1A1815', color: '#FAFAFA' }}
                  >
                    Add {ocrPreview.filter(p => p.included).length} to portfolio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gmail preview modal — same review-and-confirm pattern */}
      {gmailPreview && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(26,24,21,0.5)' }} onClick={dismissGmailPreview}>
          <div className="rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#FAFAFA' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="serif text-2xl">Review Gmail vouchers</h3>
              <button onClick={dismissGmailPreview} className="opacity-60 hover:opacity-100"><X size={18} /></button>
            </div>

            <div className="text-xs mb-3" style={{ color: '#6B6862' }}>
              Found <strong style={{ color: '#1A1815' }}>{gmailPreview.length} new voucher{gmailPreview.length === 1 ? '' : 's'}</strong> in your inbox since last sync. We pre-unchecked low-relevance ones — adjust as you like.
            </div>

            <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
              {gmailPreview.map((p) => (
                <label key={p.id} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-white transition" style={{ borderColor: p.included ? '#3B5C8A' : '#E0E0E0', background: p.included ? 'white' : '#F4F4F4' }}>
                  <input
                    type="checkbox"
                    checked={p.included}
                    onChange={() => toggleGmailItem(p.id)}
                    className="mt-1 cursor-pointer"
                    style={{ accentColor: '#3B5C8A' }}
                  />
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0" style={{ background: p.tone, opacity: p.included ? 1 : 0.4 }}>
                    {p.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0" style={{ opacity: p.included ? 1 : 0.5 }}>
                    <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                      {p.brand}
                      {p.lowRelevance && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#FEF3C7', color: '#92400E' }}>Low relevance</span>}
                    </div>
                    <div className="serif text-base leading-tight mt-0.5">{p.label}</div>
                    <div className="text-xs mt-1 flex items-center gap-2 flex-wrap" style={{ color: '#6B6862' }}>
                      <span>{p.category}</span>
                      {p.code && <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: '#EFEFEF', color: '#1A1815' }}>{p.code}</span>}
                    </div>
                    <div className="text-[10px] mt-1 italic" style={{ color: '#6B6862' }}>from {p.emailFrom}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={dismissGmailPreview} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E0E0E0', color: '#1A1815' }}>
                Cancel
              </button>
              <button
                onClick={confirmGmailAdd}
                disabled={!gmailPreview.some(p => p.included)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
                style={{ background: '#1A1815', color: '#FAFAFA' }}
              >
                Add {gmailPreview.filter(p => p.included).length} to portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
