'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';
import {
  BanknotesIcon,
  ReceiptRefundIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
  DocumentCheckIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  ClockIcon,
  ShoppingBagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  subscription: 'اشتراكات أعضاء',
  single_visit: 'حصص فردية (Day Pass)',
  renewal: 'تجديد اشتراكات',
  coach_salary: 'رواتب كباتن',
  rent: 'إيجار',
  equipment: 'معدات الجيم',
  electricity: 'كهرباء',
  water: 'مياه',
  maintenance: 'صيانة',
  salaries: 'رواتب عمالة',
  marketing: 'تسويق',
  store: 'مبيعات المتجر',
  sales: 'مبيعات المتجر',
  other: 'أخرى',
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'كاش',
  CARD: 'بطاقة',
  BANK_TRANSFER: 'تحويل بنكي',
  ONLINE: 'أونلاين',
  OTHER: 'أخرى',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  expired: 'منتهي',
  cancelled: 'ملغي',
  frozen: 'مجمد',
  PAID: 'مدفوع بالكامل',
  PARTIAL: 'مدفوع جزئياً',
  PENDING: 'معلق',
};

const ARABIC_MONTHS = [
  '', 'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// ─── Shared Components ────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  bgGradient?: string;
}

const StatCard = ({
  label, value, sub, color = 'var(--text)', icon, bgGradient = 'rgba(255,255,255,0.05)'
}: StatCardProps) => (
  <div className="stat-card" style={{
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    borderRadius: '16px',
    background: 'var(--bg-card)',
    border: `1px solid ${color ? `${color}33` : 'var(--border-color)'}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.25s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
      <div className="stat-label" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
        {label}
      </div>
      {icon && (
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || '#fff',
          boxShadow: `0 4px 14px ${color ? `${color}25` : 'rgba(0,0,0,0.1)'}`
        }}>
          {React.cloneElement(icon as React.ReactElement, { style: { width: '22px', height: '22px' } })}
        </div>
      )}
    </div>

    <div className="stat-value" style={{ color: color || 'var(--text)', fontSize: '26px', fontWeight: 'bold' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      {sub && <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px', fontWeight: 'normal' }}>{sub}</span>}
    </div>
  </div>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="form-card" style={{ marginBottom: '20px' }}>
    <h3 style={{ marginBottom: '14px' }}>{title}</h3>
    {children}
  </div>
);

// ─── Daily Bar Chart (CSS only) ───────────────────────────────────────────────
const DailyChart = ({ data }: { data: { day: number; income: number; expense: number }[] }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', minWidth: `${data.length * 22}px` }}>
        {data.map(d => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '18px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100px', gap: '1px' }}>
              <div title={`إيراد: ${d.income} ج.م`} style={{ background: 'var(--primary)', height: `${Math.round((d.income / maxVal) * 90)}px`, borderRadius: '2px 2px 0 0', minHeight: d.income > 0 ? '4px' : '0' }} />
              <div title={`مصروف: ${d.expense} ج.م`} style={{ background: 'var(--danger)', height: `${Math.round((d.expense / maxVal) * 90)}px`, borderRadius: '0 0 2px 2px', minHeight: d.expense > 0 ? '4px' : '0', opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.day}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
        <span><span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px', display: 'inline-block', marginLeft: '4px' }} />إيرادات</span>
        <span><span style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px', display: 'inline-block', marginLeft: '4px' }} />مصروفات</span>
      </div>
    </div>
  );
};

import { useAuth } from '../../context/AuthContext';

// ─── Daily Report Panel ───────────────────────────────────────────────────────
const DailyReportPanel = () => {
  const { cashier } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [shiftFilter, setShiftFilter] = useState(cashier?.shiftType || '');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  const loadDailyReport = async (d: string, sFilter?: string) => {
    try {
      setLoading(true);
      setError('');
      const targetShift = sFilter !== undefined ? sFilter : shiftFilter;
      const { data } = await api.get('/reports/daily', {
        params: { date: d, shiftType: targetShift || undefined }
      });
      setReport(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteSale = async () => {
    if (!saleToDelete) return;
    const saleId = saleToDelete;
    setDeletingId(saleId);
    setSaleToDelete(null);
    try {
      await api.delete(`/sales/${saleId}`);
      await loadDailyReport(date, shiftFilter);
    } catch (err: any) {
      setError('خطأ في الحذف: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { loadDailyReport(todayStr); }, [shiftFilter]); // eslint-disable-line

  return (
    <div>
      {/* Date & Shift Picker */}
      <div className="form-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>فلترة التقرير اليومي</h3>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div>
            <label>التاريخ</label>
            <input type="date" value={date} max={todayStr} onChange={e => setDate(e.target.value)} />
          </div>

          {cashier?.role === 'admin' ? (
            <div>
              <label>الشفت</label>
              <select value={shiftFilter} onChange={e => { setShiftFilter(e.target.value); loadDailyReport(date, e.target.value); }}>
                <option value="">🌐 جميع الشفتات</option>
                <option value="GIRLS">🌸 شفت البنات</option>
                <option value="BOYS">🏋️‍♂️ شفت الشباب</option>
              </select>
            </div>
          ) : (
            <div>
              <label>الشفت الحالي</label>
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                {cashier?.shiftType === 'GIRLS' ? '🌸 شفت البنات' : cashier?.shiftType === 'BOYS' ? '🏋️‍♂️ شفت الشباب' : 'كاشير'}
              </div>
            </div>
          )}

          <div>
            <button onClick={() => loadDailyReport(date)} disabled={loading}>
              {loading ? 'جاري التحميل...' : '🔍 عرض التقرير'}
            </button>
          </div>
          <div>
            <button onClick={() => { setDate(todayStr); loadDailyReport(todayStr); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              📅 اليوم
            </button>
          </div>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginTop: '10px' }}>{error}</div>}
      </div>

      {report && (
        <>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)' }}>تقرير يوم {new Date(report.date + 'T12:00:00').toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            {report.shiftType ? (
              <div style={{ marginTop: '6px' }}>
                <span className="badge badge-secondary" style={{ fontSize: '12px', color: report.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6' }}>
                  {report.shiftType === 'GIRLS' ? '🌸 شفت البنات' : '🏋️‍♂️ شفت الشباب'}
                </span>
              </div>
            ) : (
              <div style={{ marginTop: '6px' }}>
                <span className="badge badge-secondary" style={{ fontSize: '12px' }}>🌐 جميع الشفتات</span>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="cards-grid" style={{ marginBottom: '24px' }}>
            <StatCard 
              label="إجمالي الإيرادات" 
              value={report.financial.totalIncome} 
              sub="ج.م" 
              color="#22c55e" 
              bgGradient="linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))"
              icon={<BanknotesIcon />} 
            />
            <StatCard 
              label="إجمالي المصروفات" 
              value={report.financial.totalExpense} 
              sub="ج.م" 
              color="#ef4444" 
              bgGradient="linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))"
              icon={<ReceiptRefundIcon />} 
            />
            <StatCard
              label="صافي الربح"
              value={report.financial.netProfit}
              sub="ج.م"
              color={report.financial.netProfit >= 0 ? '#10b981' : '#ef4444'}
              bgGradient={report.financial.netProfit >= 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))' : 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))'}
              icon={report.financial.netProfit >= 0 ? <ArrowTrendingUpIcon /> : <ArrowTrendingDownIcon />}
            />
            <StatCard 
              label="مبيعات المتجر" 
              value={report.sales?.count || 0} 
              sub={`${(report.sales?.revenue || 0).toLocaleString()} ج.م`} 
              color="#60a5fa" 
              bgGradient="linear-gradient(135deg, rgba(96,165,250,0.25), rgba(96,165,250,0.08))"
              icon={<ShoppingBagIcon />} 
            />
            <StatCard 
              label="حصص فردية (Day Pass)" 
              value={report.singleVisits?.count || 0} 
              sub={`${(report.singleVisits?.revenue || 0).toLocaleString()} ج.م`} 
              color="#f59e0b" 
              bgGradient="linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))"
              icon={<SparklesIcon />} 
            />
            <StatCard 
              label="حضور الأعضاء" 
              value={report.attendance.totalVisits} 
              color="#3b82f6"
              bgGradient="linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))"
              icon={<UserGroupIcon />} 
            />
            <StatCard 
              label="أعضاء مختلفين" 
              value={report.attendance.uniqueVisitors} 
              color="#8b5cf6"
              bgGradient="linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.08))"
              icon={<UsersIcon />} 
            />
            <StatCard 
              label="اشتراكات جديدة" 
              value={report.subscriptions.count} 
              color="#06b6d4"
              bgGradient="linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.08))"
              icon={<DocumentCheckIcon />} 
            />
            <StatCard 
              label="أعضاء جدد" 
              value={report.newMembers.count} 
              color="#ec4899"
              bgGradient="linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.08))"
              icon={<UserPlusIcon />} 
            />
            <StatCard 
              label="مدفوعات مسجلة" 
              value={report.settledPayments.count} 
              color="#10b981"
              bgGradient="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))"
              icon={<CheckBadgeIcon />} 
            />
          </div>

          {/* Income & Expense Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <SectionCard title="💰 مصادر الإيرادات">
              {Object.keys(report.incomeByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد إيرادات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>المصدر</th><th>المبلغ</th></tr></thead>
                  <tbody>
                    {Object.entries(report.incomeByCategory as Record<string, number>)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, amt]) => (
                        <tr key={cat}>
                          <td>{CATEGORY_LABELS[cat] || cat}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{amt.toLocaleString()} ج.م</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </SectionCard>

            <SectionCard title="💸 المصروفات">
              {Object.keys(report.expenseByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد مصروفات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>الفئة</th><th>المبلغ</th></tr></thead>
                  <tbody>
                    {Object.entries(report.expenseByCategory as Record<string, number>)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, amt]) => (
                        <tr key={cat}>
                          <td>{CATEGORY_LABELS[cat] || cat}</td>
                          <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{amt.toLocaleString()} ج.م</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>

          {/* ── Settled Payments (سداد المعلق) ── */}
          <SectionCard title="✅ المبالغ المُسددة في هذا اليوم">
            {report.settledPayments.list.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>لا توجد مدفوعات مسجلة في هذا اليوم</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>العضو</th>
                      <th>الإجمالي</th>
                      <th>المدفوع</th>
                      <th>المتبقي</th>
                      <th>طريقة الدفع</th>
                      <th>الحالة</th>
                      <th>وقت السداد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.settledPayments.list.map((p: any) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 'bold' }}>{(p.member as any)?.name || '-'}</td>
                        <td>{p.amount.toLocaleString()} ج.م</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.paidAmount.toLocaleString()} ج.م</td>
                        <td style={{ color: p.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                          {p.remainingAmount.toLocaleString()} ج.م
                        </td>
                        <td>{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                        <td>
                          <span className={`badge ${p.status === 'PAID' ? 'badge-success' : p.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(p.paymentDate).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ── Single Visits (حصص فردية) ── */}
          {report.singleVisits && (
            <SectionCard title={`⚡ الحصص الفردية في هذا اليوم (${report.singleVisits.count}) — إجمالي: ${report.singleVisits.revenue.toLocaleString()} ج.م`}>
              {report.singleVisits.list.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد حصص فردية مسجلة في هذا اليوم</div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>اسم الزائر / اللاعب</th>
                        <th>نوع الحصة</th>
                        <th>الموبايل</th>
                        <th>المبلغ</th>
                        <th>طريقة الدفع</th>
                        <th>الشفت</th>
                        <th>وقت الدخول</th>
                        <th>الكاشير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.singleVisits.list.map((v: any) => (
                        <tr key={v._id}>
                          <td style={{ fontWeight: 'bold' }}>{v.name}</td>
                          <td>
                            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                              {v.sessionName || 'حصة عامة'}
                            </span>
                          </td>
                          <td>{v.phone || <span style={{ color: 'var(--text-muted)' }}>بدون رقم</span>}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{v.amount.toLocaleString()} ج.م</td>
                          <td>{METHOD_LABELS[v.paymentMethod] || v.paymentMethod}</td>
                          <td>
                            <span className="badge badge-secondary" style={{
                              color: v.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6',
                              background: v.shiftType === 'GIRLS' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)'
                            }}>
                              {v.shiftType === 'GIRLS' ? '🌸 بنات' : '🏋️‍♂️ شباب'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {new Date(v.visitedAt || v.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>{v.createdBy?.name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Store Sales (مبيعات المتجر) ── */}
          {report.sales && (
            <SectionCard title={`🛍️ مبيعات المتجر في هذا اليوم (${report.sales.count}) — إجمالي: ${report.sales.revenue.toLocaleString()} ج.م`}>
              {report.sales.list.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد مبيعات مسجلة في هذا اليوم</div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الوقت</th>
                        <th>المنتجات</th>
                        <th>الإجمالي</th>
                        <th>طريقة الدفع</th>
                        <th>الكاشير</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sales.list.map((s: any) => (
                        <tr key={s._id}>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(s.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {s.items.map((item: any, idx: number) => (
                                <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>×{item.quantity}</span>
                                  <span>{item.name}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>({item.price} ج.م)</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ color: '#22c55e', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{s.total.toLocaleString()} ج.م</td>
                          <td>{s.paymentMethod === 'card' ? 'بطاقة' : s.paymentMethod === 'CARD' ? 'بطاقة' : 'كاش'}</td>
                          <td style={{ fontSize: '12px' }}>{s.cashier?.name || '-'}</td>
                          <td>
                            <button
                              onClick={() => setSaleToDelete(s._id)}
                              disabled={deletingId === s._id}
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171',
                                borderRadius: 8,
                                padding: '5px 10px',
                                cursor: deletingId === s._id ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                fontFamily: 'Cairo, sans-serif',
                                fontWeight: 700,
                                opacity: deletingId === s._id ? 0.5 : 1,
                              }}
                            >
                              <TrashIcon style={{ width: 13, height: 13 }} />
                              {deletingId === s._id ? '...' : 'حذف'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {/* All Transactions */}
          <SectionCard title={`📋 جميع المعاملات (${report.transactions.length})`}>
            {report.transactions.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>لا توجد معاملات</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الوقت</th>
                      <th>النوع</th>
                      <th>التصنيف</th>
                      <th>العضو / الزائر / الكابتن</th>
                      <th>المبلغ</th>
                      <th>طريقة الدفع</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.map((tx: any) => (
                      <tr key={tx._id}>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(tx.date).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.type === 'income' ? '📥 إيراد' : '📤 مصروف'}
                        </td>
                        <td>{CATEGORY_LABELS[tx.category] || tx.category}</td>
                        <td>{(tx.memberId as any)?.name || tx.customerName || (tx.coachId as any)?.name || tx.description || '-'}</td>
                        <td style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.amount.toLocaleString()} ج.م
                        </td>
                        <td>{METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.description || tx.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Attendance */}
          {report.attendance.list.length > 0 && (
            <SectionCard title={`🏃 الحضور (${report.attendance.totalVisits} زيارة — ${report.attendance.uniqueVisitors} عضو مختلف)`}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>العضو</th><th>دخول</th><th>خروج</th><th>الطريقة</th></tr>
                  </thead>
                  <tbody>
                    {report.attendance.list.map((a: any) => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 'bold' }}>{(a.member as any)?.name || '-'}</td>
                        <td>{new Date(a.checkInTime).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ color: a.checkOutTime ? 'var(--text)' : 'var(--text-muted)' }}>
                          {a.checkOutTime ? new Date(a.checkOutTime).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'لم يسجل خروج'}
                        </td>
                        <td>{a.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Subscriptions */}
          {report.subscriptions.list.length > 0 && (
            <SectionCard title={`📋 الاشتراكات الجديدة (${report.subscriptions.count})`}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>العضو</th><th>الخطة</th><th>من</th><th>إلى</th><th>المبلغ</th></tr>
                  </thead>
                  <tbody>
                    {report.subscriptions.list.map((s: any) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 'bold' }}>{(s.member as any)?.name || '-'}</td>
                        <td>{(s.plan as any)?.name || '-'}</td>
                        <td>{new Date(s.startDate).toLocaleDateString('ar-EG')}</td>
                        <td>{new Date(s.endDate).toLocaleDateString('ar-EG')}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{s.pricePaid.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* New Members */}
          {report.newMembers.count > 0 && (
            <SectionCard title={`🆕 أعضاء جدد (${report.newMembers.count})`}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {report.newMembers.list.map((m: any) => (
                  <div key={m._id} style={{ padding: '8px 14px', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '13px' }}>
                    <strong>{m.name}</strong> — {m.phone}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {/* Confirm Delete Sale Modal */}
      <ConfirmModal
        open={!!saleToDelete}
        type="danger"
        title="تأكيد حذف عملية البيع"
        message={
          <span>
            هل أنت متأكد من حذف عملية البيع هذه؟
            <br />
            <span style={{ fontSize: '13px', opacity: 0.85, color: '#f87171', display: 'block', marginTop: '6px' }}>
              سيتم استرجاع الكميات للمخزون وخصم المبلغ من الإيراد.
            </span>
          </span>
        }
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        onConfirm={handleConfirmDeleteSale}
        onCancel={() => setSaleToDelete(null)}
      />
    </div>
  );
};

// ─── Monthly Report Panel ─────────────────────────────────────────────────────
const MonthlyReportPanel = () => {
  const { cashier } = useAuth();
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [shiftFilter, setShiftFilter] = useState(cashier?.shiftType || '');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runReport = async (sFilter?: string) => {
    try {
      setLoading(true);
      setError('');
      const targetShift = sFilter !== undefined ? sFilter : shiftFilter;
      const { data } = await api.get('/reports/monthly', {
        params: { year, month, shiftType: targetShift || undefined }
      });
      setReport(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب التقرير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Picker */}
      <div className="form-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '14px' }}>فلترة التقرير الشهري</h3>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div>
            <label>السنة</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label>الشهر</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}>
              {ARABIC_MONTHS.slice(1).map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          {cashier?.role === 'admin' ? (
            <div>
              <label>الشفت</label>
              <select value={shiftFilter} onChange={e => { setShiftFilter(e.target.value); runReport(e.target.value); }}>
                <option value="">🌐 جميع الشفتات</option>
                <option value="GIRLS">🌸 شفت البنات</option>
                <option value="BOYS">🏋️‍♂️ شفت الشباب</option>
              </select>
            </div>
          ) : (
            <div>
              <label>الشفت الحالي</label>
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                {cashier?.shiftType === 'GIRLS' ? '🌸 شفت البنات' : cashier?.shiftType === 'BOYS' ? '🏋️‍♂️ شفت الشباب' : 'كاشير'}
              </div>
            </div>
          )}

          <div>
            <button onClick={() => runReport()} disabled={loading}>
              {loading ? 'جاري التحميل...' : '🔍 عرض التقرير'}
            </button>
          </div>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginTop: '10px' }}>{error}</div>}
      </div>

      {report && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)' }}>
              تقرير شهر {ARABIC_MONTHS[report.period.month]} {report.period.year}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {report.period.daysInMonth} يوم
              {report.shiftType ? (
                <span className="badge badge-secondary" style={{ marginRight: '8px', fontSize: '12px', color: report.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6' }}>
                  {report.shiftType === 'GIRLS' ? '🌸 شفت البنات' : '🏋️‍♂️ شفت الشباب'}
                </span>
              ) : (
                <span className="badge badge-secondary" style={{ marginRight: '8px', fontSize: '12px' }}>🌐 جميع الشفتات</span>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="cards-grid" style={{ marginBottom: '24px' }}>
            <StatCard 
              label="إجمالي الإيرادات" 
              value={report.financial.totalIncome} 
              sub="ج.م" 
              color="#22c55e" 
              bgGradient="linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))"
              icon={<BanknotesIcon />} 
            />
            <StatCard 
              label="إجمالي المصروفات" 
              value={report.financial.totalExpense} 
              sub="ج.م" 
              color="#ef4444" 
              bgGradient="linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))"
              icon={<ReceiptRefundIcon />} 
            />
            <StatCard 
              label="صافي الربح" 
              value={report.financial.netProfit} 
              sub="ج.م"
              color={report.financial.netProfit >= 0 ? '#10b981' : '#ef4444'}
              bgGradient={report.financial.netProfit >= 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))' : 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))'}
              icon={report.financial.netProfit >= 0 ? <ArrowTrendingUpIcon /> : <ArrowTrendingDownIcon />} 
            />
            <StatCard 
              label="مبيعات المتجر" 
              value={report.sales?.count || 0} 
              sub={`${(report.sales?.revenue || 0).toLocaleString()} ج.م`} 
              color="#60a5fa" 
              bgGradient="linear-gradient(135deg, rgba(96,165,250,0.25), rgba(96,165,250,0.08))"
              icon={<ShoppingBagIcon />} 
            />
            <StatCard 
              label="حصص فردية (Day Pass)" 
              value={report.singleVisits?.count || 0} 
              sub={`${(report.singleVisits?.revenue || 0).toLocaleString()} ج.م`} 
              color="#f59e0b" 
              bgGradient="linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))"
              icon={<SparklesIcon />} 
            />
            <StatCard 
              label="أعضاء جدد" 
              value={report.members.newCount} 
              color="#ec4899" 
              bgGradient="linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.08))"
              icon={<UserPlusIcon />} 
            />
            <StatCard 
              label="اشتراكات جديدة" 
              value={report.subscriptions.count} 
              color="#06b6d4" 
              bgGradient="linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.08))"
              icon={<DocumentCheckIcon />} 
            />
            <StatCard 
              label="إجمالي الزيارات" 
              value={report.attendance.totalVisits} 
              color="#3b82f6" 
              bgGradient="linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))"
              icon={<UserGroupIcon />} 
            />
            <StatCard 
              label="زوار فريدون" 
              value={report.attendance.uniqueVisitors} 
              color="#8b5cf6" 
              bgGradient="linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.08))"
              icon={<UsersIcon />} 
            />
          </div>

          {/* Daily Chart */}
          <SectionCard title="📈 الإيرادات والمصروفات اليومية">
            <DailyChart data={report.dailyChart} />
          </SectionCard>

          {/* Income & Expense */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <SectionCard title="💰 مصادر الإيرادات">
              {Object.keys(report.incomeByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد إيرادات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>المصدر</th><th>المبلغ</th></tr></thead>
                  <tbody>
                    {Object.entries(report.incomeByCategory as Record<string, number>).sort(([, a], [, b]) => b - a).map(([cat, amt]) => (
                      <tr key={cat}>
                        <td>{CATEGORY_LABELS[cat] || cat}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{amt.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
            <SectionCard title="💸 تفصيل المصروفات">
              {Object.keys(report.expenseByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد مصروفات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>الفئة</th><th>المبلغ</th></tr></thead>
                  <tbody>
                    {Object.entries(report.expenseByCategory as Record<string, number>).sort(([, a], [, b]) => b - a).map(([cat, amt]) => (
                      <tr key={cat}>
                        <td>{CATEGORY_LABELS[cat] || cat}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{amt.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>

          {/* Top Payers + Sub breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <SectionCard title="🏆 أعلى 5 أعضاء دفعاً">
              {!report.topPayers || report.topPayers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>#</th><th>العضو</th><th>الإجمالي</th></tr></thead>
                  <tbody>
                    {report.topPayers.map((p: any, i: number) => (
                      <tr key={i}>
                        <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</td>
                        <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.total.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
            <SectionCard title="📋 حالة الاشتراكات">
              <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                إيراد الاشتراكات: <strong style={{ color: 'var(--success)' }}>{report.subscriptions.revenue.toLocaleString()} ج.م</strong>
              </div>
              {Object.keys(report.subscriptions.statusBreakdown).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد اشتراكات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>الحالة</th><th>العدد</th></tr></thead>
                  <tbody>
                    {Object.entries(report.subscriptions.statusBreakdown as Record<string, number>).map(([status, count]) => (
                      <tr key={status}>
                        <td><span className={`badge ${status === 'active' ? 'badge-success' : status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>{STATUS_LABELS[status] || status}</span></td>
                        <td style={{ fontWeight: 'bold' }}>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>

          {/* Coach Salaries */}
          <SectionCard title="👤 رواتب الكباتن">
            <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', flexWrap: 'wrap', fontSize: '13px' }}>
              <span>المستحق: <strong style={{ color: 'var(--warning)' }}>{report.coachSalaries.totalDue.toLocaleString()} ج.م</strong></span>
              <span>المدفوع: <strong style={{ color: 'var(--success)' }}>{report.coachSalaries.totalPaid.toLocaleString()} ج.م</strong></span>
              <span>المتبقي: <strong style={{ color: 'var(--danger)' }}>{(report.coachSalaries.totalDue - report.coachSalaries.totalPaid).toLocaleString()} ج.م</strong></span>
            </div>
            {report.coachSalaries.list.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>لا توجد رواتب</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>الكابتن</th><th>المستحق</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {report.coachSalaries.list.map((cs: any) => (
                      <tr key={cs._id}>
                        <td style={{ fontWeight: 'bold' }}>{cs.coach?.name || '-'}</td>
                        <td>{cs.salaryAmount.toLocaleString()} ج.م</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{cs.paidAmount.toLocaleString()} ج.م</td>
                        <td style={{ color: cs.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{cs.remainingAmount.toLocaleString()} ج.م</td>
                        <td><span className={`badge ${cs.status === 'PAID' ? 'badge-success' : cs.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>{STATUS_LABELS[cs.status] || cs.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* New Members */}
          {report.members.newCount > 0 && (
            <SectionCard title={`🆕 الأعضاء الجدد (${report.members.newCount})`}>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>الاسم</th><th>الهاتف</th><th>تاريخ التسجيل</th></tr></thead>
                  <tbody>
                    {report.members.list.map((m: any) => (
                      <tr key={m._id}>
                        <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                        <td>{m.phone}</td>
                        <td>{new Date(m.createdAt).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Subscriptions List */}
          {report.subscriptions.list.length > 0 && (
            <SectionCard title={`📝 الاشتراكات المسجلة (${report.subscriptions.count})`}>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>العضو</th><th>الخطة</th><th>من</th><th>إلى</th><th>المبلغ</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {report.subscriptions.list.map((s: any) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 'bold' }}>{(s.member as any)?.name || '-'}</td>
                        <td>{(s.plan as any)?.name || '-'}</td>
                        <td>{new Date(s.startDate).toLocaleDateString('ar-EG')}</td>
                        <td>{new Date(s.endDate).toLocaleDateString('ar-EG')}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{s.pricePaid.toLocaleString()} ج.م</td>
                        <td><span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>{STATUS_LABELS[s.status] || s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
};

// ─── Main Reports Page ────────────────────────────────────────────────────────
const Reports = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('daily')}
          >
            📅 تقرير يومي
          </button>
          <button
            className={activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('monthly')}
          >
            📊 تقرير شهري
          </button>
        </div>
        <h1>التقارير</h1>
      </div>

      {activeTab === 'daily'   && <DailyReportPanel />}
      {activeTab === 'monthly' && <MonthlyReportPanel />}
    </div>
  );
};

export default Reports;
