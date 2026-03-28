export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black">
      <div className="flex flex-col items-center gap-4">

        
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200"></div>

          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>

   
        <p className="text-blue-600 font-semibold tracking-wide animate-pulse">
          Loading...
        </p>

      </div>
    </div>
  );
}