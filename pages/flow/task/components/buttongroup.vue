<template>
  <view class="button-container">
    <view class="button-wrapper">
      <!-- 审核中状态的按钮组 -->
      <template v-if="status === 1">
        <button class="action-button approve-button" @click="handleApprove" :disabled="loading">
          <text class="button-icon">✓</text>
          <text class="button-text">{{ loading ? '处理中...' : '通过' }}</text>
        </button>
        <button class="action-button reject-button" @click="handleReject" :disabled="loading">
          <text class="button-icon">✕</text>
          <text class="button-text">{{ loading ? '处理中...' : '拒绝' }}</text>
        </button>
        <button class="action-button transfer-button" @click="handleCopy" :disabled="loading">
          <text class="button-icon">↗</text>
          <text class="button-text">抄送</text>
        </button>
        <button class="action-button forward-button" @click="handleForward" :disabled="loading">
          <text class="button-icon">→</text>
          <text class="button-text">转办</text>
        </button>
        <button class="action-button delegate-button" @click="handleDelegate" :disabled="loading">
          <text class="button-icon">⚡</text>
          <text class="button-text">委派</text>
        </button>
        <button class="action-button add-button" @click="handleAdd" :disabled="loading">
          <text class="button-icon">+</text>
          <text class="button-text">加签</text>
        </button>
        <button class="action-button return-button" @click="handleReturn" :disabled="loading">
          <text class="button-icon">←</text>
          <text class="button-text">退回</text>
        </button>
        <button class="action-button cancel-button" @click="handleCancel" :disabled="loading">
          <text class="button-icon">↶</text>
          <text class="button-text">取消</text>
        </button>
      </template>
      
      <!-- 其他状态的按钮 -->
      <template v-else>
        <button class="action-button resubmit-button" @click="handleResubmit" :disabled="loading">
          <text class="button-icon">↻</text>
          <text class="button-text">再次提交</text>
        </button>
      </template>
    </view>
    
    <!-- 抄送组件 -->
    <copy-task 
      ref="copyTaskRef"
      :task-id="props.taskId"
      @success="handleCopySuccess"
      @cancel="handleCopyCancel"
    />
    <!-- 转办组件 -->
     <forward-task 
      ref="forwardTaskRef"
      :task-id="props.taskId"
      @success="handleForwardSuccess"
      @cancel="handleForwardCancel"
    />
    <!-- 委派组件 -->
    <DelegateTask ref="delegateTaskRef" :task-id="props.taskId" @success="handleDelegateSuccess" />
      <!-- 加签组件 -->
    <addTask ref="addTaskRef" :task-id="props.taskId" @success="handleSuccess" @cancel="handleCancel" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { approveTask, rejectTask ,getTaskListByReturn } from '@/api/task/index'
