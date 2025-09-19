<template>
	<view class="approval-flow">
        		<!-- 标题区域 -->
		<view class="flow-header">
			<view class="flow-title">
				<u-icon name="list" color="#409eff" size="18" style="margin-right: 8rpx;"></u-icon>
				审批流程
			</view>
		</view>
		<view class="flow-container">
			<view 
				v-for="(item, index) in flowList" 
				:key="index" 
				class="flow-item"
				:class="{ 'completed': item.status === 'completed', 'current': item.status === 'current', 'pending': item.status === 'pending' }">
				
				<!-- 审批节点 -->
				<view class="flow-node">
					<view class="node-content">
						<view class="node-avatar">
							<u-avatar 
								:src="item.avatar" 
								:text="item.name.charAt(0)"
								size="32"
								:bg-color="getAvatarBgColor(item.status)"
								color="#fff">
							</u-avatar>
							<!-- 状态图标 -->
							<view class="status-icon" v-if="item.status === 'completed'">
								<u-icon name="checkmark" color="#fff" size="10"></u-icon>
							</view>
						</view>
						
						<!-- 审批信息 -->
						<view class="node-info">
							<view class="node-title">{{ item.title }}</view>
							<view class="node-name">{{ item.name }}</view>
							<view class="node-time" v-if="item.time && showTime">{{ item.time }}</view>
						</view>
					</view>
				</view>
				
				<!-- 连接线 -->
				<view class="flow-line" v-if="index < flowList.length - 1"></view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatTime } from '@/utils/common.js'
// Props定义
const props = defineProps({
	// 审批流程数据
	flowData: {
		type: Array,
		default: () => []
	},
	// 是否显示时间
	showTime: {
		type: Boolean,
		default: true
	}
})

// 默认流程数据
const defaultFlowList = [
	// {
	// 	id: 1,
	// 	title: '发起人',
	// 	name: '手道源码',
	// 	avatar: '',
	// 	status: 'completed',
	// 	time: '2025-09-12 17:28:56'
	// },
	// {
	// 	id: 2,
	// 	title: '领导审批',
	// 	name: '廖崇修',
	// 	avatar: '',
	// 	status: 'completed',
	// 	time: '2025-09-16 10:38:59'
	// },
	// {
	// 	id: 3,
	// 	title: '结束',
	// 	name: '',
	// 	avatar: '',
	// 	status: 'completed',
	// 	time: '2025-09-16 10:38:59'
	// }
]

// 计算流程列表
const flowList = computed(() => {
	const data = props.flowData.length > 0 ? props.flowData : defaultFlowList
	// 对时间字段进行格式化处理
	return data.map(item => ({
		...item,
		time: item.time ? formatTime(item.time) : '',
		startTime: item.startTime ? formatTime(item.startTime) : '',
		endTime: item.endTime ? formatTime(item.endTime) : ''
	}))
})

// 获取头像背景色
const getAvatarBgColor = (status) => {
	switch (status) {
		case 'completed':
			return '#5cb85c'
		case 'current':
			return '#5bc0de'
		case 'pending':
			return '#d9534f'
		default:
			return '#6c757d'
	}
}

// 暴露方法
defineExpose({
	flowList
})
</script>

<style scoped>
.approval-flow {
	padding: 20rpx;
	background-color: #fff;
}

.flow-container {
	display: flex;
	flex-direction: column;
	gap: 0;
	position: relative;
}

/* 标题样式 */
.flow-header {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.flow-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.flow-item {
	position: relative;
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	transition: all 0.3s ease;
}

.flow-node {
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
	z-index: 2;
}

.node-content {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background-color: #fff;
	padding: 0 10rpx;
}

.node-avatar {
	position: relative;
	flex-shrink: 0;
}

.status-icon {
	position: absolute;
	bottom: -2rpx;
	right: -2rpx;
	width: 20rpx;
	height: 20rpx;
	background-color: #5cb85c;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #fff;
}

.node-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.node-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
}

.node-name {
	font-size: 24rpx;
	color: #666;
}

.node-time {
	font-size: 22rpx;
	color: #999;
}

.flow-line {
	position: absolute;
	left: 26rpx;
	top: 50%;
	width: 2rpx;
	height: 100%;
	background-color: #e5e5e5;
	z-index: 1;
}

.flow-item.completed .flow-line {
	background-color: #5cb85c;
}

.flow-item.current .flow-line {
	background-color: #409eff;
}

.flow-item:last-child .flow-line {
	display: none;
}
</style>