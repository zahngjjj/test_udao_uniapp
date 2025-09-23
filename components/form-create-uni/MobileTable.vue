<template>
  <view class="mobile-table">
    <!-- 表格头部 -->
    <view class="table-header" v-if="showHeader">
      <view class="header-title">{{ title || '表格数据' }}</view>
      <view class="header-actions">
        <u-button 
          v-if="!readonly" 
          type="primary" 
          size="mini" 
          @click="addRow"
          :disabled="disabled">
          <u-icon name="plus" size="12"></u-icon>
          添加
        </u-button>
      </view>
    </view>

    <!-- 表格内容 - 卡片式展示 -->
    <view class="table-content">
      <view 
        v-for="(row, rowIndex) in tableData" 
        :key="rowIndex" 
        class="table-card">
        
        <!-- 卡片头部 -->
        <view class="card-header">
          <text class="card-index">第 {{ rowIndex + 1 }} 项</text>
          <view class="card-actions" v-if="!readonly">
            <u-button 
              type="error" 
              size="mini" 
              @click="deleteRow(rowIndex)"
              :disabled="disabled">
              <u-icon name="trash" size="12"></u-icon>
              删除
            </u-button>
          </view>
        </view>

        <!-- 卡片内容 -->
        <view class="card-content">
          <view 
            v-for="(column, colIndex) in columns" 
            :key="colIndex" 
            class="field-item">
            
            <view class="field-label">{{ column.label }}：</view>
            <view class="field-value">
              <!-- 渲染表单项 -->
              <template v-for="(rule, ruleIndex) in column.rule" :key="ruleIndex">
                <!-- 输入框 -->
                <template v-if="rule.type === 'input' && rule.props?.type !== 'textarea'">
                  <u-input 
                    v-model="row[rule.field]" 
                    :placeholder="rule.props?.placeholder || '请输入' + column.label"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    :maxlength="rule.props?.maxlength"
                    :clearable="rule.props?.clearable"
                    @input="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 多行文本输入 -->
                <template v-else-if="rule.type === 'input' && rule.props?.type === 'textarea'">
                  <uni-easyinput 
                    v-model="row[rule.field]" 
                    :placeholder="rule.props?.placeholder || '请输入' + column.label"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    :rows="rule.props?.rows || 3"
                    :maxlength="rule.props?.maxlength"
                    :showWordLimit="rule.props?.showWordLimit"
                    type="textarea" 
                    autoHeight
                    @input="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 数字输入 -->
                <template v-else-if="rule.type === 'inputNumber'">
                  <u-number-box 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    :placeholder="rule.props?.placeholder || '请输入' + column.label"
                    :min="rule.props?.min"
                    :max="rule.props?.max"
                    :step="rule.props?.step"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 单选框 -->
                <template v-else-if="rule.type === 'radio'">
                  <u-radio-group 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)">
                    <u-radio 
                      v-for="(option, optIndex) in rule.options" 
                      :key="optIndex"
                      :label="option.label" 
                      :name="option.value">
                    </u-radio>
                  </u-radio-group>
                </template>
                
                <!-- 复选框 -->
                <template v-else-if="rule.type === 'checkbox'">
                  <u-checkbox-group 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)">
                    <u-checkbox 
                      v-for="(option, optIndex) in rule.options" 
                      :key="optIndex"
                      :label="option.label" 
                      :name="option.value">
                    </u-checkbox>
                  </u-checkbox-group>
                </template>
                
                <!-- 选择器 -->
                <template v-else-if="rule.type === 'select'">
                  <template v-if="rule.props?.multiple">
                    <u-checkbox-group 
                      v-model="row[rule.field]" 
                      :disabled="readonly || disabled || rule.props?.disabled"
                      @change="onFieldChange(rowIndex, rule.field, $event)">
                      <u-checkbox 
                        v-for="(option, optIndex) in rule.options" 
                        :key="optIndex"
                        :label="option.label" 
                        :name="option.value">
                      </u-checkbox>
                    </u-checkbox-group>
                  </template>
                  <template v-else>
                    <u-radio-group 
                      v-model="row[rule.field]" 
                      :disabled="readonly || disabled || rule.props?.disabled"
                      @change="onFieldChange(rowIndex, rule.field, $event)">
                      <u-radio 
                        v-for="(option, optIndex) in rule.options" 
                        :key="optIndex"
                        :label="option.label" 
                        :name="option.value">
                      </u-radio>
                    </u-radio-group>
                  </template>
                </template>
                
                <!-- 开关 -->
                <template v-else-if="rule.type === 'switch'">
                  <u-switch 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    :activeColor="rule.props?.activeColor"
                    :inactiveColor="rule.props?.inactiveColor"
                    :activeValue="rule.props?.activeValue"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 日期选择器 -->
                <template v-else-if="rule.type === 'datePicker' || rule.type === 'DatePicker'">
                  <u-cell 
                    :disabled="readonly || disabled || rule.props?.disabled" 
                    @click="showDatePicker(rowIndex, rule.field)"
                    :title="row[rule.field] || rule.props?.placeholder || '选择日期'" 
                    class="date-cell" 
                  />
                </template>
                
                <!-- 时间选择器 -->
                <template v-else-if="rule.type === 'timePicker'">
                  <u-cell 
                    :disabled="readonly || disabled || rule.props?.disabled" 
                    @click="showTimePicker(rowIndex, rule.field)"
                    :title="row[rule.field] || rule.props?.placeholder || '选择时间'" 
                    class="date-cell" 
                  />
                </template>
                
                <!-- 颜色选择器 -->
                <template v-else-if="rule.type === 'colorPicker'">
                  <u-cell @click="showColorPicker(rowIndex, rule.field)">
                    <template #value>
                      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <rect width="20" height="20" :fill="row[rule.field] || '#ffffff'" />
                      </svg>
                    </template>
                  </u-cell>
                </template>
                
                <!-- 滑块 -->
                <template v-else-if="rule.type === 'slider'">
                  <u-slider 
                    v-model="row[rule.field]" 
                    :activeColor="rule.props?.activeColor"
                    :inactiveColor="rule.props?.inactiveColor"
                    :min="rule.props?.min"
                    :max="rule.props?.max"
                    :step="rule.props?.step"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 评分 -->
                <template v-else-if="rule.type === 'rate'">
                  <u-rate 
                    v-model="row[rule.field]" 
                    :count="rule.props?.max || 5"
                    :readonly="readonly || rule.props?.readonly"
                    :activeColor="rule.props?.activeColor"
                    :inactiveColor="rule.props?.voidColor"
                    :allowHalf="rule.props?.allowHalf"
                    :disabled="disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 图片上传 -->
                <template v-else-if="rule.type === 'UploadImgs' || rule.type === 'UploadImg'">
                  <UploadImage 
                    v-model="row[rule.field]" 
                    :multiple="rule.props?.multiple !== false"
                    :maxCount="rule.props?.limit || rule.props?.maxCount || 9"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    :maxSize="rule.props?.maxSize || 5 * 1024 * 1024"
                    :width="rule.props?.width || '100px'"
                    :height="rule.props?.height || '100px'"
                    @upload-success="handleUploadSuccess"
                    @upload-error="handleUploadError"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 用户选择器 -->
                <template v-else-if="rule.type === 'UserSelect'">
                  <single-user-select 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 部门选择器 -->
                <template v-else-if="rule.type === 'DeptSelect'">
                  <DepartmentSelect 
                    v-model="row[rule.field]" 
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @change="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 富文本编辑器 -->
                <template v-else-if="rule.type === 'fc-editor'">
                  <u--textarea 
                    v-model="row[rule.field]" 
                    :placeholder="rule.props?.placeholder || '请输入内容'"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @input="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
                
                <!-- 文字显示 -->
                <template v-else-if="rule.type === 'span'">
                  <text class="span-text">{{ rule.children?.[0] || row[rule.field] || '-' }}</text>
                </template>
                
                <!-- HTML内容 -->
                <template v-else-if="rule.type === 'html'">
                  <view class="html-content" :style="rule.style">
                    <rich-text 
                      :nodes="rule.children?.[0] || rule.attrs?.innerHTML || ''"
                      :selectable="rule.native || false">
                    </rich-text>
                  </view>
                </template>
                
                <!-- 默认输入框 -->
                <template v-else>
                  <u-input 
                    v-model="row[rule.field]" 
                    :placeholder="rule.props?.placeholder || '请输入' + column.label"
                    :disabled="readonly || disabled || rule.props?.disabled"
                    @input="onFieldChange(rowIndex, rule.field, $event)"
                  />
                </template>
              </template>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!tableData || tableData.length === 0" class="empty-state">
        <u-empty text="暂无数据" mode="data"></u-empty>
        <u-button 
          v-if="!readonly" 
          type="primary" 
          @click="addRow"
          :disabled="disabled"
          style="margin-top: 20px;">
          添加第一条数据
        </u-button>
      </view>
    </view>

    <!-- 日期选择器 -->
    <u-datetime-picker 
      :show="datePickerShow" 
      mode="date" 
      @confirm="confirmDate"
      @cancel="datePickerShow = false"
    />
    
    <!-- 时间选择器 -->
    <u-datetime-picker 
      :show="timePickerShow" 
      mode="time" 
      @confirm="confirmTime"
      @cancel="timePickerShow = false"
    />
    
    <!-- 颜色选择器 -->
    <uv-pick-color 
      ref="pickerColorRef" 
      @confirm="confirmColor"
    />
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import SingleUserSelect from './SingleUserSelect.vue'
import DepartmentSelect from './DepartmentSelect.vue'
import UploadImage from './UploadImage.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  maxRows: {
    type: Number,
    default: 50
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'add', 'delete'])

