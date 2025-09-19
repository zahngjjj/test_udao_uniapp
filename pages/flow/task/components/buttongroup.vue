<template>
  <view class="button-group">
    <!-- 审核中状态的按钮组 -->
    <view v-if="status === 1" class="audit-buttons">
      <button class="approve-btn" @click="handleApprove" :disabled="loading">
        {{ loading ? '处理中...' : '通过' }}
      </button>
      <button class="reject-btn" @click="handleReject" :disabled="loading">
        {{ loading ? '处理中...' : '拒绝' }}
      </button>
      <button class="copy-btn" @click="handleCopy" :disabled="loading">
        抄送
      </button>
    </view>
    
    <!-- 其他状态的按钮 -->
    <view v-else class="other-buttons">
      <button class="resubmit-btn" @click="handleResubmit" :disabled="loading">
        再次提交
      </button>
    </view>
    
    <!-- 抄送组件 -->
    <copy-task 
      ref="copyTaskRef"
      @success="handleCopySuccess"
      @cancel="handleCopyCancel"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { approveTask, rejectTask } from '@/api/task/index'
import CopyTask from './copyTask.vue'

// Props
const props = defineProps({
  status: {
    type: Number,
    required: true
  },
})

// 响应式数据
const loading = ref(false)
const copyTaskRef = ref(null)

// 方法
const handleApprove = async () => {
  const result = await uni.showModal({
    title: '确认通过',
    content: '请输入通过理由',
    editable: true,
    placeholderText: '请输入通过理由'
  })
  
  if (result.confirm) {
    try {
      loading.value = true
      await approveTask({
        id: props.taskId,
        reason: result.content || ''
      })
      
      uni.showToast({
        title: '审批通过',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } catch (error) {
      uni.showToast({
        title: '操作失败',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}

const handleReject = async () => {
  const result = await uni.showModal({
    title: '确认拒绝',
    content: '请输入拒绝理由',
    editable: true,
    placeholderText: '请输入拒绝理由'
  })
  
  if (result.confirm) {
    try {
      loading.value = true
      await rejectTask({
        id: props.taskId,
        reason: result.content || ''
      })
      
      uni.showToast({
        title: '已拒绝',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } catch (error) {
      uni.showToast({
        title: '操作失败',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}

const handleCopy = () => {
  copyTaskRef.value?.show()
}

const handleResubmit = () => {
  try {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    const params = {
      processInstanceId: options.processInstanceId || props.processInstanceId,
      taskId: options.taskId || props.taskId,
      reset: 'true',
      type: options.type || 'edit'
    }
    
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    uni.navigateTo({
      url: `/pages/flow/create/createForm?${queryString}`
    })
  } catch (error) {
    console.error('跳转失败:', error)
    uni.showToast({
      title: '跳转失败',
      icon: 'error'
    })
  }
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
.button-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx;
  border-top: 1px solid #eee;
  z-index: 999;
}

.audit-buttons {
  display: flex;
  gap: 20rpx;
}

.other-buttons {
  display: flex;
}

.approve-btn, .reject-btn, .copy-btn, .resubmit-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: white;
}

.approve-btn {
  background: #28a745;
}

.reject-btn {
  background: #dc3545;
}

.copy-btn {
  background: #17a2b8;
}

.resubmit-btn {
  background: #007aff;
}

.approve-btn:disabled,
.reject-btn:disabled,
.copy-btn:disabled,
.resubmit-btn:disabled {
  background: #ccc;
  color: #999;
}
</style>