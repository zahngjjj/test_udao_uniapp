<template>
    <view class="content"> 

        <form-create-uni ref="formCreateRef"  :submitBtn="false" :rule="formDetailPreview.rule" :option="formDetailPreview.option" v-model="formDetailPreview.value"></form-create-uni>

        <view class="button-container">
            <view class="button-wrapper">
                <button class="action-button submit-button" @click="handleSubmit">
                    <text class="button-icon">✓</text>
                    <text class="button-text">发起</text>
                </button>
                <button class="action-button cancel-button" @click="handleCancel">
                    <text class="button-icon">✕</text>
                    <text class="button-text">取消</text>
                </button>
            </view>
        </view>

		<approval-flow :flow-data="customFlowData" :show-time="true" style="margin-top: 20px;"></approval-flow>

        <!-- <u-button type="primary" text="获取表单数据" customStyle="margin-top: 50px" @click="getFormData"></u-button> -->


    </view>
</template>

<script setup>
    import {ref , onMounted , isRef} from "vue";
    import {
    onLoad,
  } from "@dcloudio/uni-app";
	import FormCreateUni from '@/components/form-create-uni/form-create-uni.vue'
	import ApprovalFlow from '@/components/approval-flow/approval-flow.vue'
    import { createProcessInstance, getApprovalDetail  } from '@/api/processInstance/index.js'


const customFlowData = ref([])


const formCreateRef = ref()
const formDetailPreview = ref({
    rule: [],
    option: {},
    value:{}
})

// 获取审批详情和流程数据
const getApprovalDetailData = async (processInstanceId, taskId) => {
  try {
    const params = {
      processInstanceId: processInstanceId,
      taskId:  taskId
    }
    
    const response = await getApprovalDetail(params)
    
    if (response && response.code === 0 && response.data) {
      const { activityNodes,processDefinition,processInstance } = response.data
      
      // 将 activityNodes 转换为 customFlowData 格式
     showFlower(activityNodes)

     showForm(processDefinition,processInstance)
      
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

const showFlower = (activityNodes) =>{
     if (activityNodes && activityNodes.length > 0) {
        customFlowData.value = activityNodes.map((node, index) => {
          // 根据节点状态设置流程状态
          let status = 'pending'
          if (node.status === 2) {
            status = 'completed'
          } else if (node.status === 1) {
            status = 'current'
          } else if (node.status === -1) {
            status = 'pending'
          }
          
          // 根据节点类型设置名称和头像
          let name = ''
          let avatar = ''
          
          // 判断节点类型
          if (node.nodeType === 10) {
            // 发起人节点 - 从node.tasks中获取assigneeUser信息
            name = '发起人'
            
            if (node.tasks && node.tasks.length > 0 && node.tasks[0].assigneeUser) {
              name = node.tasks[0].assigneeUser.nickname || '发起人'
              avatar = node.tasks[0].assigneeUser.avatar || ''
            }
          } else if (node.nodeType === 1) {
            // 结束节点
            name = '结束'
          } else if (node.nodeType === 11) {
            // 审批节点 - 从node.tasks中获取assigneeUser信息
            if (node.tasks && node.tasks.length > 0 && node.tasks[0].assigneeUser) {
              name = node.tasks[0].assigneeUser.nickname
              avatar = node.tasks[0].assigneeUser.avatar || ''
            } else if (node.candidateUsers && node.candidateUsers.length > 0) {
              // 如果没有assigneeUser，使用candidateUsers
              name = node.candidateUsers.map(user => user.nickname).join(', ')
              if (node.candidateUsers[0].avatar) {
                avatar = node.candidateUsers[0].avatar
              }
            } else {
              name = '待分配'
            }
          } else {
            // 其他节点类型
            if (node.tasks && node.tasks.length > 0 && node.tasks[0].assigneeUser) {
              name = node.tasks[0].assigneeUser.nickname
              avatar = node.tasks[0].assigneeUser.avatar || ''
            } else if (node.candidateUsers && node.candidateUsers.length > 0) {
              name = node.candidateUsers.map(user => user.nickname).join(', ')
              if (node.candidateUsers[0].avatar) {
                avatar = node.candidateUsers[0].avatar
              }
            } else {
              name = '待分配'
            }
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
}

const showForm = (processDefinition,processInstance) => {
          // 处理表单配置数据
      if (processDefinition) {
        // 处理表单配置 formConf
        if (processDefinition.formConf) {
          try {
            formDetailPreview.value.option = JSON.parse(processDefinition.formConf)
          } catch (error) {
            console.error('解析formConf失败:', error)
            // 设置默认配置
            formDetailPreview.value.option = {
              form: {
                inline: false,
                hideRequiredAsterisk: false,
                labelPosition: "right",
                size: "default",
                labelWidth: "120px"
              },
              resetBtn: {
                show: false,
                innerText: "重置"
              },
              submitBtn: {
                show: true,
                innerText: "提交"
              }
            }
          }
        }
        
        // 处理表单字段 formFields
        if (processDefinition.formFields) {
          try {
            // formFields 是字符串数组，需要解析每个字段
            const parsedFields = processDefinition.formFields.map(fieldStr => {
              try {
                return JSON.parse(fieldStr)
              } catch (error) {
                console.error('解析表单字段失败:', fieldStr, error)
                return null
              }
            }).filter(field => field !== null)
            
            formDetailPreview.value.rule = parsedFields
          } catch (error) {
            console.error('处理formFields失败:', error)
            formDetailPreview.value.rule = []
          }
        }
      }

   // 处理表单值数据 formVariables
      if (processInstance && processInstance.formVariables) {
        formDetailPreview.value.value = processInstance.formVariables
      }
      
      // 更新表单显示
      if (formCreateRef.value) {
        // 先设置表单规则
        if (formDetailPreview.value.rule && formDetailPreview.value.rule.length > 0) {
          formCreateRef.value.showForm(formDetailPreview.value.rule)
        }
        
        // 再设置表单值
        if (processInstance && processInstance.formVariables) {
          formCreateRef.value.setFormValues(processInstance.formVariables)
        }
      }
}


    const handleSubmit = async () => {
        try {
            // 获取表单数据
            const formData = formCreateRef.value.getFormData()
            
            // 获取路由参数中的流程定义ID
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const options = currentPage.options
            const processDefinitionId = options.id
            
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
            uni.showToast({
                title: '发起流程失败',
                icon: 'error'
            })
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







onLoad(async (options) => {
    await getApprovalDetailData(options.processInstanceId,options.taskId)
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