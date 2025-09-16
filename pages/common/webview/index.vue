<template>
  <view v-if="params.url">
    <web-view :webview-styles="webviewStyles" :src="`${params.url}`"></web-view>
  </view>
</template>


<script setup>
import { ref, defineProps } from 'vue'
import { onLoad } from '@dcloudio/uni-h5'

const params = ref({})
const webviewStyles = ref({
  progress: {
    color: "#FF3333"
  }
})

//定义props
const props = defineProps({
  src: {
    type: string,
    default: null
  }
})

onLoad((event) => {
  params.value = event
  if (event.title){
    uni.setNavigationBarTitle({
      title: event.title
    })
  }
})
</script>


<style scoped lang="scss">

</style>