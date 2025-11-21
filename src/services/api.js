const API_BASE_URL = 'http://srv415056.hstgr.cloud:8080'

// 統一的 API 請求處理
const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 統一處理 ResponseBean 格式
        if (result.code !== 'A0001') {
            throw new Error(result.message || '請求失敗');
        }

        return result.data; // 只返回 data 部分
    } catch (error) {
        console.error('API 請求失敗:', error);
        throw error;
    }
}

// 獲取預約列表
export const getBookingList = async () => {
    return await apiRequest('/api/booking/getList');
}

// 創建預約
export const createBooking = async (bookingData) => {
    return await apiRequest('/api/booking/create', {
        body: JSON.stringify(bookingData)
    });
}

// 刪除預約
export const deleteBooking = async (bookingData) => {
    return await apiRequest('/api/booking/delete', {
        body: JSON.stringify(bookingData)
    });
}

// 測試預約
export const testBooking = async () => {
    return await apiRequest('/api/booking/test');
}