export default function OrganicShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="organic-shape absolute top-20 left-10 w-32 h-32 animate-float opacity-60"></div>
      <div className="organic-shape absolute top-40 right-20 w-24 h-24 animate-float-delayed opacity-40"></div>
      <div className="organic-shape absolute bottom-40 left-1/4 w-40 h-40 animate-float opacity-30"></div>
      <div className="organic-shape absolute bottom-20 right-10 w-28 h-28 animate-float-delayed opacity-50"></div>
    </div>
  );
}
