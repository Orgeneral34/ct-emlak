import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PwaInstallBanner from './components/PwaInstallBanner';

import ListingsView from './components/ListingsView';
import ListingDetailModal from './components/ListingDetailModal';
import ListingFormWizard from './components/ListingFormWizard';
import ProjectsView from './components/ProjectsView';
import ProjectDetailModal from './components/ProjectDetailModal';
import ProjectFormWizard from './components/ProjectFormWizard';
import AgentPublicCard from './components/AgentPublicCard';
import OperationCenterTasks from './components/OperationCenterTasks';
import ContractsView from './components/ContractsView';
import DigitalFieldFeed from './components/DigitalFieldFeed';
import AgentWebsiteManager from './components/AgentWebsiteManager';

import MapView from './components/MapView';

import PerformanceView from './components/PerformanceView';
import DealFormModal from './components/DealFormModal';
import TargetFormModal from './components/TargetFormModal';
import WeeklyReportModal from './components/WeeklyReportModal';

import CrmView from './components/CrmView';
import CustomerDetailModal from './components/CustomerDetailModal';
import CustomerFormModal from './components/CustomerFormModal';
import SmartMatchModal from './components/SmartMatchModal';

import DemandsView from './components/DemandsView';
import DemandFormModal from './components/DemandFormModal';
import MatchAlertModal from './components/MatchAlertModal';
import NotificationsDrawer from './components/NotificationsDrawer';

import AgentsDirectoryView from './components/AgentsDirectoryView';
import BrokerAdminView from './components/BrokerAdminView';
import SuperAdminOfficesView from './components/SuperAdminOfficesView';
import LoginModal from './components/LoginModal';
import LoginScreen from './components/LoginScreen';
import UserGuideView from './components/UserGuideView';
import LegalComplianceView from './components/LegalComplianceView';
import StorePublicPages from './components/StorePublicPages';

