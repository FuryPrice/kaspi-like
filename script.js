
    // demo data: добавь/измени товары здесь
    const products = [
      { id:1, title:'Смартфон X1', price:249990, tag:'Популярное'},
      { id:2, title:'Ноутбук Pro 15', price:499990, tag:'Скидка'},
      { id:3, title:'Наушники Zero', price:34990, tag:'Хит'},
      { id:4, title:'Умные часы S', price:89990, tag:'Новый'},
      { id:5, title:'Пауэрбанк 20000', price:15990, tag:'Эконом'},
      { id:6, title:'Кофеварка Home', price:129990, tag:'Дом'},
      { id:7, title:'Телевизор 55"', price:399990, tag:'Sale'},
      { id:8, title:'Кроссовки Run', price:79990, tag:'Популярное'}
    ];

    // state
    const cart = {}; // {productId: qty}

    // utilities
    function formatPrice(n){
      return '₸' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ');
    }

    // render products
    const grid = document.getElementById('productGrid');
    function renderProducts(list){
      grid.innerHTML = '';
      list.forEach(p=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="thumb">${p.title.split(' ')[0]}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="tag">${p.tag}</div>
            <div class="price">${formatPrice(p.price)}</div>
          </div>
          <div class="title">${p.title}</div>
          <div style="display:flex;gap:8px;margin-top:auto">
            <button class="btn addBtn" data-id="${p.id}">В корзину</button>
            <button class="ghost" onclick="alert('Быстрая покупка')">Купить сейчас</button>
          </div>
        `;
        grid.appendChild(card);
      });
      // attach listeners
      document.querySelectorAll('.addBtn').forEach(b=>{
        b.addEventListener('click', e=>{
          const id = Number(e.currentTarget.dataset.id);
          addToCart(id);
        });
      });
    }

    // search
    const searchInput = document.getElementById('search');
    const clearBtn = document.getElementById('clearSearch');
    function doSearch(){
      const q = searchInput.value.trim().toLowerCase();
      if(!q) renderProducts(products);
      else {
        const filtered = products.filter(p => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
        renderProducts(filtered);
      }
    }
    searchInput.addEventListener('input', doSearch);
    clearBtn.addEventListener('click', ()=>{ searchInput.value=''; doSearch(); });

    // cart logic
    const cartCountEl = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const cartList = document.getElementById('cartList');
    const totalEl = document.getElementById('total');
    const fabAmount = document.getElementById('fabAmount');

    function updateCartBadge(){
      const count = Object.values(cart).reduce((s,v)=>s+v,0);
      if(count>0){
        cartCountEl.style.display='inline-block';
        cartCountEl.textContent = count;
      } else cartCountEl.style.display='none';
    }
    function updateTotals(){
      const sum = Object.entries(cart).reduce((s,[id,qty])=>{
        const p = products.find(x=>x.id==id);
        return s + (p ? p.price * qty : 0);
      },0);
      totalEl.textContent = formatPrice(sum);
      fabAmount.textContent = formatPrice(sum);
    }
    function addToCart(id){
      cart[id] = (cart[id]||0)+1;
      updateCartBadge();
      updateCartList();
      updateTotals();
    }
    function removeFromCart(id){
      delete cart[id];
      updateCartBadge();
      updateCartList();
      updateTotals();
    }
    function changeQty(id, delta){
      cart[id] = (cart[id]||0) + delta;
      if(cart[id] <= 0) delete cart[id];
      updateCartBadge();
      updateCartList();
      updateTotals();
    }
    function updateCartList(){
      cartList.innerHTML = '';
      if(Object.keys(cart).length === 0){
        cartList.innerHTML = '<div style="color:var(--muted);padding:8px">Корзина пуста</div>';
        return;
      }
      for(const [id,qty] of Object.entries(cart)){
        const p = products.find(x=>x.id==id);
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
          <div>
            <div style="font-weight:600">${p.title}</div>
            <div style="font-size:13px;color:var(--muted)">${formatPrice(p.price)} × ${qty}</div>
          </div>
          <div class="qty">
            <button class="ghost" data-action="dec" data-id="${id}">−</button>
            <div style="min-width:22px;text-align:center">${qty}</div>
            <button class="ghost" data-action="inc" data-id="${id}">+</button>
            <button class="ghost" data-action="del" data-id="${id}">Удалить</button>
          </div>
        `;
        cartList.appendChild(row);
      }
      // attach qty handlers
      cartList.querySelectorAll('button[data-action]').forEach(b=>{
        b.addEventListener('click', e=>{
          const id = e.currentTarget.dataset.id;
          const action = e.currentTarget.dataset.action;
          if(action === 'dec') changeQty(id, -1);
          if(action === 'inc') changeQty(id, +1);
          if(action === 'del') removeFromCart(id);
        });
      });
    }

    // UI events
    document.getElementById('cartBtn').addEventListener('click', ()=> {
      cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    });
    document.getElementById('closeCart').addEventListener('click', ()=> { cartModal.style.display='none'; });
    document.getElementById('checkoutBtn').addEventListener('click', ()=> {
      const sum = Object.entries(cart).reduce((s,[id,qty])=>{
        const p = products.find(x=>x.id==id);
        return s + (p ? p.price * qty : 0);
      },0);
      if(sum===0){ alert('Корзина пуста'); return; }
      alert('Переход к оплате: ' + formatPrice(sum));
    });

    // floating pay button
    document.getElementById('fabPay').addEventListener('click', ()=>{
      document.getElementById('cartBtn').click(); // показываем корзину
    });

    // init
    renderProducts(products);
    updateCartBadge();
    updateTotals();

    // close cart on outside click (small UX)
    document.addEventListener('click', (e)=>{
      const modal = cartModal;
      const cartBtn = document.getElementById('cartBtn');
      if(!modal.contains(e.target) && !cartBtn.contains(e.target) && e.target !== cartBtn){
        // don't auto-close if empty click on buttons
        modal.style.display = 'none';
      }
    });
