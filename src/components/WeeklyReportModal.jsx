import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { 
  X, Printer, FileText, Trophy, TrendingUp, 
  Calendar, CheckCircle2, UserCheck, ShieldCheck 
} from './Icons';

export default function WeeklyReportModal({ onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await api.getWeeklyReport();
      setReport(data);
    } catch (err) {
      console.error('Haftalık rapor çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Haftalık Rapor Oluşturuluyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base">Haftalık Yönetici & Performans Raporu</h3>
              <p className="text-xs text-slate-300">40. Hafta • Hankan Emlak Pro Ofis İçi Raporu</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 bg-white">
          
          {/* Report Cover / Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-600">ALTIN EMLAK SİVAS <span className="text-amber-500 font-bold lowercase tracking-normal">by ceylantek.com</span></span>
              <h1 className="text-2xl font-black text-slate-900">HAFTALIK FAALİYET VE CİRO RAPORU</h1>
              <p className="text-xs text-slate-500">
                Rapor Tarihi: {formatDate(report.reportDate, true)} • 50 Saha Personeli & 2 Broker
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                OFİS DURUMU: AKTİF & BÜYÜYOR
              </span>
            </div>
          </div>

          {/* Executive Summary 4-Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">Haftalık Toplam Ciro</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(report.totalCommissionEarned)}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">Kapanan İşlem</span>
              <p className="text-lg font-black text-blue-600 mt-1">
                {report.totalDeals} Adet
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">Toplam Satış Hacmi</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatCompactCurrency(report.totalSalesVolume)}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">Yeni Eklenen Portföy</span>
              <p className="text-lg font-black text-emerald-600 mt-1">
                {report.newListingsAdded} İlan
              </p>
            </div>
          </div>

          {/* Haftanın Yıldızı (Top Performer Banner) */}
          {report.topPerformer && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 p-4 rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    HAFTANIN EN YÜKSEK CİRO YAPAN DANIŞMANI
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {report.topPerformer.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {report.topPerformer.dealsCount} İşlem Kapatıldı • Hedef Gerçekleşme: %{report.topPerformer.progressPercentage}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-amber-900 font-semibold block">Kazanılan Komisyon</span>
                <span className="text-lg font-black text-amber-900">
                  {formatCurrency(report.topPerformer.commission)}
                </span>
              </div>
            </div>
          )}

          {/* Danışman Hedef Gerçekleşme Tablosu */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2">
              Saha Danışmanları Haftalık Performans Tablosu
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Danışman</th>
                    <th className="p-2.5 text-center">İşlem Adedi</th>
                    <th className="p-2.5 text-center">Yeni Portföy</th>
                    <th className="p-2.5 text-right">Gerçekleşen Ciro</th>
                    <th className="p-2.5 text-right">Haftalık Hedef</th>
                    <th className="p-2.5 text-center">Hedef %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.agentBreakdown.slice(0, 15).map((agent, i) => (
                    <tr key={agent.agentId} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2.5 font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-4 text-slate-400 font-normal">{i + 1}.</span>
                        <span>{agent.name}</span>
                      </td>
                      <td className="p-2.5 text-center font-semibold">{agent.dealsCount}</td>
                      <td className="p-2.5 text-center text-slate-600">{agent.newListingsCount}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(agent.commission)}
                      </td>
                      <td className="p-2.5 text-right text-slate-500">
                        {formatCompactCurrency(agent.targetRevenue)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          agent.progressPercentage >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : agent.progressPercentage >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          %{agent.progressPercentage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer / Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">1. Broker Onayı</p>
              <p>Ahmet Yılmaz (Yönetici Ortak)</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">2. Broker Onayı</p>
              <p>Selin Kaya (Yönetici Ortak)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
