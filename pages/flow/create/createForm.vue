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
    onReady,
  } from "@dcloudio/uni-app";
	import FormCreateUni from '@/components/form-create-uni/form-create-uni.vue'
	import ApprovalFlow from '@/components/approval-flow/approval-flow.vue'
	import { getProcessDefinition } from '@/api/definition/index.js'
import { createProcessInstance, getApprovalDetail ,getProcessInstance } from '@/api/processInstance/index.js'

const customFlowData = ref([])


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



// 获取流程实例数据并更新表单（用于重新发起）
const loadProcessInstanceData = async (id) => {
  try {
    const response = await getProcessInstance(id)
    if (response && response.data) {
      const processInstanceData = response.data
      
      // 如果接口返回的数据包含表单变量

      if (processInstanceData.formVariables) {
        formDetailPreview.value.value = processInstanceData.formVariables
        
        // 更新表单显示
        if (formCreateRef.value) {
          formCreateRef.value.setFormValues(processInstanceData.formVariables)
        }
      }
    }
  } catch (error) {
    console.error('获取流程实例失败:', error)
    uni.showToast({
      title: '获取流程实例失败',
      icon: 'error'
    })
  }
}
// const optionJson2  =  "{\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"right\",\"size\":\"default\",\"labelWidth\":\"120px\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":true,\"innerText\":\"提交\"}}"
// const  dataJson2 = ["{\"type\":\"html\",\"title\":\"\",\"native\":true,\"attrs\":{\"innerHTML\":\"\"},\"style\":{\"display\":\"block\",\"width\":\"100%\"},\"children\":[\"<div style=\\\"width:100%;text-align:center\\\">\\n\\t\\t<h2>周报</h2>\\n  </div>\"],\"_fc_id\":\"id_Ffvamf3dnm2maxc\",\"name\":\"ref_Fss0mf3dnm2mayc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"html\"}","{\"type\":\"UserSelect\",\"field\":\"user\",\"title\":\"汇报人\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fkntmf4owpwib3c\",\"name\":\"ref_Fmnomf4owpwib4c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"UserSelect\"}","{\"type\":\"DeptSelect\",\"field\":\"21985ce7-dc15-4677-8522-4f7070aded37\",\"title\":\"部门选择器\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fq3tmf3ikv3fb2c\",\"name\":\"ref_F6b4mf3ikv3fb3c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"DeptSelect\"}","{\"type\":\"fcRow\",\"children\":[{\"type\":\"col\",\"props\":{\"span\":12},\"children\":[{\"type\":\"datePicker\",\"field\":\"F4bemf3ins6mbac\",\"title\":\"本周开始日期\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fx2qmf3ins6mbbc\",\"name\":\"ref_Fnsamf3ins6mbcc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}],\"_fc_id\":\"id_F38nmf3inlczb6c\",\"name\":\"ref_Fp5bmf3inlczb7c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"col\"},{\"type\":\"col\",\"props\":{\"span\":12},\"children\":[{\"type\":\"datePicker\",\"field\":\"Fizzmf3io73lbgc\",\"title\":\"本周结束日期\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fua4mf3io73lbhc\",\"name\":\"ref_Fj8hmf3io73lbic\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}],\"_fc_id\":\"id_Fmeqmf3inlczb8c\",\"name\":\"ref_Fnuumf3inlczb9c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"col\"}],\"_fc_id\":\"id_F376mf3inlczb4c\",\"name\":\"ref_Fkgzmf3inlczb5c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"fcRow\"}","{\"type\":\"input\",\"field\":\"Fmfvmf3dkhuualc\",\"title\":\"本周工作总结\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":6},\"_fc_id\":\"id_Fc7smf3dkhuuamc\",\"name\":\"ref_F2pjmf3dkhuuanc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"Ft8fmf3dloj1aoc\",\"title\":\"本周遇到的问题\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":4},\"_fc_id\":\"id_Fqm6mf3dloj1apc\",\"name\":\"ref_Fuxlmf3dloj1aqc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"F14xmf3dmoskarc\",\"title\":\"问题解决方案\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":4},\"_fc_id\":\"id_F2brmf3dmoskasc\",\"name\":\"ref_Fxy8mf3dmoskatc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"F5hcmf3dmxemauc\",\"title\":\"下周工作计划\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\"},\"_fc_id\":\"id_F9w8mf3dmxemavc\",\"name\":\"ref_F0eymf3dmxemawc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}"]
// const valueJson = {"PROCESS_START_USER_ID":1,"_FLOWABLE_SKIP_EXPRESSION_ENABLED":true,"21985ce7-dc15-4677-8522-4f7070aded37":103,"Fmfvmf3dkhuualc":"1. yudao 系统部署：成功将 yudao 系统的前端和后端部署到服务器上。通过仔细配置服务器参数、安装必要的运行环境和依赖组件，确保前后端程序能够正常运行且相互通信，实现了系统在服务器上的初步上线。\n2. 服务器环境调整：针对 yudao 系统运行需求，对服务器环境进行了优化调整。合理分配服务器资源，如 CPU、内存等，提升系统整体性能；同时检查并修复了部分网络配置问题，保障数据传输的稳定性和安全性，为系统稳定运行创造良好环境。","Ft8fmf3dloj1aoc":"1. 业务逻辑理解不到位：yudao 系统涉及的业务场景较为复杂，不同业务流程之间存在较多关联和嵌套，导致对部分业务逻辑理解出现偏差\n2. JDK 版本切换异常：在部署前进行 JDK 版本切换时，遇到命令执行后版本未成功切换的情况，系统仍识别旧版本 JDK，导致后续部署工作无法基于目标 JDK 版本顺利开展。\n3.  兼容性问题：部分依赖库与新切换的 JDK 版本存在兼容性问题，表现为部署过程中部分功能报错，无法正常运行，如某些 Java 类库在新 JDK 环境下无法正确加载。\n4. 其他bug修复","F14xmf3dmoskarc":"1. 深入理解业务逻辑：主动与项目主管沟通,实际业务场景进行分析。对存在疑问的环节反复确认，确保准确理解业务逻辑，为正确配置系统提供保障。\n2. 解决 JDK 版本切换问题：重新安装并检查 JDK 安装路径及环境变量配置，发现环境变量中 JDK 路径指向旧版本。修正环境变量中 JDK 路径，确保其准确指向新版本 JDK 安装目录。同时，检查系统 PATH 变量设置，保证新版本 JDK 的 bin 目录在搜索路径中优先级正确。执行相关命令验证，成功实现 JDK 版本切换。\n3.  处理兼容性问题：查阅相关依赖库文档，确定与新 JDK 版本兼容的依赖库版本。对存在兼容性问题的依赖库进行版本升级或降级处理，在本地测试环境进行多次测试，确保依赖库与新 JDK 版本能够协同工作，成功解决部署过程中的功能报错问题。","F5hcmf3dmxemauc":"开发 CDC 数据捕获模块","F4bemf3ins6mbac":"2025-09-08","Fizzmf3io73lbgc":"2025-09-12","user":3442}


    const handleSubmit = async () => {
        try {
            // 获取表单数据
            const formData = formCreateRef.value.getFormData()
            
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
// 解码表单 Fields
 const decodeFields = (fields) => {
  const rule = []
  fields.forEach((item) => {
    rule.push(JSON.parse(item))
  })
  return rule
}






onLoad(async (options) => {
    if (options.reset === 'true' && options.id) {
        // 重新发起流程，先加载流程定义，再加载原流程实例数据
        await loadProcessDefinition(options.processDefinitionId)
        await loadProcessInstanceData(options.id)
        await getApprovalDetailData(options.processDefinitionId)
    } else {
        // 正常发起流程
        await loadProcessDefinition(options.processDefinitionId)
        await getApprovalDetailData(options.processDefinitionId)
    }
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