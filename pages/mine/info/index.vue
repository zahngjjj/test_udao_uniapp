<template>
  <view class="container">
    <uni-list>
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'person-filled'}" title="昵称" :rightText="user.nickname" />
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'phone-filled'}" title="手机号码" :rightText="user.mobile" />
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'email-filled'}" title="邮箱" :rightText="user.email" />
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'auth-filled'}" title="岗位" :rightText="(user.posts || []).map(post => post.name).join(',')" />
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'staff-filled'}" title="角色" :rightText="(user.roles || []).map(role => role.name).join(',')" />
      <uni-list-item showExtraIcon="true" :extraIcon="{type: 'calendar-filled'}" title="创建日期" :rightText="parseTime(user.createTime)" />
    </uni-list>
  </view>
</template>



<script setup>
import { ref } from 'vue'
import { getUserProfile } from "@/api/system/user"
import { parseTime } from "@/utils/ruoyi"
//导入uniapp的钩子函数
import { onLoad } from "@dcloudio/uni-app";

const user = ref({})


const getUserInfo = () => {
  getUserProfile().then(response => {
    user.value = response.data
  })
}


onLoad(() => {
  console.log("onLoad：加载用户信息");
  getUserInfo()
})
</script>


<style  lang="scss">

</style>