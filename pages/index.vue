<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">Hello 芋道</text>
    </view>
    
    <view class="demo-section">
      <text class="demo-title">演示功能</text>
      <button class="demo-btn" @click="goToFormDemo">Form-Create 表单生成器演示</button>
    </view>
  </view>
</template>

<script>
  export default {
    onLoad: function() {
    },
    methods: {
      goToFormDemo() {
        uni.navigateTo({
          url: '/pages/form-demo/index'
        })
      }
    }
  }
</script>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
  }

  .text-area {
    display: flex;
    justify-content: center;
  }

  .title {
    font-size: 36rpx;
    color: #8f8f94;
  }
  
  .demo-section {
    margin-top: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0 40rpx;
  }
  
  .demo-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 30rpx;
    font-weight: bold;
  }
  
  .demo-btn {
    background-color: #007aff;
    color: #fff;
    border: none;
    border-radius: 10rpx;
    padding: 25rpx 40rpx;
    font-size: 28rpx;
    width: 100%;
    max-width: 500rpx;
  }
  
  .demo-btn:active {
    background-color: #0056cc;
  }
</style>
