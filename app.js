const state = {
  activeCategory: 'achar',
  cart: JSON.parse(localStorage.getItem('ekDhaagaCart') || '[]')
};

const catTabsEl = document.getElementById('catTabs');
const gridEl = document.getElementById('productGrid');
const cartCountEl = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');

// ---------- CATEGORIES ----------
async function loadCategories() {
  const res = await fetch('/api/categories');
  const categories = await res.json();

  catTabsEl.innerHTML = categories
    .map(
      (c) => `
      <button class="cat-tab ${c.id === state.activeCategory ? 'active' : ''}" data-cat="${c.id}">
        ${c.name} <span style="opacity:.6;font-size:12px;">${c.nameEn}</span>
      </button>`
    )
    .join('');

  catTabsEl.querySelectorAll('.cat-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat;
      catTabsEl.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadProducts(state.activeCategory);
    });
  });
}

// ---------- PRODUCTS ----------
async function loadProducts(category) {
  const res = await fetch(`/api/products?category=${category}`);
  const products = await res.json();

  if (!products.length) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <h3>यहाँ जल्द ही कुछ आ रहा है</h3>
        <p>Something new is on its way to this shelf.</p>
      </div>`;
    return;
  }

  gridEl.innerHTML = products.map(productCard).join('');

  gridEl.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id, products));
  });
}

function productCard(p) {
  return `
    <article class="card">
      <div class="jar-wrap">
        <svg width="90" height="112" viewBox="0 0 96 120" fill="none">
          <rect x="18" y="6" width="60" height="14" rx="3" fill="${p.seal}"/>
          <path d="M22 20 h52 l6 84 a10 10 0 0 1 -10 10 H26 a10 10 0 0 1 -10 -10 Z" fill="${p.seal}cc" stroke="${p.seal}" stroke-width="2"/>
        </svg>
        <div class="seal" style="background:${p.seal};">${p.nameEn.split(' ')[0]}</div>
      </div>
      <h3>${p.name}</h3>
      <span class="hindi-name">${p.nameEn}</span>
      <p class="desc">${p.desc}</p>
      <div class="maker">
        <span>बनाया — <strong>${p.maker}</strong></span>
        <span>${p.village}</span>
      </div>
      <div class="row-bottom">
        <span class="price">₹${p.price} <span style="font-size:11px;color:var(--ink-soft);">/ ${p.unit}</span></span>
        <button class="add-btn" data-id="${p.id}">कार्ट में डालें</button>
      </div>
    </article>`;
}

// ---------- CART (client-side, localStorage) ----------
function addToCart(id, products) {
  const product = products.find((p) => p.id === id);
  const existing = state.cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  persistCart();
  renderCart();
  openCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem('ekDhaagaCart', JSON.stringify(state.cart));
}

function renderCart() {
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = count;

  if (!state.cart.length) {
    cartItemsEl.innerHTML = '<div class="cart-empty">कार्ट अभी खाली है</div>';
    cartTotalEl.textContent = '₹0';
    return;
  }

  cartItemsEl.innerHTML = state.cart
    .map(
      (item) => `
      <div class="cart-item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${item.price * item.qty} <button data-remove="${item.id}">हटाएँ</button></span>
      </div>`
    )
    .join('');

  cartItemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });

  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = `₹${total}`;
}

// ---------- CART DRAWER TOGGLE ----------
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ---------- LEAD FORM ----------
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const statusEl = document.getElementById('leadStatus');
  const payload = {
    name: form.name.value,
    phone: form.phone.value,
    message: form.message.value
  };

  statusEl.textContent = 'भेजा जा रहा है...';

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok) {
      statusEl.textContent = data.message;
      form.reset();
    } else {
      statusEl.textContent = data.error || 'कुछ गलत हो गया।';
    }
  } catch (err) {
    statusEl.textContent = 'सर्वर से जुड़ नहीं पा रहे। बाद में कोशिश करें।';
  }
});

// ---------- INIT ----------
loadCategories();
loadProducts(state.activeCategory);
renderCart();
