<template>
    <view class="content"> 

        <form-create-uni ref="formCreateRef"  :submitBtn="false" :rule="formDetailPreview.rule" :option="formDetailPreview.option" v-model="formDetailPreview.value"></form-create-uni>

        <view class="button-container">
            <view class="button-wrapper">
                <button class="action-button submit-button" @click="handleSubmit">
                    <text class="button-icon">✓</text>
                    <text class="button-text">
                         {{ loading ? '提交中...' : '发起' }}
                    </text>
                </button>
                <button class="action-button cancel-button" @click="handleCancel">
                    <text class="button-icon">✕</text>
                    <text class="button-text">取消</text>
                </button>
            </view>
        </view>

		<approval-flow :flow-data="customFlowData" :show-time="true" style="margin-top: 20px;"></approval-flow>

        <!-- <u-button type="primary" text="获取表单数据" customStyle="margin-top: 50px" @click="getFormData"></u-button> -->

    <zero-loading v-if="loading"></zero-loading>
    </view>
</template>

<script setup>
    import {ref , onMounted , isRef} from "vue";
    import {
    onLoad,
    onReady,
  } from "@dcloudio/uni-app";
	import FormCreateUni from '@/components/form-create-uni/form-create-uni.vue'
	import ApprovalFlow from '@/components/approval-flow/approval-flow.vue'
	import { getProcessDefinition } from '@/api/definition/index.js'
import { createProcessInstance, getApprovalDetail ,getProcessInstance } from '@/api/processInstance/index.js'

const customFlowData = ref([])
const loading = ref(false)

  const formCreateRef = ref()
  const formDetailPreview = ref({
    rule: [],
    option: {},
    value:{}
  })

// 获取流程定义数据并更新表单
const loadProcessDefinition = async (id) => {
  try {
    const response = await getProcessDefinition(id)
    if (response && response.data) {
      const processData = response.data
      
      // 如果接口返回的数据包含表单配置
      if (processData.formConf) {
        formDetailPreview.value.option = JSON.parse(processData.formConf)
      }
      
      // 如果接口返回的数据包含表单字段
      if (processData.formFields) {
        formDetailPreview.value.rule = decodeFields(processData.formFields)
      }
      
      // 如果接口返回的数据包含表单值
      if (processData.formValues) {
        formDetailPreview.value.value = processData.formValues
      }
      
      // 更新表单显示
      if (formCreateRef.value) {
        formCreateRef.value.showForm(formDetailPreview.value.rule)
        if (processData.formValues) {
          formCreateRef.value.setFormValues(processData.formValues)
        }
      }
    }
  } catch (error) {
    console.error('获取流程定义失败:', error)
    uni.showToast({
      title: '获取流程定义失败',
      icon: 'error'
    })
  }
}


