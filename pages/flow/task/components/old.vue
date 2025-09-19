<template>
  <view class="button-container">
    <view class="button-wrapper">
      <!-- 审核中状态的按钮组 -->
      <template v-if="status === 1">
        <button class="action-button approve-button" @click="handleApprove">
          <text class="button-icon">✓</text>
          <text class="button-text">通过</text>
        </button>
        <button class="action-button reject-button" @click="handleReject">
          <text class="button-icon">✕</text>
          <text class="button-text">拒绝</text>
        </button>
        <button class="action-button transfer-button" @click="handleTransfer">
          <text class="button-icon">↗</text>
          <text class="button-text">抄送</text>
        </button>
        <button class="action-button forward-button" @click="handleForward">
          <text class="button-icon">→</text>
          <text class="button-text">转办</text>
        </button>
        <button class="action-button delegate-button" @click="handleDelegate">
          <text class="button-icon">⚡</text>
          <text class="button-text">委派</text>
        </button>
        <button class="action-button add-button" @click="handleAdd">
          <text class="button-icon">+</text>
          <text class="button-text">加签</text>
        </button>
        <button class="action-button return-button" @click="handleReturn">
          <text class="button-icon">←</text>
          <text class="button-text">退回</text>
        </button>
        <button class="action-button cancel-button" @click="handleCancel">
          <text class="button-icon">↶</text>
          <text class="button-text">取消</text>
        </button>
      </template>
      
      <!-- 其他状态的按钮 -->
      <template v-else>
        <button class="action-button resubmit-button" @click="handleResubmit">
          <text class="button-icon">↻</text>
          <text class="button-text">再次提交</text>
        </button>
      </template>
    </view>


  <!-- 抄送弹框 -->
  <view v-if="showTransferModal" class="modal-overlay" @click="closeTransferModal">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">抄送</text>
        <text class="modal-close" @click="closeTransferModal">×</text>
      </view>
      
      <view class="modal-body">
        <!-- 抄送人选择 -->
        <view class="form-item">
          <text class="form-label">* 抄送人</text>
          <view class="select-wrapper" @click="showUserPicker">
            <view v-if="selectedUsers.length === 0" class="select-placeholder">
              请选择抄送人
            </view>
            <view v-else class="selected-users">
              <view 
                v-for="user in selectedUsers" 
                :key="user.id" 
                class="user-tag"
              >
                <text class="user-name">{{ user.nickname }}</text>
                <text class="remove-user" @click.stop="removeUser(user.id)">×</text>
              </view>
            </view>
            <text class="select-arrow">▼</text>
          </view>
        </view>
        
        <!-- 抄送意见 -->
        <view class="form-item">
          <text class="form-label">抄送意见</text>
          <textarea 
            class="textarea-input" 
            v-model="transferReason" 
            placeholder="请输入抄送意见"
            maxlength="200"
          ></textarea>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="modal-button cancel-btn" @click="closeTransferModal">取消</button>
        <button class="modal-button confirm-btn" @click="confirmTransfer" :disabled="selectedUsers.length === 0">抄送</button>
      </view>
    </view>
  </view>

<!-- 用户多选选择器 -->
    <picker-view 
      v-if="showPicker" 
      class="user-picker"
      :value="[]"
      @change="onUserSelect"
      @cancel="showPicker = false"
    >
      <picker-view-column>
        <view 
          v-for="(user, index) in userList" 
          :key="user.id" 
          class="picker-item"
          @click="toggleUserSelection(user)"
        >
          <text class="picker-checkbox" :class="{ selected: isUserSelected(user.id) }">{{ isUserSelected(user.id) ? '☑' : '☐' }}</text>
          <text class="picker-name">{{ user.nickname }}</text>
        </view>
      </picker-view-column>
    </picker-view>
    
    <!-- 用户选择器 -->
    <picker 
      v-if="showPicker" 
      :range="userList" 
      range-key="name" 
      @change="onUserSelect" 
      @cancel="showPicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup>
