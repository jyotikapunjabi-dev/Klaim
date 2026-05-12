import { useState, useMemo, useRef } from 'react';
import { Sparkles, Upload, ArrowUpRight, Search, Loader2, Zap, X, Check, AlertTriangle, Clock, Mail, Copy, Bell, ExternalLink, Chrome, ShoppingBag, TrendingUp, Plug } from 'lucide-react';

// Map known brands to their retail URLs. Fallback to a Google search for the brand.
const RETAILER_URLS = {
  'Zepto': 'https://www.zeptonow.com/',
  'Meesho': 'https://www.meesho.com/',
  'Nykaa Fashion': 'https://www.nykaafashion.com/',
  'District': 'https://www.district.in/',
  'McDelivery': 'https://www.mcdelivery.co.in/',
  'mCaffeine': 'https://www.mcaffeine.com/',
  'Cleartrip': 'https://www.cleartrip.com/',
  'The Derma Co': 'https://thedermaco.com/',
  'Clay Co': 'https://theclayco.in/',
  'Lenskart': 'https://www.lenskart.com/',
  "Re'equil": 'https://www.reequil.com/',
  'Foxtale': 'https://www.foxtale.in/',
  "Domino's": 'https://www.dominos.co.in/',
  'GIVA': 'https://www.giva.co/',
  'Tira': 'https://www.tirabeauty.com/',
  'Minimalist': 'https://beminimalist.co/',
  'BigBasket': 'https://www.bigbasket.com/',
  'Hyphen': 'https://hyphenbeauty.com/',
  'RENEE Cosmetics': 'https://reneecosmetics.in/',
  'Go': 'https://www.cleartrip.com/flights',
  'Puma': 'https://in.puma.com/',
  'Toothsi': 'https://toothsi.in/',
  'StayVista': 'https://www.stayvista.com/',
  'IndiGo Sightseeing': 'https://www.goindigo.in/add-on-services/sightseeing.html',
  'IndiGo Hotels': 'https://www.goindigo.in/hotels.html',
  'EaseMyTrip': 'https://www.easemytrip.com/',
  'AirIndia Maharaja Club': 'https://www.airindia.com/in/en/airindia-loyalty-program.html',
  'Qatar Airways Privilege Club': 'https://www.qatarairways.com/en/Privilege-Club.html',
  'Club ITC': 'https://www.itchotels.com/in/en/clubitc',
  'The Hindu': 'https://www.thehindu.com/subscription/',
};
const getRetailerUrl = (brand) => RETAILER_URLS[brand] || `https://www.google.com/search?q=${encodeURIComponent(brand + ' India shop')}`;

// Connected reward sources — shows the data-aggregation thesis.
const CONNECTED_SOURCES = [
  { name: 'GPay Rewards', status: 'active', count: 21, note: 'Last synced 2 hours ago' },
  { name: 'Swiggy Rewards', status: 'active', count: 2, note: 'Last synced 4 hours ago' },
  { name: 'Gmail (D2C brand emails)', status: 'active', count: 8, note: 'Last synced 1 hour ago' },
  { name: 'CRED Rewards', status: 'coming', note: 'Closed-loop coins + RentPay rewards' },
  { name: 'PhonePe Offers', status: 'coming', note: 'Cashbacks + scratch cards' },
  { name: 'Paytm Wallet', status: 'coming', note: 'Wallet balance + Paytm First offers' },
  { name: 'Marriott Bonvoy', status: 'coming', note: 'Hotel loyalty points + free nights' },
  { name: 'Air India Maharaja Club', status: 'coming', note: 'Frequent flyer miles + tier benefits' },
  { name: 'Credit Card Optimizer', status: 'coming', note: 'Best card for any purchase, in real time' },
];

