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
      
      <!-- 状态筛选 -->
      <view class="filter-tabs">
        <u-tabs 
          :list="statusTabs" 
          v-model="activeStatus"
          @change="handleStatusChange"
          :scrollable="false"
        ></u-tabs>
      </view>
    </view>

    <!-- 流程列表 -->
    <view class="process-list">
      <u-list @scrolltolower="loadMore" :show-scrollbar="false">
        <u-list-item 
          v-for="(item, index) in processList" 
          :key="item.id"
          :border="false"
        >
          <view class="process-card">
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="process-info">
                <text class="process-name">{{ item.name }}</text>
                <u-tag 
                  :text="getStatusText(item.status)" 
                  :type="getStatusType(item.status)"
                  size="mini"
                  shape="circle"
                ></u-tag>
              </view>
              <view class="process-time">
                <text class="time-text">{{ parseTime(item.createTime) }}</text>
              </view>
            </view>


            <!-- 卡片内容 -->
            <view class="card-content">
              <view class="content-row">
                <u-icon name="folder" size="14" color="#909399"></u-icon>
                <text class="content-text">{{ item.categoryName || '未分类' }}</text>
              </view>
              
              <view class="content-row" v-if="item.endTime">
                <u-icon name="clock" size="14" color="#909399"></u-icon>
                <text class="content-text">结束时间：{{ parseTime(item.endTime) }}</text>
              </view>
            </view>

            <!-- 卡片底部操作 -->
            <view class="card-actions">
              <u-button 
                text="详情" 
                type="primary" 
                size="mini" 
                plain
                @click="handleViewDetail(item)"
              ></u-button>
              
              <!-- 审批中状态：显示取消按钮 -->
              <u-button 
                v-if="item.status === 1"
                text="取消" 
                type="error" 
                size="mini" 
                plain
                @click="handleCancel(item)"
              ></u-button>
              
              <!-- 审批通过和不通过状态：显示重新发起按钮 -->
              <u-button 
                v-if="item.status === 2 || item.status === 3"
                text="重新发起" 
                type="warning" 
                size="mini" 
                plain
                @click="handleRestart(item)"
              ></u-button>
              
              <!-- 已取消状态：显示重新发起按钮 -->
              <u-button 
                v-if="item.status === 4"
                text="重新发起" 
                type="warning" 
                size="mini" 
                plain
                @click="handleRestart(item)"
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
      v-if="processList.length === 0 && !loading"
      text="暂无流程数据"
      icon="list"
    ></u-empty>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getProcessInstanceMyPage, cancelProcessInstanceByStartUser } from '@/api/processInstance/index.js'
import { getProcessInstanceBpmnModelView } from '@/api/processInstance/index.js'
import { parseTime } from "@/utils/ruoyi"
// 响应式数据
const searchKeyword = ref('')
const activeStatus = ref(0)
const processList = ref([])
const loading = ref(false)
const loadStatus = ref('loadmore')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 状态筛选选项
const statusTabs = ref([
  { name: '全部' },
  { name: '审批中' },
  { name: '已通过' },
  { name: '不通过' },
  { name: '已取消' }
])

// 加载文本配置
const loadText = ref({
  loadmore: '轻轻上拉',
  loading: '努力加载中',
  nomore: '没有更多了'
})

// 获取流程列表
const getProcessList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      pageNo: isRefresh ? 1 : pageNum.value,
      pageSize: pageSize.value,
      name: searchKeyword.value || undefined,
      status: getStatusValue(activeStatus.value)
    }
    
    const response = await getProcessInstanceMyPage(params)
    
    if (response && response.code === 0) {
      const { list, total: totalCount } = response.data
      
      if (isRefresh) {
        processList.value = list
        pageNum.value = 1
      } else {
        processList.value.push(...list)
      }
      
      total.value = totalCount
      pageNum.value++
      
      // 更新加载状态
      if (processList.value.length >= total.value) {
        loadStatus.value = 'nomore'
      } else {
        loadStatus.value = 'loadmore'
      }
    }
  } catch (error) {
    console.error('获取流程列表失败:', error)
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
    getProcessList()
  }
}

