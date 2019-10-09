<template>
    <div>
        <div v-for="(item,index) in arr" :key="index">
                <input type="checkbox"  v-model="checkboxList" :value="item">
            </div>
            <el-button type="primary">主要按钮</el-button>
    </div>
</template>
<script>
module.exports = {
    data(){
        return{
            arr:[1,2,3],
            checkboxList:[]
        }
    }
}
</script>
