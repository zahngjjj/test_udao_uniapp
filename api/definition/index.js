import request from '@/utils/request'


export const getProcessDefinition = async (id, key) => {
  return await request({
    url: '/bpm/process-definition/get',
    method: 'GET',
    params: { id, key }
  })
}

export const getProcessDefinitionPage = async (params) => {
  return await request({
    url: '/bpm/process-definition/page',
    method: 'GET',
    params
  })
}

export const getProcessDefinitionList = async (params) => {
  return await request({
    url: '/bpm/process-definition/list',
    method: 'GET',
    params
  })
}

export const getSimpleProcessDefinitionList = async () => {
  return await request({
    url: '/bpm/process-definition/simple-list',
    method: 'GET'
  })
}
