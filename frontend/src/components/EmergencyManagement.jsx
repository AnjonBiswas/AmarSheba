import { Edit3, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EMERGENCY_CATEGORIES } from '../data/emergencyServices.js';
import { createLocalId } from '../utils/adminStorage.js';
import { readEmergencyServices, writeEmergencyServices } from '../utils/emergencyStorage.js';

const emptyForm = {
  name: '',
  nameBn: '',
  category: 'Ambulance',
  phone: '',
  description: '',
  descriptionBn: '',
  district: '',
  address: '',
  latitude: '',
  longitude: '',
  isActive: true,
  isNational: false,
};

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

export default function EmergencyManagement() {
  const [services, setServices] = useState(() => readEmergencyServices());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory = category === 'all' || service.category === category;
      const matchesQuery = !normalizedQuery || [
        service.name,
        service.nameBn,
        service.category,
        service.phone,
        service.description,
        service.district,
        service.address,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [category, query, services]);

  const saveServices = (next) => {
    setServices(next);
    writeEmergencyServices(next);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitForm = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.description.trim()) {
      return;
    }

    const service = {
      ...form,
      id: editingId || createLocalId(),
      name: form.name.trim(),
      nameBn: form.nameBn.trim(),
      phone: form.phone.trim(),
      description: form.description.trim(),
      descriptionBn: form.descriptionBn.trim(),
      district: form.district.trim() || 'National',
      address: form.address.trim(),
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
      updatedAt: Date.now(),
    };

    const next = editingId
      ? services.map((item) => (item.id === editingId ? service : item))
      : [service, ...services];

    saveServices(next);
    resetForm();
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setForm({
      name: service.name || '',
      nameBn: service.nameBn || '',
      category: service.category || 'Ambulance',
      phone: service.phone || '',
      description: service.description || '',
      descriptionBn: service.descriptionBn || '',
      district: service.district || '',
      address: service.address || '',
      latitude: service.latitude ?? '',
      longitude: service.longitude ?? '',
      isActive: service.isActive !== false,
      isNational: Boolean(service.isNational),
    });
  };

  const deleteService = (serviceId) => {
    saveServices(services.filter((service) => service.id !== serviceId));
  };

  const toggleActive = (serviceId) => {
    saveServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, isActive: service.isActive === false } : service,
      ),
    );
  };

  const inputClass = 'focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950';

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Emergency Management</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Add, edit, delete, activate, and filter emergency contacts.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts"
              className="focus-ring h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
            <option value="all">All categories</option>
            {EMERGENCY_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <form className="mb-6 grid gap-4" onSubmit={submitForm}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} /></Field>
          <Field label="Bangla name"><input value={form.nameBn} onChange={(event) => setForm((current) => ({ ...current, nameBn: event.target.value }))} className={inputClass} /></Field>
          <Field label="Category">
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={inputClass}>
              {EMERGENCY_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Phone"><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className={inputClass} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Description"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="focus-ring min-h-24 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" /></Field>
          <Field label="Bangla description"><textarea value={form.descriptionBn} onChange={(event) => setForm((current) => ({ ...current, descriptionBn: event.target.value }))} className="focus-ring min-h-24 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="District"><input value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} className={inputClass} /></Field>
          <Field label="Address"><input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className={inputClass} /></Field>
          <Field label="Latitude"><input type="number" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} className={inputClass} /></Field>
          <Field label="Longitude"><input type="number" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} className={inputClass} /></Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={form.isNational} onChange={(event) => setForm((current) => ({ ...current, isNational: event.target.checked }))} />
            National contact
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-pop focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update contact' : 'Add contact'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-pop focus-ring h-11 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Phone</th>
              <th className="p-3">District</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td className="p-3 font-bold text-slate-950 dark:text-white">{service.name}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{service.category}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{service.phone}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{service.district}</td>
                <td className="p-3">
                  <button type="button" onClick={() => toggleActive(service.id)} className={`btn-pop focus-ring rounded-md px-3 py-2 text-xs font-black ${service.isActive === false ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100'}`}>
                    {service.isActive === false ? 'Inactive' : 'Active'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(service)} className="btn-pop focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold dark:border-slate-700">
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => deleteService(service.id)} className="btn-pop focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-bold text-red-600 dark:border-red-500/30">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
