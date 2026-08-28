"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';

const CATEGORIES = ['الكل', 'كرياتين', 'بروتين', 'بروتين بار', 'شيك بروتين', 'شيكر', 'سبلمينت', 'عام'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const emptyForm = { name: '', category: 'عام', price: '', costPrice: '', stock: '' };

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const Cashier = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const loadProducts = async (cat = activeCategory, q = search) => {
    const params: Record<string, string> = {};
    if (cat !== 'الكل') params.category = cat;
    if (q) params.search = q;
    const { data } = await api.get('/products', { params });
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []); // eslint-disable-line

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadProducts(cat, search);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    loadProducts(activeCategory, e.target.value);
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => (i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await api.post('/sales', {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes,
      });
      setMessage('✅ تمت عملية البيع بنجاح');
      setCart([]);
      setNotes('');
      loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'حصل خطأ'));
    }
  };

  const openAddForm = () => {
    setEditProduct(null);
    setProductForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setShowAddProduct(true);
  };

  const openEditForm = (p: any) => {
    setEditProduct(p);
    setProductForm({ name: p.name, category: p.category, price: p.price, costPrice: p.costPrice, stock: p.stock });
    setImageFile(null);
    setImagePreview(p.image ? `${API_BASE}${p.image}` : '');
    setShowAddProduct(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(productForm).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    if (editProduct) {
      await api.put(`/products/${editProduct._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setShowAddProduct(false);
    setEditProduct(null);
    setProductForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-primary" onClick={openAddForm}>+ منتج جديد</button>
        <h1>الكاشير</h1>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>{editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ padding: '0 20px 20px' }}>
              {/* Image Upload */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <label htmlFor="product-img" style={{ cursor: 'pointer' }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: 12,
                    border: '2px dashed var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                    overflow: 'hidden',
                    background: 'rgba(255,87,70,0.05)'
                  }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 36 }}>📷</span>
                    }
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>اضغط لتغيير الصورة</span>
                </label>
                <input id="product-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>

              <div className="form-row">
                <div>
                  <label>اسم المنتج</label>
                  <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
                <div>
                  <label>الكاتيجوري</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} style={{ width: '100%' }}>
                    {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>سعر البيع (ج.م)</label>
                  <input type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>
                <div>
                  <label>سعر التكلفة (ج.م)</label>
                  <input type="number" min="0" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })} />
                </div>
                <div>
                  <label>الكمية بالمخزن</label>
                  <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12 }}>
                {editProduct ? '💾 حفظ التعديلات' : '+ إضافة المنتج'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="pos-layout">
        {/* Products Panel */}
        <div>
          {/* Search + Category Tabs */}
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="🔍 ابحث عن منتج..."
              value={search}
              onChange={handleSearch}
              style={{ width: '100%', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                    color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                    transform: activeCategory === cat ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="pos-products">
            {products.map((p) => (
              <div
                key={p._id}
                className={`product-card ${p.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(p)}
                style={{ position: 'relative', padding: 0, overflow: 'hidden' }}
              >
                {/* Product Image */}
                <div style={{ height: 110, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image
                    ? <img src={`${API_BASE}${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 42 }}>🛒</span>
                  }
                </div>

                {/* Category Badge */}
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(255,87,70,0.85)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  backdropFilter: 'blur(4px)'
                }}>{p.category}</span>

                {/* Out of stock badge */}
                {p.stock <= 0 && (
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'rgba(0,0,0,0.7)', color: '#ff5746',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  }}>نفد</span>
                )}

                {/* Card body */}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div className="product-name" style={{ marginBottom: 4 }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="product-price">{p.price} ج.م</div>
                    <div className="product-stock" style={{ fontSize: 11 }}>متاح: {p.stock}</div>
                  </div>
                </div>

                {/* Edit / Delete Buttons */}
                <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditForm(p); }}
                    style={{ flex: 1, padding: '6px 0', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
                  >✏️ تعديل</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p._id); }}
                    style={{ flex: 1, padding: '6px 0', background: 'transparent', border: 'none', color: '#ff5746', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                  >🗑️ حذف</button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, gridColumn: '1/-1', textAlign: 'center', padding: '30px 0' }}>
                مفيش منتجات في هذه الفئة
              </p>
            )}
          </div>
        </div>

        {/* Cart / Invoice Panel */}
        <div className="form-card" style={{ position: 'sticky', top: 20 }}>
          <h2 style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
            🧾 الفاتورة
          </h2>
          {message && <div className="message">{message}</div>}

          {cart.map((i) => (
            <div key={i.productId} className="cart-item">
              <span className="cart-item-name">{i.name}</span>
              <div className="qty-control">
                <button onClick={() => updateQty(i.productId, i.quantity - 1)}>-</button>
                <span className="qty-value">{i.quantity}</span>
                <button onClick={() => updateQty(i.productId, i.quantity + 1)}>+</button>
              </div>
              <span className="cart-item-price">{i.price * i.quantity} ج.م</span>
            </div>
          ))}
          {cart.length === 0 && <p className="empty-cart">الفاتورة فاضية، دوس على منتج عشان تضيفه</p>}

          <div className="cart-total">
            <span className="val">{total} ج.م</span>
            <span>:الإجمالي</span>
          </div>

          <label style={{ marginTop: 12 }}>ملاحظات (مثال: دفع فيزا)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اكتب أي ملاحظات هنا..." />

          <button className="btn-checkout" onClick={handleCheckout} disabled={cart.length === 0}>
            💳 تأكيد الدفع
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
