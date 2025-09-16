<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image style="width: 100rpx;height: 100rpx;" :src="appLogo" mode="widthFix">
      </image>
      <text class="title">芋道移动端登录</text>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30"/>
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20"/>
      </view>
      <Verify @success="pwdLogin" :mode="'pop'" :captchaType="'blockPuzzle'"
              :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
      <view class="action-btn">
        <button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
      </view>
    </view>

    <view class="xieyi text-center">
      <text class="text-grey1">登录即代表同意</text>
      <text @click="handleUserAgrement" class="text-blue">《用户协议》</text>
      <text @click="handlePrivacy" class="text-blue">《隐私协议》</text>
    </view>
  </view>
</template>


<script setup>
import {ref, onMounted} from 'vue'
import {useUserStore} from '@/store/modules/user.js'
import config from '@/config'
import {showConfirm, toast} from "@/utils/common";
import {showLoading, closeLoading} from "../utils/common";
import Verify from "@/components/verifition/Verify"

const appLogo = config.appInfo.logo

const captchaEnabled = ref(true) //todo 以后要开启，放到参数里面去

const loginForm = ref({
  username: '',
  password: '',
  captchaVerification: ''
})


// 点击隐私协议，跳到隐私协议的页面去
const handlePrivacy = () => {
  uni.navigateTo({
    url: '/pages/privacy/index'
  })
}

//点击用户协议
const handleUserAgrement = () => {
  uni.navigateTo({
    url: '/pages/userAgreement/index'
  })
}


const verify = ref(null)
// 登录
const handleLogin = async () => {
  if (loginForm.value.username === "") {
    //弹窗提示：请输入账号
    toast('请输入账号')
  } else if (loginForm.value.password === "") {
    //弹窗提示：请输入密码
    toast('请输入密码')
  } else {
    if (captchaEnabled.value) {
      //显示验证码
      verify.value.show()
    } else {
      //直接登录
      await pwdLogin({})
    }
  }
}

const userStore = useUserStore()

const pwdLogin = async (captchaParams) => {
  //弹窗显示：登录中，请耐心等待
  showLoading('登录中，请耐心等待')

  // 处理登录验证码的问题
  userStore.Login(loginForm.value).then(res => {
    //获取用户信息，跳到首页
    loginSuccess()
  }).catch(err => {
    console.log(err)
  }).finally(() => {
    //关闭弹窗
    closeLoading()
  })

}

const loginSuccess = () => {
  userStore.GetInfo().then(res => {
    //跳到首页
    uni.reLaunch({
      url: '/pages/index'
    })
  })
}


onMounted(() => {
  console.log('onMounted')
})
</script>


<style lang="scss">
page {
  background-color: #ffffff;
}

.normal-login-container {
  width: 100%;

  .logo-content {
    width: 100%;
    font-size: 21px;
    text-align: center;
    padding-top: 15%;

    image {
      border-radius: 4px;
    }

    .title {
      margin-left: 10px;
    }
  }

  .login-form-content {
    text-align: center;
    margin: 20px auto;
    margin-top: 15%;
    width: 80%;

    .input-item {
      margin: 20px auto;
      background-color: #f5f6f7;
      height: 45px;
      border-radius: 20px;

      .icon {
        font-size: 38 rpx;
        margin-left: 10px;
        color: #999;
      }

      .input {
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        padding-left: 15px;
      }

    }

    .login-btn {
      margin-top: 40px;
      height: 45px;
    }

    .xieyi {
      color: #333;
      margin-top: 20px;
    }
  }

  .easyinput {
    width: 100%;
  }
}

.login-code-img {
  height: 45px;
}
</style>