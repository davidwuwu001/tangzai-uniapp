<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="navbar-top">
				<text class="navbar-time">{{ currentTime }}</text>
				<view class="navbar-actions">
					<image class="nav-icon" src="https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3eb893-66d1cd6f-aa32-4b2f-852a-b65a7ccaf312.svg" mode="aspectFit" />
					<image class="nav-icon" src="https://miaoduo.fbcontent.cn/private/resource/image/19a24b5abdbb9f9-bddf6e6c-a37c-409e-aa2c-35134cd0932b.svg" mode="aspectFit" @click="goToSettings" />
				</view>
			</view>
			<text class="navbar-title">汤仔助手</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content" scroll-y>
			<!-- 最新通知轮播 -->
			<view class="section">
				<text class="section-title">最新通知</text>
				<view class="notice-carousel">
					<swiper class="notice-swiper" :indicator-dots="false" :autoplay="true" :interval="3000" :circular="true" @change="onSwiperChange">
						<swiper-item v-for="notice in notices" :key="notice.id">
							<view class="notice-slide" @click="viewNotice(notice)">
								<view class="notice-slide-content">
									<view class="notice-icon" :style="{ background: notice.iconBg }">
										<text>{{ notice.icon }}</text>
									</view>
									<view class="notice-text">
										<text class="notice-title">{{ notice.title }}</text>
										<view class="notice-meta">
											<text class="notice-tag" :class="notice.tagClass">{{ notice.tag }}</text>
											<text class="notice-time">{{ notice.time }}</text>
										</view>
									</view>
								</view>
							</view>
						</swiper-item>
					</swiper>
					
					<!-- 指示点 -->
					<view class="carousel-dots">
						<view 
							v-for="(notice, index) in notices" 
							:key="index" 
							class="carousel-dot" 
							:class="{ active: currentNotice === index }"
						></view>
					</view>
				</view>
			</view>

			<!-- 今日待办 -->
			<view class="section">
				<text class="section-title">今日待办</text>
				<view class="todo-card">
					<view 
						v-for="(todo, index) in todos" 
						:key="todo.id" 
						class="todo-item"
						:class="{ 'last-item': index === todos.length - 1, 'first-item': index === 0 }"
					>
						<view class="todo-time" :style="{ background: todo.timeColor }">
							<text>{{ todo.time }}</text>
						</view>
						<text class="todo-content">{{ todo.content }}</text>
						<view class="todo-status" :class="todo.statusClass">
							<image class="status-icon" src="https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e1ee8-b1c5238c-4b6e-4383-b850-f0931859ef42.svg" mode="aspectFit" />
							<text>{{ todo.status }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 快捷入口 -->
			<view class="section">
				<text class="section-title">快捷入口</text>
				<view class="quick-grid">
					<view 
						v-for="action in quickActions" 
						:key="action.id" 
						class="quick-item"
						@click="handleQuickAction(action)"
					>
						<view class="quick-icon-wrapper" :style="{ background: action.iconBg }">
							<image class="quick-icon" :src="action.icon" mode="aspectFit" />
						</view>
						<text class="quick-label">{{ action.label }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import workbenchData from '@/mock/workbench.js'

export default {
	data() {
		return {
			currentTime: '',
			currentNotice: 0,
			notices: workbenchData.notices,
			todos: workbenchData.todos,
			quickActions: workbenchData.quickActions
		}
	},
	
	onLoad() {
		this.updateTime()
		// 每分钟更新一次时间
		setInterval(() => {
			this.updateTime()
		}, 60000)
	},
	
	methods: {
		// 更新时间
		updateTime() {
			const now = new Date()
			const hours = String(now.getHours()).padStart(2, '0')
			const minutes = String(now.getMinutes()).padStart(2, '0')
			this.currentTime = `${hours}:${minutes}`
		},
		
		// 轮播图切换
		onSwiperChange(e) {
			this.currentNotice = e.detail.current
		},
		
		// 查看通知详情
		viewNotice(notice) {
			console.log('查看通知:', notice)
			// TODO: 跳转到通知详情页
		},
		
		// 前往设置页
		goToSettings() {
			console.log('前往设置页')
			// TODO: 跳转到设置页
		},
		
		// 处理快捷入口点击
		handleQuickAction(action) {
			console.log('点击快捷入口:', action)
			if (action.path) {
				uni.navigateTo({
					url: action.path
				})
			}
		}
	}
}
</script>

<style scoped>
.page {
	width: 100%;
	height: 100vh;
	background: #FFFFFF;
	display: flex;
	flex-direction: column;
}

/* 顶部导航栏 */
.navbar {
	background: #4C12A1;
	padding: 12px 20px 14px;
	color: white;
}

.navbar-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 4px;
}

.navbar-time {
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
}

.navbar-actions {
	display: flex;
	gap: 8px;
	padding: 2px 0;
}

.nav-icon {
	width: 16px;
	height: 16px;
}

.navbar-title {
	font-size: 18px;
	font-weight: 700;
	line-height: 28px;
	padding: 14px 0;
}

/* 内容区域 */
.content {
	flex: 1;
	padding: 0 16px 16px;
	background: #FFFFFF;
}

/* 区块 */
.section {
	margin-bottom: 20px;
}

.section-title {
	font-size: 16px;
	font-weight: 500;
	color: #333333;
	line-height: 24px;
	margin-bottom: 16px;
	margin-top: 0;
	padding-top: 16px;
	display: block;
}

/* 最新通知 */
.notice-carousel {
	border-radius: 12px;
	background: linear-gradient(135deg, #FFF9F0, #FFF5E6);
	margin-bottom: 16px;
	overflow: hidden;
}

.notice-swiper {
	width: 100%;
	height: 90px;
}

.notice-slide {
	padding: 16px 20px;
	height: 100%;
	display: flex;
	align-items: center;
}

.notice-slide-content {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
}

.notice-icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	flex-shrink: 0;
}

.notice-text {
	flex: 1;
	min-width: 0;
}

.notice-title {
	font-size: 14px;
	font-weight: 600;
	color: #333333;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 4px;
}

.notice-meta {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: #999999;
}

.notice-tag {
	display: inline-block;
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 11px;
	line-height: 14px;
}

.notice-tag.teaching {
	background: rgba(76, 18, 161, 0.12);
	color: #4C12A1;
}

.notice-tag.activity {
	background: rgba(255, 163, 0, 0.12);
	color: #FFA300;
}

.notice-tag.tech {
	background: rgba(45, 204, 211, 0.12);
	color: #2DCCD3;
}

.notice-tag.training {
	background: rgba(239, 74, 129, 0.12);
	color: #EF4A81;
}

.notice-time {
	font-size: 12px;
	color: #999999;
}

.carousel-dots {
	display: flex;
	justify-content: center;
	gap: 6px;
	padding: 8px 0;
}

.carousel-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.2);
	transition: all 0.3s;
}

