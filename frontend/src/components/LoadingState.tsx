export default function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-lime-400" />

        <div>
          <p className="font-medium text-white">
            Chargement...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Nous récupérons les données, veuillez patienter.
          </p>
        </div>
      </div>
    </div>
  );
}