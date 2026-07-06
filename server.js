const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_PATH = path.join(__dirname, 'data', 'products.json');
const LEADS_PATH = path.join(__dirname, 'data', 'leads.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- helpers ----
function loadProducts() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function loadLeads() {
  if (!fs.existsSync(LEADS_PATH)) return [];
  return JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'));
}

function saveLeads(leads) {
  fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));
}

// ---- API: categories ----
app.get('/api/categories', (req, res) => {
  const data = loadProducts();
  const categories = data.categories.map((c) => ({
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    seal: c.seal,
    placeholder: !!c.placeholder,
    count: c.products.length
  }));
  res.json(categories);
});

// ---- API: products (optionally filtered by ?category=) ----
app.get('/api/products', (req, res) => {
  const data = loadProducts();
  const { category } = req.query;

  if (category) {
    const cat = data.categories.find((c) => c.id === category);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    return res.json(cat.products.map((p) => ({ ...p, categoryId: cat.id })));
  }

  const all = data.categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, categoryId: c.id }))
  );
  res.json(all);
});

// ---- API: single product ----
app.get('/api/products/:id', (req, res) => {
  const data = loadProducts();
  for (const c of data.categories) {
    const found = c.products.find((p) => p.id === req.params.id);
    if (found) return res.json({ ...found, categoryId: c.id });
  }
  res.status(404).json({ error: 'Product not found' });
});

// ---- API: leads (contact form / "notify me" submissions) ----
app.post('/api/leads', (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'नाम और फ़ोन नंबर ज़रूरी है (Name and phone are required)' });
  }

  const leads = loadLeads();
  leads.push({
    name,
    phone,
    message: message || '',
    receivedAt: new Date().toISOString()
  });
  saveLeads(leads);

  res.json({ success: true, message: 'धन्यवाद! हम जल्द संपर्क करेंगे।' });
});

app.listen(PORT, () => {
  console.log(`Ek Dhaaga server running → http://localhost:${PORT}`);
});
