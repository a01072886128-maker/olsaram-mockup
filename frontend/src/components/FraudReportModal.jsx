import { useState } from "react";
import {
  AlertTriangle,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  User,
  Upload,
  X,
} from "lucide-react";
import Modal from "./Modal";
import {
  fraudReportAPI,
  formatPhoneNumber,
  REPORT_TYPE_OPTIONS,
} from "../services/fraudReport";

const FraudReportModal = ({ isOpen, onClose, onSuccess, reporterId }) => {
  const [formData, setFormData] = useState({
    reportType: "NO_SHOW",
    phoneNumber: "",
    incidentDate: "",
    damageAmount: "",
    description: "",
    suspectInfo: "",
    additionalInfo: "",
    region: "",
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else if (name === "damageAmount") {
      // 숫자만 허용
      const numValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (files.length + newFiles.length > 3) {
      setError("파일은 최대 3개까지 첨부 가능합니다.");
      return;
    }
    setFiles([...files, ...newFiles]);
    setError("");
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!formData.phoneNumber) {
      setError("전화번호를 입력해주세요.");
      return;
    }
    if (formData.description.length < 50) {
      setError("피해 내용은 최소 50자 이상 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        reporter_id: reporterId,
        report_type: formData.reportType,
        phone_number: formData.phoneNumber,
        incident_date: formData.incidentDate
          ? new Date(formData.incidentDate).toISOString()
          : null,
        damage_amount: formData.damageAmount
          ? parseInt(formData.damageAmount)
          : null,
        description: formData.description,
        suspect_info: formData.suspectInfo,
        additional_info: formData.additionalInfo,
        region: formData.region,
        evidence_urls: "", // TODO: 파일 업로드 구현 시 URL 추가
      };

      await fraudReportAPI.createReport(payload);

      // 성공
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err) {
      console.error("신고 등록 실패:", err);
      setError(err.response?.data?.message || "신고 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reportType: "NO_SHOW",
      phoneNumber: "",
      incidentDate: "",
      damageAmount: "",
      description: "",
      suspectInfo: "",
      additionalInfo: "",
      region: "",
    });
    setFiles([]);
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={24} />
          노쇼/사기 번호 신고하기
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 경고 문구 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>주의:</strong> 허위 신고 시 이용이 제한될 수 있습니다. 정확한
          정보를 입력해주세요.
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">
            기본 정보
          </h3>

          {/* 신고 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 유형 *
            </label>
            <div className="flex gap-4">
              {REPORT_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                    formData.reportType === option.value
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={option.value}
                    checked={formData.reportType === option.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              전화번호 *
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={13}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 피해 발생 일시 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                피해 발생 일시
              </label>
              <input
                type="datetime-local"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* 피해 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                피해 금액 (원)
              </label>
              <input
                type="text"
                name="damageAmount"
                value={
                  formData.damageAmount
                    ? parseInt(formData.damageAmount).toLocaleString()
                    : ""
                }
                onChange={handleChange}
                placeholder="예: 150000"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              피해 발생 지역
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="예: 서울 강남구"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">
            상세 내용
          </h3>

          {/* 피해 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              피해 내용 * (최소 50자)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="피해 상황을 자세히 설명해주세요. (최소 50자 이상)"
              rows={4}
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/50자 이상
            </p>
          </div>

          {/* 예약자 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              예약자 정보
            </label>
            <input
              type="text"
              name="suspectInfo"
              value={formData.suspectInfo}
              onChange={handleChange}
              placeholder="예: 홍길동, 4명 예약"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* 추가 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 설명 (선택)
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="주요 수법, 특이사항 등"
              rows={2}
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* 증거 자료 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">
            증거 자료 (선택)
          </h3>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              이미지 또는 PDF 파일을 첨부해주세요 (최대 3개)
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              파일 선택
            </label>
          </div>

          {/* 첨부 파일 목록 */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
          >
            {isSubmitting ? "신고 중..." : "신고 접수하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FraudReportModal;
