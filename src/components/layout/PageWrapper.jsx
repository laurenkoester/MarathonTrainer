export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-5xl px-6 py-8 ${className}`}>
      {children}
    </div>
  );
}
