<template>
  <view class="single-user-select">
    <!-- 下拉选择框 -->
    <view class="select-box" @click="toggleModal">
      <text class="selected-user">
        {{ selectedUser?.nickname || '请选择人员' }}
      </text>
      <text class="dropdown-icon">▼</text>
    </view>

    <!-- 弹框 -->
    <view v-if="showModal" class="modal">
      <view class="modal-header">
        <text class="modal-title">选择转办人</text>
        <text class="modal-close" @click="toggleModal">×</text>
      </view>
      <view class="search-box">
        <input
          v-model="searchKeyword"
          placeholder="搜索用户"
          class="search-input"
          @input="handleSearch"
        />
      </view>
      <scroll-view class="user-list" scroll-y>
        <view
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-item"
          @click="selectUser(user)"
        >
          <text class="user-name">{{ user.nickname }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserList } from '@/api/common/index'

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
const userList = ref([])
const selectedUser = ref(props.modelValue)
const showModal = ref(false)
const searchKeyword = ref('')

// 计算属性：过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return userList.value
  return userList.value.filter(user =>
    user.nickname.includes(searchKeyword.value) ||
    (user.deptName && user.deptName.includes(searchKeyword.value))
  )
})

// 方法：加载用户列表
const loadUsers = async () => {
  try {
    const response = await getUserList({
      pageNo: 1,
      pageSize: 1000,
      status: 0 // 只获取正常状态的用户
    })
    userList.value = response.data || response.data.list || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    uni.showToast({
      title: '加载用户失败',
      icon: 'error'
    })
  }
}

// 方法：切换弹框显示状态
const toggleModal = () => {
  console.log('toggleModal 被调用') // 添加日志
  showModal.value = !showModal.value
}

// 方法：选择用户
const selectUser = (user) => {
  selectedUser.value = user
  emit('update:modelValue', user)
  toggleModal()
}

// 方法：搜索用户
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 生命周期：组件挂载时加载用户列表
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-block;
  padding: 4px 12px;
  font-size: 42rpx !important;
  cursor: pointer;
  z-index: 1001; /* 确保按钮在最上层 */
}

.single-user-select {
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

.selected-user {
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

.user-list {
  flex: 1;
  background: #fff;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.user-name {
  font-size: 28rpx;
  color: #333;
}

.user-dept {
  font-size: 24rpx;
  color: #999;
}
</style>