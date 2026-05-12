import { useEffect, useState, useCallback } from 'react';
import { vehicleCategoryService } from '../services/vehicleCategoryService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { VehicleCategory } from '../types';

function VehicleCategoriesPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await vehicleCategoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Greška pri dohvaćanju kategorija.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      await vehicleCategoryService.create({ name: newName.trim() });
      setNewName('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(category: VehicleCategory) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  async function saveEdit(id: number) {
    if (!editingName.trim()) return;
    try {
      await vehicleCategoryService.update(id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Sigurno obrisati kategoriju? Ovo nije moguće ako postoje vozila u njoj.'))
      return;
    try {
      await vehicleCategoryService.delete(id);
      await fetchCategories();
    } catch (err) {
      alert('Greška pri brisanju. Možda postoje vozila u toj kategoriji.');
      console.error(err);
    }
  }

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Konfiguracija
      </div>
      <h1
        className="text-4xl font-light mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Kategorije vozila
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-10">
        Ovdje možete dodavati, uređivati i brisati kategorije vozila
      </p>

      {/* Inline forma za novu kategoriju */}
      <form
        onSubmit={handleCreate}
        className="flex items-end gap-3 max-w-xl mb-10"
      >
        <div className="flex-1">
          <Input
            name="newCategoryName"
            label="Nova kategorija"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            //placeholder="npr. Limuzina"
            required
          />
        </div>
        <Button type="submit" disabled={submitting || !newName.trim()}>
          {submitting ? 'Dodaje...' : 'Dodaj'}
        </Button>
      </form>

      {categories.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-12 text-center">
          <p className="text-[var(--color-ink-soft)]">Nema kategorija.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] overflow-hidden max-w-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-rule)] text-left">
                <Th>ID</Th>
                <Th>Naziv</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-[var(--color-rule)] last:border-b-0"
                  >
                    <Td className="text-[var(--color-ink-muted)]">{cat.id}</Td>
                    <Td>
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="w-full bg-transparent border-b border-[var(--color-gold)] py-1 text-[var(--color-ink)] focus:outline-none"
                        />
                      ) : (
                        cat.name
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              onClick={() => saveEdit(cat.id)}
                              className="!py-1 !px-3 text-xs"
                            >
                              Spremi
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={cancelEdit}
                              className="!py-1 !px-3 text-xs"
                            >
                              Odustani
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => startEdit(cat)}
                              className="!py-1 !px-3 text-xs"
                            >
                              Uredi
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(cat.id)}
                              className="!py-1 !px-3 text-xs"
                            >
                              Obriši
                            </Button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Lokalne pomoćne komponente ---------- */

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase font-normal ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function PageMessage({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div
      className={`p-8 text-sm ${
        tone === 'error' ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-soft)]'
      }`}
    >
      {children}
    </div>
  );
}

export default VehicleCategoriesPage;