import { ref } from 'vue'
// import { approveTask, rejectTask, forwardTask, delegateTask, addSignTask, returnTask, cancelTask } from '@/api/task/index.js'
import { approveTask, rejectTask, copyTask, } from '@/api/task/index.js'
import { getUserList } from '@/api/common/index.js'
// 定义props
const props = defineProps({
  status: {
    type: [Number, String],
    default: null
  },
  taskId: {
    type: [Number, String],
    required: true
  },
  processInstanceId: {
    type: [Number, String],
    required: true
  }
})

// 加载状态
const loading = ref(false)


// 抄送弹框相关
const showTransferModal = ref(false)
const transferReason = ref('')
const selectedUsers = ref([])
const userList = ref([])
const showPicker = ref(false)
// 抄送相关数据
const copyForm = ref({
  reason: '',
  copyUserIds: []
})



const handleCopy = () => {
  copyForm.value = {
    reason: '',
    copyUserIds: []
  }
  showCopyModal.value = true
  $refs.copyPopup.open()
}


const handleUserSelectConfirm = (selectedUsers) => {
  copyForm.value.copyUserIds = selectedUsers
}

const confirmCopy = async () => {
  if (copyForm.value.copyUserIds.length === 0) {
    uni.showToast({
      title: '请选择抄送人',
      icon: 'error'
    })
    return
  }
  
  try {
    loading.value = true
    await copyTask({
      id: props.taskId,
      reason: copyForm.value.reason,
      copyUserIds: copyForm.value.copyUserIds.map(user => user.id)
    })
    
    uni.showToast({
      title: '抄送成功',
      icon: 'success'
    })
    
    closeCopyModal()
    
    // 跳转回列表页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('抄送失败:', error)
    uni.showToast({
      title: '抄送失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const closeCopyModal = () => {
  showCopyModal.value = false
  $refs.copyPopup.close()
}

// 显示消息提示
const showMessage = (message, type = 'success') => {
  uni.showToast({
    title: message,
    icon: type === 'success' ? 'success' : 'none',
    duration: 2000
  })
}
// 获取用户列表
const loadUserList = async () => {
  try {
    const response = await getUserList()
    userList.value = response.data || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    userList.value = []
  }
}
// 显示用户选择器
const showUserPicker = () => {
  if (userList.value.length === 0) {
    loadUserList()
  }
  showPicker.value = true
}

// 用户选择事件
const onUserSelect = (e) => {
  const selectedIndexes = e.detail.value
  selectedUsers.value = selectedIndexes.map(index => userList.value[index])
  showPicker.value = false
}
// 移除选中的用户
const removeUser = (userId) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId)
}

// 打开抄送弹框
const openTransferModal = () => {
  showTransferModal.value = true
  transferReason.value = ''
  selectedUsers.value = []
  loadUserList()
}
// 关闭抄送弹框
const closeTransferModal = () => {
  showTransferModal.value = false
  transferReason.value = ''
  selectedUsers.value = []
}


// 确认抄送
const confirmTransfer = async () => {
  if (selectedUsers.value.length === 0) {
    showMessage('请选择抄送人', 'error')
    return
  }
  
  try {
    loading.value = true
    const copyUserIds = selectedUsers.value.map(user => user.id)
    await copyTask({
      id: props.taskId,
      reason: transferReason.value || '',
      copyUserIds: copyUserIds
    })
    showMessage('抄送成功')
    closeTransferModal()
  } catch (error) {
    showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  } finally {
    loading.value = false
  }
}
// 抄送
const handleTransfer = () => {
  openTransferModal()
}


const toggleUserSelection = (user) => {
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(user)
  }
}

// 检查用户是否已选中
const isUserSelected = (userId) => {
  return selectedUsers.value.some(user => user.id === userId)
}
// 显示确认对话框
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}


