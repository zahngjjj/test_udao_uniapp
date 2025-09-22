<template>
	<view>
		<u--form ref="formRef" :model="form" :rules="rules"
			:labelPosition="(option?.form?.labelPosition === 'right')? 'left': option?.form?.labelPosition"
			:labelWidth="option?.form?.labelWidth" :errorType="(option?.form?.showMessage)? 'message': 'none'"
			labelAlign="center">
			<template v-for="(item, index) in rule" :key="index">
            <!-- <p>  这是一个测试 {{ item }} / {{ item.type }} / {{ item?.field }} / {{ form[item?.field] }}</p> -->
			<!-- HTML内容渲染 -->	
             <u-form-item :label="item?.title" :prop="item?.field" v-if="item?.type ==='UserSelect'">
				<span>{{ form[item?.field]?.name }}</span>
				<single-user-select v-model="form[item?.field]" />
            </u-form-item>
			<u-form-item :label="item?.title" :prop="item?.field" v-if="item?.type ==='DeptSelect'">
				<!-- 部门选择器逻辑 -->
				<DepartmentSelect v-model="form[item?.field]" />
            </u-form-item>

             <u-form-item :label="item?.title" :prop="item?.field" v-if="item?.type === 'html'">
	                <view
					class="html-content"
					:style="item?.style"
					:hidden="item?.hidden"
					v-show="item?.display !== false">
					<rich-text 
						:nodes="item?.children?.[0] || item?.attrs?.innerHTML || ''"
						:selectable="item?.native || false">
					</rich-text>
				</view>	
            </u-form-item>
			<u-form-item 
				:label="item?.title" 
				:prop="item?.field"
				v-if="item?.type === 'datePicker' || item?.type === 'DatePicker'">
				<u-cell :disabled="item?.props?.disabled" @click="showPicker(item.field, item.type)"
					:title="form[item?.field] || '选择日期'" class="clickable-cell" />
				<u-datetime-picker :show="picker[item?.field]" mode="date" @confirm="confirmDate"
					@cancel="picker[item?.field] = false"></u-datetime-picker>
			</u-form-item>
            <u-form-item :label="item?.title" :prop="item?.field"
					v-if="item?.type === 'input' || item?.type === 'inputNumber' || item?.type === 'radio' || item?.type === 'checkbox' || item?.type === 'select' || item?.type === 'switch' || item?.type === 'timePicker' || item?.type === 'datePicker' || item?.type === 'colorPicker' || item?.type === 'slider' || item?.type === 'rate' || item?.type === 'span' || item?.type === 'el-transfer' || item?.type === 'fc-editor'  || item?.type === 'tree' || item?.type === 'cascader' || item?.type === 'upload'">
                    <!-- 计数器 -->
					<u-number-box v-model="form[item?.field]" v-if="item?.type === 'inputNumber'"
						:disabled="item?.props?.disabled" :placeholder="item?.props?.placeholder"
						:min="item?.props?.min" :max="item?.props?.max" :step="item?.props?.step"></u-number-box>
					<!-- 单选框 -->
					<u-radio-group v-model="form[item?.field]" :disabled="item?.props?.disabled"
						:placeholder="item?.props?.placeholder"
						v-else-if="item?.type === 'radio' || (item?.type === 'select'  && item?.props?.multiple !== true ) || ( item?.type === 'cascader'  && !item?.props?.multiple  )  ">
						<u-radio v-for="(itemOption, indexOption) in item?.options" :key="indexOption"
							:label="itemOption?.label" :name="itemOption?.value">
						</u-radio>
					</u-radio-group>
					<!-- 复选框 -->
					<u-checkbox-group v-model="form[item?.field]" :disabled="item?.props?.disabled"
						:placeholder="item?.props?.placeholder"
						v-else-if="item?.type === 'checkbox' || item?.type === 'el-transfer' || item?.type === 'tree' || (item?.type === 'select' && item?.props?.multiple === true ) || ( item?.type === 'cascader'  && item?.props?.multiple  ) ">
						<u-checkbox v-for="(itemOption, indexOption) in item?.options" :key="indexOption"
							:label="itemOption?.label" :name="itemOption?.value"
							v-if="item?.type === 'checkbox' || (item?.type === 'select' && item?.props?.multiple === true)">
						</u-checkbox>
						<u-checkbox v-for="(itemOption, indexOption) in item?.props?.data" :key="indexOption"
							:label="itemOption?.label" :name="itemOption?.value"
							v-if="item?.type === 'el-transfer' || item?.type === 'tree'">
						</u-checkbox>
					</u-checkbox-group>
					<!-- 开关 -->
					<u-switch v-model="form[item?.field]" v-else-if="item?.type === 'switch'"
						:disabled="item?.props?.disabled" :placeholder="item?.props?.placeholder"
						:activeColor="item?.props?.activeColor" :inactiveColor="item?.props?.inactiveColor"
						:activeValue="item?.props?.activeValue"></u-switch>

					<template v-if="item?.type === 'datePicker'">

						<u-cell :disabled="item?.props?.disabled" @click="showPicker(item.field, item.type)"
							:title="form[item?.field] || '请点此选择' " />

						<u-datetime-picker :show="picker[item?.field]" mode="date" @confirm="confirmDate"
							@cancel="picker[item?.field] = false"></u-datetime-picker>

					</template>

					<template v-if="item?.type === 'timePicker'">

						<u-cell :disabled="item?.props?.disabled" @click="showPicker(item.field, item.type)"
							:title="form[item?.field] || '请点此选择' " />

						<u-datetime-picker :show="picker[item?.field]" mode="time" @confirm="confirmTime"
							@cancel="picker[item?.field] = false"></u-datetime-picker>

					</template>

					<template v-else-if="item?.type === 'colorPicker'">

						<u-cell @click="showPicker(item?.field, item.type)">
							<template #value>
								<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" :fill="form[item?.field]" />
								</svg></template>
						</u-cell>
					</template>

					<!-- 滑块 -->
					<u-slider v-model="form[item?.field]" :placeholder="item?.props?.placeholder"
						v-else-if="item?.type === 'slider'" :activeColor="item?.props?.activeColor"
						:inactiveColor="item?.props?.inactiveColor" :min="item?.props?.min" :max="item?.props?.max"
						:step="item?.props?.step" :disabled="item?.props?.disabled"></u-slider>
					<!-- 评分 -->
					<u-rate v-model="form[item?.field]" :placeholder="item?.props?.placeholder"
						:count="item?.props?.max" :readonly="item?.props?.readonly"
						:activeColor="item?.props?.activeColor" :inactiveColor="item?.props?.voidColor"
						:allowHalf="item?.props?.allowHalf" v-else-if="item?.type === 'rate'"
						:disabled="item?.props?.disabled"></u-rate>
					<!-- 富文本框 -->
					<u--textarea v-model="form[item?.field]" v-else-if="item?.type === 'fc-editor'"
						:placeholder="item?.props?.placeholder" :disabled="item?.props?.disabled"></u--textarea>
                    <!-- 多行文本输入 -->

                    <uni-easyinput v-model="form[item?.field]" v-else-if="item?.type === 'input' && item?.props?.type === 'textarea'"
                        :placeholder="item?.props?.placeholder" :disabled="item?.props?.disabled"
                        :rows="item?.props?.rows || 3" :maxlength="item?.props?.maxlength"
                        :showWordLimit="item?.props?.showWordLimit" type="textarea" autoHeight placeholder="请输入内容"></uni-easyinput>


					<!-- 上传 -->
					<u-upload v-model="form[item?.field]" v-else-if="item?.type === 'upload'"
						:disabled="item?.props?.disabled" :multiple="item?.props?.multiple"
						:maxCount="item?.props?.limit"></u-upload>
					<!-- 文字 -->
					<span v-else-if="item?.type === 'span'">{{item?.children[0]}}</span>
					<!-- 文本输入,支持属性:提示信息,是否禁用 -->
					<u--input v-else-if="item?.type === 'input'"  v-model="form[item?.field]" :placeholder="item?.props?.placeholder"
						:disabled="item?.props?.disabled" :focus="item?.props?.autofocus"
						:clearable="item?.props?.clearable" :showWordLimit="item?.props?.showWordLimit" />
					<span v-else></span>
			</u-form-item>

	    <!-- fcRow布局渲染 -->
             <u-form-item :label="item?.title" :prop="item?.field" v-if="item?.type === 'fcRow'">
				<view 
					v-if="item?.type === 'fcRow'"
					class="fc-row"
					:style="item?.style"
					:hidden="item?.hidden"
					v-show="item?.display !== false">
					<!-- 遍历fcRow的children，渲染col内容 -->
					<template v-for="(colItem, colIndex) in item?.children" :key="colIndex">
						<view 
							v-if="colItem?.type === 'col'" 
							class="fc-col"
							:style="colItem?.style">
							<!-- 遍历col的children，渲染具体的表单项 -->
							<template v-for="(childItem, childIndex) in colItem?.children" :key="childIndex">
								<!-- 递归渲染子项，这里简化为直接渲染表单项 -->
								<u-form-item :label="childItem?.title" :prop="childItem?.field" v-if="childItem?.type ==='UserSelect'">
									<span>{{ form[childItem?.field]?.name }}</span>
									<single-user-select v-model="form[childItem?.field]" />
								</u-form-item>
								<u-form-item 
									:label="childItem?.title" 
									:prop="childItem?.field"
									v-if="childItem?.type === 'datePicker' || childItem?.type === 'DatePicker' || childItem?.type === 'timePicker'">
								<template v-if="childItem?.type === 'datePicker' || childItem?.type === 'DatePicker'">
									<u-cell :disabled="childItem?.props?.disabled" @click="showPicker(childItem.field, childItem.type)"
										:title="form[childItem?.field] || '选择日期'" class="clickable-cell" />
									<u-datetime-picker :show="picker[childItem?.field]" mode="date" @confirm="confirmDate"
										@cancel="picker[childItem?.field] = false"></u-datetime-picker>
								</template>

								 <template v-if="childItem?.type === 'timePicker'">

									<u-cell :disabled="childItem?.props?.disabled" @click="showPicker(childItem.field, childItem.type)"
										:title="form[childItem?.field] || '选择时间'"  class="clickable-cell" />

									<u-datetime-picker :show="picker[childItem?.field]" mode="time" @confirm="confirmTime"
										@cancel="picker[childItem?.field] = false"></u-datetime-picker>

								</template>
								</u-form-item>


								<!-- 可以根据需要添加其他类型的表单项 -->
								<u-form-item 
									:label="childItem?.title" 
									:prop="childItem?.field"
									v-else-if="childItem?.type === 'input'">
									<u--input 
										v-model="form[childItem?.field]" 
										:placeholder="childItem?.props?.placeholder"
										:disabled="childItem?.props?.disabled">
									</u--input>
								</u-form-item>
							</template>
						</view>
					</template>
				</view>
            </u-form-item>
                
				<!-- 提示 -->
				<u-alert :title="item?.props?.title" :type="item?.props?.type" :description="item?.props?.description"
					:closable="item?.props?.closable" :center="item?.props?.center"
					v-else-if="item?.type === 'el-alert'"></u-alert>
				<!-- 分割线 -->
				<u-divider v-else-if="item?.type === 'el-divider'" :text="item?.children[0] || ''"
					:textPosition="item?.props?.contentPosition"></u-divider>

				<!-- 按钮 -->
				<u-button :type="item?.props?.type" :plain="item?.props?.plain" :loading="item?.props?.loading"
					:shape="(item?.props?.circle)? 'circle': 'square'"
					:size="(item?.props?.size === 'default' || item?.props?.size === 'small')? 'mini': 'large' "
					:text="item?.children[0]" v-else-if="item?.type === 'el-button'"></u-button>

				<!-- 间距 -->
				<view v-else-if="item?.type === 'div'" :style="{height: item?.style?.height }"></view>

			</template>

			<u-button type="primary" text="提 交" customStyle="margin-top: 50px" @click="submit"
				v-if="submitBtn"></u-button>

			<uv-pick-color ref="pickerColorRef" @confirm="confirmColor"></uv-pick-color>
		</u--form>

	</view>
