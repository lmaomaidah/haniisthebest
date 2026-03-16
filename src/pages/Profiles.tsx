import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getCategoryColor } from "@/lib/categoryColors";

interface Person { id: string; name: string; image_url: string | null; }

const Profiles = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();
  const { user, logActivity } = useAuth();
  const { toast } = useToast();
  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchPeople(); loadCategoryMap(); }, []);
  const loadCategoryMap = async () => { const map = await fetchAllImageCategories(); setImageCategoryMap(map); };

  const fetchPeople = async () => {
    const { data, error } = await supabase.from("images").select("id, name, image_url").order("name", { ascending: true });
    if (!error && data) { const signed = await withSignedClassmateImageUrls(data); setPeople(signed); }
    setLoading(false);
  };

  const handleCreateCategory = async (name: string) => { if (!user) return; try { await createCategory(name, user.id); void logActivity("category_created", { name, page: "shrine_wall" }); toast({ title: "Category created! 🏷️" }); } catch (err: any) { toast({ title: "Couldn't create", description: err.message, variant: "destructive" }); } };
  const handleRenameCategory = async (id: string, newName: string) => { try { await renameCategory(id, newName); void logActivity("category_renamed", { category_id: id, new_name: newName }); } catch {} };
  const handleDeleteCategory = async (id: string) => { try { await deleteCategory(id); void logActivity("category_deleted", { category_id: id }); await loadCategoryMap(); } catch {} };

  // Track search queries (debounced)
  useEffect(() => {
    if (!search.trim() || search.length < 2) return;
    const timeout = setTimeout(() => {
      void logActivity("shrine_search", { query: search.trim(), results_count: filtered.length });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [search]);

  // Track filter changes
  useEffect(() => {
    if (filterCategories.length === 0) return;
    const catNames = filterCategories.map(id => categories.find(c => c.id === id)?.name || id);
    void logActivity("shrine_filter", { categories: catNames, filter_count: filterCategories.length });
  }, [filterCategories]);

  const filtered = people
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => { if (filterCategories.length === 0) return true; const cats = imageCategoryMap[p.id] || []; return filterCategories.some((fc) => cats.includes(fc)); });

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="container mx-auto relative z-10 max-w-7xl">
        <PageHeader
          title="📌 Shrine Wall"
          subtitle={`${people.length} classmates enshrined`}
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search people…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl border-border/50 bg-card/50 h-9" />
          </div>
          <div className="flex-1 overflow-x-auto">
            <CategoryFilter categories={categories} selected={filterCategories} onChange={setFilterCategories} allowCreate onCreateCategory={handleCreateCategory} allowEdit onRenameCategory={handleRenameCategory} onDeleteCategory={handleDeleteCategory} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-2xl">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-2xl text-muted-foreground">No one found 🥀</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((person) => {
              const personCats = imageCategoryMap[person.id] || [];
              return (
                <div key={person.id} className="group relative">
                  <Link to={`/profiles/${person.id}`} onClick={() => void logActivity("profile_click", { person_id: person.id, person_name: person.name, from_search: !!search.trim(), categories_filtered: filterCategories.length })} className="block bg-card/70 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {person.image_url ? (
                        <img src={person.image_url} alt={person.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-4xl font-bold text-foreground/40 font-['Luckiest_Guy']">{person.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-bold text-sm text-white drop-shadow-lg truncate mb-1.5">{person.name}</p>
                        {personCats.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {personCats.slice(0, 2).map((catId) => {
                              const cat = categories.find((c) => c.id === catId);
                              if (!cat) return null;
                              const color = getCategoryColor(catId);
                              return (
                                <span key={catId} className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm" style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}>
                                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color.dot }} />
                                  {cat.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <Eye className="h-3 w-3" /> View Shrine
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;