// Static activity feed — communicates that Klaim is doing things for you.
const RECENT_ACTIVITY = [
  { icon: 'save', label: 'Saved ₹450 via', highlight: 'SUGAR250', tail: 'at Sugar Cosmetics', when: '2d ago', tone: '#15803D' },
  { icon: 'warn', label: 'Tira voucher expiring in', highlight: '3 days', tail: '· ₹600 at risk', when: 'now', tone: '#B45309' },
  { icon: 'new', label: 'New voucher detected from Gmail:', highlight: 'boAt 20% off', tail: '', when: '4h ago', tone: '#3B5C8A' },
  { icon: 'save', label: 'Saved ₹1,200 via', highlight: 'Cleartrip 25%', tail: 'on Goa flight', when: '1w ago', tone: '#15803D' },
  { icon: 'new', label: 'GPay sync added', highlight: '3 new vouchers', tail: 'across Beauty', when: '2h ago', tone: '#3B5C8A' },
  { icon: 'warn', label: 'Puma voucher expires', highlight: 'tomorrow', tail: '· code F4CBLNCGE6', when: 'now', tone: '#991B1B' },
];

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const copyCode = (code) => {
    if (!code) return;
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1600);
  };

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

  async function compressImage(file, maxDim = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not load image. Try a different file.'));
      };
      img.src = objectUrl;
    });
  }

  async function handleScreenshotUpload(file) {
    if (!file) return;
    setOcrLoading(true);
    setOcrError('');
    setOcrSuccess(null);
    setOcrFileName(file.name);

    try {
      // Resize/compress client-side to stay under Vercel's 4.5MB body limit and speed up upload
      const { base64, mediaType } = await compressImage(file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`API ${res.status}${errBody ? `: ${errBody.slice(0, 200)}` : ''}`);
      }
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
        `- ${v.brand} [URL: ${getRetailerUrl(v.brand)}] (specialty: ${v.specialty}; category: ${v.category}): ${v.label}; ${v.daysLeft}d left${v.daysExplicit ? '' : ' (estimated)'}; via ${v.source}${v.code ? `; code ${v.code}` : ''}${v.caveat ? `; ${v.caveat}` : ''}`
      ).join('\n');

      const systemPrompt = `You are a sharp shopping advisor for an Indian consumer using Klaim, an app that aggregates voucher portfolios from GPay, Swiggy, and similar.

Their active rewards portfolio. Each line includes the retailer's URL, specialty, category, offer, expiry, source, and any code:

${portfolio}

CATEGORY MATCHING — STRICT:
- Jewellery (silver/gold/earrings/rings/necklaces) ≠ Beauty/Makeup. GIVA is jewellery; Tira and Nykaa Beauty are makeup/skincare. NEVER substitute across these.
- Beauty/Skincare (D2C — serums, sunscreens, moisturizers) ≠ Fashion clothing. Hyphen and Foxtale are skincare, not apparel.
- Fashion clothing ≠ Sportswear. Meesho/Nykaa Fashion are general fashion; Puma is sportswear.
- Travel (flights, hotels, villas) is its own category — Cleartrip, IndiGo, StayVista, EaseMyTrip belong here.
- Food & Groceries (Zepto, BigBasket, McDelivery, Domino's) ≠ Lifestyle ≠ Beauty.
- If the user's query category has NO match in the portfolio, say so honestly. Do not stretch a beauty brand to cover jewellery, or a fashion brand to cover electronics.

REASONING APPROACH:
1. Identify the product CATEGORY from the user's query.
2. Find portfolio retailers whose specialty/category genuinely overlaps. Be strict — over-suggesting irrelevant brands erodes trust.
3. Among genuine matches, prioritize: (a) closest expiry, (b) highest concrete ₹ savings, (c) no caveats.
4. Mention 2-3 RELEVANT vouchers max. One strong primary, plus alternatives ONLY if they're in the same category.
5. If only one brand fits the category, that's fine — recommend it confidently rather than padding with off-category suggestions.
6. If NOTHING fits, say so honestly and name what voucher type would help.

DEEP LINKS — construct category/search URLs when possible:
- The portfolio gives you each retailer's HOMEPAGE URL. For a specific product query, append a search path to land the user directly on relevant items.
- D2C / Shopify brands (GIVA, Hyphen, Foxtale, Minimalist, Re'equil, RENEE, Clay Co, Derma Co, mCaffeine, Toothsi, StayVista): {homepage}search?q={query} — e.g. https://www.giva.co/search?q=silver+earrings, https://www.foxtale.in/search?q=vitamin+c+serum
- Marketplaces (Meesho, Nykaa Fashion, BigBasket, Lenskart, Tira): {homepage}search?q={query} — e.g. https://www.meesho.com/search?q=kurta, https://www.tirabeauty.com/search?q=lipstick
- Travel (Cleartrip, IndiGo, EaseMyTrip, AirIndia, Qatar Airways, Club ITC): use the homepage — deep links to specific flights/hotels are too complex to construct.
- Food / quick commerce (Zepto, Blinkit, McDelivery, Domino's): homepage.
- When in doubt, use {homepage}search?q={query} — it works on most modern Indian e-commerce sites. Falls back gracefully if the URL pattern is slightly different.
- ALWAYS URL-encode spaces as "+" or "%20" in the query string.

OUTPUT FORMAT:
- 3-5 sentences. Target 100-150 words. Concrete, specific, never generic.
- Use **bold** for: brand names in prose, voucher codes (e.g. **SUGAR250**), savings amounts (e.g. **₹500 off**), urgency phrases (e.g. **expires in 2 days**).
- Use *italic* for: caveats only (e.g. *new users only*, *prepaid only*).
- ALWAYS include a markdown link for the recommended retailer, using a DEEP LINK to the product category/search page when possible. Format: [Brand name](URL). Example for "silver earrings": "Head to [GIVA's silver earrings](https://www.giva.co/search?q=silver+earrings) for **20% off** fine silver jewellery."
- The link text should describe what the user lands on (e.g. "GIVA's silver earrings", "Foxtale Vitamin C serums"), not just the brand name.
- NO bullet points, NO headers, NO line breaks. Flowing prose.
- Write like a savvy friend texting fast — confident, direct, useful. Not a customer service bot.
- End with a soft urgency cue if a voucher expires soon.
- DO NOT invent URLs for brands not in the portfolio. Only construct URLs by appending search paths to the homepage URLs given above.
- DO NOT suggest brands outside the portfolio. If the user asks about something not covered (e.g. electronics, books), be honest about the gap.`;

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
          <div className="hidden md:flex items-center gap-6 text-sm">
            {['dashboard', 'discover', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="capitalize transition relative pb-1"
                style={{
                  color: activeTab === tab ? '#0F2547' : '#6B6862',
                  fontWeight: activeTab === tab ? 600 : 400,
                  borderBottom: activeTab === tab ? '2px solid #0F2547' : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ background: '#3B5C8A' }}>J</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        {activeTab === 'dashboard' && (
        <section className="fade-in mb-10" style={{ animationDelay: '0.05s' }}>
          <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B6862' }}>Your portfolio · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</div>
          <h1 className="serif text-3xl md:text-4xl leading-tight mb-3">
            <em className="serif-italic" style={{ color: '#3B5C8A' }}>₹{stats.totalValue.toLocaleString('en-IN')}+</em> in vouchers. Don't lose another rupee.
          </h1>
          <p className="text-base" style={{ color: '#6B6862' }}>
            <strong style={{ color: '#92400E' }}>₹{stats.missedValue.toLocaleString('en-IN')} already lost</strong> to expiry last month — vouchers you earned, never used. <strong style={{ color: '#B45309' }}>{stats.expiringSoon} more expire this week.</strong>
          </p>
        </section>
        )}

        {/* Activity feed strip — only on Dashboard */}
        {activeTab === 'dashboard' && (
        <section className="fade-in mb-10" style={{ animationDelay: '0.08s' }}>
          <div className="text-xs tracking-widest uppercase mb-3 flex items-center gap-2" style={{ color: '#6B6862' }}>
            <TrendingUp size={11} /> Recent activity
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {RECENT_ACTIVITY.map((a, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-4 py-3 rounded-xl border flex items-center gap-2 whitespace-nowrap"
                style={{ background: 'white', borderColor: '#E0E0E0', minWidth: 'fit-content' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.tone }} />
                <span className="text-xs" style={{ color: '#1A1815' }}>
                  {a.label}{' '}
                  <strong style={{ color: a.tone }}>{a.highlight}</strong>
                  {a.tail && <span style={{ color: '#6B6862' }}> {a.tail}</span>}
                </span>
                <span className="text-[10px] uppercase tracking-wider pl-1" style={{ color: '#6B6862' }}>{a.when}</span>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* AI Advisor */}
        {activeTab === 'dashboard' && (
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
                      // Order matters: match markdown links FIRST (otherwise bold/italic inside link text gets eaten).
                      const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*[^*]+?\*\*)|(\*[^*\n]+?\*)|(https?:\/\/[^\s)]+)/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      let key = 0;
                      while ((match = pattern.exec(advisorResponse)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(<span key={key++}>{advisorResponse.slice(lastIndex, match.index)}</span>);
                        }
                        if (match[1]) {
                          // Markdown link [text](url)
                          const linkText = match[2];
                          const linkUrl = match[3];
                          parts.push(
                            <a key={key++} href={linkUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:opacity-80" style={{ color: '#FAFAFA' }}>
                              {linkText}
                            </a>
                          );
                        } else if (match[4]) {
                          parts.push(<strong key={key++} className="font-semibold" style={{ color: '#FAFAFA' }}>{match[4].slice(2, -2)}</strong>);
                        } else if (match[5]) {
                          parts.push(<em key={key++} style={{ opacity: 0.85 }}>{match[5].slice(1, -1)}</em>);
                        } else if (match[6]) {
                          const url = match[6];
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
        )}

        {/* Stats strip */}
        {activeTab === 'dashboard' && (
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
        )}

        {/* Connected Sources mini-card + Extension banner */}
        {activeTab === 'dashboard' && (
        <section className="fade-in mb-10 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ animationDelay: '0.22s' }}>
          {/* Connected Sources mini */}
          <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#E0E0E0' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plug size={14} style={{ color: '#3B5C8A' }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: '#6B6862' }}>Connected sources</span>
              </div>
              <button onClick={() => setActiveTab('settings')} className="text-xs font-medium" style={{ color: '#3B5C8A' }}>Manage →</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              {CONNECTED_SOURCES.filter(s => s.status === 'active').map(s => (
                <div key={s.name} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: '#ECFCCB', color: '#3F6212' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#15803D' }} />
                  {s.name} <span style={{ color: '#65A30D' }}>· {s.count}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] mt-2" style={{ color: '#6B6862' }}>
              +{CONNECTED_SOURCES.filter(s => s.status === 'coming').length} more sources coming — CRED, PhonePe, Marriott Bonvoy, Air India, credit cards.
            </div>
          </div>

          {/* Chrome Extension banner */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0F2547', color: '#FAFAFA' }}>
            <div className="flex items-center gap-2 mb-2">
              <Chrome size={14} />
              <span className="text-xs uppercase tracking-widest" style={{ opacity: 0.8 }}>Klaim for Chrome</span>
            </div>
            <div className="serif text-lg mb-2 leading-snug">Surface your vouchers at checkout, automatically.</div>
            <div className="text-xs mb-3" style={{ opacity: 0.85 }}>
              Shopping on Nykaa, Myntra, Tira, BigBasket, MakeMyTrip and 15 more sites? Klaim slides in with the right voucher — and pivots you to a better-stocked retailer if yours expired.
            </div>
            <button onClick={() => setActiveTab('settings')} className="text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ background: '#FAFAFA', color: '#0F2547' }}>
              How to install <ArrowUpRight size={11} />
            </button>
          </div>
        </section>
        )}

        {/* Filters + actions */}
        {activeTab === 'dashboard' && (
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
        )}

        {/* Voucher grid — sticker book treatment */}
        {activeTab === 'dashboard' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 py-2">
          {filtered.map((v, i) => {
            const u = urgencyTone(v.daysLeft, v.daysExplicit);
            const tiltClass = `tilt-${(i % 6) + 1}`;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVoucher(v)}
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
        )}

        {activeTab === 'dashboard' && filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#6B6862' }}>
            <p>No vouchers match. Try a different category.</p>
          </div>
        )}

        {/* Recently expired — the missed value pitch */}
        {activeTab === 'dashboard' && (
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
        )}

        {/* ============= DISCOVER TAB ============= */}
        {activeTab === 'discover' && (
        <div className="fade-in">
          <section className="mb-10">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B6862' }}>Discover · This week</div>
            <h1 className="serif text-3xl md:text-4xl leading-tight mb-3">
              New this week <em className="serif-italic" style={{ color: '#3B5C8A' }}>across your sources.</em>
            </h1>
            <p className="text-base" style={{ color: '#6B6862' }}>
              {vouchers.filter(v => v.isNew).length} fresh vouchers detected — auto-pulled from GPay, Gmail, and Swiggy.
            </p>
          </section>

          <section className="mb-12">
            <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#3B5C8A' }}>Just added</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {vouchers.filter(v => v.isNew).slice(0, 9).map((v, i) => {
                const u = urgencyTone(v.daysLeft, v.daysExplicit);
                const tiltClass = `tilt-${(i % 6) + 1}`;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoucher(v)}
                    className={`voucher-card border p-5 group cursor-pointer relative overflow-hidden rounded-2xl ${tiltClass}`}
                    style={{ background: 'white', borderColor: '#1A1815', borderWidth: '0.5px' }}
                  >
                    <div className="absolute top-0 left-0 right-0" style={{ height: '4px', background: v.tone }} />
                    <div className="flex items-start justify-between mb-4 mt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-white font-semibold text-sm" style={{ background: v.tone, borderRadius: '4px' }}>
                          {v.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-sm leading-tight flex items-center gap-1.5 uppercase tracking-wider" style={{ fontSize: '11px', color: '#1A1815' }}>
                            {v.brand}
                            <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-wider" style={{ background: '#3B5C8A', color: '#0F2547', borderRadius: '2px' }}>NEW</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B6862' }}>via {v.source}</div>
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 font-medium whitespace-nowrap uppercase tracking-wider" style={{ background: u.bg, color: u.fg, fontSize: '10px', borderRadius: '2px' }}>{u.label}</div>
                    </div>
                    <div className="serif text-2xl mb-1 leading-snug">{v.label}</div>
                    <div className="text-xs mb-3" style={{ color: '#6B6862', fontStyle: 'italic' }}>{v.category}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#B45309' }}>Expiring soonest</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {[...vouchers].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6).map((v, i) => {
                const u = urgencyTone(v.daysLeft, v.daysExplicit);
                const tiltClass = `tilt-${(i % 6) + 1}`;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoucher(v)}
                    className={`voucher-card border p-5 cursor-pointer relative overflow-hidden rounded-2xl ${tiltClass}`}
                    style={{ background: 'white', borderColor: '#1A1815', borderWidth: '0.5px' }}
                  >
                    <div className="absolute top-0 left-0 right-0" style={{ height: '4px', background: v.tone }} />
                    <div className="flex items-start justify-between mb-4 mt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-white font-semibold text-sm" style={{ background: v.tone, borderRadius: '4px' }}>
                          {v.brand.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-sm leading-tight uppercase tracking-wider" style={{ fontSize: '11px', color: '#1A1815' }}>{v.brand}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B6862' }}>via {v.source}</div>
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 font-medium whitespace-nowrap uppercase tracking-wider" style={{ background: u.bg, color: u.fg, fontSize: '10px', borderRadius: '2px' }}>{u.label}</div>
                    </div>
                    <div className="serif text-2xl mb-1 leading-snug">{v.label}</div>
                    <div className="text-xs" style={{ color: '#6B6862', fontStyle: 'italic' }}>{v.category}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        )}

        {/* ============= SETTINGS TAB ============= */}
        {activeTab === 'settings' && (
        <div className="fade-in">
          <section className="mb-10">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B6862' }}>Settings · Account</div>
            <h1 className="serif text-3xl md:text-4xl leading-tight mb-3">
              Your <em className="serif-italic" style={{ color: '#3B5C8A' }}>Klaim</em> setup.
            </h1>
            <p className="text-base" style={{ color: '#6B6862' }}>
              Manage your connected sources and install the browser extension.
            </p>
          </section>

          {/* Account row */}
          <section className="mb-10 rounded-2xl border p-5" style={{ background: 'white', borderColor: '#E0E0E0' }}>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6B6862' }}>Signed in as</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ background: '#3B5C8A' }}>J</div>
              <div>
                <div className="font-medium text-sm">Jyotika Punjabi</div>
                <div className="text-xs" style={{ color: '#6B6862' }}>JyotikaPunjabi1402@gmail.com</div>
              </div>
            </div>
          </section>

          {/* Connected sources full panel */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Plug size={14} style={{ color: '#3B5C8A' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: '#3B5C8A' }}>Connected sources</span>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E0E0E0', background: 'white' }}>
              {CONNECTED_SOURCES.map((s, i) => (
                <div key={s.name} className="p-4 flex items-center justify-between" style={{ borderTop: i === 0 ? 'none' : '0.5px solid #E0E0E0' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ background: s.status === 'active' ? '#15803D' : '#C8BFA8' }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {s.name}
                        {s.status === 'active' && <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded" style={{ background: '#ECFCCB', color: '#3F6212' }}>ACTIVE</span>}
                        {s.status === 'coming' && <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded" style={{ background: '#EFEFEF', color: '#6B6862' }}>SOON</span>}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#6B6862' }}>{s.note}{s.count ? ` · ${s.count} vouchers` : ''}</div>
                    </div>
                  </div>
                  {s.status === 'active' ? (
                    <button className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: '#FAFAFA', color: '#1A1815', border: '1px solid #E0E0E0' }}>Manage</button>
                  ) : (
                    <button disabled className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: '#FAFAFA', color: '#6B6862', border: '1px solid #E0E0E0', opacity: 0.6 }}>Coming soon</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Chrome Extension install guide */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Chrome size={14} style={{ color: '#3B5C8A' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: '#3B5C8A' }}>Klaim for Chrome</span>
            </div>
            <div className="rounded-2xl p-6 md:p-7" style={{ background: '#0F2547', color: '#FAFAFA' }}>
              <h2 className="serif text-2xl mb-3 leading-snug">The voucher that knows where you're shopping.</h2>
              <p className="text-sm mb-5" style={{ opacity: 0.9, lineHeight: 1.6 }}>
                Klaim's Chrome extension runs quietly on <strong>20 Indian retailers</strong> — Nykaa, Myntra, Amazon.in, BigBasket, MakeMyTrip, BookMyShow, Tira, AJIO, Croma, Reliance Digital, Cleartrip, Zepto, Blinkit, TataCliq, Foxtale, Be Minimalist, Hyphen, Mamaearth, Lenskart, and MakeO. When you land on a retailer page, a small panel slides in showing the relevant voucher from your portfolio. <strong>If your Nykaa voucher has expired</strong>, it pivots you to <strong>Tira</strong> where you have an active 30% off — solving the "I forgot I had this" problem in the moment it matters.
              </p>
              <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-xs uppercase tracking-widest mb-3" style={{ opacity: 0.7 }}>How to install (~60 seconds)</div>
                <ol className="text-sm space-y-2 list-decimal list-inside" style={{ lineHeight: 1.7 }}>
                  <li>Download the extension: <a href="https://klaim-delta.vercel.app/klaim-extension.zip" className="underline font-medium" style={{ color: '#FAFAFA' }}>klaim-extension.zip</a></li>
                  <li>Unzip the file (double-click on Mac, right-click → Extract on Windows)</li>
                  <li>Open Chrome → paste <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.12)' }}>chrome://extensions/</code> in the address bar</li>
                  <li>Top-right: toggle <strong>Developer mode</strong> ON</li>
                  <li>Click <strong>Load unpacked</strong> → select the unzipped <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.12)' }}>klaim-extension</code> folder</li>
                  <li>Visit <a href="https://nykaa.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FAFAFA' }}>nykaa.com</a> — the Klaim panel slides in within a second</li>
                </ol>
              </div>
              <div className="text-xs" style={{ opacity: 0.7 }}>
                One-click install via the Chrome Web Store is on the way. Safari and Firefox support too.
              </div>
            </div>
          </section>

        </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2" style={{ borderTop: '1px solid #E0E0E0', color: '#6B6862' }}>
          <div>Klaim · Your rewards, in one place. Built in Mumbai.</div>
          <div className="flex items-center gap-1">
            <Sparkles size={10} /> Real portfolio, real recommendations
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleScreenshotUpload(file);
                    e.target.value = '';
                  }}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      handleScreenshotUpload(file);
                    } else if (file) {
                      setOcrError('That file isn\'t an image. Try a PNG or JPG.');
                    }
                  }}
                  className="rounded-xl border-2 border-dashed p-10 text-center mb-4 cursor-pointer transition select-none"
                  style={{
                    borderColor: dragActive ? '#3B5C8A' : '#C8C8C8',
                    background: dragActive ? 'rgba(59,92,138,0.05)' : 'transparent',
                  }}
                >
                  <Upload size={28} className="mx-auto mb-3" style={{ color: dragActive ? '#3B5C8A' : '#6B6862' }} />
                  <div className="text-sm mb-1 font-medium">Drop a screenshot from GPay, Swiggy, CRED, PhonePe</div>
                  <div className="text-xs" style={{ color: '#6B6862' }}>Click to choose · or drag &amp; drop</div>
                </div>
                <div className="text-xs space-y-2" style={{ color: '#6B6862' }}>
                  <div className="flex items-center gap-2"><Check size={12} style={{ color: '#15803D' }} /> Brand, value, code — auto-detected via AI Vision</div>
                  <div className="flex items-center gap-2"><Check size={12} style={{ color: '#15803D' }} /> Review every voucher before adding — you stay in control</div>
                </div>
              </>
            )}

            {ocrLoading && (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: '#E0E0E0', background: 'white' }}>
                <Loader2 size={28} className="animate-spin mx-auto mb-4" style={{ color: '#3B5C8A' }} />
                <div className="serif text-xl mb-2">Reading {ocrFileName || 'your screenshot'}…</div>
                <div className="text-xs" style={{ color: '#6B6862' }}>AI Vision is identifying every voucher in the image. Usually takes 10-20 seconds.</div>
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

      {/* Voucher detail modal */}
      {selectedVoucher && (() => {
        const v = selectedVoucher;
        const u = urgencyTone(v.daysLeft, v.daysExplicit);
        const url = getRetailerUrl(v.brand);
        return (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(26,24,21,0.5)' }} onClick={() => { setSelectedVoucher(null); setReminderOn(false); }}>
            <div className="rounded-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: '#FAFAFA' }} onClick={(e) => e.stopPropagation()}>
              {/* Top brand strip */}
              <div className="relative px-6 pt-6 pb-5" style={{ background: v.tone, color: '#FAFAFA' }}>
                <button onClick={() => { setSelectedVoucher(null); setReminderOn(false); }} className="absolute top-4 right-4 opacity-80 hover:opacity-100"><X size={18} /></button>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ opacity: 0.85 }}>via {v.source}</div>
                <div className="serif text-2xl mb-1 leading-tight">{v.brand}</div>
                <div className="text-xs" style={{ opacity: 0.85 }}>{v.category} · {v.specialty}</div>
              </div>

              {/* Offer body */}
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6B6862' }}>The offer</div>
                <div className="serif text-3xl mb-4 leading-tight" style={{ color: '#1A1815' }}>{v.label}</div>
                {v.caveat && (
                  <div className="text-xs flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg" style={{ color: '#92400E', background: '#FEF3C7' }}>
                    <AlertTriangle size={12} /> <span className="italic">{v.caveat}</span>
                  </div>
                )}

                {/* Expiry countdown */}
                <div className="rounded-xl p-3 mb-4 flex items-center justify-between" style={{ background: u.bg }}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: u.fg }} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: u.fg }}>Expires</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: u.fg }}>{u.label}{!v.daysExplicit ? ' (estimated)' : ''}</span>
                </div>

                {/* Code (copyable) */}
                {v.code && (
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6B6862' }}>Voucher code</div>
                    <button
                      onClick={() => copyCode(v.code)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-mono text-sm font-semibold transition"
                      style={{ background: '#EFEFEF', color: '#3B5C8A', border: '1px dashed #C8BFA8' }}
                    >
                      <span>{v.code}</span>
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: copiedCode ? '#15803D' : '#6B6862' }}>
                        {copiedCode ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Tap to copy</>}
                      </span>
                    </button>
                  </div>
                )}

                {/* Best uses */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6B6862' }}>Best uses</div>
                  <div className="text-sm leading-relaxed" style={{ color: '#1A1815' }}>
                    {v.specialty} — apply during checkout on {v.brand}{v.code ? `, paste code ${v.code}` : ''}.
                  </div>
                </div>

                {/* Reminder toggle */}
                <button
                  onClick={() => setReminderOn(!reminderOn)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-5 transition"
                  style={{ background: 'white', border: '1px solid #E0E0E0' }}
                >
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: reminderOn ? '#3B5C8A' : '#6B6862' }} />
                    <span className="text-sm" style={{ color: '#1A1815' }}>Remind me 24 hours before expiry</span>
                  </div>
                  <span className="w-9 h-5 rounded-full relative transition" style={{ background: reminderOn ? '#3B5C8A' : '#E0E0E0' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition" style={{ left: reminderOn ? '18px' : '2px' }} />
                  </span>
                </button>

                {/* Primary CTA: go to retailer */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ background: '#0F2547', color: '#FAFAFA' }}
                >
                  <ShoppingBag size={14} /> Shop on {v.brand} <ExternalLink size={12} />
                </a>
                <div className="text-[10px] text-center mt-2" style={{ color: '#6B6862' }}>Opens in a new tab. Apply your code at checkout.</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
