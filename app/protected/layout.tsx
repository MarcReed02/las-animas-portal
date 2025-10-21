// Simplified protected layout: remove missing template components

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-5xl mx-auto p-5">
        {children}
      </div>
    </main>
  )
}
