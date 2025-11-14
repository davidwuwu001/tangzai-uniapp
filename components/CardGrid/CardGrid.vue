<template>
  <view class="card-grid" :class="`columns-${columns}`">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'CardGrid',
  props: {
    // 列数：2列或3列
    columns: {
      type: Number,
      default: 2,
      validator: (value) => [2, 3].includes(value)
    }
  }
}
</script>

<style scoped>
.card-grid {
  display: grid;
  gap: 20rpx;
  padding: 20rpx 30rpx;
}

/* 2列布局 */
.columns-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* 3列布局 */
.columns-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 响应式：小屏幕时3列改为2列 */
@media (max-width: 600rpx) {
  .columns-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
