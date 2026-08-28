'use client';

import React, { useState } from 'react';
import api from '../../lib/axios';

// ─── Arabic Labels ────────────────────────────────────────────────────────────
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

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  expired: 'منتهي',
  cancelled: 'ملغي',
  frozen: 'مجمد',
};

const ARABIC_MONTHS = [
  '', 'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// ─── Mini bar chart helper ────────────────────────────────────────────────────
const DailyChart = ({ data }: { data: { day: number; income: number; expense: number }[] }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', minWidth: `${data.length * 22}px` }}>
        {data.map(d => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '18px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100px', gap: '1px' }}>
              <div
                title={`إيراد: ${d.income} ج.م`}
                style={{
                  background: 'var(--primary)',
                  height: `${Math.round((d.income / maxVal) * 90)}px`,
                  borderRadius: '2px 2px 0 0',
                  minHeight: d.income > 0 ? '4px' : '0',
                  opacity: 0.85,
                }}
              />
              <div
                title={`مصروف: ${d.expense} ج.م`}
                style={{
                  background: 'var(--danger)',
                  height: `${Math.round((d.expense / maxVal) * 90)}px`,
                  borderRadius: '0 0 2px 2px',
                  minHeight: d.expense > 0 ? '4px' : '0',
                  opacity: 0.7,
                }}
              />
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.day}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px', display: 'inline-block' }} />
          إيرادات
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px', display: 'inline-block' }} />
          مصروفات
        </span>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const Card = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="stat-card" style={{ borderColor: color }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      {sub && <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>{sub}</span>}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const Reports = () => {
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
    <div className="page">
      <div className="page-header">
        <div />
        <h1>📊 التقارير الشهرية</h1>
      </div>

      {/* ── Picker ── */}
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
            <button onClick={runReport} disabled={loading} style={{ marginBottom: '0' }}>
              {loading ? 'جاري التحميل...' : '🔍 عرض التقرير'}
            </button>
          </div>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginTop: '10px' }}>{error}</div>}
      </div>

      {report && (
        <>
          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)' }}>
              تقرير شهر {ARABIC_MONTHS[report.period.month]} {report.period.year}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {report.period.daysInMonth} يوم
            </div>
          </div>

          {/* ── Financial Summary Cards ── */}
          <div className="cards-grid" style={{ marginBottom: '24px' }}>
            <Card label="إجمالي الإيرادات" value={report.financial.totalIncome} sub="ج.م" color="var(--success)" />
            <Card label="إجمالي المصروفات" value={report.financial.totalExpense} sub="ج.م" color="var(--danger)" />
            <Card
              label="صافي الربح"
              value={report.financial.netProfit}
              sub="ج.م"
              color={report.financial.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
            />
            <Card label="أعضاء جدد" value={report.members.newCount} color="var(--primary)" />
            <Card label="اشتراكات جديدة" value={report.subscriptions.count} />
            <Card label="إجمالي الزيارات" value={report.attendance.totalVisits} />
            <Card label="زوار فريدون" value={report.attendance.uniqueVisitors} />
            <Card label="متوسط زيارات يومية" value={report.attendance.avgDailyVisits} />
          </div>

          {/* ── Daily Chart ── */}
          <div className="form-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📈 الإيرادات والمصروفات اليومية</h3>
            <DailyChart data={report.dailyChart} />
          </div>

          {/* ── Income & Expense breakdown side by side ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Income by category */}
            <div className="form-card">
              <h3 style={{ marginBottom: '14px', color: 'var(--success)' }}>💰 مصادر الإيرادات</h3>
              {Object.keys(report.incomeByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد إيرادات مسجلة</div>
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
            </div>

            {/* Expense by category */}
            <div className="form-card">
              <h3 style={{ marginBottom: '14px', color: 'var(--danger)' }}>💸 تفصيل المصروفات</h3>
              {Object.keys(report.expenseByCategory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد مصروفات مسجلة</div>
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
            </div>
          </div>

          {/* ── Top Payers + Subscription Breakdown ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Top Payers */}
            <div className="form-card">
              <h3 style={{ marginBottom: '14px' }}>🏆 أعلى 5 أعضاء دفعاً</h3>
              {report.topPayers && report.topPayers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>#</th><th>العضو</th><th>الإجمالي</th></tr></thead>
                  <tbody>
                    {(report.topPayers || []).map((p: any, i: number) => (
                      <tr key={i}>
                        <td>
                          <span style={{ fontWeight: 'bold', color: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.total.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Subscription breakdown */}
            <div className="form-card">
              <h3 style={{ marginBottom: '14px' }}>📋 حالة الاشتراكات</h3>
              <div style={{ marginBottom: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                إجمالي إيراد الاشتراكات: <strong style={{ color: 'var(--success)' }}>{report.subscriptions.revenue.toLocaleString()} ج.م</strong>
              </div>
              {Object.keys(report.subscriptions.statusBreakdown).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>لا توجد اشتراكات</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>الحالة</th><th>العدد</th></tr></thead>
                  <tbody>
                    {Object.entries(report.subscriptions.statusBreakdown as Record<string, number>).map(([status, count]) => (
                      <tr key={status}>
                        <td>
                          <span className={`badge ${status === 'active' ? 'badge-success' : status === 'expired' ? 'badge-danger' : status === 'frozen' ? 'badge-warning' : 'badge-secondary'}`}>
                            {STATUS_LABELS[status] || status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Coach Salaries ── */}
          <div className="form-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '14px' }}>👤 رواتب الكباتن</h3>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px' }}>
                إجمالي المستحق: <strong style={{ color: 'var(--warning)' }}>{report.coachSalaries.totalDue.toLocaleString()} ج.م</strong>
              </div>
              <div style={{ fontSize: '13px' }}>
                إجمالي المدفوع: <strong style={{ color: 'var(--success)' }}>{report.coachSalaries.totalPaid.toLocaleString()} ج.م</strong>
              </div>
              <div style={{ fontSize: '13px' }}>
                المتبقي: <strong style={{ color: 'var(--danger)' }}>
                  {(report.coachSalaries.totalDue - report.coachSalaries.totalPaid).toLocaleString()} ج.م
                </strong>
              </div>
            </div>
            {report.coachSalaries.list.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>لا توجد رواتب مسجلة لهذا الشهر</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الكابتن</th>
                      <th>الراتب المستحق</th>
                      <th>المدفوع</th>
                      <th>المتبقي</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.coachSalaries.list.map((cs: any) => (
                      <tr key={cs._id}>
                        <td style={{ fontWeight: 'bold' }}>{cs.coach?.name || '-'}</td>
                        <td>{cs.salaryAmount.toLocaleString()} ج.م</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{cs.paidAmount.toLocaleString()} ج.م</td>
                        <td style={{ color: cs.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                          {cs.remainingAmount.toLocaleString()} ج.م
                        </td>
                        <td>
                          <span className={`badge ${cs.status === 'PAID' ? 'badge-success' : cs.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                            {cs.status === 'PAID' ? 'مدفوع' : cs.status === 'PARTIAL' ? 'جزئي' : 'غير مدفوع'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── New Members ── */}
          {report.members.newCount > 0 && (
            <div className="form-card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '14px' }}>🆕 الأعضاء الجدد في الشهر ({report.members.newCount})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>الاسم</th><th>الهاتف</th><th>تاريخ التسجيل</th></tr>
                  </thead>
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
            </div>
          )}

          {/* ── Subscriptions List ── */}
          {report.subscriptions.list.length > 0 && (
            <div className="form-card">
              <h3 style={{ marginBottom: '14px' }}>📝 الاشتراكات المسجلة في الشهر ({report.subscriptions.count})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>العضو</th>
                      <th>الخطة</th>
                      <th>من</th>
                      <th>إلى</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subscriptions.list.map((s: any) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 'bold' }}>{(s.member as any)?.name || '-'}</td>
                        <td>{(s.plan as any)?.name || '-'}</td>
                        <td>{new Date(s.startDate).toLocaleDateString('ar-EG')}</td>
                        <td>{new Date(s.endDate).toLocaleDateString('ar-EG')}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{s.pricePaid.toLocaleString()} ج.م</td>
                        <td>
                          <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>
                            {STATUS_LABELS[s.status] || s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
