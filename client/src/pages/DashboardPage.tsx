import { useAuth } from '../hook/useAuth';
import { VCDashboard } from '../components/DashBoard/VCDashboard';
import { VCQLDashboard } from '../components/DashBoard/VCQLDashboard';
import { BGHDashboard } from '../components/DashBoard/BGHDashboard';
import { PTCCTDashboard } from '../components/DashBoard/PTCCTDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();

  // Render dashboard theo vai trò
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.vaiTro) {
      case 'VC':
        return <VCDashboard />;
      case 'VCQL':
        return <VCQLDashboard />;
      case 'BGH':
        return <BGHDashboard />;
      case 'PTCCT':
        return <PTCCTDashboard />;
      default:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl text-gray-600">Vai trò không được hỗ trợ</h2>
            <p className="text-gray-500 mt-2">Vui lòng liên hệ quản trị viên</p>
          </div>
        );
    }
  };

  return renderDashboard();
};