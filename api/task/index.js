import request from '@/utils/request'

/**
 * 任务状态枚举
 */
export const TaskStatusEnum = {
  /**
   * 未开始
   */
  NOT_START: -1,

  /**
   * 待审批
   */
  WAIT: 0,
  /**
   * 审批中
   */
  RUNNING: 1,
  /**
   * 审批通过
   */
  APPROVE: 2,

  /**
   * 审批不通过
   */
  REJECT: 3,

  /**
   * 已取消
   */
  CANCEL: 4,
  /**
   * 已退回
   */
  RETURN: 5,
  /**
   * 审批通过中
   */
  APPROVING: 7
}

export function getTaskTodoPage(params) {
  return request({
    url: '/bpm/task/todo-page',
    method: 'GET',
    params: params
  })
}

export function getTaskDonePage(params) {
  return request({
    url: '/bpm/task/done-page',
    method: 'GET',
    params: params
  })
}

export function getTaskManagerPage(params) {
  return request({
    url: '/bpm/task/manager-page',
    method: 'GET',
    params: params
  })
}

export function approveTask(data) {
  return request({
    url: '/bpm/task/approve',
    method: 'PUT',
    data: data
  })
}

export function rejectTask(data) {
  return request({
    url: '/bpm/task/reject',
    method: 'PUT',
    data: data
  })
}

export function getTaskListByProcessInstanceId(processInstanceId) {
  return request({
    url: '/bpm/task/list-by-process-instance-id?processInstanceId=' + processInstanceId,
    method: 'GET'
  })
}

// 获取所有可退回的节点
export function getTaskListByReturn(id) {
  return request({
    url: '/bpm/task/list-by-return',
    method: 'GET',
    params: { id }
  })
}

// 退回
export function returnTask(data) {
  return request({
    url: '/bpm/task/return',
    method: 'PUT',
    data: data
  })
}

// 委派
export function delegateTask(data) {
  return request({
    url: '/bpm/task/delegate',
    method: 'PUT',
    data: data
  })
}

// 转派
export function transferTask(data) {
  return request({
    url: '/bpm/task/transfer',
    method: 'PUT',
    data: data
  })
}

// 加签
export function signCreateTask(data) {
  return request({
    url: '/bpm/task/create-sign',
    method: 'PUT',
    data: data
  })
}

// 减签
export function signDeleteTask(data) {
  return request({
    url: '/bpm/task/delete-sign',
    method: 'DELETE',
    data: data
  })
}

// 抄送
export function copyTask(data) {
  return request({
    url: '/bpm/task/copy',
    method: 'PUT',
    data: data
  })
}

// 获取我的待办任务
export function myTodoTask(processInstanceId) {
  return request({
    url: '/bpm/task/my-todo?processInstanceId=' + processInstanceId,
    method: 'GET'
  })
}

// 获取减签任务列表
export function getChildrenTaskList(id) {
  return request({
    url: '/bpm/task/list-by-parent-task-id?parentTaskId=' + id,
    method: 'GET'
  })
}