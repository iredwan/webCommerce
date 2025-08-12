export default function SidebarSkeleton({ isMobile }) {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="border-b border-gray-200 dark:border-gray-700 pb-4">
          {/* Section Header */}
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          
          {/* Menu Items */}
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
