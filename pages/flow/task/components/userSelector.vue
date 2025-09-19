<template>
  <view class="user-selector">
    <!-- 搜索框 -->
    <view class="search-box">
      <input 
        v-model="searchKeyword" 
        placeholder="搜索用户" 
        class="search-input"
        @input="handleSearch"
      />
    </view>
    
    <!-- 已选用户（多选模式） -->
    <view v-if="multiple && selectedUsers.length > 0" class="selected-users">
      <text class="selected-title">已选择 ({{ selectedUsers.length }})：</text>
      <view class="selected-tags">
        <view 
          v-for="user in selectedUsers" 
          :key="user.id" 
          class="selected-tag"
        >
          <text class="tag-name">{{ user.nickname }}</text>
          <text class="tag-remove" @click="removeUser(user)">×</text>
        </view>
      </view>
    </view>
    
    <!-- 用户列表 -->
    <scroll-view class="user-list" scroll-y>
      <view 
        v-for="user in filteredUsers" 
        :key="user.id" 
        class="user-item"
        :class="{ 'selected': isUserSelected(user) }"
        @click="handleUserSelect(user)"
      >
        <view class="user-info">
          <text class="user-name">{{ user.nickname }}</text>
          <text class="user-dept">{{ user.deptName || '暂无部门' }}</text>
        </view>
        <view class="user-check">
          <text v-if="multiple" class="checkbox" :class="{ 'checked': isUserSelected(user) }">✓</text>
          <text v-else class="radio" :class="{ 'checked': isUserSelected(user) }">●</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部按钮 -->
    <view class="footer-buttons">
      <button class="cancel-btn" @click="handleCancel">取消</button>
      <button 
        class="confirm-btn" 
        :disabled="selectedUsers.length === 0"
        @click="handleConfirm"
      >
        确定{{ multiple && selectedUsers.length > 0 ? `(${selectedUsers.length})` : '' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserList } from '@/api/system/user'

// Props
const props = defineProps({
  // 是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 已选用户（用于回显）
  modelValue: {
    type: [Array, Object],
    default: () => props.multiple ? [] : null
  },
  // 是否显示
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// 响应式数据
const userList = ref([])
const searchKeyword = ref('')
const selectedUsers = ref(props.multiple ? (props.modelValue || []) : (props.modelValue ? [props.modelValue] : []))

// 计算属性
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return userList.value
  return userList.value.filter(user => 
    user.nickname.includes(searchKeyword.value) ||
    (user.deptName && user.deptName.includes(searchKeyword.value))
  )
})

// 方法
const loadUsers = async () => {
  try {
    const response = await getUserList({
      pageNo: 1,
      pageSize: 1000,
      status: 0 // 只获取正常状态的用户
    })
    userList.value = response.data.list || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    uni.showToast({
      title: '加载用户失败',
      icon: 'error'
    })
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const isUserSelected = (user) => {
  return selectedUsers.value.some(selected => selected.id === user.id)
}

const handleUserSelect = (user) => {
  if (props.multiple) {
    // 多选模式
    if (isUserSelected(user)) {
      removeUser(user)
    } else {
      selectedUsers.value.push(user)
    }
  } else {
    // 单选模式
    selectedUsers.value = [user]
  }
}

const removeUser = (user) => {
  const index = selectedUsers.value.findIndex(selected => selected.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  }
}

const handleConfirm = () => {
  const result = props.multiple ? selectedUsers.value : (selectedUsers.value[0] || null)
  emit('update:modelValue', result)
  emit('confirm', result)
}

const handleCancel = () => {
  // 重置选择
  selectedUsers.value = props.multiple ? (props.modelValue || []) : (props.modelValue ? [props.modelValue] : [])
  emit('cancel')
}

// 生命周期
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.search-box {
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.selected-users {
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.selected-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  background: #007aff;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.tag-name {
  margin-right: 8rpx;
}

.tag-remove {
  font-size: 32rpx;
  font-weight: bold;
  cursor: pointer;
}

.user-list {
  flex: 1;
  padding: 0 20rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-item.selected {
  background: #f0f8ff;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-dept {
  font-size: 24rpx;
  color: #999;
}

.user-check {
  width: 40rpx;
  text-align: center;
}

.checkbox, .radio {
  font-size: 32rpx;
  color: #ddd;
}

.checkbox.checked, .radio.checked {
  color: #007aff;
}

.footer-buttons {
  display: flex;
  padding: 20rpx;
  border-top: 1px solid #eee;
  gap: 20rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 30rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #007aff;
  color: white;
}

.confirm-btn:disabled {
  background: #ccc;
  color: #999;
}
</style>