<template>
    <view class="content"> 

        <form-create-uni ref="formCreateRef" :rule="formDetailPreview.rule" :option="formDetailPreview.option" v-model="formDetailPreview.value" @submit="submit"></form-create-uni>

        <u-button type="primary" text="获取表单数据" customStyle="margin-top: 50px" @click="getFormData"></u-button>

        <br><br><br>

    </view>
</template>

<script setup>
    import {ref , onMounted , isRef} from "vue";
	import FormCreateUni from '@/components/form-create-uni/form-create-uni.vue'



    const formCreateRef = ref()

    const option = ref({}) // 表单整体属性值，通过组件属性注入

    const submit=(formData)=>{ // 点击组件内置提交按钮后的事件

        console.log(JSON.stringify(formData)); // [{"type":"input","field":"Ffyi631rgf2hn","title":"输入框","info":"","$required":true,"_fc_drag_tag":"input","hidden":false,"display":true,"values":"111"},{"type":"inputNumber","field":"F78g6323ffje1","title":"计数器","info":"","$required":false,"_fc_drag_tag":"inputNumber","hidden":false,"display":true},{"type":"radio","field":"Fo0p6323ffxyk","title":"单选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"radio","hidden":false,"display":true,"values":1},{"type":"checkbox","field":"Fjfh6323fgc5h","title":"多选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"checkbox","hidden":false,"display":true,"values":[1,2]},{"type":"select","field":"Fork1oukyaqp1g","title":"选择器","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"select","hidden":false,"display":true},{"type":"switch","field":"Fsuh1oukyatz0r","title":"开关","info":"","$required":false,"_fc_drag_tag":"switch","hidden":false,"display":true},{"type":"timePicker","field":"Fnnm1oukyaz4tq","title":"时间选择器","info":"","$required":false,"_fc_drag_tag":"timePicker","hidden":false,"display":true},{"type":"datePicker","field":"Fud81oukyb2p59","title":"日期选择器","info":"","$required":false,"_fc_drag_tag":"datePicker","hidden":false,"display":true},{"type":"rate","field":"Fnjf1oukyb7tps","title":"评分","info":"","$required":false,"_fc_drag_tag":"rate","hidden":false,"display":true,"value":0,"values":2},{"type":"colorPicker","field":"F5zc1oukybcmk3","title":"颜色选择器","info":"","$required":false,"_fc_drag_tag":"colorPicker","hidden":false,"display":true},{"type":"upload","field":"Futt1oukybhfh6","title":"上传","info":"","$required":false,"props":{"action":""},"_fc_drag_tag":"upload","hidden":false,"display":true}]

    }

    const getFormData=()=>{ // 在不点击内置的提交按钮的情况下，获取表单内输入的数据值，表单校验将不起作用

        const formData = formCreateRef.value.getFormData()

        console.log(JSON.stringify(formData)); // [{"type":"input","field":"Ffyi631rgf2hn","title":"输入框","info":"","$required":true,"_fc_drag_tag":"input","hidden":false,"display":true,"values":"111"},{"type":"inputNumber","field":"F78g6323ffje1","title":"计数器","info":"","$required":false,"_fc_drag_tag":"inputNumber","hidden":false,"display":true},{"type":"radio","field":"Fo0p6323ffxyk","title":"单选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"radio","hidden":false,"display":true,"values":1},{"type":"checkbox","field":"Fjfh6323fgc5h","title":"多选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"checkbox","hidden":false,"display":true,"values":[1,2]},{"type":"select","field":"Fork1oukyaqp1g","title":"选择器","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"select","hidden":false,"display":true},{"type":"switch","field":"Fsuh1oukyatz0r","title":"开关","info":"","$required":false,"_fc_drag_tag":"switch","hidden":false,"display":true},{"type":"timePicker","field":"Fnnm1oukyaz4tq","title":"时间选择器","info":"","$required":false,"_fc_drag_tag":"timePicker","hidden":false,"display":true},{"type":"datePicker","field":"Fud81oukyb2p59","title":"日期选择器","info":"","$required":false,"_fc_drag_tag":"datePicker","hidden":false,"display":true},{"type":"rate","field":"Fnjf1oukyb7tps","title":"评分","info":"","$required":false,"_fc_drag_tag":"rate","hidden":false,"display":true,"value":0,"values":2},{"type":"colorPicker","field":"F5zc1oukybcmk3","title":"颜色选择器","info":"","$required":false,"_fc_drag_tag":"colorPicker","hidden":false,"display":true},{"type":"upload","field":"Futt1oukybhfh6","title":"上传","info":"","$required":false,"props":{"action":""},"_fc_drag_tag":"upload","hidden":false,"display":true}]

    }

