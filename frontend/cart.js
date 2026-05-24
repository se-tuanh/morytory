// ─── GIỎ HÀNG MORYTORY ───
let morytoryCart = [];

// Hàm format tiền VNĐ
function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + ' đ';
}

// Lấy dữ liệu giỏ hàng từ localStorage
function loadCartData() {
  const data = localStorage.getItem('morytory_cart');
  morytoryCart = data ? JSON.parse(data) : [];
}

// Lưu dữ liệu giỏ hàng vào localStorage
function saveCartData() {
  localStorage.setItem('morytory_cart', JSON.stringify(morytoryCart));
  updateCartBadges();
}

// Đóng/Mở ngăn kéo giỏ hàng
function toggleCart(isOpen) {
  const drawer = document.getElementById('morytory-cart-drawer');
  const overlay = document.getElementById('morytory-cart-overlay');
  if (!drawer || !overlay) return;

  if (isOpen) {
    renderCartItems();
    drawer.classList.add('open');
    overlay.classList.add('open');
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(item, openDrawer = true) {
  loadCartData();
  
  // Kiểm tra trùng lặp (trùng title, theme và danh sách ảnh face swap nếu có)
  const existingItemIndex = morytoryCart.findIndex(i => {
    const isSameTitle = i.title === item.title;
    const isSameTheme = i.theme === item.theme;
    
    // So sánh mặt ghép (nếu có)
    const isSameSwaps = JSON.stringify(i.swappedFaces || {}) === JSON.stringify(item.swappedFaces || {});
    
    return isSameTitle && isSameTheme && isSameSwaps;
  });

  if (existingItemIndex > -1) {
    // Cộng dồn số lượng
    morytoryCart[existingItemIndex].quantity += item.quantity;
    // Cập nhật ảnh preview mới nhất nếu có
    if (item.compositePreview) {
      morytoryCart[existingItemIndex].compositePreview = item.compositePreview;
    }
  } else {
    // Tạo ID duy nhất cho sản phẩm trong giỏ
    item.id = 'cart_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    morytoryCart.push(item);
  }

  saveCartData();
  
  // Show toast notification instead of opening drawer directly
  if (typeof showToast === 'function') {
    showToast(`Đã thêm <b>${item.title}</b> vào giỏ hàng!`, 'success');
  }
  
  if (openDrawer) {
    toggleCart(true); // Mở giỏ hàng khi yêu cầu
  }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(itemId) {
  loadCartData();
  morytoryCart = morytoryCart.filter(i => i.id !== itemId);
  saveCartData();
  renderCartItems();
}

// Cập nhật số lượng sản phẩm trong giỏ
function updateCartQuantity(itemId, delta) {
  loadCartData();
  const item = morytoryCart.find(i => i.id === itemId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    saveCartData();
    renderCartItems();
  }
}

// Làm sạch giỏ hàng (Sau khi đặt hàng thành công)
function clearCart() {
  morytoryCart = [];
  saveCartData();
  renderCartItems();
}

// Tính tổng tiền giỏ hàng
function getCartTotal() {
  loadCartData();
  return morytoryCart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
}

// Tính tổng số lượng sản phẩm trong giỏ
function getCartCount() {
  loadCartData();
  return morytoryCart.reduce((sum, item) => sum + item.quantity, 0);
}

// Cập nhật số hiển thị giỏ hàng trên trang (ví dụ trên Navbar)
function updateCartBadges() {
  const count = getCartCount();
  
  // Thử cập nhật các nút có ID cart-count
  const cartCounts = document.querySelectorAll('#cart-count');
  cartCounts.forEach(el => {
    el.textContent = `(${count})`;
  });

  // Cập nhật các cart badge khác nếu có
  const cartBadges = document.querySelectorAll('.cart-badge');
  cartBadges.forEach(el => {
    el.textContent = count;
  });
}

// Lấy link ảnh mặc định dựa trên chủ đề
function getThemeFallbackImage(theme) {
  if (theme === "Sinh nhật gia đình") return "./birthday_base.jpg";
  if (theme === "Tốt nghiệp") return "./graduation_base.jpg";
  if (theme === "Đám cưới") return "./wedding_base.jpg";
  return "./logo.png";
}

// Vẽ danh sách sản phẩm trong giỏ hàng
function renderCartItems() {
  loadCartData();
  const body = document.getElementById('morytory-cart-body');
  const footer = document.getElementById('morytory-cart-footer');
  if (!body) return;

  if (morytoryCart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon"><i class="ti ti-shopping-cart-x"></i></div>
        <div class="cart-empty-text">Giỏ hàng của bạn đang trống</div>
        <button class="btn-continue-shopping" onclick="toggleCart(false)">Tiếp tục mua sắm</button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'flex';

  body.innerHTML = '';
  morytoryCart.forEach(item => {
    // Xác định ảnh hiển thị
    let imgSrc = item.compositePreview;
    if (!imgSrc || imgSrc === "") {
      imgSrc = getThemeFallbackImage(item.theme);
    }

    const itemHtml = `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${imgSrc}" alt="${item.title}" onerror="this.src='./logo.png'">
        </div>
        <div class="cart-item-details">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-theme">${item.theme ? 'Chủ đề: ' + item.theme : 'Sản phẩm làm sẵn'}</div>
          </div>
          <div class="cart-item-row">
            <div class="cart-item-price">${formatVND(item.unitPrice * item.quantity)}</div>
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', -1)">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
        <button class="cart-item-delete" onclick="removeFromCart('${item.id}')" title="Xóa sản phẩm">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    `;
    body.insertAdjacentHTML('beforeend', itemHtml);
  });

  // Cập nhật tổng tiền
  const totalValEl = document.getElementById('morytory-cart-total-val');
  if (totalValEl) {
    totalValEl.textContent = formatVND(getCartTotal());
  }
}

// Khởi tạo các phần tử Giỏ hàng tự động
function initCartDrawer() {
  // Tạo HTML ngăn kéo nếu chưa có
  if (!document.getElementById('morytory-cart-drawer')) {
    const drawerHtml = `
      <!-- Backdrop Overlay -->
      <div class="cart-overlay" id="morytory-cart-overlay" onclick="toggleCart(false)"></div>
      
      <!-- Drawer Container -->
      <div class="cart-drawer" id="morytory-cart-drawer">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">Giỏ hàng của bạn</div>
          <button class="cart-drawer-close" onclick="toggleCart(false)">&times;</button>
        </div>
        
        <div class="cart-drawer-body" id="morytory-cart-body">
          <!-- Render danh sách cart items động ở đây -->
        </div>
        
        <div class="cart-drawer-footer" id="morytory-cart-footer">
          <div class="cart-summary-row">
            <span class="cart-summary-label">Tổng cộng:</span>
            <span class="cart-summary-value" id="morytory-cart-total-val">0 đ</span>
          </div>
          <button class="btn-cart-checkout" onclick="triggerCartCheckout()">Tiến hành thanh toán</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
  }

  // Gắn sự kiện click cho các phần tử có nút giỏ hàng (.cart-btn)
  const cartBtns = document.querySelectorAll('.cart-btn');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCart(true);
    });
  });

  // Cập nhật hiển thị số lượng giỏ hàng hiện tại
  loadCartData();
  updateCartBadges();
}

// Hàm kích hoạt thanh toán giỏ hàng (Gọi Modal thông tin đặt hàng)
function triggerCartCheckout() {
  toggleCart(false); // Đóng giỏ hàng
  
  // Hàm này sẽ gọi hàm openCheckoutModal từ trang index.html hoặc product_custom.html
  if (typeof openCheckoutModal === 'function') {
    openCheckoutModal();
  } else {
    console.error("Không tìm thấy hàm openCheckoutModal trên trang này!");
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
});
