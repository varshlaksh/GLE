export default function ResetPasswordLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-clay border-t-transparent"></div>
      <p className="mt-4 text-sm text-ink/60">Validating reset link...</p>
    </div>
  );
}