let products = [];
let cart = [];
let selectedFilters = { category: [], gender: [], size: [] };

// 1. DATA INITIALIZATION
fetch('data/data-pretty.json')
    .then(res => res.json())
    .then(data => {
        products = data;
        init();
    });

function init() {
    renderFilterButtons();
    updateCartCount();
}

// 2. VIEW MANAGEMENT
function showView(viewId) {
    const views = ['home', 'browse', 'singleproduct', 'cart'];
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// 3. FILTER GENERATION
function renderFilterButtons() {
    const cats = [...new Set(products.map(p => p.category))];
    const gens = [...new Set(products.map(p => p.gender))];
    const sizes = [...new Set(products.map(p => p.sizes).flat())];
    
    const setupSection = (list, containerId, type) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        list.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item;
            btn.className = "px-3 py-1 bg-zinc-100 text-[10px] font-black uppercase border border-zinc-300 street-btn hover:border-black transition";
            btn.onclick = () => toggleFilter(type, item, btn);
            container.appendChild(btn);
        });
    };

    setupSection(cats, 'category-filters', 'category');
    setupSection(gens, 'gender-filters', 'gender');
    setupSection(sizes, 'size-filters', 'size');
}

function toggleFilter(type, value, btn) {
    const index = selectedFilters[type].indexOf(value);
    if (index > -1) {
        selectedFilters[type].splice(index, 1);
        btn.classList.remove('bg-black', 'text-white');
        btn.classList.add('bg-zinc-100');
    } else {
        selectedFilters[type].push(value);
        btn.classList.add('bg-black', 'text-white');
        btn.classList.remove('bg-zinc-100');
    }
    applyFiltersAndSort();
}

function clearAllFilters() {
    selectedFilters = { category: [], gender: [], size: [] };
    const filterButtons = document.querySelectorAll('#category-filters button, #gender-filters button, #size-filters button');
    filterButtons.forEach(btn => {
        btn.classList.remove('bg-black', 'text-white', 'scale-105');
        btn.classList.add('bg-zinc-100', 'text-black');
    });
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let filtered = products.filter(p => {
        const matchCat = selectedFilters.category.length === 0 || selectedFilters.category.includes(p.category);
        const matchGen = selectedFilters.gender.length === 0 || selectedFilters.gender.includes(p.gender);
        const matchSize = selectedFilters.size.length === 0 || p.sizes.some(s => selectedFilters.size.includes(s));
        return matchCat && matchGen && matchSize;
    });

    const sort = document.getElementById('sortSelect').value;
    if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
    else filtered.sort((a,b) => a.name.localeCompare(b.name));

    displayProducts(filtered);
}

// 4. BROWSE
function displayProducts(list) {
    const container = document.getElementById('productList');
    const noMatch = document.getElementById('no-matches');
    container.innerHTML = '';
    
    if (list.length === 0) noMatch.classList.remove('hidden');
    else {
        noMatch.classList.add('hidden');
        list.forEach(p => {
            const div = document.createElement('div');
            div.className = "bg-white p-6 street-card border-4 border-black group hover:border-[#FF0000] transition-all duration-300";
            div.innerHTML = `
                <div class="h-64 bg-zinc-100 mb-6 flex items-center justify-center font-black text-6xl text-zinc-200">#IMG</div>
                <h3 class="font-black uppercase italic text-xl text-black border-b-4 border-black inline-block mb-2">${p.name}</h3>
                <p class="text-sm font-black text-[#FF0000] mb-6 tracking-widest uppercase">${p.category} / $${p.price.toFixed(2)}</p>
                <div class="flex gap-4">
                    <button onclick="viewProduct('${p.id}')" class="flex-1 bg-black text-white py-3 font-black uppercase street-btn hover:bg-[#FF0000] transition"><span>Details</span></button>
                    <button onclick="addToCart('${p.id}')" class="bg-[#FF0000] text-white px-6 font-black street-btn hover:bg-black transition"><span>+</span></button>
                </div>`;
            container.appendChild(div);
        });
    }
}

