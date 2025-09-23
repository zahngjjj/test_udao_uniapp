<template>
  <view class="upload-image">
    <!-- 上传按钮 -->
    <view class="upload-btn" @click="chooseImage" v-if="!disabled && (!multiple && imageList.length === 0) || (multiple && imageList.length < maxCount)">
      <u-icon name="plus" size="40" color="#c0c4cc"></u-icon>
      <text class="upload-text">选择图片</text>
    </view>
    
    <!-- 图片预览列表 -->
    <view class="image-list" v-if="imageList.length > 0">
      <view 
        class="image-item" 
        v-for="(image, index) in imageList" 
        :key="index"
      >
        <image 
          :src="image.url" 
          class="preview-image" 
          mode="aspectFill"
          @click="previewImage(image.url)"
        />
        <view class="image-actions">
          <u-icon 
            name="close-circle-fill" 
            size="20" 
            color="#ff4757" 
            class="delete-icon"
            @click="removeImage(index)"
          ></u-icon>
        </view>
        <!-- 上传进度 -->
        <view class="upload-progress" v-if="image.uploading">
          <u-loading-icon mode="circle" size="20"></u-loading-icon>
          <text class="progress-text">上传中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import config from '@/config'
import { getAccessToken } from '@/utils/auth'

// 定义 props
const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxCount: {
    type: Number,
    default: 9
  },
  disabled: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

// 响应式数据
const imageList = ref([])
const { proxy } = getCurrentInstance()

// 获取完整的上传 URL
const getUploadUrl = () => {
  return config.baseUrl + config.baseApi + '/infra/file/upload'
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.multiple) {
      imageList.value = Array.isArray(newVal) ? newVal.map(url => ({ url, uploading: false })) : []
    } else {
      imageList.value = newVal ? [{ url: newVal, uploading: false }] : []
    }
  } else {
    imageList.value = []
  }
}, { immediate: true })

// 选择图片
const chooseImage = () => {
  const count = props.multiple ? (props.maxCount - imageList.value.length) : 1
  
  uni.chooseImage({
    count: count,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePaths = res.tempFilePaths
      
      // 检查文件大小
      for (let i = 0; i < tempFilePaths.length; i++) {
        const filePath = tempFilePaths[i]
        
        uni.getFileInfo({
          filePath: filePath,
          success: (fileInfo) => {
            if (fileInfo.size > props.maxSize) {
              uni.showToast({
                title: '图片大小不能超过5MB',
                icon: 'none'
              })
              return
            }
            
            // 添加到图片列表并开始上传
            const imageItem = {
              url: filePath,
              uploading: true
            }
            
            if (props.multiple) {
              imageList.value.push(imageItem)
            } else {
              imageList.value = [imageItem]
            }
            
            // 开始上传
            uploadImage(filePath, imageList.value.length - 1)
          }
        })
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

// 上传图片
// 上传图片
const uploadImage = async (filePath, index) => {
  try {
    // 构建请求头
    const header = {
      'tenant-id': 1
    }
    
    // 添加 Authorization
    const token = getAccessToken()
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
    
    // 使用 uni.uploadFile 进行文件上传
    uni.uploadFile({
      url: getUploadUrl(),
      filePath: filePath,
      name: 'file',
      header: header,
      success: (uploadRes) => {
        console.log('上传响应:', uploadRes)
        
        try {
          // 检查 HTTP 状态码
          if (uploadRes.statusCode !== 200) {
            throw new Error(`HTTP请求失败，状态码: ${uploadRes.statusCode}`)
          }
          
          // 解析响应数据
          const result = JSON.parse(uploadRes.data)
          console.log('解析后的数据:', result)
          
          // 检查业务状态码
          if (result.code === 0) {
            // 上传成功
            const imageUrl = result.data
            
            // 更新图片列表
            imageList.value[index].url = imageUrl
            imageList.value[index].uploading = false
            
            // 更新 modelValue
            updateModelValue()
            
            // 触发成功事件
            emit('upload-success', {
              url: imageUrl,
              originalName: filePath.split('/').pop()
            })
            
            uni.showToast({
              title: '上传成功',
              icon: 'success'
            })
          } else {
            // 业务逻辑失败
            throw new Error(result.msg || '上传失败')
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError)
          
          // 移除上传失败的图片
          imageList.value.splice(index, 1)
          
          // 触发错误事件
          emit('upload-error', parseError)
          
          uni.showToast({
            title: '解析响应失败',
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        console.error('上传请求失败:', error)
        
        // 移除上传失败的图片
        imageList.value.splice(index, 1)
        
        // 触发错误事件
        emit('upload-error', error)
        
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    })
  } catch (error) {
    console.error('上传图片异常:', error)
    
    // 移除上传失败的图片
    imageList.value.splice(index, 1)
    
    // 触发错误事件
    emit('upload-error', error)
    
    uni.showToast({
      title: '上传异常',
      icon: 'none'
    })
  }
}

// 删除图片
const removeImage = (index) => {
  imageList.value.splice(index, 1)
  updateModelValue()
}

// 预览图片
const previewImage = (url) => {
  const urls = imageList.value.map(item => item.url)
  uni.previewImage({
    current: url,
    urls: urls
  })
}

// 更新 modelValue
const updateModelValue = () => {
  const urls = imageList.value.filter(item => !item.uploading).map(item => item.url)
  
  if (props.multiple) {
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', urls[0] || '')
  }
}
</script>

<style scoped>
.upload-image {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #c0c4cc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-btn:hover {
  border-color: #409eff;
}

.upload-text {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 5px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}

.delete-icon {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-text {
  color: white;
  font-size: 12px;
  margin-top: 5px;
}
</style>