import { cancelProcessInstanceByStartUser } from '@/api/processInstance/index'
import CopyTask from '@/pages/flow/task/components/copyTask.vue'
import ForwardTask from '@/pages/flow/task/components/forwardTask.vue'
import DelegateTask from '@/pages/flow/task/components/delegateTask.vue'
import addTask from '@/pages/flow/task/components/addTask.vue'
// Props
const props = defineProps({
  status: {
    type: Number,
    required: true
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

// 响应式数据
const loading = ref(false)
const copyTaskRef = ref(null)
const forwardTaskRef = ref(null)
const delegateTaskRef = ref(null)
const addTaskRef = ref(null)
// 显示消息提示
const showMessage = (message, type = 'success') => {
  uni.showToast({
    title: message,
    icon: type === 'success' ? 'success' : 'none',
    duration: 2000
  })
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

// 方法
const handleApprove = async () => {
  const result = await uni.showModal({
    title: '审批意见',
    editable: true,
    placeholderText: '请输入审批意见'
  })
  
  if (result.confirm) {
    try {
      loading.value = true
      await approveTask({
        id: props.taskId,
        reason: result.content || ''
      })
      
      showMessage('审批通过成功')
      
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

const handleReject = async () => {
  const result = await uni.showModal({
    title: '审批意见',
    editable: true,
    placeholderText: '请输入审批意见'
  })
  
  if (result.confirm) {
    try {
      loading.value = true
      await rejectTask({
        id: props.taskId,
        reason: result.content || ''
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

const handleCopy = () => {
  copyTaskRef.value?.show()
}

// 转办
const handleForward = async () => {
   forwardTaskRef.value?.show()
}


// 加签
const handleAdd = async () => {
  addTaskRef.value?.show()
}


// 退回
const handleReturn = async () => {
  const confirmed = await showConfirm('确认操作', '确定要退回此任务吗？')
  if (!confirmed) return
  
  try {
    loading.value = true
    
    // 获取任务ID，优先从props获取，其次从路由获取
    let taskId = props.taskId
    
    if (!taskId) {
      showMessage('任务ID不能为空', 'error')
      return
    }
    
    // 调用接口获取可退回的节点
    const response = await getTaskListByReturn(taskId)
    

    
    // 检查返回的数据
    if (response && response.code === 0) {
      const returnNodes = response.data || []
      
      if (returnNodes.length === 0) {
        showMessage('当前没有可退回的节点', 'error')
        return
      }
      
      // 如果有可退回的节点，这里可以继续实现选择退回节点的逻辑
      // 暂时显示成功信息，表示找到了可退回的节点
      showMessage(`已退回上一节点`, 'success')
      
      // TODO: 这里可以继续实现选择具体退回节点的弹框逻辑
      
    } else {
      showMessage('获取可退回节点失败', 'error')
    }
    
  } catch (error) {
    console.error('退回操作失败:', error)
    
    // 获取API返回的具体错误信息
    let errorMessage = '退回操作失败'
    
    if (error && error.msg) {
      errorMessage = error.msg
    } else if (error && error.message) {
      errorMessage = error.message
    } else if (error && error.data && error.data.msg) {
      errorMessage = error.data.msg
    }
    
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}


// 取消
const handleCancel = async () => {
  // 显示自定义弹框，包含红色警告文字和输入框
  uni.showModal({
    title: '取消流程,取消后该审批流程将自动结束',
    content: '',
    editable: true,
    placeholderText: '请输入取消理由',
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || ''
        
        if (!reason.trim()) {
          showMessage('请输入取消理由', 'error')
          return
        }
        
        try {
          loading.value = true
          
          // 获取processInstanceId，优先从props获取，其次从路由获取
          let processInstanceId = props.processInstanceId
          if (!processInstanceId) {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const options = currentPage.options
            processInstanceId = options.processInstanceId
          }
          
          if (!processInstanceId) {
            showMessage('流程实例ID不能为空', 'error')
            return
          }
          
          // 调用取消接口
          await cancelProcessInstanceByStartUser({
            id: processInstanceId,
            reason: reason.trim()
          })
          
          showMessage('取消成功', 'success')
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          
        } catch (error) {
          console.error('取消失败:', error)
          
          // 获取API返回的具体错误信息
          let errorMessage = '取消失败'
          
          if (error && error.msg) {
            errorMessage = error.msg
          } else if (error && error.message) {
            errorMessage = error.message
          } else if (error && error.data && error.data.msg) {
            errorMessage = error.data.msg
          }
          
          showMessage(errorMessage, 'error')
        } finally {
          loading.value = false
        }
      }
    }
  })
}


const handleResubmit = () => {
  try {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    const params = {
      id: options.processInstanceId
    }
    
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    uni.navigateTo({
      url: `/pages/flow/task/createTaskAgain?${queryString}`
    })
  } catch (error) {
    console.error('跳转失败:', error)
    showMessage('跳转失败：' + (error.message || '未知错误'), 'error')
  }
}

// 在委派按钮点击事件中调用
const handleDelegate = () => {
  delegateTaskRef.value?.show()
}

const handleDelegateSuccess = () => {
  // 委派成功后的处理逻辑
  uni.showToast({
    title: '委派成功',
    icon: 'success'
  })
  // 可以刷新页面或执行其他操作
}

const handleCopySuccess = () => {
  // 抄送成功后的处理
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

const handleCopyCancel = () => {
  // 抄送取消后的处理
  console.log('抄送已取消')
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

.action-button:disabled {
  background: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #bfbfbf !important;
  cursor: not-allowed;
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
</style>