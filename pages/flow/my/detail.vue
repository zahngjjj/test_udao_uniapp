<template>
    <view class="content"> 
        <form-create-uni ref="formCreateRef"  :submitBtn="false" :rule="formDetailPreview.rule" :option="formDetailPreview.option" v-model="formDetailPreview.value"></form-create-uni>
       
        <status :status="processStatus"></status>
        
        <buttongroup 
          :status="processStatus"
        ></buttongroup>

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
    import Status from '@/pages/flow/task/components/status.vue'
    import Buttongroup from '@/pages/flow/task/components/buttongroup.vue'

const customFlowData = ref([])


// 添加流程状态数据
const processStatus = ref(null)

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
         // 设置流程状态
      if (processInstance && processInstance.status) {
        processStatus.value = processInstance.status
      }
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


onLoad(async (options) => {
    await getApprovalDetailData(options.processInstanceId,options.taskId)
})
</script>

<style scoped>
.content {
	padding: 12px;
	padding-bottom: 150px; /* 为底部按钮留出空间 */
    background: #ffffff; /* 改为完全不透明的白色背景 */
}



</style>