</template>

<script  setup name="form-create">
	import { ref } from 'vue'
	import SingleUserSelect from './SingleUserSelect.vue'
	import DepartmentSelect from '@/components/form-create-uni/DepartmentSelect.vue'
	defineProps({
		option: {
			type: Object,
		},
		submitBtn:{
			type:Boolean,
			default: true,
		}
	})

	const rule = ref([])

	const form = ref({
	})

	const picker = ref({})

	const rules = ref({})

	// const getModel = (formD) => {

	// 	for (let i = 0; i < formD.length; i++) {

	// 		const ele = formD[i]

	// 		form.value[ele.field] = ''

	// 		if (ele.type === 'timePicker' || ele.type === 'datePicker' || ele.type === 'colorPicker') {

	// 			picker.value[ele.field] = false

	// 		}

	// 	}

	// }

	const getModel = (formD) => {

		for (let i = 0; i < formD.length; i++) {

			const ele = formD[i]

			// 处理普通字段
			if (ele.field) {
				form.value[ele.field] = ''

				if (ele.type === 'timePicker' || ele.type === 'datePicker' || ele.type === 'colorPicker') {
					picker.value[ele.field] = false
				}
			}

			// 处理fcRow嵌套字段 - 这是关键！
			if (ele.type === 'fcRow' && ele.children) {
				for (let j = 0; j < ele.children.length; j++) {
					const colItem = ele.children[j]
					if (colItem.type === 'col' && colItem.children) {
						for (let k = 0; k < colItem.children.length; k++) {
							const childItem = colItem.children[k]
							if (childItem.field) {
								// 初始化嵌套字段到form对象
								form.value[childItem.field] = ''
								if (childItem.type === 'timePicker' || childItem.type === 'datePicker' || childItem.type === 'colorPicker') {
									picker.value[childItem.field] = false
								}
							}
						}
					}
				}
			}
		}
	}


	const getRules = (formD) => {

		const r = {}

		for (let i = 0; i < formD.length; i++) {

			const ele = formD[i]

			const required = ele?.$required

			let max = ele?.props?.maxlength

			let min = ele?.props?.minlength

			r[(ele.field)] = []

			if (required) {

				let message = required?.toString()

				if (message === 'true') {

					message = '请输入内容'

				}

				r[(ele?.field)]?.push({
					type: 'string',
					required: true,
					message: message,
					trigger: ['blur', 'change']
				})

			}

			if (!min) {

				min = 0

			}

			if (max || min) {

				if (!max) {
					max = 999999999
				}

				r[(ele?.field)]?.push({

					min: min,
					max: max,
					message: '长度在' + min + '-' + max + '个字符之间'

				})
			}

		}

		rules.value = r

		return rules

	}


	
	const setFormValues = (values) => {
		Object.keys(values).forEach(key => {
			if (form.value.hasOwnProperty(key)) {
				form.value[key] = values[key]
			}
		})
	}
	const showForm = (formD) => {

		rule.value = formD

		getModel(formD)

		getRules(formD)
        console.log(getRules(formD),'getRules(formD)')

		formRef.value.setRules(rules)

	}

	const pickerColorRef = ref()

	const formRef = ref()

	let fieldPicker = ''

	const showPicker = (field, type) => {

		fieldPicker = field

		if (type === 'timePicker' || type === 'datePicker' || type === 'DatePicker') {

			picker.value[field] = true
		}

		if (type === 'colorPicker') {

			pickerColorRef.value.open()

		}

	}

	const confirmDate = (v) => {

		const d = uni.$u.timeFormat(v.value, 'yyyy-mm-dd');

		form.value[fieldPicker] = d

		picker.value[fieldPicker] = false

	}

	const confirmTime = (v) => {

		form.value[fieldPicker] = v.value

		picker.value[fieldPicker] = false

	}

	const confirmColor = (e) => {

		form.value[fieldPicker] = e.hex

	}

	const emit = defineEmits(['submit'])

	const getFormData = () => {

	const formData = {}
		const fo = form.value
		
		// 遍历表单数据，构建键值对对象
		for (const field in fo) {
			const value = fo[field]
			
			// 剔除空数据：null、undefined、空字符串、空数组
			if (value !== null && 
				value !== undefined && 
				value !== '' && 
				!(Array.isArray(value) && value.length === 0)) {
				formData[field] = value
			}
		}
		
		
		return formData

	}

	const submit = async () => {

		formRef.value.validate().then(res => {

			const fd = rule.value

			const fo = form.value

			for (let i = 0; i < fd.length; i++) {
				const ele = fd[i]

				const field = ele.field

				if (fo[field]) {

					ele.values = fo[field]

				}

			}

			emit("submit", fd)

		}).catch(errors => {
			console.log('校验失败');
			console.log(errors);
		});

	}
	
	defineExpose({ showForm, getFormData ,setFormValues })