.carousel-dot.active {
	width: 16px;
	border-radius: 3px;
	background: #FC4C02;
}

/* 今日待办 */
.todo-card {
	background: white;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10);
	margin-bottom: 16px;
}

.todo-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 0;
	border-bottom: 1px solid #f0f0f0;
}

.todo-item.last-item {
	border-bottom: none;
	padding-bottom: 0;
}

.todo-item.first-item {
	padding-top: 0;
}

.todo-time {
	flex-shrink: 0;
	padding: 6px 16px;
	border-radius: 20px;
	font-size: 15px;
	font-weight: 600;
	color: white;
	text-align: center;
}

.todo-content {
	flex: 1;
	font-size: 14px;
	color: #333333;
	line-height: 20px;
}

.todo-status {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	padding: 4px 10px;
	border-radius: 12px;
}

.todo-status.upcoming {
	background: #FFF3E0;
	color: #F57C00;
}

.todo-status.pending {
	background: #FFEBEE;
	color: #E53935;
}

.todo-status.completed {
	background: #E8F5E9;
	color: #43A047;
}

.status-icon {
	width: 16px;
	height: 16px;
}

/* 快捷入口 */
.quick-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
}

.quick-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

.quick-icon-wrapper {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.quick-icon {
	width: 24px;
	height: 24px;
}

.quick-label {
	font-size: 12px;
	color: #333;
	line-height: 16px;
	text-align: center;
}
</style>
