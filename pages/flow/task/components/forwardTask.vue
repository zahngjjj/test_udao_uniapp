<template>
  <uni-popup ref="forwardPopup" type="bottom" :mask-click="false">
    <view class="forward-modal">
      <view class="modal-header">
        <text class="modal-title">转办任务</text>
        <text class="close-btn" @click="handleCancel">×</text>
      </view>
      
      <view class="modal-content">
        <!-- 转办人选择 -->
        <view class="forward-user-section">
          <text class="section-title">* 转办人</text>
          
          <!-- 已选用户显示 -->
          <view v-if="selectedUser" class="selected-user">
            <text class="selected-title">已选择：</text>
            <view class="selected-tag">
              <text class="tag-name">{{ selectedUser.nickname }}</text>
              <text class="tag-remove" @click="removeUser">×</text>
            </view>
          </view>
          
          <!-- 选择按钮 -->
          <button class="select-user-btn" @click="showUserSelector">
            {{ selectedUser ? '重新选择转办人' : '选择转办人' }}
          </button>
        </view>
        
        <!-- 转办意见 -->
        <view class="forward-reason-section">
          <text class="section-title">转办意见</text>
          <textarea
            v-model="forwardReason"
            placeholder="请输入转办意见"
            class="reason-textarea"
            maxlength="500"
          />
          <text class="char-count">{{ forwardReason.length }}/500</text>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button 
          class="confirm-btn" 
          :disabled="!selectedUser || loading"
          @click="handleConfirm"
        >
          {{ loading ? '转办中...' : '确认转办' }}
        </button>
      </view>
    </view>
  </uni-popup>
  
  <!-- 用户选择器弹框 -->
  <uni-popup ref="userSelectorPopup" type="bottom" :mask-click="false">
    <view class="user-selector-modal">
      <view class="modal-header">
        <text class="modal-title">选择转办人</text>
        <text class="close-btn" @click="closeUserSelector">×</text>
      </view>
      
      <view class="user-selector-content">
        <!-- 搜索框 -->
        <view class="search-box">
          <input 
            v-model="searchKeyword" 
            placeholder="搜索用户" 
            class="search-input"
          />
        </view>
        
        <!-- 用户列表 -->
        <scroll-view class="user-list" scroll-y>
          <view 
            v-for="user in filteredUsers" 
            :key="user.id" 
            class="user-item"
            :class="{ 'selected': isUserSelected(user) }"
            @click="selectUser(user)"
          >
            <view class="user-info">
              <text class="user-name">{{ user.nickname }}</text>
            </view>
            <view class="user-check">
              <text class="radio" :class="{ 'checked': isUserSelected(user) }">●</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="closeUserSelector">取消</button>
        <button 
          class="confirm-btn" 
          :disabled="!selectedUser"
          @click="confirmUserSelection"
        >
          确定
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserList } from '@/api/common/index'
import { transferTask } from '@/api/task/index'

// Emits
const emit = defineEmits(['success', 'cancel'])

// 模板引用
const forwardPopup = ref(null)
const userSelectorPopup = ref(null)

// 响应式数据
const loading = ref(false)
const forwardReason = ref('')
const selectedUser = ref(null) // 单选用户
const userList = ref([])
const searchKeyword = ref('')
const taskId = ref('') // 从路由获取的taskId

// 计算属性
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return userList.value
  return userList.value.filter(user => 
    user.nickname.includes(searchKeyword.value)
  )
})

// 获取路由参数中的taskId
const getTaskIdFromRoute = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  taskId.value = options.taskId || options.id || ''
  
  if (!taskId.value) {
    console.error('未能从路由获取taskId')
    // uni.showToast({
    //   title: '参数错误',
    //   icon: 'error'
    // })
  }
}

// 方法
const loadUsers = async () => {
  try {
    const response = await getUserList({
      pageNo: 1,
      pageSize: 1000,
      status: 0
    })
    
    console.log('API响应数据:', response)
    
    // 直接使用 response.data，因为用户数据就在这里
    userList.value = response.data || []
    
    console.log('用户列表:', userList.value)
    
    if (userList.value.length === 0) {
      uni.showToast({
        title: '暂无用户数据',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    uni.showToast({
      title: '加载用户失败',
      icon: 'error'
    })
  }
}

const isUserSelected = (user) => {
  return selectedUser.value && selectedUser.value.id === user.id
}

const selectUser = (user) => {
  selectedUser.value = user
}

const removeUser = () => {
  selectedUser.value = null
}

const showUserSelector = () => {
  userSelectorPopup.value?.open()
}

const closeUserSelector = () => {
  userSelectorPopup.value?.close()
}

const confirmUserSelection = () => {
  closeUserSelector()
}


const handleConfirm = async () => {
  if (!selectedUser.value) {
    uni.showToast({
      title: '请选择转办人',
      icon: 'error'
    })
    return
  }
  
  if (!taskId.value) {
    uni.showToast({
      title: '任务ID不能为空',
      icon: 'error'
    })
    return
  }
  
  try {
    loading.value = true
    await transferTask({
      id: taskId.value, // 使用从路由获取的taskId
      reason: forwardReason.value,
      assigneeUserId: selectedUser.value.id
    })
    
    uni.showToast({
      title: '转办成功',
      icon: 'success'
    })
    
    // 重置数据
    resetData()
    
    // 关闭弹框
    forwardPopup.value?.close()
    
    // 触发成功事件
    emit('success')
    
  } catch (error) {

    
    // 获取API返回的具体错误信息
    let errorMessage = '转办失败'
    
    if (error && error.msg) {
      errorMessage = error.msg
    } else if (error && error.message) {
      errorMessage = error.message
    } else if (error && error.data && error.data.msg) {
      errorMessage = error.data.msg
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'error',
      duration: 3000 // 延长显示时间，确保用户能看到完整错误信息
    })
  } finally {
    loading.value = false
  }
}


const handleCancel = () => {
  resetData()
  forwardPopup.value?.close()
  emit('cancel')
}

const resetData = () => {
  forwardReason.value = ''
  selectedUser.value = null
  searchKeyword.value = ''
}

// 暴露给父组件的方法
const show = () => {
  resetData()
  getTaskIdFromRoute() // 每次显示时重新获取taskId
  forwardPopup.value?.open()
}

defineExpose({
  show
})

// 生命周期
onMounted(() => {
  loadUsers()
  getTaskIdFromRoute() // 组件挂载时获取taskId
})
</script>

<style scoped>
.forward-modal {
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.user-selector-modal {
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.user-selector-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.forward-user-section {
  margin-bottom: 30rpx;
}

.forward-reason-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.selected-user {
  margin-bottom: 20rpx;
}

.selected-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  background: #007aff;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
  width: fit-content;
}

.tag-name {
  margin-right: 8rpx;
}

.tag-remove {
  font-size: 32rpx;
  font-weight: bold;
  cursor: pointer;
}

.select-user-btn {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 1px dashed #007aff;
  border-radius: 8rpx;
  color: #007aff;
  font-size: 28rpx;
}

.reason-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  resize: none;
  margin-bottom: 10rpx;
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  display: block;
}

.search-box {
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.user-list {
  flex: 1;
  padding: 0 20rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-item.selected {
  background: #f0f8ff;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-check {
  width: 40rpx;
  text-align: center;
}

.radio {
  font-size: 24rpx;
  color: #ddd;
}

.radio.checked {
  color: #007aff;
}

.modal-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1px solid #eee;
  gap: 20rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 30rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #007aff;
  color: white;
}

.confirm-btn:disabled {
  background: #ccc;
  color: #999;
}
</style>