// 5. SINGLE PRODUCT VIEW
function viewProduct(id) {
    const p = products.find(prod => prod.id === id);
    const container = document.getElementById('singleproduct');
    
    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-16 bg-zinc-900 p-16 street-card border-l-[16px] border-[#FF0000]">
            <div class="flex-1 flex flex-col gap-4">
                <div class="bg-black h-[500px] flex items-center justify-center text-zinc-800 font-black text-8xl italic border-4 border-[#FF0000]"># IMG 1</div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-black h-[150px] flex items-center justify-center text-zinc-800 font-black text-2xl italic border-2 border-zinc-700"># IMG 2</div>
                    <div class="bg-black h-[150px] flex items-center justify-center text-zinc-800 font-black text-2xl italic border-2 border-zinc-700"># IMG 3</div>
                    <div class="bg-black h-[150px] flex items-center justify-center text-zinc-800 font-black text-2xl italic border-2 border-zinc-700"># IMG 4</div>
                </div>
            </div>
            
            <div class="flex-1 space-y-8">
                <nav class="text-xs uppercase font-black text-[#FF0000] tracking-widest underline underline-offset-8">Home / ${p.gender} / ${p.category} / ${p.name}</nav>
                <h2 class="text-7xl font-black uppercase italic leading-none tracking-tighter">${p.name}</h2>
                <p class="text-5xl text-white font-black italic">$${p.price.toFixed(2)}</p>
                
                <div>
                    <p class="text-zinc-400 text-base leading-relaxed uppercase font-bold">${p.description}</p>
                    <p class="text-xs font-black text-[#FF0000] uppercase mt-2">Material: ${p.material}</p>
                </div>

                <div class="space-y-3">
                    <span class="text-[10px] font-black uppercase text-zinc-500 italic">Select Size</span>
                    <div id="size-options" class="flex gap-2">
                        ${p.sizes.map(size => `
                            <button onclick="selectOption(this, 'size')" class="option-btn px-4 py-2 border border-zinc-700 text-xs font-black hover:border-[#FF0000] transition text-white">
                                ${size}
                            </button>`).join('')}
                    </div>
                </div>

                <div class="space-y-3">
                    <span class="text-[10px] font-black uppercase text-zinc-500 italic">Select Color</span>
                    <div id="color-options" class="flex gap-4">
                        ${p.color.map(c => `
                            <button onclick="selectOption(this, 'color')" data-color="${c.name}" class="option-btn flex items-center gap-2 px-3 py-2 border border-zinc-700 hover:border-[#FF0000] transition text-white">
                                <div class="w-4 h-4" style="background-color: ${c.hex}"></div>
                                <span class="text-[10px] font-black uppercase">${c.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="flex flex-col gap-6 pt-6">
                   <div class="flex items-center gap-6">
                       <span class="text-xs font-black uppercase">Quantity:</span>
                       <input type="number" id="qtyInput" value="1" min="1" class="w-24 bg-black border-2 border-[#FF0000] p-3 text-center font-black text-white outline-none">
                   </div>
                   <button onclick="addToCart('${p.id}', true)" class="w-full bg-[#FF0000] text-white py-6 font-black uppercase street-btn text-2xl hover:bg-white hover:text-black transition">
                        <span>Add to Cart</span>
                   </button>
                </div>
            </div>
        </div>`;
    showView('singleproduct');
}

function selectOption(btn) {
    // Remove active class from all buttons in the same group
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('filter-active'));
    // Add active class to clicked button
    btn.classList.add('filter-active');
}

// 6. CART & LOGISTICS
function addToCart(id, useQty = false) {
    const qtyInput = document.getElementById('qtyInput');
    const qty = useQty && qtyInput ? parseInt(qtyInput.value) : 1;

    // Get selected Size and Color text
    const selectedSizeBtn = document.querySelector('#size-options .filter-active');
    const selectedColorBtn = document.querySelector('#color-options .filter-active');

    const size = selectedSizeBtn ? selectedSizeBtn.innerText.trim() : 'N/A';
    const color = selectedColorBtn ? selectedColorBtn.querySelector('span').innerText.trim() : 'N/A';

    // If using Qty (Single Product View), you might want to ensure they picked a size/color
    if (useQty && (size === 'N/A' || color === 'N/A')) {
        alert("Please select a Size and Color first.");
        return;
    }

    // Check if the exact same item (same ID, Size, and Color) is in the cart
    const item = cart.find(i => i.id === id && i.size === size && i.color === color);
    
    if (item) {
        item.qty += qty;
    } else {
        cart.push({ id, qty, size, color });
    }

    updateCartCount();
    showNotification();
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function openCart() {
    const itemsContainer = document.getElementById('cartItems');
    const summaryContainer = document.getElementById('cartSummary');
    itemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p class="italic text-zinc-800 font-black uppercase text-5xl py-20 leading-none">Your Cart<br>Is Empty.</p>`;
        summaryContainer.innerHTML = '';
        showView('cart');
        return;
    }

    let subtotal = 0;

    // Added 'index' here so the Remove button knows which specific item to delete
    cart.forEach((item, index) => {
        const p = products.find(prod => prod.id === item.id);
        
        // Fix: Declare itemTotal so it can be used in the template literal below
        const itemTotal = p.price * item.qty;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-zinc-900 p-6 street-card border-l-4 border-[#FF0000]";
        div.innerHTML = `
            <div class="space-y-1">
                <h4 class="font-black uppercase text-2xl italic tracking-tighter text-white">${p.name}</h4>
                <div class="flex gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Size: <span class="text-white">${item.size}</span></span>
                    <span>Color: <span class="text-white">${item.color}</span></span>
                </div>
                <p class="text-xs text-[#FF0000] font-black uppercase tracking-widest mt-2">
                    ${item.qty} UNITS @ $${p.price.toFixed(2)}
                </p>
            </div>
            <div class="flex items-center gap-10">
                <div class="text-right">
                    <span class="block text-[10px] font-black uppercase text-zinc-500 italic">Subtotal</span>
                    <span class="font-black text-2xl italic text-white">$${itemTotal.toFixed(2)}</span>
                </div>
                <button onclick="removeFromCart(${index})" class="text-[#FF0000] font-black text-xs uppercase hover:bg-white hover:text-black px-2 py-1 transition">
                    Remove
                </button>
            </div>`;
        itemsContainer.appendChild(div);
    });

    // Handle Logistics calculations
    const dest = document.getElementById('destination').value;
    const type = document.getElementById('shippingType').value;
    const tax = (dest === 'CA') ? subtotal * 0.05 : 0;
    
    let ship = (subtotal > 500) ? 0 : { 
        standard: {CA:10, US:15, INT:20}, 
        express: {CA:25, US:25, INT:30}, 
        priority: {CA:35, US:50, INT:50} 
    }[type][dest];

    // Render Summary
    summaryContainer.innerHTML = `
        <h3 class="font-black uppercase text-2xl mb-6 italic underline underline-offset-8 decoration-[#FF0000]">Your Order</h3>
        <div class="space-y-4 text-xs uppercase font-black">
            <div class="flex justify-between"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="flex justify-between text-zinc-400"><span>Tax (5% CA):</span><span>$${tax.toFixed(2)}</span></div>
            <div class="flex justify-between text-zinc-400"><span>Shipping:</span><span>$${ship.toFixed(2)}</span></div>
            <div class="flex justify-between text-3xl border-t-8 border-black pt-6 italic tracking-tighter"><span>Total:</span><span>$${(subtotal + tax + ship).toFixed(2)}</span></div>
        </div>
        <button onclick="checkout()" class="w-full bg-[#FF0000] text-white py-5 font-black uppercase street-btn mt-10 text-xl hover:bg-black transition"><span>CHECKOUT</span></button>`;
    
    showView('cart');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    openCart();
}

function checkout() {
    alert("TRANSACTION FINALIZED - ORDER DISPATCHED");
    cart = []; updateCartCount(); showView('home');
}

// 7. UI FUNCTIONS
function showNotification() {
    const t = document.getElementById('cartNotification');
    t.classList.remove('translate-x-full');
    setTimeout(() => t.classList.add('translate-x-full'), 2000);
}

function showAbout() { document.getElementById('about').showModal(); }
function closeAbout() { document.getElementById('about').close(); }
function openBrowse() { showView('browse'); applyFiltersAndSort(); }