// Vercel serverless function: /api/ocr
// If OPENAI_API_KEY is set: real GPT-4o Vision extraction.
// If not set: returns canned voucher data (demo-safe, zero cost).

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const MOCK_EXTRACTION = [
  {
    brand: 'Wow Skin Science',
    label: '30% off above ₹599',
    category: 'Beauty',
    code: 'WOW30',
    daysLeft: 11,
    expired: false,
    inrValue: null,
    specialty: 'Onion-shampoo and natural skincare D2C brand',
  },
  {
    brand: 'Boult Audio',
    label: 'Flat ₹400 off',
    category: 'Lifestyle',
    code: 'BOULT400',
    daysLeft: 7,
    expired: false,
    inrValue: 400,
    specialty: 'Affordable audio — earbuds, headphones, speakers',
  },
  {
    brand: 'FirstCry',
    label: '20% off above ₹1,499',
    category: 'Lifestyle',
    code: 'FCRY20',
    daysLeft: 18,
    expired: false,
    inrValue: null,
    specialty: 'Baby and kids products marketplace',
  },
  {
    brand: 'Pharmeasy',
    label: '₹300 off medicines above ₹999',
    category: 'Lifestyle',
    code: 'PHARM300',
    daysLeft: 4,
    expired: false,
    inrValue: 300,
    specialty: 'Online pharmacy and diagnostics',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const { imageBase64, mediaType } = req.body || {};

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  // Demo mode: no API key → return canned vouchers
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1800));
    return res.status(200).json({
      extractedText: JSON.stringify(MOCK_EXTRACTION),
      mocked: true,
    });
  }

  try {
    const prompt = `This is a screenshot from an Indian rewards/voucher app (likely GPay Rewards, PhonePe Offers, Swiggy Scratch & Win, CRED, Paytm, or similar). Extract every voucher visible.

For each voucher, return this JSON structure:
{
  "brand": "exact brand name",
  "label": "the offer text, e.g. 'Flat ₹200 off', '25% off above ₹999', '₹5–100 cashback'",
  "category": "one of: Beauty, Fashion, Food & Groceries, Travel, Lifestyle, Entertainment",
  "code": "voucher code if visible, otherwise null",
  "daysLeft": "number if expiry badge visible (e.g. '6d left' → 6, '1 day' → 1, '13d left' → 13), otherwise null",
  "expired": "true if voucher is greyed out / has 'Expired' badge, false otherwise",
  "inrValue": "rupee value if a flat ₹ amount, otherwise null (e.g. ₹200 off → 200; 25% off → null)",
  "specialty": "1-line description of what this brand sells, for an AI advisor to match shopping intent"
}

Return ONLY a JSON array, no preamble, no markdown. If no vouchers visible, return [].
Be thorough — capture every voucher card in the screenshot, including ones partially visible.`;

    const dataUrl = `data:${mediaType || 'image/png'};base64,${imageBase64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI Vision error:', response.status, errText);
      return res.status(response.status).json({ error: 'Upstream error', details: errText });
    }

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();

    return res.status(200).json({ extractedText: text });
  } catch (error) {
    console.error('OCR handler error:', error);
    return res.status(500).json({ error: 'Internal error', message: error.message });
  }
}
