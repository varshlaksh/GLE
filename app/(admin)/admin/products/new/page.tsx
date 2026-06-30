import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          Catalogue
        </span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Add product
        </h1>
      </div>
      <ProductForm />
    </div>
  );
}
