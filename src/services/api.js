const API_BASE_URL = 'http://127.0.0.1:5000'

// 獲取預約資料
export const getCacheData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/cache/view`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('獲取預約資料失敗:', error);
        throw error;
    }
}

// 更新預約資料
export const updateCacheData = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cache/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('更新預約資料失敗:', error);
        throw error;
    }
}