// 响应式数据
const tableData = ref([])
const datePickerShow = ref(false)
const timePickerShow = ref(false)
const currentDateField = ref('')
const currentTimeField = ref('')
const currentRowIndex = ref(-1)
const pickerColorRef = ref()
const currentColorField = ref('')

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  tableData.value = newVal || []
}, { immediate: true, deep: true })

// 监听内部数据变化
watch(tableData, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
}, { deep: true })

// 添加行
const addRow = () => {
  if (props.readonly || props.disabled) return
  if (tableData.value.length >= props.maxRows) {
    uni.showToast({
      title: `最多只能添加${props.maxRows}条数据`,
      icon: 'none'
    })
    return
  }
  
  const newRow = {}
  // 根据columns中的rule初始化字段
  props.columns.forEach(column => {
    if (column.rule && Array.isArray(column.rule)) {
      column.rule.forEach(rule => {
        if (rule.field) {
          // 根据字段类型设置默认值
          switch (rule.type) {
            case 'checkbox':
            case 'el-transfer':
            case 'tree':
              newRow[rule.field] = []
              break
            case 'switch':
              newRow[rule.field] = rule.props?.activeValue || false
              break
            case 'inputNumber':
            case 'slider':
            case 'rate':
              newRow[rule.field] = rule.props?.min || 0
              break
            case 'UploadImgs':
            case 'UploadImg':
              newRow[rule.field] = rule.props?.multiple !== false ? [] : ''
              break
            default:
              newRow[rule.field] = rule.props?.defaultValue || ''
          }
        }
      })
    }
  })
  
  tableData.value.push(newRow)
  emit('add', newRow, tableData.value.length - 1)
}

