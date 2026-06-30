import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          Catalogue
        </span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Edit product
        </h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
