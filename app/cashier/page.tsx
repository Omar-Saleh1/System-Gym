"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  SparklesIcon, 
  TagIcon, 
  TrashIcon, 
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const BASE_CATEGORIES = ['الكل', 'ملابس رياضية', 'كرياتين', 'بروتين', 'بروتين بار', 'شيك بروتين', 'شيكر', 'سبلمينت', 'عام'];

const CATEGORY_ICONS: Record<string, string> = {
  'الكل': '🌟',
  'ملابس رياضية': '👕',
  'كرياتين': '⚡',
  'بروتين': '💪',
  'بروتين بار': '🍫',
  'شيك بروتين': '🥤',
  'شيكر': '🍶',
  'سبلمينت': '💊',
  'عام': '📦',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'ملابس رياضية': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  'كرياتين': { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)', gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
  'بروتين': { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.35)', gradient: 'linear-gradient(135deg, #eab308, #ca8a04)' },
  'بروتين بار': { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.35)', gradient: 'linear-gradient(135deg, #f97316, #c2410c)' },
  'شيك بروتين': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
  'شيكر': { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.35)', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  'سبلمينت': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  'عام': { bg: 'rgba(156, 163, 175, 0.15)', text: '#d1d5db', border: 'rgba(156, 163, 175, 0.35)', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const emptyForm = { name: '', category: 'ملابس رياضية', price: '', costPrice: '', stock: '' };

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
  const [productToDelete, setProductToDelete] = useState<any>(null);

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

  const openEditForm = (product: any) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice || '',
      stock: product.stock,
    });
    setImageFile(null);
    setImagePreview(product.image ? `${API_BASE}${product.image}` : '');
    setShowAddProduct(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
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

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProductToDelete(null);
      loadProducts();
    } catch (err: any) {
      console.error('Error deleting product', err);
    }
  };

  // Build dynamic categories ensuring all products are represented
  const allCategories = ['الكل', ...Array.from(new Set([
    'ملابس رياضية',
    'كرياتين',
    'بروتين',
    'بروتين بار',
    'شيك بروتين',
    'شيكر',
    'سبلمينت',
    'عام',
    ...products.map((p) => p.category).filter(Boolean),
  ]))];

  const renderProductIllustration = (category: string) => {
    if (category === 'ملابس رياضية') {
      return (
        <svg viewBox="0 0 64 64" fill="none" style={{ width: 46, height: 46 }}>
          <path d="M18 10L10 22L20 28L20 54L44 54L44 28L54 22L46 10L36 14C34 16 30 16 28 14L18 10Z" fill="url(#tshirt-grad)" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M28 14C30 16 34 16 36 14" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="tshirt-grad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(59, 130, 246, 0.35)" />
              <stop offset="1" stopColor="rgba(29, 78, 216, 0.15)" />
            </linearGradient>
          </defs>
        </svg>
      );
    } else if (category === 'كرياتين' || category === 'بروتين' || category === 'سبلمينت') {
      return (
        <svg viewBox="0 0 64 64" fill="none" style={{ width: 44, height: 44 }}>
          <rect x="20" y="8" width="24" height="10" rx="3" fill="#a855f7" opacity="0.5" stroke="#c084fc" strokeWidth="2" />
          <rect x="14" y="18" width="36" height="38" rx="6" fill="url(#supp-grad)" stroke="#c084fc" strokeWidth="2.5" />
          <path d="M26 34L32 26L38 34H33V44H29V34H26Z" fill="#facc15" />
          <defs>
            <linearGradient id="supp-grad" x1="14" y1="18" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="1" stopColor="rgba(126, 34, 206, 0.1)" />
            </linearGradient>
          </defs>
        </svg>
      );
    } else if (category === 'شيكر' || category === 'شيك بروتين') {
      return (
        <svg viewBox="0 0 64 64" fill="none" style={{ width: 42, height: 42 }}>
          <path d="M24 10H40L42 16H22L24 10Z" fill="#14b8a6" stroke="#2dd4bf" strokeWidth="2" />
          <path d="M22 18H42L38 54H26L22 18Z" fill="url(#shaker-grad)" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="28" y1="28" x2="36" y2="28" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="36" x2="35" y2="36" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="shaker-grad" x1="22" y1="18" x2="42" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(20, 184, 166, 0.3)" />
              <stop offset="1" stopColor="rgba(15, 118, 110, 0.1)" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    return (
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,87,70,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
        <ShoppingBagIcon style={{ width: 26, height: 26 }} />
      </div>
    );
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-primary" onClick={openAddForm} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
          <PlusIcon style={{ width: 18, height: 18 }} />
          + منتج جديد
        </button>
        <div>
          <h1>المتجر والكاشير (Store & POS)</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
            بيع الملابس الرياضية والمكملات والمشروبات وتسجيل المبيعات مباشرة.
          </div>
        </div>
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
                    width: 120, height: 120, borderRadius: 16,
                    border: '2px dashed var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                    overflow: 'hidden',
                    background: 'rgba(255,87,70,0.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><ShoppingBagIcon style={{ width: 36, height: 36, margin: '0 auto' }} /><div style={{ fontSize: 11, marginTop: 4 }}>اختر صورة</div></div>
                    }
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>اضغط لتغيير الصورة (اختياري)</span>
                </label>
                <input id="product-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>

              <div className="form-row">
                <div>
                  <label>اسم المنتج</label>
                  <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="مثال: تيشيرت نص سوسته" required />
                </div>
                <div>
                  <label>الكاتيجوري</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} style={{ width: '100%' }}>
                    {BASE_CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
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
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 10, fontWeight: 'bold' }}>
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
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                placeholder="🔍 ابحث عن منتج بالاسم..."
                value={search}
                onChange={handleSearch}
                style={{ width: '100%', padding: '12px 18px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', fontSize: 14 }}
              />
            </div>
            
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {allCategories.map((cat) => {
                const isActive = activeCategory === cat;
                const icon = CATEGORY_ICONS[cat] || '🏷️';
                const styleConfig = CATEGORY_COLORS[cat] || { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-muted)', border: 'transparent', gradient: 'var(--primary)' };
                
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      border: isActive ? '1px solid ' + styleConfig.border : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                      background: isActive ? styleConfig.gradient : 'var(--bg-card)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.3)' : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <span>{icon}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="pos-products" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
            {products.map((p) => {
              const catConfig = CATEGORY_COLORS[p.category] || { bg: 'rgba(255,87,70,0.15)', text: '#ff5746', border: 'rgba(255,87,70,0.3)', gradient: 'linear-gradient(135deg, #ff5746, #e04b3c)' };
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p._id}
                  className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => addToCart(p)}
                  style={{
                    position: 'relative',
                    padding: 0,
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Category Pill Tag */}
                  <span style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    background: catConfig.bg,
                    color: catConfig.text,
                    border: '1px solid ' + catConfig.border,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 20,
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span>{CATEGORY_ICONS[p.category] || '🏷️'}</span>
                    <span>{p.category}</span>
                  </span>

                  {/* Out of stock badge */}
                  {isOutOfStock && (
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 2,
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 20,
                      boxShadow: '0 2px 8px rgba(239,68,68,0.4)'
                    }}>نفد من المخزن</span>
                  )}

                  {/* Product Visual Container */}
                  <div style={{
                    height: 120,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    position: 'relative'
                  }}>
                    {p.image ? (
                      <img src={`${API_BASE}${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      renderProductIllustration(p.category)
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        {p.name}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#22c55e' }}>
                          {p.price} <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-muted)' }}>ج.م</span>
                        </div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: p.stock > 5 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.15)',
                          color: p.stock > 5 ? '#4ade80' : '#fbbf24',
                          border: p.stock > 5 ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          متاح: {p.stock}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div style={{
                    display: 'flex',
                    borderTop: '1px solid var(--border-color)',
                    background: 'rgba(0,0,0,0.15)'
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditForm(p); }}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'Cairo, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <PencilSquareIcon style={{ width: 14, height: 14 }} />
                      تعديل
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProductToDelete(p); }}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: 'transparent',
                        border: 'none',
                        borderRight: '1px solid var(--border-color)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'Cairo, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <TrashIcon style={{ width: 14, height: 14 }} />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, gridColumn: '1/-1', textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
                <ShoppingBagIcon style={{ width: 44, height: 44, margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                <div>لا توجد منتجات في هذه الفئة حتى الآن</div>
              </div>
            )}
          </div>
        </div>

        {/* Cart / Invoice Panel */}
        <div className="form-card" style={{ position: 'sticky', top: 20, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, rgba(255,87,70,0.25), rgba(255,87,70,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 2px 10px rgba(255,87,70,0.25)' }}>
                <ShoppingCartIcon style={{ width: 22, height: 22 }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 'bold', margin: 0, color: '#fff' }}>الفاتورة / سلة المشتريات</h2>
            </div>
            {cart.length > 0 && (
              <span className="badge badge-primary" style={{ fontSize: 11, background: 'var(--primary)', color: '#fff', padding: '4px 10px' }}>
                {cart.reduce((s, i) => s + i.quantity, 0)} قطعة
              </span>
            )}
          </div>

          {message && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 'bold',
              background: message.includes('✅') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: message.includes('✅') ? '#4ade80' : '#f87171',
              border: message.includes('✅') ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {cart.map((i) => (
            <div key={i.productId} className="cart-item" style={{ borderRadius: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', marginBottom: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="cart-item-name" style={{ fontWeight: 'bold' }}>{i.name}</span>
              <div className="qty-control">
                <button onClick={() => updateQty(i.productId, i.quantity - 1)}>-</button>
                <span className="qty-value">{i.quantity}</span>
                <button onClick={() => updateQty(i.productId, i.quantity + 1)}>+</button>
              </div>
              <span className="cart-item-price" style={{ fontWeight: 'bold', color: '#22c55e' }}>{i.price * i.quantity} ج.م</span>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
              <ShoppingCartIcon style={{ width: 36, height: 36, margin: '0 auto 8px', opacity: 0.5 }} />
              <div>السلة فارغة، اضغط على أي منتج لإضافته</div>
            </div>
          )}

          <div className="cart-total" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span className="val" style={{ fontSize: 20, color: '#22c55e', fontWeight: 900 }}>{total} ج.م</span>
            <span style={{ fontWeight: 'bold' }}>الإجمالي:</span>
          </div>

          <label style={{ marginTop: 14, display: 'block', fontSize: 13, color: 'var(--text-muted)' }}>ملاحظات (مثال: دفع فيزا / نقدي)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اكتب أي ملاحظات هنا..." style={{ width: '100%', marginTop: 4 }} />

          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '13px 20px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 15,
              background: cart.length > 0 ? 'linear-gradient(135deg, #ff5746 0%, #e04b3c 100%)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: cart.length > 0 ? '#fff' : 'var(--text-muted)',
              cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: cart.length > 0 ? '0 4px 16px rgba(255,87,70,0.35)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <CheckIcon style={{ width: 18, height: 18 }} />
            تأكيد الدفع ({total} ج.م)
          </button>
        </div>
      </div>

      {/* Confirm Delete Product Modal */}
      <ConfirmModal
        open={!!productToDelete}
        type="danger"
        title="تأكيد حذف المنتج"
        message={
          <span>
            هل أنت متأكد من حذف المنتج{' '}
            <strong style={{ color: '#fff' }}>"{productToDelete?.name}"</strong> نهائياً من المتجر؟
            <br />
            <span style={{ fontSize: '13px', opacity: 0.85, color: '#f87171', display: 'block', marginTop: '6px' }}>
              لن يمكنك التراجع عن هذه الخطوة.
            </span>
          </span>
        }
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};

export default Cashier;
