<template>
  <view class="setting-container" :style="{height: `${windowHeight}px`}">
    <view class="menu-list">
      <view class="list-cell list-cell-arrow" @click="handleToPwd">
        <view class="menu-item-box">
          <view class="iconfont icon-password menu-icon"></view>
          <view>修改密码</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleToUpgrade">
        <view class="menu-item-box">
          <view class="iconfont icon-refresh menu-icon"></view>
          <view>检查更新</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleCleanTmp">
        <view class="menu-item-box">
          <view class="iconfont icon-clean menu-icon"></view>
          <view>清理缓存</view>
        </view>
      </view>
    </view>
    <view class="cu-list menu">
      <view class="cu-item item-box">
        <view class="content text-center" @click="handleLogout">
          <text class="text-black">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref} from 'vue'
import { useUserStore} from "@/store/modules/user";

const userStore = useUserStore()

const windowHeight = ref(uni.getSystemInfoSync().windowHeight)


const handleToPwd = () => {
  uni.navigateTo({
    url: '/pages/mine/pwd/index'
  })
}

const handleToUpgrade = () => {
  uni.showToast({
    title: '当前已是最新版本',
    icon: 'none'
  })
}

const handleCleanTmp = () => {
  //延迟1秒
  setTimeout(() => {
    uni.showToast({
      title: '清理成功',
      icon: 'none'
    })
  }, 1000)
}


const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        userStore.LogOut().then(() => {
          uni.reLaunch({
            url: '/pages/login'
          })
        })
        }
      }
  })
}

</script>



<style lang="scss" scoped>
.page {
  background-color: #f8f8f8;
}

.item-box {
  background-color: #FFFFFF;
  margin: 30rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
  border-radius: 8rpx;
  color: #303133;
  font-size: 32rpx;
}
</style>
