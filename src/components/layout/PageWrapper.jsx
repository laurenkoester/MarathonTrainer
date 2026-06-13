export default function PageWrapper({ children, className = '' }) {
  return (
    // pb-24 on mobile = clearance for the fixed bottom nav bar
    <div className={`mx-auto max-w-5xl px-4 py-5 pb-24 sm:px-6 sm:py-8 md:pb-8 ${className}`}>
      {children}
    </div>
  );
}
