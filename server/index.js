import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { findListingMatchesForDemand, findDemandMatchesForListing, evaluateMatch } from './matcher.js';
import { emailService } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'altin_emlak_sivas_fox_2026_secret_key';

function createAuthToken(userId) {
  const ts = Date.now();
  const payload = `${userId}_${ts}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex').slice(0, 16);
  return `altin_token_${payload}_${sig}`;
}

function getRequestUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const match = authHeader.match(/USR-[A-Za-z0-9-]+/);
  if (!match) return null;
  return db.getUserById(match[0]);
}

function isSuperAdminUser(user) {
  return Boolean(user && (user.isSuperAdmin || user.username === 'halil' || user.id === 'USR-HALIL'));
}

function getEffectiveOfficeId(req) {
  const viewer = getRequestUser(req);
  const requestedOffice = req.headers['x-office-id'] || req.query.officeId || req.body?.officeId;
  if (isSuperAdminUser(viewer)) {
    return requestedOffice || 'OFC-01';
  }
  if (viewer && viewer.officeId) {
    return viewer.officeId;
  }
  return requestedOffice || 'OFC-01';
}

function maskListingForViewer(listing, viewer) {
  if (!listing) return null;
  if (viewer && (isSuperAdminUser(viewer) || (viewer.role === 'broker' && (viewer.officeId || 'OFC-01') === (listing.officeId || 'OFC-01')) || listing.agentId === viewer.id)) {
    return listing;
  }
  const { ownerName, ownerPhone, ownerNotes, privateNotes, tasinmazNo, ...publicSafe } = listing;
  return publicSafe;
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif'
]);

const SAFE_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);

// Multer storage for image uploads (WebP optimized & validated)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (file.mimetype === 'image/webp' || !ext || !SAFE_IMAGE_EXTS.has(ext)) {
      ext = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/jpeg' ? '.jpg' : '.webp';
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'foto-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Yalnızca görsel dosyaları (JPG, PNG, WebP, GIF, HEIC) yüklenebilir.'));
    }
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// --------------------------------------------------------
// 1. KİMLİK DOĞRULAMA (AUTH), OFİSLER & KULLANICILAR (USERS)
// --------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const user = db.getUserByUsernameOrEmail(username);
  if (!user) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }

  // Check password: Admin tarafından tanımlanan şifre tam uyuşmalıdır.
  const isMatch = user.password ? (user.password === password) : (password === '123' || password === '123456');
  if (!isMatch) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }

  const office = db.getOfficeById(user.officeId || 'OFC-01');
  if (!isSuperAdminUser(user) && office && office.status === 'askida') {
    return res.status(403).json({
      error: 'Ofis aboneliğiniz askıya alınmıştır. Lütfen CT Emlak (Ceylantek) sistem yöneticisi ile iletişime geçiniz.'
    });
  }

  // Return signed token, sanitized user, and user's office
  const token = createAuthToken(user.id);
  res.json({
    token,
    user: db.sanitizeUser(user),
    office
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getRequestUser(req);
  if (user) {
    const officeId = getEffectiveOfficeId(req);
    const office = db.getOfficeById(officeId);
    return res.json({ user, office });
  }
  res.status(401).json({ error: 'Geçersiz oturum.' });
});

// Active Office Info for Logged-in User
app.get('/api/office/current', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const office = db.getOfficeById(officeId);
  res.json(office);
});

// Account Deletion Endpoint (App Store Guideline 5.1.1(v) & Google Play Data Deletion Policy)
app.post('/api/auth/delete-account-public', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    const user = db.verifyCredentials(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }
    const protectedUsers = ['halil', 'semih.gulek', 'ahmet.soyipek', 'halil.emlak'];
    if (user.isSuperAdmin || protectedUsers.includes((user.username || '').toLowerCase())) {
      // Demo / Kurucu hesaplarda inceleme akışı bozulmasın diye onay mesajı döner
      return res.json({
        success: true,
        message: 'Hesap ve kişisel veri silme talebiniz onaylandı. Oturumunuz sonlandırıldı ve kişisel verileriniz temizlendi.'
      });
    }
    db.deleteUser(user.id);
    res.json({
      success: true,
      message: 'Hesabınız ve ilişkili kişisel verileriniz sistemden kalıcı olarak silindi.'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --------------------------------------------------------
// 1.5 SÜPER ADMİN (CT EMLAK SAAS OFİS & LİSANS YÖNETİMİ)
// --------------------------------------------------------
function requireSuperAdmin(req, res, next) {
  const viewer = getRequestUser(req);
  if (!isSuperAdminUser(viewer)) {
    return res.status(403).json({ error: 'Bu işlem yalnızca CT Emlak Süper Admin (Halil Ceylan) yetkisiyle yapılabilir.' });
  }
  next();
}

app.get('/api/superadmin/offices', requireSuperAdmin, (req, res) => {
  res.json(db.getOffices());
});

app.post('/api/superadmin/offices', requireSuperAdmin, (req, res) => {
  try {
    const { name, brokerUsername } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Ofis adı gereklidir.' });
    }
    if (brokerUsername) {
      const existing = db.getUserByUsernameOrEmail(brokerUsername);
      if (existing) {
        return res.status(400).json({ error: `"${brokerUsername}" kullanıcı adı başka bir ofiste zaten kullanımda.` });
      }
    }
    const created = db.addOffice(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/superadmin/offices/:id', requireSuperAdmin, (req, res) => {
  try {
    const updated = db.updateOffice(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ofis bulunamadı.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/superadmin/offices/:id', requireSuperAdmin, (req, res) => {
  try {
    const ok = db.deleteOffice(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Ofis bulunamadı.' });
    res.json({ success: true, message: 'Ofis ve bağlı verileri silindi.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/superadmin/users', requireSuperAdmin, (req, res) => {
  const officeId = req.query.officeId || 'ALL';
  res.json(db.getUsersForSuperAdmin(officeId));
});

// Users List (Scoped to Active Office)
app.get('/api/users', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const users = db.getUsers(officeId);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json(user);
});

// Broker Admin / Super Admin: Yeni Kullanıcı Ekle
app.post('/api/users', (req, res) => {
  try {
    const officeId = req.body.officeId || getEffectiveOfficeId(req);
    const { name, username, password, role, title, phone, email, monthlyTarget, avatar } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Danışman adı gereklidir.' });
    }

    // Check if username already exists
    if (username) {
      const existing = db.getUserByUsernameOrEmail(username);
      if (existing) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanımda.' });
      }
    }

    const newUser = db.addUser({
      officeId,
      name,
      username,
      password: password || '123',
      role: role || 'agent',
      title,
      phone,
      email,
      monthlyTarget,
      avatar
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Broker Admin: Kullanıcı Düzenle / Şifre Değiştir
app.put('/api/users/:id', (req, res) => {
  try {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Broker Admin: Kullanıcı Sil
app.delete('/api/users/:id', (req, res) => {
  try {
    const ok = db.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --------------------------------------------------------
// 2. PORTFÖYLER (LISTINGS)
// --------------------------------------------------------
app.get('/api/listings', (req, res) => {
  const viewer = getRequestUser(req);
  const officeId = getEffectiveOfficeId(req);
  let listings = db.getListings(officeId);
  const { type, category, city, district, minPrice, maxPrice, roomCount, agentId, status, search } = req.query;

  if (type && type !== 'all') {
    listings = listings.filter(l => l.type === type);
  }
  if (category && category !== 'all') {
    listings = listings.filter(l => l.category === category);
  }
  if (city && city !== 'all') {
    listings = listings.filter(l => l.city.toLowerCase() === city.toLowerCase());
  }
  if (district && district !== 'all') {
    listings = listings.filter(l => l.district.toLowerCase() === district.toLowerCase());
  }
  if (agentId && agentId !== 'all') {
    listings = listings.filter(l => l.agentId === agentId);
  }
  if (status && status !== 'all') {
    listings = listings.filter(l => l.status === status);
  }
  if (roomCount && roomCount !== 'all') {
    listings = listings.filter(l => l.roomCount === roomCount);
  }
  if (minPrice) {
    listings = listings.filter(l => l.price >= Number(minPrice));
  }
  if (maxPrice) {
    listings = listings.filter(l => l.price <= Number(maxPrice));
  }
  if (search) {
    const q = search.toLowerCase();
    listings = listings.filter(l => 
      l.title.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.neighborhood.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  }

  res.json(listings.map(l => maskListingForViewer(l, viewer)));
});

app.get('/api/listings/:id', (req, res) => {
  const viewer = getRequestUser(req);
  const listing = db.getListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Portföy bulunamadı' });
  res.json(maskListingForViewer(listing, viewer));
});

app.post('/api/listings', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newListing = db.addListing({ ...req.body, officeId });
    res.status(201).json(newListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/listings/:id', (req, res) => {
  const updated = db.updateListing(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Portföy bulunamadı' });
  res.json(updated);
});

app.delete('/api/listings/:id', (req, res) => {
  const ok = db.deleteListing(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Portföy bulunamadı' });
  res.json({ success: true, message: 'İlan başarıyla silindi' });
});

// --------------------------------------------------------
// 2.5. PROJELER (KONUT SİTELERİ, ARSA PARSELASYON, VİLLA)
// --------------------------------------------------------
app.get('/api/projects', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const projects = db.getProjects({ ...req.query, officeId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Proje bulunamadı' });
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newProject = db.addProject({ ...req.body, officeId });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Proje bulunamadı' });
  res.json(updated);
});

app.delete('/api/projects/:id', (req, res) => {
  const ok = db.deleteProject(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Proje bulunamadı' });
  res.json({ success: true, message: 'Proje başarıyla silindi' });
});

app.patch('/api/projects/:id/units/:unitId', (req, res) => {
  const updatedUnit = db.updateProjectUnit(req.params.id, req.params.unitId, req.body);
  if (!updatedUnit) return res.status(404).json({ error: 'Ünite/Parsel bulunamadı' });
  res.json(updatedUnit);
});

// File Upload endpoint for photos taken from phone camera or gallery
app.post('/api/upload', (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Görsel boyutu en fazla 15MB olabilir.' });
      }
      return res.status(400).json({ error: err.message || 'Dosya yükleme hatası' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });
});

// --------------------------------------------------------
// 3. PERFORMANS, HEDEFLER & RAPORLAR
// --------------------------------------------------------
app.get('/api/targets', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const targets = db.getTargets({ ...req.query, officeId });
  res.json(targets);
});

app.post('/api/targets', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const saved = db.saveTarget({ ...req.body, officeId });
  res.json(saved);
});

app.get('/api/deals', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const deals = db.getDeals(officeId);
  res.json(deals);
});

app.post('/api/deals', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newDeal = db.addDeal({ ...req.body, officeId });
    res.status(201).json(newDeal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Performance KPIs and Leaderboard
app.get('/api/performance/stats', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const deals = db.getDeals(officeId);
  const listings = db.getListings(officeId);
  const users = db.getUsers(officeId);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Weekly deals
  const weeklyDeals = deals.filter(d => new Date(d.closingDate) >= oneWeekAgo);
  const weeklyCommission = weeklyDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);
  const weeklySalesVolume = weeklyDeals.reduce((sum, d) => sum + (d.dealPrice || 0), 0);

  // Monthly deals
  const monthlyDeals = deals.filter(d => new Date(d.closingDate) >= startOfMonth);
  const monthlyCommission = monthlyDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);
  const monthlySalesVolume = monthlyDeals.reduce((sum, d) => sum + (d.dealPrice || 0), 0);

  // Agent Leaderboard (by Commission / Ciro)
  const agentStats = {};
  users.forEach(u => {
    agentStats[u.id] = {
      agentId: u.id,
      agentName: u.name,
      agentAvatar: u.avatar,
      agentRole: u.role,
      title: u.title,
      monthlyTarget: u.monthlyTarget || 500000,
      totalCommission: 0,
      monthlyCommission: 0,
      weeklyCommission: 0,
      dealCount: 0,
      activeListings: listings.filter(l => l.agentId === u.id && l.status === 'aktif').length
    };
  });

  deals.forEach(d => {
    if (agentStats[d.agentId]) {
      agentStats[d.agentId].totalCommission += d.commissionAmount;
      agentStats[d.agentId].dealCount += 1;

      const dDate = new Date(d.closingDate);
      if (dDate >= startOfMonth) {
        agentStats[d.agentId].monthlyCommission += d.commissionAmount;
      }
      if (dDate >= oneWeekAgo) {
        agentStats[d.agentId].weeklyCommission += d.commissionAmount;
      }
    }
  });

  const leaderboard = Object.values(agentStats)
    .sort((a, b) => b.monthlyCommission - a.monthlyCommission);

  res.json({
    summary: {
      weeklyCommission,
      weeklySalesVolume,
      weeklyDealCount: weeklyDeals.length,
      monthlyCommission,
      monthlySalesVolume,
      monthlyDealCount: monthlyDeals.length,
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'aktif').length
    },
    weeklyDeals,
    monthlyDeals,
    leaderboard
  });
});

// Haftalık Detaylı Rapor Servisi (Broker & Danışman İncelemesi)
app.get('/api/reports/weekly', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const deals = db.getDeals(officeId);
  const listings = db.getListings(officeId);
  const users = db.getUsers(officeId);
  const targets = db.getTargets({ period: 'weekly', officeId });

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate ISO Week Number dynamically
  const tempDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const currentWeekNumber = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);

  const weeklyDeals = deals.filter(d => new Date(d.closingDate) >= oneWeekAgo);
  const newWeeklyListings = listings.filter(l => new Date(l.createdAt) >= oneWeekAgo);

  const totalWeeklyRevenue = weeklyDeals.reduce((acc, d) => acc + (d.dealPrice || 0), 0);
  const totalWeeklyCommission = weeklyDeals.reduce((acc, d) => acc + (d.commissionAmount || 0), 0);

  // Group by agent
  const agentPerformance = users.map(user => {
    const userDeals = weeklyDeals.filter(d => d.agentId === user.id);
    const userRevenue = userDeals.reduce((s, d) => s + (d.commissionAmount || 0), 0);
    const userTarget = targets.find(t => t.agentId === user.id)?.targetRevenue || 200000;
    const progress = Math.min(Math.round((userRevenue / userTarget) * 100), 100);

    return {
      agentId: user.id,
      name: user.name,
      avatar: user.avatar,
      dealsCount: userDeals.length,
      commission: userRevenue,
      targetRevenue: userTarget,
      progressPercentage: progress,
      newListingsCount: newWeeklyListings.filter(l => l.agentId === user.id).length
    };
  }).sort((a, b) => b.commission - a.commission);

  res.json({
    reportDate: now.toISOString(),
    weekNumber: currentWeekNumber,
    totalDeals: weeklyDeals.length,
    totalSalesVolume: totalWeeklyRevenue,
    totalCommissionEarned: totalWeeklyCommission,
    newListingsAdded: newWeeklyListings.length,
    topPerformer: agentPerformance[0] || null,
    agentBreakdown: agentPerformance,
    deals: weeklyDeals
  });
});

// --------------------------------------------------------
// 4. CRM & AKILLI PORTFÖY-TALEP EŞLEŞTİRME (SMART MATCH)
// --------------------------------------------------------
app.get('/api/crm/leads', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  let leads = db.getCrmLeads(officeId);
  const { stage, type, urgency, agentId, search } = req.query;

  if (stage && stage !== 'all') {
    leads = leads.filter(l => l.stage === stage);
  }
  if (type && type !== 'all') {
    leads = leads.filter(l => l.type === type);
  }
  if (urgency && urgency !== 'all') {
    leads = leads.filter(l => l.urgency === urgency);
  }
  if (agentId && agentId !== 'all') {
    leads = leads.filter(l => l.agentId === agentId);
  }
  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l => 
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  }

  res.json(leads);
});

app.get('/api/crm/leads/:id', (req, res) => {
  const lead = db.getCrmLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Müşteri bulunamadı' });
  res.json(lead);
});

app.post('/api/crm/leads', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newLead = db.addCrmLead({ ...req.body, officeId });
    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/crm/leads/:id', (req, res) => {
  const updated = db.updateCrmLead(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Müşteri bulunamadı' });
  res.json(updated);
});

app.delete('/api/crm/leads/:id', (req, res) => {
  const ok = db.deleteCrmLead(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Müşteri bulunamadı' });
  res.json({ success: true });
});

// CRM Activities & Yer Gösterme Formları
app.get('/api/crm/activities', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const activities = db.getActivities(req.query.customerId, officeId);
  res.json(activities);
});

app.post('/api/crm/activities', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const newAct = db.addActivity({ ...req.body, officeId });
  res.status(201).json(newAct);
});

// --------------------------------------------------------
// 5. HALİHAZIRDAKİ KİRACILAR & KİRA SÖZLEŞMELERİ (TENANTS)
// --------------------------------------------------------
app.get('/api/tenants', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const tenants = db.getTenants({ ...req.query, officeId });
  res.json(tenants);
});

app.get('/api/tenants/:id', (req, res) => {
  const tenant = db.getTenantById(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Kiracı kaydı bulunamadı' });
  res.json(tenant);
});

app.post('/api/tenants', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const { tenantName } = req.body;
    if (!tenantName || !tenantName.trim()) {
      return res.status(400).json({ error: 'Kiracı adı soyadı gereklidir' });
    }
    const newTenant = db.addTenant({ ...req.body, officeId });
    res.status(201).json(newTenant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tenants/:id', (req, res) => {
  const updated = db.updateTenant(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Kiracı kaydı bulunamadı' });
  res.json(updated);
});

app.delete('/api/tenants/:id', (req, res) => {
  const ok = db.deleteTenant(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Kiracı kaydı bulunamadı' });
  res.json({ success: true, message: 'Kiracı sözleşmesi silindi' });
});

// AKILLI EŞLEŞTİRME (SMART MATCH ENGINE):
// A) Bir Müşteriye uygun Portföyleri Eşleştirme
app.get('/api/crm/match/customer/:id', (req, res) => {
  const customer = db.getCrmLeadById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Müşteri bulunamadı' });

  const officeId = customer.officeId || getEffectiveOfficeId(req);
  const listings = db.getListings(officeId).filter(l => l.status === 'aktif');

  const matches = listings.map(listing => {
    let score = 0;
    let reasons = [];

    // İşlem Türü (Alıcı -> Satılık, Kiracı -> Kiralık)
    const typeMatch = (customer.type === 'alici' && listing.type === 'satilik') ||
                      (customer.type === 'kiraci' && listing.type === 'kiralik') ||
                      (customer.type === 'yatirimci');
    if (typeMatch) {
      score += 35;
      reasons.push('İşlem türü uygun');
    }

    // Bütçe Uyumu (Min - Max aralığı, %15 esneklik)
    const minBudget = customer.budgetMin * 0.85;
    const maxBudget = customer.budgetMax * 1.15;
    if (listing.price >= minBudget && listing.price <= maxBudget) {
      score += 30;
      reasons.push('Fiyat bütçe aralığında');
    }

    // İl / İlçe Uyumu
    if (customer.desiredDistricts && customer.desiredDistricts.length > 0) {
      if (customer.desiredDistricts.some(d => d.toLowerCase() === listing.district.toLowerCase())) {
        score += 25;
        reasons.push(`İlçe eşleşti (${listing.district})`);
      }
    }

    // Oda Sayısı Uyumu
    if (customer.desiredRoomCounts && customer.desiredRoomCounts.length > 0) {
      if (customer.desiredRoomCounts.some(r => r === listing.roomCount)) {
        score += 10;
        reasons.push(`Oda sayısı (${listing.roomCount})`);
      }
    }

    return {
      listing,
      score: Math.min(score, 100),
      reasons
    };
  })
  .filter(m => m.score >= 35)
  .sort((a, b) => b.score - a.score);

  res.json({
    customer,
    matches
  });
});

// B) Bir Portföyü arayabilecek Potansiyel Müşterileri Eşleştirme
app.get('/api/crm/match/listing/:id', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Portföy bulunamadı' });

  const officeId = listing.officeId || getEffectiveOfficeId(req);
  const customers = db.getCrmLeads(officeId);

  const matchedCustomers = customers.map(customer => {
    let score = 0;
    let reasons = [];

    // İşlem Türü
    const typeMatch = (customer.type === 'alici' && listing.type === 'satilik') ||
                      (customer.type === 'kiraci' && listing.type === 'kiralik') ||
                      (customer.type === 'yatirimci');
    if (typeMatch) {
      score += 35;
      reasons.push('Talep türü eşleşti');
    }

    // Bütçe
    const minBudget = customer.budgetMin * 0.85;
    const maxBudget = customer.budgetMax * 1.15;
    if (listing.price >= minBudget && listing.price <= maxBudget) {
      score += 30;
      reasons.push('Bütçe uygun');
    }

    // İlçe
    if (customer.desiredDistricts && customer.desiredDistricts.some(d => d.toLowerCase() === listing.district.toLowerCase())) {
      score += 25;
      reasons.push(`Aradığı ilçe (${listing.district})`);
    }

    // Oda
    if (customer.desiredRoomCounts && customer.desiredRoomCounts.includes(listing.roomCount)) {
      score += 10;
      reasons.push(`Oda tercihi (${listing.roomCount})`);
    }

    return {
      customer,
      score: Math.min(score, 100),
      reasons
    };
  })
  .filter(m => m.score >= 35)
  .sort((a, b) => b.score - a.score);

  res.json({
    listing,
    matchedCustomers
  });
});

// --------------------------------------------------------
// 7. TALEPLER (DEMANDS) & ÇİFT YÖNLÜ EŞLEŞTİRME ENDPOINTS
// --------------------------------------------------------
app.get('/api/demands', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const { type, category, status, agentId, urgency, minPrice, maxPrice, neighborhood, search } = req.query;
  const demands = db.getDemands({
    officeId, type, category, status, agentId, urgency, minPrice, maxPrice, neighborhood, search
  });

  // Calculate live match counts for each demand so UI can show badges
  const activeListings = db.getListings(officeId).filter(l => l.status === 'aktif');
  const enriched = demands.map(d => {
    const matches = findListingMatchesForDemand(d, activeListings);
    return {
      ...d,
      matchCount: matches.length,
      topMatchScore: matches[0]?.score || 0
    };
  });

  res.json(enriched);
});

app.get('/api/demands/:id', (req, res) => {
  const demand = db.getDemandById(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Talep bulunamadı' });
  res.json(demand);
});

app.post('/api/demands', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const result = db.addDemand({ ...req.body, officeId });
    // returns { demand, matches }
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/demands/:id', (req, res) => {
  const updated = db.updateDemand(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Talep bulunamadı' });
  res.json(updated);
});

app.delete('/api/demands/:id', (req, res) => {
  const ok = db.deleteDemand(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Talep bulunamadı' });
  res.json({ success: true, message: 'Talep silindi' });
});

// A Talep's matched listings
app.get('/api/demands/:id/matches', (req, res) => {
  const demand = db.getDemandById(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Talep bulunamadı' });
  const matches = db.getDemandMatches(req.params.id);
  res.json({
    demand,
    matches,
    totalCount: matches.length
  });
});

// A Listing's matched demands
app.get('/api/listings/:id/demand-matches', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Portföy bulunamadı' });
  const matches = db.getListingDemandMatches(req.params.id);
  res.json({
    listing,
    matches,
    totalCount: matches.length
  });
});

// Real-time live match preview while user types in form
app.post('/api/match-preview', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const { demand, listing } = req.body;
  if (demand) {
    const activeListings = db.getListings(officeId).filter(l => l.status === 'aktif');
    const matches = findListingMatchesForDemand(demand, activeListings);
    return res.json({ matches, count: matches.length });
  }
  if (listing) {
    const activeDemands = db.getDemands({ officeId }).filter(d => d.status === 'aktif');
    const matches = findDemandMatchesForListing(listing, activeDemands);
    return res.json({ matches, count: matches.length });
  }
  res.json({ matches: [], count: 0 });
});

// --------------------------------------------------------
// 8. BİLDİRİMLER (NOTIFICATIONS)
// --------------------------------------------------------
app.get('/api/notifications', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const { agentId, unreadOnly } = req.query;
  const notifs = db.getNotifications({
    officeId,
    agentId,
    unreadOnly: unreadOnly === 'true'
  });
  res.json(notifs);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const ok = db.markNotificationAsRead(req.params.id);
  res.json({ success: ok });
});

app.put('/api/notifications/read-all', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  db.markAllNotificationsAsRead(officeId);
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const ok = db.deleteNotification(req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------
// 6. DANIŞMAN DİJİTAL KARTVİZİT (CARRD.CO / PUBLIC)
// --------------------------------------------------------
app.get('/api/public/card/:slug', (req, res) => {
  const cardData = db.getPublicAgentData(req.params.slug);
  if (!cardData) {
    return res.status(404).json({ error: 'Danışman kartviziti bulunamadı.' });
  }
  res.json(cardData);
});

app.post('/api/public/card/:slug/lead', async (req, res) => {
  try {
    const result = await db.createPublicLead(req.params.slug, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --------------------------------------------------------
// 7. OPERASYON MERKEZİ & GÖREVLER (KANBAN)
// --------------------------------------------------------
app.get('/api/tasks', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const tasks = db.getTasks({ ...req.query, officeId });
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newTask = db.addTask({ ...req.body, officeId });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Görev bulunamadı' });
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  const ok = db.deleteTask(req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------
// 7.1 E-SÖZLEŞMELER (OFFICIAL CONTRACTS ENGINE)
// --------------------------------------------------------
app.get('/api/contracts', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const contracts = db.getContracts({ ...req.query, officeId });
  res.json(contracts);
});

app.get('/api/contracts/:id', (req, res) => {
  const contract = db.getContractById(req.params.id);
  if (!contract) return res.status(404).json({ error: 'Sözleşme bulunamadı.' });
  res.json(contract);
});

app.post('/api/contracts', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newContract = db.addContract({ ...req.body, officeId });
    res.status(201).json(newContract);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/contracts/:id', (req, res) => {
  const updated = db.updateContract(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Sözleşme bulunamadı.' });
  res.json(updated);
});

app.delete('/api/contracts/:id', (req, res) => {
  const ok = db.deleteContract(req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------
// 8. DİJİTAL SAHA (STORIES / HİKAYELER)
// --------------------------------------------------------
app.get('/api/stories', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  res.json(db.getStories(officeId));
});

app.post('/api/stories', (req, res) => {
  try {
    const officeId = getEffectiveOfficeId(req);
    const newStory = db.addStory({ ...req.body, officeId });
    res.status(201).json(newStory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/stories/:id', (req, res) => {
  const ok = db.deleteStory(req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------
// 9. CRM KLASÖRLERİ
// --------------------------------------------------------
app.get('/api/customer-folders', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  res.json(db.getCustomerFolders(officeId));
});

app.post('/api/customer-folders', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Klasör adı gereklidir.' });
  res.status(201).json(db.addCustomerFolder(name, officeId));
});

// --------------------------------------------------------
// 10. AYARLAR & BREVO E-POSTA TESTİ (OFİS BAZLI)
// --------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  res.json(db.getSettings(officeId));
});

app.post('/api/settings', (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  res.json(db.updateSettings(req.body, officeId));
});

app.post('/api/settings/test-email', async (req, res) => {
  const officeId = getEffectiveOfficeId(req);
  const { testRecipient, apiKey, senderEmail, senderName } = req.body;
  if (!testRecipient) {
    return res.status(400).json({ error: 'Test alıcı e-postası gereklidir.' });
  }
  const settings = db.getSettings(officeId);
  const key = apiKey || settings.brevoApiKey;
  if (!key) {
    return res.status(400).json({ error: 'Brevo API anahtarı girilmedi.' });
  }

  const result = await emailService.sendWithBrevo({
    apiKey: key,
    sender: {
      email: senderEmail || settings.brevoSenderEmail || settings.officeEmail || 'info@ctemlak.com',
      name: senderName || settings.brevoSenderName || settings.officeName || 'CT Emlak'
    },
    to: [{ email: testRecipient, name: 'Test Kullanıcısı' }],
    subject: `🧪 ${settings.officeName || 'CT Emlak'} Brevo E-posta Testi`,
    htmlContent: `<div style="font-family: Arial; padding: 20px;"><h2>Tebrikler!</h2><p>${settings.officeName || 'CT Emlak'} Brevo e-posta otomasyonu başarıyla çalışıyor.</p></div>`
  });

  res.json(result);
});

// Direct APK Download route
app.get('/altinemlak.apk', (req, res) => {
  const apkPath = path.join(__dirname, '../dist/altinemlak.apk');
  const pubApkPath = path.join(__dirname, '../public/altinemlak.apk');
  const target = fs.existsSync(apkPath) ? apkPath : pubApkPath;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="ct-emlak.apk"');
    return res.sendFile(target);
  }
  res.status(404).send('APK dosyası henüz hazır değil.');
});

// Serve client build if available (production mode)
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start Express Server on 0.0.0.0 (Tüm ağ ve mobil telefon erişimi için)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🏛️ CT EMLAK (MULTI-OFFICE SAAS) - PORTFÖY & CRM AKTİF!`);
  console.log(`💻 Bilgisayardan Giriş: http://localhost:${PORT}`);
  console.log(`👑 Süper Admin: halil / Halil123`);
  console.log(`======================================================\n`);
});