// 通过审批
const handleApprove = async () => {
  // 弹出输入框让用户输入审批意见
  uni.showModal({
    title: '审批意见',
    editable: true,
    placeholderText: '请输入审批意见',
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || ''
        
        try {
          loading.value = true
          await approveTask({
            id: props.taskId,
            reason: reason
          })
          showMessage('审批通过成功')
          // 刷新页面或返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          showMessage('操作失败：' + (error.message || '未知错误'), 'error')
        } finally {
          loading.value = false
        }
      }
    }
  })
}

// 拒绝审批
const handleReject = async () => {
  // 弹出输入框让用户输入拒绝理由
  uni.showModal({
    title: '审批意见',
    editable: true,
    placeholderText: '请输入审批意见',
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || ''
        
        try {
          loading.value = true
          await rejectTask({
            id: props.taskId,
            reason: reason
          })
          showMessage('审批拒绝成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          showMessage('操作失败：' + (error.message || '未知错误'), 'error')
        } finally {
          loading.value = false
        }
      }
    }
  })
}




// 转办
const handleForward = async () => {
  // const confirmed = await showConfirm('确认操作', '确定要转办此任务吗？')
  // if (!confirmed) return
  
  // try {
  //   loading.value = true
  //   await forwardTask({
  //     taskId: props.taskId,
  //     processInstanceId: props.processInstanceId
  //   })
  //   showMessage('转办成功')
  // } catch (error) {
  //   showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  // } finally {
  //   loading.value = false
  // }
}

// 委派
const handleDelegate = async () => {
  // const confirmed = await showConfirm('确认操作', '确定要委派此任务吗？')
  // if (!confirmed) return
  
  // try {
  //   loading.value = true
  //   await delegateTask({
  //     taskId: props.taskId,
  //     processInstanceId: props.processInstanceId
  //   })
  //   showMessage('委派成功')
  // } catch (error) {
  //   showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  // } finally {
  //   loading.value = false
  // }
}

// 加签
const handleAdd = async () => {
  // const confirmed = await showConfirm('确认操作', '确定要加签此任务吗？')
  // if (!confirmed) return
  
  // try {
  //   loading.value = true
  //   await addSignTask({
  //     taskId: props.taskId,
  //     processInstanceId: props.processInstanceId
  //   })
  //   showMessage('加签成功')
  // } catch (error) {
  //   showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  // } finally {
  //   loading.value = false
  // }
}

// 退回
const handleReturn = async () => {
  // const confirmed = await showConfirm('确认操作', '确定要退回此任务吗？')
  // if (!confirmed) return
  
  // try {
  //   loading.value = true
  //   await returnTask({
  //     taskId: props.taskId,
  //     processInstanceId: props.processInstanceId
  //   })
  //   showMessage('退回成功')
  //   setTimeout(() => {
  //     uni.navigateBack()
  //   }, 1500)
  // } catch (error) {
  //   showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  // } finally {
  //   loading.value = false
  // }
}

// 取消
const handleCancel = async () => {
  // const confirmed = await showConfirm('确认操作', '确定要取消此任务吗？')
  // if (!confirmed) return
  
  // try {
  //   loading.value = true
  //   await cancelTask({
  //     taskId: props.taskId,
  //     processInstanceId: props.processInstanceId
  //   })
  //   showMessage('取消成功')
  //   setTimeout(() => {
  //     uni.navigateBack()
  //   }, 1500)
  // } catch (error) {
  //   showMessage('操作失败：' + (error.message || '未知错误'), 'error')
  // } finally {
  //   loading.value = false
  // }
}

