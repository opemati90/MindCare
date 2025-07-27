export default function ProviderHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mindcare Provider Portal
          </h1>
          <p className="text-gray-600 mb-8">
            Healthcare provider interface for managing patients and appointments.
          </p>
          <div className="space-y-4">
            <a
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 block text-center"
            >
              Sign In
            </a>
            <p className="text-sm text-gray-500">
              Provider portal running on port 3002
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