// 删除行
const deleteRow = (index) => {
  if (props.readonly || props.disabled) return
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条数据吗？',
    success: (res) => {
      if (res.confirm) {
        const deletedRow = tableData.value.splice(index, 1)[0]
        emit('delete', deletedRow, index)
      }
    }
  })
}

// 字段值变化
const onFieldChange = (rowIndex, field, value) => {
  if (props.readonly || props.disabled) return
  if (!tableData.value[rowIndex]) return
  tableData.value[rowIndex][field] = value
}

// 显示日期选择器
const showDatePicker = (rowIndex, field) => {
  if (props.readonly || props.disabled) return
  currentRowIndex.value = rowIndex
  currentDateField.value = field
  datePickerShow.value = true
}

// 显示时间选择器
const showTimePicker = (rowIndex, field) => {
  if (props.readonly || props.disabled) return
  currentRowIndex.value = rowIndex
  currentTimeField.value = field
  timePickerShow.value = true
}

// 显示颜色选择器
const showColorPicker = (rowIndex, field) => {
  if (props.readonly || props.disabled) return
  currentRowIndex.value = rowIndex
  currentColorField.value = field
  pickerColorRef.value?.open()
}

// 确认日期选择
const confirmDate = (e) => {
  const date = uni.$u.timeFormat(e.value, 'yyyy-mm-dd')
  if (tableData.value[currentRowIndex.value]) {
    tableData.value[currentRowIndex.value][currentDateField.value] = date
  }
  datePickerShow.value = false
}

// 确认时间选择
const confirmTime = (e) => {
  if (tableData.value[currentRowIndex.value]) {
    tableData.value[currentRowIndex.value][currentTimeField.value] = e.value
  }
  timePickerShow.value = false
}

// 确认颜色选择
const confirmColor = (e) => {
  if (tableData.value[currentRowIndex.value]) {
    tableData.value[currentRowIndex.value][currentColorField.value] = e.hex
  }
}

// 处理上传成功
const handleUploadSuccess = (data) => {
  console.log('图片上传成功:', data)
  uni.showToast({
    title: '上传成功',
    icon: 'success'
  })
}

// 处理上传失败
const handleUploadError = (error) => {
  console.error('图片上传失败:', error)
  uni.showToast({
    title: '上传失败',
    icon: 'none'
  })
}
</script>

<style scoped>
.mobile-table {
  width: 100%;
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fa;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-content {
  padding: 10px;
}

.table-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.card-index {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.card-content {
  padding: 15px;
}

.field-item {
  margin-bottom: 15px;
}

.field-item:last-child {
  margin-bottom: 0;
}

.field-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.field-value {
  width: 100%;
}

.date-cell {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.span-text {
  color: #303133;
  font-size: 14px;
  padding: 8px 0;
}

.html-content {
  padding: 8px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

/* 复选框和单选框样式优化 */
:deep(.u-checkbox-group) {
  width: 100% !important;
}

:deep(.u-checkbox) {
  margin-right: 6px !important;
  margin-bottom: 8px !important;
}

:deep(.u-radio-group) {
  width: 100% !important;
}

:deep(.u-radio) {
  margin-right: 6px !important;
  margin-bottom: 8px !important;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .table-header {
    padding: 10px;
  }
  
  .header-title {
    font-size: 14px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .field-item {
    margin-bottom: 12px;
  }
}
</style>