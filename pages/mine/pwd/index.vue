<template>
  <view class="pwd-retrieve-container">
    <uni-forms ref="formRef" :value="user" labelWidth="80px">
      <uni-forms-item name="oldPassword" label="旧密码" required>
        <uni-easyinput type="password" v-model="user.oldPassword" placeholder="请输入旧密码" />
      </uni-forms-item>
      <uni-forms-item name="newPassword" label="新密码" required>
        <uni-easyinput type="password" v-model="user.newPassword" placeholder="请输入新密码"  />
      </uni-forms-item>
      <uni-forms-item name="confirmPassword" label="确认密码" required>
        <uni-easyinput type="password" v-model="user.confirmPassword" placeholder="请确认新密码" />
      </uni-forms-item>
      <button type="primary" @click="submit">提交</button>
    </uni-forms>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  onLoad,
  onReady,
} from "@dcloudio/uni-app";
import { updateUserPwd } from "@/api/system/user"

const user = ref({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const rules = ref({
  oldPassword: {
    rules: [{
      required: true,
      errorMessage: '旧密码不能为空'
    }]
  },
  newPassword: {
    rules: [{
      required: true,
      errorMessage: '新密码不能为空',
    },
      {
        minLength: 6,
        maxLength: 20,
        errorMessage: '长度在 6 到 20 个字符'
      }
    ]
  },
  confirmPassword: {
    rules: [{
      required: true,
      errorMessage: '确认密码不能为空'
    }, {
      validateFunction: (rule, value, data) => data.newPassword === value,
      errorMessage: '两次输入的密码不一致'
    }
    ]
  }
})
//formRef
const formRef = ref()
//设置规则
onReady(() => {
  formRef.value.setRules(rules.value)
})

//提交修改
const submit = () => {
  formRef.value.validate().then(() => {
    updateUserPwd(user.value.oldPassword,user.value.newPassword).then(() => {
      uni.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      })
    })
  })
}

</script>

<style lang="scss">
page {
  background-color: #ffffff;
}

.pwd-retrieve-container {
  padding-top: 36rpx;
  padding: 15px;
}
</style>