</script>

<style scoped>
/* 使用深度选择器覆盖uView组件样式 */

:deep(.clickable-cell) {
	border: 1px solid #e4e7ed !important;
	border-radius: 4px !important;
	background-color: #f8f9fa !important;
	cursor: pointer;
	transition: all 0.3s ease;
	padding: 0px 12px;
}

:deep(.clickable-cell:hover) {
	background-color: #e9ecef !important;
	border-color: #409eff !important;
	box-shadow: 0 2px 4px rgba(64, 158, 255, 0.12) !important;
}

:deep(.clickable-cell:active) {
	background-color: #dee2e6 !important;
	transform: translateY(1px);
}

/* 禁用状态样式 */
:deep(.clickable-cell[disabled]) {
	background-color: #f5f7fa !important;
	border-color: #e4e7ed !important;
	color: #c0c4cc !important;
	cursor: not-allowed;
}

:deep(.clickable-cell[disabled]:hover) {
	background-color: #f5f7fa !important;
	border-color: #e4e7ed !important;
	box-shadow: none !important;
	transform: none;
}
.fc-row {
	width: 100%;
}

.fc-col {
	width: 100%;
}

/* 确保 u-checkbox-group 的内容不会被隐藏 */
.u-checkbox-group {
	width: 94% !important;
}

.u-checkbox {
	margin-right: 6px!important;
}
</style>