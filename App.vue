<script setup>

  import {
    onLoad,
    onShow,
    onLaunch,
      onHide,
  } from "@dcloudio/uni-app";
  import { getAccessToken } from '@/utils/auth'

  const initConfig = () => {
    //初始化应用配置
    console.log("initConfig");
  };


  const checkLogin = () => {
    //检查是否登录
    if(!getAccessToken()){
      //跳转到登录页面
      console.log("未登录，跳转到登录页面");

      uni.navigateTo({
        url: '/pages/login'
      });
    }
  };

  const initApp = () => {
    //初始化应用配置
    initConfig();
    //检查是否登录
    checkLogin();
  };







  //uni-app的钩子函数测试
  onLoad(() => {
    console.log("onLoad");
  });

  onShow(() => {
    console.log("onShow");
  });

  onLaunch(() => {
    console.log("onLaunch");
    //挂载页面时执行
    initApp();
  });

  onHide(() => {
    console.log("onHide");
  });
</script>

<style lang="scss">
@import '@/static/scss/index.scss'
</style>
