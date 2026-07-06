export default function PageTransition({ children, routeKey }) {
  return (
    <div key={routeKey} className="animate-fade-slide-up">
      {children}
    </div>
  );
}
