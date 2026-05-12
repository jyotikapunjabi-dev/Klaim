// Vercel serverless function: /api/advisor
// If OPENAI_API_KEY is set: proxies to OpenAI gpt-4o.
// If not set: returns smart canned responses (demo-safe, zero cost).

export const maxDuration = 60;

const MOCK_RESPONSES = [
  {
    match: /goa|trip|travel|vacation|holiday|flight|hotel|villa|stay/i,
    response:
      "For Goa, stack three: book the flight on **Cleartrip** with **25% off** (~₹1,200 saved on a ₹5K fare), grab a stay through **StayVista** with code **STAYVISTA** for **5% off villas** (premium, 80+ destinations), or hit **IndiGo Hotels** with **6EMEGA** for **40% off**. *Cleartrip voucher expires in 12 days* — book first.",
  },
  {
    match: /gift|birthday|present|anniversary/i,
    response:
      "Two strong moves. **GIVA** has **15% off silver jewelry** — clean go-to for an anniversary. For something edible-luxe, **Toothsi**/Tata MakeO won't fit, but **Tira** at **30% off above ₹1,999** (code unlocks at checkout) works for a premium beauty gift. *Tira expires in 9 days* — use it sooner.",
  },
  {
    match: /skincare|skin|face|serum|cream|beauty|makeup|cosmetic/i,
    response:
      "**The Derma Co** is your move — **100% cashback + 5% prepaid** (NEW, Honasa group). For makeup specifically, **SUGAR Cosmetics** with code **SUGAR250** gives **₹250 off**. If you're going premium, **Tira** at **30% off above ₹1,999** beats Nykaa right now. *Derma Co cashback caps at ₹500.*",
  },
  {
    match: /food|grocery|groceries|eat|order|restaurant|dinner|lunch/i,
    response:
      "Quick math: **Zepto** has **₹5–100 cashback** (lowest friction), **BigBasket** does **15% off above ₹999** (*new users only* — caveat). For a restaurant order, **McDelivery** has **₹150 off above ₹399** and **Domino's** has **₹100 off above ₹400**. Pick by craving — savings are basically equivalent.",
  },
  {
    match: /electronics|phone|laptop|camera|gadget|tech/i,
    response:
      "Honestly? Nothing in your portfolio matches electronics specifically. The closest leverage is **Lenskart** at **₹500 off above ₹1,499** if you mean eyewear. For phones/laptops, you'd want a Croma or Reliance Digital voucher — *worth grabbing one before the next big sale*.",
  },
  {
    match: /clothes|fashion|kurta|dress|jeans|shirt|outfit|wear/i,
    response:
      "**Meesho** at **25% off above ₹999** is the best ratio — broad catalog, no caveats. **Nykaa Fashion** also has **25% off** for branded picks. If you want premium, **Hyphen** has two stacked offers (**25% off** and **30% off above ₹699**). *Meesho voucher expires in 6 days.*",
  },
  {
    match: /movie|event|show|concert|ticket/i,
    response:
      "**District** has **₹100 off events** — that's your move for concerts and shows. For movies specifically, BookMyShow isn't covered in your portfolio yet. *District voucher expires in 14 days* — plan that gig now.",
  },
];

const FALLBACK_RESPONSE =
  "You've got **31 active vouchers** worth **₹26,300+** sitting in the portfolio. Tell me what you're shopping for — flights, food, beauty, fashion, gifts — and I'll match the right voucher with the closest expiry. *Right now Puma at 33% off expires in 1 day — use it or lose it.*";

function pickMock(userQuery) {
  for (const m of MOCK_RESPONSES) {
    if (m.match.test(userQuery)) return m.response;
  }
  return FALLBACK_RESPONSE;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const { systemPrompt, userQuery } = req.body || {};

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing userQuery' });
  }

  // Demo mode: no API key → return smart mock
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1500));
    return res.status(200).json({ response: pickMock(userQuery), mocked: true });
  }

  if (!systemPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', response.status, errText);
      return res.status(response.status).json({ error: 'Upstream error', details: errText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ response: text, raw: data });
  } catch (error) {
    console.error('Advisor handler error:', error);
    return res.status(500).json({ error: 'Internal error', message: error.message });
  }
}
