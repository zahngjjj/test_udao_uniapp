import request from '@/utils/request'



// 用户列表
export const getUserList  = async ( params) => {
  return await request({
    url: '/system/user/simple-list',
    method: 'GET',
    params
  })
}
/// 部门列表
export const getDeptList  = async ( params) => {
  return await request({
    url: '/system/dept/simple-list',
    method: 'GET',
    params
  })
}