const optionJson2  =  "{\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"right\",\"size\":\"default\",\"labelWidth\":\"120px\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":true,\"innerText\":\"提交\"}}"
const  dataJson2 = ["{\"type\":\"html\",\"title\":\"\",\"native\":true,\"attrs\":{\"innerHTML\":\"\"},\"style\":{\"display\":\"block\",\"width\":\"100%\"},\"children\":[\"<div style=\\\"width:100%;text-align:center\\\">\\n\\t\\t<h2>周报</h2>\\n  </div>\"],\"_fc_id\":\"id_Ffvamf3dnm2maxc\",\"name\":\"ref_Fss0mf3dnm2mayc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"html\"}","{\"type\":\"UserSelect\",\"field\":\"user\",\"title\":\"汇报人\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fkntmf4owpwib3c\",\"name\":\"ref_Fmnomf4owpwib4c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"UserSelect\"}","{\"type\":\"DeptSelect\",\"field\":\"21985ce7-dc15-4677-8522-4f7070aded37\",\"title\":\"部门选择器\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fq3tmf3ikv3fb2c\",\"name\":\"ref_F6b4mf3ikv3fb3c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"DeptSelect\"}","{\"type\":\"fcRow\",\"children\":[{\"type\":\"col\",\"props\":{\"span\":12},\"children\":[{\"type\":\"datePicker\",\"field\":\"F4bemf3ins6mbac\",\"title\":\"本周开始日期\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fx2qmf3ins6mbbc\",\"name\":\"ref_Fnsamf3ins6mbcc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}],\"_fc_id\":\"id_F38nmf3inlczb6c\",\"name\":\"ref_Fp5bmf3inlczb7c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"col\"},{\"type\":\"col\",\"props\":{\"span\":12},\"children\":[{\"type\":\"datePicker\",\"field\":\"Fizzmf3io73lbgc\",\"title\":\"本周结束日期\",\"info\":\"\",\"$required\":false,\"_fc_id\":\"id_Fua4mf3io73lbhc\",\"name\":\"ref_Fj8hmf3io73lbic\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}],\"_fc_id\":\"id_Fmeqmf3inlczb8c\",\"name\":\"ref_Fnuumf3inlczb9c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"col\"}],\"_fc_id\":\"id_F376mf3inlczb4c\",\"name\":\"ref_Fkgzmf3inlczb5c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"fcRow\"}","{\"type\":\"input\",\"field\":\"Fmfvmf3dkhuualc\",\"title\":\"本周工作总结\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":6},\"_fc_id\":\"id_Fc7smf3dkhuuamc\",\"name\":\"ref_F2pjmf3dkhuuanc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"Ft8fmf3dloj1aoc\",\"title\":\"本周遇到的问题\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":4},\"_fc_id\":\"id_Fqm6mf3dloj1apc\",\"name\":\"ref_Fuxlmf3dloj1aqc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"F14xmf3dmoskarc\",\"title\":\"问题解决方案\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\",\"rows\":4},\"_fc_id\":\"id_F2brmf3dmoskasc\",\"name\":\"ref_Fxy8mf3dmoskatc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}","{\"type\":\"input\",\"field\":\"F5hcmf3dmxemauc\",\"title\":\"下周工作计划\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\"},\"_fc_id\":\"id_F9w8mf3dmxemavc\",\"name\":\"ref_F0eymf3dmxemawc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}"]
const valueJson = {"PROCESS_START_USER_ID":1,"_FLOWABLE_SKIP_EXPRESSION_ENABLED":true,"21985ce7-dc15-4677-8522-4f7070aded37":103,"Fmfvmf3dkhuualc":"1. yudao 系统部署：成功将 yudao 系统的前端和后端部署到服务器上。通过仔细配置服务器参数、安装必要的运行环境和依赖组件，确保前后端程序能够正常运行且相互通信，实现了系统在服务器上的初步上线。\n2. 服务器环境调整：针对 yudao 系统运行需求，对服务器环境进行了优化调整。合理分配服务器资源，如 CPU、内存等，提升系统整体性能；同时检查并修复了部分网络配置问题，保障数据传输的稳定性和安全性，为系统稳定运行创造良好环境。","Ft8fmf3dloj1aoc":"1. 业务逻辑理解不到位：yudao 系统涉及的业务场景较为复杂，不同业务流程之间存在较多关联和嵌套，导致对部分业务逻辑理解出现偏差\n2. JDK 版本切换异常：在部署前进行 JDK 版本切换时，遇到命令执行后版本未成功切换的情况，系统仍识别旧版本 JDK，导致后续部署工作无法基于目标 JDK 版本顺利开展。\n3.  兼容性问题：部分依赖库与新切换的 JDK 版本存在兼容性问题，表现为部署过程中部分功能报错，无法正常运行，如某些 Java 类库在新 JDK 环境下无法正确加载。\n4. 其他bug修复","F14xmf3dmoskarc":"1. 深入理解业务逻辑：主动与项目主管沟通,实际业务场景进行分析。对存在疑问的环节反复确认，确保准确理解业务逻辑，为正确配置系统提供保障。\n2. 解决 JDK 版本切换问题：重新安装并检查 JDK 安装路径及环境变量配置，发现环境变量中 JDK 路径指向旧版本。修正环境变量中 JDK 路径，确保其准确指向新版本 JDK 安装目录。同时，检查系统 PATH 变量设置，保证新版本 JDK 的 bin 目录在搜索路径中优先级正确。执行相关命令验证，成功实现 JDK 版本切换。\n3.  处理兼容性问题：查阅相关依赖库文档，确定与新 JDK 版本兼容的依赖库版本。对存在兼容性问题的依赖库进行版本升级或降级处理，在本地测试环境进行多次测试，确保依赖库与新 JDK 版本能够协同工作，成功解决部署过程中的功能报错问题。","F5hcmf3dmxemauc":"开发 CDC 数据捕获模块","F4bemf3ins6mbac":"2025-09-08","Fizzmf3io73lbgc":"2025-09-12","user":3442}


