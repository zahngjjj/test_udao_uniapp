<template>
  <view class="status-container" v-if="statusInfo">
    <view class="status-item">
      <image :src="statusInfo.icon" class="status-icon"></image>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
// 导入状态图片
import runningIcon from '@/static/images/status/running.svg'
import approveIcon from '@/static/images/status/approve.svg'
import rejectIcon from '@/static/images/status/reject.svg'
import cancelIcon from '@/static/images/status/cancel.svg'

// 定义props
const props = defineProps({
  status: {
    type: [Number, String],
    default: null
  }
})

// 状态映射配置
const statusConfig = {
  1: {
    text: '审批中',
    icon: runningIcon,
    class: 'status-running'
  },
  2: {
    text: '已通过',
    icon: approveIcon,
    class: 'status-approved'
  },
  3: {
    text: '不通过',
    icon: rejectIcon,
    class: 'status-rejected'
  },
  4: {
    text: '已取消',
    icon: cancelIcon,
    class: 'status-cancelled'
  }
}

// 计算状态信息
const statusInfo = computed(() => {
  return statusConfig[props.status] || null
})
</script>

<style scoped>
.status-container {
  margin-bottom: 20rpx;
  padding: 24rpx;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.status-icon {
  width: 178rpx;
  height: 178rpx;
}

.status-text {
  font-size: 32rpx;
  font-weight: 600;
}


</style>