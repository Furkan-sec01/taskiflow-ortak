import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import newLogo from '../assets/new_logo.png';

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <footer className={`border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Üst Kısım: TaskiFlow + Linkler */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-blue-600">TaskiFlow</h3>
          </div>
          <div className={`flex gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">
              Gizlilik
            </Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">
              Şartlar
            </Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">
              İletişim
            </Link>
          </div>
        </div>

        {/* Alt Kısım: Developed by Badge + Telif Hakkı */}
        <div className="flex flex-col items-center gap-4">
          {/* Developed by Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Developed by</span>
            <img 
              src={newLogo} 
              alt="NDM Software" 
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Telif Hakkı */}
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2025 TaskiFlow
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

