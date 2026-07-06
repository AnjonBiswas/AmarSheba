import { BarChart3, Briefcase, FileClock, Mail, Save, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const APPLICATION_STATUSES = ['pending', 'processing', 'approved', 'rejected'];

function Panel({ children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {text}
    </div>
  );
}

function getToken() {
  return localStorage.getItem('amarsheba-auth-token') || '';
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

export default function AdminDashboard() {
  const { t } = useLocale();
  usePageTitle(t('admin.title'));

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalApplications: 0,
    pendingApplications: 0,
    contactMessages: 0,
  });
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    title_en: '',
    title_bn: '',
    category: '',
    description_en: '',
    description_bn: '',
    required_documents: '',
    fee: '',
    processing_time: '',
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [submittingService, setSubmittingService] = useState(false);
  const [serviceMessage, setServiceMessage] = useState('');
  const [applicationSavingId, setApplicationSavingId] = useState(null);

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('admin.tabs.overview'), icon: BarChart3 },
      { id: 'contacts', label: t('admin.tabs.contacts'), icon: Mail },
      { id: 'services', label: t('admin.tabs.services'), icon: Briefcase },
      { id: 'applications', label: t('admin.tabs.applications'), icon: FileClock },
    ],
    [t],
  );

  const stats = [
    { label: t('admin.totalUsers'), value: overview.totalUsers, icon: Users },
    { label: t('admin.totalServices'), value: overview.totalServices, icon: Briefcase },
    { label: t('admin.totalApplications'), value: overview.totalApplications, icon: FileClock },
    { label: t('admin.pendingApplications'), value: overview.pendingApplications, icon: FileClock },
    { label: t('admin.contactMessages'), value: overview.contactMessages, icon: Mail },
  ];

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [overviewData, servicesData, applicationsData, contactsData] = await Promise.all([
        apiRequest('/admin/overview'),
        apiRequest('/services'),
        apiRequest('/applications'),
        apiRequest('/contact'),
      ]);

      setOverview(overviewData.overview);
      setServices(servicesData.services);
      setApplications(applicationsData.applications);
      setContacts(contactsData.contacts);
    } catch (loadError) {
      setError(loadError.message || t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm({
      title_en: '',
      title_bn: '',
      category: '',
      description_en: '',
      description_bn: '',
      required_documents: '',
      fee: '',
      processing_time: '',
    });
  };

  const startEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceMessage('');
    setServiceForm({
      title_en: service.title_en || '',
      title_bn: service.title_bn || '',
      category: service.category || '',
      description_en: service.description_en || '',
      description_bn: service.description_bn || '',
      required_documents: service.required_documents || '',
      fee: service.fee || '',
      processing_time: service.processing_time || '',
    });
  };

  const submitService = async (event) => {
    event.preventDefault();
    setSubmittingService(true);
    setServiceMessage('');

    try {
      const method = editingServiceId ? 'PUT' : 'POST';
      const path = editingServiceId ? `/services/${editingServiceId}` : '/services';

      await apiRequest(path, {
        method,
        body: JSON.stringify(serviceForm),
      });

      setServiceMessage(editingServiceId ? t('admin.serviceUpdated') : t('admin.serviceCreated'));
      resetServiceForm();
      await loadDashboardData();
    } catch (submitError) {
      setServiceMessage(submitError.message || t('admin.serviceSaveError'));
    } finally {
      setSubmittingService(false);
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'DELETE',
      });
      await loadDashboardData();
    } catch (deleteError) {
      setServiceMessage(deleteError.message || t('admin.serviceDeleteError'));
    }
  };

  const updateApplicationField = (applicationId, field, value) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId ? { ...application, [field]: value } : application,
      ),
    );
  };

  const saveApplication = async (application) => {
    setApplicationSavingId(application.id);

    try {
      const data = await apiRequest(`/applications/${application.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: application.status,
          note: application.note || '',
        }),
      });

      setApplications((current) =>
        current.map((item) => (item.id === application.id ? data.application : item)),
      );
      await loadDashboardData();
    } catch (saveError) {
      setError(saveError.message || t('admin.applicationSaveError'));
    } finally {
      setApplicationSavingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="container-shell py-10">
      <div className="mb-6 rounded-md border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('admin.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{t('admin.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('admin.intro')}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Panel key={stat.label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{stat.value}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-md bg-sheba-50 text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900" aria-label={t('admin.navLabel')}>
          <div className="flex gap-1 overflow-x-auto lg:grid lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition lg:w-full ${
                    isActive
                      ? 'bg-sheba-50 text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0">
          {activeTab === 'overview' && (
            <Panel>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">{t('admin.overviewTitle')}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{t('admin.overviewIntro')}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('admin.contactMessages')}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{overview.contactMessages}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('admin.pendingApplications')}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{overview.pendingApplications}</p>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'contacts' && (
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{t('admin.contactMessagesTitle')}</h2>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{contacts.length}</span>
              </div>
              <div className="mt-5 grid gap-4">
                {contacts.length ? (
                  contacts.map((contact) => (
                    <article key={contact.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{contact.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{contact.email}</p>
                          {contact.phone && <p className="text-sm text-slate-600 dark:text-slate-300">{contact.phone}</p>}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(contact.created_at)}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{contact.message}</p>
                    </article>
                  ))
                ) : (
                  <EmptyState text={t('admin.emptyContacts')} />
                )}
              </div>
            </Panel>
          )}

          {activeTab === 'services' && (
            <div className="grid gap-5">
              <Panel>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{t('admin.manageServices')}</h2>
                <form className="mt-5 grid gap-4" onSubmit={submitService}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t('admin.titleEn')}>
                      <input
                        value={serviceForm.title_en}
                        onChange={(event) => setServiceForm((current) => ({ ...current, title_en: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                    <Field label={t('admin.titleBn')}>
                      <input
                        value={serviceForm.title_bn}
                        onChange={(event) => setServiceForm((current) => ({ ...current, title_bn: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                    <Field label={t('admin.category')}>
                      <input
                        value={serviceForm.category}
                        onChange={(event) => setServiceForm((current) => ({ ...current, category: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                    <Field label={t('admin.requiredDocuments')}>
                      <input
                        value={serviceForm.required_documents}
                        onChange={(event) => setServiceForm((current) => ({ ...current, required_documents: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                    <Field label={t('admin.fee')}>
                      <input
                        value={serviceForm.fee}
                        onChange={(event) => setServiceForm((current) => ({ ...current, fee: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                    <Field label={t('admin.processingTime')}>
                      <input
                        value={serviceForm.processing_time}
                        onChange={(event) => setServiceForm((current) => ({ ...current, processing_time: event.target.value }))}
                        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </Field>
                  </div>
                  <Field label={t('admin.descriptionEn')}>
                    <textarea
                      value={serviceForm.description_en}
                      onChange={(event) => setServiceForm((current) => ({ ...current, description_en: event.target.value }))}
                      className="focus-ring min-h-28 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </Field>
                  <Field label={t('admin.descriptionBn')}>
                    <textarea
                      value={serviceForm.description_bn}
                      onChange={(event) => setServiceForm((current) => ({ ...current, description_bn: event.target.value }))}
                      className="focus-ring min-h-28 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </Field>
                  {serviceMessage && <p className="text-sm text-slate-600 dark:text-slate-300">{serviceMessage}</p>}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={submittingService}
                      className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white hover:bg-sheba-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save className="h-4 w-4" />
                      {editingServiceId ? t('admin.updateService') : t('admin.createService')}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={resetServiceForm}
                        className="focus-ring inline-flex h-11 items-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100"
                      >
                        {t('admin.cancel')}
                      </button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">{t('admin.serviceList')}</h3>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400">
                        <th className="pb-3 pr-4">{t('admin.service')}</th>
                        <th className="pb-3 pr-4">{t('admin.category')}</th>
                        <th className="pb-3 pr-4">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-950 dark:text-white">{service.title_en}</div>
                            <div className="text-slate-500 dark:text-slate-400">{service.title_bn}</div>
                          </td>
                          <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{service.category}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startEditService(service)}
                                className="focus-ring rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100"
                              >
                                {t('admin.edit')}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteService(service.id)}
                                className="focus-ring inline-flex rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 dark:border-red-500/30 dark:text-red-100"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('admin.delete')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'applications' && (
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{t('admin.manageApplications')}</h2>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{applications.length}</span>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400">
                      <th className="pb-3 pr-4">{t('admin.user')}</th>
                      <th className="pb-3 pr-4">{t('admin.service')}</th>
                      <th className="pb-3 pr-4">{t('admin.status')}</th>
                      <th className="pb-3 pr-4">{t('admin.note')}</th>
                      <th className="pb-3 pr-4">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {applications.length ? (
                      applications.map((application) => (
                        <tr key={application.id}>
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-950 dark:text-white">{application.user_name}</div>
                            <div className="text-slate-500 dark:text-slate-400">{application.user_email}</div>
                            <div className="text-slate-500 dark:text-slate-400">{formatDate(application.created_at)}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-950 dark:text-white">{application.service_title_en}</div>
                            <div className="text-slate-500 dark:text-slate-400">{application.service_title_bn}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <select
                              value={application.status}
                              onChange={(event) => updateApplicationField(application.id, 'status', event.target.value)}
                              className="focus-ring h-10 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                            >
                              {APPLICATION_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {t(`admin.applicationStatuses.${status}`)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pr-4">
                            <textarea
                              value={application.note || ''}
                              onChange={(event) => updateApplicationField(application.id, 'note', event.target.value)}
                              className="focus-ring min-h-24 w-full min-w-56 rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <button
                              type="button"
                              onClick={() => saveApplication(application)}
                              disabled={applicationSavingId === application.id}
                              className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-sheba-600 px-4 font-bold text-white hover:bg-sheba-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <Save className="h-4 w-4" />
                              {applicationSavingId === application.id ? t('admin.saving') : t('admin.saveApplication')}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6">
                          <EmptyState text={t('admin.emptyApplications')} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}
