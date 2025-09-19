import request from '@/utils/request'




export const getUserList  = async ( params) => {
  return await request({
    url: '/system/user/simple-list',
    method: 'GET',
    params
  })
}
