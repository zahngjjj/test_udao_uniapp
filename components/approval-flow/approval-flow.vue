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
					<view class="node-avatar">
						<u-avatar 
							:src="item.avatar" 
							:text="item.name.charAt(0)"
							size="40"
							:bg-color="getAvatarBgColor(item.status)"
							color="#fff">
						</u-avatar>
						<!-- 状态图标 -->
						<view class="status-icon" v-if="item.status === 'completed'">
							<u-icon name="checkmark" color="#fff" size="12"></u-icon>
						</view>
					</view>
					
					<!-- 审批信息 -->
					<view class="node-info">
						<view class="node-title">{{ item.title }}</view>
						<view class="node-name">{{ item.name }}</view>
						<view class="node-time" v-if="item.time">{{ item.time }}</view>
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
	return props.flowData.length > 0 ? props.flowData : defaultFlowList
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
	gap: 20rpx;
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
	align-items: flex-start;
	padding: 20rpx;
	border-radius: 12rpx;
	background-color: #f8f9fa;
	transition: all 0.3s ease;
}

.flow-item.completed {
	background-color: #f0f9ff;
	border-left: 4rpx solid #5cb85c;
}

.flow-item.current {
	background-color: #fff3cd;
	border-left: 4rpx solid #5bc0de;
	box-shadow: 0 2rpx 8rpx rgba(91, 192, 222, 0.2);
}

.flow-item.pending {
	background-color: #f8f9fa;
	border-left: 4rpx solid #dee2e6;
}

.flow-node {
	display: flex;
	align-items: flex-start;
	gap: 24rpx;
	width: 100%;
}

.node-avatar {
	position: relative;
	flex-shrink: 0;
}

.status-icon {
	position: absolute;
	bottom: -4rpx;
	right: -4rpx;
	width: 24rpx;
	height: 24rpx;
	background-color: #5cb85c;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #fff;
}

.node-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.node-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.node-name {
	font-size: 26rpx;
	color: #666;
}

.node-time {
	font-size: 24rpx;
	color: #999;
}

.flow-line {
	position: absolute;
	left: 50rpx;
	bottom: -20rpx;
	width: 2rpx;
	height: 20rpx;
	background-color: #dee2e6;
}

.flow-item.completed .flow-line {
	background-color: #5cb85c;
}

.flow-item.current .flow-line {
	background-color: #5bc0de;
}
</style>