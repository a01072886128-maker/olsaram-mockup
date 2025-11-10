const API_BASE_URL = '/api/owner/menu-ocr';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(message);
  }
  return data;
};

export const menuAPI = {
  async uploadMenuImage({ ownerId, file }) {
    const formData = new FormData();
    formData.append('ownerId', ownerId);
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse(response);
  },

  async fetchMenus(ownerId) {
    const params = new URLSearchParams({ ownerId });
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    return handleResponse(response);
  },

  async deleteMenu(ownerId, menuId) {
    const response = await fetch(`${API_BASE_URL}/${menuId}?ownerId=${ownerId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = data?.message || '메뉴 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },
};