// 获取审批详情和流程数据
const getApprovalDetailData = async (processDefinitionId, activityId = 'StartUserNode') => {
  try {
    const params = {
      processDefinitionId: processDefinitionId,
      activityId: activityId
    }
    
    const response = await getApprovalDetail(params)
    
    if (response && response.code === 0 && response.data) {
      const { activityNodes } = response.data
      
      // 将 activityNodes 转换为 customFlowData 格式
      if (activityNodes && activityNodes.length > 0) {
        customFlowData.value = activityNodes.map((node, index) => {
          // 根据节点状态设置流程状态
          let status = 'pending'
          if (node.status === 1) {
            status = 'completed'
          } else if (node.status === 0) {
            status = 'current'
          }
          
          // 根据节点类型设置名称和头像
          let name = ''
          let avatar = ''
          
          // 判断节点类型
          if (node.nodeType === 10) {
            // 发起人节点
            name = '发起人'
          } else if (node.nodeType === 1) {
            // 结束节点
            name = '结束'
          } else if (node.candidateUsers && node.candidateUsers.length > 0) {
            // 审批节点，有候选用户
            name = node.candidateUsers.map(user => user.nickname).join(', ')
            // 如果有头像，使用第一个用户的头像
            if (node.candidateUsers[0].avatar) {
              avatar = node.candidateUsers[0].avatar
            }
          } else {
            // 其他情况显示待分配
            name = '待分配'
          }
          
          return {
            id: index + 1,
            title: node.name || '未知节点',
            name: name,
            avatar: avatar,
            status: status,
            time: node.startTime || ''
          }
        })
      }
      
      return response.data
    } else {
      console.error('获取审批详情失败:', response)
      uni.showToast({
        title: '获取审批详情失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('获取审批详情异常:', error)
    uni.showToast({
      title: '获取审批详情异常',
      icon: 'error'
    })
  }
}







    const handleSubmit = async () => {
        try {
            // 获取表单数据
            
            const formData = formCreateRef.value.getFormData()
            loading.value = true
            await new Promise(resolve => setTimeout(resolve, 2000))
            // 获取路由参数中的流程定义ID
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const options = currentPage.options
            const processDefinitionId = options.processDefinitionId
            
            if (!processDefinitionId) {
                uni.showToast({
                    title: '流程定义ID不能为空',
                    icon: 'error'
                })
                return
            }
            
            // 构造请求参数
            const requestData = {
                processDefinitionId: processDefinitionId,
                variables: formData,
                startUserSelectAssignees: {}
            }
            
            
            // 调用创建流程实例接口
            const response = await createProcessInstance(requestData)
            
            if (response && response.code === 0) {
                uni.showToast({
                    title: '流程发起成功',
                    icon: 'success'
                })
                
                // 延迟返回上一页
                setTimeout(() => {
                    uni.navigateBack()
                }, 1500)
            } else {
                uni.showToast({
                    title: response.msg || '流程发起失败',
                    icon: 'error'
                })
            }
        } catch (error) {
            console.error('发起流程失败:', error)
            loading.value = false
            uni.showToast({
                title: '发起流程失败',
                icon: 'error'
            })
        } finally {
          loading.value = false // 结束加载
        }
    }


    const handleCancel = () => {
        // 取消操作，返回上一页或清空表单
        uni.showModal({
            title: '确认取消',
            content: '确定要取消当前操作吗？',
            success: (res) => {
                if (res.confirm) {
                    uni.navigateBack()
                }
            }
        })
    }
// 解码表单 Fields
 const decodeFields = (fields) => {
  const rule = []
  fields.forEach((item) => {
    rule.push(JSON.parse(item))
  })
  return rule
}






onLoad(async (options) => {
  // 正常发起流程
     await loadProcessDefinition(options.processDefinitionId)
     await getApprovalDetailData(options.processDefinitionId)
})
</script>

<style scoped>
.content {
	padding: 12px;
	padding-bottom: 100px; /* 为底部按钮留出空间 */
  background: #ffffff; /* 改为完全不透明的白色背景 */
}

/* 底部按钮容器 */
.button-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff; /* 改为完全不透明的白色背景 */
    padding: 20rpx 32rpx 40rpx 32rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 999;
    /* 添加边框来增强分离效果 */
    border-top: 1rpx solid #f0f0f0;
}

.button-wrapper {
    display: flex;
    gap: 24rpx;
    justify-content: center;
}

/* 按钮基础样式 */
.action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 16rpx 32rpx;
    border-radius: 8rpx;
    border: 2rpx solid;
    font-size: 28rpx;
    font-weight: 500;
    min-width: 120rpx;
    transition: all 0.3s ease;
    cursor: pointer;
}

/* 发起按钮样式 */
.submit-button {
    background: #e8f5e8;
    border-color: #52c41a;
    color: #52c41a;
}

.submit-button:hover {
    background: #d9f7be;
    transform: translateY(-2rpx);
}

.submit-button:active {
    background: #b7eb8f;
    transform: translateY(0);
}

/* 取消按钮样式 */
.cancel-button {
    background: #fff2f0;
    border-color: #ff4d4f;
    color: #ff4d4f;
}

.cancel-button:hover {
    background: #ffece8;
    transform: translateY(-2rpx);
}

.cancel-button:active {
    background: #ffd8d2;
    transform: translateY(0);
}

/* 按钮图标样式 */
.button-icon {
    font-size: 24rpx;
    font-weight: bold;
}

/* 按钮文字样式 */
.button-text {
    font-size: 28rpx;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
    .button-wrapper {
        gap: 16rpx;
    }
    
    .action-button {
        padding: 14rpx 24rpx;
        font-size: 26rpx;
        min-width: 100rpx;
    }
}

</style>