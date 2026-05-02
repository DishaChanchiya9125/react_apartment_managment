/** Demo data for the apartment management UI — replace with API calls later. */

export const property = {
  name: 'Lakeside Apartments',
  address: 'Pune, Maharashtra',
  currency: 'INR',
  symbol: '₹',
};

export const apartments = [
  { id: 'apt-1', unit: 'A-114', wing: 'A', floor: 1, type: '1BHK', monthlyRent: 15000, status: 'Occupied', tenantId: 't-3' },
  { id: 'apt-2', unit: 'A-302', wing: 'A', floor: 3, type: '2BHK', monthlyRent: 18000, status: 'Occupied', tenantId: 't-1' },
  { id: 'apt-3', unit: 'B-110', wing: 'B', floor: 1, type: '2BHK', monthlyRent: 16500, status: 'Occupied', tenantId: 't-2' },
  { id: 'apt-4', unit: 'C-205', wing: 'C', floor: 2, type: '1BHK', monthlyRent: 17000, status: 'Vacant', tenantId: null },
  { id: 'apt-5', unit: 'B-204', wing: 'B', floor: 2, type: '3BHK', monthlyRent: 24000, status: 'Occupied', tenantId: 't-4' },
  { id: 'apt-6', unit: 'A-401', wing: 'A', floor: 4, type: '2BHK', monthlyRent: 19000, status: 'Vacant', tenantId: null },
  { id: 'apt-7', unit: 'C-101', wing: 'C', floor: 1, type: '1BHK', monthlyRent: 15500, status: 'Occupied', tenantId: 't-5' },
  { id: 'apt-8', unit: 'B-305', wing: 'B', floor: 3, type: '2BHK', monthlyRent: 17200, status: 'Occupied', tenantId: 't-6' },
  { id: 'apt-9', unit: 'A-201', wing: 'A', floor: 2, type: '2BHK', monthlyRent: 16000, status: 'Occupied', tenantId: 't-7' },
];

export const tenants = [
  { id: 't-1', name: 'Aarav Patel', unit: 'A-302', phone: '+91 98xxxxxx12', email: 'aarav.p@email.com', leaseEnd: '2026-12-31' },
  { id: 't-2', name: 'Neha Sharma', unit: 'B-110', phone: '+91 99xxxxxx45', email: 'neha.s@email.com', leaseEnd: '2027-06-30' },
  { id: 't-3', name: 'Isha Verma', unit: 'A-114', phone: '+91 97xxxxxx88', email: 'isha.v@email.com', leaseEnd: '2026-09-15' },
  { id: 't-4', name: 'Rohit Singh', unit: 'B-204', phone: '+91 91xxxxxx01', email: 'rohit.s@email.com', leaseEnd: '2027-03-01' },
  { id: 't-5', name: 'Priya Nair', unit: 'C-101', phone: '+91 92xxxxxx77', email: 'priya.n@email.com', leaseEnd: '2026-11-20' },
  { id: 't-6', name: 'Vikram Desai', unit: 'B-305', phone: '+91 88xxxxxx33', email: 'vikram.d@email.com', leaseEnd: '2027-01-10' },
  { id: 't-7', name: 'Kushal', unit: 'A-201', phone: '+91 93xxxxxx99', email: 'kushal@gmail.com', leaseEnd: '2027-08-15' },
];

export const payments = [
  { id: 'PMT-1001', tenantId: 't-1', tenantName: 'Aarav Patel', unit: 'A-302', amount: 18000, status: 'Paid', date: '2026-03-05' },
  { id: 'PMT-1002', tenantId: 't-2', tenantName: 'Neha Sharma', unit: 'B-110', amount: 16500, status: 'Paid', date: '2026-03-07' },
  { id: 'PMT-1003', tenantId: 't-4', tenantName: 'Rohit Singh', unit: 'B-204', amount: 24000, status: 'Pending', date: '2026-03-12' },
  { id: 'PMT-1004', tenantId: 't-3', tenantName: 'Isha Verma', unit: 'A-114', amount: 15000, status: 'Overdue', date: '2026-02-28' },
  { id: 'PMT-1005', tenantId: 't-5', tenantName: 'Priya Nair', unit: 'C-101', amount: 15500, status: 'Paid', date: '2026-03-01' },
  { id: 'PMT-1006', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 16000, status: 'Paid', date: '2026-03-10' },
  { id: 'PMT-1007', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 16000, status: 'Pending', date: '2026-03-15' },
  { id: 'PMT-1008', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 16000, status: 'Paid', date: '2026-02-10' },
  { id: 'PMT-1009', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 16000, status: 'Paid', date: '2026-01-10' },
  { id: 'PMT-1010', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 800, status: 'Paid', date: '2026-03-08' },
  { id: 'PMT-1011', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 1200, status: 'Overdue', date: '2026-02-25' },
  { id: 'PMT-1012', tenantId: 't-7', tenantName: 'Kushal', unit: 'A-201', amount: 500, status: 'Paid', date: '2026-03-02' },
];

