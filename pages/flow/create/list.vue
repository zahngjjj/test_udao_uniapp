<template>
  <view class="flow-list-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <uni-search-bar 
        v-model="searchKeyword" 
        placeholder="搜索流程"
        @input="onSearchInput"
        @clear="onSearchClear"
      />
    </view>
    
    <!-- 流程定义列表 -->
    <view class="content">
      <view v-if="loading" class="loading-section">
        <uni-load-more status="loading" />
      </view>
      
      <view v-else-if="processDefinitions.length === 0" class="empty-section">
        <text class="empty-text">暂无数据~</text>
      </view>
      
      <view v-else class="card-list">
        <view 
          v-for="item in filteredProcessDefinitions" 
          :key="item.id"
          @click="goToDetail(item)"
          class="process-card"
        >
        {{ item.name }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProcessDefinitionList } from '@/api/definition/index.js'

const loading = ref(false)
const processDefinitions = ref([])
const searchKeyword = ref('')

// 过滤后的流程定义列表
const filteredProcessDefinitions = computed(() => {
  if (!searchKeyword.value) {
    return processDefinitions.value
  }
  return processDefinitions.value.filter(item => 
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    item.key.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取流程定义列表
const loadProcessDefinitions = async () => {
  try {
    loading.value = true
    const response = await getProcessDefinitionList({suspensionState: 1})
    processDefinitions.value = response.data || []
  } catch (error) {
    console.error('获取流程定义列表失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 搜索输入
const onSearchInput = (value) => {
  searchKeyword.value = value
}

// 清除搜索
const onSearchClear = () => {
  searchKeyword.value = ''
}



// 跳转到详情页
const goToDetail = (item) => {
  console.log(item,'dddd')
  uni.navigateTo({
    url: `/pages/flow/create/createForm?processDefinitionId=${item.id}`
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadProcessDefinitions()
})
</script>

<style lang="scss" scoped>
.flow-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-section {
  background-color: #fff;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}

.content {
  padding: 20rpx;
}

.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120rpx;
}

.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  
  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}


.process-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #f0f0f0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    border-color: #e6f7ff;
  }
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
}


</style>