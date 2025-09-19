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

    <!-- 已办任务列表 -->
    <view class="done-list">
      <u-list @scrolltolower="loadMore" :show-scrollbar="false">
        <u-list-item 
          v-for="(item, index) in doneList" 
          :key="item.id"
          :border="false"
        >
          <view class="done-card">
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="process-info">
                <text class="process-name">{{ item.processInstance?.name }}</text>
                <u-tag 
                  :text="getStatusText(item.status)" 
                  :type="getStatusType(item.status)"
                  size="mini"
                  shape="circle"
                ></u-tag>
              </view>
            </view>

            <!-- 任务信息 -->
            <view class="task-info">
              
              <view class="info-row" >
                <u-icon name="bookmark" size="14" color="#909399"></u-icon>
                <text class="info-label">类型：</text>
                <text class="info-value">{{  item.processInstanceName || item.name }}</text>
              </view>
              <view class="info-row">
                <u-icon name="account-fill" size="14" color="#409EFF"></u-icon>
                <text class="info-label">发起人：</text>
                <text class="info-value">{{ item.processInstance?.startUser?.nickname || '未知' }}</text>
              </view>
              
              <view class="info-row">
                <u-icon name="clock" size="14" color="#67C23A"></u-icon>
                <text class="info-label">开始时间：</text>
                <text class="info-value">{{ parseTime(item.createTime) }}</text>
              </view>
              
              <view class="info-row">
                <u-icon name="clock-fill" size="14" color="#E6A23C"></u-icon>
                <text class="info-label">结束时间：</text>
                <text class="info-value">{{ parseTime(item.endTime) }}</text>
              </view>
              
              <view class="info-row">
                <u-icon name="list" size="14" color="#909399"></u-icon>
                <text class="info-label">当前任务：</text>
                <text class="info-value">{{ item.name || '已完成' }}</text>
              </view>
              
              <view class="info-row" v-if="item.reason">
                <u-icon name="chat-fill" size="14" color="#F56C6C"></u-icon>
                <text class="info-label">审批意见：</text>
                <text class="info-value">{{ item.reason }}</text>
              </view>
              
              <view class="info-row" v-if="getDuration(item.startTime, item.endTime)">
                <u-icon name="time" size="14" color="#909399"></u-icon>
                <text class="info-label">耗时：</text>
                <text class="info-value">{{ getDuration(item.startTime, item.endTime) }}</text>
              </view>
              
              <!-- <view class="info-row" v-if="item.processInstanceId">
                <u-icon name="bookmark" size="14" color="#909399"></u-icon>
                <text class="info-label">流程编号：</text>
                <text class="info-value">{{ item.processInstanceId }}</text>
              </view> -->
              
              <view class="info-row" v-if="item.id">
                <u-icon name="bookmark-fill" size="14" color="#909399"></u-icon>
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
                text="历史" 
                type="info" 
                size="small"
                style="color:#409EFF"
                @click="handleViewDetail(item)"
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
      v-if="doneList.length === 0 && !loading"
      text="暂无已办任务"
      icon="list"
    ></u-empty>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTaskDonePage } from '@/api/task/index.js'
import { parseTime } from "@/utils/ruoyi"
// 响应式数据
const searchKeyword = ref('')
const doneList = ref([])
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

// 获取已办任务列表
const getDoneList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      pageNo: isRefresh ? 1 : pageNum.value,
      pageSize: pageSize.value,
      name: searchKeyword.value || undefined
    }
    
    const response = await getTaskDonePage(params)
    
    if (response && response.code === 0) {
      const { list, total: totalCount } = response.data
      
      if (isRefresh) {
        doneList.value = list
        pageNum.value = 1
      } else {
        doneList.value.push(...list)
      }
      
      total.value = totalCount
      pageNum.value++
      
      // 更新加载状态
      if (doneList.value.length >= total.value) {
        loadStatus.value = 'nomore'
      } else {
        loadStatus.value = 'loadmore'
      }
    }
  } catch (error) {
    console.error('获取已办列表失败:', error)
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
    getDoneList()
  }
}

// 搜索处理
const handleSearch = () => {
  pageNum.value = 1
  getDoneList(true)
}


// 计算耗时
const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return ''
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end - start
  
  if (diff < 0) return ''
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    2: '审批通过',
    3: '审批不通过', 
    4: '已取消',
    5: '已退回'
  }
  return statusMap[status] || '已完成'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    2: 'success',
    3: 'error',
    4: 'info',
    5: 'warning'
  }
  return typeMap[status] || 'success'
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

// 查看详情
const handleViewDetail = (item) => {
  console.log(item, 'item')
  uni.navigateTo({
    url: `/pages/flow/task/detail?processInstanceId=${item.processInstanceId}&taskId=${item.id}&readonly=true`
  })
}

// 页面加载
onMounted(() => {
  getDoneList(true)
})

// 下拉刷新
const onRefresh = () => {
  getDoneList(true)
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

.done-list {
  padding: 0 20rpx;
}

.done-card {
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