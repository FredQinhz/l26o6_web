<template>
  <el-carousel indicator-position="outside">
    <el-carousel-item v-for="item in 1" :key="item" height="auto">
           <img src="../images/nju1.jpg"  class = "images"> 
          <!-- <img :src= "item.url" width="800">  -->
    </el-carousel-item>
    <!-- <el-carousel-item v-for="item in 1" :key="item" height="auto" >
           <img src="../images/nju2.jpg"  class = "images"> 
    </el-carousel-item>
    <el-carousel-item v-for="item in 1" :key="item" height="auto">
           <img src="../images/nju3.jpg"  class = "images"> 
    </el-carousel-item> -->
  </el-carousel>
  <!-- <img src="../images/nju1.jpg"  class = "images"> 
  <img src="../images/nju.jpg"  class = "images">  -->
</template>


<style scoped>
/* .el-carousel__item h3 {
  display: flex;
  color: #475669;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
} */

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

.images{
  height: 100%;
  width: auto;
  max-width: 100%;
  display: flex;
  align-items: center;
}
</style>