function MainApp() {
  const { currentUser, currentOffice, isBroker, isSuperAdmin, isLoginModalOpen, setIsLoginModalOpen } = useAuth();

  // Slug routing check (Örn: /halilceylan veya /ahmet)
  const getInitialSlug = () => {
    const rawPath = window.location.pathname.replace(/^\//, '').split('/')[0];
    const systemPaths = ['api', 'uploads', 'admin', 'login', 'assets'];
    if (rawPath && !systemPaths.includes(rawPath.toLowerCase()) && !rawPath.includes('.')) {
      return rawPath;
    }
    return null;
  };

  const [publicSlug, setPublicSlug] = useState(getInitialSlug());

  useEffect(() => {
    const onPop = () => {
      setPublicSlug(getInitialSlug());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Navigation tab: 'listings', 'field', 'operations', 'crm', 'website', 'map', 'demands', 'performance', 'agents', 'broker_admin', 'guide'
  const [activeTab, setActiveTab] = useState('listings');

  // Listings State
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);
  const [listingInitialCategory, setListingInitialCategory] = useState(null);
  const [mapTargetListing, setMapTargetListing] = useState(null);

  const handleOpenNewListing = (category = null) => {
    setListingToEdit(null);
    setListingInitialCategory(typeof category === 'string' ? category : null);
    setShowListingForm(true);
  };

  // Projects State
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    city: 'all',
    district: 'all',
    roomCount: 'all',
    agentId: 'all',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  // CRM State
  const [crmLeads, setCrmLeads] = useState([]);
  const [loadingCrm, setLoadingCrm] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Demands & Matching State
  const [demands, setDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(true);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [demandToEdit, setDemandToEdit] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // Mobile Sidebar Drawer State
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Tasks State (for sidebar badges and operasyon)
  const [tasks, setTasks] = useState([]);

  // Instant Celebration / Match Alert Modal
  const [matchAlertData, setMatchAlertData] = useState(null);

  // Performance Modals
  const [showDealForm, setShowDealForm] = useState(false);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  // Smart Match Modal
  const [smartMatchTarget, setSmartMatchTarget] = useState(null);

  // Initial load & reload when office or user changes
  useEffect(() => {
    if (!currentUser) return;
    loadListings();
    loadProjects();
    loadCrmLeads();
    loadDemands();
    loadNotifications();
    loadTasks();
  }, [filters, currentUser?.id, currentOffice?.id, isBroker]);

  useEffect(() => {
    if (currentOffice?.name) {
      document.title = `${currentOffice.name} | CT Emlak CRM by ceylantek.com`;
    } else {
      document.title = 'CT Emlak - Kurumsal Portföy, Performans & Emlak CRM by ceylantek.com';
    }
  }, [currentOffice?.name]);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Görevler yükleme hatası:', err);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Projeler yükleme hatası:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      setSelectedProject(null);
      loadProjects();
    } catch (err) {
      console.error('Proje silinemedi:', err);
    }
  };

  const handleUnitUpdated = async (projectId, unitId, updates) => {
    try {
      await api.updateProjectUnit(projectId, unitId, updates);
      await loadProjects();
      const fresh = await api.getProject(projectId);
      if (fresh) setSelectedProject(fresh);
    } catch (err) {
      console.error('Birim güncellenemedi:', err);
    }
  };

  const loadListings = async () => {
    setLoadingListings(true);
    try {
      const data = await api.getListings(filters);
      setListings(data);
    } catch (err) {
      console.error('Portföy yükleme hatası:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const loadCrmLeads = async () => {
    setLoadingCrm(true);
    try {
      const data = await api.getCrmLeads();
      setCrmLeads(data);
    } catch (err) {
      console.error('CRM yükleme hatası:', err);
    } finally {
      setLoadingCrm(false);
    }
  };

  const loadDemands = async () => {
    setLoadingDemands(true);
    try {
      const data = await api.getDemands();
      setDemands(data);
    } catch (err) {
      console.error('Talepler yükleme hatası:', err);
    } finally {
      setLoadingDemands(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications({
        agentId: isBroker ? 'all' : (currentUser?.id || 'all')
      });
      setNotifications(data);
    } catch (err) {
      console.error('Bildirimler yükleme hatası:', err);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id) => {
    if (window.confirm('Bu portföy ilanını silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteListing(id);
        setSelectedListing(null);
        loadListings();
        loadDemands();
        loadNotifications();
      } catch (err) {
        console.error('İlan silinemedi:', err);
      }
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Bu müşteriyi ve talebi silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteCrmLead(id);
        setSelectedCustomer(null);
        loadCrmLeads();
      } catch (err) {
        console.error('Müşteri silinemedi:', err);
      }
    }
  };

  // Delete Demand
  const handleDeleteDemand = async (id) => {
    if (window.confirm('Bu müşteri talebini silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteDemand(id);
        loadDemands();
        loadNotifications();
      } catch (err) {
        console.error('Talep silinemedi:', err);
      }
    }
  };

  // Update CRM Lead Stage
  const handleUpdateLeadStage = async (id, stage) => {
    try {
      await api.updateCrmLead(id, { stage });
      loadCrmLeads();
    } catch (err) {
      console.error('Aşama güncelleme hatası:', err);
    }
  };

  // Mark single notification read
  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Bildirim okundu hatası:', err);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error('Tüm bildirimleri okuma hatası:', err);
    }
  };

  // Notification selection click
  const handleSelectNotification = (notif) => {
    setShowNotificationsDrawer(false);
    if (notif.demandId) {
      setActiveTab('demands');
    } else if (notif.listingId) {
      const found = listings.find(l => l.id === notif.listingId);
      if (found) {
        setSelectedListing(found);
      }
      setActiveTab('listings');
    }
  };

  // Navigate to Map with specific listing
  const handleOpenMapForListing = (listing) => {
    setMapTargetListing(listing);
    setActiveTab('map');
  };

  // Counts for badges
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const matchedDemandsCount = demands.filter(d => (d.matchCount || 0) > 0).length;

  // PUBLIC STORE COMPLIANCE PAGES (/privacy, /support, /delete-account)
  const lowerSlug = (publicSlug || '').toLowerCase();
  if (['privacy', 'gizlilik', 'support', 'destek', 'delete-account', 'hesap-sil'].includes(lowerSlug)) {
    const pageType =
      lowerSlug === 'support' || lowerSlug === 'destek'
        ? 'support'
        : lowerSlug === 'delete-account' || lowerSlug === 'hesap-sil'
        ? 'delete-account'
        : 'privacy';
    return (
      <StorePublicPages
        pageType={pageType}
        onBackToApp={() => {
          window.history.pushState({}, '', '/');
          setPublicSlug(null);
        }}
      />
    );
  }

  // PUBLIC STANDALONE DIGITAL BUSINESS CARD (CARRD.CO STYLE)
  if (publicSlug) {
    return (
      <AgentPublicCard
        slug={publicSlug}
        onNavigateHome={() => {
          window.history.pushState({}, '', '/');
          setPublicSlug(null);
        }}
      />
    );
  }

  // GİRİŞ YAPILMAMIŞSA -> GİRİŞ EKRANINI GÖSTER
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      
      {/* 1. SOL NAVİGASYON MENÜSÜ (SIDEBAR) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotificationsCount={unreadNotificationsCount}
        matchedDemandsCount={matchedDemandsCount}
        tasksCount={tasks.filter(t => t.status !== 'done').length}
        myListingsCount={listings.filter(l => l.agentId === currentUser?.id).length}
        allListingsCount={listings.length}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
        onOpenGuide={() => setActiveTab('guide')}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
      />

      {/* 2. SAĞ ANA ALAN (Masaüstünde Sol Menü Genişliği Kadar Boşluk Bırakır) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        
        {/* PWA Kurulum & Yükleme Banner'ı */}
        <PwaInstallBanner />

        {/* Üst İnce Başlık & Yardımcı Çubuk */}
        <Navbar
          activeTab={activeTab}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setShowNotificationsDrawer(true)}
          onOpenGuide={() => setActiveTab('guide')}
          onToggleMobileMenu={() => setIsOpenMobileSidebar(prev => !prev)}
          onOpenNewListing={handleOpenNewListing}
        />

        {/* Sayfa İçerik Alanı */}
        <main className="flex-1">
          {activeTab === 'super_admin' && isSuperAdmin && (
            <SuperAdminOfficesView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'listings' && (
            <ListingsView
              listings={listings}
              loading={loadingListings}
              filters={filters}
              setFilters={setFilters}
              onSelectListing={(listing) => setSelectedListing(listing)}
              onOpenNewListing={handleOpenNewListing}
              onOpenMapForListing={handleOpenMapForListing}
              onOpenSmartMatchForListing={(listing) => setSmartMatchTarget({ listing })}
              onRefresh={() => {
                loadListings();
                loadDemands();
                loadNotifications();
              }}
              isMyListings={false}
            />
          )}

          {activeTab === 'my_listings' && (
            <ListingsView
              listings={listings}
              loading={loadingListings}
              filters={filters}
              setFilters={setFilters}
              onSelectListing={(listing) => setSelectedListing(listing)}
              onOpenNewListing={handleOpenNewListing}
              onOpenMapForListing={handleOpenMapForListing}
              onOpenSmartMatchForListing={(listing) => setSmartMatchTarget({ listing })}
              onRefresh={() => {
                loadListings();
                loadDemands();
                loadNotifications();
              }}
              isMyListings={true}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              loading={loadingProjects}
              onSelectProject={(p) => setSelectedProject(p)}
              onOpenNewProject={() => {
                setProjectToEdit(null);
                setShowProjectWizard(true);
              }}
              onEditProject={(p) => {
                setProjectToEdit(p);
                setShowProjectWizard(true);
              }}
              onDeleteProject={handleDeleteProject}
              onRefresh={loadProjects}
            />
          )}

          {activeTab === 'map' && (
            <MapView
              listings={listings}
              initialListing={mapTargetListing}
              onSelectListing={(listing) => setSelectedListing(listing)}
            />
          )}

          {activeTab === 'demands' && (
            <DemandsView
              demands={demands}
              loading={loadingDemands}
              onOpenNewDemand={() => {
                setDemandToEdit(null);
                setShowDemandForm(true);
              }}
              onEditDemand={(demand) => {
                setDemandToEdit(demand);
                setShowDemandForm(true);
              }}
              onDeleteDemand={handleDeleteDemand}
              onRefresh={() => {
                loadDemands();
                loadNotifications();
              }}
              onOpenListing={(listing) => {
                setSelectedListing(listing);
                setActiveTab('listings');
              }}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView
              onOpenNewDeal={() => setShowDealForm(true)}
              onOpenTargetModal={() => setShowTargetForm(true)}
              onOpenWeeklyReport={() => setShowWeeklyReport(true)}
            />
          )}

          {activeTab === 'crm' && (
            <CrmView
              crmLeads={crmLeads}
              loading={loadingCrm}
              onSelectCustomer={(cust) => setSelectedCustomer(cust)}
              onOpenNewLead={() => setShowCustomerForm(true)}
              onOpenSmartMatchForCustomer={(cust) => setSmartMatchTarget({ customer: cust })}
              onUpdateLeadStage={handleUpdateLeadStage}
            />
          )}

          {activeTab === 'agents' && (
            <AgentsDirectoryView
              onOpenTargetForAgent={(agent) => setShowTargetForm(true)}
              onFilterAgentListings={(agentId) => {
                setFilters(prev => ({ ...prev, agentId }));
                setActiveTab('listings');
              }}
            />
          )}

          {activeTab === 'field' && (
            <DigitalFieldFeed
              onOpenListingDetail={(l) => setSelectedListing(l)}
              onOpenAgentCard={(slug) => {
                window.history.pushState({}, '', `/${slug}`);
                setPublicSlug(slug);
              }}
            />
          )}

          {(activeTab === 'operations' || activeTab === 'tasks') && (
            <OperationCenterTasks />
          )}

          {activeTab === 'website' && (
            <AgentWebsiteManager
              onOpenPublicCard={(slug) => {
                window.history.pushState({}, '', `/${slug}`);
                setPublicSlug(slug);
              }}
            />
          )}

          {activeTab === 'broker_admin' && (
            <BrokerAdminView />
          )}

          {activeTab === 'legal' && (
            <LegalComplianceView onNavigateContracts={() => setActiveTab('contracts')} />
          )}

          {activeTab === 'guide' && (
            <UserGuideView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </main>
      </div>

      {/* Mobil Alt Navigasyon Çubuğu */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'map') setMapTargetListing(null);
          setActiveTab(tab);
        }}
        onOpenNewListing={handleOpenNewListing}
        onOpenNewProject={() => {
          setProjectToEdit(null);
          setShowProjectWizard(true);
        }}
        onOpenNewDemand={() => {
          setDemandToEdit(null);
          setShowDemandForm(true);
        }}
        onOpenNewDeal={() => setShowDealForm(true)}
        onOpenNewLead={() => setShowCustomerForm(true)}
      />

      {/* --- TÜM MODALLAR --- */}

      {/* 0.1 Proje Detay Modalı (Daire & Parsel Matrisi) */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={(p) => {
            setSelectedProject(null);
            setProjectToEdit(p);
            setShowProjectWizard(true);
          }}
          onUnitUpdated={handleUnitUpdated}
        />
      )}

      {/* 0.2 Yeni / Düzenle Proje Sihirbazı */}
      {showProjectWizard && (
        <ProjectFormWizard
          projectToEdit={projectToEdit}
          onClose={() => {
            setShowProjectWizard(false);
            setProjectToEdit(null);
          }}
          onSaveSuccess={(saved) => {
            setShowProjectWizard(false);
            setProjectToEdit(null);
            loadProjects();
            if (saved?.id) {
              setSelectedProject(saved);
            }
          }}
        />
      )}

      {/* 1. İlan Detay Modalı */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onEdit={(l) => {
            setSelectedListing(null);
            setListingToEdit(l);
            setListingInitialCategory(null);
            setShowListingForm(true);
          }}
          onDelete={handleDeleteListing}
          onOpenMap={(l) => handleOpenMapForListing(l)}
          onOpenSmartMatch={(l) => setSmartMatchTarget({ listing: l })}
        />
      )}

      {/* 2. Yeni / Düzenle İlan Sihirbazı (5 Aşama Kurumsal Altyapı) */}
      {showListingForm && (
        <ListingFormWizard
          listingToEdit={listingToEdit}
          initialCategory={listingInitialCategory}
          onClose={() => {
            setShowListingForm(false);
            setListingToEdit(null);
            setListingInitialCategory(null);
          }}
          onSaveSuccess={(result) => {
            setShowListingForm(false);
            setListingToEdit(null);
            setListingInitialCategory(null);
            loadListings();
            loadDemands();
            loadNotifications();

            // Portföy girildiğinde eşleşen talepler varsa anlık kutlama modalı aç
            if (result?.matchedDemands && result.matchedDemands.length > 0) {
              setMatchAlertData({
                type: 'listing_matched_demands',
                sourceItem: result,
                matches: result.matchedDemands
              });
            }
          }}
        />
      )}

      {/* 3. Satış Kapat / Ciro Girişi Modalı */}
      {showDealForm && (
        <DealFormModal
          listings={listings}
          onClose={() => setShowDealForm(false)}
          onDealSuccess={() => {
            setShowDealForm(false);
            loadListings();
            setActiveTab('performance');
          }}
        />
      )}

      {/* 4. Broker Danışman Hedef Atama Modalı */}
      {showTargetForm && (
        <TargetFormModal
          onClose={() => setShowTargetForm(false)}
          onTargetSaved={() => {
            setShowTargetForm(false);
            setActiveTab('performance');
          }}
        />
      )}

      {/* 5. Haftalık Rapor Modalı (Yazdır / PDF) */}
      {showWeeklyReport && (
        <WeeklyReportModal
          onClose={() => setShowWeeklyReport(false)}
        />
      )}

      {/* 6. Müşteri Detay Modalı */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onOpenSmartMatch={(c) => setSmartMatchTarget({ customer: c })}
          onCustomerUpdated={(updated) => {
            setSelectedCustomer(updated);
            loadCrmLeads();
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {/* 7. Yeni Müşteri / Talep Ekleme Modalı */}
      {showCustomerForm && (
        <CustomerFormModal
          onClose={() => setShowCustomerForm(false)}
          onLeadCreated={(lead) => {
            setShowCustomerForm(false);
            loadCrmLeads();
            setSmartMatchTarget({ customer: lead });
          }}
        />
      )}

      {/* 8. Akıllı Eşleştirme (Smart Match) Modalı */}
      {smartMatchTarget && (
        <SmartMatchModal
          customer={smartMatchTarget.customer}
          listing={smartMatchTarget.listing}
          onClose={() => setSmartMatchTarget(null)}
          onSelectListing={(l) => {
            setSmartMatchTarget(null);
            setSelectedListing(l);
          }}
          onSelectCustomer={(c) => {
            setSmartMatchTarget(null);
            setSelectedCustomer(c);
          }}
        />
      )}

      {/* 9. Talep Ekleme / Düzenleme Modalı */}
      {showDemandForm && (
        <DemandFormModal
          demandToEdit={demandToEdit}
          onClose={() => {
            setShowDemandForm(false);
            setDemandToEdit(null);
          }}
          onSaveSuccess={(result) => {
            setShowDemandForm(false);
            setDemandToEdit(null);
            loadDemands();
            loadNotifications();

            // Talep girildiğinde eşleşen portföyler varsa anlık kutlama modalı aç
            if (result?.matches && result.matches.length > 0) {
              setMatchAlertData({
                type: 'demand_matched_listings',
                sourceItem: result.demand || result,
                matches: result.matches
              });
            }
          }}
        />
      )}

      {/* 10. Anlık Eşleşme Bildirim / Kutlama Modalı */}
      {matchAlertData && (
        <MatchAlertModal
          type={matchAlertData.type}
          sourceItem={matchAlertData.sourceItem}
          matches={matchAlertData.matches}
          onClose={() => setMatchAlertData(null)}
          onOpenListing={(listing) => {
            setMatchAlertData(null);
            setSelectedListing(listing);
            setActiveTab('listings');
          }}
          onOpenDemand={(demand) => {
            setMatchAlertData(null);
            setActiveTab('demands');
          }}
        />
      )}

      {/* 11. Eşleşme Bildirimleri Çekmecesi (Drawer) */}
      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* 12. Kullanıcı Giriş & Kimlik Doğrulama Modalı */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
