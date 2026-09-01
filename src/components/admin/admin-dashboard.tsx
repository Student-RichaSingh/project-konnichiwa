"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

import { UserType, EventType, RegistrationType } from './types';
import { AdminSidebar } from './admin-sidebar';
import { OverviewTab } from './tabs/overview-tab';
import { EventsTab } from './tabs/events-tab';
import { RegistrationsTab } from './tabs/registrations-tab';
import { AttendanceTab } from './tabs/attendance-tab';
import { MailTab } from './tabs/mail-tab';
import { UsersTab } from './tabs/users-tab';
import { PeopleTab } from './tabs/people-tab';
import { ProfileTab } from './tabs/profile-tab';

function toDatetimeLocal(val?: string | Date | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  return `${Y}-${M}-${D}T${h}:${m}`;
}

function toTimeInputValue(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d:[0-5]\d$/.test(trimmed)) {
    return '0' + trimmed;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (match) {
    let [ , hStr, mStr, meridiem ] = match;
    let h = parseInt(hStr, 10);
    const m = mStr;
    if (meridiem) {
      if (meridiem.toLowerCase() === 'pm' && h < 12) h += 12;
      if (meridiem.toLowerCase() === 'am' && h === 12) h = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m}`;
  }
  return '';
}

export function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'registrations' | 'attendance' | 'mail' | 'users' | 'people' | 'profile'
  >('overview');
  
  // Data States
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationType[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [eventSearch, setEventSearch] = useState('');
  const [registrationSearch, setRegistrationSearch] = useState('');

  // Mail Manager State
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailMessage, setMailMessage] = useState<string | null>(null);

  // Event Form State
  const [eventFormMode, setEventFormMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'upcoming',
    coverImageUrl: '',
    googleFormLink: '',
    whatsappGroupLink: '',
    ruleBookUrl: '',
    registrationDeadline: '',
    forceGoogleForm: false,
    useCustomForm: false,
    registrationType: 'individual',
    teamMinSize: 2,
    teamMaxSize: 4,
  });

  const [registrationFields, setRegistrationFields] = useState<any[]>([]);
  const [participantFields, setParticipantFields] = useState<any[]>([]);
  const [resources, setResources] = useState<{ label: string; url: string }[]>([{ label: '', url: '' }]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Verify Admin Auth (runs on mount)
  useEffect(() => {
    let isCancelled = false;

    // Safety timeout: never stay stuck on authenticating loader indefinitely
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setAuthLoading(false);
      }
    }, 6000);

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        
        if (!data.success || (data.user?.role !== 'admin' && data.user?.role !== 'member')) {
          throw new Error("Access denied. Admin or Executive Member required.");
        }
        
        if (!isCancelled) {
          setAdminUser(data.user);
          setAuthLoading(false);
          fetchInitialData();
        }
      } catch (err: any) {
        console.error("Auth verification failed", err);
        if (!isCancelled) {
          setAuthLoading(false);
          router.replace('/admin');
        }
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [router]);

  const [allowSignup, setAllowSignup] = useState<boolean>(true);

  const fetchInitialData = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setAllowSignup(Boolean(settingsData.settings.allowSignup));
        }
      }

      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setAllUsers(usersData.users || []);
          setPendingUsers((usersData.users || []).filter((u: UserType) => u.status === 'pending'));
        }
      }

      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          const fetchedEvents = eventsData.events || [];
          setEvents(fetchedEvents);
          if (fetchedEvents.length > 0 && !selectedEventId) {
            setSelectedEventId(fetchedEvents[0]._id);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleToggleSignup = async () => {
    const nextVal = !allowSignup;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowSignup: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setAllowSignup(Boolean(data.allowSignup));
        showNotification(data.message);
      } else {
        showNotification(data.message || 'Failed to update signup settings');
      }
    } catch {
      showNotification('Error updating signup setting');
    }
  };

  // Fetch registrations when selectedEventId or active tab changes
  useEffect(() => {
    if (!selectedEventId || (activeTab !== 'registrations' && activeTab !== 'attendance')) return;
    const controller = new AbortController();
    fetchRegistrations(selectedEventId, controller.signal);
    return () => { controller.abort(); };
  }, [selectedEventId, activeTab]);

  const fetchRegistrations = async (eventId: string, signal?: AbortSignal) => {
    if (!eventId) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/registrations?eventId=${eventId}`, signal ? { signal } : undefined);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRegistrations(data.registrations || []);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Fetch registrations error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const nameMatch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase());
      const usernameMatch = u.username.toLowerCase().includes(userSearch.toLowerCase());
      const emailMatch = u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesSearch = nameMatch || usernameMatch || emailMatch;
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  // Filtered Events computation
  const filteredEvents = useMemo(() => {
    return events.filter(e => e.title.toLowerCase().includes(eventSearch.toLowerCase()));
  }, [events, eventSearch]);

  // Filtered Registrations computation
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const name = r.teamLeaderName || (r.user ? `${r.user.firstName} ${r.user.lastName}` : '');
      const email = r.email || r.user?.email || '';
      const regId = r.registrationId || r.teamName || '';
      return (
        name.toLowerCase().includes(registrationSearch.toLowerCase()) ||
        email.toLowerCase().includes(registrationSearch.toLowerCase()) ||
        regId.toLowerCase().includes(registrationSearch.toLowerCase())
      );
    });
  }, [registrations, registrationSearch]);

  // Export registrations to CSV
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;
    const headers = ["Registration ID", "Name/Leader", "Email", "Mobile", "Date"];
    const rows = filteredRegistrations.map(r => [
      r.registrationId || r.teamName || r._id,
      r.teamLeaderName || (r.user ? `${r.user.firstName} ${r.user.lastName}` : ''),
      r.email || r.user?.email || '',
      r.mobile || r.user?.mobile || '',
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(x => `"${x}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrations_${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // User Actions (Approve, Deny, Update User)
  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showNotification("User approved successfully!");
        fetchInitialData();
      } else {
        alert(data.message || "Failed to approve user.");
      }
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleDenyUser = async (userId: string) => {
    if (!confirm("Deny registration? This will delete the user entry.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification("User deleted.");
        fetchInitialData();
      } else {
        alert(data.message || "Failed to deny user.");
      }
    } catch (err) {
      console.error("Error denying user:", err);
    }
  };

  const handleUpdateUser = async (user: UserType) => {
    setUpdatingUserId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user.role,
          batch: user.batch ?? null,
          post: user.post || '',
          rollNo: user.rollNo || '',
          hideAchievementsCard: user.hideAchievementsCard,
          status: user.status
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("User updated successfully!");
        fetchInitialData();
      } else {
        alert(data.message || "Failed to update user.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Event Actions
  const handleEditEventClick = (event: EventType) => {
    setEditingEventId(event._id);
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';

    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: formattedDate,
      time: toTimeInputValue(event.time),
      status: event.status || 'upcoming',
      coverImageUrl: event.coverImageUrl || '',
      googleFormLink: event.googleFormLink || '',
      whatsappGroupLink: event.whatsappGroupLink || '',
      ruleBookUrl: event.ruleBookUrl || '',
      registrationDeadline: toDatetimeLocal(event.registrationDeadline),
      forceGoogleForm: !!event.forceGoogleForm,
      useCustomForm: !!event.useCustomForm,
      registrationType: event.registrationType || 'individual',
      teamMinSize: event.teamMinSize || 2,
      teamMaxSize: event.teamMaxSize || 4,
    });

    setRegistrationFields(event.registrationFields || []);
    setParticipantFields(event.participantFields || []);
    setResources(event.resources && event.resources.length > 0 ? event.resources : [{ label: '', url: '' }]);

    setEventFormMode('edit');
  };

  const handleCreateEventClick = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      status: 'upcoming',
      coverImageUrl: '',
      googleFormLink: '',
      whatsappGroupLink: '',
      ruleBookUrl: '',
      registrationDeadline: '',
      forceGoogleForm: false,
      useCustomForm: false,
      registrationType: 'individual',
      teamMinSize: 2,
      teamMaxSize: 4,
    });

    setRegistrationFields([]);
    setParticipantFields([]);
    setResources([{ label: '', url: '' }]);

    setEventFormMode('create');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification("Event deleted.");
        setEvents(prev => prev.filter(e => e._id !== eventId));
      } else {
        alert(data.message || "Failed to delete event.");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDataLoading(true);

    const url = eventFormMode === 'create' ? '/api/events' : `/api/events/${editingEventId}`;
    const method = eventFormMode === 'create' ? 'POST' : 'PATCH';

    const payload = {
      ...eventForm,
      registrationDeadline: eventForm.registrationDeadline
        ? new Date(eventForm.registrationDeadline).toISOString()
        : null,
      registrationFields: eventForm.useCustomForm ? registrationFields : [],
      participantFields: eventForm.registrationType === 'team' && eventForm.useCustomForm ? participantFields : [],
      resources: resources.filter(r => r.label.trim() && r.url.trim()),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save event");
      }

      showNotification("Event saved successfully!");
      fetchInitialData();
      setEventFormMode('list');
    } catch (err: any) {
      setError(err.message || "Error saving event.");
    } finally {
      setDataLoading(false);
    }
  };

  // Send Mail Action
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Please select an event.");
      return;
    }
    setMailSending(true);
    setMailMessage(null);
    try {
      const res = await fetch('/api/admin/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          subject: mailSubject,
          body: mailBody
        })
      });
      const data = await res.json();
      if (data.success) {
        setMailMessage(`Mail queued! ${data.message || ''}`);
        setMailSubject('');
        setMailBody('');
      } else {
        setMailMessage(`Error: ${data.message || 'Failed to send mail.'}`);
      }
    } catch (err) {
      console.error("Send mail error:", err);
      setMailMessage("Error sending email.");
    } finally {
      setMailSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090B14] text-slate-300 font-sans gap-3">
        <FiLoader className="size-8 animate-spin text-[#F47174]" />
        <span className="text-sm font-semibold tracking-wide text-white">Authenticating Administrative Access...</span>
        <span className="text-xs text-slate-500 font-mono">PTSC Security Gateway</span>
      </div>
    );
  }

  return (
    <div data-admin-panel="true" className="min-h-screen flex bg-[#090B14] text-slate-100 font-sans selection:bg-[#F47174]/30">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-white text-black text-xs font-mono font-semibold rounded-lg border border-white/20 shadow-2xl flex items-center gap-2 animate-bounce">
          <FiCheck className="size-4" /> {toastMessage}
        </div>
      )}

      {/* Modern Monochrome Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setEventFormMode('list'); }}
        pendingCount={pendingUsers.length}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        {error && (
          <div className="mb-5 p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-mono flex items-center gap-2.5">
            <FiAlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab
            adminUser={adminUser}
            allUsersCount={allUsers.length}
            pendingUsersCount={pendingUsers.length}
            eventsCount={events.length}
            onNavigateToUsers={() => setActiveTab('users')}
            onNavigateToNewEvent={() => { setActiveTab('events'); handleCreateEventClick(); }}
          />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsTab
            eventFormMode={eventFormMode}
            setEventFormMode={setEventFormMode}
            filteredEvents={filteredEvents}
            eventSearch={eventSearch}
            setEventSearch={setEventSearch}
            dataLoading={dataLoading}
            onEditClick={handleEditEventClick}
            onCreateClick={handleCreateEventClick}
            onDeleteClick={handleDeleteEvent}
            eventForm={eventForm}
            setEventForm={setEventForm}
            registrationFields={registrationFields}
            setRegistrationFields={setRegistrationFields}
            participantFields={participantFields}
            setParticipantFields={setParticipantFields}
            resources={resources}
            setResources={setResources}
            onFormSubmit={handleEventFormSubmit}
            onRefreshEvents={fetchInitialData}
          />
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <RegistrationsTab
            events={events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            adminUser={adminUser}
          />
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            events={events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
          />
        )}

        {/* Mail Manager Tab */}
        {activeTab === 'mail' && (
          <MailTab
            events={events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
          />
        )}

        {/* Users & Roles Tab */}
        {activeTab === 'users' && (
          <UsersTab
            filteredUsers={filteredUsers}
            setAllUsers={setAllUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            dataLoading={dataLoading}
            updatingUserId={updatingUserId}
            allowSignup={allowSignup}
            onToggleSignup={handleToggleSignup}
            onApproveUser={handleApproveUser}
            onDenyUser={handleDenyUser}
            onUpdateUser={handleUpdateUser}
            onRefresh={fetchInitialData}
          />
        )}

        {/* People & Alumni Manager Tab */}
        {activeTab === 'people' && (
          <PeopleTab />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab adminUser={adminUser} />
        )}
      </main>
    </div>
  );
}
