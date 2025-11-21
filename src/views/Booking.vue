<template>
    <div class="app-wrapper">
        <!-- Loading 遮罩 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <!-- Toast 组件 -->
        <div
            v-if="showToast"
            :class="{ 'toast-show': showToast }"
            class="toast-container"
        >
            <div class="toast-content">
                <span>{{ toastMessage }}</span>
            </div>
        </div>

        <!-- 用戶設置模態窗口 -->
        <div v-if="showUserModal" class="modal-overlay">
            <div class="modal-container modal-container-large">
                <div class="modal-header">
                    <h2>用戶設置</h2>
                    <button class="modal-close" @click="closeUserModal">×</button>
                </div>
                <div class="modal-content">
                    <p class="modal-description">設定個人資料及常用地址，方便快速預約</p>

                    <!-- 基本資料 -->
                    <div class="settings-section">
                        <h3>基本資料</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>姓名</label>
                                <input
                                    v-model="userSettings.userName"
                                    class="form-input"
                                    placeholder="請輸入姓名"
                                    type="text"
                                />
                            </div>
                            <div class="form-group">
                                <label>密碼</label>
                                <input
                                    v-model="userSettings.userPassword"
                                    class="form-input"
                                    placeholder="請輸入密碼"
                                    type="password"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- 動態生成路線設定區塊 - 改動位置 -->
                    <div
                        v-for="(group, groupKey) in routeGroups"
                        :key="groupKey"
                        class="settings-section"
                    >
                        <h3>常用路線設定{{ groupKey.replace('group', '') }}</h3>
                        <div class="form-group">
                            <label>路線名稱</label>
                            <input
                                v-model="userSettings[groupKey].name"
                                :placeholder="getRoutePlaceholder(groupKey)"
                                class="form-input"
                                type="text"
                            />
                        </div>
                        <div class="form-group">
                            <label>預約時間</label>
                            <input
                                v-model="userSettings[groupKey].bookingTime"
                                class="form-input"
                                placeholder="請輸入預約時間"
                                type="time"
                            />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>上車地區</label>
                                <input
                                    v-model="userSettings[groupKey].departureArea"
                                    class="form-input"
                                    placeholder="請輸入上車地區"
                                    type="text"
                                />
                            </div>
                            <div class="form-group">
                                <label>上車地址</label>
                                <input
                                    v-model="userSettings[groupKey].departureAddress"
                                    class="form-input"
                                    placeholder="請輸入上車地址"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>下車地區</label>
                                <input
                                    v-model="userSettings[groupKey].arrivalArea"
                                    class="form-input"
                                    placeholder="請輸入下車地區"
                                    type="text"
                                />
                            </div>
                            <div class="form-group">
                                <label>下車地址</label>
                                <input
                                    v-model="userSettings[groupKey].arrivalAddress"
                                    class="form-input"
                                    placeholder="請輸入下車地址"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>路線備註</label>
                            <textarea
                                v-model="userSettings[groupKey].remark"
                                class="form-input"
                                placeholder="請輸入路線相關備註"
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" @click="closeUserModal">取消</button>
                    <button class="btn btn-primary" @click="saveUserSettings">確定</button>
                </div>
            </div>
        </div>

        <!-- 預約模態窗口 -->
        <div v-if="showReservationModal" class="modal-overlay">
            <div class="modal-container">
                <div class="modal-header">
                    <h2>{{ selectedDate }} 預約詳情</h2>
                    <button class="modal-close" @click="closeReservationModal">×</button>
                </div>
                <div class="modal-content">
                    <div class="form-group">
                        <label>預約日期</label>
                        <input
                            v-model="reservationForm.bookingDate"
                            class="form-input"
                            readonly
                            type="date"
                        />
                    </div>
                    <div class="form-group">
                        <label>執行預約日期</label>
                        <input
                            v-model="reservationForm.scheduleDate"
                            class="form-input"
                            type="date"
                        />
                    </div>
                    <div class="form-group">
                        <label>常用路線</label>
                        <select
                            v-model="selectedRouteGroup"
                            class="select-input"
                            required
                            @change="applyRouteGroup"
                        >
                            <option disabled value="">請選擇上車與下車地點</option>
                            <!-- 動態生成選項 - 改動位置 -->
                            <option
                                v-for="(group, groupKey) in availableRouteGroups"
                                :key="groupKey"
                                :value="groupKey"
                            >
                                {{ group.name || `常用路線${groupKey.replace('group', '')}` }}
                            </option>
                        </select>
                    </div>

                    <!-- 路線詳情展開區域，包含地區、地址和備註 -->
                    <div v-if="selectedRouteGroup && showRouteDetails" class="route-details-section">
                        <div class="route-details-header">
                            <h4>已選擇路線詳情</h4>
                        </div>
                        <div class="route-details-content">
                            <!-- 在路線詳情內容中添加預約時間顯示 -->
                            <div class="route-info-row">
                                <div class="route-info-item">
                                    <span class="route-label">預約時間：</span>
                                    <span class="route-value">{{ reservationForm.bookingTime }}</span>
                                </div>
                                <div class="route-info-item">
                                    <span class="route-label">執行日期：</span>
                                    <span class="route-value">{{ formatDate(reservationForm.scheduleDate) }}</span>
                                </div>
                            </div>
                            <div class="route-info-row">
                                <div class="route-info-item">
                                    <span class="route-label">上車地區：</span>
                                    <span class="route-value">{{ reservationForm.departureArea }}</span>
                                </div>
                                <div class="route-info-item">
                                    <span class="route-label">上車地址：</span>
                                    <span class="route-value">{{ reservationForm.departureAddress }}</span>
                                </div>
                            </div>
                            <div class="route-info-row">
                                <div class="route-info-item">
                                    <span class="route-label">下車地區：</span>
                                    <span class="route-value">{{ reservationForm.arrivalArea }}</span>
                                </div>
                                <div class="route-info-item">
                                    <span class="route-label">下車地址：</span>
                                    <span class="route-value">{{ reservationForm.arrivalAddress }}</span>
                                </div>
                            </div>
                            <div class="route-info-row">
                                <div class="route-info-item route-info-full">
                                    <span class="route-label">備註：</span>
                                    <span class="route-value">{{ reservationForm.remark || '無' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        v-if="existingReservation"
                        class="btn btn-danger"
                        @click="deleteReservation"
                    >
                        刪除預約
                    </button>
                    <div class="modal-footer-right">
                        <button class="btn btn-outline" @click="closeReservationModal">取消</button>
                        <button class="btn btn-primary" @click="submitReservation">
                            {{ existingReservation ? '更新預約' : '確認預約' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-container">
            <header>
                <div class="header-content">
                    <h1>{{ currentMonthDisplay }} 復康巴士自動化預約系統</h1>
                    <div class="calendar-nav">
                        <button class="nav-btn" @click="previousMonth">&lt;</button>
                        <button class="nav-btn" @click="nextMonth">&gt;</button>
                    </div>
                </div>
            </header>

            <main class="editor-container">
                <!-- 左側日曆面板 -->
                <section class="editor-panel">
                    <div class="panel-content">
                        <div class="calendar-container">
                            <div class="weekdays">
                                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                            </div>
                            <div class="calendar-grid">
                                <div
                                    v-for="date in calendarDates"
                                    :key="date.key"
                                    :class="getDateClass(date)"
                                    @click="selectDate(date)"
                                >
                                    <span class="date-number">{{ date.day }}</span>
                                    <div v-if="date.reservation" class="reservation-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="divider"></div>

                <!-- 右側預約列表面板 -->
                <section class="editor-panel">
                    <div class="panel-content">
                        <div v-if="monthReservations.length > 0" class="reservations-list">
                            <div
                                v-for="reservation in monthReservations"
                                :key="reservation.bookingDate"
                                class="reservation-item"
                            >
                                <div class="reservation-content" @click="viewReservation(reservation)">
                                    <div class="reservation-date">{{ formatDate(reservation.bookingDate) }}</div>
                                    <div class="reservation-details">
                                        <div class="reservation-trip">{{ reservation.bookingTime || '未設定時間' }}</div>
                                        <div class="reservation-route">
                                            {{ reservation.departureAddress }} → {{ reservation.arrivalAddress }}
                                        </div>
                                        <div class="reservation-execute">
                                            執行日期：{{ formatDate(reservation.scheduleDate) }}
                                        </div>
                                        <div v-if="reservation.remark" class="reservation-remark">
                                            備註：{{ reservation.remark }}
                                        </div>
                                    </div>
                                </div>
                                <div class="reservation-actions">
                                    <button
                                        class="btn-delete"
                                        title="刪除預約"
                                        @click.stop="deleteReservationFromList(reservation)"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-errors">
                            <p>本月暫無預約記錄</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer class="action-bar">
                <div class="font-size-controls">
                    <button
                        v-for="size in fontSizes"
                        :key="size.value"
                        :class="['btn', 'btn-font', currentFontSize === size.value ? 'btn-font-active' : '']"
                        @click="setFontSize(size.value)"
                    >
                        {{ size.label }}
                    </button>
                </div>
                <div class="button-group">
                    <button class="btn btn-outline" @click="openUserModal">
                        用戶設置
                    </button>
                    <!-- 修改按鈕點擊事件 -->
                    <button class="btn btn-primary" @click="loadBookingList">
                        載入資料
                    </button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {createBooking, deleteBooking, getBookingList} from '../services/api.js'

// 基本狀態
const isLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// 模態窗口狀態
const showUserModal = ref(false)
const showReservationModal = ref(false)

// 日曆狀態
const currentDate = ref(new Date())
const selectedDate = ref('')
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

// 字體大小控制
const fontSizes = [
    {label: '小', value: '1.25rem'},
    {label: '中', value: '1.5rem'},
    {label: '大', value: '2rem'},
    {label: '特大', value: '3rem'}
];
const currentFontSize = ref('1.5rem');

// 用戶設置
const userSettings = ref({
    userName: '房有',
    userPassword: 'A078839',
    // 第一組地址
    group1: {
        name: '裕民路上車，三峽下車',
        departureArea: '土城',
        departureAddress: '裕民路61巷9號',
        arrivalArea: '三峽',
        arrivalAddress: '大埔路220號-春暉啟能中心',
        remark: '可06:30~10:00之間，悠遊卡付款',
        bookingTime: '07:15'
    },
    // 第二組地址
    group2: {
        name: '三峽上車，裕民路下車',
        departureArea: '三峽',
        departureAddress: '大埔路220號-春暉啟能中心',
        arrivalArea: '土城',
        arrivalAddress: '裕民路61巷9號',
        remark: '可14:00~16:00之間，悠遊卡付款',
        bookingTime: '14:00'
    },
    // 第三組地址
    group3: {
        name: '三峽上車，永和街下車',
        departureArea: '三峽',
        departureAddress: '大埔路220號-春暉啟能中心',
        arrivalArea: '土城',
        arrivalAddress: '永和街61號',
        remark: '可14:00~16:00之間，悠遊卡付款',
        bookingTime: '14:00'
    }
})

// 新增：動態路線組合計算屬性 - 改動位置
const routeGroups = computed(() => {
    const groups = {}
    Object.keys(userSettings.value).forEach(key => {
        if (key.startsWith('group') && typeof userSettings.value[key] === 'object') {
            groups[key] = userSettings.value[key]
        }
    })
    return groups
})

// 新增：可用路線組合計算屬性 - 改動位置
const availableRouteGroups = computed(() => {
    const groups = {}
    Object.keys(routeGroups.value).forEach(groupKey => {
        const group = routeGroups.value[groupKey]
        if (group.departureArea || group.departureAddress) {
            groups[groupKey] = group
        }
    })
    return groups
})

// 新增：路線占位符方法 - 改動位置
const getRoutePlaceholder = (groupKey) => {
    const groupNumber = groupKey.replace('group', '')
    const placeholders = {
        '1': '例如：家→復健中心',
        '2': '例如：家→醫院',
        '3': '例如：家→工作地點'
    }
    return placeholders[groupNumber] || `例如：路線${groupNumber}`
}

// 預約表單
const reservationForm = ref({
    userName: '房有',
    userPassword: 'A078839',
    bookingDate: '',
    bookingTime: '07:15',
    departureArea: '',
    departureAddress: '',
    arrivalArea: '',
    arrivalAddress: '',
    scheduleDate: '',
    remark: ''
})

// 加入路線選擇狀態
const selectedRouteGroup = ref('')

const showRouteDetails = ref(false)

// 加入應用路線組合的方法
const applyRouteGroup = () => {
    if (!selectedRouteGroup.value) {
        showRouteDetails.value = false
        return
    }

    const group = userSettings.value[selectedRouteGroup.value]
    if (group) {
        reservationForm.value.departureArea = group.departureArea
        reservationForm.value.departureAddress = group.departureAddress
        reservationForm.value.arrivalArea = group.arrivalArea
        reservationForm.value.arrivalAddress = group.arrivalAddress

        // 使用群組的預約時間
        if (group.bookingTime) {
            reservationForm.value.bookingTime = group.bookingTime
        }

        // 如果群組有備註且表單備註為空，則使用群組備註
        if (group.remark && !reservationForm.value.remark) {
            reservationForm.value.remark = group.remark
        }

        showRouteDetails.value = true
    }
}

// 編輯狀態
const existingReservation = ref(null)

// 預約數據
const reservations = ref([])

// 計算屬性
const currentMonthDisplay = computed(() => {
    return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

const monthReservations = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    return reservations.value.filter(r => {
        if (!r.bookingDate) return false
        const [rYear, rMonth] = r.bookingDate.split('-').map(Number)
        return rYear === year && rMonth === month
    })
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const dates = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
        const reservation = reservations.value.find(r => r.bookingDate === dateStr)

        // 不能預約今天、明天及過去的日期
        const isNotBookable = current <= tomorrow

        dates.push({
            day: current.getDate(),
            date: dateStr,
            isCurrentMonth: current.getMonth() === month,
            isToday: dateStr === today.toISOString().split('T')[0],
            isTomorrow: dateStr === tomorrow.toISOString().split('T')[0],
            isNotBookable: isNotBookable,
            reservation: reservation,
            key: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`
        })

        current.setDate(current.getDate() + 1)
    }

    return dates
})

// 方法
const setFontSize = (size) => {
    currentFontSize.value = size;
}

const showToastMessage = (message, duration = 2000) => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, duration)
}

const openUserModal = () => {
    showUserModal.value = true
}

const closeUserModal = () => {
    showUserModal.value = false
}

const saveUserSettings = () => {
    // 用戶設置不需要保存到後端，直接關閉彈窗
    showToastMessage('用戶設置已保存')
    closeUserModal()
}

const loadBookingList = async () => {
    try {
        isLoading.value = true
        const response = await getBookingList()

        if (response.success) {
            reservations.value = response.data || []
            showToastMessage('資料載入成功')
        } else {
            showToastMessage(response.message || '載入資料失敗')
        }
    } catch (error) {
        console.error('載入預約列表失敗:', error)
        showToastMessage('載入資料失敗')
    } finally {
        isLoading.value = false
    }
}

// 新增：動態查找路線組的方法 - 改動位置
const findMatchingRouteGroup = (reservation) => {
    for (const [groupKey, group] of Object.entries(routeGroups.value)) {
        if (group.departureArea === reservation.departureArea &&
            group.departureAddress === reservation.departureAddress) {
            return groupKey
        }
    }
    return null
}

const selectDate = (date) => {
    if (!date.isCurrentMonth || date.isNotBookable) return

    selectedDate.value = date.date
    existingReservation.value = date.reservation
    selectedRouteGroup.value = '' // 重置路線選擇
    showRouteDetails.value = false

    if (date.reservation) {
        // 動態查找匹配的路線組 - 改動位置
        const matchingGroup = findMatchingRouteGroup(date.reservation)
        if (matchingGroup) {
            selectedRouteGroup.value = matchingGroup
            showRouteDetails.value = true
        }

        // 填充預約表單
        reservationForm.value = {...date.reservation}
    } else {
        // 新建預約，使用第一個可用路線作為預設值 - 改動位置
        const firstAvailableGroup = Object.keys(availableRouteGroups.value)[0]
        const defaultGroup = firstAvailableGroup ? userSettings.value[firstAvailableGroup] : userSettings.value.group1

        reservationForm.value = {
            bookingDate: date.date,
            bookingTime: defaultGroup.bookingTime || '07:15',
            departureArea: defaultGroup.departureArea || '',
            departureAddress: defaultGroup.departureAddress || '',
            arrivalArea: defaultGroup.arrivalArea || '',
            arrivalAddress: defaultGroup.arrivalAddress || '',
            scheduleDate: tomorrow.toISOString().split('T')[0], // 改為明天作為預設值
            remark: ''
        }
    }

    showReservationModal.value = true
}

const closeReservationModal = () => {
    showReservationModal.value = false
}

const submitReservation = async () => {
    if (!selectedRouteGroup.value) {
        showToastMessage('請選擇常用路線')
        return
    }

    try {
        isLoading.value = true

        if (existingReservation.value) {
            // 更新：先刪除再創建
            await deleteBooking(existingReservation.value)
            const response = await createBooking(reservationForm.value)

            if (response.success) {
                showToastMessage('預約已更新')
                await loadBookingList()
            } else {
                showToastMessage(response.message || '更新預約失敗')
            }
        } else {
            // 新增預約
            const response = await createBooking(reservationForm.value)

            if (response.success) {
                showToastMessage('預約已創建')
                await loadBookingList()
            } else {
                showToastMessage(response.message || '創建預約失敗')
            }
        }

        closeReservationModal()
    } catch (error) {
        console.error('提交預約失敗:', error)
        showToastMessage('提交預約失敗')
    } finally {
        isLoading.value = false
    }
}

const deleteReservation = async () => {
    if (!existingReservation.value) return

    try {
        isLoading.value = true
        const response = await deleteBooking(existingReservation.value)

        if (response.success) {
            showToastMessage('預約已刪除')
            await loadBookingList()
        } else {
            showToastMessage(response.message || '刪除預約失敗')
        }

        closeReservationModal()
    } catch (error) {
        console.error('刪除預約失敗:', error)
        showToastMessage('刪除預約失敗')
    } finally {
        isLoading.value = false
    }
}

const deleteReservationFromList = async (reservation) => {
    try {
        isLoading.value = true
        const response = await deleteBooking(reservation)

        if (response.success) {
            showToastMessage('預約已刪除')
            await loadBookingList()
        } else {
            showToastMessage(response.message || '刪除預約失敗')
        }
    } catch (error) {
        console.error('刪除預約失敗:', error)
        showToastMessage('刪除預約失敗')
    } finally {
        isLoading.value = false
    }
}

const viewReservation = (reservation) => {
    selectedDate.value = reservation.bookingDate
    existingReservation.value = reservation
    reservationForm.value = {...reservation}

    // 動態查找匹配的路線組 - 改動位置
    const matchingGroup = findMatchingRouteGroup(reservation)
    if (matchingGroup) {
        selectedRouteGroup.value = matchingGroup
        showRouteDetails.value = true
    }

    showReservationModal.value = true
}

const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

const getDateClass = (date) => {
    const classes = ['calendar-date']

    if (!date.isCurrentMonth) classes.push('other-month')
    if (date.isToday) classes.push('today')
    if (date.isTomorrow) classes.push('tomorrow')
    if (date.isNotBookable) classes.push('not-bookable')
    if (date.reservation) classes.push('has-reservation')
    if (date.isCurrentMonth && !date.isNotBookable) classes.push('selectable')

    return classes
}

// 組件掛載時載入數據
onMounted(() => {
    loadBookingList()
})
</script>

<style scoped>
/* 保持原有樣式不變 */
.app-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow: hidden;
}

.glass-container {
    width: 95vw;
    height: 90vh;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.calendar-nav {
    display: flex;
    gap: 0.5rem;
}

h1 {
    color: #333;
    font-size: 1.5rem;
    font-weight: 500;
    text-align: center;
    margin: 0;
    letter-spacing: 0.5px;
    flex: 1; /* 讓標題占據中間空間，保持置中 */
}

.editor-container {
    display: flex;
    flex: 1;
    min-height: 0;
    position: relative;
}

.editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.nav-btn {
    padding: 0.25rem 0.5rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-btn:hover {
    background: #f5f5f5;
}

.panel-content {
    flex: 1;
    padding: 1.5rem;
    color: #2c3e50;
    font-size: v-bind(currentFontSize);
    line-height: 2;
    overflow-y: auto;
    letter-spacing: 0.3px;
    background: rgba(255, 255, 255, 0.8);
}

.panel-content::-webkit-scrollbar {
    width: 6px;
}

.panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

.calendar-container {
    max-width: 100%;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.weekday {
    text-align: center;
    font-weight: 500;
    color: #666;
    padding: 0.5rem;
    font-size: 0.875rem;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
}

.calendar-date {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    position: relative;
    padding: 0.25rem;
    min-height: 60px;
}

.calendar-date.selectable {
    cursor: pointer;
    border-color: #e5e7eb;
}

.calendar-date.selectable:hover {
    background: #f9fafb;
    border-color: #3b82f6;
}

.calendar-date.other-month {
    color: #ccc;
}

.calendar-date.not-bookable {
    color: #999;
    background: #f5f5f5;
}

.calendar-date.today {
    background: #dbeafe;
    border-color: #3b82f6;
    color: #1e40af;
    font-weight: 600;
}

.calendar-date.tomorrow {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
    font-weight: 500;
}

.calendar-date.has-reservation {
    background: #dcfce7;
    border-color: #16a34a;
}

.date-number {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
}

.reservation-dot {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
}

.divider {
    width: 1px;
    background: linear-gradient(
        to bottom,
        transparent,
        rgba(0, 0, 0, 0.1),
        transparent
    );
}

.reservations-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.reservation-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.reservation-item:hover {
    background: #f9fafb;
    border-color: #3b82f6;
}

.reservation-content {
    flex: 1;
    cursor: pointer;
}

.reservation-actions {
    margin-left: 1rem;
}

.btn-delete {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #dc2626;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    transition: all 0.2s ease;
}

.btn-delete:hover {
    background: #b91c1c;
    transform: scale(1.1);
}

.reservation-date {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
}

.reservation-details {
    margin-bottom: 0.5rem;
}

.reservation-trip {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.reservation-route {
    font-size: 0.875rem;
    color: #333;
    margin-bottom: 0.25rem;
}

.reservation-execute {
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 0.25rem;
}

.reservation-remark {
    font-size: 0.75rem;
    color: #666;
}

.no-errors {
    text-align: center;
    color: #666;
    padding: 2rem;
}

.action-bar {
    padding: 1rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

.font-size-controls {
    display: flex;
    gap: 0.5rem;
}

.btn-font {
    padding: 0.4rem 0.8rem;
    background: white;
    color: #666;
    border: 1px solid #ddd;
    font-size: 0.85rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-font:hover {
    background: #f5f5f5;
}

.btn-font-active {
    background: #e5e7eb;
    color: #333;
    border-color: #999;
}

.button-group {
    display: flex;
    gap: 0.75rem;
}

.btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border: 1px solid transparent;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-danger {
    background: #dc2626;
    color: white;
    border: 1px solid #dc2626;
}

.btn-danger:hover {
    background: #b91c1c;
}

.btn-outline {
    background: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
}

.btn-outline:hover {
    background: #eff6ff;
}

/* 模態窗口樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #333;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.5rem;
    line-height: 1;
}

.modal-content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.modal-description {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
    font-size: 0.875rem;
}

.form-input, .select-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.form-input:focus, .select-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-input[readonly] {
    background: #f9fafb;
    color: #666;
}

textarea.form-input {
    resize: vertical;
    min-height: 80px;
}

.modal-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-footer-right {
    display: flex;
    gap: 1rem;
}

/* Loading 樣式 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Toast 樣式 */
.toast-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 1001;
    opacity: 0;
    transition: all 0.3s ease;
}

.toast-show {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
}

.toast-content {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    backdrop-filter: blur(8px);
}

/* 新增用戶設置相關樣式 */
.modal-container-large {
    max-width: 800px;
    max-height: 90vh;
}

.settings-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.settings-section h3 {
    color: #333;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .modal-container-large {
        width: 95%;
        margin: 1rem;
    }
}

/* 路線詳情展開區域樣式 */
.route-details-section {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    animation: slideDown 0.3s ease-out;
}

.route-details-header {
    margin-bottom: 0.75rem;
}

.route-details-header h4 {
    color: #475569;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
}

.route-details-header h4::before {
    content: "📍";
    margin-right: 0.5rem;
}

.route-details-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.route-info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.route-info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.route-info-full {
    grid-column: 1 / -1;
}

.route-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
    min-width: 60px;
    flex-shrink: 0;
}

.route-value {
    font-size: 0.8rem;
    color: #334155;
    word-break: break-word;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
    }
    to {
        opacity: 1;
        transform: translateY(0);
        max-height: 200px;
    }
}

@media (max-width: 768px) {
    .route-info-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .route-info-item {
        flex-direction: column;
        gap: 0.25rem;
    }
}
</style>