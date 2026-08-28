'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  subscription: 'اشتراكات أعضاء',
  renewal: 'تجديد اشتراكات',
  coach_salary: 'رواتب كباتن',
  rent: 'إيجار',
  equipment: 'معدات الجيم',
  electricity: 'كهرباء',
  water: 'مياه',
  maintenance: 'صيانة',
  salaries: 'رواتب عمالة',
  marketing: 'تسويق',
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
const StatCard = ({
  label, value, sub, color, emoji
}: { label: string; value: string | number; sub?: string; color?: string; emoji?: string }) => (
  <div className="stat-card" style={{ borderColor: color }}>
    {emoji && <div style={{ fontSize: '22px', marginBottom: '6px' }}>{emoji}</div>}
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      {sub && <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>{sub}</span>}
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

// ─── Daily Report Panel ───────────────────────────────────────────────────────
const DailyReportPanel = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDailyReport = async (d: string) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/reports/daily', { params: { date: d } });
      setReport(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load today's report on mount
  useEffect(() => { loadDailyReport(todayStr); }, []);

  return (
    <div>
      {/* Date Picker */}
      <div className="form-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>اختار اليوم</h3>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div>
            <label>التاريخ</label>
            <input type="date" value={date} max={todayStr} onChange={e => setDate(e.target.value)} />
          </div>
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
          </div>

          {/* Summary Cards */}
          <div className="cards-grid" style={{ marginBottom: '24px' }}>
            <StatCard label="إجمالي الإيرادات" value={report.financial.totalIncome} sub="ج.م" color="var(--success)" emoji="💰" />
            <StatCard label="إجمالي المصروفات" value={report.financial.totalExpense} sub="ج.م" color="var(--danger)" emoji="💸" />
            <StatCard
              label="صافي الربح"
              value={report.financial.netProfit}
              sub="ج.م"
              color={report.financial.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
              emoji={report.financial.netProfit >= 0 ? '📈' : '📉'}
            />
            <StatCard label="حضور اليوم" value={report.attendance.totalVisits} emoji="🏃" />
            <StatCard label="أعضاء مختلفين" value={report.attendance.uniqueVisitors} emoji="👤" />
            <StatCard label="اشتراكات جديدة" value={report.subscriptions.count} emoji="📋" />
            <StatCard label="أعضاء جدد" value={report.newMembers.count} emoji="🆕" />
            <StatCard label="مدفوعات مسجلة" value={report.settledPayments.count} emoji="✅" />
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
                      <th>العضو / الكابتن</th>
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
                        <td>{tx.memberId?.name || tx.coachId?.name || '-'}</td>
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
    </div>
  );
};

// ─── Monthly Report Panel ─────────────────────────────────────────────────────
const MonthlyReportPanel = () => {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runReport = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/reports/monthly', { params: { year, month } });
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
        <h3 style={{ marginBottom: '14px' }}>اختار الشهر والسنة</h3>
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
          <div>
            <button onClick={runReport} disabled={loading}>
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
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{report.period.daysInMonth} يوم</div>
          </div>

          {/* Summary */}
          <div className="cards-grid" style={{ marginBottom: '24px' }}>
            <StatCard label="إجمالي الإيرادات" value={report.financial.totalIncome} sub="ج.م" color="var(--success)" emoji="💰" />
            <StatCard label="إجمالي المصروفات" value={report.financial.totalExpense} sub="ج.م" color="var(--danger)" emoji="💸" />
            <StatCard label="صافي الربح" value={report.financial.netProfit} sub="ج.م"
              color={report.financial.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
              emoji={report.financial.netProfit >= 0 ? '📈' : '📉'} />
            <StatCard label="أعضاء جدد" value={report.members.newCount} emoji="🆕" />
            <StatCard label="اشتراكات جديدة" value={report.subscriptions.count} emoji="📋" />
            <StatCard label="إجمالي الزيارات" value={report.attendance.totalVisits} emoji="🏃" />
            <StatCard label="زوار فريدون" value={report.attendance.uniqueVisitors} emoji="👤" />
            <StatCard label="متوسط يومي" value={report.attendance.avgDailyVisits} emoji="📊" />
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
