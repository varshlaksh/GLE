import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ApiResponse, Product } from "@/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: orderItem, error: orderError } = await supabase
    .from("order_items")
    .select("id")
    .eq("product_id", id)
    .limit(1)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: orderError.message },
      { status: 500 }
    );
  }

  if (orderItem) {
    const { error } = await supabase
      .from("products")
      .update({
        is_archived: true,
        is_active: false,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json<ApiResponse<never>>(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      archived: true,
      message: "Product archived because it already exists in orders.",
    });
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json<ApiResponse<never>>(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    archived: false,
    message: "Product deleted successfully.",
  });
}