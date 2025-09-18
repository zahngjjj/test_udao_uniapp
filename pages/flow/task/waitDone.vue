<template>
  <view class="container">
    <!-- 搜索和筛选区域 -->
    <view class="search-section">
      <u-search 
        v-model="searchKeyword" 
        placeholder="搜索流程名称" 
        @search="handleSearch"
        @custom="handleSearch"
        shape="round"
        bg-color="#f8f9fa"
      ></u-search>
    </view>

    <!-- 待办任务列表 -->
    <view class="todo-list">
      <u-list @scrolltolower="loadMore" :show-scrollbar="false">
        <u-list-item 
          v-for="(item, index) in todoList" 
          :key="item.id"
          :border="false"
        >
          <view class="todo-card">
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="process-info">
                <text class="process-name">{{ item.processInstanceName || item.name }}</text>
                <u-tag 
                  text="待办" 
                  type="warning"
                  size="mini"
                  shape="circle"
                ></u-tag>
              </view>
            </view>

            <!-- 任务信息 -->
            <view class="task-info">
              <view class="info-row">
                <u-icon name="account-fill" size="14" color="#409EFF"></u-icon>
                <text class="info-label">发起人：</text>
                <text class="info-value">{{ item.startUserNickname || '未知' }}</text>
              </view>
              
              <view class="info-row">
                <u-icon name="clock" size="14" color="#67C23A"></u-icon>
                <text class="info-label">发起时间：</text>
                <text class="info-value">{{ formatTime(item.processInstanceCreateTime) }}</text>
              </view>
              
              <view class="info-row">
                <u-icon name="list" size="14" color="#E6A23C"></u-icon>
                <text class="info-label">当前任务：</text>
                <text class="info-value">{{ item.name || '待处理' }}</text>
              </view>
              
              <view class="info-row" v-if="item.processInstanceId">
                <u-icon name="bookmark" size="14" color="#909399"></u-icon>
                <text class="info-label">流程编号：</text>
                <text class="info-value">{{ item.processInstanceId}}</text>
              </view>
              
              <view class="info-row" v-if="item.id">
                <u-icon name="bookmark" size="14" color="#909399"></u-icon>
                <text class="info-label">任务编号：</text>
                <text class="info-value">{{ item.id }}</text>
              </view>
            </view>

            <!-- 摘要信息 -->
            <view class="card-summary" v-if="getSummaryText(item)">
              <view class="summary-row">
                <u-icon name="file-text" size="16" color="#409EFF"></u-icon>
                <text class="summary-text">{{ getSummaryText(item) }}</text>
              </view>
            </view>

            <!-- 卡片底部操作 -->
            <view class="card-actions">
              <u-button 
                text="办理" 
                type="primary" 
                size="small"
                @click="handleProcess(item)"
              ></u-button>
            </view>
          </view>
        </u-list-item>
      </u-list>
    </view>

    <!-- 加载更多 -->
    <u-loadmore 
      :status="loadStatus" 
      :load-text="loadText"
      @loadmore="loadMore"
    ></u-loadmore>

    <!-- 空状态 -->
    <u-empty 
      v-if="todoList.length === 0 && !loading"
      text="暂无待办任务"
      icon="list"
    ></u-empty>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTaskTodoPage } from '@/api/task/index.js'

// 响应式数据
const searchKeyword = ref('')
const todoList = ref([])
const loading = ref(false)
const loadStatus = ref('loadmore')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载文本配置
const loadText = ref({
  loadmore: '轻轻上拉',
  loading: '努力加载中',
  nomore: '没有更多了'
})

// 获取待办任务列表
const getTodoList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      pageNo: isRefresh ? 1 : pageNum.value,
      pageSize: pageSize.value,
      name: searchKeyword.value || undefined
    }
    
    const response = await getTaskTodoPage(params)
    
    if (response && response.code === 0) {
      const { list, total: totalCount } = response.data
      
      if (isRefresh) {
        todoList.value = list
        pageNum.value = 1
      } else {
        todoList.value.push(...list)
      }
      
      total.value = totalCount
      pageNum.value++
      
      // 更新加载状态
      if (todoList.value.length >= total.value) {
        loadStatus.value = 'nomore'
      } else {
        loadStatus.value = 'loadmore'
      }
    }
  } catch (error) {
    console.error('获取待办列表失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loadStatus.value === 'loadmore') {
    loadStatus.value = 'loading'
    getTodoList()
  }
}

// 搜索处理
const handleSearch = () => {
  pageNum.value = 1
  getTodoList(true)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取摘要文本
const getSummaryText = (item) => {
  // 检查是否有表单数据
  if (item.formVariables && Array.isArray(item.formVariables)) {
    const textFields = item.formVariables
      .filter(field => field && field.value && typeof field.value === 'string' && field.value.trim().length > 10)
      .sort((a, b) => b.value.length - a.value.length)
    
    if (textFields.length > 0) {
      const longestField = textFields[0]
      const text = longestField.key 
        ? `${longestField.key}: ${longestField.value}`
        : longestField.value
      
      return text.length > 100 
        ? text.substring(0, 100) + '...'
        : text
    }
  }
  
  // 检查其他可能的摘要字段
  const possibleFields = ['description', 'reason', 'content', 'remark']
  for (const fieldName of possibleFields) {
    if (item[fieldName] && typeof item[fieldName] === 'string' && item[fieldName].trim().length > 10) {
      const text = item[fieldName]
      return text.length > 100 
        ? text.substring(0, 100) + '...'
        : text
    }
  }
  
  return ''
}

// 处理任务
const handleProcess = (item) => {
  console.log(item,'item')
  uni.navigateTo({
    url: `/pages/flow/task/detail?processInstanceId=${item.processInstanceId}&taskId=${item.id}&reset=true&type=todo`
  })
}


// 页面加载
onMounted(() => {
  getTodoList(true)
})

// 下拉刷新
const onRefresh = () => {
  getTodoList(true)
}

// 暴露刷新方法给父组件
defineExpose({
  refresh: onRefresh
})
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.search-section {
  background-color: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.todo-list {
  padding: 0 20rpx;
}

.todo-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.process-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.process-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.time-text {
  font-size: 24rpx;
  color: #909399;
}

.task-info {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
  padding: 4rpx 0;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 26rpx;
  color: #606266;
  min-width: 120rpx;
}

.info-value {
  font-size: 26rpx;
  color: #303133;
  flex: 1;
}

.card-summary {
  padding: 12rpx 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16rpx;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.summary-text {
  flex: 1;
  font-size: 28rpx;
  color: #303133;
  line-height: 1.4;
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4rpx;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>