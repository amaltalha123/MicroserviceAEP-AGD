// src/components/layout/Layout.jsx
import Sidebar from './Sidebar';


const Layout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;