const formDetailPreview = ref({
  rule: [],
  option: {},
  value:{}
})



// 解码表单 Fields
 const decodeFields = (fields) => {
  const rule = []
  fields.forEach((item) => {
    rule.push(JSON.parse(item))
  })
  return rule
}

const setConfAndFields2 = (
  detailPreview,
  conf,
  fields,
  value
) => {
  if (isRef(detailPreview)) {
    // @ts-ignore
    detailPreview = detailPreview.value
  }
  // @ts-ignore
  detailPreview.option = JSON.parse(conf)
  // @ts-ignore
  detailPreview.rule = decodeFields(fields)
  formCreateRef.value.showForm(detailPreview.rule)
  formCreateRef.value.setFormValues(valueJson)
  
  
  if (value) {
    // @ts-ignore
    detailPreview.value = value
	formCreateRef.value.setFormValues(value)
  }
}




    /** 初始化 **/
    onMounted(() => {

        // 表单整体属性值，通过组件属性注入
        // option.value = { "form": { "labelPosition": "right", "size": "small", "labelWidth": "125px", "hideRequiredAsterisk": true, "showMessage": true, "inlineMessage": false }, "submitBtn": { "show": true, "innerText": "提交" }, "resetBtn": { "show": true, "innerText": "重置" } }

        // // 表单内各组件，需要通过方法来设值，因为设值后，需要动态生成表单验证内容
        // const rule = [{"type":"input","field":"Ffyi631rgf2hn","title":"输入框","info":"","$required":true,"_fc_drag_tag":"input","hidden":false,"display":true},{"type":"inputNumber","field":"F78g6323ffje1","title":"计数器","info":"","$required":false,"_fc_drag_tag":"inputNumber","hidden":false,"display":true},{"type":"radio","field":"Fo0p6323ffxyk","title":"单选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"radio","hidden":false,"display":true},{"type":"checkbox","field":"Fjfh6323fgc5h","title":"多选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"checkbox","hidden":false,"display":true},{"type":"select","field":"Fork1oukyaqp1g","title":"选择器","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项1","value":1},{"label":"选项2","value":2}],"_fc_drag_tag":"select","hidden":false,"display":true},{"type":"switch","field":"Fsuh1oukyatz0r","title":"开关","info":"","$required":false,"_fc_drag_tag":"switch","hidden":false,"display":true},{"type":"timePicker","field":"Fnnm1oukyaz4tq","title":"时间选择器","info":"","$required":false,"_fc_drag_tag":"timePicker","hidden":false,"display":true},{"type":"datePicker","field":"Fud81oukyb2p59","title":"日期选择器","info":"","$required":false,"_fc_drag_tag":"datePicker","hidden":false,"display":true},{"type":"rate","field":"Fnjf1oukyb7tps","title":"评分","info":"","$required":false,"_fc_drag_tag":"rate","hidden":false,"display":true,"value":0},{"type":"colorPicker","field":"F5zc1oukybcmk3","title":"颜色选择器","info":"","$required":false,"_fc_drag_tag":"colorPicker","hidden":false,"display":true},{"type":"upload","field":"Futt1oukybhfh6","title":"上传","info":"","$required":false,"props":{"action":""},"_fc_drag_tag":"upload","hidden":false,"display":true}]







        // formCreateRef.value.showForm(rule)


		setConfAndFields2(formDetailPreview,optionJson2,dataJson2, valueJson)

    })
</script>

<style scoped>
.content {
	padding: 12px;
}
</style>