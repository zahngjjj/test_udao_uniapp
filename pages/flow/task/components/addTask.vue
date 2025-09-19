<template>
  <uni-popup ref="addPopup" type="bottom" :mask-click="false">
    <view class="add-modal">
      <view class="modal-header">
        <text class="modal-title">加签任务</text>
        <text class="close-btn" @click="handleCancel">×</text>
      </view>
      
      <view class="modal-content">
        <!-- 加签类型选择 -->
        <view class="add-type-section">
          <text class="section-title">* 加签类型</text>
          <view class="type-options">
            <view 
              class="type-option" 
              :class="{ 'selected': addType === 'before' }"
              @click="addType = 'before'"
            >
              <text class="option-text">向前加签</text>
              <text class="option-desc">在当前节点前增加审批人</text>
            </view>
            <view 
              class="type-option" 
              :class="{ 'selected': addType === 'after' }"
              @click="addType = 'after'"
            >
              <text class="option-text">向后加签</text>
              <text class="option-desc">在当前节点后增加审批人</text>
            </view>
          </view>
        </view>
        
        <!-- 加签处理人选择 -->
        <view class="add-users-section">
          <text class="section-title">* 加签处理人</text>
          
          <!-- 已选用户显示 -->
          <view v-if="selectedUsers.length > 0" class="selected-users">
            <text class="selected-title">已选择 ({{ selectedUsers.length }})：</text>
            <view class="selected-tags">
              <view 
                v-for="user in selectedUsers" 
                :key="user.id" 
                class="selected-tag"
              >
                <text class="tag-name">{{ user.nickname }}</text>
                <text class="tag-remove" @click="removeUser(user)">×</text>
              </view>
            </view>
          </view>
          
          <!-- 选择按钮 -->
          <button class="select-user-btn" @click="showUserSelector">
            {{ selectedUsers.length > 0 ? '重新选择处理人' : '选择处理人' }}
          </button>
        </view>
        
        <!-- 加签意见 -->
        <view class="add-reason-section">
          <text class="section-title">* 审批意见</text>
          <textarea
            v-model="addReason"
            placeholder="请输入审批意见"
            class="reason-textarea"
            maxlength="500"
          />
          <text class="char-count">{{ addReason.length }}/500</text>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button 
          class="confirm-btn" 
          :disabled="selectedUsers.length === 0 || !addReason.trim() || loading"
          @click="handleConfirm"
        >
          {{ loading ? '加签中...' : '确认加签' }}
        </button>
      </view>
    </view>
  </uni-popup>
  
  <!-- 用户选择器弹框 -->
  <uni-popup ref="userSelectorPopup" type="bottom" :mask-click="false">
    <view class="user-selector-modal">
      <view class="modal-header">
        <text class="modal-title">选择处理人</text>
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
            @click="toggleUserSelection(user)"
          >
            <view class="user-info">
              <text class="user-name">{{ user.nickname }}</text>
            </view>
            <view class="user-check">
              <text class="checkbox" :class="{ 'checked': isUserSelected(user) }">✓</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="closeUserSelector">取消</button>
        <button 
          class="confirm-btn" 
          :disabled="selectedUsers.length === 0"
          @click="confirmUserSelection"
        >
          确定({{ selectedUsers.length }})
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserList } from '@/api/common/index'
import { signCreateTask } from '@/api/task/index'

// Emits
const emit = defineEmits(['success', 'cancel'])

// 模板引用
const addPopup = ref(null)
const userSelectorPopup = ref(null)

// 响应式数据
const loading = ref(false)
const addType = ref('before') // 加签类型：before-向前加签，after-向后加签
const addReason = ref('')
const selectedUsers = ref([])
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
  return selectedUsers.value.some(selected => selected.id === user.id)
}

const toggleUserSelection = (user) => {
  if (isUserSelected(user)) {
    removeUser(user)
  } else {
    selectedUsers.value.push(user)
  }
}

const removeUser = (user) => {
  const index = selectedUsers.value.findIndex(selected => selected.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  }
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
  if (selectedUsers.value.length === 0) {
    uni.showToast({
      title: '请选择处理人',
      icon: 'error'
    })
    return
  }
  
  if (!addReason.value.trim()) {
    uni.showToast({
      title: '请输入审批意见',
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
    await signCreateTask({
      id: taskId.value, // 使用从路由获取的taskId
      type: addType.value, // before 或 after
      reason: addReason.value,
      userIds: selectedUsers.value.map(user => user.id)
    })
    
    uni.showToast({
      title: '加签成功',
      icon: 'success'
    })
    
    // 重置数据
    resetData()
    
    // 关闭弹框
    addPopup.value?.close()
    
    // 触发成功事件
    emit('success')
    
  } catch (error) {
    console.error('加签失败:', error)
    
    // 获取API返回的具体错误信息
    let errorMessage = '加签失败'
    
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
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  resetData()
  addPopup.value?.close()
  emit('cancel')
}

const resetData = () => {
  addType.value = 'before'
  addReason.value = ''
  selectedUsers.value = []
  searchKeyword.value = ''
}

// 暴露给父组件的方法
const show = () => {
  resetData()
  getTaskIdFromRoute() // 每次显示时重新获取taskId
  addPopup.value?.open()
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
.add-modal {
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

.add-type-section {
  margin-bottom: 30rpx;
}

.add-users-section {
  margin-bottom: 30rpx;
}

.add-reason-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.type-options {
  display: flex;
  gap: 20rpx;
}

.type-option {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.type-option.selected {
  border-color: #007aff;
  background: #f0f8ff;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.option-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.selected-users {
  margin-bottom: 20rpx;
}

.selected-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  background: #007aff;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
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

.checkbox {
  font-size: 32rpx;
  color: #ddd;
}

.checkbox.checked {
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