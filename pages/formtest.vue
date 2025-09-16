<template>
	<view> 
		<form-create-uni ref="formCreateRef" :option="option" @submit="submit"></form-create-uni>
	</view>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
	import formCreateUni from '@/uni_modules/form-create-uni/components/form-create-uni/form-create-uni.vue'

	const formCreateRef = ref()
	const formData = ref([])
	const option = ref({})
	
	const submit = () => {
		console.log('表单提交')
	}

	onMounted(() => {
		formData.value = [{ 
			"type": "input", 
			"field": "Ffyi631rgf2hn", 
			"title": "输入框21", 
			"info": "", 
			"$required": true, 
			"_fc_drag_tag": "input", 
			"hidden": false, 
			"display": true 
		}]

		option.value = { 
			"form": { 
				"labelPosition": "right", 
				"size": "small", 
				"labelWidth": "125px", 
				"hideRequiredAsterisk": true, 
				"showMessage": true, 
				"inlineMessage": false 
			}, 
			"submitBtn": { 
				"show": true, 
				"innerText": "提交" 
			}, 
			"resetBtn": { 
				"show": true, 
				"innerText": "重置" 
			} 
		}

		formCreateRef.value.showForm(formData.value)
	})
</script>