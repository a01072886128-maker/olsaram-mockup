import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Clock, Plus } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { businessAPI } from "../../services/business";

const MyBusinesses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.ownerId;

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    businessAPI
      .getBusinessesByOwner(ownerId)
      .then((data) => {
        setBusinesses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("가게 목록 조회 실패:", err);
        setError("가게 목록을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [ownerId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="owner" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-text-primary">
            내 가게 목록
          </h2>
          <p className="text-text-secondary">
            등록된 가게를 관리하고 새 가게를 추가하세요.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">
            가게 목록을 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : businesses.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Store className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                등록된 가게가 없습니다
              </h3>
              <p className="text-text-secondary mb-6">
                첫 번째 가게를 등록해보세요!
              </p>
              <Button onClick={() => navigate("/owner/register-business")}>
                <Plus size={20} className="mr-2" />
                가게 등록하기
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.businessId} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* 가게 이미지 */}
                  {business.businessImageUrl ? (
                    <img
                      src={business.businessImageUrl}
                      alt={business.businessName}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Store className="text-gray-300" size={48} />
                    </div>
                  )}

                  {/* 가게 정보 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-text-primary">
                        {business.businessName}
                      </h3>
                      <span className="px-2 py-1 bg-primary-green/10 text-primary-green text-xs font-medium rounded">
                        {business.category || "기타"}
                      </span>
                    </div>

                    {business.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-text-secondary">
                      {business.address && (
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{business.address}</span>
                        </div>
                      )}
                      {business.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 flex-shrink-0" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.openingHours && (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate text-xs">영업시간 등록됨</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 사업자 번호 */}
                  {business.businessNumber && (
                    <div className="text-xs text-gray-400 mb-4">
                      사업자번호: {business.businessNumber}
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/owner/reservations?businessId=${business.businessId}`)}
                    >
                      예약 관리
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/owner/menu-ocr?businessId=${business.businessId}`)}
                    >
                      메뉴 관리
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* 가게 추가 카드 */}
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-dashed"
              onClick={() => navigate("/owner/register-business")}
            >
              <div className="p-6 h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mb-4">
                  <Plus className="text-primary-green" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  새 가게 등록
                </h3>
                <p className="text-sm text-text-secondary text-center">
                  클릭하여 새 가게를 등록하세요
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBusinesses;
