<template>
  <view class="work-container">
    <!-- 轮播图 -->
    <uni-swiper-dot class="uni-swiper-dot-box" :info="data" :current="current" field="content">
      <swiper class="swiper-box" :current="swiperDotIndex" @change="changeSwiper">
        <swiper-item v-for="(item, index) in data" :key="index">
          <view class="swiper-item" @click="clickBannerItem(item)">
            <image :src="item.image" mode="aspectFill" :draggable="false" />
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <!-- 宫格组件 -->
    <uni-section title="审批中心" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false">
        <!-- <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(0)">
            <uni-icons type="person-filled" size="30"></uni-icons>
            <text class="text">用户管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(1)">
            <uni-icons type="staff-filled" size="30"></uni-icons>
            <text class="text">角色管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(2)">
            <uni-icons type="color" size="30"></uni-icons>
            <text class="text">菜单管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(3)">
            <uni-icons type="settings-filled" size="30"></uni-icons>
            <text class="text">部门管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(4)">
            <uni-icons type="heart-filled" size="30"></uni-icons>
            <text class="text">岗位管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(5)">
            <uni-icons type="bars" size="30"></uni-icons>
            <text class="text">字典管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(6)">
            <uni-icons type="gear-filled" size="30"></uni-icons>
            <text class="text">参数设置</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(7)">
            <uni-icons type="chat-filled" size="30"></uni-icons>
            <text class="text">通知公告</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(8)">
            <uni-icons type="wallet-filled" size="30"></uni-icons>
            <text class="text">日志管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(9)">
            <uni-icons type="compose" size="30"></uni-icons>
            <text class="text">表单测试</text>
          </view>
        </uni-grid-item> -->
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(10)">
            <uni-icons type="paperplane-filled" size="30"></uni-icons>
            <text class="text">发起流程</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(11)">
            <uni-icons type="person-filled" size="30"></uni-icons>
            <text class="text">我的流程</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(12)">
            <view class="icon-with-badge">
              <uni-icons type="calendar" size="30"></uni-icons>
              <uni-badge 
                v-if="todoCount > 0" 
                :text="todoCount > 99 ? '99+' : todoCount.toString()" 
                absolute 
                custom-style="font-size: 14px; min-width: 18px; height: 18px; line-height: 18px; font-weight: bold;"
              ></uni-badge>
            </view>
            <text class="text">待办任务</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(13)">
            <uni-icons type="checkmarkempty" size="30"></uni-icons>
            <text class="text">已办任务</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick(14)">
            <uni-icons type="email-filled"  size="30"></uni-icons>
            <text class="text">抄送我的</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>
  </view>
</template>



<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getTaskTodoPage } from '@/api/task/index.js'

const current = ref(0)
const swiperDotIndex = ref(0)
const todoCount = ref(0)
let timer = null

const data = ref([{
  image: '/static/images/banner/banner01.jpg'
},
  {
    image: '/static/images/banner/banner02.jpg'
  },
  {
    image: '/static/images/banner/banner03.jpg'
  }
])

// 获取待办任务数量
const fetchTodoCount = async () => {
  try {
    const response = await getTaskTodoPage({
      pageNo: 1,
      pageSize: 1 // 只需要获取总数，不需要具体数据
    })
    if (response && response.data) {
      todoCount.value = response.data.total || 0
    }
  } catch (error) {
    console.error('获取待办任务数量失败:', error)
  }
}

const clickBannerItem = (item) => {
  console.log(item)
}

const changeSwiper = (e) => {
  current.value = e.detail.current
}

const handleGridClick= (index) =>{

  
  if (index === 10) {
    uni.navigateTo({
      url: '/pages/flow/create/list'
    })
    return
  }
    
  if (index === 11) {
    uni.navigateTo({
      url: '/pages/flow/my/index'
    })
    return
  }
  if (index === 12) {
    uni.navigateTo({
      url: '/pages/flow/task/waitDone'
    })
    return
  }
  if (index === 13) {
    uni.navigateTo({
      url: '/pages/flow/task/done'
    })
    return
  }
  if (index === 14) {
    uni.navigateTo({
      url: '/pages/flow/task/copy'
    })
    return
  }
  uni.showToast({
    title: '模块建设中~',
    icon: 'none'
  })
}
// 启动定时器
const startTimer = () => {
  // 立即执行一次
  fetchTodoCount()
  
  // 每30秒执行一次
  timer = setInterval(() => {
    fetchTodoCount()
  }, 30000)
}
// 清除定时器
const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
// 页面生命周期
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearTimer()
})
// 页面显示时重新获取数据
uni.$on('onShow', () => {
  fetchTodoCount()
})

// 页面隐藏时清除定时器，避免后台运行
uni.$on('onHide', () => {
  clearTimer()
})

// 页面重新显示时启动定时器
uni.$on('onShow', () => {
  if (!timer) {
    startTimer()
  }
})
</script>

<style lang="scss" scoped>
/* #ifndef APP-NVUE */
page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 100%;
  height: auto;
}

view {
  font-size: 14px;
  line-height: inherit;
}
/* #endif */

.text {
  text-align: center;
  font-size: 26rpx;
  margin-top: 10rpx;
}

.grid-item-box {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
}

.icon-with-badge {
  position: relative;
  display: inline-block;
}

.uni-margin-wrap {
  width: 690rpx;
  width: 100%;
}

.swiper {
  height: 300rpx;
}

.swiper-box {
  height: 150px;
}

.swiper-item {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  height: 300rpx;
  line-height: 300rpx;
}

@media screen and (min-width: 500px) {
  .uni-swiper-dot-box {
    width: 400px;
    /* #ifndef APP-NVUE */
    margin: 0 auto;
    /* #endif */
    margin-top: 8px;
  }

  .image {
    width: 100%;
  }
}
</style>