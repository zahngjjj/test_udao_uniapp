<template>
  <view class="department-select">
    <!-- 下拉选择框 -->
    <view class="select-box" @click="toggleModal">
      <text class="selected-department">
        {{ selectedDept?.name || '请选择部门' }}
      </text>
      <text class="dropdown-icon">▼</text>
    </view>

    <!-- 弹框 -->
    <view v-if="showModal" class="modal">
      <view class="modal-header">
        <text class="modal-title">选择部门</text>
        <text class="modal-close" @click="toggleModal">×</text>
      </view>
      <view class="search-box">
        <input
          v-model="searchKeyword"
          placeholder="搜索部门"
          class="search-input"
          @input="handleSearch"
        />
      </view>
      <scroll-view class="dept-list" scroll-y>
        <view
          v-for="dept in filteredDepts"
          :key="dept.id"
          class="dept-item"
          @click="selectDept(dept)"
        >
          <text class="dept-name">{{ dept.name }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDeptList } from '@/api/common/index'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const deptList = ref([])
const selectedDept = ref(props.modelValue)
const showModal = ref(false)
const searchKeyword = ref('')

// 计算属性：过滤后的部门列表
const filteredDepts = computed(() => {
  if (!searchKeyword.value) return deptList.value
  return deptList.value.filter(dept =>
    dept.name.includes(searchKeyword.value)
  )
})

// 方法：加载部门列表
const loadDepts = async () => {
  try {
    const response = await getDeptList({
      pageNo: 1,
      pageSize: 1000
    })
    deptList.value = response.data || response.data.list || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    uni.showToast({
      title: '加载部门失败',
      icon: 'error'
    })
  }
}

// 方法：切换弹框显示状态
const toggleModal = () => {
  showModal.value = !showModal.value
}

// 方法：选择部门
const selectDept = (dept) => {
  selectedDept.value = dept
  emit('update:modelValue', dept)
  toggleModal()
}

// 方法：搜索部门
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 生命周期：组件挂载时加载部门列表
onMounted(() => {
  loadDepts()
})
</script>

<style scoped>
.department-select {
  position: relative;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
  background: #fff;
  cursor: pointer;
}

.select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-department {
  font-size: 28rpx;
  color: #333;
}

.dropdown-icon {
  font-size: 28rpx;
  color: #999;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
}

.search-box {
  padding: 20rpx;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.dept-list {
  flex: 1;
  background: #fff;
}

.dept-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.dept-name {
  font-size: 28rpx;
  color: #333;
}
</style>