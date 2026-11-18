'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Wrench,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Printer,
  RefreshCw,
  Sparkles,
  Bike,
  Users,
  Boxes,
  Activity,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Search,
  Calendar,
  Percent
} from 'lucide-react';
import ExecutiveReportModal from '@/components/admin/ExecutiveReportModal';

// Formato de moneda colombiana (COP)
const formatCOP = (num) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num || 0);
};

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('month'); // 'today', 'week', 'month', '90days', 'all'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'profit' | 'cost' | 'count'
  const [activeAlertTab, setActiveAlertTab] = useState('stock'); // 'stock' | 'workshop' | 'layaways'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Estados para desglose diario interactivo y categorías
  const [expandedDays, setExpandedDays] = useState({});
  const [dailySearch, setDailySearch] = useState('');
  const [showCategoryValuation, setShowCategoryValuation] = useState(false);

  const toggleDayExpanded = (date) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Carga de estadísticas
  const fetchStats = useCallback(async (selectedTimeframe = timeframe, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/stats?timeframe=${selectedTimeframe}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data);
          setLastUpdated(new Date());
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Si falla /api/stats (ej: en entorno de desarrollo local sin Pages Functions),
      // activamos el motor de agregación cliente
      await fallbackClientAggregation(selectedTimeframe);
    } catch (err) {
      console.warn('API /api/stats no disponible, calculando en cliente:', err);
      await fallbackClientAggregation(selectedTimeframe);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
    }
  }, [timeframe]);

  // Motor de cálculo de respaldo en el navegador
  const fallbackClientAggregation = async (tf) => {
    try {
      const [salesRes, invRes, ordersRes, custRes] = await Promise.allSettled([
        fetch('/api/sales').then((r) => r.json()),
        fetch('/api/inventory').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/customers').then((r) => r.json()),
      ]);

      const salesList = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : [];
      const invList = invRes.status === 'fulfilled' && invRes.value?.data ? invRes.value.data : [];
      const ordersList = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : [];
      const custData = custRes.status === 'fulfilled' && custRes.value?.data ? custRes.value.data : [];

      // 1. Mapa de productos para costos y precios
      const productCostMap = {};
      const productPriceMap = {};
      const productNameMap = {};
      const productCategoryMap = {};
      const categoryValuationMap = {};

      let totalStock = 0;
      let costVal = 0;
      let retailVal = 0;
      const lowStock = [];
      const outOfStock = [];

      invList.forEach((p) => {
        const stk = Math.max(0, Number(p.stock || 0));
        const cst = Number(p.cost || 0);
        const prc = Number(p.price || 0);
        const minL = Number(p.min_stock_limit || 10);
        const cat = p.category || 'General';

        if (p.sku) {
          productCostMap[p.sku] = cst;
          productPriceMap[p.sku] = prc;
          productNameMap[p.sku] = p.name;
          productCategoryMap[p.sku] = cat;
        }
        if (p.id) {
          productCostMap[p.id] = cst;
          productPriceMap[p.id] = prc;
          productNameMap[p.id] = p.name;
          productCategoryMap[p.id] = cat;
        }

        totalStock += stk;
        const itemCostTotal = stk * cst;
        const itemRetailTotal = stk * prc;
        costVal += itemCostTotal;
        retailVal += itemRetailTotal;

        if (!categoryValuationMap[cat]) {
          categoryValuationMap[cat] = { category: cat, units: 0, costValue: 0, retailValue: 0, potentialProfit: 0, marginPct: 0 };
        }
        categoryValuationMap[cat].units += stk;
        categoryValuationMap[cat].costValue += itemCostTotal;
        categoryValuationMap[cat].retailValue += itemRetailTotal;

        if (stk <= 0) outOfStock.push({ ...p, min_stock_limit: minL });
        else if (stk <= minL) lowStock.push({ ...p, min_stock_limit: minL });
      });

      const potentialProfit = retailVal - costVal;
      const marginPctVal = retailVal > 0 ? Number(((potentialProfit / retailVal) * 100).toFixed(1)) : 0;

      const categoryValuationList = Object.values(categoryValuationMap).map(c => ({
        ...c,
        potentialProfit: c.retailValue - c.costValue,
        marginPct: c.retailValue > 0 ? Number((((c.retailValue - c.costValue) / c.retailValue) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.retailValue - a.retailValue);

      // 2. Filtro de fechas
      const now = new Date();
      let cutoff = new Date();
      if (tf === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (tf === 'week') cutoff.setDate(now.getDate() - 7);
      else if (tf === 'month') cutoff.setDate(now.getDate() - 30);
      else if (tf === '90days') cutoff.setDate(now.getDate() - 90);
      else cutoff = new Date('2020-01-01');

      const filteredSales = salesList.filter((s) => new Date(s.created_at) >= cutoff);

      let totalSalesPeriod = 0;
      let totalCostPeriod = 0;
      const pmMap = {};
      const catMap = {};
      const prodMap = {};
      const dailyMap = {};

      filteredSales.forEach((s) => {
        const rev = Number(s.amount_paid !== undefined && s.amount_paid !== null ? s.amount_paid : s.total || 0);

        const pm = s.payment_method || 'Efectivo';
        pmMap[pm] = (pmMap[pm] || { count: 0, total: 0 });
        pmMap[pm].count += 1;
        pmMap[pm].total += rev;

        const dayKey = s.created_at ? s.created_at.slice(0, 10) : 'Hoy';
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = {
            date: dayKey,
            totalSales: 0,
            totalCost: 0,
            profit: 0,
            marginPct: 0,
            transactionsCount: 0,
            itemsCount: 0,
            itemsList: []
          };
        }
        dailyMap[dayKey].transactionsCount += 1;

        let saleCostCalculated = 0;
        let saleRevenueFromItems = 0;
        let hasItems = false;

        try {
          const items = typeof s.items === 'string' ? JSON.parse(s.items || '[]') : s.items || [];
          if (Array.isArray(items) && items.length > 0) {
            hasItems = true;
            items.forEach((it) => {
              const qty = Number(it.quantity || 1);
              const pr = Number(it.price !== undefined ? it.price : (productPriceMap[it.sku] ?? 0));
              const cst = Number(it.cost !== undefined && it.cost !== null ? it.cost : (productCostMap[it.sku] ?? productCostMap[it.id] ?? 0));
              const itemRev = pr * qty;
              const itemCst = cst * qty;
              const itemProf = itemRev - itemCst;
              const cat = it.category || productCategoryMap[it.sku] || 'General';

              saleRevenueFromItems += itemRev;
              saleCostCalculated += itemCst;

              dailyMap[dayKey].itemsCount += qty;
              dailyMap[dayKey].itemsList.push({
                name: it.name || productNameMap[it.sku] || 'Artículo',
                sku: it.sku || '',
                quantity: qty,
                price: pr,
                cost: cst,
                totalRevenue: itemRev,
                totalCost: itemCst,
                profit: itemProf,
                marginPct: itemRev > 0 ? Number(((itemProf / itemRev) * 100).toFixed(1)) : 0
              });

              catMap[cat] = (catMap[cat] || 0) + itemRev;

              const pKey = it.sku || it.name;
              if (!prodMap[pKey]) {
                prodMap[pKey] = { sku: it.sku, name: it.name, category: cat, unitsSold: 0, totalRevenue: 0 };
              }
              prodMap[pKey].unitsSold += qty;
              prodMap[pKey].totalRevenue += itemRev;
            });
          }
        } catch (e) {}

        const finalSaleRev = hasItems && saleRevenueFromItems > 0 ? saleRevenueFromItems : rev;
        const finalSaleCst = hasItems ? saleCostCalculated : Math.round(finalSaleRev * 0.7);

        dailyMap[dayKey].totalSales += finalSaleRev;
        dailyMap[dayKey].totalCost += finalSaleCst;
        dailyMap[dayKey].profit += (finalSaleRev - finalSaleCst);

        totalSalesPeriod += finalSaleRev;
        totalCostPeriod += finalSaleCst;
      });

      const dailySalesList = Object.values(dailyMap).map(d => ({
        ...d,
        marginPct: d.totalSales > 0 ? Number(((d.profit / d.totalSales) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.date.localeCompare(a.date));

      const periodProfit = totalSalesPeriod - totalCostPeriod;
      const periodMarginPct = totalSalesPeriod > 0 ? Number(((periodProfit / totalSalesPeriod) * 100).toFixed(1)) : 0;

      // Taller
      const workshopStatus = { recibida: 0, en_proceso: 0, lista: 0, entregada: 0 };
      const workshopPriority = { urgente: 0, normal: 0, rutina: 0 };
      let activeWorkshop = 0;
      let pendingWorkshopRev = 0;

      ordersList.forEach((o) => {
        if (workshopStatus[o.status] !== undefined) workshopStatus[o.status]++;
        if (workshopPriority[o.priority] !== undefined) workshopPriority[o.priority]++;
        if (o.status !== 'entregada') {
          activeWorkshop++;
          pendingWorkshopRev += Number(o.estimated_price || 0);
        }
      });

      const pendingLayaways = salesList.filter((s) => s.status === 'layaway' && Number(s.amount_paid) < Number(s.total));
      const totalPendingLayaway = pendingLayaways.reduce((acc, curr) => acc + (Number(curr.total) - Number(curr.amount_paid)), 0);

      const topProds = Object.values(prodMap)
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);

      setStats({
        success: true,
        timeframe: tf,
        inventoryValuation: {
          totalCostValue: costVal,
          totalRetailValue: retailVal,
          totalPotentialProfit: potentialProfit,
          marginPct: marginPctVal,
          totalUnits: totalStock,
          totalReferences: invList.length,
          categories: categoryValuationList
        },
        periodFinancials: {
          totalSales: totalSalesPeriod,
          totalCost: totalCostPeriod,
          totalProfit: periodProfit,
          marginPct: periodMarginPct,
          salesCount: filteredSales.length,
          avgTicket: filteredSales.length > 0 ? Math.round(totalSalesPeriod / filteredSales.length) : 0
        },
        dailySales: dailySalesList,
        kpis: {
          totalRevenue: totalSalesPeriod,
          totalCost: totalCostPeriod,
          totalProfit: periodProfit,
          profitMarginPct: periodMarginPct,
          revenueGrowth: 15.4,
          totalSalesCount: filteredSales.length,
          avgTicket: filteredSales.length > 0 ? Math.round(totalSalesPeriod / filteredSales.length) : 0,
          activeWorkshopCount: activeWorkshop,
          pendingWorkshopRevenue: pendingWorkshopRev,
          totalStockUnits: totalStock,
          inventoryCostValue: costVal,
          inventoryRetailValue: retailVal,
          potentialGrossProfit: potentialProfit,
          inventoryMarginPct: marginPctVal,
          totalPendingLayaway,
          pendingLayawaysCount: pendingLayaways.length,
          lowStockCount: lowStock.length,
          outOfStockCount: outOfStock.length,
          totalProductsCount: invList.length,
          totalCustomers: custData.length || 0,
        },
        charts: {
          timeline: Object.values(dailyMap).map(d => ({
            date: d.date,
            total: d.totalSales,
            cost: d.totalCost,
            profit: d.profit,
            count: d.transactionsCount
          })).sort((a, b) => a.date.localeCompare(b.date)),
          paymentMethods: Object.entries(pmMap).map(([method, data]) => ({ method, count: data.count, total: data.total })),
          categorySales: Object.entries(catMap).map(([category, total]) => ({ category, total })),
          categoryInventory: categoryValuationList.map(c => ({ category: c.category, count: c.units })),
          workshopStatus,
          workshopPriority,
        },
        alerts: {
          lowStock: lowStock.slice(0, 8),
          outOfStock: outOfStock.slice(0, 8),
          urgentOrders: ordersList.filter((o) => o.priority === 'urgente' || o.status === 'recibida').slice(0, 8),
          pendingLayaways: pendingLayaways.slice(0, 8),
        },
        topProducts: topProds,
      });
    } catch (err) {
      console.error('Error in fallbackClientAggregation:', err);
    }
  };

  useEffect(() => {
    fetchStats(timeframe);
  }, [timeframe, fetchStats]);

  const timeframeLabels = {
    today: 'Hoy',
    week: 'Últimos 7 Días',
    month: 'Este Mes (30 Días)',
    '90days': 'Últimos 90 Días',
    all: 'Histórico Completo',
  };

  const kpis = stats?.kpis || {};
  const inventoryValuation = stats?.inventoryValuation || {};
  const periodFinancials = stats?.periodFinancials || {};
  const dailySales = stats?.dailySales || [];
  const charts = stats?.charts || {};
  const alerts = stats?.alerts || {};
  const topProducts = stats?.topProducts || [];

  // Filtrado de ventas diarias por búsqueda
  const filteredDailySales = useMemo(() => {
    if (!dailySearch.trim()) return dailySales;
    const term = dailySearch.toLowerCase().trim();
    return dailySales.filter(d => 
      d.date.includes(term) ||
      (d.itemsList && d.itemsList.some(it => it.name.toLowerCase().includes(term) || it.sku.toLowerCase().includes(term)))
    );
  }, [dailySales, dailySearch]);

  // Cálculos para Gráfico SVG de Tendencia
  const timelineData = useMemo(() => {
    const list = charts.timeline || [];
    if (list.length === 0) return [];
    return list;
  }, [charts.timeline]);

  const svgChart = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;

    const width = 720;
    const height = 240;
    const padding = { top: 25, right: 30, bottom: 35, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const getVal = (d) => {
      if (chartMetric === 'revenue') return d.total;
      if (chartMetric === 'profit') return d.profit;
      if (chartMetric === 'cost') return d.cost;
      return d.count;
    };

    const values = timelineData.map(getVal);
    const maxValue = Math.max(...values, chartMetric === 'count' ? 5 : 100000);
    const minValue = 0;

    const points = timelineData.map((d, index) => {
      const x = padding.left + (timelineData.length === 1 ? chartW / 2 : (index / (timelineData.length - 1)) * chartW);
      const val = getVal(d);
      const y = padding.top + chartH - ((val - minValue) / (maxValue - minValue)) * chartH;
      return { 
        x, 
        y, 
        val, 
        date: d.date, 
        count: d.count, 
        total: d.total, 
        profit: d.profit, 
        cost: d.cost,
        marginPct: d.total > 0 ? Number(((d.profit / d.total) * 100).toFixed(1)) : 0
      };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaD = `${pathD} L ${lastPt.x} ${padding.top + chartH} L ${firstPt.x} ${padding.top + chartH} Z`;

    const gridLines = [0, 0.33, 0.66, 1].map((ratio) => {
      const y = padding.top + chartH - ratio * chartH;
      const labelVal = minValue + ratio * (maxValue - minValue);
      const formatted = chartMetric === 'count' ? Math.round(labelVal) : formatCOP(labelVal);
      return { y, formatted };
    });

    const lineColor = chartMetric === 'profit' ? '#16a34a' : (chartMetric === 'cost' ? '#ea580c' : '#005BBE');

    return { width, height, padding, points, pathD, areaD, gridLines, chartW, chartH, lineColor };
  }, [timelineData, chartMetric]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', color: '#0f172a' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER EJECUTIVO & CONTROLES
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              Dashboard Ejecutivo
            </h1>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Activity size={13} /> EN TIEMPO REAL
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            Valuación de inventario a costo y venta, utilidad real y análisis financiero de ventas diarias.
          </p>
        </div>

        {/* Filtro de Tiempo y Acciones Rápidas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: '7 Días' },
              { id: 'month', label: 'Este Mes' },
              { id: '90days', label: '90 Días' },
              { id: 'all', label: 'Histórico' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: timeframe === t.id ? '#005BBE' : 'transparent',
                  color: timeframe === t.id ? '#ffffff' : '#475569',
                  fontWeight: timeframe === t.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(timeframe, true)}
            title="Refrescar métricas"
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              backgroundColor: '#005BBE',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 91, 190, 0.3)',
            }}
          >
            <Printer size={16} /> Reporte Ejecutivo
          </button>
        </div>
      </div>

      {loading && !refreshing ? (
        <div
          style={{
            minHeight: '350px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #005BBE',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: '#64748b', fontSize: '0.92rem', fontWeight: 500 }}>
            Calculando balance a costo real, precio de venta y utilidad de Bike King...
          </p>
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────────
              2. SECCIÓN DESTACADA: VALUACIÓN Y UTILIDAD TOTAL DEL INVENTARIO
          ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              border: '2px solid #e0f2fe',
              boxShadow: '0 4px 14px rgba(0, 91, 190, 0.05)',
              marginBottom: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #005BBE, #38bdf8, #10b981)',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Boxes size={22} color="#005BBE" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Valuación Financiera del Inventario en Bodega
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  Balance patrimonial de mercancía física: Inversión en costo real vs. Proyección de recaudo y utilidad total si se vendiera todo.
                </p>
              </div>

              <button
                onClick={() => setShowCategoryValuation(!showCategoryValuation)}
                style={{
                  backgroundColor: showCategoryValuation ? '#f1f5f9' : '#eff6ff',
                  color: '#005BBE',
                  border: '1px solid #bfdbfe',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Layers size={14} />
                {showCategoryValuation ? 'Ocultar desglose por categoría' : 'Ver desglose por categorías'}
                {showCategoryValuation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Las 3 Grandes Cifras de Valuación */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
              }}
            >
              {/* Tarjeta 1: Total a Costo Real */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Total a Costo Real
                  </span>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    INVERSIÓN PURA
                  </span>
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                  {formatCOP(inventoryValuation.totalCostValue ?? kpis.inventoryCostValue)}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Capital neto invertido en las <strong>{inventoryValuation.totalUnits ?? kpis.totalStockUnits ?? 0} unidades</strong> en stock ({inventoryValuation.totalReferences ?? kpis.totalProductsCount ?? 0} referencias).
                </p>
              </div>

              {/* Tarjeta 2: Total a Costo de Venta (PVP) */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                    Total a Costo de Venta (PVP)
                  </span>
                  <span style={{ backgroundColor: '#dbeafe', color: '#005BBE', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    VENTA POTENCIAL
                  </span>
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#005BBE', margin: '4px 0 8px' }}>
                  {formatCOP(inventoryValuation.totalRetailValue ?? kpis.inventoryRetailValue)}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#1d4ed8' }}>
                  Dinero total que ingresaría a Bike King si se vendiera todo el inventario al precio actual.
                </p>
              </div>

              {/* Tarjeta 3: Utilidad Real si vendiera todo */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                    Utilidad Real si Vendiera Todo
                  </span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    GANANCIA NETA POTENCIAL
                  </span>
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#16a34a', margin: '4px 0 8px' }}>
                  {formatCOP(inventoryValuation.totalPotentialProfit ?? kpis.potentialGrossProfit)}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Diferencia directa (PVP - Costo)</span>
                  <span style={{ backgroundColor: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}>
                    {inventoryValuation.marginPct ?? kpis.inventoryMarginPct ?? 0}% Margen Real
                  </span>
                </div>
              </div>
            </div>

            {/* Desglose Opcional de Valuación por Categorías */}
            {showCategoryValuation && inventoryValuation.categories && inventoryValuation.categories.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 12px', color: '#334155' }}>
                  Distribución Financiera por Línea / Categoría en Bodega:
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px' }}>Categoría</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unidades</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Costo Real</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Venta (PVP)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Utilidad Potencial</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Margen %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryValuation.categories.map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{c.category}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>{c.units} unid.</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>{formatCOP(c.costValue)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#005BBE' }}>{formatCOP(c.retailValue)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{formatCOP(c.potentialProfit)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{c.marginPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. SECCIÓN DESTACADA: VENTAS DIARIAS CON VENTA, COSTO Y UTILIDAD REAL
          ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              marginBottom: '28px',
            }}
          >
            {/* Encabezado y Barra Resumen del Periodo */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={22} color="#005BBE" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Registro de Ventas Diarias (Venta vs. Costo vs. Utilidad Real)
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  Seguimiento detallado día a día de lo recaudado, el costo exacto de los artículos entregados y la ganancia real ganada.
                </p>
              </div>

              {/* Buscador de Fecha o Producto dentro de las ventas diarias */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Buscar día (AAAA-MM-DD) o artículo..."
                  value={dailySearch}
                  onChange={(e) => setDailySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Barra Consolidada de Finanzas del Periodo */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  Total Ventas ({timeframeLabels[timeframe]})
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#005BBE' }}>
                  {formatCOP(periodFinancials.totalSales ?? kpis.totalRevenue)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  {periodFinancials.salesCount ?? kpis.totalSalesCount ?? 0} transacciones realizadas
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  Costo Real de lo Vendido
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#475569' }}>
                  {formatCOP(periodFinancials.totalCost ?? kpis.totalCost)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  Costo base de los artículos despachados
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'block' }}>
                  Utilidad Real Generada
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
                  {formatCOP(periodFinancials.totalProfit ?? kpis.totalProfit)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, display: 'block' }}>
                  Ganancia neta sobre ventas
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, display: 'block' }}>
                  Retiros de Caja Registrados
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>
                  -{formatCOP(periodFinancials.totalWithdrawals ?? kpis.totalCashWithdrawals ?? 0)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  Egresos de caja en {timeframeLabels[timeframe]}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#005BBE', fontWeight: 700, display: 'block' }}>
                  Margen Real del Periodo
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#005BBE' }}>
                  {periodFinancials.marginPct ?? kpis.profitMarginPct ?? 0}%
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  Ticket prom: {formatCOP(periodFinancials.avgTicket ?? kpis.avgTicket)}
                </span>
              </div>
            </div>

            {/* Tabla de Registro Diario */}
            {filteredDailySales && filteredDailySales.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px' }}>Fecha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Pedidos</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Artículos</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Venta Total (PVP)</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Costo Real</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Utilidad Real</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Margen %</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Retiros Caja</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailySales.map((day, idx) => {
                      const isExpanded = !!expandedDays[day.date];

                      return (
                        <div key={idx} style={{ display: 'contents' }}>
                          <tr
                            style={{
                              borderBottom: '1px solid #e2e8f0',
                              backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
                              transition: 'background-color 0.15s',
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                              📅 {day.date}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                              {day.transactionsCount}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                              {day.itemsCount} unid.
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#005BBE', fontSize: '0.95rem' }}>
                              {formatCOP(day.totalSales)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>
                              {formatCOP(day.totalCost)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>
                              +{formatCOP(day.profit)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span
                                style={{
                                  backgroundColor: day.marginPct >= 30 ? '#dcfce7' : '#fef3c7',
                                  color: day.marginPct >= 30 ? '#15803d' : '#b45309',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  fontSize: '0.78rem',
                                }}
                              >
                                {day.marginPct}%
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: day.withdrawals > 0 ? 800 : 400, color: day.withdrawals > 0 ? '#dc2626' : '#94a3b8' }}>
                              {day.withdrawals > 0 ? `-${formatCOP(day.withdrawals)}` : '$0'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => toggleDayExpanded(day.date)}
                                style={{
                                  backgroundColor: isExpanded ? '#005BBE' : '#f1f5f9',
                                  color: isExpanded ? '#ffffff' : '#334155',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {isExpanded ? 'Ocultar' : 'Ver Artículos'}
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            </td>
                          </tr>

                          {/* Sub-tabla Desplegable con los Artículos Vendidos Ese Día */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} style={{ padding: '0', backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                <div style={{ padding: '14px 20px', borderLeft: '4px solid #005BBE' }}>
                                  <h5 style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                                    Artículos Despachados el {day.date}:
                                  </h5>

                                  {day.itemsList && day.itemsList.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                      <thead>
                                        <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                          <th style={{ padding: '6px 8px' }}>Producto</th>
                                          <th style={{ padding: '6px 8px' }}>SKU</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cant.</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>P. Venta Unit.</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Costo Real Unit.</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Venta Total</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Costo Total</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Utilidad Ganada</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'center' }}>Margen</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {day.itemsList.map((item, itemIdx) => (
                                          <tr key={itemIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                                            <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#64748b' }}>{item.sku || '-'}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCOP(item.price)}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b' }}>{formatCOP(item.cost)}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#005BBE' }}>{formatCOP(item.totalRevenue)}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b' }}>{formatCOP(item.totalCost)}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>+{formatCOP(item.profit)}</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{item.marginPct}%</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                      Venta global registrada directamente en caja.
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </div>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '35px', color: '#94a3b8' }}>
                <TrendingUp size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No se encontraron registros de ventas en las fechas seleccionadas ({timeframeLabels[timeframe]}).
                </p>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. GRÁFICOS ANALÍTICOS PRINCIPALES (CON ALTERNADOR DE COSTO Y UTILIDAD)
          ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.1fr)',
              gap: '24px',
              marginBottom: '28px',
            }}
          >
            {/* GRÁFICO: Evolución Temporal */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                    Tendencia Temporal del Negocio
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Visualiza la curva diaria de ventas, costo de lo vendido o utilidad neta
                  </p>
                </div>

                {/* Alternador de 4 Métricas */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    padding: '3px',
                    borderRadius: '8px',
                  }}
                >
                  <button
                    onClick={() => setChartMetric('revenue')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'revenue' ? '#ffffff' : 'transparent',
                      color: chartMetric === 'revenue' ? '#005BBE' : '#64748b',
                      fontWeight: chartMetric === 'revenue' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: chartMetric === 'revenue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Ventas ($)
                  </button>
                  <button
                    onClick={() => setChartMetric('profit')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'profit' ? '#ffffff' : 'transparent',
                      color: chartMetric === 'profit' ? '#16a34a' : '#64748b',
                      fontWeight: chartMetric === 'profit' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: chartMetric === 'profit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Utilidad Real ($)
                  </button>
                  <button
                    onClick={() => setChartMetric('cost')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'cost' ? '#ffffff' : 'transparent',
                      color: chartMetric === 'cost' ? '#ea580c' : '#64748b',
                      fontWeight: chartMetric === 'cost' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: chartMetric === 'cost' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Costo Real ($)
                  </button>
                  <button
                    onClick={() => setChartMetric('count')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'count' ? '#ffffff' : 'transparent',
                      color: chartMetric === 'count' ? '#0f172a' : '#64748b',
                      fontWeight: chartMetric === 'count' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: chartMetric === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Pedidos (#)
                  </button>
                </div>
              </div>

              {/* SVG Interactivo */}
              {svgChart && svgChart.points.length > 0 ? (
                <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                  <svg
                    viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
                    style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={svgChart.lineColor} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={svgChart.lineColor} stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Guías Horizontales */}
                    {svgChart.gridLines.map((gl, i) => (
                      <g key={i}>
                        <line
                          x1={svgChart.padding.left}
                          y1={gl.y}
                          x2={svgChart.width - svgChart.padding.right}
                          y2={gl.y}
                          stroke="#f1f5f9"
                          strokeWidth="1.5"
                          strokeDasharray={i === 0 ? 'none' : '4 4'}
                        />
                        <text
                          x={svgChart.padding.left - 10}
                          y={gl.y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#94a3b8"
                          fontWeight="500"
                        >
                          {gl.formatted}
                        </text>
                      </g>
                    ))}

                    <path d={svgChart.areaD} fill="url(#chartGradient)" />

                    <path
                      d={svgChart.pathD}
                      fill="none"
                      stroke={svgChart.lineColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {svgChart.points.map((pt, i) => {
                      const isHovered = hoveredPoint && hoveredPoint.date === pt.date;
                      return (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : 4}
                            fill="#ffffff"
                            stroke={svgChart.lineColor}
                            strokeWidth={isHovered ? 3 : 2}
                            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {(i === 0 || i === svgChart.points.length - 1 || i % Math.ceil(svgChart.points.length / 5) === 0) && (
                            <text
                              x={pt.x}
                              y={svgChart.height - 10}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748b"
                              fontWeight="500"
                            >
                              {pt.date.slice(5)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip Detallado */}
                  {hoveredPoint && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(hoveredPoint.x / svgChart.width) * 100}%`,
                        top: `${(hoveredPoint.y / svgChart.height) * 100}%`,
                        transform: 'translate(-50%, -125%)',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        pointerEvents: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#38bdf8' }}>
                        📅 {hoveredPoint.date}
                      </div>
                      <div>Venta: <strong>{formatCOP(hoveredPoint.total)}</strong></div>
                      <div style={{ color: '#cbd5e1' }}>Costo Real: <strong>{formatCOP(hoveredPoint.cost)}</strong></div>
                      <div style={{ color: '#4ade80' }}>Utilidad Real: <strong>+{formatCOP(hoveredPoint.profit)}</strong> ({hoveredPoint.marginPct}%)</div>
                      <div style={{ color: '#94a3b8' }}>Pedidos: <strong>{hoveredPoint.count}</strong></div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Sin datos temporales en este rango.
                </div>
              )}
            </div>

            {/* Ventas por Categoría de Producto */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                Ventas por Categoría
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748b' }}>
                Distribución de facturación por línea de producto
              </p>

              {charts.categorySales && charts.categorySales.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
                  {(() => {
                    const totalCatSales = charts.categorySales.reduce((acc, curr) => acc + curr.total, 0) || 1;
                    const colors = ['#005BBE', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

                    return charts.categorySales
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 6)
                      .map((cat, idx) => {
                        const pct = Math.round((cat.total / totalCatSales) * 100);
                        const color = colors[idx % colors.length];

                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.82rem' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{cat.category}</span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCOP(cat.total)}</span>
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({pct}%)</span>
                              </div>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  backgroundColor: color,
                                  borderRadius: '4px',
                                }}
                              />
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Sin ventas por categoría en este rango.
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. TOP PRODUCTOS Y ALERTAS OPERATIVAS
          ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)',
              gap: '24px',
              marginBottom: '28px',
            }}
          >
            {/* Top 5 Productos de Mayor Rotación */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                Top 5 Productos de Mayor Rotación
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
                Artículos más vendidos en {timeframeLabels[timeframe]}
              </p>

              {topProducts && topProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}°`}
                        </span>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {p.sku || '-'} • {p.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#005BBE', display: 'block' }}>
                          {formatCOP(p.totalRevenue)}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                          {p.unitsSold} unid.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  Sin datos de productos en este periodo.
                </div>
              )}
            </div>

            {/* Centro de Alertas Operativas */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="#005BBE" />
                  Alertas Operativas
                </h2>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setActiveAlertTab('stock')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeAlertTab === 'stock' ? '#ffffff' : 'transparent',
                      color: activeAlertTab === 'stock' ? '#d97706' : '#64748b',
                      fontWeight: activeAlertTab === 'stock' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Stock Crítico ({((alerts.lowStock?.length || 0) + (alerts.outOfStock?.length || 0))})
                  </button>
                  <button
                    onClick={() => setActiveAlertTab('workshop')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeAlertTab === 'workshop' ? '#ffffff' : 'transparent',
                      color: activeAlertTab === 'workshop' ? '#dc2626' : '#64748b',
                      fontWeight: activeAlertTab === 'workshop' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Taller Urgente ({alerts.urgentOrders?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveAlertTab('layaways')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeAlertTab === 'layaways' ? '#ffffff' : 'transparent',
                      color: activeAlertTab === 'layaways' ? '#005BBE' : '#64748b',
                      fontWeight: activeAlertTab === 'layaways' ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Separados ({alerts.pendingLayaways?.length || 0})
                  </button>
                </div>
              </div>

              {activeAlertTab === 'stock' && (
                <div>
                  {alerts.outOfStock?.length === 0 && alerts.lowStock?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '25px', color: '#16a34a' }}>
                      <CheckCircle2 size={30} style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Stock en óptimas condiciones.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {[...(alerts.outOfStock || []), ...(alerts.lowStock || [])].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{item.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Prov: {item.supplier_name || 'Sin asignar'}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                backgroundColor: item.stock <= 0 ? '#fee2e2' : '#fef3c7',
                                color: item.stock <= 0 ? '#b91c1c' : '#b45309',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                              }}
                            >
                              {item.stock <= 0 ? 'AGOTADO' : `${item.stock} UNID (MÍN ${item.min_stock_limit})`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeAlertTab === 'workshop' && (
                <div>
                  {alerts.urgentOrders?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '25px', color: '#16a34a' }}>
                      <CheckCircle2 size={30} style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No hay órdenes urgentes pendientes.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {alerts.urgentOrders.map((ord, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#991b1b', display: 'block' }}>
                              🔴 {ord.customer_name} - {ord.bike_brand} {ord.bike_model}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{ord.problem_description}</span>
                          </div>
                          <Link href="/admin/mecanico" style={{ color: '#005BBE', fontWeight: 700, fontSize: '0.75rem' }}>
                            Atender →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeAlertTab === 'layaways' && (
                <div>
                  {alerts.pendingLayaways?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '25px', color: '#16a34a' }}>
                      <CheckCircle2 size={30} style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Sin saldos de separados pendientes.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {alerts.pendingLayaways.map((lay, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                              {lay.customer_document || 'Cliente Mostrador'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Venta #{lay.id?.slice(0, 6)}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: '#dc2626', display: 'block' }}>
                              {formatCOP((lay.total || 0) - (lay.amount_paid || 0))}
                            </span>
                            <Link href="/admin/ventas" style={{ color: '#005BBE', fontSize: '0.72rem', fontWeight: 600 }}>
                              Abonar →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              6. ACCESOS RÁPIDOS A MÓDULOS
          ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <Link
              href="/admin/ventas"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ backgroundColor: '#eff6ff', color: '#005BBE', padding: '10px', borderRadius: '10px' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Punto de Venta (POS)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Facturación y abonos</span>
              </div>
            </Link>

            <Link
              href="/admin/mecanico"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '10px', borderRadius: '10px' }}>
                <Wrench size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Taller Especializado
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Órdenes y servicio técnico</span>
              </div>
            </Link>

            <Link
              href="/admin/inventario"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
                <Package size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Inventario & Facturas
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Costos, PVP y existencias</span>
              </div>
            </Link>

            <Link
              href="/admin/proveedores"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '10px', borderRadius: '10px' }}>
                <Layers size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Proveedores
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Marcas y condiciones</span>
              </div>
            </Link>

            <Link
              href="/admin/clientes"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ backgroundColor: '#ecfeff', color: '#0891b2', padding: '10px', borderRadius: '10px' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Base de Clientes
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fidelización y contactos</span>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* Modal de Reporte Ejecutivo Imprimible */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        stats={stats}
        timeframeLabel={timeframeLabels[timeframe]}
      />
    </div>
  );
}
