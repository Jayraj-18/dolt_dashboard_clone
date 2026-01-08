// src/utils/analytics.js

export const generateRevenueData = (completedBookings) => {
  const monthlyTotals = {};

  completedBookings.forEach((b) => {
    const date = b.completed_date
      ? new Date(b.completed_date)
      : b.created_at?.toDate?.()
        ? b.created_at.toDate()
        : new Date(b.created_at);

    if (!date) return;

    const month = date.toLocaleString("en-US", { month: "short" });
    const amount = b.total_amount || 0;

    monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
  });

  const monthOrder = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const sortedMonths = Object.keys(monthlyTotals).sort(
    (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
  );

  let cumulative = 0;

  return sortedMonths.map((month) => {
    const revenue = monthlyTotals[month];
    cumulative += revenue;

    return {
      month,
      revenue,
      totalRevenue: cumulative,
    };
  });
};


export const generateServiceBreakdown = (allBookings) => {
  const services = {};

  allBookings.forEach((b) => {
    const type = b.service_title || "Other";
    services[type] = (services[type] || 0) + 1;
  });

  return Object.keys(services).map((key) => ({
    name: key,
    value: services[key],
  }));
};
