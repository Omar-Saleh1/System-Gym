'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '../../lib/axios';
import CameraQRScanner from '../../components/CameraQRScanner';
import ConfirmModal from '../../components/ConfirmModal';
import SingleVisitModal from '../../components/SingleVisitModal';
import { SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';

const Attendance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [singleVisits, setSingleVisits] = useState<any[]>([]);
  const [showSingleVisitModal, setShowSingleVisitModal] = useState(false);
  const [deleteVisitTarget, setDeleteVisitTarget] = useState<{ id: string; name: string } | null>(null);

  const [selectedMember, setSelectedMember] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitSearchQuery, setVisitSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [scanValue, setScanValue] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanFocused, setIsScanFocused] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const focusScanInput = () => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [recRes, memRes, visitRes] = await Promise.all([
        api.get('/attendance', { params: { date: today } }),
        api.get('/members'),
        api.get('/single-visits', { params: { date: 'today' } }).catch(() => ({ data: { data: [] } })),
      ]);
      setRecords(recRes.data || []);
      setMembers((memRes.data || []).filter((m: any) => m.active));
      setSingleVisits(visitRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setRecords([]);
      setMembers([]);
      setSingleVisits([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keep scan input always focused — scanner acts as keyboard
  useEffect(() => {
    focusScanInput();
    const handleWindowClick = (e: any) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' && e.target !== scanInputRef.current) return;
      if (tag === 'SELECT' || tag === 'BUTTON') return;
      focusScanInput();
    };
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleManualCheckin = async () => {
    if (!selectedMember) return;
    try {
      await api.post('/attendance/checkin', { memberId: selectedMember });
      setMessage('✅ تم تسجيل الحضور بنجاح');
      setSelectedMember('');
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || '❌ فشل تسجيل الحضور');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const confirmDeleteAttendance = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/attendance/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل حذف سجل الحضور');
    }
  };

  const confirmDeleteSingleVisit = async () => {
    if (!deleteVisitTarget) return;
    try {
      await api.delete(`/single-visits/${deleteVisitTarget.id}`);
      setDeleteVisitTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل حذف سجل الحصة الفردية');
    }
  };

  const handleCheckout = async (memberId: string) => {
    await api.put(`/attendance/checkout/${memberId}`);
    loadData();
  };

  const handleScanSubmit = async (e: any) => {
    e.preventDefault();
    const code = scanValue.trim();
    setScanValue('');
    if (!code) return;

    try {
      const { data } = await api.post('/attendance/scan', { qrToken: code });
      setScanResult({
        type: 'checkin',
        text: `✅ ${data.member?.name || data.member}\nChecked In Successfully\n${new Date(data.attendance?.checkIn || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || '❌ Invalid QR Code';
      if (msg.includes('⚠️') || msg.includes('Already Checked In') || msg.includes('مسجل')) {
        setScanResult({ type: 'checkout', text: msg });
      } else {
        setScanResult({ type: 'error', text: msg });
      }
    }
    setTimeout(() => setScanResult(null), 5000);
  };

  const handleCameraScan = async (decodedText: string) => {
    setShowCamera(false);
    const code = decodedText.trim();
    if (!code) return;
    try {
      const { data } = await api.post('/attendance/scan', { qrToken: code });
      setScanResult({
        type: 'checkin',
        text: `✅ ${data.member.name}\nChecked In Successfully\n${new Date(data.member.checkInTime || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || '❌ Invalid QR Code';
      setScanResult({ type: msg.includes('⚠️') ? 'checkout' : 'error', text: msg });
    }
    setTimeout(() => setScanResult(null), 5000);
  };

  const filteredRecords = records.filter(r =>
    r.member?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVisits = singleVisits.filter(v =>
    v.name?.toLowerCase().includes(visitSearchQuery.toLowerCase()) ||
    (v.phone && v.phone.includes(visitSearchQuery))
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const totalVisitRevenue = singleVisits.reduce((acc, v) => acc + (v.amount || 0), 0);

  return (
    <div className="page">
      {showCamera && (
        <CameraQRScanner
          onScan={handleCameraScan}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Header with Quick Single Visit Action */}
      <div className="page-header">
        <div>
          <button
            onClick={() => setShowSingleVisitModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              padding: '11px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              fontSize: '14px',
            }}
          >
            <SparklesIcon style={{ width: '20px', height: '20px' }} />
            ➕ حصة فردية (Single Visit)
          </button>
        </div>
        <div>
          <h1>الحضور والانصراف (Attendance)</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
            مسح QR للأعضاء المشتركين وتسجيل الحصص الفردية للزوار.
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{records.length}</div>
          <div className="stat-label">حضور الأعضاء اليوم</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {records.filter(r => r.member?.membershipStatus === 'Active').length}
          </div>
          <div className="stat-label">أعضاء نشطين حاضرين</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {singleVisits.length}
          </div>
          <div className="stat-label">حصص فردية اليوم ({totalVisitRevenue} ج.م)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {records.filter(r => r.member && r.member.membershipStatus !== 'Active').length}
          </div>
          <div className="stat-label">عضويات منتهية/مجمدة</div>
        </div>
      </div>

      {/* Grid: QR Scanner + Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
        {/* Attendance Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>📋 سجل حضور الأعضاء المشتركين اليوم ({filteredRecords.length})</span>
            <input 
              type="text" 
              placeholder="🔍 ابحث في حضور الأعضاء..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '220px', marginBottom: 0, padding: '8px 12px' }}
            />
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>العضو</th>
                  <th>حالة العضوية</th>
                  <th>وقت الدخول</th>
                  <th>وقت الخروج</th>
                  <th style={{ textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 'bold' }}>{r.member?.name || 'عضو محذوف'}</td>
                    <td>
                      <span className={'badge ' + (
                        r.member?.membershipStatus === 'Active' ? 'badge-success' :
                        r.member?.membershipStatus === 'Frozen' ? 'badge-warning' : 'badge-danger'
                      )}>
                        {r.member?.membershipStatus === 'Active' ? 'نشط / Active' :
                         r.member?.membershipStatus === 'Frozen' ? 'مجمد / Frozen' : 'منتهي / Expired'}
                      </span>
                    </td>
                    <td>{formatTime(r.checkInTime)}</td>
                    <td>{formatTime(r.checkOutTime)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        {!r.checkOutTime && r.member && (
                          <button className="btn-small" onClick={() => handleCheckout(r.member._id)}>تسجيل انصراف</button>
                        )}
                        <button
                          className="btn-small btn-danger"
                          onClick={() => setDeleteTarget({ id: r._id, name: r.member?.name || 'العضو' })}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {searchQuery ? 'لا توجد نتائج بحث مطابقة' : 'لا يوجد حضور للأعضاء المشتركين مسجل اليوم بعد'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Scanner & Manual checkin */}
        <div>
          <div className="scan-box" style={{ marginBottom: '20px' }}>
            {/* Camera button */}
            <button
              onClick={() => setShowCamera(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                color: '#fff',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              📷 مسح بكاميرا الموبايل / اللابتوب
            </button>

            <div
              className={`scan-area ${isScanFocused ? 'active' : ''}`}
              onClick={focusScanInput}
              style={{ cursor: 'pointer' }}
            >
              <div className="scan-icon">⚡</div>
              <div className="scan-label" style={{ fontWeight: 'bold' }}>
                {isScanFocused ? 'جاهز للمسح من القارئ...' : 'اضغط لتفعيل القارئ السلكي'}
              </div>
              <form onSubmit={handleScanSubmit} style={{ margin: 0 }}>
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  onFocus={() => setIsScanFocused(true)}
                  onBlur={() => setIsScanFocused(false)}
                  placeholder={isScanFocused ? '⚡ جاهز... سكن الـ QR' : 'اضغط هنا أولاً'}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'center',
                    width: '220px',
                    fontSize: '14px',
                    color: 'var(--primary)',
                    marginBottom: 0,
                    outline: 'none',
                  }}
                />
              </form>
              {!isScanFocused && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  👆 اضغط على هذه المنطقة لتفعيل السكان
                </div>
              )}
            </div>
            {scanResult && <div className={`scan-result ${scanResult.type}`}>{scanResult.text}</div>}
          </div>

          {/* Manual check-in */}
          <div className="form-card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'right' }}>أو اختر العضو يدوياً</div>
            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">اختر عضو</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name} {m.phone ? `(${m.phone})` : ''}</option>)}
            </select>
            <button onClick={handleManualCheckin} style={{ width: '100%' }}>تسجيل حضور</button>
            {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
          </div>
        </div>
      </div>

      {/* ─── Today's Single Visits Section ─── */}
      <div style={{ marginTop: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <SparklesIcon style={{ width: '22px', height: '22px' }} />
              زيارات الحصة الواحدة اليوم — Day Passes ({singleVisits.length})
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              إجمالي إيراد الحصص الفردية اليوم: <strong style={{ color: '#22c55e' }}>{totalVisitRevenue} ج.م</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="🔍 ابحث بالاسم أو التليفون..." 
              value={visitSearchQuery}
              onChange={(e) => setVisitSearchQuery(e.target.value)}
              style={{ width: '220px', marginBottom: 0, padding: '8px 12px' }}
            />
            <button
              onClick={() => setShowSingleVisitModal(true)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + إضافة حصة فردية
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم الزائر / اللاعب</th>
                <th>نوع / اسم الحصة</th>
                <th>الموبايل</th>
                <th>المبلغ المدفوع</th>
                <th>طريقة الدفع</th>
                <th>الشفت</th>
                <th>وقت الزيارة</th>
                <th>الكاشير</th>
                <th style={{ textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((v) => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 'bold', color: '#fff' }}>{v.name}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold' }}>
                      {v.sessionName || 'حصة عامة'}
                    </span>
                  </td>
                  <td>{v.phone || <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>بدون رقم</span>}</td>
                  <td><strong style={{ color: '#22c55e' }}>{v.amount} ج.م</strong></td>
                  <td>
                    <span className="badge badge-secondary">
                      {v.paymentMethod === 'CASH' ? '💵 كاش' : v.paymentMethod === 'CARD' ? '💳 بطاقة' : v.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{
                      color: v.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6',
                      background: v.shiftType === 'GIRLS' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)',
                      borderColor: v.shiftType === 'GIRLS' ? '#fbcfe8' : '#bfdbfe'
                    }}>
                      {v.shiftType === 'GIRLS' ? '🌸 بنات' : '🏋️‍♂️ شباب'}
                    </span>
                  </td>
                  <td>{formatTime(v.visitedAt || v.createdAt)}</td>
                  <td>{v.createdBy?.name || 'الكاشير'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => setDeleteVisitTarget({ id: v._id, name: `${v.name} (${v.sessionName || 'حصة'})` })}
                    >
                      <TrashIcon style={{ width: '14px', height: '14px', display: 'inline', marginLeft: '4px' }} />
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                    {visitSearchQuery ? 'لا توجد نتائج بحث مطابقة' : 'لا توجد حصص فردية مسجلة اليوم'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Member Attendance Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        type="danger"
        title="تأكيد حذف الحضور"
        message={`هل أنت متأكد من حذف سجل حضور العضو "${deleteTarget?.name || ''}" اليوم؟`}
        confirmText="نعم، احذف الحضور"
        cancelText="إلغاء"
        onConfirm={confirmDeleteAttendance}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete Single Visit Modal */}
      <ConfirmModal
        open={!!deleteVisitTarget}
        type="danger"
        title="تأكيد حذف الحصة الفردية"
        message={`هل أنت متأكد من حذف سجل الحصة الفردية لـ "${deleteVisitTarget?.name || ''}" وحذف المعاملة المالية المرتبطة بها؟`}
        confirmText="نعم، حذف الحصة والمعاملة"
        cancelText="إلغاء"
        onConfirm={confirmDeleteSingleVisit}
        onCancel={() => setDeleteVisitTarget(null)}
      />

      {/* Single Visit Modal */}
      <SingleVisitModal
        open={showSingleVisitModal}
        onClose={() => setShowSingleVisitModal(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};

export default Attendance;
