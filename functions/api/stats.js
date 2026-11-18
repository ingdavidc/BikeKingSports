// ============================================================
// functions/api/stats.js
// BIKE KING - Analítica y Estadísticas Ejecutivas del Negocio
// Incluye: Valuación a Costo Real, PVP, Utilidad Proyectada
// y Desglose de Ventas Diarias con Costo, Venta y Utilidad Real
// ============================================================

export async function onRequestGet(context) {
  const role = context.data?.role;
  if (!role) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Mecánicos no tienen acceso a métricas globales financieras
  if (role === 'mecanico') {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const DB = context.env.DB;
    const url = new URL(context.request.url);
    const timeframe = url.searchParams.get('timeframe') || 'month'; // 'today', 'week', 'month', '90days', 'year', 'all'

    // 1. Determinar rangos de fechas (en UTC / ISO)
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '90days') {
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'year') {
      startDate.setDate(now.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else {
      // 'all'
      startDate = new Date('2020-01-01T00:00:00.000Z');
      prevStartDate = null;
      prevEndDate = null;
    }

    const startIso = startDate.toISOString();
    const prevStartIso = prevStartDate ? prevStartDate.toISOString() : null;
    const prevEndIso = prevEndDate ? prevEndDate.toISOString() : null;

    // 2. Consultar Productos para Valuación de Inventario y Mapa de Costos
    const inventoryQuery = await DB.prepare(`
      SELECT 
        id, sku, name, category, brand, stock, min_stock_limit, cost, price, supplier_id,
        (SELECT name FROM providers WHERE providers.id = products.supplier_id) as supplier_name
      FROM products
    `).all();

    const allProducts = inventoryQuery.results || [];
    const productCostMap = {};
    const productPriceMap = {};
    const productNameMap = {};
    const productCategoryMap = {};

    let totalStockUnits = 0;
    let inventoryCostValue = 0;      // Total a Costo Real
    let inventoryRetailValue = 0;    // Total a Precio de Venta (PVP)
    let lowStockProducts = [];
    let outOfStockProducts = [];
    let categoryValuationMap = {};

    for (const p of allProducts) {
      const stock = Math.max(0, Number(p.stock || 0));
      const cost = Number(p.cost || 0);
      const price = Number(p.price || 0);
      const minLimit = Number(p.min_stock_limit !== null && p.min_stock_limit !== undefined ? p.min_stock_limit : 10);
      const cat = p.category || 'General';

      if (p.sku) {
        productCostMap[p.sku] = cost;
        productPriceMap[p.sku] = price;
        productNameMap[p.sku] = p.name;
        productCategoryMap[p.sku] = cat;
      }
      if (p.id) {
        productCostMap[p.id] = cost;
        productPriceMap[p.id] = price;
        productNameMap[p.id] = p.name;
        productCategoryMap[p.id] = cat;
      }

      totalStockUnits += stock;
      const itemCostVal = stock * cost;
      const itemRetailVal = stock * price;
      inventoryCostValue += itemCostVal;
      inventoryRetailValue += itemRetailVal;

      if (!categoryValuationMap[cat]) {
        categoryValuationMap[cat] = {
          category: cat,
          units: 0,
          costValue: 0,
          retailValue: 0,
          potentialProfit: 0,
          marginPct: 0
        };
      }
      categoryValuationMap[cat].units += stock;
      categoryValuationMap[cat].costValue += itemCostVal;
      categoryValuationMap[cat].retailValue += itemRetailVal;

      if (stock <= 0) {
        outOfStockProducts.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: cat,
          brand: p.brand,
          stock: 0,
          min_stock_limit: minLimit,
          supplier_name: p.supplier_name || 'Sin asignar'
        });
      } else if (stock <= minLimit) {
        lowStockProducts.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: cat,
          brand: p.brand,
          stock: stock,
          min_stock_limit: minLimit,
          supplier_name: p.supplier_name || 'Sin asignar'
        });
      }
    }

    // Calcular utilidad potencial y margen del inventario total
    const potentialGrossProfit = inventoryRetailValue - inventoryCostValue;
    const inventoryMarginPct = inventoryRetailValue > 0 
      ? Number(((potentialGrossProfit / inventoryRetailValue) * 100).toFixed(1)) 
      : 0;

    // Calcular márgenes por categoría de inventario
    const categoryValuationList = Object.values(categoryValuationMap).map(cat => {
      const profit = cat.retailValue - cat.costValue;
      const margin = cat.retailValue > 0 ? Number(((profit / cat.retailValue) * 100).toFixed(1)) : 0;
      return {
        ...cat,
        potentialProfit: profit,
        marginPct: margin
      };
    }).sort((a, b) => b.retailValue - a.retailValue);

    // 3. Consultar Ventas del Periodo Actual y Anterior
    const [salesResult, prevSalesResult, layawaysResult] = await Promise.all([
      DB.prepare(`
        SELECT id, total, payment_method, status, amount_paid, items, created_at, customer_document 
        FROM sales 
        WHERE created_at >= ? 
        ORDER BY created_at ASC
      `).bind(startIso).all(),
      
      prevStartIso && prevEndIso ? DB.prepare(`
        SELECT id, total, amount_paid 
        FROM sales 
        WHERE created_at >= ? AND created_at <= ?
      `).bind(prevStartIso, prevEndIso).all() : Promise.resolve({ results: [] }),

      // Separados activos pendientes en cualquier fecha
      DB.prepare(`
        SELECT id, total, amount_paid, (total - amount_paid) as pending_balance, created_at, customer_document 
        FROM sales 
        WHERE status = 'layaway' AND amount_paid < total
        ORDER BY created_at ASC
      `).all()
    ]);

    // Retiros de caja en el periodo
    let withdrawalsResult = { results: [] };
    try {
      withdrawalsResult = await DB.prepare(`
        SELECT id, amount, reason, category, authorized_by, created_at 
        FROM cash_withdrawals 
        WHERE created_at >= ?
        ORDER BY created_at ASC
      `).bind(startIso).all();
    } catch (e) {}

    const sales = salesResult.results || [];
    const prevSales = prevSalesResult.results || [];
    const pendingLayaways = layawaysResult.results || [];
    const withdrawals = withdrawalsResult.results || [];

    // Calcular mapa de retiros diarios
    let periodTotalWithdrawals = 0;
    const dailyWithdrawalsMap = {};
    for (const w of withdrawals) {
      const wAmt = Number(w.amount || 0);
      periodTotalWithdrawals += wAmt;
      const dayKey = w.created_at ? w.created_at.slice(0, 10) : 'Sin fecha';
      dailyWithdrawalsMap[dayKey] = (dailyWithdrawalsMap[dayKey] || 0) + wAmt;
    }

    // 4. Calcular Totales de Ventas y Desglose Diario Detallado
    let periodTotalSales = 0;       // Ventas totales del periodo
    let periodTotalCost = 0;        // Costo real total de lo vendido en el periodo
    let totalSalesCount = sales.length;
    let paymentMethodsMap = {};
    let categorySalesMap = {};
    let productSalesMap = {};
    let dailyFinancialsMap = {};    // Mapa detallado fecha por fecha

    for (const sale of sales) {
      const saleRevenue = sale.amount_paid !== undefined && sale.amount_paid !== null 
        ? Number(sale.amount_paid) 
        : Number(sale.total || 0);

      // Métodos de pago
      const pm = sale.payment_method || 'Otros';
      if (!paymentMethodsMap[pm]) {
        paymentMethodsMap[pm] = { count: 0, total: 0 };
      }
      paymentMethodsMap[pm].count += 1;
      paymentMethodsMap[pm].total += saleRevenue;

      // Clave del día (YYYY-MM-DD)
      const dayKey = sale.created_at ? sale.created_at.slice(0, 10) : 'Sin fecha';

      if (!dailyFinancialsMap[dayKey]) {
        dailyFinancialsMap[dayKey] = {
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
      dailyFinancialsMap[dayKey].transactionsCount += 1;

      let saleCostCalculated = 0;
      let saleRevenueFromItems = 0;
      let hasParsedItems = false;

      // Desglose de items de la venta
      try {
        const items = typeof sale.items === 'string' ? JSON.parse(sale.items || '[]') : (sale.items || []);
        if (Array.isArray(items) && items.length > 0) {
          hasParsedItems = true;

          for (const it of items) {
            const qty = Number(it.quantity || 1);
            const price = Number(it.price !== undefined ? it.price : (productPriceMap[it.sku] ?? 0));
            const cost = Number(it.cost !== undefined && it.cost !== null ? it.cost : (productCostMap[it.sku] ?? productCostMap[it.id] ?? 0));
            const itemRevenue = price * qty;
            const itemCost = cost * qty;
            const itemProfit = itemRevenue - itemCost;
            const cat = it.category || productCategoryMap[it.sku] || 'General';

            saleRevenueFromItems += itemRevenue;
            saleCostCalculated += itemCost;

            dailyFinancialsMap[dayKey].itemsCount += qty;
            dailyFinancialsMap[dayKey].itemsList.push({
              name: it.name || productNameMap[it.sku] || 'Artículo',
              sku: it.sku || '',
              quantity: qty,
              price,
              cost,
              totalRevenue: itemRevenue,
              totalCost: itemCost,
              profit: itemProfit,
              marginPct: itemRevenue > 0 ? Number(((itemProfit / itemRevenue) * 100).toFixed(1)) : 0
            });

            // Por categoría
            categorySalesMap[cat] = (categorySalesMap[cat] || 0) + itemRevenue;

            // Por producto acumulado
            const prodKey = it.sku || it.id || it.name;
            if (!productSalesMap[prodKey]) {
              productSalesMap[prodKey] = {
                sku: it.sku || '',
                name: it.name || productNameMap[it.sku] || 'Producto',
                category: cat,
                unitsSold: 0,
                totalRevenue: 0,
                totalCost: 0,
                profit: 0
              };
            }
            productSalesMap[prodKey].unitsSold += qty;
            productSalesMap[prodKey].totalRevenue += itemRevenue;
            productSalesMap[prodKey].totalCost += itemCost;
            productSalesMap[prodKey].profit += itemProfit;
          }
        }
      } catch (e) {
        // Fallback en caso de error de parseo
      }

      // Si los items sumaron ingresos, usamos la suma real de items; de lo contrario el total de la venta
      const finalSaleRevenue = hasParsedItems && saleRevenueFromItems > 0 ? saleRevenueFromItems : saleRevenue;
      
      // Si la venta no tenía items detallados con costo, estimamos costo usando margen promedio histórico (70% costo / 30% utilidad)
      const finalSaleCost = hasParsedItems ? saleCostCalculated : Math.round(finalSaleRevenue * 0.7);

      dailyFinancialsMap[dayKey].totalSales += finalSaleRevenue;
      dailyFinancialsMap[dayKey].totalCost += finalSaleCost;
      dailyFinancialsMap[dayKey].profit += (finalSaleRevenue - finalSaleCost);
      if (pm.toLowerCase() === 'efectivo') {
        dailyFinancialsMap[dayKey].cashSales = (dailyFinancialsMap[dayKey].cashSales || 0) + finalSaleRevenue;
      }

      periodTotalSales += finalSaleRevenue;
      periodTotalCost += finalSaleCost;
    }

    // Calcular márgenes porcentuales y retiros diarios
    const dailySalesList = Object.values(dailyFinancialsMap).map(day => {
      const margin = day.totalSales > 0 ? Number(((day.profit / day.totalSales) * 100).toFixed(1)) : 0;
      const wAmt = dailyWithdrawalsMap[day.date] || 0;
      const cashSales = day.cashSales || 0;
      return {
        ...day,
        marginPct: margin,
        cashSales,
        withdrawals: wAmt,
        netCash: cashSales - wAmt
      };
    }).sort((a, b) => b.date.localeCompare(a.date)); // Orden descendente (más recientes primero)

    // Crecimiento porcentual vs periodo anterior
    let prevRevenue = 0;
    for (const ps of prevSales) {
      prevRevenue += (ps.amount_paid !== undefined && ps.amount_paid !== null ? Number(ps.amount_paid) : Number(ps.total || 0));
    }
    let revenueGrowth = null;
    if (prevRevenue > 0) {
      revenueGrowth = Number((((periodTotalSales - prevRevenue) / prevRevenue) * 100).toFixed(1));
    } else if (prevRevenue === 0 && periodTotalSales > 0) {
      revenueGrowth = 100;
    }

    const periodTotalProfit = periodTotalSales - periodTotalCost;
    const periodMarginPct = periodTotalSales > 0 
      ? Number(((periodTotalProfit / periodTotalSales) * 100).toFixed(1)) 
      : 0;

    const avgTicket = totalSalesCount > 0 ? Math.round(periodTotalSales / totalSalesCount) : 0;

    // Timeline para la gráfica (orden cronológico ascendente)
    const timeline = Object.values(dailyFinancialsMap)
      .map(d => ({
        date: d.date,
        total: d.totalSales,
        cost: d.totalCost,
        profit: d.profit,
        count: d.transactionsCount
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top 5 productos más vendidos en el periodo
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Saldo total pendiente en separados
    const totalPendingLayaway = pendingLayaways.reduce((acc, curr) => acc + (Number(curr.pending_balance) || 0), 0);

    // 5. Consultar Taller de Servicio Técnico (work_orders)
    const [ordersSummaryResult, activeOrdersResult] = await Promise.all([
      DB.prepare(`
        SELECT status, priority, COUNT(*) as count, SUM(estimated_price) as sum_price 
        FROM work_orders 
        GROUP BY status, priority
      `).all(),
      DB.prepare(`
        SELECT id, customer_name, customer_phone, bike_brand, bike_model, problem_description, status, priority, estimated_price, created_at 
        FROM work_orders 
        WHERE status != 'entregada'
        ORDER BY CASE priority WHEN 'urgente' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, created_at ASC
        LIMIT 10
      `).all()
    ]);

    const ordersSummary = ordersSummaryResult.results || [];
    const urgentOrActiveOrders = activeOrdersResult.results || [];

    let workshopStatusCount = { recibida: 0, en_proceso: 0, lista: 0, entregada: 0 };
    let workshopPriorityCount = { urgente: 0, normal: 0, rutina: 0 };
    let activeWorkshopCount = 0;
    let pendingWorkshopRevenue = 0;

    for (const row of ordersSummary) {
      const st = row.status;
      const pr = row.priority;
      const cnt = Number(row.count || 0);
      const prc = Number(row.sum_price || 0);

      if (workshopStatusCount[st] !== undefined) workshopStatusCount[st] += cnt;
      if (workshopPriorityCount[pr] !== undefined) workshopPriorityCount[pr] += cnt;
      if (st !== 'entregada') {
        activeWorkshopCount += cnt;
        pendingWorkshopRevenue += prc;
      }
    }

    // 6. Consultar Clientes
    const [totalCustomersResult, newCustomersResult] = await Promise.all([
      DB.prepare('SELECT COUNT(*) as count FROM customers').first(),
      DB.prepare('SELECT COUNT(*) as count FROM customers WHERE created_at >= ?').bind(startIso).first()
    ]);

    const totalCustomers = totalCustomersResult ? Number(totalCustomersResult.count || 0) : 0;
    const newCustomersPeriod = newCustomersResult ? Number(newCustomersResult.count || 0) : 0;

    // 7. Respuesta Consolidada
    return Response.json({
      success: true,
      timeframe,
      dateRange: {
        from: startIso,
        to: now.toISOString()
      },
      // Valuación del Inventario Completo
      inventoryValuation: {
        totalCostValue: inventoryCostValue,        // Total en dinero a Costo Real
        totalRetailValue: inventoryRetailValue,    // Total en dinero a Costo de Venta (PVP)
        totalPotentialProfit: potentialGrossProfit,// Utilidad Real si vendiera todo
        marginPct: inventoryMarginPct,             // % Margen de Utilidad Real
        totalUnits: totalStockUnits,
        totalReferences: allProducts.length,
        categories: categoryValuationList
      },
      // Finanzas del Periodo Seleccionado
      periodFinancials: {
        totalSales: periodTotalSales,
        totalCost: periodTotalCost,
        totalProfit: periodTotalProfit,
        marginPct: periodMarginPct,
        totalWithdrawals: periodTotalWithdrawals,
        salesCount: totalSalesCount,
        avgTicket
      },
      // Desglose de Ventas Diarias con Venta, Costo Real y Utilidad Real
      dailySales: dailySalesList,
      kpis: {
        totalRevenue: periodTotalSales,
        totalCost: periodTotalCost,
        totalProfit: periodTotalProfit,
        profitMarginPct: periodMarginPct,
        totalCashWithdrawals: periodTotalWithdrawals,
        revenueGrowth,
        prevRevenue,
        totalSalesCount,
        avgTicket,
        activeWorkshopCount,
        pendingWorkshopRevenue,
        totalStockUnits,
        inventoryCostValue,
        inventoryRetailValue,
        potentialGrossProfit,
        inventoryMarginPct,
        totalPendingLayaway,
        pendingLayawaysCount: pendingLayaways.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalProductsCount: allProducts.length,
        totalCustomers,
        newCustomersPeriod
      },
      charts: {
        timeline,
        paymentMethods: Object.entries(paymentMethodsMap).map(([method, data]) => ({
          method,
          count: data.count,
          total: data.total
        })),
        categorySales: Object.entries(categorySalesMap).map(([category, total]) => ({
          category,
          total
        })),
        categoryInventory: categoryValuationList.map(c => ({
          category: c.category,
          count: c.units
        })),
        workshopStatus: workshopStatusCount,
        workshopPriority: workshopPriorityCount
      },
      alerts: {
        lowStock: lowStockProducts.slice(0, 8),
        outOfStock: outOfStockProducts.slice(0, 8),
        urgentOrders: urgentOrActiveOrders.filter(o => o.priority === 'urgente' || o.status === 'recibida'),
        pendingLayaways: pendingLayaways.slice(0, 8)
      },
      topProducts
    });

  } catch (err) {
    console.error('GET /api/stats error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
