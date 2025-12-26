// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCog, 
  BarChart3,
  Lightbulb,
  Trash2
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    
    {
      name: 'Réclamations',
      path: '/claims',
      icon: FileText,
    },
   
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <Trash2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart City</h1>
            <p className="text-xs text-gray-500">Supervision</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${active 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">CT</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Citoyen</p>
            <p className="text-xs text-gray-500">client</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;