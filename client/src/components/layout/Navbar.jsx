import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate('/projects')}
            >
              Task Manager
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 ml-2">({user.role})</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

