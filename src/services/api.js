const API_BASE_URL = 'http://srv415056.hstgr.cloud:8080'

// 獲取預約列表
export const getBookingList = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/booking/getList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('獲取預約列表失敗:', error);
        throw error;
    }
}

// 創建預約
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/booking/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('創建預約失敗:', error);
        throw error;
    }
}

// 刪除預約
export const deleteBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/booking/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('刪除預約失敗:', error);
        throw error;
    }
}

// 測試預約
export const testBooking = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/booking/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('測試預約失敗:', error);
        throw error;
    }
}