// 搜索处理
const handleSearch = () => {
  pageNum.value = 1
  getProcessList(true)
}

// 状态切换
const handleStatusChange = (tabItem) => {
  // 从对象中提取 index 值
  const index = typeof tabItem === 'object' && tabItem.index !== undefined ? tabItem.index : tabItem
  activeStatus.value = index
  pageNum.value = 1
  getProcessList(true)
}


// 获取状态值
const getStatusValue = (index) => {
  const statusMap = {
    0: undefined, // 全部
    1: 1, // 审批中
    2: 2, // 已通过
    3: 3, // 不通过
    4: 4  // 已取消
  }
  const result = statusMap[index]
  return result
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '审批中',
    2: '已通过',
    3: '不通过',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'warning',  // 审批中 - 橙色
    2: 'success',  // 已通过 - 绿色
    3: 'error',    // 不通过 - 红色
    4: 'info'      // 已取消 - 灰色
  }
  return typeMap[status] || 'info'
}





// 查看详情
const handleViewDetail = (item) => {

  getProcessInstanceBpmnModelView(item.id).then(res=>{
    console.log(res,'rrrr')
    const processInstanceId= res.data.tasks[0].processInstanceId;
    const taskId= res.data.tasks[0].id;
    uni.navigateTo({
      url: `/pages/flow/my/detail?processInstanceId=${processInstanceId}&taskId=${taskId}`
    })
  })
  // uni.navigateTo({
  //   url: `/pages/flow/detail/index?id=${item.id}`
  // })
}


// 撤销流程
const handleCancel = (item) => {
  // 使用 uni.showModal 的 editable 属性来实现输入框
  uni.showModal({
    title: '取消流程',
    content: '',
    editable: true,
    placeholderText: '请输入取消原因',
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || '用户主动取消'
        
        if (!reason.trim()) {
          uni.showToast({
            title: '请输入取消原因',
            icon: 'none'
          })
          return
        }
        
        try {
          // 按照您提供的参数格式调用接口
          await cancelProcessInstanceByStartUser({
            id: item.id,
            reason: reason.trim()
          })
          
          uni.showToast({
            title: '取消成功',
            icon: 'success'
          })
          
          // 刷新列表
          getProcessList(true)
        } catch (error) {
          console.error('取消失败:', error)
          uni.showToast({
            title: '取消失败',
            icon: 'error'
          })
        }
      }
    }
  })
}

// 页面加载
onMounted(() => {
  getProcessList(true)
})

// 重新发起流程
const handleRestart = (item) => {
 console.log(item,'item')
  uni.showModal({
    title: '重新发起',
    content: '确定要重新发起该流程吗？',
    success: (res) => {
      if (res.confirm) {
        // 跳转到创建页面，并传入原流程信息
       uni.navigateTo({
          url: `/pages/flow/task/createTaskAgain?id=${item.id}`
        })
      }
    }
  })
}

// 查看取消信息
const handleViewCancel = (item) => {
  uni.showModal({
    title: '取消信息',
    content: item.cancelReason || '该流程已被取消',
    showCancel: false,
    confirmText: '确定'
  })
}
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

.filter-tabs {
  margin-top: 20rpx;
}

.process-list {
  padding: 0 20rpx;
}

.process-card {
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

.process-time {
  flex-shrink: 0;
}

.time-text {
  font-size: 24rpx;
  color: #909399;
}

.card-content {
  margin-bottom: 20rpx;
}

.content-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.content-row:last-child {
  margin-bottom: 0;
}

.content-text {
  font-size: 26rpx;
  color: #606266;
  flex: 1;
}

.card-summary {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  .summary-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    
    .summary-text {
      flex: 1;
      font-size: 14px;
      color: #303133;
      line-height: 1.4;
      font-weight: 500;
    }
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>