// 再次提交
const handleResubmit = async () => {
  const confirmed = await showConfirm('确认操作', '确定要再次提交吗？')
  if (!confirmed) return
  
  try {
    loading.value = true
    
    // 从当前页面路由获取参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    // 构建跳转参数
    const params = {
      processInstanceId: options.processInstanceId || props.processInstanceId,
      taskId: options.taskId || props.taskId,
      reset: options.reset || 'true',
      type: options.type || 'todo'
    }
    
    // 跳转到创建表单页面
    uni.navigateTo({
      url: `/pages/flow/create/createForm?processInstanceId=${params.processInstanceId}&taskId=${params.taskId}&reset=${params.reset}&type=${params.type}`
    })
    
    showMessage('正在跳转到表单页面')
  } catch (error) {
    showMessage('跳转失败：' + (error.message || '未知错误'), 'error')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* 底部按钮容器 */
.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 32rpx 40rpx 32rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 999;
  border-top: 1rpx solid #f0f0f0;
}

.button-wrapper {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮基础样式 */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  border: 2rpx solid;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 100rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 通过按钮 */
.approve-button {
  background: #e8f5e8;
  border-color: #52c41a;
  color: #52c41a;
}

.approve-button:hover {
  background: #d9f7be;
  transform: translateY(-2rpx);
}

/* 拒绝按钮 */
.reject-button {
  background: #fff2f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.reject-button:hover {
  background: #ffece8;
  transform: translateY(-2rpx);
}

/* 抄送按钮 */
.transfer-button {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.transfer-button:hover {
  background: #bae7ff;
  transform: translateY(-2rpx);
}

/* 转办按钮 */
.forward-button {
  background: #f6ffed;
  border-color: #73d13d;
  color: #73d13d;
}

.forward-button:hover {
  background: #d9f7be;
  transform: translateY(-2rpx);
}

/* 委派按钮 */
.delegate-button {
  background: #fff7e6;
  border-color: #fa8c16;
  color: #fa8c16;
}

.delegate-button:hover {
  background: #ffe7ba;
  transform: translateY(-2rpx);
}

/* 加签按钮 */
.add-button {
  background: #f9f0ff;
  border-color: #722ed1;
  color: #722ed1;
}

.add-button:hover {
  background: #efdbff;
  transform: translateY(-2rpx);
}

/* 退回按钮 */
.return-button {
  background: #fff1f0;
  border-color: #ff7875;
  color: #ff7875;
}

.return-button:hover {
  background: #ffd8d2;
  transform: translateY(-2rpx);
}

/* 取消按钮 */
.cancel-button {
  background: #f5f5f5;
  border-color: #8c8c8c;
  color: #8c8c8c;
}

.cancel-button:hover {
  background: #e8e8e8;
  transform: translateY(-2rpx);
}

/* 再次提交按钮 */
.resubmit-button {
  background: #e8f5e8;
  border-color: #52c41a;
  color: #52c41a;
  min-width: 200rpx;
}

.resubmit-button:hover {
  background: #d9f7be;
  transform: translateY(-2rpx);
}

/* 按钮图标样式 */
.button-icon {
  font-size: 22rpx;
  font-weight: bold;
}

/* 按钮文字样式 */
.button-text {
  font-size: 26rpx;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .button-wrapper {
    gap: 12rpx;
  }
  
  .action-button {
    padding: 12rpx 20rpx;
    font-size: 24rpx;
    min-width: 80rpx;
  }
}

.selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding: 8rpx;
}

.user-tag {
  display: flex;
  align-items: center;
  background: #e6f7ff;
  border: 1rpx solid #91d5ff;
  border-radius: 16rpx;
  padding: 8rpx 12rpx;
  font-size: 24rpx;
}

.user-name {
  color: #1890ff;
  margin-right: 8rpx;
}

.remove-user {
  color: #1890ff;
  font-weight: bold;
  cursor: pointer;
}

.select-placeholder {
  color: #999999;
  padding: 24rpx;
  font-size: 28rpx;
}

/* 用户选择器样式 */
.user-picker {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: #ffffff;
  border-top: 1rpx solid #e0e0e0;
  z-index: 10000;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-checkbox {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: #1890ff;
}

.picker-checkbox.selected {
  color: #52c41a;
}

.picker-name {
  font-size: 28rpx;
  color: #333333;
}

.copy-modal {
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
  display: flex;
  flex-direction: column;
}

.copy-reason-section {
  padding: 20rpx;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.reason-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  resize: none;
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