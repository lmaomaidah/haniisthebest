import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  image_url: string | null;
}

const Profiles = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPeople();
    loadCategoryMap();
  }, []);

  const loadCategoryMap = async () => {
    const map = await fetchAllImageCategories();
    setImageCategoryMap(map);
  };

  const fetchPeople = async () => {
    const { data, error } = await supabase
      .from("images")
      .select("id, name, image_url")
      .order("name", { ascending: true });

    if (!error && data) {
      const signed = await withSignedClassmateImageUrls(data);
      setPeople(signed);
    }
    setLoading(false);
  };

  const handleCreateCategory = async (name: string) => {
    if (!user) return;
    try {
      await createCategory(name, user.id);
      toast({ title: "Category created! 🏷️" });
    } catch (err: any) {
      toast({ title: "Couldn't create category", description: err.message, variant: "destructive" });
    }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try {
      await renameCategory(id, newName);
      toast({ title: "Category renamed! ✏️" });
    } catch (err: any) {
      toast({ title: "Couldn't rename", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await loadCategoryMap();
      toast({ title: "Category deleted! 🗑️" });
    } catch (err: any) {
      toast({ title: "Couldn't delete", description: err.message, variant: "destructive" });
    }
  };

  const filtered = people
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (filterCategories.length === 0) return true;
      const cats = imageCategoryMap[p.id] || [];
      return filterCategories.some((fc) => cats.includes(fc));
    });

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">📌 Shrine Wall</h1>
          <Link to="/">
            <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl bg-card/80 backdrop-blur-sm">
              <Home className="mr-2" /> Home
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 border-4 border-secondary/60 rounded-full text-lg py-6 bg-card/70 backdrop-blur-sm focus:border-secondary"
          />
        </div>

        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={filterCategories}
            onChange={setFilterCategories}
            allowCreate
            onCreateCategory={handleCreateCategory}
            allowEdit
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-2xl">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No one found 🥀</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((person, i) => {
              const personCats = imageCategoryMap[person.id] || [];
              return (
                <Link key={person.id} to={`/profiles/${person.id}`} className="group animate-bounce-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="bg-card/70 backdrop-blur-sm border-2 border-border rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 hover:border-primary/60 transition-all duration-300">
                    <div className="aspect-square relative overflow-hidden">
                      {person.image_url ? (
                        <img src={person.image_url} alt={person.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                          <span className="text-5xl font-bold text-foreground/80">
                            {person.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-sm text-foreground/90 font-medium">View shrine →</span>
                      </div>
                    </div>
                    <div className="p-4 text-center space-y-1">
                      <p className="font-bold text-lg text-foreground truncate">{person.name}</p>
                      {personCats.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {personCats.map((catId) => {
                            const cat = categories.find((c) => c.id === catId);
                            return cat ? (
                              <span key={catId} className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                {cat.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;
