<template>
  <view class="flow-detail-container">
    <view v-if="loading" class="loading-section">
      <uni-load-more status="loading" />
    </view>
    
    <view v-else class="content">
      <!-- 流程基本信息 -->
      <uni-section title="流程信息" type="line">
        <view class="info-section">
          <view class="info-item">
            <text class="label">流程名称：</text>
            <text class="value">{{ processDefinition.name || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="label">流程标识：</text>
            <text class="value">{{ processDefinition.key || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="label">版本号：</text>
            <text class="value">v{{ processDefinition.version || '1' }}</text>
          </view>
          <view class="info-item">
            <text class="label">状态：</text>
            <text class="value" :class="getStatusClass(processDefinition.suspensionState)">
              {{ getStatusText(processDefinition.suspensionState) }}
            </text>
          </view>
          <view class="info-item" v-if="processDefinition.description">
            <text class="label">描述：</text>
            <text class="value">{{ processDefinition.description }}</text>
          </view>
          <view class="info-item">
            <text class="label">部署时间：</text>
            <text class="value">{{ processDefinition.deploymentTime || '未知' }}</text>
          </view>
        </view>
      </uni-section>
      
      <!-- 流程图预览 -->
      <uni-section title="流程图" type="line">
        <view class="diagram-section">
          <view class="diagram-placeholder">
            <uni-icons type="image" size="60" color="#ccc" />
            <text class="placeholder-text">流程图预览</text>
          </view>
        </view>
      </uni-section>
      
      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="btn-start" type="primary" @click="startProcess">
          发起流程
        </button>
        <button class="btn-view" @click="viewDiagram">
          查看流程图
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProcessDefinition } from '@/api/definition/index.js'

const loading = ref(false)
const processDefinition = ref({})

// 获取页面参数
const getPageParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options
}

// 获取流程定义详情
const loadProcessDefinition = async () => {
  try {
    loading.value = true
    const params = getPageParams()
    const response = await getProcessDefinition(params.id, params.key)
    processDefinition.value = response.data || {}
  } catch (error) {
    console.error('获取流程定义详情失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 获取状态文本
const getStatusText = (suspensionState) => {
  switch (suspensionState) {
    case 1:
      return '激活'
    case 2:
      return '挂起'
    default:
      return '未知'
  }
}

// 获取状态样式类
const getStatusClass = (suspensionState) => {
  switch (suspensionState) {
    case 1:
      return 'status-active'
    case 2:
      return 'status-suspended'
    default:
      return 'status-unknown'
  }
}

// 发起流程
const startProcess = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 查看流程图
const viewDiagram = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadProcessDefinition()
})
</script>

<style lang="scss" scoped>
.flow-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.content {
  padding: 20rpx;
}

.info-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  
  .info-item {
    display: flex;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #666;
      font-size: 28rpx;
      width: 160rpx;
      flex-shrink: 0;
    }
    
    .value {
      color: #333;
      font-size: 28rpx;
      flex: 1;
      word-break: break-all;
      
      &.status-active {
        color: #52c41a;
      }
      
      &.status-suspended {
        color: #faad14;
      }
      
      &.status-unknown {
        color: #999;
      }
    }
  }
}

.diagram-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  
  .diagram-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300rpx;
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    
    .placeholder-text {
      color: #999;
      font-size: 26rpx;
      margin-top: 20rpx;
    }
  }
}

.action-section {
  padding: 40rpx 0;
  display: flex;
  gap: 20rpx;
  
  .btn-start {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 8rpx;
    font-size: 32rpx;
  }
  
  .btn-view {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #f5f5f5;
    color: #666;
    border: none;
    border-radius: 8rpx;
    font-size: 32rpx;
  }
}
</style>