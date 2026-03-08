import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (data) setCategories(data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (name: string, userId: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: trimmed, created_by: userId })
      .select()
      .single();

    if (error) throw error;
    await fetchCategories();
    return data as Category;
  };

  const renameCategory = async (categoryId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", categoryId);

    if (error) throw error;
    await fetchCategories();
  };

  const deleteCategory = async (categoryId: string) => {
    // Remove all image_categories associations first
    await supabase.from("image_categories").delete().eq("category_id", categoryId);
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
    await fetchCategories();
  };

  return { categories, loading, fetchCategories, createCategory, renameCategory, deleteCategory };
}

/** Fetch category IDs for a given image */
export async function fetchImageCategoryIds(imageId: string): Promise<string[]> {
  const { data } = await supabase
    .from("image_categories")
    .select("category_id")
    .eq("image_id", imageId);

  return (data ?? []).map((row: any) => row.category_id);
}

/** Set categories for an image (replaces existing) */
export async function setImageCategories(imageId: string, categoryIds: string[]) {
  // Remove existing
  await supabase.from("image_categories").delete().eq("image_id", imageId);

  if (categoryIds.length === 0) return;

  const rows = categoryIds.map((categoryId) => ({
    image_id: imageId,
    category_id: categoryId,
  }));

  const { error } = await supabase.from("image_categories").insert(rows);
  if (error) throw error;
}

/** Fetch a map of image_id -> category_id[] for all images */
export async function fetchAllImageCategories(): Promise<Record<string, string[]>> {
  const { data } = await supabase.from("image_categories").select("image_id, category_id");

  const map: Record<string, string[]> = {};
  for (const row of (data ?? []) as Array<{ image_id: string; category_id: string }>) {
    if (!map[row.image_id]) map[row.image_id] = [];
    map[row.image_id].push(row.category_id);
  }
  return map;
}