export const maintenanceRequests = [
  {
    id: 'm-1',
    title: 'Elevator noise and intermittent stops',
    unit: 'Building A — Elevator',
    priority: 'high',
    status: 'In Progress',
    reported: '2026-03-10',
    category: 'General',
  },
  {
    id: 'm-2',
    title: 'Kitchen faucet leak',
    unit: 'A-114 — Kitchen',
    priority: 'medium',
    status: 'Open',
    reported: '2026-03-08',
    category: 'Plumbing',
  },
  {
    id: 'm-3',
    title: 'Parking lot lights out',
    unit: 'Parking — Section C',
    priority: 'medium',
    status: 'Resolved',
    reported: '2026-03-05',
    category: 'Electrical',
  },
  {
    id: 'm-4',
    title: 'Lobby AC not cooling',
    unit: 'Building B — Lobby',
    priority: 'low',
    status: 'Open',
    reported: '2026-03-14',
    category: 'HVAC',
  },
];

export const amenitiesBookings = [
  {
    id: 'b-1',
    amenity: 'Gym',
    slot: 'Tomorrow, 6:00 - 7:00 PM',
    bookedBy: 'John',
    status: 'Confirmed',
    createdAt: '2026-03-12',
  },
  {
    id: 'b-2',
    amenity: 'Pool',
    slot: 'Today, 8:00 - 9:00 AM',
    bookedBy: 'John',
    status: 'Pending',
    createdAt: '2026-03-14',
  },
  {
    id: 'b-3',
    amenity: 'Meeting Room',
    slot: '2026-03-18, 3:00 - 4:00 PM',
    bookedBy: 'Neha',
    status: 'Confirmed',
    createdAt: '2026-03-10',
  },
];

export const communityPolls = [
  {
    id: 'p-1',
    question: 'What should be the pool opening time?',
    options: [
      { option: '6:00 AM', count: 18 },
      { option: '7:00 AM', count: 26 },
      { option: '8:00 AM', count: 12 },
    ],
    closesOn: '2026-03-20',
    status: 'Open',
    yourVote: '7:00 AM',
  },
  {
    id: 'p-2',
    question: 'Which day is best for community events?',
    options: [
      { option: 'Saturday', count: 9 },
      { option: 'Sunday', count: 21 },
      { option: 'Weekday', count: 6 },
    ],
    closesOn: '2026-03-26',
    status: 'Open',
    yourVote: 'Sunday',
  },
];

export const maintenanceInvoices = [
  { id: 'fee-1', title: 'March Maintenance Fees', dueDate: '2026-03-25', amount: 1800, status: 'Paid', paidDate: '2026-03-18' },
  { id: 'fee-2', title: 'April Maintenance Fees', dueDate: '2026-04-25', amount: 1800, status: 'Unpaid' },
  { id: 'fee-3', title: 'Overdue Maintenance Fees', dueDate: '2026-02-25', amount: 900, status: 'Overdue' },
];

export function formatCurrency(amount) {
  return `${property.symbol} ${Number(amount).toLocaleString('en-IN')}`;
}

export function getTenantById(id) {
  return tenants.find((t) => t.id === id);
}

export function getTenantByEmail(email) {
  return tenants.find((t) => t.email === email);
}

export function getDashboardStats() {
  const occupied = apartments.filter((a) => a.status === 'Occupied').length;
  const total = apartments.length;
  const monthlyRevenue = apartments
    .filter((a) => a.status === 'Occupied')
    .reduce((sum, a) => sum + a.monthlyRent, 0);
  return {
    totalApartments: total,
    activeTenants: tenants.length,
    monthlyRevenue,
    occupancyPct: total ? Math.round((occupied / total) * 100) : 0,
    occupied,
    vacant: total - occupied,
  };
}

export function getRecentPayments(limit = 6, userEmail = null, userRole = null) {
  let filteredPayments = [...payments];
  
  // If user is not admin, filter payments to show only their own payments
  if (userRole !== 'admin' && userEmail) {
    const tenant = getTenantByEmail(userEmail);
    if (tenant) {
      filteredPayments = filteredPayments.filter(p => p.tenantId === tenant.id);
    } else {
      filteredPayments = []; // Show no payments if tenant not found
    }
  }
  
  return filteredPayments.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

export function getMaintenanceStats() {
  const open = maintenanceRequests.filter((m) => m.status === 'Open').length;
  const inProgress = maintenanceRequests.filter((m) => m.status === 'In Progress').length;
  const resolved = maintenanceRequests.filter((m) => m.status === 'Resolved').length;
  return { open, inProgress, resolved, total: maintenanceRequests.length };
}

export function getAmenitiesStats() {
  const upcoming = amenitiesBookings.length;
  const pending = amenitiesBookings.filter((b) => b.status === 'Pending').length;
  const confirmed = amenitiesBookings.filter((b) => b.status === 'Confirmed').length;
  return { upcoming, pending, confirmed, total: amenitiesBookings.length };
}

export function getCommunityPollsStats() {
  const open = communityPolls.filter((p) => p.status === 'Open').length;
  return { open, total: communityPolls.length };
}

export function getMaintenanceFeeStats() {
  const totalDue = maintenanceInvoices
    .filter((i) => i.status === 'Unpaid' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);
  const dueThisMonth = maintenanceInvoices
    .filter((i) => i.status === 'Unpaid' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);
  const paid = maintenanceInvoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = maintenanceInvoices.filter((i) => i.status === 'Overdue').length;
  return { totalDue, dueThisMonth, paid, overdueCount, total: maintenanceInvoices.length };
}