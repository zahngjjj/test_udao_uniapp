import request from '@/utils/request'

export const getProcessInstanceMyPage = async (params) => {
  return await request({
    url: '/bpm/process-instance/my-page',
    method: 'GET',
    params
  })
}

export const getProcessInstanceManagerPage = async (params) => {
  return await request({
    url: '/bpm/process-instance/manager-page',
    method: 'GET',
    params
  })
}

export const createProcessInstance = async (data) => {
  return await request({
    url: '/bpm/process-instance/create',
    method: 'POST',
    data: data
  })
}

export const cancelProcessInstanceByStartUser = async (id, reason) => {
  const data = {
    id: id,
    reason: reason
  }
  return await request({
    url: '/bpm/process-instance/cancel-by-start-user',
    method: 'DELETE',
    data: data
  })
}

export const cancelProcessInstanceByAdmin = async (id, reason) => {
  const data = {
    id: id,
    reason: reason
  }
  return await request({
    url: '/bpm/process-instance/cancel-by-admin',
    method: 'DELETE',
    data: data
  })
}

export const getProcessInstance = async (id) => {
  return await request({
    url: '/bpm/process-instance/get',
    method: 'GET',
    params: { id }
  })
}

export const getProcessInstanceCopyPage = async (params) => {
  return await request({
    url: '/bpm/process-instance/copy/page',
    method: 'GET',
    params
  })
}

// 获取审批详情
export const getApprovalDetail = async (params) => {
  return await request({
    url: '/bpm/process-instance/get-approval-detail',
    method: 'GET',
    params
  })
}

// 获取下一个执行的流程节点
export const getNextApprovalNodes = async (params) => {
  return await request({
    url: '/bpm/process-instance/get-next-approval-nodes',
    method: 'GET',
    params
  })
}

// 获取表单字段权限
export const getFormFieldsPermission = async (params) => {
  return await request({
    url: '/bpm/process-instance/get-form-fields-permission',
    method: 'GET',
    params
  })
}

// 获取流程实例的 BPMN 模型视图
export const getProcessInstanceBpmnModelView = async (id) => {
  return await request({
    url: '/bpm/process-instance/get-bpmn-model-view',
    method: 'GET',
    params: { id }
  })
}